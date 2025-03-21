import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { auth, db } from "../firebase";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { collection, query, orderBy, onSnapshot, getDocs } from "firebase/firestore";
import AllPosts from "./components/AllPosts";

const HomeScreen = () => {
  const navigation = useNavigation();
  const [standardPosts, setStandardPosts] = useState([]);
  const [recipePosts, setRecipePosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("standard"); // "standard" or "recipe"

  // Handle sign out
  const handleSignOut = () => {
    auth
      .signOut()
      .then(() => {
        navigation.replace("Login");
        console.log("Signed Out");
      })
      .catch((error) => {
        console.error(error);
      });
  };

  // Fetch all standard posts from all users
  useEffect(() => {
    const fetchAllStandardPosts = async () => {
      try {
        const usersRef = collection(db, "users");
        const usersSnapshot = await getDocs(usersRef);
        const unsubscribePromises = [];

        usersSnapshot.forEach((userDoc) => {
          const userId = userDoc.id;
          const postsRef = collection(db, "users", userId, "posts");
          const q = query(postsRef, orderBy("createdAt", "desc"));

          const unsubscribe = onSnapshot(q, (snapshot) => {
            const userPosts = snapshot.docs.map((doc) => ({
              id: doc.id,
              userId: userId,
              ...doc.data(),
            }));

            setStandardPosts((prevPosts) => {
              const updatedPosts = [...prevPosts];
              userPosts.forEach((newPost) => {
                const existingIndex = updatedPosts.findIndex(
                  (p) => p.id === newPost.id && p.userId === newPost.userId
                );
                if (existingIndex === -1) {
                  updatedPosts.push(newPost);
                } else {
                  updatedPosts[existingIndex] = newPost;
                }
              });
              return updatedPosts.sort(
                (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
              );
            });
          });

          unsubscribePromises.push(unsubscribe);
        });

        return () => {
          unsubscribePromises.forEach((unsubscribe) => unsubscribe());
        };
      } catch (error) {
        console.error("Error fetching standard posts:", error);
      }
    };

    fetchAllStandardPosts();
  }, []);

  // Fetch all recipe posts from recipe_posts collection
  useEffect(() => {
    const recipePostsRef = collection(db, "recipe_posts");
    const q = query(recipePostsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const recipePostsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRecipePosts(recipePostsList);
    });

    return unsubscribe;
  }, []);

  // Update loading state when data is fetched
  useEffect(() => {
    if (standardPosts.length > 0 || recipePosts.length > 0) {
      setLoading(false);
    }
  }, [standardPosts, recipePosts]);

  const renderPost = ({ item }) => <AllPosts post={item} onDelete={null} />;

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0782F9" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Chat Icon */}
      <TouchableOpacity
        style={styles.chatIcon}
        onPress={() => navigation.navigate("ChatNavigator")}
      >
        <Ionicons name="chatbubble-ellipses-outline" size={28} color="black" />
      </TouchableOpacity>

      <View style={styles.emailView}>
        <Text>Email: {auth.currentUser?.email}</Text>
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

      {/* Posts List */}
      <FlatList
        data={activeTab === "standard" ? standardPosts : recipePosts}
        keyExtractor={(item) => `${item.userId}-${item.id}`} // Ensure unique keys
        renderItem={renderPost}
        ListEmptyComponent={<Text style={styles.noPosts}>No posts yet.</Text>}
        contentContainerStyle={styles.postsList}
      />

      {/* Sign Out Button */}
      <TouchableOpacity style={styles.button} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  chatIcon: {
    position: "absolute",
    top: 50,
    right: 20,
  },
  emailView: {
    backgroundColor: "#edf0f5",
    borderColor: "black",
    borderWidth: 3,
    borderRadius: 10,
    padding: 10,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    marginTop: 100,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginVertical: 30,
  },
  tabButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#ccc",
  },
  activeTab: {
    backgroundColor: "black",
  },
  tabText: {
    color: "white",
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#0782F9",
    width: "60%",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 20,
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  postsList: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  noPosts: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
  },
});