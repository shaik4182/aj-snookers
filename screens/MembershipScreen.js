import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as DocumentPicker from 'expo-document-picker';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function MembershipScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [govtIdType, setGovtIdType] = useState('');
  const [govtIdFile, setGovtIdFile] = useState(null);
  const [membershipRegistered, setMembershipRegistered] = useState(false);
  const [remainingDays, setRemainingDays] = useState(0);

  useEffect(() => {
    const fetchMembershipStatus = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return;

        const db = getFirestore();
        const docRef = doc(db, 'members', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const registeredDate = new Date(data.registeredAt);
          const now = new Date();
          const diffDays = Math.floor((now - registeredDate) / (1000 * 60 * 60 * 24));
          const daysLeft = 30 - diffDays;

          if (daysLeft > 0) {
            setMembershipRegistered(true);
            setRemainingDays(daysLeft);
          } else {
            setMembershipRegistered(false);
          }
        }
      } catch (error) {
        console.error('Error checking membership:', error);
      }
    };

    fetchMembershipStatus();
  }, []);

  const handleDocumentUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets.length > 0) {
        setGovtIdFile(result.assets[0]);
        Alert.alert('Success', 'ID uploaded successfully!');
      }
    } catch (err) {
      Alert.alert('Upload Error', err.message);
    }
  };

  const handleRegister = async () => {
    if (!name || !phone || !email || !govtIdType || !govtIdFile) {
      Alert.alert('Missing Info', 'Please fill all fields and upload your ID.');
      return;
    }

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const storage = getStorage();
      const storageRef = ref(storage, `govtIds/${user.uid}/${govtIdFile.name}`);
      const response = await fetch(govtIdFile.uri);
      const blob = await response.blob();

      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      const db = getFirestore();
      await setDoc(doc(db, 'members', user.uid), {
        name,
        phone,
        email,
        govtIdType,
        govtIdUrl: downloadURL,
        registeredAt: new Date().toISOString(),
      });

      setMembershipRegistered(true);
      setRemainingDays(30);
      Alert.alert('Membership Registered', 'You have 30 days remaining!');
    } catch (error) {
      console.error('Error during registration:', error);
      Alert.alert('Registration Failed', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Membership</Text>

      {membershipRegistered ? (
        <Text style={styles.successText}>✅ Membership active. You have {remainingDays} days remaining!</Text>
      ) : (
        <>
          <TextInput style={styles.input} placeholder="Full Name" value={name} onChangeText={setName} />
          <TextInput style={styles.input} placeholder="Phone Number" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
          <TextInput style={styles.input} placeholder="Email Address" keyboardType="email-address" value={email} onChangeText={setEmail} />

          <Text style={styles.label}>Select Govt ID Type:</Text>
          <Picker selectedValue={govtIdType} onValueChange={(itemValue) => setGovtIdType(itemValue)} style={styles.picker}>
            <Picker.Item label="-- Select --" value="" />
            <Picker.Item label="Aadhaar Card" value="aadhaar" />
            <Picker.Item label="PAN Card" value="pan" />
          </Picker>

          {!govtIdFile ? (
            <Button title="Upload Govt ID" onPress={handleDocumentUpload} />
          ) : (
            <Text style={styles.uploaded}>✅ ID Uploaded: {govtIdFile.name || 'File selected'}</Text>
          )}

          <Button title="Register Membership (₹5000/month)" onPress={handleRegister} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 12, borderRadius: 6 },
  picker: { height: 50, width: '100%', marginBottom: 15 },
  label: { marginBottom: 5 },
  uploaded: { marginVertical: 10, color: 'green' },
  successText: { marginTop: 20, color: 'blue', fontWeight: 'bold', fontSize: 16 },
});
