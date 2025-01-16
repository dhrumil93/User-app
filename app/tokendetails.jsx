import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import * as ImagePicker from 'expo-image-picker';
import PhotoGallery from './components/PhotoGallery';

export default function TokenDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tokenData, setTokenData] = useState(null);
  const [imageKey, setImageKey] = useState(Date.now());
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    handleTokenDisplay();
    fetchPhotos();
  }, [params.timestamp]);

  const handleTokenDisplay = async () => {
    try {
      const token = params.authToken;
      console.log('Token received in token details:', token);

      if (!token) {
        Alert.alert('Error', 'No token found. Please login again.');
        router.push('/login');
        return;
      }

      setTokenData(token);
      
      const response = await fetch(
        "https://interview-task-bmcl.onrender.com/api/user/display",
        {
          headers: {
            "Authorization": token,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          }
        }
      );
      
      const result = await response.json();
      console.log('API Response:', result);

      if (result.success) {
        setUser(result.data);
        setImageKey(Date.now());
      } else {
        throw new Error(result.message || 'Failed to fetch user data');
      }

      setLoading(false);
    } catch (error) {
      console.error('Token Display Error:', error);
      Alert.alert('Error', 'Failed to display token details. Please try again.');
      setLoading(false);
    }
  };

  const fetchPhotos = async () => {
    try {
      const response = await fetch(
        'https://interview-task-bmcl.onrender.com/api/cart/get_cart',
        {
          headers: {
            Authorization: params.authToken,
          },
        }
      );
      const result = await response.json();
      if (result.success) {
        setPhotos(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
    }
  };

  const handleMultiplePhotos = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: 5,
        quality: 0.5,
      });

      if (!result.canceled && result.assets.length > 0) {
        setUploading(true);
        
        for (const asset of result.assets) {
          const formData = new FormData();
          formData.append('image', {
            uri: Platform.OS === 'ios' ? asset.uri.replace('file://', '') : asset.uri,
            type: 'image/jpeg',
            name: 'photo.jpg',
          });

          try {
            const response = await fetch(
              'https://interview-task-bmcl.onrender.com/api/cart/add_cart',
              {
                method: 'POST',
                headers: {
                  Authorization: params.authToken,
                },
                body: formData,
              }
            );

            const result = await response.json();
            if (result.success) {
              console.log('Photo uploaded successfully');
            } else {
              console.error('Failed to upload photo:', result.message);
            }
          } catch (error) {
            console.error('Error uploading photo:', error);
          }
        }

        // Refresh photos after upload
        await fetchPhotos();
        Alert.alert('Success', 'Photos uploaded successfully!');
      }
    } catch (error) {
      console.error('Photo upload error:', error);
      Alert.alert('Error', 'Failed to upload photos');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Token Details</Text>

        <View style={styles.photoContainer}>
          {user?.profile_photo ? (
            <Image 
              key={imageKey}
              source={{ 
                uri: `${user.profile_photo}?t=${imageKey}`,
                headers: { 
                  Authorization: params.authToken,
                  'Cache-Control': 'no-cache'
                }
              }} 
              style={styles.profilePhoto}
              resizeMode="cover"
              onError={(error) => console.error('Image loading error:', error)}
            />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderText}>No Photo</Text>
            </View>
          )}
        </View>

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

        <TouchableOpacity
          style={styles.updateButton}
          onPress={() => router.push({
            pathname: "/updatewithtoken",
            params: { 
              authToken: params.authToken,
              userData: JSON.stringify(user)
            }
          })}
        >
          <Text style={styles.updateButtonText}>Update With Token</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, uploading && styles.buttonDisabled]}
          onPress={handleMultiplePhotos}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Upload Photos</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.viewPhotosButton]}
          onPress={() => router.push({
            pathname: "/photos",
            params: { 
              authToken: params.authToken
            }
          })}
        >
          <Text style={styles.buttonText}>View All Photos</Text>
        </TouchableOpacity>

        <PhotoGallery photos={photos} authToken={params.authToken} />

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
  photoContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  photoPlaceholderText: {
    color: '#666',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  viewPhotosButton: {
    backgroundColor: '#9C27B0',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
});
