import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React from "react";
import { auth } from "../firebase";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons"; // Import icon library

const HomeScreen = () => {
  const navigation = useNavigation();

  const handleSignOut = () => {
    auth
      .signOut()
      .then(() => {
        navigation.replace("Login");
        console.log("Signed Out");
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <View style={styles.container}>
      {/* Chat Icon at the top right */}
      <TouchableOpacity
        style={styles.chatIcon}
        onPress={() => navigation.navigate("ChatScreen")}
      >
        <Ionicons name="chatbubble-ellipses-outline" size={28} color="black" />
      </TouchableOpacity>

      <Text>Email: {auth.currentUser?.email}</Text>

      <TouchableOpacity
      style={styles.chatIcon}
      onPress={() => navigation.navigate("ChatNavigator")}
    >
      <Ionicons name="chatbubble-ellipses-outline" size={28} color="black" />
    </TouchableOpacity>

    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  chatIcon: {
    position: "absolute",
    top: 50, // Adjust for notch
    right: 20,
  },
  button: {
    backgroundColor: "#0782F9",
    width: "60%",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 40,
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
});
