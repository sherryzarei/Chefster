import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from "react-native";
import { auth, db } from "../../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import Toast from "react-native-toast-message";

const PostInput = ({ onPostSuccess }) => {
  const [postText, setPostText] = useState("");

  const handlePost = async () => {
    if (!postText.trim()) {
      Toast.show({
        type: "error",
        text1: "Empty Post",
        text2: "Please write something before posting.",
      });
      return;
    }

    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error("User not authenticated");

      const postsRef = collection(db, "users", userId, "posts");
      await addDoc(postsRef, {
        text: postText,
        createdAt: Timestamp.now(),
        userId,
        likes: 0,
        comments: [],
      });

      setPostText(""); // Clear input after posting
      onPostSuccess(); // Refresh posts after new one is added
      Toast.show({
        type: "success",
        text1: "Post Created",
        text2: "Your post has been successfully added.",
      });
    } catch (error) {
      console.error("Error posting:", error);
      Toast.show({
        type: "error",
        text1: "Post Failed",
        text2: "Could not add your post. Try again later.",
      });
    }
  };

  return (
    <View style={styles.postContainer}>
      <TextInput
        style={styles.postInput}
        placeholder="Write a post..."
        value={postText}
        onChangeText={setPostText}
        multiline
      />
      <TouchableOpacity style={styles.postButton} onPress={handlePost}>
        <Text style={styles.buttonText}>Post</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PostInput;

const styles = StyleSheet.create({
  postContainer: {
    width: "100%",
    padding: 20,
  },
  postInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    width: "100%",
    minHeight: 100,
    textAlignVertical: "top",

  },
  postButton: {
    backgroundColor: "#0782F9",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
});