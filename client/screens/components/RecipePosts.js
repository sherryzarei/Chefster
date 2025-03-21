import React, { useState, useEffect } from "react";
import {
    View,
    TextInput,
    TouchableOpacity,
    Text,
    StyleSheet,
    Image,
    ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { auth, db, storage } from "../../firebase"; // Adjust path to your firebase config
import { collection, addDoc, Timestamp, doc, getDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import Toast from "react-native-toast-message";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Video } from "expo-av";

const RecipePosts = ({ onPostSuccess, imageUri }) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [media, setMedia] = useState(null);
    const [uploading, setUploading] = useState(false);

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

    // Image/Video Picker function
    async function pickMedia() {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setMedia(result.assets[0]);
        }
    }

    // Upload media file to Firebase Storage
    async function uploadMedia(uri, fileType) {
        setUploading(true);
        try {
            const response = await fetch(uri);
            const blob = await response.blob();
            const fileName = `${userId}_${Date.now()}.${fileType === "video" ? "mp4" : "jpg"
                }`;
            const storageRef = ref(storage, `recipe_posts_media/${fileName}`); // Dedicated folder
            const uploadTask = uploadBytesResumable(storageRef, blob);

            return new Promise((resolve, reject) => {
                uploadTask.on(
                    "state_changed",
                    (snapshot) => {
                        const progress =
                            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        console.log(`Upload is ${progress.toFixed()}% done`);
                    },
                    (error) => {
                        console.error("Upload failed", error);
                        setUploading(false);
                        reject(error);
                    },
                    async () => {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        setUploading(false);
                        resolve(downloadURL);
                    }
                );
            });
        } catch (error) {
            console.error("Error uploading media:", error);
            setUploading(false);
            return null;
        }
    }

    // Handle Recipe Post Creation
    const handlePost = async () => {
        if (!title.trim() && !description.trim() && !media && !imageUri) {
            Toast.show({
                type: "error",
                text1: "Empty Recipe Post",
                text2: "Please provide a title, description, or media.",
            });
            return;
        }

        setUploading(true);

        try {
            let mediaUrl = null;
            let mediaType = null;

            if (media) {
                mediaType = media.type;
                mediaUrl = await uploadMedia(media.uri, mediaType);
            } else if (imageUri) {
                // Use imageUri passed from ShareResult if no media is selected
                mediaType = "image";
                mediaUrl = await uploadMedia(imageUri, "image");
            }

            if (!userId) throw new Error("User not authenticated");

            const recipePostsRef = collection(db, "recipe_posts"); // Top-level collection, created programmatically
            await addDoc(recipePostsRef, {
                title: title,
                description: description,
                mediaUrl,
                mediaType,
                createdAt: Timestamp.now(),
                userId,
                likes: 0,
                comments: [],
                prepTime: 15, // Placeholder; could add UI input later
                servings: 2, // Placeholder; could add UI input later
                dietType: userData?.dietType || "",
            });

            // Reset input fields
            setTitle("");
            setDescription("");
            setMedia(null);
            onPostSuccess();
            Toast.show({
                type: "success",
                text1: "Recipe Post Created",
                text2: "Your recipe result has been successfully shared.",
            });
        } catch (error) {
            console.error("Error posting recipe:", error);
            Toast.show({
                type: "error",
                text1: "Post Failed",
                text2: "Could not share your recipe result. Try again later.",
            });
        } finally {
            setUploading(false);
        }
    };

    if (loading)
        return (
            <ActivityIndicator size="large" color="#0782F9" style={{ flex: 1 }} />
        );

    return (
        <View style={styles.postContainer}>
            {/* User Info */}
            <View style={styles.userInfo}>
                <Image
                    source={{ uri: userData?.profileImage }}
                    resizeMode="cover"
                    style={styles.profileImage}
                />
                <Text style={styles.userName}>
                    {userData?.firstName} {userData?.lastName}
                </Text>
            </View>

            {/* Title Input */}
            <TextInput
                style={styles.postInputTitle}
                placeholder="Recipe Title"
                value={title}
                onChangeText={setTitle}
            />

            {/* Description Input */}
            <TextInput
                style={styles.postInput}
                placeholder="Share your thoughts about recipe..."
                value={description}
                onChangeText={setDescription}
                multiline
            />

            {/* Display Selected Media or Passed Image */}
            {(media || imageUri) && (
                <View style={styles.previewContainer}>
                    {media ? (
                        media.type === "image" ? (
                            <Image source={{ uri: media.uri }} style={styles.previewImage} />
                        ) : (
                            <Video
                                source={{ uri: media.uri }}
                                style={styles.previewVideo}
                                useNativeControls
                                resizeMode="contain"
                            />
                        )
                    ) : (
                        <Image source={{ uri: imageUri }} style={styles.previewImage} />
                    )}
                </View>
            )}

            {/* Media Picker */}
            <View style={styles.bottomRightIcons}>
                <TouchableOpacity style={styles.iconSpacing} onPress={pickMedia}>
                    <Icon name="photo-library" size={24} color="#3CB371" />
                </TouchableOpacity>
            </View>

            {/* Post Button */}
            <TouchableOpacity
                style={styles.postButton}
                onPress={handlePost}
                disabled={uploading}
            >
                {uploading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Post Result</Text>
                )}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    postContainer: {
        padding: 15,
        backgroundColor: "#ebf5ee",
        borderRadius: 15,
        elevation: 3,
        margin: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    userInfo: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 999,
        borderWidth: 2,
        borderColor: "white",
    },
    userName: {
        marginLeft: 7,
        fontSize: 14,
        fontWeight: "bold",
    },
    postInputTitle: {
        height: 50,
        borderColor: "black",
        borderWidth: 2,
        borderRadius: 10,
        paddingHorizontal: 10,
        marginBottom: 10,
        fontWeight: "bold"
    },
    postInput: {
        height: 80,
        borderColor: "black",
        borderWidth: 2,
        borderRadius: 10,
        paddingHorizontal: 10,
        marginBottom: 10,
        fontWeight: "bold"
    },
    previewContainer: {
        marginBottom: 10,
        borderWidth: 1.5,
        borderColor: "black",
        borderRadius: 12,
        shadowColor: "black",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        borderBottomWidth: 4
    },
    previewImage: {
        width: "100%",
        height: 250,
        borderRadius: 10,
    },
    previewVideo: {
        width: "100%",
        height: 200,
    },
    bottomRightIcons: {
        flexDirection: "row",
        marginBottom: 10,
    },
    iconSpacing: {
        marginRight: 10,
    },
    postButton: {
        backgroundColor: "black",
        padding: 10,
        borderRadius: 5,
        alignItems: "center",

    },
    buttonText: {
        color: "#f5d60c",
        fontWeight: "bold",
    },
});

export default RecipePosts;