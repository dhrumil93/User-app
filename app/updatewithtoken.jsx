import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  Pressable,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";

export default function UpdateWithToken() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    dob: "",
    gender: "",
    address: "",
    city: "",
    pincode: "",
    state: "",
    country: "",
  });
  const genderOptions = ["Male", "Female", "Other"];
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (params.userData) {
      const parsedUser = JSON.parse(params.userData);
      setFormData({
        ...parsedUser,
        mobile: parsedUser.mobile?.toString() || "",
        pincode: parsedUser.pincode?.toString() || "",
      });
    }
  }, [params.userData]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      handleChange("dob", formattedDate);
    }
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "https://interview-task-bmcl.onrender.com/api/user/updateWithToken",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: params.authToken,
          },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();
      console.log("Update Response:", result);

      if (result.success) {
        const refreshResponse = await fetch(
          "https://interview-task-bmcl.onrender.com/api/user/display",
          {
            headers: {
              Authorization: params.authToken,
            },
          }
        );

        const refreshResult = await refreshResponse.json();

        if (refreshResult.success) {
          router.replace({
            pathname: "/tokendetails",
            params: {
              authToken: params.authToken,
              timestamp: new Date().getTime(),
            },
          });
        }

        Alert.alert("Success", "Profile updated successfully!");
      } else {
        Alert.alert("Error", result.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Update Error:", error);
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please grant permission to access your photos"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        await handlePhotoUpload(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handlePhotoUpload = async (uri) => {
    try {
      setLoading(true);
      
      const userId = JSON.parse(params.userData)?._id;
      if (!userId) {
        Alert.alert("Error", "User ID not found");
        return;
      }

      // Create form data
      const formData = new FormData();
      
      // Add the photo file
      formData.append('photo', {
        uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
        type: 'image/jpeg',
        name: 'photo.jpg',
      });

      // Add userId to form data
      formData.append('userId', userId);

      console.log('Uploading photo for user:', userId);
      console.log('With token:', params.authToken);

      const response = await fetch(
        'https://interview-task-bmcl.onrender.com/api/user/updateWithPhoto',
        {
          method: 'PUT', // Changed back to PUT
          headers: {
            'Authorization': params.authToken, // Removed Bearer prefix
            'Accept': 'application/json',
            // Let the browser set Content-Type with boundary
          },
          body: formData,
        }
      );

      const responseText = await response.text();
      console.log('Server response:', responseText);

      try {
        const result = JSON.parse(responseText);
        console.log('Parsed response:', result);

        if (result.success) {
          Alert.alert('Success', 'Profile photo updated successfully!');
          // Refresh token details page with new data
          const refreshResponse = await fetch(
            "https://interview-task-bmcl.onrender.com/api/user/display",
            {
              headers: {
                Authorization: params.authToken,
              },
            }
          );

          const refreshResult = await refreshResponse.json();
          if (refreshResult.success) {
            router.replace({
              pathname: '/tokendetails',
              params: { 
                authToken: params.authToken,
                timestamp: new Date().getTime(),
              },
            });
          }
        } else {
          Alert.alert('Error', result.message || 'Failed to update photo');
        }
      } catch (error) {
        console.error('Parse error:', error);
        Alert.alert('Error', 'Server returned invalid response');
      }
    } catch (error) {
      console.error('Photo Upload Error:', error);
      Alert.alert(
        'Error',
        'Failed to upload photo. Please try again with a smaller image.'
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Update Profile With Token</Text>

      <View style={styles.photoContainer}>
        <TouchableOpacity onPress={pickImage} style={styles.photoButton}>
          {image ? (
            <Image source={{ uri: image }} style={styles.profilePhoto} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderText}>Add Photo</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={formData.name}
          onChangeText={(value) => handleChange("name", value)}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={formData.email}
          onChangeText={(value) => handleChange("email", value)}
        />
        <TextInput
          style={styles.input}
          placeholder="Mobile Number"
          keyboardType="numeric"
          maxLength={10}
          value={formData.mobile}
          onChangeText={(value) => handleChange("mobile", value)}
        />

        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowDatePicker(true)}
        >
          <Text
            style={formData.dob ? styles.inputText : styles.placeholderText}
          >
            {formData.dob || "Date Of Birth"}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={formData.dob ? new Date(formData.dob) : new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handleDateChange}
            maximumDate={new Date()}
            minimumDate={new Date(1900, 0, 1)}
          />
        )}

        <View style={styles.genderContainer}>
          <Text style={styles.genderLabel}>Gender:</Text>
          <View style={styles.radioGroup}>
            {genderOptions.map((option) => (
              <Pressable
                key={option}
                style={styles.radioButton}
                onPress={() => handleChange("gender", option)}
              >
                <View style={styles.radio}>
                  {formData.gender === option && (
                    <View style={styles.radioDot} />
                  )}
                </View>
                <Text style={styles.radioLabel}>{option}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Address"
          multiline
          value={formData.address}
          onChangeText={(value) => handleChange("address", value)}
        />
        <TextInput
          style={styles.input}
          placeholder="City"
          value={formData.city}
          onChangeText={(value) => handleChange("city", value)}
        />
        <TextInput
          style={styles.input}
          placeholder="Pincode"
          keyboardType="numeric"
          maxLength={6}
          value={formData.pincode}
          onChangeText={(value) => handleChange("pincode", value)}
        />
        <TextInput
          style={styles.input}
          placeholder="State"
          value={formData.state}
          onChangeText={(value) => handleChange("state", value)}
        />
        <TextInput
          style={styles.input}
          placeholder="Country"
          value={formData.country}
          onChangeText={(value) => handleChange("country", value)}
        />
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleUpdate}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Update Profile</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "white",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  inputContainer: {
    gap: 15,
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: "white",
    marginBottom: Platform.OS === "ios" ? 0 : 15,
  },
  doneButton: {
    alignItems: "center",
    padding: 10,
    backgroundColor: "#f8f8f8",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  doneButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "500",
  },
  inputText: {
    fontSize: 16,
    color: "#000",
  },
  placeholderText: {
    fontSize: 16,
    color: "#999",
  },
  genderContainer: {
    marginBottom: 15,
  },
  genderLabel: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  radioGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  radio: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  radioDot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: "#007AFF",
  },
  radioLabel: {
    fontSize: 16,
    color: "#333",
  },
  photoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  photoButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
  },
  profilePhoto: {
    width: "100%",
    height: "100%",
  },
  photoPlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 60,
    borderStyle: "dashed",
  },
  photoPlaceholderText: {
    color: "#666",
    fontSize: 14,
  },
});
