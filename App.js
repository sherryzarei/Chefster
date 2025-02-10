import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { BlurView } from "expo-blur";


// Import Screens
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import HomeScreen from "./screens/HomeScreen";
import OnboardingScreen from "./screens/OnboardingScreen";
import HealthInfoScreen from "./screens/HealthInfoScreen";
import SuccessfulSetup from "./screens/SuccessfulSetup";
import ProfileScreen from "./screens/ProfileScreen";
import MapScreen from "./screens/MapScreen";
import RecipeRecommenderScreen from "./screens/RecipeRecommenderScreen";
import MealPlannerScreen from "./screens/MealPlannerScreen";
import EditProfile from "./screens/EditProfile";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          position: "absolute",
          borderTopLeftRadius: 40,
          borderTopRightRadius: 40,
          backgroundColor: "transparent",  // Ensure no white background
          elevation: 0, // Remove shadow on Android
          shadowOpacity: 0, // Remove shadow on iOS
          height: 50,
          padding: 20 // Adjust height as needed
        },
        tabBarShowLabel: false,
        headerShown: false,
        tabBarBackground: () => (
          <BlurView
            intensity={80} 
            style={{
              ...StyleSheet.absoluteFillObject,
              borderTopLeftRadius: 40,
              borderTopRightRadius: 40,
              overflow: "hidden",
              backgroundColor: "transparent",
              height: 100,
              tint: "dark",

            }} // Adjust for stronger or weaker blur
            // tint="light"    // Can be "light", "dark", or "default"
            // style={StyleSheet.absoluteFill}
          />
        ),
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" color={color} size={35} />
          ),
        }}
      />
      <Tab.Screen
        name="MealPlanner"
        component={MealPlannerScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="calendar" color={color} size={30} />
          ),
        }}
      />

      <Tab.Screen
        name="RecipeRecommender"
        component={RecipeRecommenderScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="food" color={color} size={30} />
          ),
        }}
      />
      
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="map-marker" color={color} size={30} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="account" color={color} size={30} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export function App() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [infoCompleted, setInfoCompleted] = useState(false);

  const onAuthStateChanged = async (currentUser) => {
    if (currentUser) {
      if (currentUser.emailVerified) {
        setUser(currentUser);
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setInfoCompleted(userDoc.data().infoCompleted || false);
        }
      } else {
        auth.signOut();
        setUser(null);
      }
    } else {
      setUser(null);
    }
    if (initializing) setInitializing(false);
  };

  useEffect(() => {
    const subscriber = auth.onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  if (initializing) return null;

  if (!user) {
    return (
      <Stack.Navigator>
        <Stack.Screen
          options={{ headerShown: false }}
          name="Login"
          component={LoginScreen}
        />
        <Stack.Screen
          options={{ headerShown: false }}
          name="Register"
          component={RegisterScreen}
        />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {infoCompleted ? (
        <>
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
          <Stack.Screen name="EditProfile" component={EditProfile} />
        </>
      ) : (
        <>
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="HealthInfoScreen" component={HealthInfoScreen} />
          <Stack.Screen name="SuccessfulSetup" component={SuccessfulSetup} />
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
          <Stack.Screen name="EditProfile" component={EditProfile} />
        </>
      )}
    </Stack.Navigator>
  );
}


export default () => {
  return (
    <NavigationContainer>
      <App />
    </NavigationContainer>
  );
};
