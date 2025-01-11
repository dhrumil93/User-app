import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect, useCallback } from "react";

export default function UserDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUserData = async () => {
    try {
      if (!params.userData) {
        console.error('No user data in params');
        Alert.alert(
          "Error",
          "No user data found",
          [{ text: "OK", onPress: () => router.push("/login") }]
        );
        return;
      }

      const response = await fetch(
        "https://interview-task-bmcl.onrender.com/api/user/display"
      );
      const result = await response.json();
      console.log('API Response:', result);

      if (result.success) {
        const parsedCurrentUser = JSON.parse(params.userData);
        console.log('Current user:', parsedCurrentUser);
        
        const currentUserData = result.data.find(
          user => user.email === parsedCurrentUser.email
        );
        
        if (currentUserData) {
          setUser(currentUserData);
        } else {
          console.error('User not found in the data');
          Alert.alert(
            "Error",
            "User data not found",
            [{ text: "OK", onPress: () => router.push("/login") }]
          );
        }
      } else {
        console.error('Failed to fetch user data:', result.message);
        Alert.alert("Error", "Failed to fetch user data");
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert("Error", "Something went wrong");
    }
  };

  useEffect(() => {
    fetchUserData();
    setLoading(false);
  }, [params.userData]);

  const handleLogout = () => {
    router.push("/login");
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>User Profile</Text>

      <View style={styles.detailsContainer}>
        <DetailItem label="Name" value={user.name} />
        <DetailItem label="Email" value={user.email} />
        <DetailItem label="Mobile" value={user.mobile} />
        <DetailItem label="Date of Birth" value={user.dob} />
        <DetailItem label="Gender" value={user.gender} />
        <DetailItem label="Address" value={user.address} />
        <DetailItem label="City" value={user.city} />
        <DetailItem label="State" value={user.state} />
        <DetailItem label="Country" value={user.country} />
        <DetailItem label="Pincode" value={user.pincode} />
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const DetailItem = ({ label, value }) => {
  if (!value) return null;
  
  return (
    <View style={styles.detailItem}>
      <Text style={styles.label}>{label}:</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
  },
  detailsContainer: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 15,
    gap: 15,
  },
  detailItem: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingBottom: 10,
  },
  label: {
    fontWeight: "bold",
    width: 100,
    color: "#666",
  },
  value: {
    flex: 1,
    color: "#333",
  },
  logoutButton: {
    backgroundColor: "#ff3b30",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 30,
  },
  logoutButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
}); 