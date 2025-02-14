import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  Alert,
  Modal,
} from "react-native";
import { io } from "socket.io-client";
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import app from "../../src/firebase-config";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons"; // For icons
import * as ImagePicker from "expo-image-picker"; // For image picking
import AsyncStorage from "@react-native-async-storage/async-storage"; // For storing blocked status

const db = getFirestore(app);
const auth = getAuth();
const storage = getStorage(app); // Initialize Firebase Storage
const socket = io("http://localhost:6000");

const ChatDetail = ({ route }) => {
  const { selectedUser } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const flatListRef = useRef(null);

  const [menuVisible, setMenuVisible] = useState(false); // For three-dots menu
  const [isMuted, setIsMuted] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedMessages, setHighlightedMessages] = useState([]);
  const [isSearchBarVisible, setIsSearchBarVisible] = useState(false);

  const navigation = useNavigation();

  // Request permission to access the camera roll
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Sorry, we need camera roll permissions to upload images.");
      }
    })();
  }, []);

  // Scroll to bottom function
  const scrollToBottom = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  // Back button handler
  const handleBack = () => {
    navigation.goBack();
  };

  // Three-dots menu handler
  const toggleMenu = () => setMenuVisible(!menuVisible);

  // Block user handler
  const handleBlock = () => {
    if (isBlocked) {
      Alert.alert(
        "Unblock User",
        "Are you sure you want to unblock this user?",
        [
          {
            text: "Cancel",
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel",
          },
          {
            text: "Unblock",
            onPress: () => {
              setIsBlocked(false);
              setMenuVisible(false);
            },
          },
        ],
        { cancelable: false }
      );
    } else {
      Alert.alert(
        "Block User",
        "Are you sure you want to block this user?",
        [
          {
            text: "Cancel",
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel",
          },
          {
            text: "Block",
            onPress: () => {
              setIsBlocked(true);
              setMenuVisible(false);
            },
          },
        ],
        { cancelable: false }
      );
    }
  };

  // Delete chat handler
  const handleDeleteChat = async () => {
    Alert.alert(
      "Delete Chat",
      "Are you sure you want to delete the entire chat?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              // Delete all messages between the current user and the selected user
              const userIds = [auth.currentUser.uid, selectedUser.id];
              const q = query(
                collection(db, "privateMessages"),
                where("senderId", "in", userIds),
                where("receiverId", "in", userIds)
              );
              const querySnapshot = await getDocs(q);
              querySnapshot.forEach(async (doc) => {
                await deleteDoc(doc.ref);
              });

              // Clear local messages
              setMessages([]);
              setMenuVisible(false);
              console.log("Chat deleted");
            } catch (error) {
              console.error("Error deleting chat:", error);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  // Search handler
  const handleSearch = () => {
    setIsSearchBarVisible(true);
    setMenuVisible(false);
  };

  // Close search bar handler
  const closeSearchBar = () => {
    setIsSearchBarVisible(false);
    setSearchQuery("");
    setHighlightedMessages([]);
  };

  // Highlight matching text in messages
  const highlightText = (text) => {
    if (!searchQuery) return <Text>{text}</Text>;

    const regex = new RegExp(`(${searchQuery})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <Text key={index} style={{ backgroundColor: "yellow" }}>
          {part}
        </Text>
      ) : (
        <Text key={index}>{part}</Text>
      )
    );
  };

  // Upload image to Firebase Storage
  const uploadImage = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const storageRef = ref(storage, `chat_images/${new Date().toISOString()}`);
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  };

  // Handle image selection
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      const downloadURL = await uploadImage(imageUri);

      if (downloadURL) {
        const messageData = {
          senderId: auth.currentUser.uid,
          receiverId: selectedUser.id,
          imageUrl: downloadURL,
          created_at: serverTimestamp(),
        };

        try {
          const docRef = await addDoc(collection(db, "privateMessages"), messageData);
          setMessages((prevMessages) => [
            ...prevMessages,
            { ...messageData, id: docRef.id, created_at: new Date() },
          ]);
          socket.emit("sendMessage", {
            ...messageData,
            created_at: new Date(),
          });
        } catch (error) {
          console.error("Error sending image:", error);
        }
      }
    }
  };

  // Render message content (text or image)
  const renderMessageContent = (item) => {
    if (item.imageUrl) {
      return <Image source={{ uri: item.imageUrl }} style={styles.imageMessage} />;
    } else {
      return <Text style={styles.message}>{highlightText(item.message)}</Text>;
    }
  };

  useEffect(() => {
    if (searchQuery) {
      const matches = messages.filter((message) =>
        message.message?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setHighlightedMessages(matches);
    } else {
      setHighlightedMessages([]);
    }
  }, [searchQuery, messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!auth.currentUser || !selectedUser) return;

    const userIds = [auth.currentUser.uid, selectedUser.id];
    const q = query(
      collection(db, "privateMessages"),
      where("senderId", "in", userIds),
      where("receiverId", "in", userIds),
      orderBy("created_at", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const validMessages = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          senderId: data.senderId,
          receiverId: data.receiverId,
          message: data.message,
          imageUrl: data.imageUrl,
          created_at: data.created_at instanceof Date ? data.created_at : data.created_at?.toDate?.() || new Date(),
        };
      });
      setMessages(validMessages);
    });

    return () => unsubscribe();
  }, [selectedUser]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageData = {
      senderId: auth.currentUser.uid,
      receiverId: selectedUser.id,
      message: newMessage,
      created_at: serverTimestamp(),
    };

    try {
      const docRef = await addDoc(collection(db, "privateMessages"), messageData);
      setMessages((prevMessages) => [
        ...prevMessages,
        { ...messageData, id: docRef.id, created_at: new Date() },
      ]);
      socket.emit("sendMessage", { ...messageData, created_at: new Date() });
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  const navigateToProfile = () => {
    navigation.navigate("Profile", { selectedUser }); // Navigate to ProfileScreen
  };

  const shareMusicLink = async () => {
    const musicLink = prompt("Enter the music link (e.g., Spotify, YouTube):");
    if (musicLink) {
      const messageData = {
        senderId: auth.currentUser.uid,
        receiverId: selectedUser.id,
        type: "music", // Indicates this is a music message
        musicUrl: musicLink,
        created_at: serverTimestamp(),
      };
  
      try {
        const docRef = await addDoc(collection(db, "privateMessages"), messageData);
        setMessages((prevMessages) => [
          ...prevMessages,
          { ...messageData, id: docRef.id, created_at: new Date() },
        ]);
        socket.emit("sendMessage", {
          ...messageData,
          created_at: new Date(),
        });
      } catch (error) {
        console.error("Error sharing music link:", error);
      }
    }
  };


  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.inner}>
        {/* Header with Back Button and Three-Dots Menu */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>{"<"}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={navigateToProfile} style={styles.userInfo}>
            <Image source={{ uri: selectedUser.photo }} style={styles.profilePhoto} />
            <Text style={styles.header}>
              {isBlocked ? "Deleted Account" : selectedUser.name}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
            <Ionicons name="ellipsis-vertical" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Three-Dots Menu Modal */}
        <Modal
          visible={menuVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setMenuVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
            <View style={styles.menuOverlay}>
              <View style={styles.menuContainer}>
                <TouchableOpacity onPress={handleBlock} style={styles.menuItem}>
                  <Text style={styles.menuText}>{isBlocked ? "Unblock User" : "Block User"}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSearch} style={styles.menuItem}>
                  <Text style={styles.menuText}>Search</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDeleteChat} style={styles.menuItem}>
                  <Text style={styles.menuText}>Delete Chat</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Search Bar */}
        {isSearchBarVisible && (
          <View style={styles.searchBarContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search messages..."
              placeholderTextColor="#AAA"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity onPress={closeSearchBar}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
        )}

        {/* Chat Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageContainer,
                {
                  alignSelf: item.senderId === auth.currentUser.uid ? "flex-end" : "flex-start",
                  backgroundColor: item.senderId === auth.currentUser.uid ? "#A0E3FF" : "#E0E0E0",
                },
              ]}
            >
              {renderMessageContent(item)}
            </View>
          )}
          onContentSizeChange={scrollToBottom}
          onLayout={scrollToBottom}
        />

        {/* Message Input and Image Picker */}
        <View style={styles.inputContainer}>
        <TouchableOpacity onPress={shareMusicLink} style={styles.musicButton}>
          <Ionicons name="musical-notes" size={24} color="#333" />
        </TouchableOpacity>
          <TouchableOpacity onPress={pickImage} style={styles.imagePickerButton}>
            <Ionicons name="image" size={24} color="#333" />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message"
            placeholderTextColor="#AAA"
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  inner: {
    paddingTop: 20,
    flex: 1,
    justifyContent: "space-between",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
    marginTop: 10,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  profilePhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center", 

  },
  menuButton: {
    paddingRight: 10
  },
  messageContainer: {
    maxWidth: "80%",
    padding: 10,
    marginBottom: 10,
    borderRadius: 15,
    backgroundColor: "#f1f1f1",
  },
  message: {
    fontSize: 16,
    color: "#333",
  },
  imageMessage: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 20,
    paddingLeft: 10,
    flex: 1,
    marginRight: 10,
  },
  imagePickerButton: {
    marginRight: 10,
  },
  menuOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  menuContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
    width: 200,
  },
  menuItem: {
    padding: 10,
    marginRight: 10
  },
  menuText: {
    fontSize: 16,
    color: "#333",
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#f1f1f1",
    borderRadius: 20,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    paddingLeft: 10,
  },
  backButton: {
    marginRight: 15,
    padding: 5,
    marginLeft: 10
  },
  backButtonText: {
    fontSize: 24,
    color: "#0088cc",
  },
  sendButton: {
    marginLeft: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#0088cc",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 16,
  }
});

export default ChatDetail;