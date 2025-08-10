import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Button, StyleSheet, Linking } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const HomeScreen = ({ navigation }) => {
  const [membershipDaysLeft, setMembershipDaysLeft] = useState(null);

  const fetchMembershipDays = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const userDocRef = doc(db, 'members', user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const data = userDocSnap.data();
      const expiryDate = data.membershipExpiry?.toDate?.();
      if (expiryDate) {
        const today = new Date();
        const daysLeft = Math.max(
          0,
          Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24))
        );
        setMembershipDaysLeft(daysLeft);
      }
    }
  };

  // Open Google Maps shop location
  const openShopLocation = () => {
    const shopUrl = "https://maps.app.goo.gl/W4q1CcZ8DECEnyke7";
    Linking.openURL(shopUrl).catch(() =>
      Alert.alert("Error", "Unable to open Google Maps")
    );
  };

  // Refresh membership info every time screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchMembershipDays();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎱 AJ Snookers</Text>

      {membershipDaysLeft !== null && (
        <Text style={styles.membershipText}>
          You have {membershipDaysLeft} day{membershipDaysLeft !== 1 ? 's' : ''} remaining
        </Text>
      )}

      <Text style={styles.subtitle}>Select a Booking Option:</Text>

      <View style={styles.buttonContainer}>
        <Button
          title="Quick Game Booking"
          onPress={() => navigation.navigate('QuickGame')}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Membership Booking"
          onPress={() => navigation.navigate('Membership')}
        />
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    backgroundColor: '#004d26', // Snooker green
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#FFD700', // Gold text
  },
  subtitle: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
    color: '#fff', // White text
  },
  membershipText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#FFD700',
    marginBottom: 20,
  },
  buttonContainer: {
    marginVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    overflow: 'hidden', // keeps button corners rounded
  },
});

