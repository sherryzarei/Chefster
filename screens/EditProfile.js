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
import { LinearGradient } from "expo-linear-gradient";
import { auth, db } from "../firebase";
import { doc, getDoc, collection, query, orderBy, onSnapshot, deleteDoc, updateDoc } from "firebase/firestore";
import UploadImage from "./components/Profile/UploadImage";
import Toast from "react-native-toast-message";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Icon from 'react-native-vector-icons/Feather';

import { useNavigation } from "@react-navigation/native";


const screenWidth = Dimensions.get("window").width;

const EditProfile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);

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

  if (loading) return <ActivityIndicator size="large" color="#0782F9" style={{ flex: 1 }} />;

    const navigation = useNavigation();
  return (
    <View style={styles.container}>
        {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="arrow-left" size={30} color="black" />
      </TouchableOpacity>
      <FlatList
        ListHeaderComponent={
          <>
            <LinearGradient
              colors={["#E0E0E0", "#E0E0E0", "#E0E0E0"]}
              style={styles.profileContainer}
            >
              <UploadImage userId={userId} />
              {userData && (
                <View style={styles.profileInfo}>
                  <View style={styles.editableField}>
                  <Text style={styles.name}>{userData.firstName} {userData.lastName}</Text>
                    <TouchableOpacity onPress={() => editUserInfo("firstName", userData.firstName)}>
                      <MaterialIcons name="edit" size={20} color="#3b5998" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.editableField}>
                    <Text style={styles.bio}>{userData.about}</Text>
                    <TouchableOpacity onPress={() => editUserInfo("about", userData.about)}>
                      <MaterialIcons name="edit" size={20} color="#3b5998" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.infoContainer}>
                    <View style={styles.editableField}>
                      <Text style={styles.info}>Gender: {userData.gender}</Text>
                      <TouchableOpacity onPress={() => editUserInfo("gender", userData.gender)}>
                        <MaterialIcons name="edit" size={20} color="#3b5998" />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.editableField}>
                      <Text style={styles.info}>Age: {userData.age}</Text>
                      <TouchableOpacity onPress={() => editUserInfo("age", String(userData.age))}>
                        <MaterialIcons name="edit" size={20} color="#3b5998" />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.editableField}>
                    <Text style={styles.info}>
                    Date of Birth: {userData?.dateOfBirth 
                        ? new Date(userData.dateOfBirth.seconds * 1000).toISOString().split("T")[0]  
                        : "Birthdate not set"}
                    </Text>
                    <TouchableOpacity onPress={() => editUserInfo("dateOfBirth", userData.dateOfBirth)}>
                        <MaterialIcons name="edit" size={20} color="#3b5998" />
                    </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
            </LinearGradient>
          </>
        }
      />

      <Toast />
    </View>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  editableField: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginVertical: 5,
  },
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "#f5f5f5",
    alignItems: "center",
  },
  profileContainer: {
    width: screenWidth - 40,
    alignSelf: "center",
    padding: 20,
    borderRadius: 15,
    marginVertical: 15,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    alignItems: "center",
    marginTop: 50,
  },
  profileInfo: {
    alignItems: "center",
    width: "100%",
  },
  name: {
    fontSize: 36,
    fontWeight: "bold",
    color: "black",
    marginTop: 10,
    textAlign: "center",
  },
  bio: {
    fontSize: 16,
    textAlign: "center",
    color: "black",
    marginVertical: 10,
    fontFamily: "fantasy",
    fontStyle: "italic",
  },
  infoContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  info: {
    fontSize: 16,
    color: "black",
    marginVertical: 3,
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
  noPosts: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginTop: 10,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
    backgroundColor: "rgba(255, 255, 255, 0.7)", // Semi-transparent background
    borderRadius: 30,
    padding: 10,
    elevation: 5, // For Android shadow
  },
});