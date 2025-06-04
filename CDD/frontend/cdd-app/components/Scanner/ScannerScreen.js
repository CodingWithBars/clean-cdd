// ScannerScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import { useNavigation } from '@react-navigation/native';
import Tflite from 'tflite-react-native';

const tflite = new Tflite();

const ScannerScreen = () => {
  const cameraRef = useRef(null);
  const navigation = useNavigation();

  const [hasPermission, setHasPermission] = useState(null);
  const [previewUri, setPreviewUri] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      loadTFLiteModel();
    })();
  }, []);

  const loadTFLiteModel = () => {
    tflite.loadModel({
      model: 'models/chicken_disease_model.tflite',
      labels: 'models/label_map.json',
      numThreads: 1,
    }, (err) => {
      if (err) console.error('❌ Failed to load model', err);
      else console.log('✅ Model loaded');
    });
  };

  const captureImage = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ base64: false });
      setPreviewUri(photo.uri);
      runPrediction(photo.uri);
    }
  };

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.cancelled) {
      setPreviewUri(result.uri);
      runPrediction(result.uri);
    }
  };

  const runPrediction = async (imagePath) => {
    setIsLoading(true);

    tflite.runModelOnImage({
      path: imagePath,
      imageMean: 0,
      imageStd: 255,
      numResults: 5,
      threshold: 0.05,
    }, (err, results) => {
      setIsLoading(false);

      if (err || !results || results.length === 0) {
        Alert.alert('Prediction Error', 'Could not get prediction result.');
        console.warn(err);
        return;
      }

      const top = results[0];
      const label = top.label;
      const confidence = parseFloat(top.confidence);

      console.log('🧠 Prediction:', label, confidence);

      if (label === 'NonFecal' || confidence < 0.7) {
        Alert.alert('Invalid Image', 'This image is not a chicken fecal image.');
        return;
      }

      navigation.navigate('ResultScreen', {
        label,
        confidence,
        imageUri: imagePath,
      });
    });
  };

  if (hasPermission === null) {
    return <View><Text>Requesting camera permission...</Text></View>;
  }
  if (hasPermission === false) {
    return <View><Text>No access to camera</Text></View>;
  }

  return (
    <View className="flex-1 bg-black items-center justify-center">
      {!previewUri ? (
        <Camera
          ref={cameraRef}
          style={{ width: '100%', height: '75%' }}
          type={Camera.Constants.Type.back}
          ratio="16:9"
        />
      ) : (
        <Image source={{ uri: previewUri }} style={{ width: '100%', height: '75%' }} />
      )}

      {isLoading && <ActivityIndicator size="large" color="#0ff" />}

      <View className="flex-row justify-around w-full p-4">
        {!previewUri && (
          <TouchableOpacity onPress={captureImage} className="bg-green-600 p-3 rounded">
            <Text className="text-white font-bold">Capture</Text>
          </TouchableOpacity>
        )}
        {!previewUri && (
          <TouchableOpacity onPress={pickFromGallery} className="bg-blue-600 p-3 rounded">
            <Text className="text-white font-bold">Gallery</Text>
          </TouchableOpacity>
        )}
        {previewUri && (
          <TouchableOpacity onPress={() => setPreviewUri(null)} className="bg-red-600 p-3 rounded">
            <Text className="text-white font-bold">Clear</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default ScannerScreen;
