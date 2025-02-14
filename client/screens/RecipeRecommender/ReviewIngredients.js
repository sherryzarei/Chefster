import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native'
import React from 'react'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { ScrollView } from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');

export default function ReviewIngredients({ navigation }) {

    const handleBack = () => {
        navigation.navigate('Accepted Recipe');
    }

    const handleStartCooking = () => {
        navigation.navigate('Steps');
    }

    return (
        <ScrollView style={styles.scrollViewContainer}>
            <View style={styles.container}>
                <View style={styles.ingredientsContainer}>
                    <View style={{ flexDirection: 'row' }}>
                        <MaterialCommunityIcons name='food-steak' size={24} />
                        <Text style={[styles.ingredientsHeader, {
                            marginLeft: 2
                        }]}>Ingredients:</Text>
                    </View>
                    <Text style={styles.ingredientItem}>• 1 pound peeled and deveined raw medium shrimp</Text>
                    <Text style={styles.ingredientItem}>• 1/4 cup freshly squeezed lemon juice</Text>
                    <Text style={styles.ingredientItem}>• 1/4 cup freshly squeezed lime juice</Text>
                    <Text style={styles.ingredientItem}>• 2 medium tomatoes, seeded and chopped</Text>
                    <Text style={styles.ingredientItem}>• 1/2 small red onion, finely diced</Text>
                    <Text style={styles.ingredientItem}>• 1 medium jalapeño, seeded and chopped</Text>
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

    )
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
        marginBottom: 95
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
