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
import { FontAwesome5 } from '@expo/vector-icons';

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

    const proceedToShare = () => {
        if (!image) {
            Alert.alert('No Image Selected', 'Please select an image before proceeding.');
            return;
        }
        navigation.navigate('ShareResult', { imageUri: image });
    };

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
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <FontAwesome5 name="arrow-left" size={24} color="white" />
            </TouchableOpacity>
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
                        <MaterialCommunityIcons name="view-gallery-outline" size={24} color="white" />
                        <Text style={styles.buttonText}>Gallery</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={takePhoto}>
                        <MaterialCommunityIcons name="camera-outline" size={24} color="white" />
                        <Text style={styles.buttonText}>Camera</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.uploadButton} onPress={proceedToShare}>
                    <MaterialCommunityIcons name="arrow-right" size={24} color="white" />
                    <Text style={styles.buttonText}>Next</Text>
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
        marginTop: 60,
    },
    imageContainer: {
        alignItems: 'center',
        borderBottomColor: 'black',
        borderBottomWidth: 6,
        paddingVertical: 10,
        borderTopWidth: 2,
        borderTopColor: 'black',
        marginBottom: 20,
        borderRadius: 10,
        backgroundColor: '#edf0f5',
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
        marginTop: 30,
        borderWidth: 2,
        borderColor: 'black',
        width: '95%',
        alignSelf: 'center',
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
    placeholderText: {
        fontSize: 16,
        fontStyle: 'italic',
        color: 'gray',
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
        alignSelf: 'center',
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
        height: 400,
        width: 355,
        resizeMode: 'cover',
        borderRadius: 10,
    },
});