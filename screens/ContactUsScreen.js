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
        <Ionicons name="location-sharp" size={28} color="#FFD700" />
        <Text style={styles.cardText}>{shopAddress}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={callNow}>
        <Ionicons name="call" size={28} color="#1E90FF" />
        <Text style={styles.cardText}>Call Now</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={chatWhatsApp}>
        <Ionicons name="logo-whatsapp" size={28} color="#25D366" />
        <Text style={styles.cardText}>Chat on WhatsApp</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={sendEmail}>
        <Ionicons name="mail" size={28} color="#FF6347" />
        <Text style={styles.cardText}>{email}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#004d26', // Dark green background
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
    color: '#FFD700', // Yellow gold title
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)', // Semi-transparent for style
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#FFD700', // Yellow borders
  },
  cardText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#fff', // White text
  },
});
