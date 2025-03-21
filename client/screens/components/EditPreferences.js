import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    StyleSheet,
    Dimensions,
} from "react-native";
import { MultiSelect } from "react-native-element-dropdown";
import Icon from "react-native-vector-icons/Ionicons";
import Toast from "react-native-toast-message";
import axios from "axios";
import IP_ADDRESS from "../recipeRecommender/constants/ip_address";
import { auth } from "../../firebase";
import useStore from "../recipeRecommender/storeState/store";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

const EditPreferences = ({ uid }) => {
    const [showModal, setShowModal] = useState(false);
    const [foodAllergies, setFoodAllergies] = useState([]);
    const [activeSection, setActiveSection] = useState("dietType");
    const [dietOptions] = useState([
        { label: "Vegetarian", value: "vegetarian" },
        { label: "Vegan", value: "vegan" },
        { label: "Alkaline", value: "alkaline" },
        { label: "Keto", value: "keto" },
        { label: "Mediterranean", value: "mediterranean" },
        { label: "None", value: "none" },
    ]);

    const [allergyOptions] = useState([
        { label: "Peanuts", value: "peanuts" },
        { label: "Tree Nuts", value: "tree_nuts" },
        { label: "Dairy", value: "dairy" },
        { label: "Eggs", value: "eggs" },
        { label: "Soy", value: "soy" },
        { label: "Shellfish", value: "shellfish" },
        { label: "Fish", value: "fish" },
        { label: "Gluten", value: "gluten" },
        { label: "None", value: "none" },
    ]);

    const { dietType, setDietType } = useStore();

    const userID = auth.currentUser?.uid;

    useEffect(() => {
        const fetchPreferences = async () => {
            try {
                const response = await axios.get(`http://${IP_ADDRESS}:8323/users/certain_user/${userID}`);
                setDietType(response.data.dietType || []);
                setFoodAllergies(response.data.foodAllergies || []);
            } catch (error) {
                Toast.show({ type: "error", text1: "Error fetching preferences" });
            }
        };

        fetchPreferences();
    }, [uid]);

    const handleSavePreferences = async () => {
        try {
            await axios.put(`http://${IP_ADDRESS}:8323/users/update_user/${userID}`, { foodAllergies, dietType });
            Toast.show({ type: "success", text1: "Preferences updated successfully" });
            setShowModal(false);
        } catch (error) {
            Toast.show({ type: "error", text1: "Error updating preferences" });
        }
    };

    return (
        <View style={styles.headerContainer}>
            <View style={styles.row}>
                <Icon name="nuclear-sharp" size={24} color="black" />
                <Text style={styles.headerTitle}>Allergies</Text>
                <TouchableOpacity onPress={() => setShowModal(true)} style={styles.button}>
                    <Icon name="color-wand-outline" size={18} color="white" />
                    <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.row}>
                <Icon name="barbell-sharp" size={24} color="black" />
                <Text style={styles.headerTitle}>Diet Type</Text>
                <TouchableOpacity onPress={() => setShowModal(true)} style={styles.button}>
                    <Icon name="color-wand-outline" size={18} color="white" />
                    <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>
            </View>
            <Modal visible={showModal} transparent={true} animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Edit Preferences</Text>

                        {/* Section Toggle Buttons */}
                        <View style={styles.buttonGroup}>
                            <TouchableOpacity
                                style={[
                                    styles.sectionButton,
                                    activeSection === "allergies" && styles.activeButton,
                                ]}
                                onPress={() => setActiveSection("allergies")}
                            >
                                <Text style={styles.sectionButtonText}>Allergies</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.sectionButton,
                                    activeSection === "dietType" && styles.activeButton,
                                ]}
                                onPress={() => setActiveSection("dietType")}
                            >
                                <Text style={styles.sectionButtonText}>Diet Type</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Multi-select based on active section */}
                        {activeSection === "allergies" && (
                            <>
                                <Text style={styles.label}>Food Allergies</Text>
                                <MultiSelect
                                    data={allergyOptions}
                                    labelField="label"
                                    valueField="value"
                                    placeholder="Select Allergies"
                                    value={foodAllergies}
                                    onChange={(item) => setFoodAllergies(item)}
                                    dropdownStyle={styles.dropdownStyle}
                                    itemContainerStyle={styles.dropdownItemContainer}
                                    itemTextStyle={styles.dropdownItemText}
                                    selectedStyle={styles.selectedBlack}
                                    selectedTextStyle={styles.selectedText}
                                    style={styles.dropdown}
                                />
                            </>
                        )}
                        {activeSection === "dietType" && (
                            <>
                                <Text style={styles.label}>Diet Type</Text>
                                <MultiSelect
                                    data={dietOptions}
                                    labelField="label"
                                    valueField="value"
                                    placeholder="Select Diet Type"
                                    value={dietType}
                                    onChange={(item) => setDietType(item)}
                                    dropdownStyle={styles.dropdownStyle}
                                    itemContainerStyle={styles.dropdownItemContainer}
                                    itemTextStyle={styles.dropdownItemText}
                                    selectedStyle={styles.selectedBlack}
                                    selectedTextStyle={styles.selectedText}
                                    style={styles.dropdown}
                                />
                            </>
                        )}

                        {/* Save Button */}
                        <TouchableOpacity onPress={handleSavePreferences} style={styles.saveButton}>
                            <Text style={styles.saveButtonText}>Save Preferences</Text>
                        </TouchableOpacity>

                        {/* Close Button */}
                        <TouchableOpacity onPress={() => setShowModal(false)}>
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default EditPreferences;

