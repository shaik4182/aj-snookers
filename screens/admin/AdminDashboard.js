import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function AdminDashboard({ navigation }) {
  const menuItems = [
    { title: 'Send Notifications', icon: 'notifications', color: '#FFD700', screen: 'AdminNotifications' },
    { title: 'Bookings', icon: 'calendar', color: '#1E90FF', screen: 'AdminBookings' },
    { title: 'Users', icon: 'people', color: '#27ae60', screen: 'AdminUsers' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      {menuItems.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.card}
          onPress={() => navigation.navigate(item.screen)}
        >
          <Ionicons name={item.icon} size={26} color={item.color} />
          <Text style={styles.cardText}>{item.title}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#004d26', // Dark green background
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  cardText: {
    fontSize: 18,
    color: '#fff',
    marginLeft: 15,
    fontWeight: '500',
  },
});
