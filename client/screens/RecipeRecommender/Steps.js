import { View, Text, TouchableOpacity, StyleSheet, Modal, Dimensions, Alert } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import React, { useState } from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

export default function Steps({ navigation }) {
    const [isIngredientsVisible, setIngredientsVisible] = useState(false);
    const [isStepsVisible, setStepsVisible] = useState(false);

    const handleStepClick = (stepNumber) => {
        Alert.alert(`Step ${stepNumber}`, `You clicked on Step ${stepNumber}`);
    };

    const handleTransfer = () => {
        navigation.navigate('Upload Result')
    }
    const handleTransferBack = () => {
        navigation.navigate('Review Ingredients')
    }


    return (
        <ScrollView contentContainerStyle={styles.scrollViewContainer}>
            <View style={styles.container}>
                <View style={styles.headerView}>
                    <Text style={styles.headerText}>Easy Shrimp Ceviche</Text>
                </View>

                <View style={styles.stepsContainer}>
                    <View style={styles.buttonWrapper}>
                        {/* Steps Button */}
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => setStepsVisible(true)}
                        >
                            <MaterialCommunityIcons name='form-select' size={28} color='white' />
                        </TouchableOpacity>

                        {/* Ingredients Button */}
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => setIngredientsVisible(true)}
                        >
                            <MaterialCommunityIcons name='food-turkey' size={28} color='white' />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.stepHeader}>Step: 1</Text>
                    <Text style={styles.stepText}>
                        Bring a large pot of salted water to a boil over high heat. Once it is boiled, turn off the heat, add the shrimp, and poach until the shrimp are opaque and just cooked through.
                    </Text>

                    <View style={styles.buttonWrapper}>
                        <TouchableOpacity style={styles.navButton}>
                            <Text style={styles.stepButtonText}>Previous Step</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.navButton} onPress={handleTransfer}>
                            <Text style={styles.stepButtonText}>Next Step</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </View>

            {/* Ingredients Modal */}
            <Modal
                visible={isIngredientsVisible}
                transparent={true}
                animationType='slide'
                onRequestClose={() => setIngredientsVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalHeader}>Ingredients</Text>
                        <ScrollView>
                            <Text style={styles.ingredientItem}>• 1 pound peeled and deveined raw medium shrimp</Text>
                            <Text style={styles.ingredientItem}>• 1/4 cup freshly squeezed lemon juice</Text>
                            <Text style={styles.ingredientItem}>• 1/4 cup freshly squeezed lime juice</Text>
                            <Text style={styles.ingredientItem}>• 2 medium tomatoes, seeded and chopped</Text>
                            <Text style={styles.ingredientItem}>• 1/2 small red onion, finely diced</Text>
                            <Text style={styles.ingredientItem}>• 1 medium jalapeño, seeded and chopped</Text>
                        </ScrollView>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setIngredientsVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Steps Modal */}
            <Modal
                visible={isStepsVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setStepsVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalHeader}>Steps</Text>
                        <ScrollView>
                            {Array.from({ length: 10 }, (_, index) => (
                                <TouchableOpacity
                                    key={index + 1}
                                    style={styles.stepButton}
                                    onPress={() => handleStepClick(index + 1)}
                                >
                                    <Text style={styles.stepButtonText}>Step {index + 1}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setStepsVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        width: width * 0.99,
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
        alignItems: 'center',
    },
    headerText: {
        fontWeight: 'bold',
        fontFamily: 'serif',
        fontSize: 20,
        color: 'black',
        textAlign: 'center',
        marginBottom: 10,
    },
    buttonWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
        marginBottom: 40,
    },
    button: {
        backgroundColor: 'black',
        padding: 22,
        borderRadius: 40,
        alignItems: 'center',
        width: '25%',
    },
    stepsContainer: {
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
    stepHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
        fontFamily: 'serif',
    },
    stepText: {
        fontSize: 16,
        fontFamily: 'serif',
        marginBottom: 10,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        height: height * 0.8,
        backgroundColor: '#edf0f5',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
    },
    modalHeader: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
        textDecorationStyle: 'solid',
        textDecorationLine: 'underline',
        fontFamily: 'serif',
    },
    ingredientItem: {
        fontSize: 20,
        marginBottom: 5,
        fontFamily: 'serif',
        fontWeight: 'semibold',
    },
    navButton: {
        backgroundColor: 'black',
        padding: 15,
        borderRadius: 18,
        alignItems: 'center',
        width: '45%',
        zIndex: 2,
    },
    stepButton: {
        padding: 16,
        backgroundColor: 'black',
        borderRadius: 10,
        marginBottom: 10,
    },
    stepButtonText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold'
    },
    closeButton: {
        backgroundColor: 'black',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 8,
        marginTop: 20,
        alignSelf: 'center',
        marginBottom: 20
    },
    closeButtonText: {
        color: 'white',
        fontSize: 16,
    },
});
