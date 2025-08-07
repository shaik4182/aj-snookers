import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignupScreen from './screens/SignupScreen';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import QuickGameScreen from './screens/QuickGameScreen';
import MembershipScreen from './screens/MembershipScreen';
import AdminBookingsScreen from './screens/AdminBookingsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Signup">
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="QuickGame" component={QuickGameScreen} />
        <Stack.Screen name="Membership" component={MembershipScreen} />
        <Stack.Screen name="AdminBookings" component={AdminBookingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
