import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, TextInput, Alert } from 'react-native';

const QuickGame = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedGame, setSelectedGame] = useState('');

  const handleBooking = () => {
    if (!name || !phone || !selectedGame) {
      Alert.alert('Error', 'Please fill all fields and select a game.');
      return;
    }

    Alert.alert(
      'Booking Confirmed',
      `Name: ${name}\nPhone: ${phone}\nGame: ${selectedGame}\nAmount: ₹${selectedGame === 'Snooker' ? '80' : '120'}`
    );

    // Here you can later integrate Firebase Firestore to store bookings
    setName('');
    setPhone('');
    setSelectedGame('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Game Booking</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Enter mobile number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Select Game:</Text>
      <View style={styles.buttonGroup}>
        <Button
          title="Snooker (₹80/game)"
          onPress={() => setSelectedGame('Snooker')}
          color={selectedGame === 'Snooker' ? '#4CAF50' : undefined}
        />
        <View style={{ height: 10 }} />
        <Button
          title="8 Ball Pool (₹120/hr)"
          onPress={() => setSelectedGame('8 Ball Pool')}
          color={selectedGame === '8 Ball Pool' ? '#4CAF50' : undefined}
        />
      </View>

      <View style={{ marginTop: 30 }}>
        <Button title="Book Slot" onPress={handleBooking} />
      </View>
    </View>
  );
};

export default QuickGame;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 6,
    padding: 10,
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  buttonGroup: {
    marginBottom: 20,
  },
});
