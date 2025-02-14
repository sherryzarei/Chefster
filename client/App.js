import React, { useState, useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import {TouchableOpacity} from 'react-native';
import Icon from "react-native-vector-icons/Ionicons";
import "react-native-reanimated";
import "react-native-gesture-handler";

import ChooseMeal from "./screens/RecipeRecommender/ChooseMeal";
import ChooseIngredients from "./screens/RecipeRecommender/ChooseIngredients";
import GeneratedRecipe from "./screens/RecipeRecommender/GeneratedRecipe";
import AcceptedRecipe from "./screens/RecipeRecommender/AcceptedRecipe";
import ReviewIngredients from "./screens/RecipeRecommender/ReviewIngredients";
import Steps from "./screens/RecipeRecommender/Steps";
import UploadResult from "./screens/Home/UploadResult";
import ShareResult from "./screens/RecipeRecommender/ShareResult";
import FriendsList from "./screens/Chat/FriendsList";
import ChatScreen from "./screens/Chat/ChatScreen";
import ChatDetail from "./screens/Chat/ChatDetail";
import ProfileScreen from "./screens/Chat/Profile";
import RegisterScreen from "./screens/Home/RegisterScreen";
import LoginScreen from "./screens/Home/LoginScreen";
import OnboardingScreen from "./screens/Home/OnboardingScreen";
import HomeScreen from "./screens/Home/HomeScreen";
import { app } from "./src/firebase-config"; // Ensure you import your Firebase configuration
import HealthInfoScreen from "./screens/Home/HealthInfoScreen";
import SuccessfulSetup from "./screens/Home/SuccessfulSetup";
import Profile from "./screens/Chat/Profile";
import GroupChat from "./screens/Chat/GroupChat";
import BrowseGroupsScreen from "./screens/Chat/BrowseGroupScreen";
import GroupProfile from "./screens/Chat/GroupProfile";

const Stack = createNativeStackNavigator();
const auth = getAuth(app);
const db = getFirestore(app);

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);
  const [infoCompleted, setInfoCompleted] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // Fetch user data from Firestore
        const userDocRef = doc(db, "users", currentUser.uid);
        const userSnapshot = await getDoc(userDocRef);

        if (userSnapshot.exists()) {
          setInfoCompleted(userSnapshot.data().infoCompleted);
        }
      } else {
        setInfoCompleted(false); // Default state for new users
      }

      setInitializing(false); // Mark initialization as complete
    });

    return () => unsubscribe();
  }, []);

  if (initializing) return null; // Prevent rendering until authentication check is complete

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator>
          {user ? (
            infoCompleted ? (
              <Stack.Screen name="Home" component={HomeScreen} />
            ) : (
              <Stack.Screen
                name="Onboarding"
                component={OnboardingScreen}
                options={{ headerShown: false }}
              />
            )
          ) : (
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
            </>
          )}

          {/* Other Screens */}
          <Stack.Screen name="Recipe Recommender" component={ChooseMeal} />
          <Stack.Screen
            name="Choose Ingredients"
            component={ChooseIngredients}
          />
          <Stack.Screen name="Recipe" component={GeneratedRecipe} />
          <Stack.Screen name="Accepted Recipe" component={AcceptedRecipe} />
          <Stack.Screen
            name="Review Ingredients"
            component={ReviewIngredients}
          />
          <Stack.Screen name="Steps" component={Steps} />
          <Stack.Screen name="Upload Result" component={UploadResult} />
          <Stack.Screen name="Share Result" component={ShareResult} />
          {/* <Stack.Screen name="ChatScreen" component={ChatScreen} /> */}
          <Stack.Screen
              name="ChatScreen"
              component={ChatScreen}
          />

          <Stack.Screen 
            name="BrowseGroups" 
            component={BrowseGroupsScreen} 
            options={{ title: 'Browse Groups' }}
          />
          <Stack.Screen name="FriendsList" component={FriendsList} />
          <Stack.Screen
            name="ChatDetail"
            component={ChatDetail}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="HealthInfoScreen"
            component={HealthInfoScreen}
            options={{ headerShown: false }} // ✅ Add this screen to the stack
          />
          <Stack.Screen
            name="SuccessfulSetup"
            component={SuccessfulSetup}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ProfileScreen"
            component={ProfileScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Profile"
            component={Profile}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="GroupProfile"
            component={GroupProfile}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="GroupChat"
            component={GroupChat}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
