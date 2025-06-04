import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import locationsData from '../assets/location.json';

const LocationDropdowns = ({ onLocationChange }) => {
  const region = locationsData?.region || '';
  const province = locationsData?.province || '';
  const municipalities = locationsData?.municipalities || [];

  const [municipality, setMunicipality] = useState('');
  const [barangays, setBarangays] = useState([]);
  const [barangay, setBarangay] = useState('');

  useEffect(() => {
    if (municipality) {
      const selected = municipalities.find((m) => m.name === municipality);
      setBarangays(selected?.barangays || []);
      setBarangay('');
    }
  }, [municipality]);

  useEffect(() => {
    if (region && province && municipality && barangay) {
      onLocationChange({
        region,
        province,
        municipality,
        barangay,
      });
    }
  }, [region, province, municipality, barangay]);

  if (!region || !province || municipalities.length === 0) {
    return (
      <Text style={{ color: 'red', padding: 16 }}>
        ⚠️ Location data is missing or incomplete.
      </Text>
    );
  }

  return (
    <View style={{ marginVertical: 12 }}>
      <Text style={styles.label}>Municipality</Text>
      <Picker
        selectedValue={municipality}
        onValueChange={setMunicipality}
        style={styles.picker}
      >
        <Picker.Item label="Select Municipality" value="" />
        {municipalities.map((m) => (
          <Picker.Item key={m.name} label={m.name} value={m.name} />
        ))}
      </Picker>

      {barangays.length > 0 && (
        <>
          <Text style={styles.label}>Barangay</Text>
          <Picker
            selectedValue={barangay}
            onValueChange={setBarangay}
            style={styles.picker}
          >
            <Picker.Item label="Select Barangay" value="" />
            {barangays.map((b) => (
              <Picker.Item key={b} label={b} value={b} />
            ))}
          </Picker>
        </>
      )}
    </View>
  );
};

const styles = {
  label: {
    color: 'white',
    marginBottom: 6,
    marginTop: 12,
  },
  picker: {
    backgroundColor: '#333',
    color: 'white',
    borderRadius: 8,
  },
};

export default LocationDropdowns;
