import React, { useState } from 'react';
import {
    Text,
    View,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Image,
    Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default function ChatScreen({ route, navigation }) {
    // Initial available chats (active chats)
    const [availableChats, setAvailableChats] = useState([
        { id: '1', name: 'Alice', photo: './assets/profile.png' },
        { id: '2', name: 'Bob', photo: 'https://via.placeholder.com/50' },
    ]);

    // All friends
    const [allFriends] = useState([
        { id: '1', name: 'Alice', photo: 'https://via.placeholder.com/50' },
        { id: '2', name: 'Bob', photo: 'https://via.placeholder.com/50' },
        { id: '3', name: 'Charlie', photo: 'https://via.placeholder.com/50' },
        { id: '4', name: 'Diana', photo: 'https://via.placeholder.com/50' },
    ]);

    const [modalVisible, setModalVisible] = useState(false);

    // Function to open a chat
    const openChat = (friend) => {
        // Add the friend to available chats if not already there
        if (!availableChats.some((chat) => chat.id === friend.id)) {
            setAvailableChats([...availableChats, friend]);
        }

        // Navigate to the actual chat interface (pass the friend object)
        navigation.navigate('ChatDetail', { selectedUser: friend });
    };

    return (
        <View style={styles.container}>
            {/* Header with Hamburger Menu */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <Icon name="menu" size={30} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chats</Text>
            </View>

            {/* Active Chats */}
            <FlatList
                data={availableChats}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.chatItem}
                        onPress={() => openChat(item)}
                    >
                        <Image source={{ uri: item.photo }} style={styles.profilePhoto} />
                        <Text style={styles.chatName}>{item.name}</Text>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>No active chats</Text>}
            />

            {/* Modal for All Friends */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>All Friends</Text>
                    <FlatList
                        data={allFriends}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.friendItem}
                                onPress={() => {
                                    setModalVisible(false);
                                    openChat(item);
                                }}
                            >
                                <Image source={{ uri: item.photo }} style={styles.profilePhoto} />
                                <Text style={styles.friendName}>{item.name}</Text>
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
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f4f4f4',
        elevation: 3,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 16,
    },
    chatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    profilePhoto: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 16,
    },
    chatName: {
        fontSize: 16,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: 'gray',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'white',
        padding: 20,
        marginTop: '30%',
        borderRadius: 10,
        shadowColor: 'black',
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    friendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    friendName: {
        fontSize: 16,
    },
    closeButton: {
        backgroundColor: 'black',
        padding: 12,
        borderRadius: 8,
        marginTop: 16,
    },
    closeButtonText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
