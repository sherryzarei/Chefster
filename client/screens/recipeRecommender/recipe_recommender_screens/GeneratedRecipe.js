import React, { useState, useCallback } from 'react';
import { View, TouchableOpacity, ScrollView, StyleSheet, Text, Dimensions, SafeAreaView } from 'react-native';
import RecipeCard from '../../components/RecipeCard';
import Entypo from 'react-native-vector-icons/Entypo';
import { useSharedValue, withSpring, runOnJS, withTiming } from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');

const GeneratedRecipe = ({ navigation, route }) => {
    // Retrieve recipes passed via navigation parameters
    const { recipes } = route.params;
    // Local state for the recipe deck and rejected recipes
    const [recipeDeck, setRecipeDeck] = useState(recipes);
    const [rejectedRecipes, setRejectedRecipes] = useState([]);

    // Shared animated value for horizontal translation for the top card only
    const translationX = useSharedValue(0);

    // Accept handler: navigates to Accepted Recipe screen with top card and removes it from the deck.
    const [isTransitioning, setIsTransitioning] = useState(false);

    const handleAcceptRecipe = useCallback((acceptedRecipe) => {
        if (acceptedRecipe && !isTransitioning) {
            setIsTransitioning(true);
            setTimeout(() => {
                setRecipeDeck((prevDeck) => prevDeck.slice(1));
                navigation.navigate('AcceptedRecipe', { acceptedRecipe });
                setIsTransitioning(false);
            }, 250); // Match this with animation duration
        }
    }, [navigation, isTransitioning]);

    const handleRejectRecipe = useCallback(() => {
        if (!isTransitioning) {
            setIsTransitioning(true);
            setTimeout(() => {
                setRecipeDeck((prevDeck) => {
                    if (prevDeck.length === 0) return prevDeck;
                    const [rejected, ...remaining] = prevDeck;
                    setRejectedRecipes((prev) => [...prev, rejected]);
                    return remaining;
                });
                setIsTransitioning(false);
            }, 250); // Match this with animation duration
        }
    }, [isTransitioning]);

    // Reset handler: merge rejected recipes back into the deck.
    const handleResetPosition = () => {
        if (!isTransitioning) {
            setIsTransitioning(true);
            setRecipeDeck((prevDeck) => [...rejectedRecipes, ...prevDeck]);
            setRejectedRecipes([]);
            translationX.value = withTiming(0, {
                duration: 250
            }, () => {
                runOnJS(setIsTransitioning)(false);
            });
        }
    };

    if (recipeDeck.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No more recipes available.</Text>
                <View style={styles.buttonWrapper}>
                    <TouchableOpacity style={styles.resetButtonContainer} onPress={handleResetPosition}>
                        <Text style={styles.buttonText}>Reset Position</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.resetButtonContainer} onPress={() => navigation.goBack()}>
                        <Text style={styles.buttonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // The top recipe is always the first element of the deck.
    const topRecipe = recipeDeck[0];

    // Define a pan gesture for the top card.
    const gesture = Gesture.Pan()
        .enabled(!isTransitioning)
        .onChange((event) => {
            translationX.value = event.translationX;
        })
        .onEnd((event) => {
            if (event.translationX > width / 4) {
                translationX.value = withTiming(width, {
                    duration: 250
                }, () => {
                    runOnJS(handleAcceptRecipe)(topRecipe);
                });
            } else if (event.translationX < -width / 4) {
                translationX.value = withTiming(-width, {
                    duration: 250
                }, () => {
                    runOnJS(handleRejectRecipe)();
                });
            } else {
                translationX.value = withTiming(0, {
                    duration: 150
                });
            }
        });

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <GestureDetector gesture={gesture}>
                <View style={styles.screen}>
                    {/* Reset Position Button */}
                    <TouchableOpacity
                        onPress={handleResetPosition}
                        style={[styles.resetButton, { position: 'absolute', top: 30, left: 20, zIndex: 1, padding: 18 }]}
                    >
                        <Entypo name="back-in-time" size={26} color="white" />
                    </TouchableOpacity>
                    <ScrollView contentContainerStyle={styles.scrollViewContainer} showsVerticalScrollIndicator={false}>
                        <View style={styles.container}>
                            {/* Render the top card with gesture detection */}
                            <RecipeCard
                                recipe={topRecipe}
                                numOfCards={recipeDeck.length}
                                currentIndex={0}
                                translationX={translationX}
                            />
                            {/* Render the rest of the cards statically behind the top card */}
                            {recipeDeck.slice(1).map((recipe, index) => (
                                <RecipeCard
                                    key={recipe.id}
                                    recipe={recipe}
                                    numOfCards={recipeDeck.length}
                                    currentIndex={index + 1}
                                    translationX={{ value: 0 }} // No gesture translation for non-active cards
                                />
                            ))}
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
                </View>
            </GestureDetector>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollViewContainer: {
        flexGrow: 1,
        alignItems: 'center',
        paddingVertical: 20,
    },
    container: {
        flex: 1,
        padding: 16,
        alignItems: 'center',
        marginTop: 80,
    },
    resetButton: {
        backgroundColor: 'black',
        borderRadius: 40,
        marginTop: 10,
    },
    buttonWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
        width: '100%',
        position: 'absolute',
        bottom: 30,
    },
    button: {
        backgroundColor: 'black',
        padding: 10,
        borderRadius: 40,
        alignItems: 'center',
        width: '25%',
        zIndex: 2,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#edf0f5',
        borderColor: 'black',
        borderWidth: 7,
        borderRadius: 30,
        marginVertical: 100,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 8,
        width: '90%',
        alignSelf: 'center',
    },
    emptyText: { fontSize: 20, marginBottom: 20 },
    buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
    resetButtonContainer: { backgroundColor: 'black', padding: 10, borderRadius: 30, marginTop: 20, width: '43%', marginRight: 5 },
});

export default GeneratedRecipe;