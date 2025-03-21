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
import { doc, getDoc } from "firebase/firestore";
import Toast from "react-native-toast-message";
import RecipePosts from "../../components/RecipePosts"; // Adjust path to your RecipePosts component
import { FontAwesome5 } from '@expo/vector-icons';

const { width } = Dimensions.get("window");

const socialIcons = [
    { id: 1, name: "instagram", color: "#E1306C" },
    { id: 2, name: "facebook", color: "#3b5998" },
    { id: 3, name: "whatsapp", color: "#25D366" },
    { id: 4, name: "telegram", color: "#0088cc" },
    { id: 5, name: "pinterest", color: "#E60023" },
];

export default function ShareResult({ route, navigation }) {
    const { imageUri } = route.params; // Receive imageUri from navigation
    const [modalVisible, setModalVisible] = useState(false);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

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

                {/* Social Share Modal */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Share on</Text>
                            <FlatList
                                data={socialIcons}
                                horizontal
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={({ item }) => (
                                    <TouchableOpacity style={styles.iconWrapper}>
                                        <FontAwesome name={item.name} size={32} color={item.color} />
                                    </TouchableOpacity>
                                )}
                            />
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