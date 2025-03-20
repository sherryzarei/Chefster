import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { MultiSelect } from "react-native-element-dropdown"; // ✅ Multi-select dropdown
import { auth, db } from "../firebase"; // ✅ Import Firestore
import { doc, updateDoc } from "firebase/firestore";
import * as Progress from 'react-native-progress';
import { ActivityIndicator } from 'react-native';




const HealthInfoScreen = () => {
  const [dietType, setDietType] = useState([]);
  const [foodAllergies, setFoodAllergies] = useState([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState([]);
   const [currentStep, setCurrentStep] = useState(2); 
   const [loading, setLoading] = useState(false);


  const navigation = useNavigation();

  // Diet options
  const dietOptions = [
    { label: "Vegetarian", value: "vegetarian" },
    { label: "Vegan", value: "vegan" },
    { label: "Paleo", value: "paleo" },
    { label: "Keto", value: "keto" },
    { label: "Mediterranean", value: "mediterranean" },
    { label: "None", value: "none" },
  ];

  // Allergy options
  const allergyOptions = [
    { label: "Peanuts", value: "peanuts" },
    { label: "Tree Nuts", value: "tree_nuts" },
    { label: "Dairy", value: "dairy" },
    { label: "Eggs", value: "eggs" },
    { label: "Soy", value: "soy" },
    { label: "Shellfish", value: "shellfish" },
    { label: "Fish", value: "fish" },
    { label: "Gluten", value: "gluten" },
    { label: "None", value: "none" },
  ];

  // Dietary Restrictions
  const restrictionOptions = [
    { label: "Halal", value: "halal" },
    { label: "Kosher", value: "kosher" },
    { label: "Low Sodium", value: "low_sodium" },
    { label: "Low Carb", value: "low_carb" },
    { label: "Diabetic-Friendly", value: "diabetic_friendly" },
    { label: "None", value: "none" },
  ];

  // Save Data to Firestore
  const saveHealthInfoToFirestore = async () => {
    try {
      setLoading(true);
  
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error("User not authenticated");
  
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        dietType: dietType.length > 0 ? dietType : null,
        foodAllergies: foodAllergies.length > 0 ? foodAllergies : null,
        dietaryRestrictions: dietaryRestrictions.length > 0 ? dietaryRestrictions : null,
        infoCompleted: true,
      });
  
      Toast.show({
        type: "success",
        text1: "Health Info Saved",
        text2: "Your dietary preferences have been updated.",
      });
  
      navigation.replace("SuccessfulSetup");  
    } catch (error) {
      console.error("Error saving health info:", error);
      Toast.show({
        type: "error",
        text1: "Save Failed",
        text2: "Could not save your health info. Try again.",
      });
    } finally {
      setLoading(false);
    }
  };
  

  // Function to handle skipping
const handleSkip = async () => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("User not authenticated");

    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      dietType: null,
      foodAllergies: null,
      dietaryRestrictions: null,
      infoCompleted: true,
    });

    navigation.replace("SuccessfulSetup");
  } catch (error) {
    console.error("Error skipping health info:", error);
    Toast.show({
      type: "error",
      text1: "Skip Failed",
      text2: "Could not skip. Try again.",
    });
  }
};


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Tell Us About Your Diet</Text>

      {/* Diet Type */}
      <MultiSelect
        style={styles.dropdown}
        data={dietOptions}
        labelField="label"
        valueField="value"
        placeholder="Select Your Diet Type"
        search
        searchPlaceholder="Search..."
        value={dietType}
        onChange={(item) => setDietType(item)}
      />

      {/* Food Allergies */}
      <MultiSelect
        style={styles.dropdown}
        data={allergyOptions}
        labelField="label"
        valueField="value"
        placeholder="Select Allergies"
        search
        searchPlaceholder="Search..."
        value={foodAllergies}
        onChange={(item) => setFoodAllergies(item)}
      />

      {/* Dietary Restrictions */}
      <MultiSelect
        style={styles.dropdown}
        data={restrictionOptions}
        labelField="label"
        valueField="value"
        placeholder="Select Dietary Restrictions"
        search
        searchPlaceholder="Search..."
        value={dietaryRestrictions}
        onChange={(item) => setDietaryRestrictions(item)}
      />

      {/* Next & Skip Buttons */}
        <View style={styles.buttonContainer}>
        // Inside the return statement:
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.buttonText}>Skip</Text>
          </TouchableOpacity>
          

          <TouchableOpacity style={styles.submitButton} onPress={saveHealthInfoToFirestore} disabled={loading}>
            {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.buttonText}>Next</Text>}
          </TouchableOpacity>
        </View>
          {/* 3-Dot Progress Indicator (Positioned Above Buttons) */}
          {/* Progress Bar */}
          <Progress.Bar 
            progress={2 / 3} // Update for each screen
            width={null}
            height={6}
            borderRadius={4}
            color="#007AFF"
            style={styles.progressBar} // 🔹 Apply the consistent style
          />



      <Toast />
    </ScrollView>
  );
};

export default HealthInfoScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    height: "100%",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
    marginTop: 50,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 15,
    alignSelf: "flex-start",
  },
  dropdown: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    marginTop: 50,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 20, // Space before buttons
  },
  dot: {
    fontSize: 20,
    color: "#ccc", // Light color for inactive dots
    marginHorizontal: 5,
    marginTop: 40, // Space below dots
  },
  activeDot: {
    color: "#007AFF", // Blue color for active step
    fontSize: 24, // Bigger for emphasis
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 50,
  },
  skipButton: {
    backgroundColor: "#bbb",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  submitButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    flex: 1,
  },
  progressBar: {
    position: "absolute", // Fixes the position
    top: 80, // Ensures it stays under the header
    left: "5%", // Centers it on the screen
    width: "90%", // Ensures consistent width
    alignSelf: "center",
    marginVertical: 20, // Consistent spacing
    zIndex: 10, // Ensures it's above other elements
    marginBottom: 20, // Space before buttons 
    marginTop: 50,
  }
});
