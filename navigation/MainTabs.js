import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { CommonActions } from '@react-navigation/native';

import HomeStack from './HomeStack';
import MyBookingsScreen from '../screens/MyBookingsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AdminPanelScreen from '../screens/AdminPanelScreen';
import ContactUsScreen from '../screens/ContactUsScreen';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setRole(userDoc.data().role || 'user');
        } else {
          setRole('user');
        }
      } catch (error) {
        console.error('Error fetching role:', error);
        setRole('user');
      }
      setLoading(false);
    };

    fetchRole();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2980b9" />
      </View>
    );
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Contact Us') iconName = 'map';
          else if (route.name === 'My Bookings') iconName = 'calendar';
          else if (route.name === 'Profile') iconName = 'person';
          else if (route.name === 'Admin') iconName = 'settings';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2980b9',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault(); // stop default tab behavior
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'Home', state: { routes: [{ name: 'HomeScreen' }] } }],
              })
            );
          },
        })}
      />
      <Tab.Screen name="Contact Us" component={ContactUsScreen} />
      <Tab.Screen name="My Bookings" component={MyBookingsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      {role === 'admin' && <Tab.Screen name="Admin" component={AdminPanelScreen} />}
    </Tab.Navigator>
  );
}
