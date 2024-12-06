import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    ScrollView,
} from "react-native";

export default function GroupOverviewScreen({ navigation }) {
    return (
        <View style={styles.container}>
            {/* Top Bar */}
            <View style={styles.topBar}>
                <TouchableOpacity onPress={() => navigation.navigate('Diet Together')}>
                    <Text style={styles.backButton}>{"<"}</Text>
                </TouchableOpacity>
                <Text style={styles.groupName}>Diet Together</Text>
                <Text style={styles.groupStatus}>2/6 online</Text>
            </View>

            {/* Action Buttons */}
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
                    }}>Media</Text>
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

            {/* Members List */}
            <ScrollView style={styles.membersList}>
                <TextInput style={styles.searchBar} placeholder="Search Members" />
                {Array(10)
                    .fill("User's Name")
                    .map((user, index) => (
                        <View key={index} style={styles.memberItem}>
                            <Text>{user}</Text>
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
        alignItems: "center",
        justifyContent: "flex-start",
        padding: 10,
        backgroundColor: "black",
        marginTop: 50,
        borderWidth: 1,
        marginBottom: 10,
        borderBottomWidth: 3,
        borderBottomColor: "white",

    },
    backButton: { fontSize: 18, color: 'white' },
    groupName: { fontSize: 18, fontWeight: "bold", color: 'white', marginLeft: 10 },
    groupStatus: { fontSize: 14, color: 'white', marginLeft: 10 },
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
    tabs: {

        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#ddd',
        paddingVertical: 10,
        borderWidth: 2,

        backgroundColor: 'black',
    },
    tab: { padding: 10 },
    membersList: {
        flex: 1,
        padding: 10,
        backgroundColor: 'white',
        borderWidth: 2,
        borderColor: 'white',
        borderRadius: 10,
    },
    searchBar: {
        padding: 10,
        backgroundColor: "#fff",
        marginBottom: 15,
        borderRadius: 5,
        borderWidth: 4,
        borderColor: "lime",
    },
    memberItem: {
        padding: 10,
        backgroundColor: '#fff',
        marginBottom: 5,
        borderRadius: 5,
        borderWidth: 2,
        borderColor: 'black',
        flexDirection: 'row',
        alignItems: 'center',
    },
});