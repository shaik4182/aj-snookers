import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

export default function MembershipScreen({ navigation }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [govtIdType, setGovtIdType] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [membershipRegistered, setMembershipRegistered] = useState(false);
  const [remainingDays, setRemainingDays] = useState(0);
  const [membershipStatus, setMembershipStatus] = useState('');

  useEffect(() => {
    const fetchMembershipStatusAndUserInfo = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return;

        const db = getFirestore();
        const userDoc = await getDoc(doc(db, 'users', user.uid));

        if (userDoc.exists()) {
          const data = userDoc.data();
          setName(data.name || '');
          setPhone(data.mobile || '');
          setEmail(user.email || '');
          setMembershipStatus(data.membershipStatus || '');

          if (data.membershipStatus === 'active' && data.membershipActivatedAt) {
            const registeredDate = new Date(data.membershipActivatedAt);
            const now = new Date();
            const diffDays = Math.floor((now - registeredDate) / (1000 * 60 * 60 * 24));
            const daysLeft = 30 - diffDays;

            if (daysLeft > 0) {
              setMembershipRegistered(true);
              setRemainingDays(daysLeft);
            }
          }
        }
      } catch (error) {
        console.error('Error loading membership info:', error);
      }
    };

    fetchMembershipStatusAndUserInfo();
  }, []);

  const handleRegisterPress = () => {
    if (!name || !phone || !email || !govtIdType || !aadhaarNumber) {
      Alert.alert('Missing Info', 'Please fill all fields.');
      return;
    }

    const bookingData = {
      name,
      phone,
      email,
      govtIdType,
      aadhaarNumber,
      amount: 5000,
      membership: true
    };
    navigation.navigate('PaymentMethod', { bookingData });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🏅 Membership</Text>

      {membershipRegistered ? (
        <Text style={styles.successText}>
          ✅ Membership active. You have {remainingDays} days remaining!
        </Text>
      ) : membershipStatus === 'pending' ? (
        <Text style={styles.pendingText}>
          ⏳ Membership request pending. Please pay at the counter to activate.
        </Text>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#ccc"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            placeholderTextColor="#ccc"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor="#ccc"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Select Govt ID Type:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={govtIdType}
              style={styles.picker}
              dropdownIconColor="#FFD700"
              onValueChange={setGovtIdType}
            >
              <Picker.Item label="-- Select --" value="" />
              <Picker.Item label="Aadhaar Card" value="aadhaar" />
              <Picker.Item label="PAN Card" value="pan" />
            </Picker>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Enter Aadhaar/PAN Number"
            placeholderTextColor="#ccc"
            value={aadhaarNumber}
            onChangeText={setAadhaarNumber}
          />

          <Button title="Register Membership (₹5000/month)" color="#1E90FF" onPress={handleRegisterPress} />
        </>
      )}

      <Text style={styles.noteTitle}>📝 Membership Info</Text>
      <View style={styles.noteBox}>
        <Text style={styles.noteText}>⏰ Timing Slots (Daily):</Text>
        <Text style={styles.noteText}> • Morning: 10:00 AM – 1:00 PM</Text>
        <Text style={styles.noteText}> • Afternoon: 2:00 PM – 5:00 PM</Text>
        <Text style={styles.spacer} />
        <Text style={styles.noteText}>🔔 Book your slot before visiting.</Text>
        <Text style={styles.spacer} />
        <Text style={styles.noteText}>🎮 Daily Playing Limits:</Text>
        <Text style={styles.noteText}> 🟢 Snooker: Up to 4 games/day</Text>
        <Text style={styles.noteText}> 🔵 8 Ball Pool: Up to 2 hours/day</Text>
        <Text style={styles.noteText}> 🚫 Only one game type Snooker or 8 Ball pool per day.</Text>
        <Text style={styles.spacer} />
        <Text style={styles.noteText}>🎁 Benefits:</Text>
        <Text style={styles.noteText}> 🏆 Win all 4 snooker games → ₹200 reward</Text>
        <Text style={styles.noteText}> 📅 Valid for 30 days</Text>
        <Text style={styles.noteText}> 🎫 Priority slot booking</Text>
        <Text style={styles.noteText}> 📸 One-time Govt ID proof (used every time)</Text>
        <Text style={styles.spacer} />
        <Text style={styles.noteText}>📌 Rules:</Text>
        <Text style={styles.noteText}> ⚠️ Must book slot before arrival</Text>
        <Text style={styles.noteText}> 🚷 No carry forward of unused time</Text>
        <Text style={styles.noteText}> 👤 Membership is non-transferable</Text>
        <Text style={styles.noteText}> 🔄 Re-register after 30 days</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#004d26', // Dark green background
    flexGrow: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#FFD700', // Gold
  },
  input: {
    borderWidth: 1,
    borderColor: '#FFD700', // Yellow border
    borderRadius: 6,
    paddingHorizontal: 10,
    height: 40,
    marginBottom: 15,
    color: '#fff',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 6,
    marginBottom: 15,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  picker: {
    color: '#fff',
  },
  label: {
    marginBottom: 5,
    color: '#fff',
  },
  successText: {
    marginVertical: 20,
    color: '#28a745',
    fontWeight: 'bold',
    fontSize: 16,
  },
  pendingText: {
    marginVertical: 20,
    color: 'orange',
    fontWeight: 'bold',
    fontSize: 16,
  },
  noteTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#FFD700',
  },
  noteBox: {
    backgroundColor: '#1E90FF', // Bright blue box for info
    padding: 15,
    borderRadius: 10,
  },
  noteText: {
    color: '#fff',
  },
  spacer: {
    marginVertical: 6,
  },
});
