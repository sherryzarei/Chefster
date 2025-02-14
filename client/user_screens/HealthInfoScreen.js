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

const HealthInfoScreen = () => {
  const [dietType, setDietType] = useState([]);
  const [foodAllergies, setFoodAllergies] = useState([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState([]);

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
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error("User not authenticated");
  
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        dietType,
        foodAllergies,
        dietaryRestrictions,
      });
  
      Toast.show({
        type: "success",
        text1: "Health Info Saved",
        text2: "Your dietary preferences have been updated.",
      });
  
      // ✅ Ensure the navigation name matches the registered screen in `App.js`
      navigation.replace("SuccessfulSetup");  
    } catch (error) {
      console.error("Error saving health info:", error);
      Toast.show({
        type: "error",
        text1: "Save Failed",
        text2: "Could not save your health info. Try again.",
      });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Tell Us About Your Diet</Text>

      {/* Diet Type */}
      <Text style={styles.label}>Select Your Diet Type:</Text>
      <MultiSelect
        style={styles.dropdown}
        data={dietOptions}
        labelField="label"
        valueField="value"
        placeholder="Select Diet Type"
        search
        searchPlaceholder="Search..."
        value={dietType}
        onChange={(item) => setDietType(item)}
      />

      {/* Food Allergies */}
      <Text style={styles.label}>Do You Have Any Food Allergies?</Text>
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
      <Text style={styles.label}>Any Dietary Restrictions?</Text>
      <MultiSelect
        style={styles.dropdown}
        data={restrictionOptions}
        labelField="label"
        valueField="value"
        placeholder="Select Restrictions"
        search
        searchPlaceholder="Search..."
        value={dietaryRestrictions}
        onChange={(item) => setDietaryRestrictions(item)}
      />

      {/* Submit & Skip Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.submitButton} onPress={saveHealthInfoToFirestore}>
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => navigation.replace("SuccessfulSetup")}
        >
          <Text style={styles.buttonText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <Toast />
    </ScrollView>
  );
};

export default HealthInfoScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
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
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
  },
  submitButton: {
    backgroundColor: "#0782F9",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  skipButton: {
    backgroundColor: "#bbb",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    flex: 1,
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
});