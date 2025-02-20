import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { BlurView } from "expo-blur";
import { GestureHandlerRootView } from 'react-native-gesture-handler';


// Import Screens
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import HomeScreen from "./screens/HomeScreen";
import OnboardingScreen from "./screens/OnboardingScreen";
import HealthInfoScreen from "./screens/HealthInfoScreen";
import SuccessfulSetup from "./screens/SuccessfulSetup";
import ProfileScreen from "./screens/ProfileScreen";
import MapScreen from "./screens/MapScreen";
import MealPlannerScreen from "./screens/MealPlannerScreen";
import EditProfile from "./screens/EditProfile";

// Recipe Recommender Screens
import ChooseMeal from './screens/recipeRecommender/recipe_recommender_screens/ChooseMeal';
import ChooseIngredients from './screens/recipeRecommender/recipe_recommender_screens/ChooseIngredients';
import GeneratedRecipe from './screens/recipeRecommender/recipe_recommender_screens/GeneratedRecipe';
import AcceptedRecipe from './screens/recipeRecommender/recipe_recommender_screens/AcceptedRecipe';
import ReviewIngredients from './screens/recipeRecommender/recipe_recommender_screens/ReviewIngredients';
import Steps from './screens/recipeRecommender/recipe_recommender_screens/Steps';
import UploadResult from './screens/recipeRecommender/recipe_recommender_screens/UploadResult';
import ShareResult from './screens/recipeRecommender/recipe_recommender_screens/ShareResult';

// Chat Screens
import ChatScreen from "./screens/chat/ChatScreen";
import ChatDetail from "./screens/chat/ChatDetail";
import FriendsList from "./screens/chat/FriendsList";
import BrowseGroupsScreen from "./screens/chat/BrowseGroupScreen";
import GroupProfile from "./screens/chat/GroupProfile";
import GroupChat from "./screens/chat/GroupChat";
import ProfileChat from "./screens/chat/ProfileChat";


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export function RecipeNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ChooseMeal" component={ChooseMeal} />
      <Stack.Screen name="ChooseIngredients" component={ChooseIngredients} />
      <Stack.Screen name="GeneratedRecipe" component={GeneratedRecipe} />
      <Stack.Screen name="AcceptedRecipe" component={AcceptedRecipe} />
      <Stack.Screen name="ReviewIngredients" component={ReviewIngredients} />
      <Stack.Screen name="Steps" component={Steps} />
      <Stack.Screen name="UploadResult" component={UploadResult} />
      <Stack.Screen name="ShareResult" component={ShareResult} />
    </Stack.Navigator>
  );
}

export function ChatNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
      <Stack.Screen name="ChatDetail" component={ChatDetail} />
      <Stack.Screen name="ProfileChat" component={ProfileChat} />
      <Stack.Screen name="FriendsList" component={FriendsList} />
      <Stack.Screen name="BrowseGroups" component={BrowseGroupsScreen} />
      <Stack.Screen name="GroupProfile" component={GroupProfile} />
      <Stack.Screen name="GroupChat" component={GroupChat} />
    </Stack.Navigator>
  );
}

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          position: "absolute",
          borderTopLeftRadius: 40,
          borderTopRightRadius: 40,
          backgroundColor: "transparent",
          elevation: 0,
          shadowOpacity: 0,
          height: 50,
          padding: 20
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
            }}
          />
        ),
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="home" color={color} size={35} />
          ),
        }}
      />
      <Tab.Screen
        name="MealPlanner"
        component={MealPlannerScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="calendar" color={color} size={30} />
          ),
        }}
      />
      <Tab.Screen
        name="ChooseMeal"
        component={RecipeNavigator}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="food" color={color} size={30} />
          ),
        }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="map-marker" color={color} size={30} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => (
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
        <Stack.Screen options={{ headerShown: false }} name="Login" component={LoginScreen} />
        <Stack.Screen options={{ headerShown: false }} name="Register" component={RegisterScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {infoCompleted ? (
        <>
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
          <Stack.Screen name="EditProfile" component={EditProfile} />
          <Stack.Screen name="RecipeNavigator" component={RecipeNavigator} />
          <Stack.Screen name="ChatNavigator" component={ChatNavigator} />
        </>
      ) : (
        <>
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="HealthInfoScreen" component={HealthInfoScreen} />
          <Stack.Screen name="SuccessfulSetup" component={SuccessfulSetup} />
          <Stack.Screen name="EditProfile" component={EditProfile} />
          <Stack.Screen name="RecipeNavigator" component={RecipeNavigator} />
          <Stack.Screen name="ChatNavigator" component={ChatNavigator} />
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default () => {
  return (
    <GestureHandlerRootView style={styles.container}>
      <NavigationContainer>
        <App />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});