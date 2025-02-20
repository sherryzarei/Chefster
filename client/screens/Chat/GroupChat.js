import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, doc, getDoc } from "firebase/firestore";
import { db, auth, storage } from "../../src/firebase-config";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

export default function GroupChat({ route, navigation }) {
  const { group } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const flatListRef = useRef(null)


  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  // Debugging: Log the group object and photo URL
  useEffect(() => {
    console.log("Group Object:", group);
    console.log("Group Photo URL:", group.photo);
  }, [group]);

  useEffect(() => {
    const messagesQuery = query(
      collection(db, "groups", group.id, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(messagesList);
    });

    return () => unsubscribe();
  }, [group]);

  const extractLinks = (text) => {
    const regex = /https?:\/\/[^\s]+/g;
    return text.match(regex) || [];
  };
  

  const sendMessage = async () => {
    if (newMessage.trim()) {
      try {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          console.error("User document does not exist!");
          return;
        }

        const userData = userDoc.data();
        const links = extractLinks(newMessage); // Extract any links from the message text

        await addDoc(collection(db, "groups", group.id, "messages"), {
          text: newMessage,
          senderId: auth.currentUser.uid,
          senderName: userData.firstName,
          senderPhoto: userData.profileImage,
          createdAt: serverTimestamp(),
          links: links,
        });

        setNewMessage("");
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      const imageName = `images/${Date.now()}.jpg`;

      const imageRef = ref(storage, imageName);
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const uploadTask = uploadBytesResumable(imageRef, blob);

      uploadTask.on(
        "state_changed",
        (snapshot) => {},
        (error) => {
          console.error("Error uploading image:", error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          const userDocRef = doc(db, "users", auth.currentUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (!userDoc.exists()) {
            console.error("User document does not exist!");
            return;
          }

          const userData = userDoc.data();

          const messageData = {
            senderId: auth.currentUser.uid,
            senderName: userData.firstName,
            senderPhoto: userData.profileImage,
            imageUrl: downloadURL,
            createdAt: serverTimestamp(),
          };

          try {
            await addDoc(collection(db, "groups", group.id, "messages"), messageData);
          } catch (error) {
            console.error("Error sending image:", error);
          }
        }
      );
    }
  };

  const navigateToGroupProfile = () => {
    navigation.navigate("GroupProfile", { selectedGroup: group });
  };

  return (
    <View style={styles.container}>
      {/* Header with Back Button and Group Info */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{"<"}</Text>
        </TouchableOpacity>

        <View style={styles.groupInfo}>
          <TouchableOpacity onPress={navigateToGroupProfile} style={styles.userInfo}>
            <Image
              source={{ uri: group.photo }}
              style={styles.profilePhoto}
              onError={(error) => console.error("Failed to load group photo:", error)}
            />
          <View style={styles.groupTextContainer}>
            <Text style={styles.groupName}>{group.name}</Text>
            <Text style={styles.membersCount}>{group.members.length} members</Text>
          </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        renderItem={({ item }) => {
          const isSender = item.senderId === auth.currentUser.uid;

          return (
            <View
              style={[
                styles.messageWrapper,
                isSender ? styles.sentMessageWrapper : styles.receivedMessageWrapper,
              ]}
            >
              {!isSender && (
                <View style={styles.senderContainer}>
                  <Image source={{ uri: item.senderPhoto }} style={styles.senderPhoto} />
                  <View style={styles.senderDetails}>
                    <Text style={styles.senderName}>{item.senderName}</Text>
                    <View
                      style={[
                        styles.messageContainer,
                        isSender ? styles.sentMessage : styles.receivedMessage,
                      ]}
                    >
                      {item.text && <Text style={styles.messageText}>{item.text}</Text>}
                      {item.imageUrl && (
                        <Image source={{ uri: item.imageUrl }} style={styles.messageImage} />
                      )}
                    </View>
                  </View>
                </View>
              )}

              {isSender && (
                <View
                  style={[
                    styles.messageContainer,
                    styles.sentMessage,
                  ]}
                >
                  {item.text && <Text style={styles.messageText}>{item.text}</Text>}
                  {item.imageUrl && (
                    <Image source={{ uri: item.imageUrl }} style={styles.messageImage} />
                  )}
                </View>
              )}
            </View>
          );
        }}
      />

      {/* Input Section */}
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.musicButton}>
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
          placeholderTextColor="#999"
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6f7", paddingTop: 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  backButtonText: {
    fontSize: 24,
    color: "#0088cc",
  },
  groupInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  profilePhoto: {
    width: 40,
    height: 40,
    borderRadius: 20, 
    marginRight: 10,
  },
  groupTextContainer: {
    flexDirection: "column",
    justifyContent: "center",
  },
  groupName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  membersCount: {
    fontSize: 14,
    color: "#999",
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  messageWrapper: {
    marginVertical: 5,
  },
  sentMessageWrapper: {
    alignItems: "flex-end",
  },
  receivedMessageWrapper: {
    alignItems: "flex-start",
  },
  senderContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  senderPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  senderDetails: {
    maxWidth: "80%",
    marginLeft: 10,
  },
  senderName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  messageContainer: {
    padding: 10,
    borderRadius: 15,
    maxWidth: "100%",
    alignSelf: "flex-start",
    marginBottom: 3,
  },
  sentMessage: {
    backgroundColor: "#A0E3FF",
    alignSelf: "flex-end",
  },
  receivedMessage: {
    backgroundColor: "#E0E0E0",
  },
  messageText: {
    fontSize: 16,
    color: "#333",
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#f5f6f7",
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    fontSize: 16,
    color: "#333",
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
  },
});