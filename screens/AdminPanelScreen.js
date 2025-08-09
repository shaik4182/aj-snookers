import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking } from 'react-native';
import { db } from '../firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import moment from 'moment';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function AdminPanelScreen() {
  const [bookingsToday, setBookingsToday] = useState([]);
  const [users, setUsers] = useState([]);
  const [showBookings, setShowBookings] = useState(false);
  const [showUsers, setShowUsers] = useState(false);

  useEffect(() => {
    const today = moment().format('YYYY-MM-DD');

    // Real-time bookings for today
    const bookingsQuery = query(
      collection(db, 'bookings'),
      where('date', '==', today)
    );
    const unsubscribeBookings = onSnapshot(bookingsQuery, (snapshot) => {
      setBookingsToday(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Real-time users
    const usersRef = collection(db, 'users');
    const unsubscribeUsers = onSnapshot(usersRef, (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeBookings();
      unsubscribeUsers();
    };
  }, []);

  const callNumber = (phone) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const renderBookingItem = ({ item }) => {
    let gameIcon = '';
    if (item.gameType?.toLowerCase().includes('8 ball')) {
      gameIcon = '🎱';
    } else if (item.gameType?.toLowerCase().includes('snooker')) {
      gameIcon = '🔴';
    }

    return (
      <TouchableOpacity style={styles.listItem} onPress={() => callNumber(item.phone)}>
        <Text style={styles.itemText}>
          {item.name} ({item.phone}) - {item.startTime} | {gameIcon} {item.gameType || 'N/A'}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity style={styles.listItem} onPress={() => callNumber(item.mobile)}>
      <Text style={styles.itemText}>
        {item.name} ({item.mobile || 'No phone'}) - {item.role || 'user'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Bookings Today */}
      <TouchableOpacity
        style={[styles.dropdownHeader, { marginTop: 20 }]}
        onPress={() => setShowBookings(!showBookings)}
      >
        <Text style={styles.heading}>📅 Bookings Today</Text>
        <Ionicons
          name={showBookings ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#333"
        />
      </TouchableOpacity>

      {showBookings && (
        <View style={styles.dropdownContent}>
          {bookingsToday.length > 0 ? (
            <FlatList
              data={bookingsToday}
              keyExtractor={item => item.id}
              renderItem={renderBookingItem}
            />
          ) : (
            <Text style={styles.noData}>No bookings for today</Text>
          )}
        </View>
      )}

      {/* Users */}
      <TouchableOpacity
        style={[styles.dropdownHeader, { marginTop: showBookings ? 10 : 20 }]}
        onPress={() => setShowUsers(!showUsers)}
      >
        <Text style={styles.heading}>👥 Users</Text>
        <Ionicons
          name={showUsers ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#333"
        />
      </TouchableOpacity>

      {showUsers && (
        <View style={styles.dropdownContent}>
          {users.length > 0 ? (
            <FlatList
              data={users}
              keyExtractor={item => item.id}
              renderItem={renderUserItem}
            />
          ) : (
            <Text style={styles.noData}>No users found</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    paddingTop: 35,
    backgroundColor: '#fff'
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  heading: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  dropdownContent: {
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 10
  },
  listItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemText: { fontSize: 16 },
  noData: { fontSize: 14, color: '#888', paddingVertical: 8 },
});
