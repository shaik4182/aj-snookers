import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function ProfileScreen({ navigation }) {
  const [userData, setUserData] = useState({ name: '', email: '', mobile: '', role: '' });

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserData({
          name: docSnap.data().name || '',
          email: user.email || '',
          mobile: docSnap.data().mobile || '',
          role: docSnap.data().role || 'User',
        });
      }
    };
    fetchUserData();
  }, []);

  const handleLogout = () => {
    Alert.alert('Confirm Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await signOut(auth);
          navigation.replace('Login');
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Profile</Text>

      <View style={styles.card}>
        <Ionicons name="person" size={24} color="#FFD700" />
        <Text style={styles.cardText}>{userData.name}</Text>
      </View>

      <View style={styles.card}>
        <Ionicons name="mail" size={24} color="#1E90FF" />
        <Text style={styles.cardText}>{userData.email}</Text>
      </View>

      <View style={styles.card}>
        <Ionicons name="call" size={24} color="#27ae60" />
        <Text style={styles.cardText}>{userData.mobile}</Text>
      </View>

      <View style={styles.card}>
        <Ionicons name="briefcase" size={24} color="#e67e22" />
        <Text style={styles.cardText}>{userData.role}</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out" size={20} color="#fff" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#004d26', // Dark green
    padding: 20,
    paddingTop: 40
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#FFD700' // Yellow title
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FFD700'
  },
  cardText: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 10
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E90FF', // Bright blue
    padding: 15,
    borderRadius: 8,
    marginTop: 30,
    justifyContent: 'center'
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8
  }
});
