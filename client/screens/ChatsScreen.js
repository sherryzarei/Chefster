import { StyleSheet, Text, View, ScrollView, Pressable } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import jwtDecode from "jwt-decode"; // Correct import
import UserChat from "../components/UserChat";
import { useNavigation } from "@react-navigation/native";

const ChatsScreen = () => {
  const [acceptedFriends, setAcceptedFriends] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchAcceptedFriends = async () => {

      try {
        let localUserId = userId;

        // Decode the token to fetch userId if not already available
        if (!localUserId) {
          const decodedToken = jwtDecode(token);
          console.log("Decoded token:", decodedToken);
          localUserId = decodedToken.userId;
          setUserId(localUserId); // Save in context
        }

        const response = await axios.get(
          `http://192.168.0.132:8100/accepted-friends/${localUserId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.status === 200) {
          console.log("Accepted friends data:", response.data);
          setAcceptedFriends(response.data);
        }
      } catch (error) {
        console.log("Error fetching accepted friends:", error);
      }
    };

    fetchAcceptedFriends();
  });

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {acceptedFriends.length > 0 ? (
        acceptedFriends.map((item, index) => (
          <Pressable
            key={index}
            onPress={() =>
              navigation.navigate("ChatDetail", {
                token,
                userId,
                friendId: item._id, // Pass friend-specific data
              })
            }
          >
            <UserChat item={item} />
          </Pressable>
        ))
      ) : (
        <View style={styles.noFriendsContainer}>
          <Text>No friends available</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  noFriendsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});

export default ChatsScreen;
