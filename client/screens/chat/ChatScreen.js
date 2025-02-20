import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  TextInput,
  Button,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { collection, getDocs, getDoc, addDoc, serverTimestamp, doc } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, auth } from "../../firebase";
import { useNavigation, useRoute } from "@react-navigation/native"; // Import useRoute
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChatScreen() {
  const [availableChats, setAvailableChats] = useState([]);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [groupName, setGroupName] = useState("");
  const [groupImage, setGroupImage] = useState(null);
  const [groupDescription, setGroupDescription] = useState(""); // Add description state
  const navigation = useNavigation();
  const route = useRoute(); // Access the route object

  // Use route.params to control modal visibility
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchUsersAndGroups = async () => {
      try {
        // Fetch users
        const usersSnapshot = await getDocs(collection(db, "users"));
        const usersList = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().firstName || "Unknown",
          photo: doc.data().profileImage || "https://png.pngtree.com/png-vector/20191110/ourmid/pngtree-avatar-icon-profile-icon-member-login-vector-isolated-png-image_1978396.jpg",
        }));

        // Fetch groups
        const groupsSnapshot = await getDocs(collection(db, "groups"));
        const groupsList = groupsSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          photo: doc.data().photo || "https://www.svgrepo.com/show/382106/group-users.svg",
          members: doc.data().members,
        }));

        setAvailableChats(usersList);
        setAvailableGroups(groupsList);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchUsersAndGroups();
  }, []);
  
  useEffect(() => {
    const fetchUserGroups = async () => {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      setUserGroups(userDoc.data().groups || []);
    };
    fetchUserGroups();
  }, []);

  const checkPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access media library is required!');
    }
  };
  
  useEffect(() => {
    checkPermission();
  }, []);

  // Function to upload image to Firebase Storage
  const uploadImage = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const storageRef = ref(getStorage(), `group_images/${new Date().toISOString()}`);
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  };

  // Function to handle image picking and uploading
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Updated to use MediaType
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      const downloadURL = await uploadImage(imageUri);

      if (downloadURL) {
        setGroupImage(downloadURL); // Set the group image URL
      }
    }
  };

  const createGroup = async () => {
    try {
      // Set default image if none is provided
      const defaultImageUrl = "https://firebasestorage.googleapis.com/v0/b/chefster-e2086.firebasestorage.app/o/group_images%2Fgroup.png?alt=media&token=6b4585ce-aaa8-4ebd-a6b4-1ce8c9d7f5fa";
      const imageToSave = groupImage || defaultImageUrl;
  
      // Add the group to Firestore
      const groupRef = await addDoc(collection(db, "groups"), {
        name: groupName,
        description: groupDescription,
        createdAt: serverTimestamp(),
        members: [auth.currentUser.uid], // Assuming the current user is the first member
        photo: imageToSave, // Ensure an image is always saved
      });
  
      console.log("Group created successfully:", groupRef.id);
  
      // Close the modal and refresh groups list
      setModalVisible(false);
      setGroupName(""); // Clear the input fields
      setGroupDescription("");
      setGroupImage(null);
  
      // Fetch the updated list of groups
      const groupsSnapshot = await getDocs(collection(db, "groups"));
      const groupsList = groupsSnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        photo: doc.data().photo, // No need for fallback since it's already saved correctly
        members: doc.data().members,
      }));
  
      setAvailableGroups(groupsList); // Update the groups list with the new group
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };
  
  

  const openChat = (user) => {
    navigation.navigate("ChatDetail", { selectedUser: user });
  };

  const openGroupChat = (group) => {
    navigation.navigate("GroupChat", { group });
  };

  // Update modal visibility when route.params changes
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        if (activeTab === "groups") {
          return (
            <TouchableOpacity
              style={{ marginRight: 16 }}
              onPress={() => setModalVisible(true)} // Open the modal when the button is pressed
            >
              <Icon name="add" size={24} color="black" />
            </TouchableOpacity>
          );
        }
        return null;
      },
    });
  }, [activeTab, navigation]);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate("MainTabs", { screen: "Home" })}
          style={{ marginLeft: 16 }}
        >
          <Icon name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      ),
      title: "Chat Screen",
    });
  }, [navigation]);


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
      <TouchableOpacity
      style={styles.backButton} onPress={() => navigation.goBack()}>
      <Icon name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chats</Text>
      </View>

      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "all" && styles.activeTab]}
          onPress={() => setActiveTab("all")}
        >
          <Text style={activeTab === "all" ? styles.activeTabText : styles.tabText}>
            All Chats
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "personal" && styles.activeTab]}
          onPress={() => setActiveTab("personal")}
        >
          <Text style={activeTab === "personal" ? styles.activeTabText : styles.tabText}>
            Personal
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "groups" && styles.activeTab]}
          onPress={() => setActiveTab("groups")}
        >
          <Text style={activeTab === "groups" ? styles.activeTabText : styles.tabText}>
            Groups
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "groups" ? (
        <FlatList
          data={availableGroups.filter(group => group.members?.includes(auth.currentUser.uid))} // Show only groups where user is a member
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.chatItem} onPress={() => openGroupChat(item)}>
              <Image source={{ uri: item.photo }} style={styles.profilePhoto} />
              <Text style={styles.chatName}>{item.name}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>You are not a member of any group</Text>}
        />
      ) : activeTab === "personal" ? (
        <FlatList
          data={availableChats} // Only show user chats
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.chatItem} onPress={() => openChat(item)}>
              <Image source={{ uri: item.photo }} style={styles.profilePhoto} />
              <Text style={styles.chatName}>{item.name}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No personal chats available</Text>}
        />
      ) : (
        <FlatList
          data={[...availableChats, ...availableGroups.filter(group => group.members?.includes(auth.currentUser.uid))]} // Only include groups where user is a member
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.chatItem} 
              onPress={() => item.members ? openGroupChat(item) : openChat(item)} 
            >
              <Image   
                source={{ uri: item.photo }} 
                 style={styles.profilePhoto} />
              <Text style={styles.chatName}>{item.name}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No active chats</Text>}
        />
      )}

      <TouchableOpacity 
        style={styles.browseButton}
        onPress={() => navigation.navigate('BrowseGroups')}
      >
        <Text style={styles.browseButtonText}>Browse Groups</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
          <TextInput
            placeholder="Group Name"
            value={groupName}
            onChangeText={setGroupName}
            style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingLeft: 10 }}
          />
          <TextInput
            placeholder="Group Description"
            value={groupDescription}
            onChangeText={setGroupDescription}
            style={{ height: 80, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingLeft: 10, textAlignVertical: 'top' }}
            multiline
          />
          <Button title="Pick Group Image" onPress={pickImage} />
          {groupImage && <Image source={{ uri: groupImage }} style={styles.selectedImage} />}
          <Button title="Create Group" onPress={createGroup} />
          <Button title="Close" onPress={() => setModalVisible(false)} />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  tabButton: {
    paddingVertical: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "blue",
  },
  tabText: {
    fontSize: 16,
    color: "gray",
  },
  activeTabText: {
    fontSize: 16,
    color: "blue",
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  profilePhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  chatName: {
    fontSize: 16,
    color: "black",
  },
  emptyText: {
    textAlign: "center",
    color: "gray",
    marginTop: 20,
  },
  groupIcon: {
    marginRight: 10,
  },
  browseButton: {
    backgroundColor: "#1E90FF",
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 20,
    marginBottom:20,
  },
  browseButtonText: {
    color: "white",
    textAlign: "center",
  },
  selectedImage: {
    width: 100,
    height: 100,
    marginVertical: 10,
    borderRadius: 10,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    height: 60,  // Increase the height to make it thicker
    paddingVertical: 20, // Alternative: Add vertical padding instead of height
  },
  backButton: {
    marginRight: 16,
  }
});