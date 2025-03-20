import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  SafeAreaView
} from "react-native";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Icon from "react-native-vector-icons/Ionicons";
import useStore from "../storeState/store";
import IP_ADDRESS from "../constants/ip_address";
import EditPreferences from "../../components/EditPreferences";

export default function ChooseIngredients({ navigation }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredIngredients, setFilteredIngredients] = useState([]);

  // Get the global state and updater functions from Zustand
  const {
    selectedIngredients,
    addIngredients,
    removeIngredient,
    cookingTime,
    mealType,
    dietType,
  } = useStore();


  useEffect(() => {
    console.log("Updated Selected Ingredients:", selectedIngredients);
  }, [selectedIngredients]);

  const handleFindRecipe = async () => {
    // Build the ingredients string
    const ingredientsQuery = selectedIngredients.join(",");

    // Construct the query URL using the collected metrics from the global state
    const queryURL = `http://${IP_ADDRESS}:8323/recipes_filter?cookingTime=${cookingTime}&mealType=${mealType}&dietType=${dietType}&ingredients=${encodeURIComponent(
      ingredientsQuery
    )}`;

    try {
      const response = await fetch(queryURL);
      const recipes = await response.json();

      // Passing the recipes data via navigation props
      navigation.navigate("GeneratedRecipe", { recipes });
    } catch (error) {
      console.error("Error fetching recipes: ", error);
    }
  };

  const formatIngredientName = (name) => {
    return name.replace(/([a-z])([A-Z])/g, "$1 $2");
  };

  // Fetch ingredient suggestions from the backend API as the user types
  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query) {
      setFilteredIngredients([]);
      return;
    }
    try {
      const response = await fetch(
        `http://${IP_ADDRESS}:8323/ingredients?ingredient=${encodeURIComponent(query)}`
      );
      const text = await response.text(); // Get raw response as text
      console.log("Raw Response:", text); // Log the raw response
      try {
        const ingredientSuggestions = JSON.parse(text); // Attempt to parse as JSON
        setFilteredIngredients(ingredientSuggestions);
      } catch (jsonError) {
        console.error("JSON Parse Error:", jsonError);
        setFilteredIngredients([]);
      }
    } catch (error) {
      console.error("Error fetching ingredient suggestions:", error.message);
      setFilteredIngredients([]);
    }
  };

  const renderIcon = (iconName) => {
    return <FontAwesome5 name={iconName} size={20} color="black" />;
  };

  const handleSelectIngredient = (ingredient) => {
    if (selectedIngredients.includes(ingredient)) {
      removeIngredient(ingredient);
      console.log("Selected Ingredients:", selectedIngredients);
    } else {
      addIngredients(ingredient);
      console.log("Selected Ingredients:", selectedIngredients);
    }
  };

  const renderHeader = () => <EditPreferences />;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => { navigation.goBack() }}>
          <FontAwesome5 name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.container}>
          <Text style={styles.sectionTitle}>Choose Ingredients</Text>
          {renderHeader()}
          <View style={styles.bodyContainer}>
            <View style={styles.titleRow}>
              <FontAwesome5 name="carrot" size={24} color="black" />
              <Text style={styles.headerTitle}>
                Please choose your ingredients:
              </Text>
            </View>
            <View style={styles.searchContainer}>
              <TextInput
                placeholder="Search Ingredients..."
                style={styles.searchBar}
                value={searchQuery}
                onChangeText={handleSearch}
              />
              <TouchableOpacity
                onPress={() => alert("Search clicked")}
                style={styles.searchIcon}
              >
                <FontAwesome5 name="search" size={20} color="black" />
              </TouchableOpacity>
              {searchQuery && filteredIngredients.length > 0 && (
                <View
                  style={{
                    height: 240,
                    backgroundColor: "#d9d7d7",
                    borderColor: "black",
                    borderWidth: 2,
                    borderRadius: 10,
                    padding: 10,
                    marginTop: 10,
                  }}
                >
                  {filteredIngredients.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.suggestionItem}
                      onPress={() => {
                        handleSelectIngredient(item);
                        setSearchQuery("");
                        setFilteredIngredients([]);
                      }}
                    >
                      <View style={styles.suggestionRow}>
                        {renderIcon("flask")}
                        <Text style={styles.suggestionText}>
                          {formatIngredientName(item)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
          <View style={styles.ingredientList}>
            {selectedIngredients.map((item) => (
              <View style={styles.row} key={item}>
                <View style={styles.row}>
                  {renderIcon("mortar-pestle")}
                  <Text style={styles.headerTitle}>
                    {formatIngredientName(item)}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleSelectIngredient(item)}>
                  <FontAwesome5 name="check-square" size={24} color="black" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.button} onPress={handleFindRecipe}>
            <Text style={styles.buttonText}>Find Recipe</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, marginTop: 50 },
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
    marginBottom: 20,
  },
  backButton: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 1,
    backgroundColor: "black",
    borderRadius: 20,
    padding: 10,
    shadowColor: "black",
    shadowOffset: { width: 2, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    borderBottomWidth: 4,
    borderRightWidth: 4,

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
  searchContainer: {
    position: "relative",
    width: "100%",
    justifyContent: "center",
    marginBottom: 10,
  },
  searchBar: {
    height: 40,
    borderColor: "black",
    borderWidth: 3,
    borderRadius: 10,
    paddingLeft: 10,
    paddingRight: 10,
    fontSize: 16,
    shadowColor: "black",
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 40,
  },
  searchIcon: {
    position: "static",
    right: 10,
    top: "50%",
    transform: [{ translateY: -30 }, { translateX: 280 }],
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 2,
    borderBottomColor: "black",
  },
  suggestionRow: { flexDirection: "row", alignItems: "center" },
  suggestionText: { marginLeft: 10, fontSize: 16 },
  ingredientList: {
    marginTop: 20,
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
    padding: 15,
  },
  scrollViewContainer: { flexGrow: 1 },
});
