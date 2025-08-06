// app.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function App() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [govtId, setGovtId] = useState(null);
  const [membershipStart, setMembershipStart] = useState(null);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    if (isMember && membershipStart) {
      const now = new Date();
      const start = new Date(membershipStart);
      const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
      if (diffDays > 30) {
        setIsMember(false);
        setMembershipStart(null);
        Alert.alert('Membership expired', 'Please renew your membership.');
      }
    }
  }, [isMember, membershipStart]);

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setGovtId(result.assets[0].uri);
    }
  };

  const handleRegister = () => {
    if (!name || !phone || !govtId) {
      Alert.alert('Missing Fields', 'Please fill all fields and upload ID');
      return;
    }
    setMembershipStart(new Date());
    setIsMember(true);
    Alert.alert('Success', 'Membership activated for 30 days.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Snooker & Pool Club Membership</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      <TouchableOpacity style={styles.uploadButton} onPress={handleImagePick}>
        <Text style={{ color: '#fff' }}>
          {govtId ? 'ID Uploaded' : 'Upload Govt ID'}
        </Text>
      </TouchableOpacity>

      {govtId && <Image source={{ uri: govtId }} style={styles.image} />}

      <Text style={styles.note}>Membership Fee: ₹4000 (30 days)</Text>
      <Button title="Register Membership" onPress={handleRegister} />

      {isMember && (
        <Text style={styles.success}>✅ Membership Active. Valid until: {new Date(new Date(membershipStart).getTime() + 30*24*60*60*1000).toDateString()}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 40,
    backgroundColor: '#fff',
    flex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    borderColor: '#ccc',
  },
  uploadButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    alignItems: 'center',
    borderRadius: 5,
    marginBottom: 10,
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  note: {
    marginBottom: 10,
    fontStyle: 'italic',
  },
  success: {
    marginTop: 20,
    color: 'green',
    fontWeight: 'bold',
  },
});
