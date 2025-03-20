import React, { useEffect, useState } from 'react';
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
    TextInput,
    ActivityIndicator,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { ScrollView } from 'react-native-gesture-handler';
import { auth, db, storage } from '../../../firebase'; // Adjust path to your firebase config
import { collection, addDoc, Timestamp, getDoc, doc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import Toast from 'react-native-toast-message';
import { Uploading } from '../../components/Profile/Uploading'; // Adjust path to your Uploading component

const { width } = Dimensions.get('window');

const socialIcons = [
    { id: 1, name: 'instagram', color: '#E1306C' },
    { id: 2, name: 'facebook', color: '#3b5998' },
    { id: 3, name: 'whatsapp', color: '#25D366' },
    { id: 4, name: 'telegram', color: '#0088cc' },
    { id: 5, name: 'pinterest', color: '#E60023' },
];

export default function ShareResult({ route, navigation }) {
    const { imageUri } = route.params; // Receive imageUri from navigation
    const [modalVisible, setModalVisible] = useState(false);
    const [thoughts, setThoughts] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    const userId = auth.currentUser?.uid;

    // Upload image to Firebase Storage
    const uploadMedia = async (uri) => {
        setUploading(true);
        try {
            const response = await fetch(uri);
            const blob = await response.blob();
            const fileName = `${userId}_${Date.now()}.jpg`; // Assuming JPEG format
            const storageRef = ref(storage, `recipe_posts/${fileName}`);
            const uploadTask = uploadBytesResumable(storageRef, blob);

            return new Promise((resolve, reject) => {
                uploadTask.on(
                    'state_changed',
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        setUploadProgress(progress);
                        console.log(`Upload is ${progress.toFixed()}% done`);
                    },
                    (error) => {
                        console.error('Upload failed:', error);
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
            console.error('Error uploading media:', error);
            setUploading(false);
            throw error;
        }
    };
    // retrieve user data 
    useEffect(() => {
        const fetchUserData = async () => {
            const userId = auth.currentUser?.uid; // Get the current user’s ID
            if (!userId) {
                setLoading(false);
                return;
            }

            try {
                const userDoc = await getDoc(doc(db, 'users', userId));
                if (userDoc.exists()) {
                    setUserData(userDoc.data()); // Store user data in state
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(false); // Done loading, whether successful or not
            }
        };

        fetchUserData();
    }, []);

    if (loading) {
        return <ActivityIndicator size="large" color="#0782F9" style={{ flex: 1 }} />;
    }
    // Handle post creation
    const handlePost = async () => {
        if (!thoughts.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Empty Post',
                text2: 'Please share your thoughts before posting.',
            });
            return;
        }

        try {
            const mediaUrl = await uploadMedia(imageUri);

            if (!userId) throw new Error('User not authenticated');

            const recipesPostsRef = collection(db, 'recipes_posts');
            await addDoc(recipesPostsRef, {
                text: thoughts,
                mediaUrl,
                createdAt: Timestamp.now(),
                userId,
                likes: 0,
                comments: [],
            });

            setThoughts('');
            navigation.goBack();
            Toast.show({
                type: 'success',
                text1: 'Post Created',
                text2: 'Your recipe post has been successfully added.',
            });
        } catch (error) {
            console.error('Error posting:', error);
            Toast.show({
                type: 'error',
                text1: 'Post Failed',
                text2: 'Could not add your recipe post. Try again later.',
            });
        }
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.container}>
                {uploading && <Uploading image={imageUri} progress={uploadProgress / 100} />}
                <ScrollView contentContainerStyle={styles.scrollViewContainer}>
                    <View style={styles.mainContainer}>
                        <View style={styles.userInfo}>
                            <Image
                                source={{ uri: userData?.profileImage || 'https://example.com/default-avatar.png' }}
                                style={styles.avatar}
                            />
                            <Text style={styles.userName}>
                                {userData?.firstName} {userData?.lastName}
                            </Text>
                        </View>
                        <Image source={{ uri: imageUri }} style={styles.uploadedImage} />
                        <Image source={{ uri: imageUri }} style={styles.recipeImage} />
                        <Text style={styles.headerText}>Share Your Recipe</Text>
                        <TextInput
                            placeholder="Share your thoughts about this recipe..."
                            style={styles.userThoughts}
                            multiline={true}
                            maxLength={5000}
                            value={thoughts}
                            onChangeText={setThoughts}
                        />
                        <View style={styles.buttonWrapper}>
                            <TouchableOpacity
                                style={styles.shareButtons}
                                onPress={() => setModalVisible(true)}
                            >
                                <FontAwesome name="share-square-o" size={24} color="white" />
                                <Text style={styles.buttonText}>Share</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.shareButtons}
                                onPress={handlePost}
                                disabled={uploading}
                            >
                                {uploading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <FontAwesome name="pencil-square-o" size={24} color="white" />
                                )}
                                <Text style={styles.buttonText}>Post</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>

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
        backgroundColor: '#edf0f5',
    },
    scrollViewContainer: {
        flexGrow: 1,
        alignItems: 'center',
    },
    mainContainer: {
        backgroundColor: '#FFB700',
        padding: 10,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: 'black',
        marginTop: 30,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
        width: width * 0.9,
    },
    headerText: {
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'serif',
        alignSelf: 'center',
        marginTop: 10,
    },
    recipeImage: {
        height: 320,
        width: 320,
        resizeMode: 'cover',
        borderRadius: 25,
        alignSelf: 'center',
        marginTop: 10,
        marginBottom: 10,
        borderColor: 'black',
        borderWidth: 3,
    },
    userThoughts: {
        borderWidth: 1,
        borderColor: 'black',
        borderRadius: 10,
        padding: 10,
        marginTop: 20,
        marginBottom: 20,
        backgroundColor: 'white',
        width: '100%',
        borderBottomColor: 'black',
        borderBottomWidth: 4,
    },
    buttonWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    shareButtons: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 40,
        alignItems: 'center',
        backgroundColor: 'black',
        width: '30%',
    },
    buttonText: {
        color: 'white',
        fontSize: 12,
        fontFamily: 'serif',
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: '#edf0f5',
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    iconWrapper: {
        marginHorizontal: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'black',
        borderRadius: 40,
        padding: 14,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    closeButton: {
        marginTop: 20,
        backgroundColor: '#FFB700',
        padding: 15,
        borderRadius: 20,
        marginBottom: 20,
    },
    closeButtonText: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 16,
    },
});