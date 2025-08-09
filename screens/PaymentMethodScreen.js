import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { getFirestore, doc, setDoc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export default function PaymentMethodScreen({ route, navigation }) {
  const { bookingData } = route.params;
  const db = getFirestore();
  const auth = getAuth();

  const handleCash = async () => {
    if (bookingData.membership) {
      try {
        // 1️⃣ Update user membership status to pending
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          membershipStatus: 'pending',
          membershipRequestedAt: new Date().toISOString(),
          membershipActivatedAt: null
        });

        // 2️⃣ Create a membership request record in "members"
        await setDoc(doc(db, 'members', auth.currentUser.uid), {
          name: bookingData.name,
          phone: bookingData.phone,
          email: bookingData.email,
          govtIdType: bookingData.govtIdType,
          aadhaarNumber: bookingData.aadhaarNumber,
          amount: bookingData.amount,
          status: 'pending',
          requestedAt: new Date().toISOString()
        });

        Alert.alert(
          'Membership Requested',
          'Please pay at the counter to activate your membership.',
          [{ text: 'OK', onPress: () => navigation.popToTop() }]
        );
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Failed to request membership.');
      }
    } else {
      // Normal booking cash flow
      Alert.alert(
        'Booking Confirmed',
        `Name: ${bookingData.name}\nPhone: ${bookingData.phone}\nGame: ${bookingData.gameType}\nSlot: ${bookingData.startTime} - ${bookingData.endTime}\nAmount: ₹${bookingData.amount}\n\nPlease pay after you play.`,
        [{ text: 'OK', onPress: () => navigation.popToTop() }]
      );
    }
  };

  const handleUPI = () => {
    Alert.alert('UPI Payment', 'UPI Payment integration coming soon!');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Payment Method</Text>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#4CAF50' }]}
        onPress={handleCash}
      >
        <Text style={styles.buttonText}>💵 Cash (Pay at counter)</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#2196F3' }]}
        onPress={handleUPI}
      >
        <Text style={styles.buttonText}>📱 UPI Payment</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  button: { padding: 15, borderRadius: 8, marginBottom: 15 },
  buttonText: { fontSize: 16, color: '#fff', textAlign: 'center' },
});
