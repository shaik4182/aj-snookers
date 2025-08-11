import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { db, auth } from '../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import moment from 'moment';
import { useFocusEffect } from '@react-navigation/native';

export default function MyBookings() {
  const [todaysBookings, setTodaysBookings] = useState([]);
  const [futureBookings, setFutureBookings] = useState([]);
  const [pastBookings, setPastBookings] = useState([]);

  const fetchBookings = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const todayStr = moment().format('YYYY-MM-DD');

    const q = query(
      collection(db, 'bookings'),
      where('userId', '==', user.uid)
    );
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const todayList = data.filter(b => b.date === todayStr);
    const futureList = data.filter(b => b.date > todayStr);
    const pastList = data.filter(b => b.date < todayStr);

    const sortByDateTime = (a, b) =>
      new Date(`${a.date} ${a.startTime}`) - new Date(`${b.date} ${b.startTime}`);

    todayList.sort(sortByDateTime);
    futureList.sort(sortByDateTime);
    pastList.sort((a, b) => new Date(`${b.date} ${b.startTime}`) - new Date(`${a.date} ${a.startTime}`));

    setTodaysBookings(todayList);
    setFutureBookings(futureList);
    setPastBookings(pastList);
  };

  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [])
  );

const renderBooking = ({ item }) => (
  <View style={styles.booking}>
    <Text style={styles.bookingText}>
      {moment(item.date).format('DD MMM YYYY')} — {item.gameType}
    </Text>
    <Text style={styles.bookingTime}>
      {item.startTime} - {item.endTime}
    </Text>
    <Text style={{
      color: item.status === 'approved' ? 'lightgreen' :
             item.status === 'pending' ? 'orange' : 'red'
    }}>
      Status: {item.status || 'pending'}
    </Text>
  </View>
);


  const combinedData = [
    { type: 'header', title: "Today's Bookings" },
    ...(todaysBookings.length ? todaysBookings : [{ type: 'empty', title: 'No bookings for today.' }]),
    { type: 'header', title: 'Future Bookings' },
    ...(futureBookings.length ? futureBookings : [{ type: 'empty', title: 'No future bookings.' }]),
    { type: 'header', title: 'Past Bookings' },
    ...(pastBookings.length ? pastBookings : [{ type: 'empty', title: 'No past bookings.' }]),
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Bookings</Text>
      <FlatList
        data={combinedData}
        keyExtractor={(item, index) => item.id || `key-${index}`}
        renderItem={({ item }) => {
          if (item.type === 'header') {
            return <Text style={styles.sectionTitle}>{item.title}</Text>;
          }
          if (item.type === 'empty') {
            return <Text style={styles.empty}>{item.title}</Text>;
          }
          return renderBooking({ item });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#004d26' // Dark green background
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 10,
    textAlign: 'center',
    color: '#FFD700' // Yellow title
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 8,
    color: '#1E90FF' // Bright blue section title
  },
  booking: { 
    padding: 10, 
    marginBottom: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: '#FFD700' // Yellow border
  },
  bookingText: {
    fontSize: 16,
    color: '#fff'
  },
  bookingTime: {
    fontSize: 14,
    color: '#FFD700'
  },
  empty: {
    color: 'rgba(255,255,255,0.7)',
    fontStyle: 'italic',
    paddingLeft: 10,
    marginBottom: 5
  }
});
