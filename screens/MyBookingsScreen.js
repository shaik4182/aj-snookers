import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { db, auth } from '../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import moment from 'moment';
import { useFocusEffect } from '@react-navigation/native';

export default function MyBookings() {
  const [todaysBookings, setTodaysBookings] = useState([]);
  const [pastBookings, setPastBookings] = useState([]);

  const fetchBookings = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const todayStr = moment().format('YYYY-MM-DD');

    // 🔹 Fetch bookings only for logged-in user
    const q = query(
      collection(db, 'bookings'),
      where('userId', '==', user.uid)
    );
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const todayList = data.filter(b => b.date === todayStr);
    const pastList = data.filter(b => b.date < todayStr);

    // Sort newest first
    todayList.sort((a, b) => new Date(`${b.date} ${b.startTime}`) - new Date(`${a.date} ${a.startTime}`));
    pastList.sort((a, b) => new Date(`${b.date} ${b.startTime}`) - new Date(`${a.date} ${a.startTime}`));

    setTodaysBookings(todayList);
    setPastBookings(pastList);
  };

  // 🔹 Refresh every time screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [])
  );

  const renderBooking = ({ item }) => (
    <View style={styles.booking}>
      <Text>{item.date} — {item.gameType}</Text>
      <Text>{item.startTime} - {item.endTime}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Bookings</Text>

      <Text style={styles.sectionTitle}>Today's Bookings</Text>
      {todaysBookings.length === 0 ? (
        <Text style={styles.empty}>No bookings for today.</Text>
      ) : (
        <FlatList
          data={todaysBookings}
          keyExtractor={(item) => item.id}
          renderItem={renderBooking}
        />
      )}

      <Text style={styles.sectionTitle}>Past Bookings</Text>
      {pastBookings.length === 0 ? (
        <Text style={styles.empty}>No past bookings.</Text>
      ) : (
        <FlatList
          data={pastBookings}
          keyExtractor={(item) => item.id}
          renderItem={renderBooking}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20,
    paddingTop: 40
  },
  title: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginBottom: 20 
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 8
  },
  booking: { 
    padding: 10, 
    borderBottomWidth: 1, 
    borderBottomColor: '#ccc' 
  },
  empty: {
    color: 'gray',
    fontStyle: 'italic',
    marginBottom: 10
  }
});
