import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import moment from 'moment';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';

const QuickGame = () => {
  const [selectedGame, setSelectedGame] = useState('');
  const [selectedStartTime, setSelectedStartTime] = useState('');
  const [snookerGames, setSnookerGames] = useState('1');
  const [bookedSlots, setBookedSlots] = useState([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const startTimes = [
    '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM',
    '4:00 PM', '6:00 PM', '8:00 PM', '9:00 PM',
  ];

  const today = moment().format('YYYY-MM-DD');

  const fetchBookedSlots = async () => {
    if (!selectedGame) {
      setBookedSlots([]);
      return;
    }

    const q = query(
      collection(db, 'bookings'),
      where('date', '==', today),
      where('gameType', '==', selectedGame)
    );

    const snapshot = await getDocs(q);
    const slots = snapshot.docs.map(doc => doc.data());
    setBookedSlots(slots);
  };

  useEffect(() => {
    fetchBookedSlots();
  }, [selectedGame]);

  const parseTime = (timeStr) => moment(timeStr, ['h:mm A']);

  const getEndTime = () => {
    if (!selectedGame || !selectedStartTime) return '';
    const start = parseTime(selectedStartTime);
    let end;

    if (selectedGame === 'Snooker') {
      const games = parseInt(snookerGames) || 1;
      end = start.clone().add(games * 30, 'minutes');
    } else {
      end = start.clone().add(60, 'minutes');
    }

    return `${start.format('h:mm A')} - ${end.format('h:mm A')}`;
  };

  const isOverlap = (newStart, newEnd) => {
    return bookedSlots.some(({ startTime, endTime }) => {
      const bookedStart = parseTime(startTime);
      const bookedEnd = parseTime(endTime);
      return newStart.isBefore(bookedEnd) && newEnd.isAfter(bookedStart);
    });
  };

  const handleBooking = async () => {
    if (!selectedGame || !selectedStartTime || !name.trim() || !phone.trim()) {
      Alert.alert('Error', 'Please fill all fields: Name, Phone, Game and Start Time.');
      return;
    }

    const start = parseTime(selectedStartTime);
    const games = selectedGame === 'Snooker' ? parseInt(snookerGames) || 1 : 1;
    const duration = selectedGame === 'Snooker' ? games * 30 : 60;
    const end = start.clone().add(duration, 'minutes');

    if (isOverlap(start, end)) {
      Alert.alert('Slot Unavailable', 'Selected time overlaps with an existing booking.');
      return;
    }

    const amount = selectedGame === 'Snooker' ? 80 * games : 120;
    const finalSlot = `${start.format('h:mm A')} - ${end.format('h:mm A')}`;

    const bookingData = {
      name: name.trim(),
      phone: phone.trim(),
      gameType: selectedGame,
      date: today,
      startTime: start.format('h:mm A'),
      endTime: end.format('h:mm A'),
    };

    try {
      await addDoc(collection(db, 'bookings'), bookingData);
      Alert.alert(
        'Booking Confirmed',
        `Name: ${name}\nPhone: ${phone}\nGame: ${selectedGame}\nSlot: ${finalSlot}\n${selectedGame === 'Snooker' ? `Games: ${games}\n` : ''}Amount: ₹${amount}`
      );

      // Reset
      setSelectedGame('');
      setSelectedStartTime('');
      setSnookerGames('1');
      setName('');
      setPhone('');
      fetchBookedSlots();
    } catch (error) {
      Alert.alert('Error', 'Failed to save booking.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Game Booking</Text>

      <Text style={styles.label}>Name:</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Enter your name"
      />

      <Text style={styles.label}>Phone Number:</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        placeholder="Enter your phone number"
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

      {selectedGame === 'Snooker' && (
        <View style={styles.snookerInput}>
          <Text style={styles.label}>Number of Games:</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={snookerGames}
            onChangeText={setSnookerGames}
            placeholder="Enter number of games"
          />
        </View>
      )}

      <Text style={styles.label}>Select Start Time:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedStartTime}
          onValueChange={(itemValue) => setSelectedStartTime(itemValue)}
        >
          <Picker.Item label="-- Select Start Time --" value="" />
          {startTimes.map((time) => (
            <Picker.Item
              key={time}
              label={time}
              value={time}
              enabled={!isOverlap(parseTime(time), parseTime(time).clone().add(selectedGame === 'Snooker' ? parseInt(snookerGames || '1') * 30 : 60, 'minutes'))}
            />
          ))}
        </Picker>
      </View>

      {selectedStartTime && (
        <Text style={styles.label}>Calculated Slot: {getEndTime()}</Text>
      )}

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
  snookerInput: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 6,
    paddingHorizontal: 10,
    height: 40,
    marginBottom: 15,
  },
});
