import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import UploadImage from "../components/Profile/UploadImage";
import { auth, db, storage } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import { Dropdown } from "react-native-element-dropdown";
import axios from "axios";
import DateTimePickerModal from "react-native-modal-datetime-picker";

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

  const MAX_CHAR_COUNT = 250;
  const navigation = useNavigation();
  const API_KEY = "7b65f8485fmsh3ef20429e03668fp1d0a33jsn9f6d1d0df3b5";
  const API_HOST = "wft-geo-db.p.rapidapi.com";

  const genders = ["Male", "Female", "Non-binary", "Prefer not to say"];

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
              limit: 5,
              countryIds: "US,CA,GB,AU",
              sort: "-population",
            },
          }
        );

        const cityList = response.data.data.map((city) => ({
          label: city.city,
          value: city.city,
        }));

        setCities(cityList);
      } catch (error) {
        console.error("Error fetching cities:", error.response ? error.response.data : error);
        Toast.show({
          type: "error",
          text1: "City Fetch Error",
          text2: "Failed to load city list.",
        });
      } finally {
        setFetchingCities(false);
      }
    };

    fetchCities();
  }, []);

  const handleImageSelect = (imageUri) => {
    setProfileImage(imageUri);
  };

  const handleAboutChange = (text) => {
    if (text.length <= MAX_CHAR_COUNT) {
      setAbout(text);
    }
  };

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
        text2: "Could not upload profile image.",
      });
      return null;
    }
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error("User not authenticated");

      const imageUrl = profileImage ? await uploadImageToFirebase(profileImage) : null;
      const userAge = dateOfBirth ? calculateAge(dateOfBirth) : null;

      await setDoc(
        doc(db, "users", userId),
        {
          about,
          gender,
          city,
          dateOfBirth,
          age: userAge,
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

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    setDateOfBirth(date);
    hideDatePicker();
  };

  const handleSkip = () => {
    navigation.replace("HealthInfoScreen");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.centeredContent}>
          <Text style={styles.header}>Complete Your Profile</Text>
          <UploadImage onImageSelect={handleImageSelect} />
        </View>

        <Text style={styles.label}>About You:</Text>
        <TextInput
          style={styles.input}
          placeholder="Tell us about yourself..."
          value={about || ""}
          onChangeText={(text) => setAbout(text)}
          maxLength={250}
          multiline
        />
        <Text style={[styles.charCount, about.length >= MAX_CHAR_COUNT && styles.charCountLimit]}>
          {MAX_CHAR_COUNT - about.length} characters remaining
        </Text>

        <Text style={styles.label}>Gender:</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={gender || ""} onValueChange={(value) => setGender(value)}>
            <Picker.Item label="Select Gender" value="" />
            {genders.map((g, index) => (
              <Picker.Item key={index} label={g} value={g} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Date of Birth:</Text>
        <TouchableOpacity style={styles.datePickerButton} onPress={showDatePicker}>
          <Text>{dateOfBirth ? dateOfBirth.toDateString() : "Select Your Birthdate"}</Text>
        </TouchableOpacity>

        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
        />

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

        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={handleSubmit} style={styles.submitButton} disabled={loading}>
            {loading ? <ActivityIndicator size="small" color="white" /> : <Text style={styles.buttonText}>Submit</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.buttonText}>Skip</Text>
          </TouchableOpacity>
        </View>

        <Toast />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  centeredContent: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
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
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: 40
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
    marginBottom: 30,
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
    backgroundColor: "#ccc",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    flex: 1,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
