import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";

export default function DeleteAccount() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(false);

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      const userId = JSON.parse(params.userData)?._id;

      if (!userId) {
        Alert.alert("Error", "User ID not found");
        return;
      }

      const response = await fetch(
        `https://interview-task-bmcl.onrender.com/api/user/delete?userId=${userId}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (result.success) {
        Alert.alert(
          "Success",
          "Account deleted successfully",
          [
            {
              text: "OK",
              onPress: () => router.replace("/login"),
            },
          ]
        );
      } else {
        Alert.alert("Error", result.message || "Failed to delete account");
      }
    } catch (error) {
      console.error("Delete Account Error:", error);
      Alert.alert("Error", "Failed to delete account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: handleDeleteAccount,
          style: "destructive",
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Delete Account</Text>
      <Text style={styles.warning}>
        Warning: This action is permanent and cannot be undone.
      </Text>
      <TouchableOpacity
        style={[styles.deleteButton, loading && styles.buttonDisabled]}
        onPress={confirmDelete}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.deleteButtonText}>Delete My Account</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  warning: {
    color: "#FF3B30",
    textAlign: "center",
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
    padding: 15,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  deleteButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
}); 