import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import UploadImage from "../../components/Profile/UploadImage";
import { auth, db, storage } from "../../src/firebase-config";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import { Dropdown } from "react-native-element-dropdown";
import axios from "axios";

// import DateTimePickerModal from "react-native-modal-datetime-picker";

const OnboardingScreen = () => {
  const [about, setAbout] = useState("");
  const [gender, setGender] = useState("");
  const [city, setCity] = useState("");
  const [cities, setCities] = useState([]);
  const [dateOfBirth, setDateOfBirth] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingCities, setFetchingCities] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const MAX_CHAR_COUNT = 250; // Max character limit for "About You" section
  const navigation = useNavigation();
  const API_KEY = "7b65f8485fmsh3ef20429e03668fp1d0a33jsn9f6d1d0df3b5"; // ✅ Your API Key
  const API_HOST = "wft-geo-db.p.rapidapi.com";

  const genders = ["Male", "Female", "Non-binary", "Prefer not to say"];

  // Fetch cities from the correct GeoDB API endpoint
  useEffect(() => {
    const fetchCities = async () => {
      setFetchingCities(true);
      try {
        const response = await axios.get(
          "https://wft-geo-db.p.rapidapi.com/v1/geo/cities",
          {
            headers: {
              "X-RapidAPI-Key": API_KEY,
              "X-RapidAPI-Host": API_HOST,
            },
            params: {
              limit: 5, // Adjust to load more cities
              countryIds: "US,CA,GB,AU", // Fetch cities from selected countries
              sort: "-population", // Sort by largest population
            },
          }
        );

        const cityList = response.data.data.map((city) => ({
          label: city.city,
          value: city.city,
        }));

        setCities(cityList);
      } catch (error) {
        console.error(
          "Error fetching cities:",
          error.response ? error.response.data : error
        );
        Toast.show({
          type: "error",
          text1: "City Fetch Error",
          text2: "Failed to load city list. Check your API key and limits.",
        });
      } finally {
        setFetchingCities(false);
      }
    };

    fetchCities();
  }, []);

  // Handle Image Selection
  const handleImageSelect = (imageUri) => {
    setProfileImage(imageUri);
  };

  // Handle "About You" Input
  const handleAboutChange = (text) => {
    if (text.length <= MAX_CHAR_COUNT) {
      setAbout(text);
    }
  };

  // Upload Image to Firebase Storage
  const uploadImageToFirebase = async (uri) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error("User not authenticated");

      const response = await fetch(uri);
      const blob = await response.blob();

      const storageRef = ref(storage, `profilePictures/${userId}.jpg`);
      await uploadBytes(storageRef, blob);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error("Image upload failed:", error);
      Toast.show({
        type: "error",
        text1: "Upload Failed",
        text2: "Could not upload profile image. Please try again.",
      });
      return null;
    }
  };

  // Submit Form Data and Navigate to HealthInfoScreen
  // const handleSubmit = async () => {
  //   setLoading(true);

  //   try {
  //     const userId = auth.currentUser?.uid;
  //     if (!userId) throw new Error("User not authenticated");

  //     // Upload profile image if selected
  //     const imageUrl = profileImage ? await uploadImageToFirebase(profileImage) : null;

  //     // Save user data in Firestore
  //     await setDoc(doc(db, "users", userId), {
  //       about,
  //       gender,
  //       city,
  //       dateOfBirth,
  //       profileImage: imageUrl,
  //       infoCompleted: true, // Marks onboarding as complete
  //   }, { merge: true });  // ✅ This prevents overwriting existing data (firstName, lastName)

  //     Toast.show({
  //       type: "success",
  //       text1: "Profile Updated",
  //       text2: "Your profile has been successfully saved!",
  //     });

  //     navigation.replace("HealthInfoScreen"); // ✅ Navigate to HealthInfoScreen

  //   } catch (error) {
  //     console.error("Onboarding failed:", error);
  //     Toast.show({
  //       type: "error",
  //       text1: "Error",
  //       text2: "Something went wrong. Please try again.",
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--; // Adjust if the birthday hasn't occurred this year
    }

    return age;
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error("User not authenticated");

      const imageUrl = profileImage
        ? await uploadImageToFirebase(profileImage)
        : null;
      const userAge = dateOfBirth ? calculateAge(dateOfBirth) : null;

      // Save user data in Firestore
      await setDoc(
        doc(db, "users", userId),
        {
          about,
          gender,
          city,
          dateOfBirth,
          age: userAge, // ✅ Save calculated age
          profileImage: imageUrl,
          infoCompleted: true,
        },
        { merge: true }
      );

      Toast.show({
        type: "success",
        text1: "Profile Updated",
        text2: "Your profile has been successfully saved!",
      });

      navigation.replace("HealthInfoScreen");
    } catch (error) {
      console.error("Onboarding failed:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to show the date picker modal
  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  // Function to hide the date picker modal
  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  // Function to handle the selected date
  const handleConfirm = (date) => {
    setDateOfBirth(date);
    hideDatePicker();
  };

  // Skip Onboarding & Go to Health Info Screen
  const handleSkip = () => {
    navigation.replace("HealthInfoScreen"); // ✅ Navigate to HealthInfoScreen
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Complete Your Profile</Text>

      {/* Profile Image Upload */}
      <UploadImage onImageSelect={handleImageSelect} />

      {/* About Section with Character Countdown */}
      <Text style={styles.label}>About You:</Text>
      <TextInput
        style={styles.input}
        placeholder="Tell us about yourself..."
        value={about || ""} // ✅ Ensure value is never null
        onChangeText={(text) => setAbout(text)}
        maxLength={250}
        multiline
      />
      <Text
        style={[
          styles.charCount,
          about.length >= MAX_CHAR_COUNT && styles.charCountLimit,
        ]}
      >
        {MAX_CHAR_COUNT - about.length} characters remaining
      </Text>

      {/* Gender Selection */}
      <Text style={styles.label}>Gender:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={gender || ""}
          onValueChange={(value) => setGender(value)}
        >
          <Picker.Item label="Select Gender" value="" />
          {genders.map((g, index) => (
            <Picker.Item key={index} label={g} value={g} />
          ))}
        </Picker>
      </View>

      {/* Date of Birth Selection */}
      <Text style={styles.label}>Date of Birth:</Text>
      <TouchableOpacity
        style={styles.datePickerButton}
        onPress={showDatePicker}
      >
        <Text>
          {dateOfBirth ? dateOfBirth.toDateString() : "Select Your Birthdate"}
        </Text>
      </TouchableOpacity>

      {/* <DateTimePickerModal
  isVisible={isDatePickerVisible}
  mode="date"
  onConfirm={handleConfirm}
  onCancel={hideDatePicker}
/> */}

      {/* City Selection */}
      <Text style={styles.label}>City:</Text>
      {fetchingCities ? (
        <ActivityIndicator size="small" color="#0782F9" />
      ) : (
        <Dropdown
          style={styles.dropdown}
          data={cities}
          search
          labelField="label"
          valueField="value"
          placeholder="Search or select a city"
          value={city}
          onChange={(item) => setCity(item.value)}
        />
      )}

      {/* Submit & Skip Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={handleSubmit}
          style={styles.submitButton}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.buttonText}>Submit</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.buttonText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <Toast />
    </View>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  charCount: {
    alignSelf: "flex-end",
    marginRight: 10,
    fontSize: 12,
    color: "#666",
  },
  charCountLimit: {
    color: "red",
  },
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    width: "100%",
    textAlignVertical: "top",
    marginBottom: 10,
  },
  pickerContainer: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
  },
  dropdown: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    width: "100%",
    alignItems: "center",
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
