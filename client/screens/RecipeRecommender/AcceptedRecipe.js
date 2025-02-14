import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity } from 'react-native';
import { ScrollView, PanGestureHandler } from 'react-native-gesture-handler';
import React from 'react'
import Entypo from 'react-native-vector-icons/Entypo';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'


const { width, height } = Dimensions.get('window');

export default function AcceptedRecipe({ navigation }) {


    const handleBack = () => {
        navigation.navigate('Recipe')
    }

    const handleReviewIngredients = () => {
        navigation.navigate('Review Ingredients')
    }



    return (
        <ScrollView
            contentContainerStyle={styles.scrollViewContainer}
            showsVerticalScrollIndicator={false} // Remove vertical scrollbar
            keyboardShouldPersistTaps="handled"
        >
            <View style={styles.container}>
                <View style={styles.headerView}>
                    <Text style={styles.headerText}>Easy Shrimp Ceviche</Text>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                    <MaterialIcons name='list-alt' size={24} />
                    <Text style={[styles.headerText, styles.sectionHeader]}>Recipe Details</Text>
                </View>

                <View style={styles.recipeContainer}>
                    <Image
                        source={{
                            uri: 'https://i.pinimg.com/736x/72/d9/af/72d9af964d384fc2a16fd087c1062a7c.jpg',
                        }}
                        style={styles.image}
                    />

                    <View style={styles.horizontalContainer}>
                        <Text style={styles.timeInfoText}>Prep Time: 10min</Text>
                        <Text style={styles.timeInfoText}>Cook Time: 20min</Text>
                        <Text style={styles.timeInfoText}>Total Time: 30min</Text>
                    </View>

                    <View style={styles.horizontalContainer}>
                        <Text style={styles.courseInfoText}>Course: Main</Text>
                        <Text style={styles.courseInfoText}>Cuisine: Italian</Text>
                        <Text style={styles.courseInfoText}>Serves: 4</Text>
                    </View>
                </View>

                {/* Ingredients Section */}
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



                {/* Steps Section */}
                <View style={styles.stepsContainer}>
                    <View style={{ flexDirection: 'row' }}>
                        <Icon name='footsteps-outline' size={24} color='black' />
                        <Text style={[styles.ingredientsHeader, {
                            marginLeft: 2
                        }]}>Steps:</Text>
                    </View>

                    <Text style={styles.stepHeader}>Step 1:</Text>
                    <Text style={styles.stepText}>
                        Bring a large pot of salted water to a boil over high heat.
                    </Text>
                    <Text style={styles.stepHeader}>Step 2:</Text>
                    <Text style={styles.stepText}>
                        Turn off the heat, add the shrimp, and poach until the shrimp are opaque and just cooked through.
                    </Text>
                    <Text style={styles.stepHeader}>Step 3:</Text>
                    <Text style={styles.stepText}>
                        Drain and set aside until cool enough to handle.
                    </Text>

                    <Text style={styles.stepHeader}>Step 4:</Text>
                    <Text style={styles.stepText}>
                        Chop the cooked shrimp into 1/2-inch pieces and place in a large bowl.
                    </Text>
                    <Text style={styles.stepHeader}>Step 5:</Text>
                    <Text style={styles.stepText}>
                        Add the lemon juice, lime juice, tomatoes, red onion, jalapeño, cilantro, and salt.
                    </Text>
                    <Text style={styles.stepHeader}>Step 6:</Text>
                    <Text style={styles.stepText}>
                        Toss to combine. Cover and refrigerate for at least 1 hour.
                    </Text>

                    <Text style={styles.stepHeader}>Step 7:</Text>
                    <Text style={styles.stepText}>
                        Just before serving, dice the avocado and add it to the ceviche.
                    </Text>
                    <Text style={styles.stepHeader}>Step 8:</Text>
                    <Text style={styles.stepText}>
                        Gently toss to combine. Serve with tostadas or tortilla chips.
                    </Text>
                </View>

                {/* Control Buttons */}
                <View style={styles.buttonWrapper}>
                    <TouchableOpacity style={[styles.button, { backgroundColor: '#05f5dd' }]}
                        onPress={() => {
                            console.log('Back button pressed');
                            handleBack();
                        }} >
                        <Entypo name="cross" size={24} color="black" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button}
                        onPress={() => {
                            console.log('Review Ingredients button pressed');
                            handleReviewIngredients();
                        }} >
                        <Entypo name="check" size={24} color="white" />
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
        width: width * 1, // Keep the width consistent with screen size
    },
    scrollViewContainer: {
        flexGrow: 1,
    },
    headerView: {
        borderColor: 'black',
        borderWidth: 3,
        borderRadius: 10,
        backgroundColor: '#edf0f5',
        padding: 30,
        marginBottom: 15,
        textAlign: 'center',
        alignItems: 'center',
    },
    headerText: {
        fontWeight: 'bold',
        fontFamily: 'serif',
        fontSize: 20,
        color: 'black',
        textAlign: 'center',
        marginBottom: 10
    },
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
        marginLeft: 10
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
    ingredientsContainer: {
        padding: 10,
        backgroundColor: '#edf0f5',
        borderRadius: 8,
        borderWidth: 2,
        borderColor: 'black',
        marginTop: 20,
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
    stepsContainer: {
        padding: 10,
        borderColor: 'black',
        borderWidth: 2,
        backgroundColor: '#edf0f5',
        marginTop: 20,
        borderRadius: 10,
        marginBottom: 20,
    },
    stepHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 10,
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
        marginBottom: 95
    },
    button: {
        backgroundColor: 'black',
        padding: 10,
        borderRadius: 40,
        alignItems: 'center',
        width: '25%',
        zIndex: 2
    },
});
