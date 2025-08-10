import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button, TouchableOpacity, Linking } from 'react-native';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function UsersScreen() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, []);

  const deleteUser = async (id, role) => {
    if (role === 'admin') return alert("Can't delete admin user!");
    await deleteDoc(doc(db, 'users', id));
  };

  const renderUser = ({ item }) => (
    <View style={styles.userRow}>
      <TouchableOpacity onPress={() => Linking.openURL(`tel:${item.mobile}`)}>
        <Text>{item.name} ({item.mobile})</Text>
      </TouchableOpacity>
      {item.role !== 'admin' && (
        <Button title="Delete" color="red" onPress={() => deleteUser(item.id, item.role)} />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>👥 Users</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={renderUser}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  header: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
});
