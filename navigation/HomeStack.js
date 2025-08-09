import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import QuickGameScreen from '../screens/QuickGameScreen';
import MembershipScreen from '../screens/MembershipScreen';
import PaymentMethodScreen from '../screens/PaymentMethodScreen';

const Stack = createNativeStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HomeMain" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="QuickGame" component={QuickGameScreen} />
      <Stack.Screen name="Membership" component={MembershipScreen} />
      <Stack.Screen name="PaymentMethod" component={PaymentMethodScreen} />
    </Stack.Navigator>
  );
}
