import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import LottieView from "lottie-react-native"; // ✅ Lottie for animation
import * as Animatable from "react-native-animatable"; // ✅ Animatable for fade-in effect
import * as Progress from 'react-native-progress';


const SuccessfulSetup = () => {
  const navigation = useNavigation();
  const [animationFinished, setAnimationFinished] = useState(false);

  useEffect(() => {
    // Automatically navigate to HomeScreen after animation (optional)
    const timer = setTimeout(() => setAnimationFinished(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* ✅ Lottie Animation */}
      <LottieView
        source={require("../assets/success.json")} // ✅ Add a success animation JSON file in `assets/`
        autoPlay
        loop={false}
        style={styles.animation}
      />

      {/* ✅ Fade-in Text */}
      <Animatable.Text animation="fadeInUp" delay={500} style={styles.title}>
        You are all set! 🎉
      </Animatable.Text>
      <Animatable.Text animation="fadeInUp" delay={700} style={styles.subtitle}>
        Your profile has been successfully updated.
      </Animatable.Text>

      {/* ✅ "Go to Profile" Button */}
      {animationFinished && (
        <Animatable.View animation="bounceIn" delay={1000}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("MainTabs", { screen: "Profile" })}
          >
            <Text style={styles.buttonText}>Go to Your Profile</Text>
          </TouchableOpacity>
        </Animatable.View>
      )}


      {/* Progress Bar */}
      <Progress.Bar 
      progress={3 / 3} // Update for each screen
      width={null}
      height={6}
      borderRadius={4}
      color="#007AFF"
      style={styles.progressBar} // 🔹 Apply the consistent style
    />



    </View>
  );
};

export default SuccessfulSetup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  animation: {
    width: 200,
    height: 200,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 20,
    color: "#333",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginTop: 10,
    textAlign: "center",
    paddingHorizontal: 30,
  },
  button: {
    backgroundColor: "#0782F9",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  progressBar: {
    position: "absolute", // Fixes the position
    top: 90, // Ensures it stays under the header
    left: "5%", // Centers it on the screen
    width: "90%", // Ensures consistent width
    alignSelf: "center",
    marginVertical: 20, // Consistent spacing
    zIndex: 10, // Ensures it's above other elements
  }
});
