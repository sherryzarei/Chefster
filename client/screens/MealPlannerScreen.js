import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const MealRecommenderScreen = () => {
  const [startDate, setStartDate] = useState('2024-11-15');
  const [endDate, setEndDate] = useState('2025-11-15');
  const [meal, setMeal] = useState('');
  const [goal, setGoal] = useState('');
  const [dietType, setDietType] = useState('');

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.contentContainer}>
            <Text style={styles.sectionTitle}>Share Your Additional Preferences</Text>
            <View style={styles.bodyContainer}>
              <View style={styles.titleRow}>
                <Icon name="calendar-outline" size={24} color="black" />
                <Text style={styles.headerTitle}>Start Date:</Text>
              </View>
              <TextInput style={styles.searchBar} value={startDate} editable={false} />

              <View style={styles.titleRow}>
                <Icon name="calendar-outline" size={24} color="black" />
                <Text style={styles.headerTitle}>End Date:</Text>
              </View>
              <TextInput style={styles.searchBar} value={endDate} editable={false} />

              <View style={styles.titleRow}>
                <Icon name="fast-food-outline" size={24} color="black" />
                <Text style={styles.headerTitle}>Meal:</Text>
              </View>
              <TextInput style={styles.searchBar} placeholder="Breakfast, lunch, dinner, dessert" value={meal} onChangeText={setMeal} />

              <View style={styles.titleRow}>
                <Icon name="barbell-outline" size={24} color="black" />
                <Text style={styles.headerTitle}>Goal:</Text>
              </View>
              <TextInput style={styles.searchBar} placeholder="Weight loss, Mass gain, etc." value={goal} onChangeText={setGoal} />

              <View style={styles.titleRow}>
                <Icon name="leaf-outline" size={24} color="black" />
                <Text style={styles.headerTitle}>Diet Type:</Text>
              </View>
              <TextInput style={styles.searchBar} placeholder="Carnivore, Vegan, Vegetarian, etc." value={dietType} onChangeText={setDietType} />
            </View>

            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  contentContainer: { padding: 16, flexGrow: 1 },
  sectionTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  button: { backgroundColor: 'black', padding: 12, borderRadius: 8, marginTop: 16 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  bodyContainer: { padding: 20, backgroundColor: '#edf0f5', borderColor: 'black', borderWidth: 3, borderRadius: 10, marginVertical: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: 'black', marginLeft: 8 },
  searchBar: { height: 40, borderColor: 'black', borderWidth: 3, borderRadius: 10, paddingLeft: 10, fontSize: 16 }
});

export default MealRecommenderScreen;