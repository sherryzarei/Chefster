import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Image,
    Alert,
    SafeAreaView
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import * as ImagePicker from 'expo-image-picker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

export default function UploadResult({ navigation }) {
    const [image, setImage] = useState(null);

    useEffect(() => {
        const requestPermissions = async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();

            if (status !== 'granted' || cameraStatus !== 'granted') {
                Alert.alert(
                    'Permissions Required',
                    'We need camera and gallery permissions to proceed.',
                    [{ text: 'OK' }]
                );
            }
        };

        requestPermissions();
    }, []);

    // Uploads image to the server and then navigates to the 
    // next screen
    const uploadImage = () => {
        navigation.navigate('ShareResult')
    }

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.canceled) {
                setImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error picking image:', error);
        }
    };

    const takePhoto = async () => {
        try {
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.canceled) {
                setImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error taking photo:', error);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.scrollViewContainer}>
                <View style={styles.imageContainer}>
                    {image ? (
                        <Image source={{ uri: image }} style={styles.image} />
                    ) : (
                        <Text style={styles.placeholderText}>No image selected</Text>
                    )}
                </View>

                <View style={styles.buttonWrapper}>
                    <TouchableOpacity style={styles.button} onPress={pickImage}>
                        <MaterialCommunityIcons name='view-gallery-outline' size={24} color='white' />
                        <Text style={styles.buttonText}>Gallery</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={takePhoto}>
                        <MaterialCommunityIcons name='camera-outline' size={24} color='white' />
                        <Text style={styles.buttonText}>Camera</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.uploadButton} onPress={uploadImage}>
                    <MaterialCommunityIcons name='file-upload-outline' size={24} color='white' />
                    <Text style={styles.buttonText}>Upload</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        width: width * 0.99,
    },
    scrollViewContainer: {
        flexGrow: 1,
    },
    imageContainer: {
        alignItems: 'center',
        borderBottomColor: 'black',
        borderBottomWidth: 2,
        paddingVertical: 20,
    },
    placeholderText: {
        fontSize: 16,
        fontStyle: 'italic',
        color: 'gray',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        fontFamily: 'serif',
    },
    subheader: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        fontFamily: 'serif',
    },
    text: {
        fontSize: 16,
        marginBottom: 10,
        fontFamily: 'serif',
    },
    buttonWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
        marginBottom: 50,
    },

    uploadButton: {
        backgroundColor: 'black',
        padding: 10,
        borderRadius: 40,
        alignItems: 'center',
        width: '25%',
        alignSelf: 'center'

    },
    button: {
        backgroundColor: 'black',
        padding: 10,
        borderRadius: 40,
        alignItems: 'center',
        width: '25%',
        zIndex: 2,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'serif',
    },
    image: {
        height: 200,
        width: 300,
        resizeMode: 'cover',
        borderRadius: 10,
    },
});
