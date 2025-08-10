import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert, TextInput, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import { auth, db } from '../firebaseConfig';
import { collection, query, where, getDocs, addDoc, doc, getDoc } from 'firebase/firestore';

const QuickGame = ({ navigation }) => {
  const [selectedGame, setSelectedGame] = useState('');
  const [selectedStartTime, setSelectedStartTime] = useState('');
  const [snookerGames, setSnookerGames] = useState('1');
  const [bookedSlots, setBookedSlots] = useState([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const startTimes = [
    '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM',
    '4:00 PM','5:00 PM', '6:00 PM', '8:00 PM', '9:00 PM', '10:00 PM',
  ];

  // Fetch user details from Firestore
  useEffect(() => {
    const fetchUserInfo = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setName(data.name || '');
        setPhone(data.mobile || '');
      }
    };

    fetchUserInfo();
  }, []);

  const fetchBookedSlots = async () => {
    if (!selectedGame) {
      setBookedSlots([]);
      return;
    }

    const selectedDateStr = moment(date).format('YYYY-MM-DD');

    const q = query(
      collection(db, 'bookings'),
      where('date', '==', selectedDateStr),
      where('gameType', '==', selectedGame)
    );

    const snapshot = await getDocs(q);
    const slots = snapshot.docs.map(doc => doc.data());
    setBookedSlots(slots);
  };

  useEffect(() => {
    fetchBookedSlots();
  }, [selectedGame, date]);

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

  const isPastTime = (time) => {
    if (moment(date).isSame(moment(), 'day')) {
      const now = moment();
      return parseTime(time).isBefore(now);
    }
    return false;
  };

  // ✅ NEW: Correct slot disabling logic
  const isTimeDisabled = (time) => {
    const start = parseTime(time);
    const duration = selectedGame === 'Snooker'
      ? parseInt(snookerGames || '1') * 30
      : 60;
    const end = start.clone().add(duration, 'minutes');

    // Disable if past time today
    if (isPastTime(time)) return true;

    // Disable if overlaps with any booking
    return bookedSlots.some(({ startTime, endTime }) => {
      const bookedStart = parseTime(startTime);
      const bookedEnd = parseTime(endTime);

      // Only disable if new slot overlaps
      return start.isBefore(bookedEnd) && end.isAfter(bookedStart);
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

    if (isTimeDisabled(selectedStartTime)) {
      Alert.alert('Slot Unavailable', 'Selected time overlaps with an existing booking.');
      return;
    }

    const amount = selectedGame === 'Snooker' ? 80 * games : 120;
    const bookingData = {
      name: name.trim(),
      phone: phone.trim(),
      gameType: selectedGame,
      date: moment(date).format('YYYY-MM-DD'),
      startTime: start.format('h:mm A'),
      endTime: end.format('h:mm A'),
      userId: auth.currentUser.uid
    };

    try {
      await addDoc(collection(db, 'bookings'), bookingData);

      // Navigate to PaymentMethod screen
      navigation.navigate('PaymentMethod', {
        bookingData: {
          ...bookingData,
          amount
        }
      });

      // Reset fields
      setSelectedGame('');
      setSelectedStartTime('');
      setSnookerGames('1');
      fetchBookedSlots();
    } catch (error) {
      Alert.alert('Error', 'Failed to save booking.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.title}>Quick Game Booking</Text>

      <Text style={styles.label}>Select Date:</Text>
      <Button title={moment(date).format('DD MMM YYYY')} onPress={() => setShowDatePicker(true)} />
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setDate(selectedDate);
          }}
          minimumDate={new Date()}
        />
      )}

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
  style={styles.picker} // ✅ Apply white text
  onValueChange={(itemValue) => setSelectedStartTime(itemValue)}
>
  <Picker.Item label="-- Select Start Time --" value="" />
  {startTimes.map((time) => (
    <Picker.Item
      key={time}
      label={time}
      value={time}
      enabled={!isTimeDisabled(time)}
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
    </ScrollView>
  );
};

export default QuickGame;

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 25,
    backgroundColor: '#013220', // Deep snooker green
    flexGrow: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
    color: '#FFD700', // Gold title
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#FFFFFF', // White text
  },
  input: {
    borderWidth: 1,
    borderColor: '#FFD700', // Gold border
    borderRadius: 6,
    paddingHorizontal: 10,
    height: 40,
    marginBottom: 15,
    backgroundColor: 'rgba(255,255,255,0.08)', // Light transparent background
    color: '#FFFFFF',
  },
pickerContainer: {
  borderWidth: 1,
  borderColor: '#FFD700', // gold border
  borderRadius: 6,
  marginBottom: 15,
  backgroundColor: 'rgba(255,255,255,0.15)', // lighter background for visibility
},
picker: {
  color: '#FFFFFF', // white text inside picker
},

  buttonGroup: {
    marginBottom: 20,
  },
  snookerButton: {
    backgroundColor: '#228B22', // Forest green for snooker
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
  },
  snookerButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  poolButton: {
    backgroundColor: '#0066CC', // Deep blue (muted) for pool
    padding: 12,
    borderRadius: 6,
  },
  poolButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  bookButton: {
    backgroundColor: '#FFD700', // Gold booking button
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  bookButtonText: {
    color: '#013220', // Dark green text on gold
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});
