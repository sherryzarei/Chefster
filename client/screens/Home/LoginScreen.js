import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { auth, db } from "../../src/firebase-config";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
// import { GoogleSigninButton } from "@react-native-google-signin/google-signin";
// import {
//   AppleButton,
//   appleAuth,
// } from "@invertase/react-native-apple-authentication";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorFields, setErrorFields] = useState({});
  const navigation = useNavigation();

  const showToast = (type, title, message) => {
    Toast.show({
      type,
      text1: title,
      text2: message,
    });
  };

  const validateInputs = () => {
    const errors = {};
    if (!email.trim()) errors.email = "Email is required.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim()))
      errors.email = "Please enter a valid email address.";
    if (!password.trim()) errors.password = "Password is required.";

    setErrorFields(errors);

    if (Object.keys(errors).length > 0) {
      showToast("error", "Invalid Inputs", Object.values(errors).join("\n"));
      return false;
    }
    return true;
  };

  const loginUser = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    try {
      const userCredentials = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      const user = userCredentials.user;

      // Check if the email is verified
      if (!user.emailVerified) {
        await auth.signOut(); // Sign out the unverified user
        showToast(
          "error",
          "Email Not Verified",
          "Please verify your email before logging in. Check your inbox for the verification link."
        );
        return; // Exit the function to prevent navigation
      }

      console.log("Logged in with:", user.email);

      // Check if the user has completed optional info
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const { infoCompleted } = userDoc.data();
        if (infoCompleted) {
          // Navigate to HomeScreen
          showToast(
            "success",
            "Login Successful",
            `Welcome back, ${user.email}!`
          );
          navigation.replace("Home");
        } else {
          // Navigate to OnboardingScreen
          showToast(
            "info",
            "Complete Your Profile",
            "Please provide more information to complete your profile."
          );
          navigation.replace("Onboarding");
        }
      } else {
        showToast(
          "error",
          "Login Error",
          "User data not found. Please contact support."
        );
      }
    } catch (error) {
      console.log("Error:", error); // Log the entire error object for more details
      const errorMessages = {
        "auth/user-not-found": "No user found with this email.",
        "auth/wrong-password": "Incorrect password. Please try again.",
        "auth/invalid-email": "Invalid email address.",
      };
      showToast(
        "error",
        "Login Failed",
        errorMessages[error.code] || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <Image
        style={styles.largeLogo}
        source={require("../../assets/logo-large.jpeg")}
      />
      <Text style={{ fontSize: 24, marginBottom: 20, fontWeight: "bold" }}>
        Login
      </Text>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setErrorFields({ ...errorFields, email: null });
          }}
          style={[
            styles.input,
            errorFields.email && { borderColor: "red", borderWidth: 1 },
          ]}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setErrorFields({ ...errorFields, password: null });
          }}
          style={[
            styles.input,
            errorFields.password && { borderColor: "red", borderWidth: 1 },
          ]}
          secureTextEntry
        />
      </View>
      <View style={styles.buttonContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#0782F9" />
        ) : (
          <TouchableOpacity onPress={loginUser} style={styles.button}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={{ marginTop: 20, marginBottom: 20, fontSize: 15 }}>
        New to Chefster?{" "}
        <Text
          onPress={() => navigation.navigate("Register")}
          style={{ color: "#0782F9" }}
        >
          Register
        </Text>
      </Text>
      {/* <GoogleSigninButton
        size={GoogleSigninButton.Size.Standard}
        color={GoogleSigninButton.Color.Dark}
        style={{ width: 192, height: 48, marginTop: 20, marginBottom: 10 }}
        onPress={() => {
          // initiate sign in
        }}
        // disabled={isInProgress}
      /> */}
      ;
      {/* <AppleButton
        buttonStyle={AppleButton.Style.white}
        buttonType={AppleButton.Type.SIGN_IN}
        style={{
          width: 192, // You must specify a width
          height: 40, // You must specify a height
        }}
        onPress={() => onAppleButtonPress()}
      /> */}
      <Toast />
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  inputContainer: {
    width: "80%",
  },
  input: {
    backgroundColor: "white",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 5,
  },
  buttonContainer: {
    width: "60%",
    marginTop: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    backgroundColor: "#0782F9",
    width: "100%",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  largeLogo: {
    width: 200,
    height: 200,
    marginBottom: 20,
    borderRadius: 100,
  },
});
