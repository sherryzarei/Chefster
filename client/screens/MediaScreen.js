import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from "react-native";

export default function MediaScreen({ navigation }) {
    return (
        <View style={styles.container}>
            {/* Top Bar */}
            <View style={styles.topBar}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backButton}>{"<"}</Text>
                </TouchableOpacity>
                <Text style={styles.groupName}>Diet Together</Text>
                <Text style={styles.groupStatus}>2/6 online</Text>
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
                <TouchableOpacity
                    style={styles.tab}
                    onPress={() => navigation.navigate("GroupOverview")}
                >
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
                <TouchableOpacity
                    style={styles.tab}
                    onPress={() => navigation.navigate("Media")}
                >
                    <Text style={{
                        color: 'white',
                        borderWidth: 3,
                        borderColor: 'white',
                        borderRadius: 10,
                        padding: 5,
                        backgroundColor: 'black',
                        fontWeight: 'bold'
                    }}> Media</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.tab}
                    onPress={() => navigation.navigate("Files")}
                >
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
                <TouchableOpacity
                    style={styles.tab}
                    onPress={() => navigation.navigate("Link")}
                >
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

            {/* Media Grid */}
            <ScrollView contentContainerStyle={styles.mediaGrid}>
                {Array(12)
                    .fill(null)
                    .map((_, index) => (
                        <View key={index} style={styles.mediaItem}>
                            <Text>Image {index + 1}</Text>
                        </View>
                    ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "black" },
    topBar: {
        flexDirection: "row",
        alignItems: "left",
        justifyContent: "flex-start",
        padding: 10,
        backgroundColor: "black",
        marginTop: 50,
        borderBottomWidth: 2,
        borderBottomColor: 'white',
        marginBottom: 10,
    },
    backButton: { fontSize: 18, color: 'white' },
    groupName: { fontSize: 18, fontWeight: "bold", color: 'white', marginLeft: 10 },
    groupStatus: { fontSize: 14, color: 'white', marginLeft: 10 },
    tabs: {
        flexDirection: "row",
        justifyContent: "space-around",
        backgroundColor: "black",
        paddingVertical: 10,
    },
    tab: { padding: 10 },
    mediaGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-around",
        padding: 10,
        borderTopWidth: 2,
        borderTopColor: 'white',

    },

    mediaItem: {
        padding: 10,
        backgroundColor: '#fff',
        marginBottom: 5,
        borderRadius: 5,
        borderWidth: 2,
        borderColor: 'black',
        flexDirection: 'row',
        alignItems: 'center',
        width: '50%',
        height: '40%',
        gap: 20,
        justifyContent: 'center',


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