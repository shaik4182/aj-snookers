// navigation/AdminStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AdminDashboard from '../screens/admin/AdminDashboard';
import AdminNotificationsScreen from '../screens/admin/AdminNotificationsScreen';
import AdminBookingsScreen from '../screens/admin/AdminBookingsScreen';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';
import AdminPaymentsScreen from '../screens/admin/AdminPaymentsScreen';

const Stack = createNativeStackNavigator();

export default function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen name="AdminDashboard" component={AdminDashboard} options={{ title: 'Admin Dashboard' }} />
      <Stack.Screen name="AdminNotifications" component={AdminNotificationsScreen} options={{ title: 'Send Notifications' }} />
      <Stack.Screen name="AdminBookings" component={AdminBookingsScreen} options={{ title: 'Bookings' }} />
      <Stack.Screen name="AdminUsers" component={AdminUsersScreen} options={{ title: 'Users' }} />
      <Stack.Screen name="AdminPayments" component={AdminPaymentsScreen} options={{ title: 'Payment Approval'}} />

    </Stack.Navigator>
  );
}
