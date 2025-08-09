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

  useEffect(() => {
    const fetchMembershipStatusAndUserInfo = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return;

        const db = getFirestore();

        // ✅ Auto-fill user details
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setName(data.name || '');
          setPhone(data.mobile || '');
          setEmail(user.email || '');
        }

        // ✅ Check membership status
        const memberDoc = await getDoc(doc(db, 'members', user.uid));
        if (memberDoc.exists()) {
          const data = memberDoc.data();
          const registeredDate = new Date(data.registeredAt);
          const now = new Date();
          const diffDays = Math.floor((now - registeredDate) / (1000 * 60 * 60 * 24));
          const daysLeft = 30 - diffDays;

          if (daysLeft > 0) {
            setMembershipRegistered(true);
            setRemainingDays(daysLeft);
          } else {
            setMembershipRegistered(false);
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

    // Prepare bookingData-like object for Payment screen
    const bookingData = {
      name,
      phone,
      email,
      govtIdType,
      aadhaarNumber,
      amount: 5000,
      membership: true, // flag to identify in payment
    };

    navigation.navigate('PaymentMethod', { bookingData });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Membership</Text>

      {membershipRegistered ? (
        <Text style={styles.successText}>
          ✅ Membership active. You have {remainingDays} days remaining!
        </Text>
      ) : (
        <>
          <TextInput style={styles.input} placeholder="Full Name" value={name} onChangeText={setName} />
          <TextInput style={styles.input} placeholder="Phone Number" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
          <TextInput style={styles.input} placeholder="Email Address" keyboardType="email-address" value={email} onChangeText={setEmail} />

          <Text style={styles.label}>Select Govt ID Type:</Text>
          <Picker selectedValue={govtIdType} onValueChange={setGovtIdType} style={styles.picker}>
            <Picker.Item label="-- Select --" value="" />
            <Picker.Item label="Aadhaar Card" value="aadhaar" />
            <Picker.Item label="PAN Card" value="pan" />
          </Picker>

          <TextInput
            style={styles.input}
            placeholder="Enter Aadhaar/PAN Number"
            value={aadhaarNumber}
            onChangeText={setAadhaarNumber}
          />

          <Button title="Register Membership (₹5000/month)" onPress={handleRegisterPress} />
        </>
      )}

      <Text style={styles.noteTitle}>📝 Membership Info</Text>
      <View style={styles.noteBox}>
        <Text>⏰ Timing Slots (Daily):</Text>
        <Text> • Morning: 10:00 AM – 1:00 PM</Text>
        <Text> • Afternoon: 2:00 PM – 5:00 PM</Text>

        <Text style={styles.spacer} />

        <Text>🔔 Book your slot before visiting.</Text>

        <Text style={styles.spacer} />

        <Text>🎮 Daily Playing Limits:</Text>
        <Text> 🟢 Snooker: Up to 4 games/day</Text>
        <Text> 🔵 8 Ball Pool: Up to 2 hours/day</Text>
        <Text> 🚫 Only one game type Snooker or 8 Ball pool per day.</Text>

        <Text style={styles.spacer} />

        <Text>🎁 Benefits:</Text>
        <Text> 🏆 Win all 4 snooker games → ₹200 reward</Text>
        <Text> 📅 Valid for 30 days</Text>
        <Text> 🎫 Priority slot booking</Text>
        <Text> 📸 One-time Govt ID proof (used every time)</Text>

        <Text style={styles.spacer} />

        <Text>📌 Rules:</Text>
        <Text> ⚠️ Must book slot before arrival</Text>
        <Text> 🚷 No carry forward of unused time</Text>
        <Text> 👤 Membership is non-transferable</Text>
        <Text> 🔄 Re-register after 30 days</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 12, borderRadius: 6 },
  picker: { height: 50, width: '100%', marginBottom: 15 },
  label: { marginBottom: 5 },
  successText: { marginVertical: 20, color: 'green', fontWeight: 'bold', fontSize: 16 },
  noteTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  noteBox: { backgroundColor: '#f8f8f8', padding: 15, borderRadius: 10 },
  spacer: { marginVertical: 6 }
});
