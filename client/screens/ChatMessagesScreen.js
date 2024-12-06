import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  KeyboardAvoidingView,
  TextInput,
  Pressable,
  Image,
} from "react-native";
import React, {
  useState,
  useContext,
  useLayoutEffect,
  useEffect,
  useRef,
} from "react";
import { Feather } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import EmojiSelector from "react-native-emoji-selector";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { decode as atob } from "base-64";

if (typeof global.atob === "undefined") {
  global.atob = atob;
}

const ChatMessagesScreen = () => {
  const [showEmojiSelector, setShowEmojiSelector] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [messages, setMessages] = useState([]);
  const [recepientData, setRecepientData] = useState();
  const [selectedImage, setSelectedImage] = useState("");
  const [message, setMessage] = useState("");
  const scrollViewRef = useRef(null);

  const navigation = useNavigation();
  const route = useRoute();
  const { recepientId } = route.params; // Access recepientId passed via navigation

  useEffect(() => {
    scrollToBottom();
  }, []);

  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: false });
    }
  };

  const handleContentSizeChange = () => {
    scrollToBottom();
  };

  const handleEmojiPress = () => {
    setShowEmojiSelector(!showEmojiSelector);
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `http://192.168.0.132:8100/messages/${userId}/${recepientId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();

      if (response.ok) {
        setMessages(data);
      } else {
        console.log("Error fetching messages:", response.status.message);
      }
    } catch (error) {
      console.log("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    const fetchRecepientData = async () => {
      try {
        const response = await fetch(
          `http://192.168.0.132:8100/user/${recepientId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();
        setRecepientData(data);
      } catch (error) {
        console.log("Error retrieving recepient details:", error);
      }
    };

    fetchRecepientData();
  }, []);

  const handleSend = async (messageType, imageUri) => {
    try {
      const formData = new FormData();
      formData.append("senderId", userId);
      formData.append("recepientId", recepientId);

      if (messageType === "image") {
        formData.append("messageType", "image");
        formData.append("imageFile", {
          uri: imageUri,
          name: "image.jpg",
          type: "image/jpeg",
        });
      } else {
        formData.append("messageType", "text");
        formData.append("messageText", message);
      }

      const response = await fetch("http://192.168.0.132:8100/messages", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        setMessage("");
        setSelectedImage("");
        fetchMessages();
      }
    } catch (error) {
      console.log("Error sending message:", error);
    }
  };

  const deleteMessages = async (messageIds) => {
    try {
      const response = await fetch("http://192.168.0.132:8100/deleteMessages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messages: messageIds }),
      });

      if (response.ok) {
        setSelectedMessages((prevSelectedMessages) =>
          prevSelectedMessages.filter((id) => !messageIds.includes(id))
        );

        fetchMessages();
      } else {
        console.log("Error deleting messages:", response.status);
      }
    } catch (error) {
      console.log("Error deleting messages:", error);
    }
  };

  const formatTime = (time) => {
    const options = { hour: "numeric", minute: "numeric" };
    return new Date(time).toLocaleString("en-US", options);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      handleSend("image", result.uri);
    }
  };

  const handleSelectMessage = (message) => {
    const isSelected = selectedMessages.includes(message._id);

    if (isSelected) {
      setSelectedMessages((prevMessages) =>
        prevMessages.filter((id) => id !== message._id)
      );
    } else {
      setSelectedMessages((prevMessages) => [...prevMessages, message._id]);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "#F0F0F0" }}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={{ flexGrow: 1 }}
        onContentSizeChange={handleContentSizeChange}
      >
        {messages.map((item, index) => (
          <Pressable
            key={index}
            onLongPress={() => handleSelectMessage(item)}
            style={[
              item.senderId === userId
                ? styles.messageSent
                : styles.messageReceived,
              selectedMessages.includes(item._id) && styles.messageSelected,
            ]}
          >
            <Text>{item.message}</Text>
            <Text style={styles.messageTime}>{formatTime(item.timeStamp)}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <Entypo
          onPress={handleEmojiPress}
          name="emoji-happy"
          size={24}
          color="gray"
        />
        <TextInput
          value={message}
          onChangeText={setMessage}
          style={styles.input}
          placeholder="Type a message..."
        />
        <Entypo onPress={pickImage} name="camera" size={24} color="gray" />
        <Pressable onPress={() => handleSend("text")} style={styles.sendButton}>
          <Text style={styles.sendButtonText}>Send</Text>
        </Pressable>
      </View>

      {showEmojiSelector && (
        <EmojiSelector
          onEmojiSelected={(emoji) => setMessage((prev) => prev + emoji)}
          style={{ height: 250 }}
        />
      )}
    </KeyboardAvoidingView>
  );
};

export default ChatMessagesScreen;

const styles = StyleSheet.create({
  messageSent: {
    alignSelf: "flex-end",
    backgroundColor: "#DCF8C6",
    padding: 8,
    margin: 10,
    borderRadius: 7,
  },
  messageReceived: {
    alignSelf: "flex-start",
    backgroundColor: "white",
    padding: 8,
    margin: 10,
    borderRadius: 7,
  },
  messageSelected: {
    backgroundColor: "#F0FFFF",
  },
  messageTime: {
    textAlign: "right",
    fontSize: 9,
    color: "gray",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    padding: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 10,
    height: 40,
  },
  sendButton: {
    backgroundColor: "#007bff",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  sendButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
