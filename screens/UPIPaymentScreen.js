import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

export default function UPIPaymentScreen({ route, navigation }) {
  const { bookingId, amount } = route.params;
  const [utr, setUtr] = useState('');

  const upiId = "ajsnooker@ybl";
  const upiUrl = `upi://pay?pa=${upiId}&pn=Your%20Business&am=${amount}&cu=INR`;

  const submitUTR = () => {
    if (!utr.trim()) {
      Alert.alert("Error", "Please enter UTR number after payment.");
      return;
    }
    // API call to submit UTR to backend
    Alert.alert("Success", "UTR submitted. Waiting for admin approval.");
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan & Pay via UPI</Text>

      <QRCode value={upiUrl} size={180} />
      <Text style={styles.amount}>Amount: ₹{amount}</Text>

      <Text style={styles.upiId}>UPI ID: {upiId}</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter UTR Number after payment"
        value={utr}
        onChangeText={setUtr}
      />

      <TouchableOpacity style={styles.submitButton} onPress={submitUTR}>
        <Text style={styles.submitText}>Submit UTR</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  amount: { fontSize: 18, marginTop: 10 },
  upiId: { fontSize: 16, color: '#555', marginVertical: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    width: '100%',
    marginTop: 20,
  },
  submitButton: {
    backgroundColor: '#FF9800',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  submitText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
