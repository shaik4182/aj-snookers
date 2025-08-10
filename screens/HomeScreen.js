import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Button, StyleSheet, Linking, Alert, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = ({ navigation }) => {
  const [membershipDaysLeft, setMembershipDaysLeft] = useState(null);
  const [adminMessage, setAdminMessage] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [dismissKey, setDismissKey] = useState(null);

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

  const fetchAdminMessage = async () => {
    try {
      const docRef = doc(db, 'settings', 'adminMessage');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const expiresAt = new Date(data.expiresAt);
        const now = new Date();

        if (now < expiresAt) {
          // Make unique dismissal key using createdAt
          const uniqueKey = `seenMessage-${data.createdAt}`;
          const seen = await AsyncStorage.getItem(uniqueKey);

          if (!seen) {
            setAdminMessage(data.message);
            setDismissKey(uniqueKey);
            setShowBanner(true);
          }
        }
      }
    } catch (error) {
      console.log('Error fetching admin message:', error);
    }
  };

  const dismissBanner = async () => {
    setShowBanner(false);
    if (dismissKey) {
      await AsyncStorage.setItem(dismissKey, 'true');
    }
  };

  const openShopLocation = () => {
    const shopUrl = "https://maps.app.goo.gl/W4q1CcZ8DECEnyke7";
    Linking.openURL(shopUrl).catch(() =>
      Alert.alert("Error", "Unable to open Google Maps")
    );
  };

  useFocusEffect(
    useCallback(() => {
      fetchMembershipDays();
      fetchAdminMessage();
    }, [])
  );

  return (
    <View style={styles.container}>
      {showBanner && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>{adminMessage}</Text>
          <TouchableOpacity onPress={dismissBanner}>
            <Text style={styles.closeButton}>✖</Text>
          </TouchableOpacity>
        </View>
      )}

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
    backgroundColor: '#004d26', // Dark Green background
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffd900c0', // Yellow banner
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#fff',
  },
  bannerText: {
    flex: 1,
    color: '#000000ff',
    fontWeight: 'bold',
  },
  closeButton: {
    color: '#000',
    fontSize: 18,
    marginLeft: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#FFD700', // Yellow title
  },
  subtitle: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
    color: '#fff',
  },
  membershipText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#1E90FF', // Bright blue text
    marginBottom: 20,
  },
  buttonContainer: {
    marginVertical: 10,
  },
});
