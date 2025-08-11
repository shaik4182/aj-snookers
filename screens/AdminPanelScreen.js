import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, Button, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // adjust path

export default function AdminPanelScreen() {
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);

  const [showUsers, setShowUsers] = useState(false);
  const [showBookings, setShowBookings] = useState(false);
  const [showPayments, setShowPayments] = useState(false);

  // Load Users
  useEffect(() => {
    const usersRef = collection(db, 'users');
    const unsubscribeUsers = onSnapshot(usersRef, (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribeUsers();
  }, []);

  // Load Bookings
  useEffect(() => {
    const bookingsRef = collection(db, 'bookings');
    const unsubscribeBookings = onSnapshot(bookingsRef, (snapshot) => {
      setBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribeBookings();
  }, []);

  // Load Payments (pending first)
  useEffect(() => {
    const paymentsRef = collection(db, 'payments');
    const unsubscribePayments = onSnapshot(paymentsRef, (snapshot) => {
      let allPayments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      allPayments.sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        return 0;
      });
      setPayments(allPayments);
    });
    return () => unsubscribePayments();
  }, []);

  // Approve Payment
  const approvePayment = async (paymentId, userId) => {
    try {
      await updateDoc(doc(db, 'payments', paymentId), {
        status: 'approved',
        approvedAt: new Date().toISOString()
      });

      await updateDoc(doc(db, 'users', userId), {
        membershipStatus: 'active',
        membershipActivatedAt: new Date().toISOString()
      });

      Alert.alert('✅ Success', 'Payment approved and membership activated.');
    } catch (error) {
      Alert.alert('❌ Error', 'Could not approve payment.');
    }
  };

  // Reject Payment
  const rejectPayment = async (paymentId) => {
    try {
      await updateDoc(doc(db, 'payments', paymentId), { status: 'rejected' });
      Alert.alert('❌ Rejected', 'Payment request rejected.');
    } catch (error) {
      Alert.alert('❌ Error', 'Could not reject payment.');
    }
  };

  // Render Users
  const renderUserItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemText}>
        {item.name} ({item.mobile}){'\n'}
        Status: {item.membershipStatus || 'inactive'}
      </Text>
    </View>
  );

  // Render Bookings
  const renderBookingItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemText}>
        {item.gameType} @ {item.bookingTime}{'\n'}
        Status: {item.status}
      </Text>
    </View>
  );

  // Render Payments
  const renderPaymentItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemText}>
        {item.userName} ({item.mobile}){'\n'}
        UTR: {item.utrNumber} | ₹{item.amount}{'\n'}
        Status: {item.status}
      </Text>
      {item.status === 'pending' && (
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 5 }}>
          <Button title="Approve" onPress={() => approvePayment(item.id, item.userId)} />
          <Button title="Reject" color="red" onPress={() => rejectPayment(item.id)} />
        </View>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, padding: 15 }}>
      
      {/* Users */}
      <TouchableOpacity
        style={styles.dropdownHeader}
        onPress={() => setShowUsers(!showUsers)}
      >
        <Text style={styles.heading}>👤 Users ({users.length})</Text>
        <Ionicons name={showUsers ? 'chevron-up' : 'chevron-down'} size={20} color="#333" />
      </TouchableOpacity>
      {showUsers && (
        <FlatList
          data={users}
          keyExtractor={item => item.id}
          renderItem={renderUserItem}
          scrollEnabled={false}
        />
      )}

      {/* Bookings */}
      <TouchableOpacity
        style={styles.dropdownHeader}
        onPress={() => setShowBookings(!showBookings)}
      >
        <Text style={styles.heading}>🎱 Bookings ({bookings.length})</Text>
        <Ionicons name={showBookings ? 'chevron-up' : 'chevron-down'} size={20} color="#333" />
      </TouchableOpacity>
      {showBookings && (
        <FlatList
          data={bookings}
          keyExtractor={item => item.id}
          renderItem={renderBookingItem}
          scrollEnabled={false}
        />
      )}

      {/* Payments */}
      <TouchableOpacity
        style={styles.dropdownHeader}
        onPress={() => setShowPayments(!showPayments)}
      >
        <Text style={styles.heading}>💳 Payments ({payments.length})</Text>
        <Ionicons name={showPayments ? 'chevron-up' : 'chevron-down'} size={20} color="#333" />
      </TouchableOpacity>
      {showPayments && (
        <FlatList
          data={payments}
          keyExtractor={item => item.id}
          renderItem={renderPaymentItem}
          scrollEnabled={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginTop: 15
  },
  heading: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  itemContainer: {
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  itemText: {
    fontSize: 14
  }
});
