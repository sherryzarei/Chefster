import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions, ScrollView, StyleSheet as RNStyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';

const { width } = Dimensions.get('screen');

const RecipeCard = React.memo(({ recipe, numOfCards, currentIndex, translationX }) => {
    // Animated style for each card. Only if currentIndex is 0 (the top card)
    const animatedCard = useAnimatedStyle(() => {
        const scale = 1 - currentIndex * 0.1;
        const translateY = -currentIndex * 60;
        const rotation = currentIndex === 0
            ? interpolate(
                translationX.value,
                [-width / 2, 0, width / 2],
                [-15, 0, 15]
            )
            : 0;

        // Only apply opacity interpolation to the active card
        const activeCardOpacity = currentIndex === 0
            ? interpolate(
                Math.abs(translationX.value),
                [0, width / 2],
                [1, 0]
            )
            : 1;

        // Static opacity for inactive cards
        const inactiveCardOpacity = 1 - currentIndex * 0.2;

        return {
            transform: [
                { scale },
                { translateY },
                { translateX: currentIndex === 0 ? translationX.value : 0 },
                { rotateZ: `${rotation}deg` },
            ],
            opacity: currentIndex === 0 ? activeCardOpacity : inactiveCardOpacity,
        };
    }, [currentIndex]);

    return (
        <Animated.View style={[styles.card, animatedCard, { zIndex: numOfCards - currentIndex }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Top Section: Image and Recipe Name */}
                <View style={styles.imageSection}>
                    <Image source={{ uri: recipe.image_uri }} style={styles.image} />
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                        style={[RNStyleSheet.absoluteFillObject, { top: "50%" }]}
                    />
                    <Text style={styles.title}>{recipe.recipe_name}</Text>
                </View>
                {/* Details Section */}
                <View style={styles.detailsSection}>
                    <Text style={styles.subtext}>Cooking Time: {recipe.cooking_time} min</Text>
                    <Text style={styles.subtext}>Energy: {recipe.energy} kcal</Text>
                    <View style={styles.ingredientsContainer}>
                        <View style={styles.ingredientsHeaderContainer}>
                            <MaterialCommunityIcons name="food-steak" size={24} color="black" />
                            <Text style={[styles.ingredientsHeader, { marginLeft: 5 }]}>Ingredients:</Text>
                        </View>
                        {recipe.ingredients.split('\n').map((line, index) => (
                            <Text key={index} style={styles.ingredientText}>
                                • {line.trim()}
                            </Text>
                        ))}
                    </View>
                    <View style={styles.stepsContainer}>
                        <View style={styles.stepsHeaderContainer}>
                            <Icon name="footsteps-outline" size={24} color="black" />
                            <Text style={[styles.ingredientsHeader, { marginLeft: 5 }]}>Steps:</Text>
                        </View>
                        {recipe.steps &&
                            recipe.steps.map((step, index) => (
                                <View key={index} style={styles.stepWrapper}>
                                    <Text style={styles.stepHeader}>Step {index + 1}:</Text>
                                    <Text style={styles.stepText}>{step.description}</Text>
                                </View>
                            ))}
                    </View>
                </View>
            </ScrollView>
        </Animated.View>
    );
});

const styles = StyleSheet.create({
    card: {
        width: width * 0.9,
        aspectRatio: 1 / 1.67,
        borderRadius: 15,
        overflow: 'hidden',
        backgroundColor: '#fff',
        marginBottom: 20,
        borderColor: 'black',
        borderWidth: 2,
        elevation: 3,
        marginTop: 40,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2.22,
        position: 'absolute',
    },
    scrollContent: {
        flexGrow: 1,
    },
    imageSection: {
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: 490,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
    },
    title: {
        fontSize: 24,
        color: 'white',
        fontWeight: 'bold',
        position: 'absolute',
        bottom: 10,
        textAlign: 'center',
        width: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingVertical: 5,
    },
    detailsSection: {
        padding: 10,
    },
    subtext: {
        fontSize: 16,
        color: 'black',
        marginBottom: 5,
        fontWeight: 'bold',
    },
    ingredientsContainer: {
        marginTop: 10,
        backgroundColor: '#edf0f5',
        padding: 10,
        borderRadius: 10,
    },
    ingredientsHeaderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        alignSelf: 'center',
    },
    ingredientsHeader: {
        fontSize: 18,
        color: 'black',
        fontWeight: 'bold',
    },
    ingredientText: {
        fontSize: 16,
        color: 'black',
    },
    stepsContainer: {
        marginTop: 10,
        backgroundColor: '#edf0f5',
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
    },
    stepsHeaderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        alignSelf: 'center',
    },
    stepWrapper: {
        marginBottom: 10,
    },
    stepHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        alignSelf: 'center',
        marginBottom: 5,
    },
    stepText: {
        fontSize: 16,
        color: 'black',
    },
});

export default RecipeCard;