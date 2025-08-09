import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';

export default function SignupScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSignup = async () => {
    if (!email || !password || !name.trim() || !phone.trim()) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        name: name.trim(),
        mobile: phone.trim(),
        email: email.trim(),
        membershipActive: false,
        membershipStart: null,
        membershipEnd: null,
        role: "user"
      });

      Alert.alert('Success', 'Signup Successful!');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Signup Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logoText}>🎱 AJ Snookers</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        placeholderTextColor="#ddd"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        placeholderTextColor="#ddd"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />
      <TextInput
        style={styles.input}
        placeholder="Email Address"
        placeholderTextColor="#ddd"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#ddd"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <View style={styles.buttonWrapper}>
        <Button title="Sign Up" color="#FFD700" onPress={handleSignup} />
      </View>

      <Text
        style={styles.link}
        onPress={() => navigation.navigate('Login')}
      >
        Already have an account? Login
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#004d26', // snooker green
  },
  logoText: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FFD700', // gold
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 15,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: '#fff',
  },
  buttonWrapper: {
    marginTop: 10,
  },
  link: {
    marginTop: 20,
    textAlign: 'center',
    color: '#FFD700',
    textDecorationLine: 'underline',
  },
});
