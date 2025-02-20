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
import { getFirestore, collection, query, orderBy, getDocs, getDoc, doc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "../../firebase";
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
  const [groupMembers, setGroupMembers] = useState([]);
  const [showMembers, setShowMembers] = useState(false); // State to toggle members list

  const db = getFirestore(app);

  const routes = [
    { key: "media", title: "Media" },
    { key: "music", title: "Music" },
    { key: "links", title: "Links" },
  ];

  useEffect(() => {
    setSharedLinks([...sharedLinks]);
  }, [index]);
  

  useEffect(() => {
    const fetchSharedContent = async () => {
      try {
        const messagesRef = collection(db, "groups", selectedGroup.id, "messages");
        const messagesQuery = query(messagesRef, orderBy("createdAt", "asc"));
        const querySnapshot = await getDocs(messagesQuery);

        const images = [];
        const links = [];

        querySnapshot.forEach((doc) => {
          const messageData = doc.data();
          if (messageData.imageUrl) {
            images.push({ uri: messageData.imageUrl });
          }
          if (messageData.links) {  // Assuming 'links' is an array stored in Firestore
            messageData.links.forEach((link) => {
              links.push({ id: doc.id, url: link });
            });
          }
        });

        setSharedImages(images);
        setSharedLinks(links);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching shared content:", error);
        setError("No Content Has Been Shared Yet");
        setLoading(false);
      }
    };

    const fetchGroupMembers = async () => {
      try {
        const members = await Promise.all(
          selectedGroup.members.map(async (memberId) => {
            const userDocRef = doc(db, "users", memberId);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              return userDoc.data();
            } else {
              console.warn(`User document not found for ID: ${memberId}`);
              return null;
            }
          })
        );
        setGroupMembers(members.filter((member) => member !== null));
      } catch (error) {
        console.error("Error fetching group members:", error);
      }
    };

    fetchSharedContent();
    fetchGroupMembers();
  }, [selectedGroup]);

  const handleImageClick = (imageUri) => {
    console.log("Selected Image URI:", imageUri);
    setSelectedImage(imageUri);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedImage(null);
  };

  const handleLinkClick = (url) => {
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log("Don't know how to open URI:", url);
      }
    });
    };

  const renderMedia = () => {
    if (index === 0) {
      return sharedImages.length > 0 ? (
        <FlatList
          data={sharedImages}
          keyExtractor={(item) => item.uri}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleImageClick(item.uri)}>
              <Image source={{ uri: item.uri }} style={styles.mediaItem} />
            </TouchableOpacity>
          )}
        />
      ) : (
        <Text>No shared images available</Text>
      );
    }
    return null;
  };
  
  const renderMusic = () => {
    if (index === 1) {
      return <Text style={styles.listItem}>Music section is not implemented yet.</Text>;
    }
    return null;
  };
  
  const renderLinks = () => {
    console.log("Rendering Links:", sharedLinks); // Debugging
    if (index === 2) {
      return sharedLinks.length > 0 ? (
        <View style={{ flex: 1 }}>
          <FlatList
            data={sharedLinks}
            keyExtractor={(item) => item.id || item.url}
            renderItem={({ item }) => {
              console.log("Rendering Link Item:", item); // Debugging
              return (
                <TouchableOpacity onPress={() => handleLinkClick(item.url)}>
                  <Text style={styles.linkItem}>{item.url}</Text>
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={<Text>No shared links available</Text>}
          />
        </View>
      ) : (
        <Text>No shared links available</Text>
      );
    }
    return null;
  };

  const renderScene = () => {
    switch (index) {
      case 0:
        return renderMedia();
      case 1:
        return renderMusic();
      case 2:
        return renderLinks();
      default:
        return null;
    }
  };
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{"<"}</Text>
        </TouchableOpacity>
        <Image source={{ uri: selectedGroup.photo }} style={styles.profilePhoto} />
        <View style={styles.groupInfo}>
          <Text style={styles.name}>{selectedGroup.name}</Text>
          <Text style={styles.membersCount}>{selectedGroup.members.length} members</Text>
        </View>
      </View>

      {/* Button to Show/Hide Members */}
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => setShowMembers(!showMembers)}
      >
        <Text style={styles.toggleButtonText}>
          {showMembers ? "Hide Members" : "Show Members"}
        </Text>
      </TouchableOpacity>

      {/* Group Members List */}
      {showMembers && (
        <View style={styles.membersContainer}>
          <Text style={styles.membersTitle}>Group Members</Text>
          <FlatList
            data={groupMembers}
            keyExtractor={(item) => item.uid}
            renderItem={({ item }) => (
              <View style={styles.memberItem}>
                <Image source={{ uri: item.profileImage }} style={styles.memberPhoto} />
                <Text style={styles.memberName}>{item.firstName} {item.lastName}</Text>
              </View>
            )}
          />
        </View>
      )}
      

      {/* Tab View for Media, Music, and Links */}
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

      {/* Modal for Full-Size Image */}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  backButton: { marginRight: 15, padding: 5, marginLeft: 10 },
  backButtonText: { fontSize: 24, color: "#0088cc" },
  profilePhoto: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  groupInfo: { flexDirection: "column" },
  name: { fontSize: 18, fontWeight: "bold" },
  membersCount: { fontSize: 14, color: "#666" },
  toggleButton: {
    backgroundColor: "#0088cc",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    margin: 20,
  },
  toggleButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  membersContainer: { padding: 20 },
  membersTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
  memberItem: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  memberPhoto: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  memberName: { fontSize: 16 },
  tabBar: { backgroundColor: "black" },
  mediaItem: { width: 100, height: 100, margin: 5, borderRadius: 10 },
  linkItem: {
    padding: 10,
    fontSize: 16,
    color: "blue",
    textDecorationLine: "underline",
    backgroundColor: "#f0f0f0", // Add background color for visibility
    marginVertical: 5, // Add spacing between links
    borderRadius: 5, // Add rounded corners
  },
  loader: { marginTop: 20 },
  error: { marginTop: 20, color: "red", fontSize: 18, textAlign: "center" },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  modalContent: {
    width: "90%",
    height: "90%",
    justifyContent: "center",
    alignItems: "center",
  },
  fullSizeImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
});