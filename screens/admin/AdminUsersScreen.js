import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Button, Linking, Alert } from 'react-native';
import { db } from '../../firebaseConfig';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // all, members

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const callNumber = (phone) => {
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  const activateMembership = async (userId) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        membershipStatus: 'active',
        membershipActivatedAt: new Date().toISOString()
      });
      Alert.alert('✅ Success', 'Membership activated.');
    } catch {
      Alert.alert('❌ Error', 'Could not activate membership.');
    }
  };

  const cancelMembership = async (userId) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        membershipStatus: '',
        membershipActivatedAt: null
      });
      Alert.alert('🚫 Cancelled', 'Membership cancelled.');
    } catch {
      Alert.alert('❌ Error', 'Could not cancel membership.');
    }
  };

  const confirmDeleteUser = (userId) => {
    Alert.alert(
      "Delete User",
      "Are you sure you want to delete this user?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteUser(userId) }
      ]
    );
  };

  const deleteUser = async (userId) => {
    try {
      await deleteDoc(doc(db, "users", userId));
      Alert.alert("🗑 Deleted", "User removed successfully.");
    } catch {
      Alert.alert("❌ Error", "Could not delete user.");
    }
  };

  const renderUserItem = ({ item }) => (
    <View style={styles.userCard}>
      <TouchableOpacity onPress={() => callNumber(item.mobile)}>
        <Text style={styles.userText}>
          {item.name} ({item.mobile || 'No phone'}) - {item.role || 'user'} | 
          {item.membershipStatus ? ` ${item.membershipStatus}` : ' no membership'}
        </Text>
      </TouchableOpacity>

      <View style={styles.actionRow}>
        {item.membershipStatus === 'pending' && (
          <>
            <Button title="Activate" color="#27ae60" onPress={() => activateMembership(item.id)} />
            <Button title="Cancel" color="#e74c3c" onPress={() => cancelMembership(item.id)} />
          </>
        )}
        {activeTab === 'members' && item.membershipStatus === 'active' && (
          <Button title="Cancel" color="#e74c3c" onPress={() => cancelMembership(item.id)} />
        )}
        {item.role !== 'admin' && (
          <Button title="Delete" color="darkred" onPress={() => confirmDeleteUser(item.id)} />
        )}
      </View>
    </View>
  );

  const filteredUsers = () => {
    if (activeTab === 'members') {
      return users.filter(u => u.membershipStatus === 'active');
    }
    return users;
  };

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            All Users ({users.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'members' && styles.activeTab]}
          onPress={() => setActiveTab('members')}
        >
          <Text style={[styles.tabText, activeTab === 'members' && styles.activeTabText]}>
            Members ({users.filter(u => u.membershipStatus === 'active').length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      {filteredUsers().length > 0 ? (
        <FlatList
          data={filteredUsers()}
          keyExtractor={(item) => item.id}
          renderItem={renderUserItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      ) : (
        <Text style={styles.noData}>No users found</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#004d26', padding: 10 },
  tabs: {
    flexDirection: 'row',
    marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  activeTab: { backgroundColor: '#1E90FF' },
  tabText: { fontSize: 16, color: '#FFD700' },
  activeTabText: { color: '#fff', fontWeight: 'bold' },
  userCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFD700',
    padding: 10,
    marginBottom: 10,
  },
  userText: { fontSize: 16, color: '#fff' },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  noData: { textAlign: 'center', marginTop: 20, fontSize: 16, color: '#FFD700' },
});
