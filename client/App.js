import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { auth, db } from './firebase';
import { doc, getDoc } from "firebase/firestore";
import Toast from 'react-native-toast-message';

// Recipe Recommender Screens
import ChooseMeal from './recipe_recommender_screens/ChooseMeal';
import ChooseIngredients from './recipe_recommender_screens/ChooseIngredients';
import GeneratedRecipe from './recipe_recommender_screens/GeneratedRecipe';
import AcceptedRecipe from './recipe_recommender_screens/AcceptedRecipe';
import ReviewIngredients from './recipe_recommender_screens/ReviewIngredients';
import Steps from './recipe_recommender_screens/Steps';
import UploadResult from './recipe_recommender_screens/UploadResult';
import ShareResult from './recipe_recommender_screens/ShareResult';

// User Screens
import LoginScreen from "./user_screens/LoginScreen";
import RegisterScreen from "./user_screens/RegisterScreen";
import HomeScreen from "./user_screens/HomeScreen";
import OnboardingScreen from "./user_screens/OnboardingScreen";
import HealthInfoScreen from "./user_screens/HealthInfoScreen";
import SuccessfulSetup from "./user_screens/SuccessfulSetup";
import ProfileScreen from "./user_screens/ProfileScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [infoCompleted, setInfoCompleted] = useState(false);

  const onAuthStateChanged = async (currentUser) => {
    if (currentUser) {
      if (currentUser.emailVerified) {
        setUser(currentUser);

        // Fetch user data from Firestore to check `infoCompleted`
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
    return subscriber; // Unsubscribe on unmount
  }, []);

  if (initializing) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={!user ? "Login" : "Profile"}>
          {/* User Flow */}
          {!user ? (
            <>
              <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Register"
                component={RegisterScreen}
                options={{ headerShown: false }}
              />
            </>
          ) : (
            <>
              {infoCompleted ? (
                <Stack.Screen
                  name="Profile"
                  component={ProfileScreen}
                  options={{ headerShown: false }}
                />
              ) : (
                <>
                  <Stack.Screen
                    name="Onboarding"
                    component={OnboardingScreen}
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="HealthInfoScreen"
                    component={HealthInfoScreen}
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="SuccessfulSetup"
                    component={SuccessfulSetup}
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="Profile"
                    component={HomeScreen}
                    options={{ headerShown: false }}
                  />
                </>
              )}
            </>
          )}

          {/* Recipe Recommender Flow */}
          <Stack.Screen name="Recipe Recommender" component={ChooseMeal}
            options={{
              headerStyle: {
                backgroundColor: "black"
              },
              headerTintColor: "white",
              headerTitleStyle: {
                fontWeight: "bold",
                fontSize: 20
              }
            }} />
          <Stack.Screen name="Choose Ingredients" component={ChooseIngredients}
            options={{
              headerStyle: {
                backgroundColor: "black"
              },
              headerTintColor: "white",
              headerTitleStyle: {
                fontWeight: "bold",
                fontSize: 20
              }
            }}
          />
          <Stack.Screen name="Recipe" component={GeneratedRecipe}
            options={{
              headerStyle: {
                backgroundColor: "black"
              },
              headerTintColor: "white",
              headerTitleStyle: {
                fontWeight: "bold",
                fontSize: 20
              }
            }}
          />
          <Stack.Screen name="Accepted Recipe" component={AcceptedRecipe}
            options={{
              headerStyle: {
                backgroundColor: "black"
              },
              headerTintColor: "white",
              headerTitleStyle: {
                fontWeight: "bold",
                fontSize: 20
              }
            }}
          />
          <Stack.Screen name="Review Ingredients" component={ReviewIngredients}
            options={{
              headerStyle: {
                backgroundColor: "black"
              },
              headerTintColor: "white",
              headerTitleStyle: {
                fontWeight: "bold",
                fontSize: 20
              }
            }}
          />
          <Stack.Screen name="Steps" component={Steps}
            options={{
              headerStyle: {
                backgroundColor: "black"
              },
              headerTintColor: "white",
              headerTitleStyle: {
                fontWeight: "bold",
                fontSize: 20
              }
            }}
          />
          <Stack.Screen name="Upload Result" component={UploadResult}
            options={{
              headerStyle: {
                backgroundColor: "black"
              },
              headerTintColor: "white",
              headerTitleStyle: {
                fontWeight: "bold",
                fontSize: 20
              }
            }}
          />
          <Stack.Screen name="Share Result" component={ShareResult}
            options={{
              headerStyle: {
                backgroundColor: "black"
              },
              headerTintColor: "white",
              headerTitleStyle: {
                fontWeight: "bold",
                fontSize: 20
              }
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      <Toast />
    </GestureHandlerRootView>
  );
}
