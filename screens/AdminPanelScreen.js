import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking, Button, Alert, TextInput, ScrollView } from 'react-native';
import { db } from '../firebaseConfig';
import { collection, query, onSnapshot, doc, updateDoc, getDocs, deleteDoc } from 'firebase/firestore';
import moment from 'moment';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function AdminPanelScreen() {
  const [bookingsToday, setBookingsToday] = useState([]);
  const [futureBookings, setFutureBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [showBookings, setShowBookings] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  useEffect(() => {
    const today = moment().format('YYYY-MM-DD');

    const bookingsQuery = collection(db, 'bookings');
    const unsubscribeBookings = onSnapshot(bookingsQuery, (snapshot) => {
      const allBookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const todayList = allBookings.filter(b => b.date === today);
      const futureList = allBookings.filter(b => b.date > today);

      todayList.sort((a, b) => new Date(`${a.date} ${a.startTime}`) - new Date(`${b.date} ${b.startTime}`));
      futureList.sort((a, b) => new Date(`${a.date} ${a.startTime}`) - new Date(`${b.date} ${b.startTime}`));

      setBookingsToday(todayList);
      setFutureBookings(futureList);
    });

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

  const activateMembership = async (userId) => {
    try {
      const dbRef = doc(db, 'users', userId);
      await updateDoc(dbRef, {
        membershipStatus: 'active',
        membershipActivatedAt: new Date().toISOString()
      });
      Alert.alert('Success', 'Membership activated for this user.');
    } catch (error) {
      Alert.alert('Error', 'Could not activate membership.');
    }
  };

  const cancelMembership = async (userId) => {
    try {
      const dbRef = doc(db, 'users', userId);
      await updateDoc(dbRef, {
        membershipStatus: '',
        membershipActivatedAt: null
      });
      Alert.alert('Cancelled', 'Membership cancelled.');
    } catch (error) {
      Alert.alert('Error', 'Could not cancel membership.');
    }
  };

  const confirmDeleteUser = (userId) => {
    Alert.alert(
      "Delete User",
      "Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteUser(userId) }
      ]
    );
  };

  const deleteUser = async (userId) => {
    try {
      await deleteDoc(doc(db, "users", userId));
      Alert.alert("Deleted", "User deleted successfully.");
    } catch (error) {
      Alert.alert("Error", "Could not delete user.");
    }
  };

const sendNotificationToAll = async () => {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const tokens = usersSnapshot.docs
      .map(doc => doc.data().expoPushToken)
      .filter(token => !!token);

    if (tokens.length === 0) {
      Alert.alert('Error', 'No push tokens found.');
      return;
    }

    await Promise.all(
      tokens.map(token =>
        fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: token,
            sound: 'default',
            title: '📢 Notice from Snooker Club',
            body: notificationMessage || ' ',
          }),
        })
      )
    );

    Alert.alert('Success', 'Notification sent to all users.');
    setNotificationMessage('');
  } catch (error) {
    Alert.alert('Error', 'Failed to send notifications.');
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
          {item.date} — {item.name} ({item.phone}) - {item.startTime} | {gameIcon} {item.gameType || 'N/A'}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderUserItem = ({ item }) => (
    <View style={styles.userItem}>
      <TouchableOpacity onPress={() => callNumber(item.mobile)}>
        <Text style={styles.itemText}>
          {item.name} ({item.mobile || 'No phone'}) - {item.role || 'user'} | 
          {item.membershipStatus ? ` ${item.membershipStatus}` : ' no membership'}
        </Text>
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        {item.membershipStatus === 'pending' && (
          <Button title="Activate" onPress={() => activateMembership(item.id)} />
        )}
        {(item.membershipStatus === 'pending' || item.membershipStatus === 'active') && (
          <Button title="Cancel" color="red" onPress={() => cancelMembership(item.id)} />
        )}
        {item.role !== 'admin' && (
          <Button 
            title="Delete" 
            color="darkred" 
            onPress={() => confirmDeleteUser(item.id)} 
          />
        )}
      </View>
    </View>
  );

  const combinedBookings = [
    { type: 'header', title: `Today's Bookings (${bookingsToday.length})` },
    ...(bookingsToday.length ? bookingsToday : [{ type: 'empty', title: 'No bookings for today.' }]),
    { type: 'header', title: `Future Bookings (${futureBookings.length})` },
    ...(futureBookings.length ? futureBookings : [{ type: 'empty', title: 'No future bookings.' }]),
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.titleBox}>
        <Text style={styles.pageTitle}>📋 Customer Details</Text>
      </View>

      {/* Notification Box */}
      <View style={styles.notificationBox}>
        <Text style={styles.notificationLabel}>Send Notification to All Users</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your message"
          value={notificationMessage}
          onChangeText={setNotificationMessage}
        />
        <Button title="Send Notification" onPress={sendNotificationToAll} />
      </View>

      {/* Bookings */}
      <TouchableOpacity
        style={[styles.dropdownHeader, { marginTop: 15 }]}
        onPress={() => setShowBookings(!showBookings)}
      >
        <Text style={styles.heading}>Bookings ({bookingsToday.length + futureBookings.length})</Text>
        <Ionicons name={showBookings ? 'chevron-up' : 'chevron-down'} size={20} color="#333" />
      </TouchableOpacity>

      {showBookings && (
        <FlatList
          data={combinedBookings}
          keyExtractor={(item, index) => item.id || `key-${index}`}
          renderItem={({ item }) => {
            if (item.type === 'header') return <Text style={styles.sectionTitle}>{item.title}</Text>;
            if (item.type === 'empty') return <Text style={styles.noData}>{item.title}</Text>;
            return renderBookingItem({ item });
          }}
          scrollEnabled={false} // Let ScrollView handle main scroll
        />
      )}

      {/* Users */}
      <TouchableOpacity
        style={[styles.dropdownHeader, { marginTop: showBookings ? 10 : 20 }]}
        onPress={() => setShowUsers(!showUsers)}
      >
        <Text style={styles.heading}>👥 Users ({users.length})</Text>
        <Ionicons name={showUsers ? 'chevron-up' : 'chevron-down'} size={20} color="#333" />
      </TouchableOpacity>

      {showUsers && (
        <FlatList
          data={users}
          keyExtractor={item => item.id}
          renderItem={renderUserItem}
          scrollEnabled={false} // Let ScrollView handle main scroll
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#fff' },
  titleBox: {
    backgroundColor: '#f1f1f1',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  pageTitle: { fontSize: 20, fontWeight: 'bold', color: '#2980b9', textAlign: 'center' },
  notificationBox: { marginBottom: 20, backgroundColor: '#f9f9f9', padding: 10, borderRadius: 8 },
  notificationLabel: { fontWeight: 'bold', marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 8, marginBottom: 10 },
  dropdownHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  heading: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 10, marginBottom: 8 },
  listItem: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  userItem: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  itemText: { fontSize: 16 },
  noData: { fontSize: 14, color: '#888', paddingVertical: 8 },
});
