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
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";

export default function Update() {
  const router = useRouter();
  const { userData } = useLocalSearchParams();
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
    _id: "",
  });

  const genderOptions = ["Male", "Female", "Other"];

  useEffect(() => {
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setFormData({
        ...parsedUser,
        mobile: parsedUser.mobile?.toString() || "",
        pincode: parsedUser.pincode?.toString() || "",
      });
    }
  }, [userData]);

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

  const handleGenderSelect = (value) => {
    handleChange("gender", value);
    setShowGenderPicker(false);
  };

  const refreshUserData = async () => {
    try {
      const response = await fetch(
        `https://interview-task-bmcl.onrender.com/api/user/userDetails?userId=${formData._id}`
      );
      const result = await response.json();

      if (result.success) {
        const updatedUserData = result.data;

        router.replace({
          pathname: "/details",
          params: {
            userData: JSON.stringify(updatedUserData),
            timestamp: new Date().getTime(),
          },
        });
      }
    } catch (error) {
      console.error("Refresh Error:", error);
    }
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);

      const apiData = {
        ...formData,
        mobile: formData.mobile?.replace(/\D/g, ""),
        pincode: formData.pincode?.replace(/\D/g, ""),
      };

      const response = await fetch(
        `https://interview-task-bmcl.onrender.com/api/user/updateUser?userId=${formData._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(apiData),
        }
      );

      const result = await response.json();
      console.log("Update Response:", result);

      if (result.success) {
        await refreshUserData();
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

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Update Profile</Text>

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
                  {formData.gender === option && <View style={styles.radioDot} />}
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
  inputText: {
    fontSize: 16,
    color: "#000",
  },
  placeholderText: {
    fontSize: 16,
    color: "#999",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: "white",
  },
  genderContainer: {
    marginBottom: 15,
  },
  genderLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  radio: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  radioDot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
  },
  radioLabel: {
    fontSize: 16,
    color: '#333',
  },
});
