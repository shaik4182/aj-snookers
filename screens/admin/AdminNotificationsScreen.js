import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { db } from '../../firebaseConfig';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';

export default function AdminNotificationsScreen() {
  const [message, setMessage] = useState('');

  const sendNotificationToAll = async () => {
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter a message.');
      return;
    }

    try {
      // --- 1. Save to Firestore ---
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(23, 59, 59, 999);

      await setDoc(doc(db, 'settings', 'adminMessage'), {
        message: message,
        createdAt: now.toISOString(),
        expiresAt: midnight.toISOString(),
      });

      console.log("✅ Admin message saved to Firestore");

      // --- 2. Send push notifications ---
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
              body: message,
            }),
          })
        )
      );

      Alert.alert('Success', 'Notification sent and saved.');
      setMessage('');
    } catch (error) {
      console.error('Error sending notifications:', error);
      Alert.alert('Error', 'Failed to send notifications.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Send Notification to All Users</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your message"
        placeholderTextColor="#fff"
        value={message}
        onChangeText={setMessage}
      />
      <Button title="Send Notification" onPress={sendNotificationToAll} />
    </View>
  );
}



const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    padding: 15, 
    backgroundColor: '#004d26', 
    justifyContent: 'center' 
  },
  label: { 
    fontWeight: 'bold', 
    fontSize: 18, 
    color: '#FFD700', 
    marginBottom: 10, 
    textAlign: 'center' 
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#FFD700', 
    borderRadius: 8, 
    padding: 10, 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    color: '#fff',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 15 
  },
  button: { 
    backgroundColor: '#1E90FF', 
    padding: 12, 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#FFD700',
    alignItems: 'center' 
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  
});
