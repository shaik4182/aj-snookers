import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, Linking } from 'react-native';
import { getFirestore, doc, setDoc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export default function PaymentMethodScreen({ route, navigation }) {
  const { bookingData } = route.params;
  const db = getFirestore();
  const auth = getAuth();

  const [utrNumber, setUtrNumber] = useState('');

  const submitUPI = async () => {
    if (!utrNumber.trim()) {
      Alert.alert('Error', 'Please enter UTR number after payment.');
      return;
    }

    if (bookingData.membership) {
      await handleMembership('UPI', utrNumber);
    } else {
      await handleBooking('UPI', utrNumber);
    }
  };

  const handleBooking = async (paymentType, utr = '') => {
    try {
      await addDoc(collection(db, 'bookings'), {
        ...bookingData,
        paymentMethod: paymentType,
        utrNumber: utr || null,
        status: 'pending', // ✅ Pending until admin approves
        createdAt: new Date().toISOString()
      });

      Alert.alert(
        'Booking Requested',
        `Game: ${bookingData.gameType}\nSlot: ${bookingData.startTime} - ${bookingData.endTime}\nAmount: ₹${bookingData.amount}\n\nStatus: Pending admin approval.\nCheck My Bookings for updates.`,
        [{ text: 'OK', onPress: () => navigation.popToTop() }]
      );
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to request booking.');
    }
  };

  const handleMembership = async (paymentType, utr = '') => {
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        membershipStatus: 'pending',
        membershipRequestedAt: new Date().toISOString(),
        membershipActivatedAt: null
      });

      await setDoc(doc(db, 'members', auth.currentUser.uid), {
        name: bookingData.name,
        phone: bookingData.phone,
        email: bookingData.email,
        govtIdType: bookingData.govtIdType,
        aadhaarNumber: bookingData.aadhaarNumber,
        amount: bookingData.amount,
        paymentMethod: paymentType,
        utrNumber: utr || null,
        status: 'pending', // ✅ Pending until admin approves
        requestedAt: new Date().toISOString()
      });

      Alert.alert(
        'Membership Requested',
        `Status: Pending admin approval.\nCheck Membership screen for updates.`,
        [{ text: 'OK', onPress: () => navigation.popToTop() }]
      );
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to request membership.');
    }
  };

  const startUpiPayment = () => {
  const upiId = 'ajsnooker@ybl'; // your UPI ID
  const name = 'AJ Snooker'; // business or person name
  const amount = bookingData.amount;
  const note = bookingData.membership ? 'Membership Payment' : 'Game Booking Payment';

  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}&tn=${encodeURIComponent(note)}&cu=INR`;

  Linking.openURL(upiUrl)
    .catch(() => {
      Alert.alert('Error', 'No UPI app found on this device');
    });
};


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Payment Method</Text>

      {/* Cash Payment */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#4CAF50' }]}
        onPress={() =>
          bookingData.membership
            ? handleMembership('Cash')
            : handleBooking('Cash')
        }
      >
        <Text style={styles.buttonText}>💵 Cash (Pay at counter)</Text>
      </TouchableOpacity>

      {/* UPI Payment */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#2196F3' }]}
        onPress={() => {
          startUpiPayment();
        }}
      >
        <Text style={styles.buttonText}>📱 UPI Payment</Text>
      </TouchableOpacity>

      {/* UTR Input after UPI */}
      <TextInput
        style={styles.input}
        placeholder="Enter UTR Number after payment"
        placeholderTextColor="#888"
        value={utrNumber}
        onChangeText={setUtrNumber}
      />
      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#FF9800' }]}
        onPress={submitUPI}
      >
        <Text style={styles.buttonText}>Submit UTR</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  button: { padding: 15, borderRadius: 8, marginBottom: 15 },
  buttonText: { fontSize: 16, color: '#fff', textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 10,
    height: 40,
    marginBottom: 15
  }
});
