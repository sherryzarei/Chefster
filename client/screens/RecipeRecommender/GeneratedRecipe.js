// GeneratedRecipe.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { useAnimatedGestureHandler, useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated';
import Entypo from 'react-native-vector-icons/Entypo';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { runOnJS } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function GeneratedRecipe({ navigation, route }) {
    // Retrieve recipes from navigation parameters
    const { recipes } = route.params;
    // Local state for the recipe deck and rejected recipes
    const [recipeDeck, setRecipeDeck] = useState(recipes);
    const [rejectedRecipes, setRejectedRecipes] = useState([]);

    const translateX = useSharedValue(0);

    const gestureHandler = useAnimatedGestureHandler({
        onActive: (event) => {
            translateX.value = event.translationX;
        },
        onEnd: (event) => {
            if (event.translationX > width / 4) {
                // Accept: swipe right
                translateX.value = withSpring(width, {}, () => {
                    runOnJS(handleAcceptRecipe)(recipeDeck[0]);
                });
            } else if (event.translationX < -width / 4) {
                // Reject: swipe left
                translateX.value = withSpring(-width, {}, () => {
                    runOnJS(handleRejectRecipe)();
                });
            } else {
                translateX.value = withSpring(0);
            }
        },
    });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    // When accepted, navigate to Accepted Recipe screen with accepted recipe data
    const handleAcceptRecipe = (acceptedRecipe) => {
        navigation.navigate('Accepted Recipe', { acceptedRecipe });
        setRecipeDeck((prevDeck) => prevDeck.slice(1));
    };

    // When rejected, remove top card and store it for later
    const handleRejectRecipe = () => {
        setRecipeDeck((prevDeck) => {
            if (prevDeck.length === 0) return prevDeck;
            const [rejected, ...remaining] = prevDeck;
            setRejectedRecipes((prev) => [...prev, rejected]);
            return remaining;
        });
    };

    // Reset: Merge rejected recipes back into the deck and clear rejected list
    const handleResetPosition = () => {
        setRecipeDeck((prevDeck) => [...rejectedRecipes, ...prevDeck]);
        setRejectedRecipes([]);
        translateX.value = withSpring(0);
    };

    if (recipeDeck.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No more recipes available.</Text>
                <View style={styles.buttonWrapper}>
                    <TouchableOpacity style={[styles.resetButtonContainer, {
                        borderBottomColor: 'black',
                        borderBottomWidth: 4,
                        borderColor: 'black'
                    }]} onPress={handleResetPosition}>
                        <Text style={styles.buttonText}>Reset Position</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.resetButtonContainer, {
                        borderBottomColor: 'black',
                        borderBottomWidth: 4,
                    }]} onPress={() => navigation.goBack()}>
                        <Text style={styles.buttonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>

            </View>
        );
    }

    const topRecipe = recipeDeck[0];

    return (
        <View style={{ flex: 1 }}>
            {/* Reset Position Button */}
            <TouchableOpacity
                onPress={handleResetPosition}
                style={[styles.resetButton, { position: 'absolute', top: 30, left: 20, zIndex: 1, padding: 18 }]}
            >
                <Entypo name="back-in-time" size={26} color="white" />
            </TouchableOpacity>
            <PanGestureHandler onGestureEvent={gestureHandler}>
                <Animated.View style={[styles.animatedContainer, animatedStyle]}>
                    <ScrollView contentContainerStyle={styles.scrollViewContainer} showsVerticalScrollIndicator={false}>
                        <View style={styles.container}>
                            {/* Recipe Header */}
                            <View style={styles.headerView}>
                                <Text style={styles.headerText}>{topRecipe.recipe_name}</Text>
                            </View>
                            {/* Recipe Details */}
                            <View style={styles.recipeContainer}>
                                <Image
                                    source={{ uri: topRecipe.image_uri || 'https://via.placeholder.com/250' }}
                                    style={styles.image}
                                />
                                <View style={styles.horizontalContainer}>
                                    <Text style={styles.timeInfoText}>Cooking Time: {topRecipe.cooking_time} min</Text>
                                    <Text style={styles.timeInfoText}>Energy: {topRecipe.energy} kcal</Text>
                                </View>
                            </View>
                            {/* Ingredients Section */}
                            <View style={styles.ingredientsContainer}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                                    <MaterialCommunityIcons name="food-steak" size={24} />
                                    <Text style={[styles.ingredientsHeader, { marginLeft: 2 }]}>Ingredients:</Text>
                                </View>
                                {/* Here we display the preformatted ingredients from r.ingredients */}
                                {topRecipe.ingredients
                                    .split('\n')
                                    .map((line, index) => (
                                        <Text key={index} style={styles.ingredientText}>• {line}</Text>
                                    ))
                                }
                            </View>
                            {/* Steps Section */}
                            <View style={styles.stepsContainer}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Icon name="footsteps-outline" size={24} color="black" />
                                    <Text style={[styles.ingredientsHeader, { marginLeft: 2 }]}>Steps:</Text>
                                </View>
                                {topRecipe.steps && topRecipe.steps.map((step, index) => (
                                    <View key={index}>
                                        <Text style={styles.stepHeader}>Step {index + 1}:</Text>
                                        <Text style={styles.stepText}>{step.description}</Text>
                                    </View>
                                ))}
                            </View>
                            {/* Control Buttons */}
                            <View style={styles.buttonWrapper}>
                                <TouchableOpacity style={[styles.button, { backgroundColor: '#05f5dd' }]} onPress={handleRejectRecipe}>
                                    <Entypo name="cross" size={24} color="black" />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.button} onPress={() => handleAcceptRecipe(topRecipe)}>
                                    <Entypo name="check" size={24} color="white" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </Animated.View>
            </PanGestureHandler>
        </View>
    );
}

