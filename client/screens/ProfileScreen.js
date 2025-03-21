import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
} from "react-native";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  where,
} from "firebase/firestore";
import PostInput from "./components/PostInput";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { MaterialIcons } from "@expo/vector-icons";
import Post from "./components/Post";
import UploadImage from "./components/Profile/UploadImage";
import CoverImage from "./components/Profile/CoverImage";

const screenWidth = Dimensions.get("window").width;

const ProfileScreen = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [standardPosts, setStandardPosts] = useState([]);
  const [recipePosts, setRecipePosts] = useState([]);
  const [activeTab, setActiveTab] = useState("standard"); // "standard" or "recipe"
  const userId = auth.currentUser?.uid;
  const navigation = useNavigation();

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

  // Fetch current user's standard posts in real-time
  useEffect(() => {
    if (!userId) return;
    const postsRef = collection(db, "users", userId, "posts");
    const q = query(postsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        userId: userId,
        ...doc.data(),
      }));
      setStandardPosts(postsList);
    });

    return unsubscribe;
  }, [userId]);

  // Fetch current user's recipe posts from recipe_posts collection
  useEffect(() => {
    if (!userId) return;
    const recipePostsRef = collection(db, "recipe_posts");
    const q = query(
      recipePostsRef,
      where("userId", "==", userId), // Filter by current user
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const recipePostsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRecipePosts(recipePostsList);
    });

    return unsubscribe;
  }, [userId]);

  // Delete a post from Firestore (for both standard and recipe posts)
  const deletePost = async (postId) => {
    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this post?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // Determine the collection based on the active tab
              if (activeTab === "standard") {
                await deleteDoc(doc(db, "users", userId, "posts", postId));
              } else if (activeTab === "recipe") {
                await deleteDoc(doc(db, "recipe_posts", postId));
              }

              Toast.show({
                type: "success",
                text1: "Post Deleted",
                text2: "Your post has been successfully deleted.",
              });
            } catch (error) {
              console.error("Error deleting post:", error);
              Toast.show({
                type: "error",
                text1: "Error",
                text2: "Failed to delete post. Try again later.",
              });
            }
          },
        },
      ]
    );
  };

  if (loading) return <ActivityIndicator size="large" color="#0782F9" style={{ flex: 1 }} />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <StatusBar backgroundColor="gray" />
      <View style={styles.postList}>
        <FlatList
          ListHeaderComponent={
            <>
              <CoverImage />
              <View style={{ flex: 1, alignItems: "center" }}>
                <View
                  style={{
                    width: 155,
                    height: 155,
                    borderRadius: 999,
                    borderWidth: 2,
                    borderColor: "white",
                    marginTop: -90,
                  }}
                >
                  <UploadImage />
                </View>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "bold",
                    color: "#4B0082",
                    marginBottom: 10,
                    marginTop: 30,
                  }}
                >
                  {userData.firstName} {userData.lastName}
                </Text>
                <Text style={{ fontSize: 15, color: "black", marginBottom: 10 }}>
                  {userData.about}
                </Text>
                {(userData.city || userData.state || userData.country) && (
                  <View
                    style={{
                      flexDirection: "row",
                      marginVertical: 6,
                      alignItems: "center",
                    }}
                  >
                    <MaterialIcons name="location-on" size={24} color="black" />
                    <Text style={{ fontSize: 15, color: "black", marginLeft: 4 }}>
                      {[userData.city, userData.state, userData.country].filter(Boolean).join(", ")}
                    </Text>
                  </View>
                )}
                <View style={{ flexDirection: "column", marginTop: 20, alignItems: "center" }}>
                  <View style={{ flexDirection: "row", width: 260, justifyContent: "space-between" }}>
                    <TouchableOpacity
                      style={{
                        width: 124,
                        height: 36,
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 10,
                        backgroundColor: "#4B0082",
                      }}
                    >
                      <Text style={{ color: "white" }} onPress={() => navigation.navigate("Friends")}>
                        Friends
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{
                        width: 124,
                        height: 36,
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 10,
                        backgroundColor: "#4B0082",
                      }}
                    >
                      <Text style={{ color: "white" }} onPress={() => navigation.navigate("EditProfile")}>
                        Edit Profile
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Tab Buttons */}
                  <View style={styles.tabContainer}>
                    <TouchableOpacity
                      style={[styles.tabButton, activeTab === "standard" && styles.activeTab]}
                      onPress={() => setActiveTab("standard")}
                    >
                      <Text style={styles.tabText}>Original Posts</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.tabButton, activeTab === "recipe" && styles.activeTab]}
                      onPress={() => setActiveTab("recipe")}
                    >
                      <Text style={styles.tabText}>Recipe Posts</Text>
                    </TouchableOpacity>
                  </View>

                  <View
                    style={{
                      marginTop: 30,
                      width: screenWidth - 40,
                      borderColor: "#ccc",
                      borderWidth: 1,
                      borderRadius: 10,
                    }}
                  >
                    <PostInput onPostSuccess={() => { }} />
                  </View>
                </View>
              </View>
            </>
          }
          ListEmptyComponent={<Text style={styles.noPosts}>No posts yet.</Text>}
          ListFooterComponent={<Toast />}
          data={activeTab === "standard" ? standardPosts : recipePosts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <Post post={item} onDelete={deletePost} />}
          contentContainerStyle={styles.postsList}
          keyboardShouldPersistTaps="handled"
        />
      </View>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  postList: {
    marginBottom: 50,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "90%",
    marginVertical: 50,
    marginBottom: -10,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    backgroundColor: "#fff",
  },
  tabButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#ccc",
    marginLeft: 10
  },
  activeTab: {
    backgroundColor: "#4B0082",
  },
  tabText: {
    color: "white",
    fontWeight: "bold",
  },
  noPosts: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginTop: 10,
  },
});