
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const FriendsList = ({ navigation }) => {
    const friends = [
        { id: '1', name: 'Alice', photo: 'https://via.placeholder.com/40' },
        { id: '2', name: 'Bob', photo: 'https://via.placeholder.com/40' },
        { id: '3', name: 'Charlie', photo: 'https://via.placeholder.com/40' },
    ];

    return (
        <View style={styles.container}>
            {/* Hamburger Menu */}
            <TouchableOpacity
                style={styles.hamburgerMenu}
                onPress={() => alert('Show all friends (TODO: Implement)')}
            >
                <Icon name="menu" size={30} color="black" />
            </TouchableOpacity>

            <Text style={styles.title}>Available Chats</Text>

            <FlatList
                data={friends}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.friendItem}
                        onPress={() => navigation.navigate('Chat', { friend: item })}
                    >
                        <Image source={{ uri: item.photo }} style={styles.friendPhoto} />
                        <Text style={styles.friendName}>{item.name}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    hamburgerMenu: {
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 16,
    },
    friendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    friendPhoto: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    friendName: {
        fontSize: 18,
    },
});

export default FriendsList;

