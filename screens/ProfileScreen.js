import React, { useState, useEffect, use } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
  Image,
  useWindowDimensions,
  ScrollView
} from "react-native";
import { auth, db } from "../firebase";
import { doc, getDoc, collection, query, orderBy, onSnapshot, deleteDoc, updateDoc } from "firebase/firestore";
import PostInput from "./components/PostInput";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { MaterialIcons } from "@expo/vector-icons";
import Post from "./components/Post";



const screenWidth = Dimensions.get("window").width;


const ProfileScreen = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [coverImage, setCoverImage] = useState("");
  const userId = auth.currentUser?.uid;

    // Load user's profile image from Firestore when they log in
    useEffect(() => {
      async function fetchCoverImage() {
        const user = auth.currentUser;
        if (user) {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setCoverImage(userSnap.data().coverImage || ""); // Load saved image
          }
        }
      }
      fetchCoverImage();
    }, []);



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

    // Fetch posts in real-time
    useEffect(() => {
      if (!userId) return;
      const postsRef = collection(db, "users", userId, "posts");
      const q = query(postsRef, orderBy("createdAt", "desc"));
  
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const postsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPosts(postsList);
      });
  
      return unsubscribe;
    }, [userId]);

  // Edit user info field
  const editUserInfo = (field, currentValue) => {
    Alert.prompt(
      `Edit ${field.charAt(0).toUpperCase() + field.slice(1)}`,
      `Enter new ${field}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Save",
          onPress: async (newValue) => {
            if (!newValue.trim()) return;
            try {
              const userRef = doc(db, "users", userId);
              await updateDoc(userRef, { [field]: newValue });

              setUserData((prev) => ({ ...prev, [field]: newValue }));
              Toast.show({
                type: "success",
                text1: `${field} Updated`,
                text2: `Your ${field} has been updated.`,
              });
            } catch (error) {
              console.error(`Error updating ${field}:`, error);
              Toast.show({
                type: "error",
                text1: "Error",
                text2: `Failed to update ${field}. Try again.`,
              });
            }
          },
        },
      ],
      "plain-text",
      currentValue
    );
  };

const navigation = useNavigation();
  // Delete a post from Firestore
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
              await deleteDoc(doc(db, "users", userId, "posts", postId));
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
  
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false} // Optional: Hide scrollbar
      >
        <View style={{ width: "100%" }}>
          <Image
            source={{ uri: coverImage }}
            resizeMode="cover"
            style={{
              width: "100%",
              height: 228,
            }}
          />
        </View>
  
        <View style={{ flex: 1, alignItems: "center" }}>
          <Image
            source={{ uri: userData.profileImage }}
            resizeMode="cover"
            style={{
              width: 155,
              height: 155,
              borderRadius: 999,
              borderWidth: 2,
              borderColor: "white",
              marginTop: -90,
            }}
          />
          <Text style={{
            fontSize: 20,
            fontWeight: "bold",
            color: "#4B0082",
            marginBottom: 10,
            marginTop: 10,
          }}>
            {userData.firstName} {userData.lastName}
          </Text>
  
          <Text style={{ fontSize: 15, color: "black", marginBottom: 10 }}>
            {userData.about}
          </Text>
  
          <View style={{
            flexDirection: "row",
            marginVertical: 6,
            alignItems: "center",
          }}>
            <MaterialIcons name="location-on" size={24} color="black" />
            <Text style={{ fontSize: 15, color: "black", marginLeft: 4 }}>
              {userData.city}
            </Text>
          </View>
  
          <View style={{ flexDirection: "column", marginTop: 20, alignItems: "center" }}>
          {/* Buttons Container - Fixed Width to Prevent Shifting */}
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
              <Text style={{ color: "white" }} onPress={() => navigation.navigate("EditProfile", { screen: "EditProfile" })}>
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
              <Text style={{ color: "white" }} onPress={() => navigation.navigate("EditProfile", { screen: "EditProfile" })}>
                Edit Profile
              </Text>
            </TouchableOpacity>
          </View>

          {/* Post Input Section */}
          <View style={{ marginTop: 30, width: screenWidth - 40 , borderColor: "#ccc", borderWidth: 1, borderRadius: 10, }}> 
            <PostInput onPostSuccess={() => {}} />
          </View>
        </View>

        </View>
  
        {/* Posts List */}
        
      <FlatList
        ListHeaderComponent={
          <Text style={styles.sectionHeader}>Your Posts</Text>
        }
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Post post={item} onDelete={deletePost} />
        )}
        contentContainerStyle={styles.postsList}
        ListEmptyComponent={<Text style={styles.noPosts}>No posts yet.</Text>}
        keyboardShouldPersistTaps="handled"
      />
      </ScrollView>
      <Toast />
    </SafeAreaView>
  );
  
};

export default ProfileScreen;

const styles = StyleSheet.create({
  profileHeader: {
    alignItems: "center",
    marginBottom: 20,
    paddingTop: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#4B0082",
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4B0082",
    marginTop: 10,
  },
  userBio: {
    fontSize: 14,
    color: "#333",
    marginTop: 5,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginLeft: 15,
  },
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
  postText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  iconContainer: {
    flexDirection: "row",
    gap: 10,
  },
  postDate: {
    fontSize: 12,
    color: "#777",
    marginTop: 5,
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
  noPosts: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginTop: 10,
  },
});