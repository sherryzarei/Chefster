import React, { useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { auth, db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";

const OnboardingScreen = () => {
  const [profileImage, setProfileImage] = useState(null);
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");

  // Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h2 className="text-2xl font-semibold mb-4">Complete Your Profile</h2>

      {/* Profile Picture Upload */}
      <div className="relative">
        <label htmlFor="file-input">
          <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-gray-300 cursor-pointer flex items-center justify-center bg-gray-200">
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-500 text-sm">Upload Photo</span>
            )}
          </div>
        </label>
        <input
          id="file-input"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
      </div>

      {/* Gender Selection */}
      <div className="mt-4 w-full max-w-sm">
        <label className="block text-gray-700 text-sm font-medium">
          Gender
        </label>
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="" disabled>
            Select Gender
          </option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="non-binary">Non-Binary</option>
          <option value="prefer-not-say">Prefer Not to Say</option>
        </select>
      </div>

      {/* Date of Birth Picker */}
      <div className="mt-4 w-full max-w-sm">
        <label className="block text-gray-700 text-sm font-medium">
          Date of Birth
        </label>
        <input
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Submit Button */}
      <button className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition">
        Continue
      </button>
    </div>
  );
};
