import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function ContactUsScreen() {
  const shopAddress = "AJ Snookers, Angallu";
  const shopPhone = "+91 7032123006";
  const whatsappNumber = "917032123006"; // without +
  const email = "shameer.shaikal@gmail.com";

  const openMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shopAddress)}`;
    Linking.openURL(url).catch(() => Alert.alert("Error", "Unable to open Maps"));
  };

  const callNow = () => {
    Linking.openURL(`tel:${shopPhone}`);
  };

  const chatWhatsApp = () => {
    Linking.openURL(`https://wa.me/${whatsappNumber}`).catch(() =>
      Alert.alert("Error", "WhatsApp not installed")
    );
  };

  const sendEmail = () => {
    Linking.openURL(`mailto:${email}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📍 Contact Us</Text>

      <TouchableOpacity style={styles.card} onPress={openMaps}>
        <Ionicons name="location-sharp" size={28} color="#e74c3c" />
        <Text style={styles.cardText}>{shopAddress}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={callNow}>
        <Ionicons name="call" size={28} color="#27ae60" />
        <Text style={styles.cardText}>Call Now</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={chatWhatsApp}>
        <Ionicons name="logo-whatsapp" size={28} color="#25D366" />
        <Text style={styles.cardText}>Chat on WhatsApp</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={sendEmail}>
        <Ionicons name="mail" size={28} color="#2980b9" />
        <Text style={styles.cardText}>{email}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60, // ⬅ Added to push content slightly down
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 25, // Increased spacing from title to first card
    textAlign: 'center',
    color: '#2c3e50'
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  cardText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#333'
  }
});
