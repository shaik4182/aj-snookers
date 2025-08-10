import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import moment from 'moment';

export default function BookingsScreen() {
  const [todayBookings, setTodayBookings] = useState([]);
  const [futureBookings, setFutureBookings] = useState([]);

  useEffect(() => {
    const today = moment().format('YYYY-MM-DD');
    const unsubscribe = onSnapshot(collection(db, 'bookings'), (snapshot) => {
      const all = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTodayBookings(all.filter(b => b.date === today));
      setFutureBookings(all.filter(b => b.date > today));
    });
    return unsubscribe;
  }, []);

  const renderBooking = ({ item }) => (
    <TouchableOpacity onPress={() => Linking.openURL(`tel:${item.phone}`)}>
      <Text style={styles.item}>
        {item.date} - {item.name} ({item.phone}) - {item.startTime}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📅 Today's Bookings</Text>
      <FlatList
        data={todayBookings}
        keyExtractor={(item) => item.id}
        renderItem={renderBooking}
      />
      <Text style={styles.header}>⏳ Future Bookings</Text>
      <FlatList
        data={futureBookings}
        keyExtractor={(item) => item.id}
        renderItem={renderBooking}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  header: { fontSize: 18, fontWeight: 'bold', marginTop: 15, marginBottom: 8 },
  item: { paddingVertical: 10, borderBottomWidth: 1, borderColor: '#eee' },
});
