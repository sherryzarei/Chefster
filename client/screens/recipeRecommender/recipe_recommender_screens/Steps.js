import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Dimensions,
    ScrollView,
    Alert, SafeAreaView
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import Icon from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

export default function Steps({ navigation, route }) {
    // stepsData and ingredientsData passed from ReviewIngredients screen
    const { stepsData, ingredientsData } = route.params;

    // Track the current step index
    const [currentStep, setCurrentStep] = useState(0);

    // Modal visibility state
    const [isIngredientsVisible, setIngredientsVisible] = useState(false);
    const [isStepsVisible, setStepsVisible] = useState(false);

    // Handler for Next Step button
    const handleNextStep = () => {
        if (currentStep < stepsData.length - 1) {
            setCurrentStep((prev) => prev + 1);
        }
    };

    // Handler for Previous Step button
    const handlePreviousStep = () => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    // When at the last step, finish cooking and navigate to Upload Result
    const handleFinishCooking = () => {
        navigation.navigate('UploadResult', { stepsData });
    };

    // When a step is selected from the modal list, update currentStep and close modal
    const handleStepSelection = (stepIndex) => {
        setCurrentStep(stepIndex);
        setStepsVisible(false);
    };

    // Ingredients modal: simply display the ingredients (assumed to be a newline-separated string)
    const renderIngredientsModalContent = () => {
        if (!ingredientsData) return null;
        return ingredientsData.split('\n').map((line, index) => (
            <Text key={index} style={styles.modalIngredientItem}>• {line.trim()}</Text>
        ));
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.scrollViewContainer}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.headerView}>
                        <Text style={styles.headerText}>Steps</Text>
                    </View>

                    {/* Buttons to open modals */}
                    <View style={styles.modalButtonsContainer}>
                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => setIngredientsVisible(true)}
                        >
                            <MaterialCommunityIcons name='food-turkey' size={28} color='white' />
                            <Text style={styles.modalButtonText}>Ingredients</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => setStepsVisible(true)}
                        >
                            <MaterialCommunityIcons name='form-select' size={28} color='white' />
                            <Text style={styles.modalButtonText}>All Steps</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Display current step */}
                    <View style={styles.stepDisplayContainer}>
                        <Text style={styles.stepHeader}>Step {currentStep + 1}</Text>
                        <Text style={styles.stepText}>
                            {stepsData[currentStep].description}
                        </Text>
                    </View>

                    {/* Navigation buttons for steps */}
                    <View style={styles.navButtonWrapper}>
                        <TouchableOpacity style={styles.navButton} onPress={handlePreviousStep}>
                            <Text style={styles.navButtonText}>Previous Step</Text>
                        </TouchableOpacity>
                        {currentStep < stepsData.length - 1 ? (
                            <TouchableOpacity style={styles.navButton} onPress={handleNextStep}>
                                <Text style={styles.navButtonText}>Next Step</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity style={styles.navButton} onPress={handleFinishCooking}>
                                <Text style={styles.navButtonText}>Finish Cooking</Text>
                            </TouchableOpacity>
                        )}
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
                            <ScrollView style={styles.modalScroll}>
                                {renderIngredientsModalContent()}
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
                            <Text style={styles.modalHeader}>Select Step</Text>
                            <ScrollView style={styles.modalScroll}>
                                {stepsData.map((step, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.stepModalButton}
                                        onPress={() => handleStepSelection(index)}
                                    >
                                        <Text style={styles.stepModalButtonText}>Step {index + 1}</Text>
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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    scrollViewContainer: { flexGrow: 1, backgroundColor: '#edf0f5' },
    container: { flex: 1, padding: 20 },
    headerView: {
        borderColor: 'black',
        borderWidth: 3,
        borderRadius: 10,
        backgroundColor: '#edf0f5',
        padding: 30,
        marginBottom: 15,
        alignItems: 'center',
    },
    headerText: { fontWeight: 'bold', fontFamily: 'serif', fontSize: 20, color: 'black', textAlign: 'center', marginBottom: 10 },
    modalButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    modalButton: {
        backgroundColor: 'black',
        padding: 10,
        borderRadius: 40,
        alignItems: 'center',
        width: '40%',
    },
    modalButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 5,
    },
    stepDisplayContainer: {
        backgroundColor: '#fff',
        borderColor: 'black',
        borderWidth: 3,
        borderRadius: 10,
        padding: 20,
        marginBottom: 20,
    },
    stepHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        fontFamily: 'serif',
        textAlign: 'center',
    },
    stepText: {
        fontSize: 16,
        fontFamily: 'serif',
        textAlign: 'center',
    },
    navButtonWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 30,
    },
    navButton: {
        backgroundColor: 'black',
        padding: 15,
        borderRadius: 18,
        alignItems: 'center',
        width: '45%',
    },
    navButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        height: height * 0.6,
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
        textDecorationLine: 'underline',
        fontFamily: 'serif',
    },
    modalScroll: {
        marginBottom: 20,
    },
    modalIngredientItem: {
        fontSize: 18,
        marginBottom: 5,
        fontFamily: 'serif',
        fontWeight: '600',
    },
    stepModalButton: {
        backgroundColor: 'black',
        padding: 16,
        borderRadius: 10,
        marginBottom: 10,
    },
    stepModalButtonText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold',
    },
    closeButton: {
        backgroundColor: 'black',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 8,
        alignSelf: 'center',
        marginBottom: 20,
    },
    closeButtonText: {
        color: 'white',
        fontSize: 16,
    },
});
