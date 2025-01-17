import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";

export default function Details() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserData = async () => {
    try {
      if (!user?._id) return;

      const response = await fetch(
        `https://interview-task-bmcl.onrender.com/api/user/userDetails?userId=${user._id}`
      );
      const result = await response.json();

      if (result.success) {
        setUser(result.data);
      }
    } catch (err) {
      console.error("Error fetching updated user data:", err);
    }
  };

  useEffect(() => {
    try {
      if (!params.userData) {
        setError("No user data provided");
        return;
      }

      const parsedUser = JSON.parse(params.userData);
      setUser(parsedUser);
      setLoading(false);
    } catch (err) {
      console.error("Error parsing user data:", err);
      setError("Error loading user data");
      setLoading(false);
    }
  }, [params.userData, params.timestamp]);

  useEffect(() => {
    fetchUserData();
  }, [user?._id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>User Details Without Token</Text>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{user?.name || "N/A"}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{user?.email || "N/A"}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Mobile:</Text>
          <Text style={styles.value}>{user?.mobile || "N/A"}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Date of Birth:</Text>
          <Text style={styles.value}>{user?.dob || "N/A"}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Gender:</Text>
          <Text style={styles.value}>{user?.gender || "N/A"}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Address:</Text>
          <Text style={styles.value}>{user?.address || "N/A"}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>City:</Text>
          <Text style={styles.value}>{user?.city || "N/A"}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Pincode:</Text>
          <Text style={styles.value}>{user?.pincode || "N/A"}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>State:</Text>
          <Text style={styles.value}>{user?.state || "N/A"}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Country:</Text>
          <Text style={styles.value}>{user?.country || "N/A"}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.updateButton}
            onPress={() =>
              router.push({
                pathname: "/update",
                params: {
                  userData: JSON.stringify(user),
                  timestamp: new Date().getTime(),
                },
              })
            }
          >
            <Text style={styles.updateButtonText}>Update Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.updateButton, styles.tokenButton]}
            onPress={() => {
              console.log('Token being passed:', params.authToken);
              router.push({
                pathname: "/tokendetails",
                params: { 
                  authToken: params.authToken,
                  userData: JSON.stringify(user)
                }
              });
            }}
          >
            <Text style={styles.updateButtonText}>View Token Details</Text>
          </TouchableOpacity>
          <TouchableOpacity
          style={[styles.deleteButton]}
          onPress={() => router.push({
            pathname: "/deleteaccount",
            params: { 
              userData: JSON.stringify(user)
            }
          })}
        >
          <Text style={styles.deleteButtonText}>Delete Account</Text>
        </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  detailRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  label: {
    flex: 1,
    fontWeight: "bold",
    color: "#666",
  },
  value: {
    flex: 2,
    color: "#333",
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
  },
  updateButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  updateButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonContainer: {
    gap: 15,
    marginTop: 20,
  },
  tokenButton: {
    backgroundColor: "#34C759",
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  deleteButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  }
});