const styles = StyleSheet.create({
    animatedContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '95%',
        height: '100%',
        backgroundColor: 'white',
        borderColor: 'black',
        borderWidth: 7,
        borderRadius: 30,
        marginVertical: 100,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 8,
        marginLeft: 10,
    },
    container: { flex: 1, padding: 16 },
    scrollViewContainer: { flexGrow: 1 },
    headerView: {
        borderColor: 'black',
        borderWidth: 3,
        borderRadius: 10,
        backgroundColor: '#edf0f5',
        padding: 30,
        marginBottom: 15,
        alignItems: 'center',
    },
    headerText: { fontWeight: 'bold', fontSize: 20, color: 'black', marginBottom: 10, textAlign: 'center' },
    recipeContainer: {
        borderColor: 'black',
        borderWidth: 3,
        borderRadius: 10,
        padding: 30,
        marginBottom: 10,
        backgroundColor: '#edf0f5',
    },
    image: {
        width: 250,
        height: 250,
        resizeMode: 'cover',
        borderColor: 'black',
        borderWidth: 3,
        borderRadius: 10,
        marginBottom: 20,
        alignSelf: 'center',
    },
    horizontalContainer: {
        flexDirection: 'column',
        justifyContent: 'space-evenly',
        marginBottom: 20,
        padding: 10,
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        borderWidth: 2,
        borderColor: 'black',
    },
    timeInfoText: { fontSize: 16, marginBottom: 5 },
    ingredientsContainer: {
        padding: 10,
        backgroundColor: '#edf0f5',
        borderRadius: 8,
        borderWidth: 2,
        borderColor: 'black',
        marginTop: 20,
    },
    ingredientsHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    ingredientText: { fontSize: 16, marginBottom: 5 },
    stepsContainer: {
        padding: 10,
        borderColor: 'black',
        borderWidth: 2,
        backgroundColor: '#edf0f5',
        marginTop: 20,
        borderRadius: 10,
        marginBottom: 20,
    },
    stepHeader: { fontSize: 18, fontWeight: 'bold', marginVertical: 10, textAlign: 'center' },
    stepText: { fontSize: 16, marginBottom: 5 },
    buttonWrapper: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 },
    button: { backgroundColor: 'black', padding: 10, borderRadius: 40, alignItems: 'center', width: '25%' },
    resetButton: { backgroundColor: 'black', borderRadius: 40 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#edf0f5', borderColor: 'black', borderWidth: 7, borderRadius: 30, marginVertical: 100, shadowColor: 'black', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 8, width: '90%', marginLeft: 18 },
    emptyText: { fontSize: 20, marginBottom: 20 },
    buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
    resetButtonContainer: { backgroundColor: 'black', padding: 10, borderRadius: 30, marginTop: 20, width: '43%', marginRight: 5 },
    resetButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
    backButtonContainer: { backgroundColor: 'black', padding: 10, borderRadius: 30, marginTop: 20, width: '43%' },
    backButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
});
