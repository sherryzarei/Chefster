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
import { app } from "../../src/firebase-config";
import { useNavigation } from "@react-navigation/native";

export default function GroupProfile({ route }) {
  const { selectedGroup } = route.params;
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

  const routes = [
    { key: "media", title: "Media" },
    { key: "music", title: "Music" },
    { key: "links", title: "Links" },
  ];

  useEffect(() => {
    const fetchSharedContent = async () => {
      try {
        const messagesQuery = query(
          collection(db, "groupMessages"),
          where("groupId", "==", selectedGroup.id)
        );

        const querySnapshot = await getDocs(messagesQuery);
        const images = [];
        const links = [];

        querySnapshot.forEach((doc) => {
          const messageData = doc.data();
          if (messageData.imageUrl) images.push({ uri: messageData.imageUrl });
          if (messageData.message) {
            const urlRegex = /https?:\/\/[^\s]+/g;
            const detectedLinks = messageData.message.match(urlRegex);
            if (detectedLinks) {
              detectedLinks.forEach((link) => links.push({ id: doc.id, url: link }));
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
  }, [selectedGroup]);

  const handleImageClick = (imageUri) => {
    setSelectedImage(imageUri);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedImage(null);
  };

  const handleLinkClick = (url) => {
    Linking.openURL(url).catch((err) => console.error("Failed to open URL:", err));
  };

  const renderMedia = () => (
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
    )
  );

  const renderMusic = () => <Text style={styles.listItem}>Music section is not implemented yet.</Text>;

  const renderLinks = () => (
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
      <Text>No shared links available</Text>
    )
  );

  const renderScene = SceneMap({ media: renderMedia, music: renderMusic, links: renderLinks });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{"<"}</Text>
        </TouchableOpacity>
        <Image source={{ uri: selectedGroup.photo }} style={styles.profilePhoto} />
        <Text style={styles.name}>{selectedGroup.name}</Text>
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
          initialLayout={{ width: 300 }}
          renderTabBar={(props) => <TabBar {...props} style={styles.tabBar} />}
        />
      )}

      <Modal visible={isModalVisible} transparent={true} onRequestClose={closeModal}>
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {selectedImage && <Image source={{ uri: selectedImage }} style={styles.fullSizeImage} />}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white", paddingTop: 10 },
  header: { flexDirection: "row", alignItems: "center", padding: 20, borderBottomWidth: 1, borderBottomColor: "#ddd" },
  backButton: { marginRight: 15, padding: 5, marginLeft: 10 },
  backButtonText: { fontSize: 24, color: "#0088cc" },
  profilePhoto: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  name: { fontSize: 20, fontWeight: "bold" },
  tabBar: { backgroundColor: "black" },
  mediaItem: { width: 100, height: 100, margin: 5, borderRadius: 10 },
  listItem: { padding: 10, fontSize: 16 },
  linkItem: { padding: 10, fontSize: 16, color: "blue", textDecorationLine: "underline" },
  loader: { marginTop: 20 },
  error: { marginTop: 20, color: "red", fontSize: 18, textAlign: "center" },
  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.8)" },
  fullSizeImage: { width: "100%", height: "100%", resizeMode: "contain" },
});
