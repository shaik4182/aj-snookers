import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { db } from '../../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

export default function AdminNotificationsScreen() {
  const [message, setMessage] = useState('');

  const sendNotificationToAll = async () => {
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter a message.');
      return;
    }

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
              body: message,
            }),
          })
        )
      );

      Alert.alert('Success', 'Notification sent to all users.');
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
        value={message}
        onChangeText={setMessage}
      />
      <Button title="Send Notification" onPress={sendNotificationToAll} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#fff' },
  label: { fontWeight: 'bold', marginBottom: 5, fontSize: 18 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 8, marginBottom: 10 },
});
