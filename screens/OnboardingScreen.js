import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import UploadImage from "./components/Profile/UploadImage";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import { Dropdown } from "react-native-element-dropdown";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import * as Progress from 'react-native-progress';



const OnboardingScreen = () => {
  const userId = auth.currentUser?.uid;
  const [about, setAbout] = useState("");
  const [gender, setGender] = useState("");
  const [city, setCity] = useState("");
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingCities, setFetchingCities] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState(null);
  const [currentStep, setCurrentStep] = useState(1); // Start from Step 1


  const navigation = useNavigation();
  const genders = [
    { label: "Male", value: "Male" },
    { label: "Female", value: "Female" },
    { label: "Non-binary", value: "Non-binary" },
    { label: "Prefer not to say", value: "Prefer not to say" }
  ];

  useEffect(() => {
    const fetchCities = async () => {
      setFetchingCities(true);
      try {
        const response = await axios.get(
          "https://wft-geo-db.p.rapidapi.com/v1/geo/cities",
          {
            headers: {
              "X-RapidAPI-Key": "YOUR_API_KEY",
              "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com",
            },
            params: { limit: 5, countryIds: "US,CA,GB,AU", sort: "-population" },
          }
        );
        const cityList = response.data.data.map((city) => ({
          label: city.city,
          value: city.city,
        }));
        setCities(cityList);
      } catch (error) {
        console.error("Error fetching cities:", error);
      } finally {
        setFetchingCities(false);
      }
    };
    fetchCities();
  }, []);

  const handleConfirm = (date) => {
    setDateOfBirth(date);
    setDatePickerVisibility(false);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await setDoc(
        doc(db, "users", userId),
        { about, gender, city, dateOfBirth, infoCompleted: true },
        { merge: true }
      );
      Toast.show({ type: "success", text1: "Profile Updated" });
      navigation.replace("HealthInfoScreen");
    } catch (error) {
      Toast.show({ type: "error", text1: "Error saving profile" });
    } finally {
      setLoading(false);
    }
  }; 
  
  
  return (
  <ScrollView contentContainerStyle={styles.container}>
  <Text style={styles.header}>Complete Your Profile</Text>
  <UploadImage userId={userId} />

  <TextInput
    style={styles.input}
    placeholder="Tell us about yourself..."
    value={about || ""}
    onChangeText={(text) => setAbout(text)}
    maxLength={250}
    multiline
  />
  <Text style={styles.charCount}>{250 - about.length}/250</Text>

  {/* Gender Dropdown */}
  <Dropdown
    style={styles.dropdown}
    data={genders}
    labelField="label"
    valueField="value"
    placeholder="Select Gender"
    value={gender}
    onChange={(item) => setGender(item.value)}
  />

  {/* Date Picker */}
  <TouchableOpacity style={styles.dateInput} onPress={() => setDatePickerVisibility(true)}>
    <Text style={dateOfBirth ? styles.dateText : styles.placeholderText}>
      {dateOfBirth ? dateOfBirth.toDateString() : "Date of Birth"}
    </Text>
    <Ionicons name="calendar-outline" size={20} color="#888" style={styles.icon} />
  </TouchableOpacity>
  <DateTimePickerModal isVisible={isDatePickerVisible} mode="date" onConfirm={handleConfirm} onCancel={() => setDatePickerVisibility(false)} />

  {/* City Dropdown */}
  {fetchingCities ? (
    <ActivityIndicator size="small" color="#0782F9" />
  ) : (
    <Dropdown
      style={styles.dropdown}
      data={cities}
      labelField="label"
      valueField="value"
      placeholder="Search or select a city"
      value={city}
      onChange={(item) => setCity(item.value)}
    />
  )}



  {/* Next & Skip Buttons */}
  <View style={styles.buttonContainer}>
    <TouchableOpacity style={styles.skipButton} onPress={() => navigation.replace("HealthInfoScreen")}>
      <Text style={styles.buttonText}>Skip</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
      {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.buttonText}>Next</Text>}
    </TouchableOpacity>
  </View>
    {/* 3-Dot Progress Indicator (Positioned Above Buttons) */}
    {/* Progress Bar */}
    <Progress.Bar 
      progress={1 / 3} // Update for each screen
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

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
    marginTop: 50,
  },
  input: {
    width: "100%",
    borderBottomWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginTop: 30,
    backgroundColor: "transparent",
},
  dropdown: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginTop: 30,
  },
  charCount: {
    alignSelf: "flex-end",
    color: "#666",
  },
  dateInput: {
    width: "100%",
    borderBottomWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginTop: 30,
    backgroundColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
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
    top: 90, // Ensures it stays under the header
    left: "5%", // Centers it on the screen
    width: "90%", // Ensures consistent width
    alignSelf: "center",
    marginVertical: 20, // Consistent spacing
    zIndex: 10, // Ensures it's above other elements
  }
});
