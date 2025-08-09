import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

export default function PaymentMethodScreen({ route, navigation }) {
  const { bookingData } = route.params;

  const handleCash = () => {
    if (bookingData.membership) {
      // Membership flow
      Alert.alert(
        'Membership Registration Started',
        `Name: ${bookingData.name}\nPhone: ${bookingData.phone}\nMembership Fee: ₹${bookingData.amount}\n\nPlease pay the membership fee at the counter to activate your membership.`,
        [{ text: 'OK', onPress: () => navigation.popToTop() }]
      );
    } else {
      // Quick game booking flow
      Alert.alert(
        'Booking Confirmed',
        `Name: ${bookingData.name}\nPhone: ${bookingData.phone}\nGame: ${bookingData.gameType}\nSlot: ${bookingData.startTime} - ${bookingData.endTime}\nAmount: ₹${bookingData.amount}\n\nPlease pay after you play.`,
        [{ text: 'OK', onPress: () => navigation.popToTop() }]
      );
    }
  };

  const handleUPI = () => {
    Alert.alert(
      'UPI Payment',
      'UPI Payment integration coming soon! Please choose Cash for now.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Booking Summary</Text>

      <View style={styles.summaryCard}>
        <Text style={styles.label}>
          Name: <Text style={styles.value}>{bookingData.name}</Text>
        </Text>
        <Text style={styles.label}>
          Phone: <Text style={styles.value}>{bookingData.phone}</Text>
        </Text>
        {bookingData.membership ? (
          <>
            <Text style={styles.label}>
              Membership: <Text style={styles.value}>30 Days</Text>
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.label}>
              Game: <Text style={styles.value}>{bookingData.gameType}</Text>
            </Text>
            <Text style={styles.label}>
              Date: <Text style={styles.value}>{bookingData.date}</Text>
            </Text>
            <Text style={styles.label}>
              Time: <Text style={styles.value}>{bookingData.startTime} - {bookingData.endTime}</Text>
            </Text>
          </>
        )}
        <Text style={styles.label}>
          Amount: <Text style={styles.amount}>₹{bookingData.amount}</Text>
        </Text>
      </View>

      <Text style={styles.selectText}>Select Payment Method</Text>

      <TouchableOpacity style={[styles.button, { backgroundColor: '#4CAF50' }]} onPress={handleCash}>
        <Text style={styles.buttonText}>💵 Cash (Pay at counter)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { backgroundColor: '#2196F3' }]} onPress={handleUPI}>
        <Text style={styles.buttonText}>📱 UPI Payment</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  summaryCard: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  label: { fontSize: 16, marginBottom: 6 },
  value: { fontWeight: '600' },
  amount: { fontWeight: '700', color: '#E91E63' },
  selectText: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  button: { padding: 15, borderRadius: 8, marginBottom: 15 },
  buttonText: { fontSize: 16, color: '#fff', textAlign: 'center' }
});
