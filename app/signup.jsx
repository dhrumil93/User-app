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
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import DateTimePicker from '@react-native-community/datetimepicker';

export default function SignUp() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
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

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      handleChange('dob', formattedDate);
    }
  };

  const handleSignUp = async () => {
    // Validate required fields
    if (!formData.name || !formData.email || !formData.password || !formData.mobile) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    if (formData.mobile.length !== 10) {
      Alert.alert("Error", "Please enter a valid 10-digit mobile number");
      return;
    }

    try {
      setLoading(true);

      const apiData = {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        mobile: formData.mobile.replace(/\D/g, ''),
        dob: formData.dob ? formData.dob.trim() : null,
        gender: formData.gender ? formData.gender.toLowerCase().trim() : null,
        address: formData.address ? formData.address.trim() : null,
        city: formData.city ? formData.city.trim() : null,
        pincode: formData.pincode ? formData.pincode.trim() : null,
        state: formData.state ? formData.state.trim() : null,
        country: formData.country ? formData.country.trim() : null
      };

    
      console.log('Sending data to API:', apiData);

      const response = await fetch(
        "https://interview-task-bmcl.onrender.com/api/user/add_user",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(apiData),
        }
      );

      const result = await response.json();
      console.log('API Response:', result);

      if (response.ok && result.success) {
        Alert.alert(
          "Success",
          "Account created successfully!",
          [{ text: "OK", onPress: () => router.push("/login") }]
        );
      } else {
        const errorMessage = result.message || "Registration failed. Please try again.";
        Alert.alert("Error", errorMessage);
      }
    } catch (error) {
      console.error('API Error:', error);
      Alert.alert(
        "Error", 
        "Network error or server not responding. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Full Name *"
          autoCapitalize="words"
          value={formData.name}
          onChangeText={(value) => handleChange("name", value)}
        />
        <TextInput
          style={styles.input}
          placeholder="Email *"
          keyboardType="email-address"
          autoCapitalize="none"
          value={formData.email}
          onChangeText={(value) => handleChange("email", value)}
        />
        <TextInput
          style={styles.input}
          placeholder="Password *"
          secureTextEntry
          value={formData.password}
          onChangeText={(value) => handleChange("password", value)}
        />
        <TextInput
          style={styles.input}
          placeholder="Mobile Number *"
          keyboardType="numeric"
          maxLength={10}
          value={formData.mobile}
          onChangeText={(value) => handleChange("mobile", value)}
        />
        <TouchableOpacity 
          style={styles.input}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={formData.dob ? styles.inputText : styles.placeholderText}>
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
          numberOfLines={3}
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
        onPress={handleSignUp}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Sign Up</Text>
        )}
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <Link href="/login" style={styles.link}>
          Login
        </Link>
      </View>
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
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    marginTop: 20,
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
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 30,
  },
  footerText: {
    color: "#666",
  },
  link: {
    color: "#007AFF",
    fontWeight: "bold",
  },
  inputText: {
    fontSize: 16,
    color: '#000',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
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
