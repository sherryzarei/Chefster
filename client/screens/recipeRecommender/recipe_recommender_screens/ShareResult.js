import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    Image,
    TouchableOpacity,
    Modal,
    FlatList,
    SafeAreaView,
    ActivityIndicator,
} from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { ScrollView } from "react-native-gesture-handler";
import { auth, db } from "../../../firebase"; // Adjust path to your firebase config
import { doc, getDoc, collection, query, onSnapshot } from "firebase/firestore";
import Toast from "react-native-toast-message";
import RecipePosts from "../../components/RecipePosts"; // Adjust path to your RecipePosts component
import { FontAwesome5 } from '@expo/vector-icons';

const { width } = Dimensions.get("window");

// Define the fallback image URL as a constant
const FALLBACK_IMAGE = "https://www.vlp.org.uk/wp-content/uploads/2024/12/c830d1dee245de3c851f0f88b6c57c83c69f3ace.png";

const socialIcons = [
    { id: 1, name: "instagram", color: "#E1306C" },
    { id: 2, name: "facebook", color: "#3b5998" },
    { id: 3, name: "whatsapp", color: "#25D366" },
    { id: 4, name: "telegram", color: "#0088cc" },
    { id: 5, name: "pinterest", color: "#E60023" },
];

// Custom component for user item to manage image state
const UserItem = ({ item }) => {
    const [imageSource, setImageSource] = useState(item.profileImage || FALLBACK_IMAGE);

    return (
        <TouchableOpacity style={styles.userItem}>
            <View style={styles.userItemContent}>
                <Image
                    source={{ uri: imageSource }}
                    style={styles.userImage}
                    onError={() => setImageSource(FALLBACK_IMAGE)} // Fallback on error
                />
                <Text style={styles.userName} numberOfLines={1} ellipsizeMode="tail">
                    {item.firstName} {item.lastName}
                </Text>
                {item.city && (
                    <Text style={styles.userLocation} numberOfLines={1} ellipsizeMode="tail">
                        {item.city}, {item.country}
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    );
};

export default function ShareResult({ route, navigation }) {
    const { imageUri } = route.params; // Receive imageUri from navigation
    const [modalVisible, setModalVisible] = useState(false);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]); // State for list of users
    const [activeTab, setActiveTab] = useState("socials"); // "socials" or "users"

    const userId = auth.currentUser?.uid;

    // Fetch user data
    useEffect(() => {
        const fetchUserData = async () => {
            if (!userId) {
                setLoading(false);
                return;
            }
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
    }, []);

    // Fetch all users from Firestore
    useEffect(() => {
        const usersRef = collection(db, "users");
        const q = query(usersRef);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const usersList = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setUsers(usersList);
        }, (error) => {
            console.error("Error fetching users:", error);
        });

        return unsubscribe;
    }, []);

    // Callback for successful post
    const handlePostSuccess = () => {
        navigation.navigate("MainTabs", { screen: "Profile" });
    };

    if (loading) {
        return (
            <ActivityIndicator size="large" color="#0782F9" style={{ flex: 1 }} />
        );
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <FontAwesome5 name="arrow-left" size={24} color="white" />
            </TouchableOpacity>
            <View style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollViewContainer}>
                    <View style={styles.mainContainer}>
                        <Text style={styles.headerText}>Share Your Recipe Result</Text>
                        <RecipePosts onPostSuccess={handlePostSuccess} imageUri={imageUri} />
                        <View style={styles.buttonWrapper}>
                            <TouchableOpacity
                                style={styles.shareButtons}
                                onPress={() => setModalVisible(true)}
                            >
                                <FontAwesome name="share-square-o" size={24} color="white" />
                                <Text style={styles.buttonText}>Share</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>

                {/* Social Share Modal with Tabs */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Share Your Recipe</Text>

                            {/* Tab Buttons */}
                            <View style={styles.tabContainer}>
                                <TouchableOpacity
                                    style={[styles.tabButton, activeTab === "socials" && styles.activeTab]}
                                    onPress={() => setActiveTab("socials")}
                                >
                                    <Text style={styles.tabText}>Socials</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.tabButton, activeTab === "users" && styles.activeTab]}
                                    onPress={() => setActiveTab("users")}
                                >
                                    <Text style={styles.tabText}>Users</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Tab Content */}
                            {activeTab === "socials" ? (
                                <FlatList
                                    data={socialIcons}
                                    horizontal
                                    numColumns={1} // Explicitly set to 1 for horizontal list
                                    keyExtractor={(item) => item.id.toString()}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity style={styles.iconWrapper}>
                                            <FontAwesome name={item.name} size={32} color={item.color} />
                                        </TouchableOpacity>
                                    )}
                                    key="socials" // Unique key to force re-mount
                                />
                            ) : (
                                <FlatList
                                    data={users}
                                    keyExtractor={(item) => item.id}
                                    renderItem={({ item }) => <UserItem item={item} />}
                                    numColumns={3} // Set to 3 columns for grid layout
                                    ListEmptyComponent={
                                        <Text style={styles.noUsersText}>No users found.</Text>
                                    }
                                    style={styles.userList}
                                    columnWrapperStyle={styles.columnWrapper} // Add spacing between columns
                                    key="users" // Unique key to force re-mount
                                />
                            )}

                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.closeButtonText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#edf0f5",
    },
    scrollViewContainer: {
        flexGrow: 1,
        alignItems: "center",
        marginTop: 40
    },
    mainContainer: {
        backgroundColor: "#FFB700",
        padding: 10,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: "black",
        marginTop: 30,
        shadowColor: "black",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
        width: width * 0.9,
    },
    backButton: {
        position: "absolute",
        top: 10,
        left: 10,
        zIndex: 1,
        backgroundColor: "black",
        borderRadius: 20,
        padding: 10,
        shadowColor: "black",
        shadowOffset: { width: 2, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
        borderBottomWidth: 4,
        borderRightWidth: 4,
        marginTop: 40,
    },
    headerText: {
        fontSize: 18,
        fontWeight: "bold",
        fontFamily: "serif",
        alignSelf: "center",
        marginTop: 10,
        marginBottom: 10,
    },
    buttonWrapper: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 20,
    },
    shareButtons: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 40,
        alignItems: "center",
        backgroundColor: "black",
        width: "30%",
        flexDirection: "row",
        justifyContent: "center",
    },
    buttonText: {
        color: "white",
        fontSize: 12,
        fontFamily: "serif",
        fontWeight: "bold",
        marginLeft: 5,
    },
    modalContainer: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
        backgroundColor: "#edf0f5",
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    tabContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 20,
    },
    tabButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        backgroundColor: "black",
        marginHorizontal: 5,
    },
    activeTab: {
        backgroundColor: "#FFB700",
    },
    tabText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 14,
    },
    iconWrapper: {
        marginHorizontal: 8,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "black",
        borderRadius: 40,
        padding: 14,
        shadowColor: "black",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    userList: {
        maxHeight: 500, // Limit the height of the user list
        width: width * 0.95,
    },
    columnWrapper: {
        justifyContent: "space-between", // Space items evenly in each row
        marginHorizontal: -5, // Adjust for padding
        width: width * 0.92,
        alignSelf: "center"
    },
    userItem: {
        flex: 1,
        margin: 5, // Add margin between items
        padding: 10,
        backgroundColor: "white",
        borderRadius: 15,
        shadowColor: "black",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
        alignItems: "center", // Center content in grid item
        width: (width * 0.9 - 20) / 3, // Calculate width for 3 columns (accounting for margins)
    },
    userItemContent: {
        flexDirection: "column", // Stack items vertically
        alignItems: "center",
    },
    userImage: {
        width: 60, // Slightly larger for grid layout
        height: 60,
        borderRadius: 30,
        marginBottom: 5, // Space between image and text
        borderWidth: 2,
        borderColor: "orange",
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 14, // Smaller font for grid layout
        fontWeight: "bold",
        color: "black",
        textAlign: "center",
    },
    userLocation: {
        fontSize: 12, // Smaller font for grid layout
        color: "#666",
        textAlign: "center",
    },
    noUsersText: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        marginVertical: 20,
    },
    closeButton: {
        marginTop: 20,
        backgroundColor: "#FFB700",
        padding: 15,
        borderRadius: 20,
        marginBottom: 20,
    },
    closeButtonText: {
        color: "black",
        fontWeight: "bold",
        fontSize: 16,
    },
});