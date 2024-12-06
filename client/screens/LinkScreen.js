import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export default function LinkScreen({ navigation }) {
    return (
        <View style={styles.container}>
            {/* Top Bar */}
            <View style={styles.topBar}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backArrow}>{'<'}</Text>
                </TouchableOpacity>
                <View style={styles.textColumn}>
                    <Text style={styles.groupName}>Group Name</Text>
                    <Text style={styles.groupStatus}>2/6 online</Text>
                </View>
            </View>

            <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.actionButton}>
                    <Text style={{ color: 'white' }}>Mute</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                    <Text style={{ color: 'white' }}>Search</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                    <Text style={{ color: 'white' }}>Leave</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                    <Text style={{ color: 'white' }}>Clear History</Text>
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
                <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate('GroupOverview')}>
                    <Text style={{
                        color: 'white',
                        borderWidth: 3,
                        borderColor: 'white',
                        borderRadius: 10,
                        padding: 5,
                        backgroundColor: 'black',
                        fontWeight: 'bold'
                    }}>Members</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate('Media')}>
                    <Text style={{
                        color: 'white',
                        borderWidth: 3,
                        borderColor: 'white',
                        borderRadius: 10,
                        padding: 5,
                        backgroundColor: 'black',
                        fontWeight: 'bold'
                    }}>Media</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate('Files')}>
                    <Text style={{
                        color: 'white',
                        borderWidth: 3,
                        borderColor: 'white',
                        borderRadius: 10,
                        padding: 5,
                        backgroundColor: 'black',
                        fontWeight: 'bold'
                    }}>Files</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate('Link')}>
                    <Text style={{
                        color: 'white',
                        borderWidth: 3,
                        borderColor: 'white',
                        borderRadius: 10,
                        padding: 5,
                        backgroundColor: 'black',
                        fontWeight: 'bold'
                    }}>Links</Text>
                </TouchableOpacity>
            </View>

            {/* Links List */}
            <ScrollView style={styles.linksList}>
                {Array(11)
                    .fill('Link')
                    .map((link, index) => (
                        <View key={index} style={styles.linkItem}>
                            <Text style={{
                                fontWeight: 'bold',
                                fontSize: 16
                            }}>🔗 {link}</Text>
                        </View>
                    ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'black' },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: 'black',
        marginTop: 50,
        borderWidth: 1,
        marginBottom: 10,
        borderBottomWidth: 3,
        borderBottomColor: 'white',
    },
    backButton: {
        marginRight: 10,

    },
    backArrow: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white'
    },
    textColumn: {
        flexDirection: 'column',
    },
    groupName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    groupStatus: {
        fontSize: 14,
        color: 'white',

    },
    tabs: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#ddd',
        paddingVertical: 10,
        borderWidth: 2,

        backgroundColor: 'black',

    },
    tab: {},
    activeTab: { borderBottomWidth: 2, borderBottomColor: '#000' },
    linksList: {
        flex: 1,
        padding: 10,
        backgroundColor: 'white',
        borderRadius: 10,
        borderWidth: 4,
        borderColor: 'white'
    },
    linkItem: {
        padding: 10,
        backgroundColor: '#fff',
        marginBottom: 5,
        borderRadius: 5,
        borderWidth: 2,
        borderColor: 'black',
        flexDirection: 'row',
        alignItems: 'center',

    },
    actionButton: {
        color: 'white',
        borderWidth: 3,
        borderColor: 'white',
        borderRadius: 10,
        padding: 5,
        backgroundColor: 'black',
        fontWeight: 'bold'
    },
    actionButtons: {
        flexDirection: "row",
        justifyContent: "space-around",
        padding: 10,
        backgroundColor: "black",
        marginBottom: 10,
        borderBottomWidth: 2,
        borderBottomColor: 'white',

    },
});
