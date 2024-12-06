import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { ScrollView } from 'react-native-gesture-handler';

const ProfileScreen = () => {
    return (
        <ScrollView
            style={{
                flex: 1,
                backgroundColor: 'black',
                padding: 20,

            }}
            contentContainerStyle={{
                alignItems: 'center',
                justifyContent: 'center',
            }}>
            <View style={styles.container}>
                <Text style={styles.text}>Welcome to the Profile!</Text>
            </View>
        </ScrollView>
    );
};

export default ProfileScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 300,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 40,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
});
