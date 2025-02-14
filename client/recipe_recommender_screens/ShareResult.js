import React, { useState } from 'react';
import {
    View, Text, StyleSheet, Dimensions,
    Image, TouchableOpacity, Modal, FlatList,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { ScrollView, TextInput } from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');

const socialIcons = [
    { id: 1, name: 'instagram', color: '#E1306C' },
    { id: 2, name: 'facebook', color: '#3b5998' },
    { id: 3, name: 'whatsapp', color: '#25D366' },
    { id: 4, name: 'telegram', color: '#0088cc' },
    { id: 5, name: 'pinterest', color: '#E60023' },
];

export default function ShareResult() {
    const [modalVisible, setModalVisible] = useState(false);

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollViewContainer}>
                <View style={styles.mainContainer}>
                    <Image
                        source={{
                            uri: 'https://i.pinimg.com/474x/bb/a3/3f/bba33f3b990457e255c7eab7513785c3.jpg',
                        }}
                        style={styles.image}
                    />
                    <Text style={styles.headerText}>Salazar</Text>
                    <TextInput
                        placeholder="Share your thoughts"
                        style={styles.userThoughts}
                        multiline={true}
                        maxLength={5000}
                    />
                    <Image
                        source={{
                            uri: 'https://i.pinimg.com/736x/72/d9/af/72d9af964d384fc2a16fd087c1062a7c.jpg',
                        }}
                        style={styles.recipeImage}
                    />
                    <View style={styles.buttonWrapper}>
                        <TouchableOpacity
                            style={styles.shareButtons}
                            onPress={() => setModalVisible(true)}
                        >
                            <FontAwesome name="share-square-o" size={24} color="white" />
                            <Text style={styles.buttonText}>Share</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.shareButtons}>
                            <FontAwesome name="pencil-square-o" size={24} color="white" />
                            <Text style={styles.buttonText}>Post</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* Modal Implementation */}
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
    image: {
        height: 80,
        width: 80,
        resizeMode: 'cover',
        borderRadius: 40,
        alignSelf: 'center',
        marginTop: 10,
        borderColor: 'black',
        borderWidth: 2
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
