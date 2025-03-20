import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import UploadImage from "./components/Profile/UploadImage";
import { auth, db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";  // Import getDoc for fetching data
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import { Dropdown } from "react-native-element-dropdown";
import { Ionicons } from "@expo/vector-icons";
import * as Progress from "react-native-progress";
import { Country, State, City } from "country-state-city";

const OnboardingScreen = () => {
  const userId = auth.currentUser?.uid;
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);  // State to track fetching user data

  // User data states
  const [about, setAbout] = useState("");
  const [gender, setGender] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [dateOfBirth, setDateOfBirth] = useState(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const genders = [
    { label: "Male", value: "Male" },
    { label: "Female", value: "Female" },
    { label: "Non-binary", value: "Non-binary" },
    { label: "Prefer not to say", value: "Prefer not to say" },
  ];

  const countries = Country.getAllCountries().map((c) => ({
    label: c.name,
    value: c.isoCode,
  }));

  const states = selectedCountry
    ? State.getStatesOfCountry(selectedCountry).map((s) => ({
        label: s.name,
        value: s.isoCode,
      }))
    : [];

  const cities = selectedState
    ? City.getCitiesOfState(selectedCountry, selectedState).map((c) => ({
        label: c.name,
        value: c.name,
      }))
    : [];

  // Fetch user data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;
      try {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setAbout(userData.about || "");
          setGender(userData.gender || "");
          setSelectedCountry(userData.country || null);
          setSelectedState(userData.state || null);
          setSelectedCity(userData.city || null);
          setDateOfBirth(userData.dateOfBirth ? new Date(userData.dateOfBirth) : null);
        }
      } catch (error) {
        Toast.show({ type: "error", text1: "Error fetching user data" });
      } finally {
        setFetchingData(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleConfirm = (date) => {
    setDateOfBirth(date);
    setDatePickerVisibility(false);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      let existingData = userSnap.exists() ? userSnap.data() : {};
  
      const userData = {
        about: about.trim() ? about : (existingData.about ?? null),
        gender: gender ? gender : (existingData.gender ?? null),
        country: selectedCountry ? selectedCountry : (existingData.country ?? null),
        state: selectedState ? selectedState : (existingData.state ?? null),
        city: selectedCity ? selectedCity : (existingData.city ?? null),
        dateOfBirth: dateOfBirth ? dateOfBirth.toISOString() : (existingData.dateOfBirth ?? null), 
      };
  
      const infoCompleted = Object.values(userData).every(value => value !== null);
  
      await setDoc(userRef, { ...userData, infoCompleted }, { merge: true });
  
      Toast.show({ type: "success", text1: "Profile Updated" });
      navigation.replace("HealthInfoScreen");
    } catch (error) {
      Toast.show({ type: "error", text1: "Error saving profile" });
    } finally {
      setLoading(false);
    }
  };
  

  const handleSkip = async () => {
    setLoading(true);
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      let existingData = userSnap.exists() ? userSnap.data() : {};
  
      await setDoc(
        userRef,
        {
          about: existingData.about ?? null,
          gender: existingData.gender ?? null,
          country: existingData.country ?? null,
          state: existingData.state ?? null,
          city: existingData.city ?? null,
          dateOfBirth: existingData.dateOfBirth ?? null,
          infoCompleted: false, // Ensuring completion status remains false
        },
        { merge: true }
      );
  
      navigation.replace("HealthInfoScreen");
    } catch (error) {
      Toast.show({ type: "error", text1: "Error skipping profile setup" });
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {fetchingData ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <>
          <Text style={styles.header}>Complete Your Profile</Text>
          <View style={{ width: "100%" , marginTop: 50 }}>
          <UploadImage userId={userId} />

          <TextInput
            style={styles.input}
            placeholder="Tell us about yourself..."
            value={about}
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

          {/* Country Dropdown */}
          <Dropdown
            style={styles.dropdown}
            data={countries}
            labelField="label"
            valueField="value"
            placeholder="Select Country"
            value={selectedCountry}
            onChange={(item) => {
              setSelectedCountry(item.value);
              setSelectedState(null);
              setSelectedCity(null);
            }}
          />

          {/* State Dropdown */}
          {selectedCountry && (
            <Dropdown
              style={styles.dropdown}
              data={states}
              labelField="label"
              valueField="value"
              placeholder="Select State"
              value={selectedState}
              onChange={(item) => {
                setSelectedState(item.value);
                setSelectedCity(null);
              }}
            />
          )}

          {/* City Dropdown */}
          {selectedState && (
            <Dropdown
              style={styles.dropdown}
              data={cities}
              labelField="label"
              valueField="value"
              placeholder="Select City"
              value={selectedCity}
              onChange={(item) => setSelectedCity(item.value)}
            />
          )}

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip} disabled={loading}>
              {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.buttonText}>Skip</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
              {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.buttonText}>Next</Text>}
            </TouchableOpacity>
          </View>
          </View>

          {/* Progress Bar */}
          <Progress.Bar progress={1 / 3} width={null} height={6} borderRadius={4} color="#007AFF" style={styles.progressBar} />
          <Toast />
        </>
      )}
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
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
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
    marginVertical: 20,
    marginTop: 50,
  },
});
