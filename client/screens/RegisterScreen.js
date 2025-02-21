import React, { useState } from 'react';
import { KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Image } from 'react-native';
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { useNavigation } from '@react-navigation/native';
import { auth } from '../firebase';
import { db } from '../firebase';
import { doc, setDoc } from "firebase/firestore";
import Toast from 'react-native-toast-message';




const RegisterScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [errorFields, setErrorFields] = useState({});

    const showToast = (type, title, message) => {
        Toast.show({
            type,
            text1: title,
            text2: message,
        });
    };

    const validatePassword = (password) => {
        const errors = [];
        if (password.length < 8) errors.push('at least 8 characters');
        if (!/[A-Z]/.test(password)) errors.push('an uppercase letter');
        if (!/[a-z]/.test(password)) errors.push('a lowercase letter');
        if (!/\d/.test(password)) errors.push('a number');
        if (!/[@$!%*?&]/.test(password)) errors.push('a special character (@$!%*?&)');
        return errors.length > 0 ? `Password must contain ${errors.join(', ')}.` : null;
    };

    const validateInputs = () => {
        const errors = {};
        const passwordError = validatePassword(password);

        if (!firstName.trim()) errors.firstName = 'First Name is required.';
        if (!lastName.trim()) errors.lastName = 'Last Name is required.';
        if (!email.trim()) errors.email = 'Email is required.';
        if (passwordError) errors.password = passwordError;

        setErrorFields(errors);

        if (Object.keys(errors).length > 0) {
            showToast('error', 'Invalid Inputs', Object.values(errors).join('\n'));
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            setErrorFields({ ...errors, email: 'Please enter a valid email address.' });
            showToast('error', 'Invalid Inputs', 'Please enter a valid email address.');
            return false;
        }

        return true;
    };

    // const registerUser = async () => {
    //     if (!validateInputs()) return;
    
    //     setLoading(true);
    //     try {
    //         const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    //         const user = userCredential.user;
    
    //         await sendEmailVerification(user, {
    //             handleCodeInApp: true,
    //             url: 'https://chefster-e2086.firebaseapp.com',
    //         });
    
    //         await setDoc(doc(db, 'users', user.uid), { firstName, lastName, email });
    
    //         showToast('success', 'Registration Successful', 'Please check your email for verification.');
            
    //         // Navigate to Login screen after the toast
    //         setTimeout(() => {
    //             navigation.navigate('Login');
    //         }, 4000);
    //     } catch (error) {
    //         const errorMessages = {
    //             'auth/email-already-in-use': 'This email is already registered.',
    //             'auth/invalid-email': 'Invalid email address.',
    //             'auth/weak-password': 'Weak password. Please follow password guidelines.',
    //         };
    //         showToast('error', 'Registration Error', errorMessages[error.code] || 'Something went wrong. Please try again.');
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const registerUser = async () => {
        if (!validateInputs()) return;
    
        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
    
            await sendEmailVerification(user, {
                handleCodeInApp: true,
                url: 'https://chefster-e2086.firebaseapp.com',
            });
    
            // Add user to Firestore with infoCompleted set to false
            await setDoc(doc(db, 'users', user.uid), {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email,
                infoCompleted: false, // Initial state for the optional info
            });
    
            showToast('success', 'Registration Successful', 'Please check your email for verification.');
            
            // Navigate to Login screen after the toast
            setTimeout(() => {
                navigation.navigate('Login');
            }, 4000);
        } catch (error) {
            const errorMessages = {
                'auth/email-already-in-use': 'This email is already registered.',
                'auth/invalid-email': 'Invalid email address.',
                'auth/weak-password': 'Weak password. Please follow password guidelines.',
            };
            showToast('success', 'Registration Successful', 'Please check your email for verification.');
            
            // Navigate to Login screen after the toast
            setTimeout(() => {
                navigation.navigate('Login');
            }, 4000);
        } finally {
            setLoading(false);
        }
    };
    
    

    return (
        <KeyboardAvoidingView style={styles.container} behavior='padding'>
            <Image
                style={styles.largeLogo}
                source={require('../assets/logo-large.jpeg')}
            />
            <Text style={{ fontSize: 24, marginBottom: 20, fontWeight: 'bold' }}>Register</Text>
            <View style={styles.inputeContainer}>
                <TextInput
                    placeholder='First Name'
                    style={[styles.input, errorFields.firstName && { borderColor: 'red', borderWidth: 1 }]}
                    onChangeText={(text) => {
                        setFirstName(text);
                        setErrorFields({ ...errorFields, firstName: null });
                    }}
                />
                <TextInput
                    placeholder='Last Name'
                    style={[styles.input, errorFields.lastName && { borderColor: 'red', borderWidth: 1 }]}
                    onChangeText={(text) => {
                        setLastName(text);
                        setErrorFields({ ...errorFields, lastName: null });
                    }}
                    autoCapitalize='none'
                    autoCorrect={false}
                />
                <TextInput
                    placeholder='Email'
                    style={[styles.input, errorFields.email && { borderColor: 'red', borderWidth: 1 }]}
                    onChangeText={(text) => {
                        setEmail(text);
                        setErrorFields({ ...errorFields, email: null });
                    }}
                    keyboardType='email-address'
                    autoCapitalize='none'
                    autoCorrect={false}
                />
                <TextInput
                    placeholder='Password'
                    style={[styles.input, errorFields.password && { borderColor: 'red', borderWidth: 1 }]}
                    onChangeText={(text) => {
                        setPassword(text);
                        setErrorFields({ ...errorFields, password: null });
                    }}
                    secureTextEntry
                    autoCapitalize='none'
                    autoCorrect={false}
                />
            </View>
            <View style={styles.buttonContainer}>
                {loading ? (
                    <ActivityIndicator size="large" color="#0782F9" />
                ) : (
                    <TouchableOpacity
                        onPress={registerUser}
                        style={[styles.button, styles.buttonOutline, loading && { backgroundColor: '#d3d3d3' }]}
                        disabled={loading}
                    >
                        <Text style={styles.buttonOutlineText}>Register</Text>
                    </TouchableOpacity>
                )}
            </View>
            <Text style={{ marginTop: 20 }}>
                Already have an account?{' '}
                <Text onPress={() => navigation.navigate('Login')} style={{ color: '#0782F9' }}>
                    Login
                </Text>
            </Text>
            <Toast />
        </KeyboardAvoidingView>
    );
};

export default RegisterScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputeContainer: {
        width: '80%',
    },
    input: {
        backgroundColor: 'white',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 10,
        marginTop: 5,
    },
    buttonContainer: {
        width: '60%',
        marginTop: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    button: {
        backgroundColor: '#0782F9',
        width: '100%',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 16,
    },
    buttonOutline: {
        backgroundColor: 'white',
        marginTop: 5,
        borderColor: '#0782F9',
        borderWidth: 2,
    },
    buttonOutlineText: {
        color: '#0782F9',
        fontWeight: '700',
        fontSize: 16,
    },
    largeLogo: {
        width: 200,
        height: 200,
        marginBottom: 20,
        borderRadius: 100,
    },
});

