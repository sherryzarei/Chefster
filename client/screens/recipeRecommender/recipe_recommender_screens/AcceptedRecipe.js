import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import Icon from 'react-native-vector-icons/Ionicons';
import { FontAwesome5 } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function AcceptedRecipe({ navigation, route }) {
    // Retrieve the accepted recipe passed via navigation
    const { acceptedRecipe } = route.params;

    // Navigation functions
    const handleBack = () => {
        navigation.navigate('Recipe'); // or use navigation.goBack()
    };

    const handleReviewIngredients = (recipeData) => {
        navigation.navigate('ReviewIngredients', { recipeData });
    };

    // Render the ingredients as bullet points.
    // Assumes acceptedRecipe.ingredients is a newline-separated string.
    const renderIngredients = () => {
        if (!acceptedRecipe.ingredients) return null;
        return acceptedRecipe.ingredients
            .split('\n')
            .map((line, index) => (
                <Text key={index} style={styles.ingredientItem}>
                    • {line.trim()}
                </Text>
            ));
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <TouchableOpacity style={styles.backButton} onPress={() => { navigation.goBack() }}>
                <FontAwesome5 name="arrow-left" size={24} color="white" />
            </TouchableOpacity>
            <ScrollView
                contentContainerStyle={styles.scrollViewContainer}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >

                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.headerView}>
                        <Text style={styles.headerText}>{acceptedRecipe.recipe_name}</Text>
                    </View>

                    {/* Recipe Details Section */}
                    <View style={styles.sectionHeaderContainer}>
                        <MaterialIcons name="list-alt" size={24} />
                        <Text style={styles.sectionHeader}>Recipe Details</Text>
                    </View>
                    <View style={styles.recipeContainer}>
                        <Image
                            source={{ uri: acceptedRecipe.image_uri || 'https://via.placeholder.com/250' }}
                            style={styles.image}
                        />
                        <View style={styles.horizontalContainer}>
                            <Text style={styles.timeInfoText}>Cooking Time: {acceptedRecipe.cooking_time} min</Text>
                            <Text style={styles.timeInfoText}>Energy: {acceptedRecipe.energy} kcal</Text>
                        </View>
                        <View style={styles.horizontalContainer}>
                            <Text style={styles.courseInfoText}>Serves: {acceptedRecipe.servings}</Text>
                        </View>
                    </View>

                    {/* Ingredients Section */}
                    <View style={styles.ingredientsContainer}>
                        <View style={styles.sectionHeaderContainer}>
                            <MaterialCommunityIcons name="food-steak" size={24} />
                            <Text style={[styles.sectionHeader, { marginLeft: 2 }]}>Ingredients</Text>
                        </View>
                        {renderIngredients()}
                    </View>

                    {/* Steps Section */}
                    <View style={styles.stepsContainer}>
                        <View style={styles.sectionHeaderContainer}>
                            <Icon name="footsteps-outline" size={24} color="black" />
                            <Text style={[styles.sectionHeader, { marginLeft: 2 }]}>Steps</Text>
                        </View>
                        {acceptedRecipe.steps &&
                            acceptedRecipe.steps.map((step, index) => (
                                <View key={index} style={styles.stepWrapper}>
                                    <Text style={styles.stepHeader}>Step {index + 1}:</Text>
                                    <Text style={styles.stepText}>{step.description}</Text>
                                </View>
                            ))}
                    </View>

                    {/* Control Buttons */}
                    <View style={styles.buttonWrapper}>
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: '#05f5dd' }]}
                            onPress={() => {
                                console.log('Back button pressed');
                                handleBack();
                            }}
                        >
                            <Entypo name="cross" size={24} color="black" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => {
                                console.log('Review Ingredients button pressed');
                                handleReviewIngredients(acceptedRecipe);
                            }}
                        >
                            <Entypo name="check" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    scrollViewContainer: { flexGrow: 1 },
    container: { flex: 1, padding: 20, width: width, marginTop: 30 },
    headerView: {
        borderColor: 'black',
        borderWidth: 3,
        borderRadius: 10,
        backgroundColor: '#edf0f5',
        padding: 30,
        marginBottom: 5,
        alignItems: 'center',
    },
    backButton: {
        position: "absolute",
        top: 10,
        left: 10,
        zIndex: 1,
        backgroundColor: "black",
        borderRadius: 20,
        padding: 10,
        shadowColor: "black",
        shadowOffset: { width: 2, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
        borderBottomWidth: 4,
        borderRightWidth: 4,
        marginTop: 30

    },
    headerText: {
        fontWeight: 'bold',
        fontFamily: 'serif',
        fontSize: 20,
        color: 'black',
        textAlign: 'center',
        marginBottom: 10,
    },
    sectionHeaderContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 10,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 5,
    },
    recipeContainer: {
        borderColor: 'black',
        borderWidth: 3,
        borderRadius: 10,
        padding: 20,
        backgroundColor: '#edf0f5',
        marginBottom: 15,
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
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 10,
    },
    timeInfoText: {
        fontSize: 16,
    },
    courseInfoText: {
        fontSize: 16,
    },
    ingredientsContainer: {
        padding: 15,
        backgroundColor: '#edf0f5',
        borderRadius: 10,
        borderWidth: 2,
        borderColor: 'black',
        marginBottom: 15,
    },
    ingredientItem: {
        fontSize: 16,
        fontFamily: 'serif',
        marginBottom: 5,
    },
    stepsContainer: {
        padding: 15,
        borderColor: 'black',
        borderWidth: 2,
        backgroundColor: '#edf0f5',
        borderRadius: 10,
        marginBottom: 15,
    },
    stepWrapper: {
        marginBottom: 10,
    },
    stepHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 5,
        textAlign: 'center',
        fontFamily: 'serif',
    },
    stepText: {
        fontSize: 16,
        marginBottom: 5,
        fontFamily: 'serif',
    },
    buttonWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
        marginBottom: 25,
    },
    button: {
        backgroundColor: 'black',
        padding: 10,
        borderRadius: 40,
        alignItems: 'center',
        width: '25%',
        zIndex: 2,
    },
});
