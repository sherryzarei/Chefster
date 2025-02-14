import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy } from "firebase/firestore";
import { db, auth, storage } from "../../src/firebase-config"; // Make sure to import storage for Firebase Storage
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"; // Firebase Storage imports

export default function GroupChat({ route, navigation }) {
  const { group } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

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

  const sendMessage = async () => {
    if (newMessage.trim()) {
      try {
        await addDoc(collection(db, "groups", group.id, "messages"), {
          text: newMessage,
          senderId: auth.currentUser.uid,
          createdAt: serverTimestamp(),
        });
        setNewMessage("");
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  // Function to pick an image and upload it to Firebase Storage
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      const imageName = `images/${Date.now()}.jpg`; // Unique name for the image

      // Upload image to Firebase Storage
      const imageRef = ref(storage, imageName);
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const uploadTask = uploadBytesResumable(imageRef, blob);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // You can track progress here if needed
        },
        (error) => {
          console.error("Error uploading image:", error);
        },
        async () => {
          // Get the download URL after the upload is complete
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          // Send the image URL as a message to the group
          const messageData = {
            senderId: auth.currentUser.uid,
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
    navigation.navigate("GroupProfile", { group }); // Navigate to ProfileScreen
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
            <Image source={{ uri: group.photo }} style={styles.profilePhoto} />
            <Text style={styles.groupName}>{group.name}</Text>
            <Text style={styles.membersCount}>{group.members.length} members</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages List */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageContainer,
              item.senderId === auth.currentUser.uid
                ? styles.sentMessage
                : styles.receivedMessage,
            ]}
          >
            {item.text && <Text style={styles.messageText}>{item.text}</Text>}
            {item.imageUrl && (
              <Image source={{ uri: item.imageUrl }} style={styles.messageImage} />
            )}
          </View>
        )}
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
    fontSize: 24,
    fontWeight: "bold",
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
  groupProfilePhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
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
  messageContainer: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginVertical: 5,
    maxWidth: "80%",
    alignSelf: "flex-start",
  },
  sentMessage: {
    backgroundColor: "#0088cc",
    alignSelf: "flex-end",
  },
  receivedMessage: {
    backgroundColor: "#f1f1f1",
    alignSelf: "flex-start",
  },
  messageText: {
    fontSize: 16,
    color: "#fff",
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginTop: 10,
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
