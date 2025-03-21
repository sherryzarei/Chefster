import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Video } from "expo-av";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase"; // Ensure correct import for Firebase

const screenWidth = Dimensions.get("window").width;

const Post = ({ post, onDelete }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!post.userId) return;
      try {
        const userDoc = await getDoc(doc(db, "users", post.userId));
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
  }, [post.userId]);

  if (loading) return <ActivityIndicator size="large" color="#0782F9" style={{ flex: 1 }} />;

  return (
    <View style={styles.post}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          <Image
            source={{ uri: userData?.profileImage || "https://via.placeholder.com/40" }}
            resizeMode="cover"
            style={styles.profileImage}
          />
          <Text style={styles.userName}>
            {userData?.firstName} {userData?.lastName}
          </Text>
        </View>
        <TouchableOpacity onPress={() => onDelete(post.id)}>
          <MaterialIcons name="delete" size={20} color="#D32F2F" />
        </TouchableOpacity>
      </View>

      {/* Post Text */}
      <Text style={styles.postText}>{post.text}</Text>

      {/* Display Media if Available */}
      {post.mediaUrl && (
        <View style={styles.mediaContainer}>
          {post.mediaType === "image" ? (
            <Image source={{ uri: post.mediaUrl }} style={styles.postImage} />
          ) : (
            <Video
              source={{ uri: post.mediaUrl }}
              style={styles.postVideo}
              useNativeControls
              resizeMode="contain"
            />
          )}
        </View>
      )}

      {/* Post Timestamp */}
      <Text style={styles.postDate}>
        {new Date(post.createdAt.seconds * 1000).toLocaleString()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  post: {
    width: screenWidth - 40,
    padding: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
    alignSelf: "center",
    elevation: 3,
    shadowColor: "#000",
    marginTop: 10,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
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
  postText: {
    fontSize: 16,
    color: "#333",
    marginTop: 10,
  },
  mediaContainer: {
    marginTop: 10,
    alignItems: "center",
  },
  postImage: {
    width: "80%",
    height: 250,
  },
  postVideo: {
    width: "100%",
    height: 250,
    borderRadius: 10,
  },
  postDate: {
    fontSize: 12,
    color: "#777",
    marginTop: 5,
  },
});

export default Post;
