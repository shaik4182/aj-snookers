import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

export default function ProfileScreen({ navigation }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const fetchUserProfile = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'No logged-in user');
      return;
    }

    try {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setName(data.name || '');
        setPhone(data.mobile || '');
        setEmail(data.email || '');
      } else {
        Alert.alert('Error', 'User profile not found in Firestore');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const updateUserProfile = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        name: name.trim(),
        mobile: phone.trim()
      });
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigation.replace('Login'); // Redirect to login after sign-out
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <Text style={styles.label}>Name:</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Phone:</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Email:</Text>
      <TextInput
        style={[styles.input, { backgroundColor: '#eee', marginBottom: 20 }]}
        value={email}
        editable={false}
      />

      <Button title="Update Profile" onPress={updateUserProfile} />

      <View style={{ marginTop: 20 }}>
        <Button title="Sign Out" color="red" onPress={handleSignOut} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 40, // 👈 pushes content down from top
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20
  },
  label: {
    fontSize: 16,
    marginTop: 10
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 6,
    marginTop: 5
  }
});


