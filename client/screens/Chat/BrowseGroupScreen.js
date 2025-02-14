import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { db, auth } from '../../src/firebase-config';
import { collection, getDocs, updateDoc, arrayUnion, arrayRemove, doc, getDoc } from 'firebase/firestore';

const BrowseGroupsScreen = ({ navigation }) => {
  const [allGroups, setAllGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userGroups, setUserGroups] = useState([]);

  useEffect(() => {
    const fetchGroups = async () => {
      const querySnapshot = await getDocs(collection(db, 'groups'));
      const currentUserId = auth.currentUser.uid;
  
      const groups = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(group => 
          !group.members?.includes(currentUserId) && // Exclude groups where user is a member
          group.createdBy !== currentUserId // Exclude groups created by user
        );
  
      setAllGroups(groups);
    };
  
    const fetchUserGroups = async () => {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        setUserGroups(userDoc.data().groups || []);
      }
    };
  
    fetchGroups();
    fetchUserGroups();
  }, []);
  

  const handleJoinGroup = async (groupId) => {
    try {
      await updateDoc(doc(db, 'groups', groupId), {
        members: arrayUnion(auth.currentUser.uid)
      });
      
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        groups: arrayUnion(groupId)
      });

      setUserGroups(prev => [...prev, groupId]);
      setAllGroups(prev => prev.filter(group => group.id !== groupId));

      // Navigate to ChatScreen (or update ChatScreen state if needed)
      navigation.navigate('ChatScreen', { showModal: false });
    } catch (error) {
      console.error("Error joining group:", error);
    }
  };

  const filteredGroups = allGroups.filter(group =>
    !userGroups.includes(group.id) &&
    (group.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search groups..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <FlatList
        data={filteredGroups}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.groupCard}>
            <Text style={styles.groupName}>{item.name}</Text>
            <Text style={styles.groupDescription}>{item.description}</Text>
            <Text>Members: {item.members?.length || 0}</Text>
            
            <TouchableOpacity 
              style={styles.joinButton}
              onPress={() => handleJoinGroup(item.id)}
            >
              <Text style={styles.buttonText}>Join</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  searchInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginBottom: 16
  },
  groupCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8
  },
  joinButton: {
    backgroundColor: '#2196F3',
    padding: 8,
    borderRadius: 4,
    marginTop: 8
  },
  buttonText: {
    color: 'white',
    textAlign: 'center'
  }
});

export default BrowseGroupsScreen;
