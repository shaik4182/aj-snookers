import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, Linking, Image, Modal } from 'react-native';
import { getFirestore, doc, setDoc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export default function PaymentMethodScreen({ route, navigation }) {
  const { bookingData } = route.params;
  const db = getFirestore();
  const auth = getAuth();

  const [utrNumber, setUtrNumber] = useState('');
  const [showQR, setShowQR] = useState(false);

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
        status: 'pending', 
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
        status: 'pending',
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

  const upiId = 'ajsnooker@ybl';
  const name = 'AJ Snooker';
  const amount = bookingData.amount;
  const note = bookingData.membership ? 'Membership Payment' : 'Game Booking Payment';

  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}&tn=${encodeURIComponent(note)}&cu=INR`;

  // QR Image (no SVG)
  const qrImageUrl = `https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=${encodeURIComponent(upiUrl)}`;

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

      {/* UPI Payment with QR */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#2196F3' }]}
        onPress={() => setShowQR(true)}
      >
        <Text style={styles.buttonText}>📱 UPI Payment (Scan QR)</Text>
      </TouchableOpacity>

      {/* UTR Input */}
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

      {/* QR Modal */}
      <Modal visible={showQR} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Scan to Pay</Text>
            <Image
              source={{ uri: qrImageUrl }}
              style={{ width: 250, height: 250, marginBottom: 15 }}
            />
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#673AB7', width: '80%' }]}
              onPress={() => Linking.openURL(upiUrl)}
            >
              <Text style={styles.buttonText}>Open UPI App</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#E91E63', width: '80%' }]}
              onPress={() => setShowQR(false)}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  },
  modalOverlay: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)'
  },
  modalContent: {
    backgroundColor: '#fff', padding: 20, borderRadius: 10,
    alignItems: 'center'
  }
});
