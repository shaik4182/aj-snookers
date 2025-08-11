import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, Alert, StyleSheet } from 'react-native';
import { db } from '../../firebaseConfig';
import { collection, onSnapshot, doc, updateDoc, query, where } from 'firebase/firestore';

export default function AdminPaymentsScreen() {
  const [pendingApprovals, setPendingApprovals] = useState([]);

  useEffect(() => {
    const bookingsQuery = query(
      collection(db, 'bookings'),
      where('status', '==', 'pending')
    );

    let firstLoad = true;

    const unsub = onSnapshot(bookingsQuery, (snapshot) => {
      if (!firstLoad) {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const booking = change.doc.data();
            Alert.alert(
              "📢 New Payment Request",
              `Name: ${booking.name || 'N/A'}\nPhone: ${booking.phone || 'N/A'}\nGame: ${booking.gameType}\nDate: ${booking.date || 'N/A'}\nTime: ${booking.startTime || 'N/A'}\nAmount: ₹${booking.amount}\nPayment Method: ${booking.paymentMethod}\nUTR: ${booking.utrNumber || 'N/A'}`
            );
          }
        });
      }

      const bookingList = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          type: data.paymentMethod || 'Cash',
          name: data.name,
          phone: data.phone,
          gameType: data.gameType,
          amount: data.amount,
          utr: data.utrNumber || '',
          date: data.date || '',
          time: data.startTime || '',
        };
      });

      setPendingApprovals(bookingList);
      firstLoad = false;
    });

    return () => unsub();
  }, []);

  const approvePayment = async (item) => {
    try {
      await updateDoc(doc(db, 'bookings', item.id), { status: 'approved' });
      Alert.alert('✅ Success', 'Approved successfully.');
    } catch (error) {
      console.error(error);
      Alert.alert('❌ Error', 'Could not approve.');
    }
  };

  const rejectPayment = async (item) => {
    try {
      await updateDoc(doc(db, 'bookings', item.id), { status: 'rejected' });
      Alert.alert('⚠️ Rejected', 'Rejected successfully.');
    } catch (error) {
      console.error(error);
      Alert.alert('❌ Error', 'Could not reject.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pending Approvals</Text>
      <FlatList
        data={pendingApprovals}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.text}>Type: {item.type}</Text>
            <Text style={styles.text}>Name: {item.name}</Text>
            <Text style={styles.text}>Phone: {item.phone}</Text>
            <Text style={styles.text}>Game: {item.gameType}</Text>
            <Text style={styles.text}>Date: {item.date}</Text>
            <Text style={styles.text}>Time: {item.time}</Text>
            <Text style={styles.text}>Amount: ₹{item.amount}</Text>
            {item.type === 'UPI' && item.utr ? (
              <Text style={styles.text}>UTR: {item.utr}</Text>
            ) : null}

            <View style={styles.buttonRow}>
              <Button title="Approve" onPress={() => approvePayment(item)} />
              <Button title="Reject" color="red" onPress={() => rejectPayment(item)} />
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#004d26' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#FFD700', marginBottom: 15, textAlign: 'center' },
  card: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#FFD700' },
  text: { color: '#fff', marginBottom: 5 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }
});
