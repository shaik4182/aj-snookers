import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator, Alert } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          Alert.alert('Error', 'No user logged in');
          return;
        }

        // Try fetching from 'members' collection
        const userDocRef = doc(db, 'members', currentUser.uid);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          setUserData({
            email: currentUser.email,
            ...userSnap.data()
          });
        } else {
          // Fallback: show at least the email
          setUserData({
            email: currentUser.email,
            name: 'Not set',
            phone: 'Not provided'
          });
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2980b9" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Profile</Text>
      <View style={styles.infoRow}>
        <Text style={styles.label}>Name:</Text>
        <Text style={styles.value}>{userData?.name || 'N/A'}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{userData?.email}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.label}>Phone:</Text>
        <Text style={styles.value}>{userData?.phone || 'N/A'}</Text>
      </View>

      <View style={{ marginTop: 30 }}>
        <Button title="Edit Profile" onPress={() => Alert.alert('Coming soon!')} />
        <View style={{ marginTop: 10 }} />
        <Button title="Logout" color="red" onPress={() => auth.signOut()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#fff'
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 15
  },
  label: {
    width: 80,
    fontWeight: 'bold'
  },
  value: {
    flex: 1
  }
});
