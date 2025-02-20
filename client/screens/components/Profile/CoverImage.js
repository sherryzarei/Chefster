import React, { useEffect, useState } from "react";
import { View, Image, TouchableOpacity, Text, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { auth, db } from "../../../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { MaterialIcons } from "@expo/vector-icons";

const CoverImage = () => {
  const DEFAULT_COVER_IMAGE = require("../../../assets/default_cover.jpg"); // Ensure this file exists in the correct directory

  const [coverImage, setCoverImage] = useState(DEFAULT_COVER_IMAGE);
  const [progress, setProgress] = useState(0);

  // Fetch the cover image from Firestore
  useEffect(() => {
    async function fetchCoverImage() {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setCoverImage(userSnap.data().coverImage || DEFAULT_COVER_IMAGE);
        }
      }
    }
    fetchCoverImage();
  }, []);

  // Function to select a new cover image
  async function pickCoverImage() {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.assets || result.assets.length === 0) {
      return;
    }

    setCoverImage(result.assets[0].uri);
    await uploadCoverImage(result.assets[0].uri);
  }

  // Function to upload cover image to Firebase Storage
  async function uploadCoverImage(uri) {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "No user is logged in!");
      return;
    }

    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const storage = getStorage();
      const storageRef = ref(storage, `cover_images/${user.uid}.jpg`);
      const uploadTask = uploadBytesResumable(storageRef, blob);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(Math.round(progress)); // Store as a number
        },
        (error) => {
          Alert.alert("Upload failed", error.message);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setCoverImage(downloadURL);
          await saveCoverImage(downloadURL);
        }
      );
    } catch (error) {
      Alert.alert("Error", "Failed to upload cover image.");
    }
  }

  // Function to save image URL to Firestore
  async function saveCoverImage(url) {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Error", "No user is logged in!");
        return;
      }

      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, { coverImage: url }, { merge: true });
    } catch (error) {
      Alert.alert("Error", "Failed to save cover image.");
    }
  }

  return (
    <TouchableOpacity onPress={pickCoverImage} activeOpacity={0.7} style={{ width: "100%", height: 228 }}>
      <Image
        source={typeof coverImage === "string" ? { uri: coverImage } : coverImage}
        style={{ width: "100%", height: 228 }}
      />
      <View
        style={{
          position: "absolute",
          bottom: 10,
          right: 10,
          backgroundColor: "rgba(0,0,0,0.5)",
          borderRadius: 20,
          padding: 5,
        }}
      >
        <MaterialIcons name="photo-camera" size={32} color="white" />
      </View>
    </TouchableOpacity>
  );
};

export default CoverImage;
