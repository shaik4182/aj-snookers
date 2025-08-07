import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, Button } from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const AdminBookingsScreen = () => {
  const [bookings, setBookings] = useState([]);

  // Filters
  const [filterDate, setFilterDate] = useState('');
  const [filterName, setFilterName] = useState('');
  const [filterGameType, setFilterGameType] = useState('');
  const [filterPhone, setFilterPhone] = useState('');

  const fetchFilteredBookings = async () => {
    let bookingsRef = collection(db, 'bookings');
    let filters = [];

    if (filterDate) filters.push(where('date', '==', filterDate));
    if (filterName) filters.push(where('name', '==', filterName));
    if (filterGameType) filters.push(where('gameType', '==', filterGameType));
    if (filterPhone) filters.push(where('phone', '==', filterPhone));

    try {
      const q = filters.length > 0 ? query(bookingsRef, ...filters) : bookingsRef;
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => doc.data());
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  useEffect(() => {
    fetchFilteredBookings();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Admin Booking Viewer</Text>

      {/* Filter Inputs */}
      <TextInput
        style={styles.input}
        placeholder="Filter by Date (YYYY-MM-DD)"
        value={filterDate}
        onChangeText={setFilterDate}
      />
      <TextInput
        style={styles.input}
        placeholder="Filter by Name"
        value={filterName}
        onChangeText={setFilterName}
      />
      <TextInput
        style={styles.input}
        placeholder="Filter by Game Type"
        value={filterGameType}
        onChangeText={setFilterGameType}
      />
      <TextInput
        style={styles.input}
        placeholder="Filter by Phone"
        keyboardType="phone-pad"
        value={filterPhone}
        onChangeText={setFilterPhone}
      />
      <Button title="Apply Filters" onPress={fetchFilteredBookings} />

      {/* Booking Results */}
      {bookings.map((booking, index) => (
        <View key={index} style={styles.card}>
          <Text>Name: {booking.name}</Text>
          <Text>Phone: {booking.phone}</Text>
          <Text>Game: {booking.gameType}</Text>
          <Text>Date: {booking.date}</Text>
          <Text>Time: {booking.startTime} - {booking.endTime}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    borderRadius: 5
  },
  card: {
    marginBottom: 15,
    padding: 15,
    borderWidth: 1,
    borderRadius: 8
  }
});

export default AdminBookingsScreen;
