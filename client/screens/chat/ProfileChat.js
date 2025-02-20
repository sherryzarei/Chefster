import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TouchableWithoutFeedback,
  Linking,
} from "react-native";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "../../firebase";
import { useNavigation } from "@react-navigation/native"; // Import useNavigation
import { Ionicons } from "@expo/vector-icons"; // For back button icon

export default function ProfileChat({ route }) {
  const { selectedUser } = route.params; // Get selectedUser from navigation params
  const auth = getAuth();
  const currentUserId = auth.currentUser?.uid; // Get the logged-in user's ID
  const navigation = useNavigation(); // Access navigation object

  const [index, setIndex] = useState(0);
  const [sharedImages, setSharedImages] = useState([]); // State for shared images
  const [sharedLinks, setSharedLinks] = useState([]); // State for shared links
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [selectedImage, setSelectedImage] = useState(null); // State for selected image
  const [isModalVisible, setIsModalVisible] = useState(false); // State for modal visibility

  const db = getFirestore(app);

  const routes = [
    { key: "media", title: "Media" },
    { key: "music", title: "Music" },
    { key: "links", title: "Links" },
  ];

  useEffect(() => {
    const fetchSharedContent = async () => {
      try {
        // Query the privateMessages collection for documents where selectedUser.id is either receiverId or senderId
        const messagesQuery = query(
          collection(db, "privateMessages"),
          where("senderId", "in", [currentUserId, selectedUser.id]),
          where("receiverId", "in", [currentUserId, selectedUser.id])
        );

        const querySnapshot = await getDocs(messagesQuery);
        const images = [];
        const links = [];

        querySnapshot.forEach((doc) => {
          const messageData = doc.data();

          // Check for imageUrls
          if (messageData.imageUrl) {
            images.push({ uri: messageData.imageUrl });
          }

          // Check for links in the message text
          if (messageData.message) {
            const urlRegex = /https?:\/\/[^\s]+/g; // Regex to detect URLs
            const detectedLinks = messageData.message.match(urlRegex);
            if (detectedLinks) {
              detectedLinks.forEach((link) => {
                links.push({ id: doc.id, url: link });
              });
            }
          }
        });

        if (images.length > 0 || links.length > 0) {
          setSharedImages(images); // Set the shared images state
          setSharedLinks(links); // Set the shared links state
          setLoading(false);
        } else {
          setError("No shared content found for selected user");
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching shared content:", error);
        setError("Error fetching shared content");
        setLoading(false);
      }
    };

    fetchSharedContent();
  }, [selectedUser, currentUserId]);

  // Function to handle image click
  const handleImageClick = (imageUri) => {
    setSelectedImage(imageUri);
    setIsModalVisible(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedImage(null);
  };

  // Function to handle back navigation
  const handleBack = () => {
    navigation.goBack(); // Navigate back to the previous screen
  };

  // Function to handle link click
  const handleLinkClick = (url) => {
    Linking.openURL(url).catch((err) =>
      console.error("Failed to open URL:", err)
    );
  };

  const renderMedia = () =>
    sharedImages.length > 0 ? (
      <FlatList
        data={sharedImages}
        keyExtractor={(item) => item.uri}
        horizontal
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleImageClick(item.uri)}>
            <Image source={{ uri: item.uri }} style={styles.mediaItem} />
          </TouchableOpacity>
        )}
      />
    ) : (
      <Text>No shared images available</Text>
    );

  const renderMusic = () => (
    <Text style={styles.listItem}></Text>
  );

  const renderLinks = () =>
    sharedLinks.length > 0 ? (
      <FlatList
        data={sharedLinks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleLinkClick(item.url)}>
            <Text style={styles.linkItem}>{item.url}</Text>
          </TouchableOpacity>
        )}
      />
    ) : (
      <Text></Text>
    );

  const renderScene = SceneMap({
    media: renderMedia,
    music: renderMusic,
    links: renderLinks,
  });

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>{"<"}</Text>
          </TouchableOpacity>
        <Image
          source={{ uri: selectedUser.photo }}
          style={styles.profilePhoto}
        />
        <Text style={styles.name}>{selectedUser.name}</Text>
        <Text style={styles.username}>
          {selectedUser.username || selectedUser.phone}
        </Text>
      </View>

      {/* Show a loading spinner while the content is being fetched */}
      {loading ? (
        <ActivityIndicator size="large" color="blue" style={styles.loader} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: 300 }}
          renderTabBar={(props) => <TabBar {...props} style={styles.tabBar} />}
        />
      )}

      {/* Modal to display the selected image */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        onRequestClose={closeModal}
      >
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {selectedImage && (
                <Image source={{ uri: selectedImage }} style={styles.fullSizeImage} />
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: 10
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  backButton: {
    marginRight: 15,
    padding: 5,
    marginLeft: 10
  },
  backButtonText: {
    fontSize: 24,
    color: "#0088cc",
  },
  profilePhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
  },
  username: {
    fontSize: 14,
    color: "gray",
  },
  tabBar: {
    backgroundColor: "black",
  },
  mediaItem: {
    width: 100,
    height: 100,
    margin: 5,
    borderRadius: 10,
  },
  listItem: {
    padding: 10,
    fontSize: 16,
  },
  linkItem: {
    padding: 10,
    fontSize: 16,
    color: "blue",
    textDecorationLine: "underline",
  },
  loader: {
    marginTop: 20,
  },
  error: {
    marginTop: 20,
    color: "red",
    fontSize: 18,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  modalContent: {
    width: "90%",
    height: "70%",
    justifyContent: "center",
    alignItems: "center",
  },
  fullSizeImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
});