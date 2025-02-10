import React, { useState, useEffect } from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Image, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { auth, db, storage } from "../../firebase";
import { collection, addDoc, Timestamp, doc, getDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import Toast from "react-native-toast-message";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Video } from "expo-av";

const PostInput = ({ onPostSuccess }) => {
  const [postText, setPostText] = useState("");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [media, setMedia] = useState(null);
  const [uploading, setUploading] = useState(false);

  const userId = auth.currentUser?.uid;

  // Fetch user data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;
      try {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  // Image/Video Picker function
  async function pickMedia() {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setMedia(result.assets[0]); // Store media URI and type
    }
  }

  // Upload media file to Firebase Storage
  async function uploadMedia(uri, fileType) {
    setUploading(true);
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileName = `${userId}_${Date.now()}.${fileType === "video" ? "mp4" : "jpg"}`;
      const storageRef = ref(storage, `posts/${fileName}`);
      const uploadTask = uploadBytesResumable(storageRef, blob);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Upload is ${progress.toFixed()}% done`);
          },
          (error) => {
            console.error("Upload failed", error);
            setUploading(false);
            reject(error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setUploading(false);
            resolve(downloadURL);
          }
        );
      });
    } catch (error) {
      console.error("Error uploading media:", error);
      setUploading(false);
      return null;
    }
  }

  // Handle Post Creation
  const handlePost = async () => {
    if (!postText.trim() && !media) {
      Toast.show({
        type: "error",
        text1: "Empty Post",
        text2: "Write something or upload media before posting.",
      });
      return;
    }

    setUploading(true);

    try {
      let mediaUrl = null;
      let mediaType = null;

      if (media) {
        mediaType = media.type;
        mediaUrl = await uploadMedia(media.uri, mediaType);
      }

      if (!userId) throw new Error("User not authenticated");

      const postsRef = collection(db, "users", userId, "posts");
      await addDoc(postsRef, {
        text: postText,
        mediaUrl,
        mediaType,
        createdAt: Timestamp.now(),
        userId,
        likes: 0,
        comments: [],
      });

      // Reset input fields
      setPostText("");
      setMedia(null);
      onPostSuccess();
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
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#0782F9" style={{ flex: 1 }} />;

  return (
    <View style={styles.postContainer}>
      {/* User Info - Profile Image & Name */}
      <View style={styles.userInfo}>
        <Image
          source={{ uri: userData?.profileImage }}
          resizeMode="cover"
          style={styles.profileImage}
        />
        <Text style={styles.userName}>
          {userData?.firstName} {userData?.lastName}
        </Text>
      </View>

      {/* Post Input */}
      <TextInput
        style={styles.postInput}
        placeholder="Write something..."
        value={postText}
        onChangeText={setPostText}
        multiline
      />

      {/* Display Selected Media */}
      {media && (
        <View style={styles.previewContainer}>
          {media.type === "image" ? (
            <Image source={{ uri: media.uri }} style={styles.previewImage} />
          ) : (
            <Video
              source={{ uri: media.uri }}
              style={styles.previewVideo}
              useNativeControls
              resizeMode="contain"
            />
          )}
        </View>
      )}

      {/* Icons for Adding Media */}
      <View style={styles.bottomRightIcons}>
        <TouchableOpacity style={styles.iconSpacing} onPress={pickMedia}>
          <Icon name="photo-library" size={24} color="#3CB371" />
        </TouchableOpacity>
      </View>

      {/* Post Button */}
      <TouchableOpacity style={styles.postButton} onPress={handlePost} disabled={uploading}>
        {uploading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Post</Text>}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  postContainer: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 3,
    margin: 10,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "white",
  },
  userName: {
    marginLeft: 7,
    fontSize: 14,
    fontWeight: "bold",
  },
  postInput: {
    height: 80,
    borderColor: "#ccc",
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  previewContainer: {
    marginBottom: 10,
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
  },
  previewVideo: {
    width: "100%",
    height: 200,
  },
  bottomRightIcons: {
    flexDirection: "row",
    marginBottom: 10,
  },
  iconSpacing: {
    marginRight: 10,
  },
  postButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default PostInput;
