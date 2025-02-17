import React, { useState } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { AntDesign } from "@expo/vector-icons";

export default function UploadImage({ onImageSelect }) {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const selectImage = async (source) => {
    try {
      let result = null;

      if (source === "camera") {
        result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });
      } else if (source === "gallery") {
        result = await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });
      }

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        console.log("Selected image URI:", uri);
        setImage(uri);
        if (onImageSelect) {
          onImageSelect(uri);
        } else {
          console.warn("⚠️ onImageSelect function is not provided in parent.");
        }
      }
    } catch (error) {
      console.error("Image selection failed:", error);
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      "Choose an option",
      "Would you like to take a photo or upload one from your gallery?",
      [
        { text: "Camera", onPress: () => selectImage("camera") },
        { text: "Gallery", onPress: () => selectImage("gallery") },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {image ? (
        <Image source={{ uri: image }} style={styles.image} />
      ) : (
        <View style={styles.placeholder} />
      )}
      <View style={styles.uploadBtnContainer}>
        <TouchableOpacity onPress={showImagePickerOptions} style={styles.uploadBtn}>
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Text style={styles.uploadText}>
                {image ? "Change" : "Upload"} Image
              </Text>
              <AntDesign name="camera" size={20} color="white" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    elevation: 2,
    height: 200,
    width: 200,
    backgroundColor: "#efefef",
    borderRadius: 999,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 999,
  },
  placeholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#d3d3d3",
  },
  uploadBtnContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: "25%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadText: {
    color: "white",
    fontSize: 14,
    marginRight: 5,
  },
});