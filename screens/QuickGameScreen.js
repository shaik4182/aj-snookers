import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const QuickGame = () => {
  const [selectedGame, setSelectedGame] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');

  const handleBooking = () => {
    if (!selectedGame || !selectedSlot) {
      Alert.alert('Error', 'Please select both game and time slot.');
      return;
    }

    Alert.alert(
      'Booking Confirmed',
      `Game: ${selectedGame}\nSlot: ${selectedSlot}\nAmount: ₹${selectedGame === 'Snooker' ? '80' : '120'}`
    );

    setSelectedGame('');
    setSelectedSlot('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Game Booking</Text>

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

      <Text style={styles.label}>Select Time Slot:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedSlot}
          onValueChange={(itemValue) => setSelectedSlot(itemValue)}
        >
          <Picker.Item label="-- Select Slot --" value="" />
          <Picker.Item label="10:00 AM - 11:00 AM" value="10:00 AM - 11:00 AM" />
          <Picker.Item label="11:00 AM - 12:00 PM" value="11:00 AM - 12:00 PM" />
          <Picker.Item label="12:00 PM - 1:00 PM" value="12:00 PM - 1:00 PM" />
          <Picker.Item label="4:00 PM - 5:00 PM" value="4:00 PM - 5:00 PM" />
          <Picker.Item label="6:00 PM - 7:00 PM" value="6:00 PM - 7:00 PM" />
          <Picker.Item label="8:00 PM - 9:00 PM" value="8:00 PM - 9:00 PM" />
          <Picker.Item label="9:00 PM - 10:00 PM" value="9:00 PM - 10:00 PM" />
        </Picker>
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
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  buttonGroup: {
    marginBottom: 20,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 6,
    marginBottom: 15,
  },
});
