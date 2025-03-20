import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

export default function ReviewIngredients({ navigation, route }) {
    // Retrieve the recipe data passed from the previous screen
    const { recipeData } = route.params;

    const handleBack = () => {
        navigation.navigate('Accepted Recipe');
    };

    const handleStartCooking = () => {
        // Assume recipeData.steps contains the steps information
        navigation.navigate('Steps', { stepsData: recipeData.steps, ingredientsData: recipeData.ingredients });
    };

    // Render the ingredients as bullet points by splitting the preformatted ingredients string
    const renderIngredients = () => {
        if (!recipeData.ingredients) return null;
        return recipeData.ingredients.split('\n').map((line, index) => (
            <Text key={index} style={styles.ingredientItem}>
                • {line.trim()}
            </Text>
        ));
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.scrollViewContainer}>
                <View style={styles.container}>
                    <View style={styles.ingredientsContainer}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <MaterialCommunityIcons name="food-steak" size={24} />
                            <Text style={[styles.ingredientsHeader, { marginLeft: 2 }]}>Ingredients:</Text>
                        </View>
                        {renderIngredients()}
                    </View>
                    <View style={styles.buttonWrapper}>
                        <TouchableOpacity style={styles.button} onPress={handleBack}>
                            <Text style={styles.buttonText}>Back</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={handleStartCooking}>
                            <Text style={styles.buttonText}>Start Cooking</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        width: width * 0.99, // Keep the width consistent with screen size
    },
    scrollViewContainer: {
        flexGrow: 1,
    },
    ingredientsContainer: {
        padding: 10,
        backgroundColor: '#edf0f5',
        borderRadius: 8,
        borderWidth: 2,
        borderColor: 'black',
        marginTop: 30,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    ingredientsHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        fontFamily: 'serif',
    },
    ingredientItem: {
        fontSize: 16,
        fontFamily: 'serif',
        marginBottom: 5,
    },
    buttonWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
        marginBottom: 95,
    },
    button: {
        backgroundColor: 'black',
        padding: 10,
        borderRadius: 40,
        alignItems: 'center',
        width: '45%',
        zIndex: 2,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
