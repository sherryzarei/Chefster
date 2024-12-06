import React from 'react';
import { StyleSheet, Text, View, TextInput, Image, ScrollView } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import post1 from '../assets/post1_main_image.png';

const HomePage = () => {
    return (
        <ScrollView style={styles.container}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={24} color="black" style={styles.icon} />
                <TextInput
                    placeholder="Search...."
                    placeholderTextColor="gray"
                    style={styles.input}
                />
            </View>

            {/* Post 1 */}
            <View style={styles.postContainer}>
                {/* Header */}
                <View style={styles.header}>
                    <Image
                        source={require('../assets/salazar_vitorino.jpg')} // Placeholder avatar
                        style={styles.avatar}
                    />
                    <View>
                        <Text style={styles.name}>Salazar Vitorino</Text>
                        <Text style={styles.role}>Wellness Enthusiast</Text>
                    </View>
                </View>
                {/* Post Content */}
                <Text style={styles.postText}>
                    Good nutrition fuels your body, supports mental clarity, and boosts overall health. By choosing a balanced diet rich in fruits, vegetables, lean proteins, and whole grains, you provide essential nutrients that help prevent chronic diseases and promote well-being.
                </Text>
                {/* Post Image */}
                <Image
                    source={require('../assets/post1_main_image.png')} // Placeholder image
                    style={styles.postImage}
                />
                {/* Post Footer */}
                <View style={styles.footer}>
                    <View style={styles.iconGroup}>
                        <Ionicons name="thumbs-up-outline" size={24} color="lime" />
                        <Text style={styles.iconText}>70</Text>
                    </View>
                    <View style={styles.iconGroup}>
                        <Ionicons name="chatbubble-outline" size={24} color="lime" />
                        <Text style={styles.iconText}>3 Comments</Text>
                    </View>
                    <View style={styles.iconGroup}>
                        <FontAwesome name="share" size={24} color="lime" />
                        <Text style={styles.iconText}>8 Shares</Text>
                    </View>
                </View>
            </View>

            {/* Post 2 */}
            <View style={styles.postContainer}>
                {/* Header */}
                <View style={styles.header}>
                    <Image
                        source={require('../assets/angela_vespucci.jpg')}
                        style={styles.avatar}
                    />
                    <View>
                        <Text style={styles.name}>Angela Vespucci</Text>
                        <Text style={styles.role}>Fitness Enthusiast</Text>
                    </View>
                </View>
                {/* Post Content */}
                <Text style={styles.postText}>
                    Balanced nutrition is key to optimizing performance, aiding recovery, and building strength. Eating nutrient-dense foods rich in protein, healthy fats, and complex carbs supports endurance and muscle growth.
                </Text>
                {/* Post Image */}
                <Image
                    source={require('../assets/post2_image.jpg')}
                    style={styles.postImage}
                />
                {/* Post Footer */}
                <View style={styles.footer}>
                    <View style={styles.iconGroup}>
                        <Ionicons name="thumbs-up-outline" size={24} color="lime" />
                        <Text style={styles.iconText}>123</Text>
                    </View>
                    <View style={styles.iconGroup}>
                        <Ionicons name="chatbubble-outline" size={24} color="lime" />
                        <Text style={styles.iconText}>8 Comments</Text>
                    </View>
                    <View style={styles.iconGroup}>
                        <FontAwesome name="share" size={24} color="lime" />
                        <Text style={styles.iconText}>25 Shares</Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
};

export default HomePage;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
        padding: 20,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderWidth: 2,
        borderRadius: 20,
        borderColor: 'lime',
        paddingHorizontal: 10,
        paddingVertical: 5,
        marginBottom: 20,
        marginTop: 55,
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        fontWeight: 'bold',
        color: 'black',
    },
    postContainer: {
        backgroundColor: '#1c1c1c',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
    },
    header: {
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
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
    },
    role: {
        fontSize: 14,
        color: 'gray',
    },
    postText: {
        fontSize: 14,
        color: 'white',
        marginBottom: 10,
    },
    postImage: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        marginBottom: 10,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    iconGroup: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconText: {
        fontSize: 14,
        color: 'lime',
        marginLeft: 5,
    },
});
