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
import { collection, query, orderBy, onSnapshot, getDocs } from "firebase/firestore"; // Added getDocs
import AllPosts from "./components/AllPosts";

const HomeScreen = () => {
  const navigation = useNavigation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Fetch all posts from all users
  useEffect(() => {
    const fetchAllPosts = async () => {
      try {
        // Get all users
        const usersRef = collection(db, "users");
        const usersSnapshot = await getDocs(usersRef); // Use getDocs instead of .get()
        const unsubscribePromises = [];

        // For each user, listen to their posts subcollection
        usersSnapshot.forEach((userDoc) => {
          const userId = userDoc.id;
          const postsRef = collection(db, "users", userId, "posts");
          const q = query(postsRef, orderBy("createdAt", "desc"));

          const unsubscribe = onSnapshot(q, (snapshot) => {
            const userPosts = snapshot.docs.map((doc) => ({
              id: doc.id,
              userId: userId, // Include userId for fetching user data in Post component
              ...doc.data(),
            }));

            // Update posts state by merging new posts
            setPosts((prevPosts) => {
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
              // Sort by createdAt descending
              return updatedPosts.sort(
                (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
              );
            });
          });

          unsubscribePromises.push(unsubscribe);
        });

        setLoading(false);

        // Cleanup all subscriptions on unmount
        return () => {
          unsubscribePromises.forEach((unsubscribe) => unsubscribe());
        };
      } catch (error) {
        console.error("Error fetching posts:", error);
        setLoading(false);
      }
    };

    fetchAllPosts();
  }, []);

  // Render each post using the Post component
  const renderPost = ({ item }) => (
    <AllPosts post={item} onDelete={null} /> // No delete option for other users' posts
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0782F9" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Chat Icon at the top right */}
      <TouchableOpacity
        style={styles.chatIcon}
        onPress={() => navigation.navigate("ChatNavigator")}
      >
        <Ionicons name="chatbubble-ellipses-outline" size={28} color="black" />
      </TouchableOpacity>

      <View style={styles.emailView}>
        <Text>Email: {auth.currentUser?.email}</Text>
      </View>

      {/* List of all posts */}
      <FlatList
        data={posts}
        keyExtractor={(item) => `${item.userId}-${item.id}`} // Unique key across users
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