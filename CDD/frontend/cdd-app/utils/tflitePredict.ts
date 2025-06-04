// import * as tf from '@tensorflow/tfjs';
// import '@tensorflow/tfjs-react-native';
// import * as FileSystem from 'expo-file-system';
// import * as jpeg from 'jpeg-js';
// import { decodeJpeg } from '@tensorflow/tfjs-react-native';

// // Assume you load model once (can be improved with `useEffect`)
// import modelJson from '../assets/models/cdd_convert_model.tflite'; // or load via fetch/bundle

// const labelMap = require('../assets/model/label_map.json');

// export async function runPredictionOnImage(uri: string) {
//   await tf.ready();

//   const imgB64 = await FileSystem.readAsStringAsync(uri, {
//     encoding: FileSystem.EncodingType.Base64,
//   });
//   const imgBuffer = tf.util.encodeString(imgB64, 'base64').buffer;
//   const raw = jpeg.decode(imgBuffer, { useTArray: true });

//   const imageTensor = decodeJpeg(raw.data, 3)
//     .resizeNearestNeighbor([260, 260])
//     .expandDims()
//     .div(255.0);

//   const model = await tf.loadGraphModel(bundleResourceIO(modelJson));
//   const prediction = model.predict(imageTensor) as tf.Tensor;
//   const scores = prediction.dataSync();
//   const maxIndex = scores.indexOf(Math.max(...scores));

//   return {
//     label: labelMap[maxIndex],
//     confidence: scores[maxIndex],
//     scores: Array.from(scores),
//   };
// }
