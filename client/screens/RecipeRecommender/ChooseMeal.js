import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import useStore from "../../storeState/store"; // adjust the path as needed

export default function ChooseMeal({ navigation }) {
  // Local state for UI (e.g., for meal selection) is maintained as needed.
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [isFocused, setIsFocused] = useState(false);

  // Get setters from Zustand store
  const { setCookingTime, setMealType, setDietType, setServings } = useStore();
  // Get the global state and updater functions from Zustand
  const { cookingTime, mealType, dietType, servings } = useStore();

  useEffect(() => {
    console.log("Updated Servings:", servings);
    console.log("Updated Cooking Time:", cookingTime);
    console.log("Updated Diet Type:", dietType);
    console.log("Updated Meal Type:", mealType);
  }, [cookingTime, mealType, dietType, servings]);

  const handleSelectMeal = (meal) => {
    setSelectedMeal(meal);
    setMealType(meal); // Save selected meal type to global state
    alert(`${meal} Selected`);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.contentContainer}>
          <Text style={styles.sectionTitle}>Welcome to Recipe Recommender</Text>
          <View style={styles.headerContainer}>
            <View style={styles.row}>
              <Text style={styles.headerTitle}>Allergies</Text>
              <TouchableOpacity
                onPress={() => alert("Allergies Clicked")}
                style={{
                  backgroundColor: "black",
                  padding: 5,
                  borderRadius: 5,
                  elevation: 5,
                }}
              >
                <Icon name="color-wand-outline" size={24} color="white" />
              </TouchableOpacity>
            </View>
            <View style={styles.row}>
              <Text style={styles.headerTitle}>Diet Type</Text>
              <TouchableOpacity
                onPress={() => alert("Diet Type Clicked")}
                style={{
                  backgroundColor: "black",
                  padding: 5,
                  borderRadius: 5,
                  elevation: 5,
                }}
              >
                <Icon name="color-wand-outline" size={24} color="white" />
              </TouchableOpacity>
            </View>
            <View style={styles.row}>
              <Text style={styles.headerTitle}>Choice of Meal</Text>
              <TouchableOpacity
                onPress={() => alert("Choice of Meal Clicked")}
                style={{
                  backgroundColor: "black",
                  padding: 5,
                  borderRadius: 5,
                  elevation: 5,
                }}
              >
                <Icon name="color-wand-outline" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.bodyContainer}>
            <View style={styles.titleRow}>
              <Icon name="people" size={24} color="black" />
              <Text style={styles.headerTitle}>
                Please choose the number of people serving the dish:
              </Text>
            </View>
            <TextInput
              placeholder="5"
              style={[
                styles.searchBar,
                { borderColor: isFocused ? "#51b099" : "black" },
              ]}
              keyboardType="numeric"
              maxLength={10}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChangeText={setServings} // Update global servings
            />

            <View style={styles.titleRow}>
              <Icon name="timer" size={24} color="black" />
              <Text style={styles.headerTitle}>
                Please choose the cooking time:
              </Text>
            </View>
            <TextInput
              placeholder="30"
              style={[
                styles.searchBar,
                { borderColor: isFocused ? "#51b099" : "black" },
              ]}
              keyboardType="numeric"
              maxLength={10}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChangeText={setCookingTime} // Update global cooking time
            />
            <Text style={styles.note}>Note: Type just the number.</Text>

            <View style={styles.titleRow}>
              <Icon name="barbell-sharp" size={24} color="black" />
              <Text style={styles.headerTitle}>
                Please choose the diet type:
              </Text>
            </View>
            <TextInput
              placeholder="Alkaline or Atkins"
              style={[
                styles.searchBar,
                { borderColor: isFocused ? "#51b099" : "black" },
              ]}
              maxLength={50}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChangeText={setDietType} // Update global diet type
            />
            <Text style={styles.note}>
              Note: Alkaline, Atkins, Mediterranean, Vegan, Vegetarian
            </Text>
          </View>

          <View style={styles.bodyContainer}>
            <View style={styles.titleRow}>
              <Icon name="egg-outline" size={24} color="black" />
              <Text style={styles.headerTitle}>
                Please choose your meal type:
              </Text>
            </View>
            {["Breakfast", "Lunch", "Dinner", "Dessert", "Smoothies"].map(
              (meal) => (
                <View style={styles.row} key={meal}>
                  <Text style={styles.headerTitle}>{meal}</Text>
                  <TouchableOpacity onPress={() => handleSelectMeal(meal)}>
                    <Icon
                      name={
                        selectedMeal === meal
                          ? "radio-button-on"
                          : "radio-button-off"
                      }
                      size={24}
                      color="black"
                    />
                  </TouchableOpacity>
                </View>
              )
            )}
          </View>

          <TouchableOpacity
            style={[styles.button, { marginBottom: 10 }]}
            onPress={() => navigation.navigate("Choose Ingredients")}
          >
            <Text style={styles.buttonText}>Choose Ingredients</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("ChatScreen")}
          >
            <Text style={styles.buttonText}>Chat Screen</Text>
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

// (Include your styles as before)

const styles = StyleSheet.create({
  contentContainer: { padding: 16, flexGrow: 1 },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  button: {
    backgroundColor: "black",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  headerContainer: {
    padding: 20,
    backgroundColor: "#edf0f5",
    borderColor: "black",
    borderWidth: 3,
    borderRadius: 10,
    marginVertical: 10,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  bodyContainer: {
    padding: 20,
    backgroundColor: "#edf0f5",
    borderColor: "black",
    borderWidth: 3,
    borderRadius: 10,
    marginVertical: 10,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    marginTop: 15,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
    marginLeft: 8,
  },
  searchBar: {
    height: 40,
    borderColor: "black",
    borderWidth: 3,
    borderRadius: 10,
    paddingLeft: 10,
    paddingRight: 10,
    fontSize: 16,
  },
  note: {
    fontSize: 12,
    color: "gray",
    marginTop: 15,
    textAlign: "center",
    fontWeight: "bold",
  },
});
