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
  Dimensions,
  useWindowDimensions
} from "react-native";
import { TabView, TabBar } from "react-native-tab-view";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "../../src/firebase-config";
import { useNavigation } from "@react-navigation/native";

export default function Profile({ route }) {
  const { selectedUser } = route.params;
  const auth = getAuth();
  const currentUserId = auth.currentUser?.uid;
  const navigation = useNavigation();

  const [index, setIndex] = useState(0);
  const [sharedImages, setSharedImages] = useState([]);
  const [sharedLinks, setSharedLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const db = getFirestore(app);

  const layout = useWindowDimensions();

  const routes = [
    { key: "media", title: "media" },
    { key: "music", title: "music" },
    { key: "links", title: "links" },
  ];

  useEffect(() => {
    const fetchSharedContent = async () => {
      try {
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

          if (messageData.imageUrl) {
            images.push({ uri: messageData.imageUrl });
          }

          if (messageData.message) {
            const urlRegex = /https?:\/\/[^\s]+/g;
            const detectedLinks = messageData.message.match(urlRegex);
            if (detectedLinks) {
              detectedLinks.forEach((link) => {
                links.push({ id: doc.id, url: link });
              });
            }
          }
        });

        setSharedImages(images);
        setSharedLinks(links);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching shared content:", error);
        setError("Error fetching shared content");
        setLoading(false);
      }
    };

    fetchSharedContent();
  }, [selectedUser, currentUserId]);

  const handleImageClick = (imageUri) => {
    setSelectedImage(imageUri);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedImage(null);
  };

  const handleLinkClick = (url) => {
    Linking.openURL(url).catch((err) =>
      console.error("Failed to open URL:", err)
    );
  };

  const renderMedia = () => {
    console.log("Rendering Media Tab");
    return (
      <View style={styles.scene}>
        {sharedImages.length > 0 ? (
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
          <Text style={styles.listItem}>No shared images available</Text>
        )}
      </View>
    );
  };

  const renderMusic = () => {
    console.log("Rendering Music Tab");
    return (
      <View style={styles.scene}>
        <Text style={styles.listItem}>Music section is not implemented yet.</Text>
      </View>
    );
  };

  const renderLinks = () => {
    console.log("Rendering Links Tab");
    return (
      <View style={styles.scene}>
        {sharedLinks.length > 0 ? (
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
          <Text style={styles.listItem}>No shared links available</Text>
        )}
      </View>
    );
  };

  // Use TabView's lazy loading; do not manually check route keys.
  const renderScene = ({ route }) => {
    switch (route.key) {
      case "media":
        return renderMedia();
      case "music":
        return renderMusic();
      case "links":
        return renderLinks();
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
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

      {loading ? (
        <ActivityIndicator size="large" color="blue" style={styles.loader} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: layout.width }}
          renderTabBar={(props) => (
            <TabBar
              {...props}
              style={styles.tabBar}
              indicatorStyle={{ backgroundColor: "blue" }}
            />
          )}
          lazy
        />
      )}

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
    paddingTop: 10,
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
    marginLeft: 10,
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
  scene: {
    flex: 1,
    padding: 10,
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