const styles = StyleSheet.create({
    headerContainer: {
        padding: 20,
        backgroundColor: "#edf0f5",
        borderColor: "black",
        borderWidth: 3,
        borderRadius: 10,
        marginVertical: 10,
        shadowColor: "black",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 5 },
    headerTitle: { fontSize: 16, fontWeight: "bold", color: "black", marginLeft: 8 },
    button: {
        backgroundColor: "black",
        padding: 10,
        borderRadius: 10,
        elevation: 5,
        paddingHorizontal: 15,
        flexDirection: "row",
        alignItems: "center",
    },
    buttonText: { color: "white", fontSize: 11, fontWeight: "semibold", textAlign: "center", marginLeft: 4 },
    modalContainer: { flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)" },
    modalContent: {
        height: height * 0.8,
        backgroundColor: '#edf0f5',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        marginBottom: -400
    },
    modalTitle: { fontSize: 20, fontWeight: "800", marginBottom: 10 },
    label: { fontSize: 16, marginTop: 10, fontWeight: 'bold', marginTop: 15 },
    dropdown: {
        borderColor: 'black',
        borderWidth: 3,
        borderRadius: 10,
        padding: 10,
        marginTop: 10,
        elevation: 20,
        backgroundColor: '#edf0f5',
    },
    dropdownStyle: {
        border: "black",
        borderWidth: 3,
        borderRadius: 10,
        backgroundColor: 'black',
        marginTop: 10
    },
    dropdownItemContainer: {
        borderBottomWidth: 2,
        borderColor: 'black',
        backgroundColor: '#c9d4cc',
        borderRadius: 2,
    },
    dropdownItemText: {
        color: 'black',
        fontWeight: '600',
        fontFamily: 'arial'
    },
    selectedGreen: { backgroundColor: "green", borderRadius: 10, padding: 5, marginTop: 10 },
    selectedBlack: { backgroundColor: "black", borderRadius: 10, padding: 5, marginTop: 10 },
    selectedText: { color: "white", fontSize: 18, fontWeight: '600' },
    saveButton: { backgroundColor: "black", padding: 10, marginTop: 20, borderRadius: 5 },
    saveButtonText: { color: "white", textAlign: "center", fontWeight: 'bold' },
    closeButtonText: { color: "white", textAlign: "center", marginTop: 10, backgroundColor: 'red', padding: 10, borderRadius: 5, fontWeight: 'bold' },
    buttonGroup: { flexDirection: "row", justifyContent: "space-evenly", marginTop: 10 },
    sectionButton: {
        padding: 10,
        backgroundColor: "#ddd",
        borderRadius: 5,
    },
    activeButton: { backgroundColor: "black" },
    sectionButtonText: { color: "white", fontWeight: '600' },
});