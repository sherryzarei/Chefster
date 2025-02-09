import React, { useState, useEffect } from "react";
import { View, Image, TouchableOpacity, StyleSheet, Text } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "../../../firebase"; // Ensure correct Firebase import


const UploadImage = () => {
  const [image, setImage] = useState("");
  const [progress, setProgress] = useState(0);

  // Load user's profile image from Firestore when they log in
  useEffect(() => {
    async function fetchProfileImage() {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setImage(userSnap.data().profileImage || ""); // Load saved image
        }
      }
    }
    fetchProfileImage();
  }, []);

  // Image Picker function
  async function pickImage() {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Square aspect for profile picture
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      await uploadImage(result.assets[0].uri);
    }
  }

  // Upload and save profile image
  async function uploadImage(uri) {
    const user = auth.currentUser;
    if (!user) {
      console.error("No user is logged in!");
      return;
    }

    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(storage, `avatar/${user.uid}.jpg`); // Store by UID
    const uploadTask = uploadBytesResumable(storageRef, blob);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`Upload is ${progress}% done`);
        setProgress(progress.toFixed());
      },
      (error) => {
        console.error("Upload failed", error);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        console.log("File available at", downloadURL);
        setImage(downloadURL); // Update UI
        await saveProfileImage(downloadURL); // Store in Firestore
      }
    );
  }

  // Save image URL to Firestore under user's document
  async function saveProfileImage(url) {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error("No user logged in!");
        return;
      }

      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, { profileImage: url }, { merge: true });

      console.log("Profile image URL saved to Firestore");
    } catch (error) {
      console.error("Error saving profile image:", error);
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage} style={styles.profileContainer}>
        {image ? (
          <Image source={{ uri: image }} style={styles.profileImage} />
        ) : (
          <Text style={styles.placeholderText}>Pick Image</Text>
        )}
      </TouchableOpacity>
      {progress > 0 && progress < 100 && <Text>Uploading: {progress}%</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  profileContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#888",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  placeholderText: {
    color: "#555",
    fontSize: 16,
  },
});

export default UploadImage;
