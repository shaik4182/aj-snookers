import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { db } from '../../firebaseConfig';
import { collection, onSnapshot, getDocs } from 'firebase/firestore';
import moment from 'moment';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('today'); // today, future

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'bookings'), async (snapshot) => {
      const bookingData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Fetch all users once
      const usersSnap = await getDocs(collection(db, 'users'));
      const usersMap = {};
      usersSnap.forEach(userDoc => {
        usersMap[userDoc.id] = userDoc.data();
      });

      // Merge name & phone into bookings
      const mergedBookings = bookingData.map(b => ({
        ...b,
        userName: usersMap[b.userId]?.name || 'Unknown',
        userPhone: usersMap[b.userId]?.mobile || 'No phone'
      }));

      setBookings(mergedBookings);
    });

    return () => unsubscribe();
  }, []);

  const todayStr = moment().format('YYYY-MM-DD');

  const filteredBookings = () => {
    if (activeTab === 'today') {
      return bookings.filter(b => b.date === todayStr);
    }
    if (activeTab === 'future') {
      return bookings.filter(b => b.date > todayStr);
    }
    return [];
  };

  const renderBooking = ({ item }) => (
    <View style={styles.bookingCard}>
      <Text style={styles.bookingText}>📅 {moment(item.date).format('DD MMM YYYY')}</Text>
      <Text style={styles.bookingText}>⏰ {item.startTime} - {item.endTime}</Text>
      <Text style={styles.bookingText}>🎮 {item.gameType}</Text>
      <Text style={styles.bookingText}>👤 {item.userName} ({item.userPhone})</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'today' && styles.activeTab]}
          onPress={() => setActiveTab('today')}
        >
          <Text style={[styles.tabText, activeTab === 'today' && styles.activeTabText]}>
            Today's Bookings ({bookings.filter(b => b.date === todayStr).length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'future' && styles.activeTab]}
          onPress={() => setActiveTab('future')}
        >
          <Text style={[styles.tabText, activeTab === 'future' && styles.activeTabText]}>
            Future Bookings ({bookings.filter(b => b.date > todayStr).length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      {filteredBookings().length > 0 ? (
        <FlatList
          data={filteredBookings()}
          keyExtractor={(item) => item.id}
          renderItem={renderBooking}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      ) : (
        <Text style={styles.noData}>No bookings found</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#004d26', padding: 10 },
  tabs: {
    flexDirection: 'row',
    marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  activeTab: { backgroundColor: '#1E90FF' },
  tabText: { fontSize: 16, color: '#FFD700', textAlign: 'center' },
  activeTabText: { color: '#fff', fontWeight: 'bold' },
  bookingCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFD700',
    padding: 12,
    marginBottom: 10,
  },
  bookingText: { fontSize: 15, color: '#fff', marginBottom: 4 },
  noData: { textAlign: 'center', marginTop: 20, fontSize: 16, color: '#FFD700' },
});
