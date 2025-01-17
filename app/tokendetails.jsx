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
import * as FileSystem from 'expo-file-system';
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import * as ImagePicker from 'expo-image-picker';

export default function Tokendetails() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, [params.timestamp]);

  useEffect(() => {
    if (user?._id) {
      fetchPhotos();
    }
  }, [user?._id]);

  const fetchUserData = async () => {
    try {
      const response = await fetch(
        "https://interview-task-bmcl.onrender.com/api/user/display",
        {
          headers: {
            "Authorization": params.authToken
          }
        }
      );
      
      const result = await response.json();
      if (result.success) {
        setUser(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPhotos = async () => {
    try {
      if (!user?._id) {
        console.error('No user ID available');
        return;
      }

      const response = await fetch(
        `https://interview-task-bmcl.onrender.com/api/cart/display_cart?userId=${user._id}`,
        {
          method: 'GET',
          headers: {
            'Authorization': params.authToken,
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.error('Failed to fetch photos:', response.status);
        return;
      }

      const result = await response.json();
      if (result.success) {
        setPhotos(result.data || []);
      } else {
        console.error('API error:', result.message);
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
      setPhotos([]);
    }
  };

  const handleProfilePhotoUpload = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0]) {
        const formData = new FormData();
        formData.append('userId', user._id);
        formData.append('profile_photo', {
          uri: Platform.OS === 'ios' ? result.assets[0].uri.replace('file://', '') : result.assets[0].uri,
          type: 'image/jpeg',
          name: 'profile_photo.jpg'
        });

        const response = await fetch(
          'https://interview-task-bmcl.onrender.com/api/user/updateWithPhoto',
          {
            method: 'PUT',
            headers: {
              'Authorization': params.authToken,
            },
            body: formData,
          }
        );

        const responseData = await response.json();
        if (responseData.success) {
          Alert.alert('Success', 'Profile photo updated');
          fetchUserData();
        } else {
          Alert.alert('Error', responseData.message || 'Failed to update photo');
        }
      }
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      Alert.alert('Error', 'Failed to upload profile photo');
    }
  };

  const handleMultiplePhotosUpload = async () => {
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
        let successCount = 0;
        
        for (const asset of result.assets) {
          try {
            const formData = new FormData();
            formData.append('userId', user._id);
            formData.append('cartImage', {
              uri: Platform.OS === 'ios' ? asset.uri.replace('file://', '') : asset.uri,
              type: 'image/jpeg',
              name: 'photo.jpg'
            });

            const response = await fetch(
              'https://interview-task-bmcl.onrender.com/api/cart/add_cart',
              {
                method: 'POST',
                headers: {
                  'Authorization': params.authToken,
                },
                body: formData,
              }
            );

            if (response.ok) {
              successCount++;
            } else {
              console.error('Upload failed with status:', response.status);
            }
          } catch (uploadError) {
            console.error('Error uploading image:', uploadError);
          }
        }

        if (successCount > 0) {
          Alert.alert('Success', `Successfully uploaded ${successCount} photos`);
          await fetchPhotos();
        } else {
          Alert.alert('Error', 'Failed to upload photos. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error in photo upload:', error);
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
        <Text style={styles.title}>User Profile</Text>

        <TouchableOpacity onPress={handleProfilePhotoUpload} style={styles.photoContainer}>
          {user?.profile_photo ? (
            <Image 
              source={{ 
                uri: user.profile_photo,
                headers: { Authorization: params.authToken }
              }} 
              style={styles.profilePhoto}
            />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text>Add Photo</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* User Details */}
        <View style={styles.detailsContainer}>
          <DetailItem label="Name" value={user?.name} />
          <DetailItem label="Email" value={user?.email} />
          <DetailItem label="Mobile" value={user?.mobile} />
          <DetailItem label="Gender" value={user?.gender} />
          <DetailItem label="Address" value={user?.address} />
          <DetailItem label="City" value={user?.city} />
          <DetailItem label="State" value={user?.state} />
          <DetailItem label="Country" value={user?.country} />
          <DetailItem label="Pincode" value={user?.pincode} />
        </View>

        {/* Action Buttons */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push({
            pathname: "/updatewithtoken",
            params: { 
              authToken: params.authToken,
              userData: JSON.stringify(user)
            }
          })}
        >
          <Text style={styles.buttonText}>Update Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#4CAF50' }]}
          onPress={handleMultiplePhotosUpload}
          disabled={uploading}
        >
          <Text style={styles.buttonText}>
            {uploading ? 'Uploading...' : 'Upload Photos'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#9C27B0' }]}
          onPress={() => router.push({
            pathname: "/photos",
            params: { authToken: params.authToken }
          })}
        >
          <Text style={styles.buttonText}>View All Photos</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const DetailItem = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.label}>{label}:</Text>
    <Text style={styles.value}>{value || 'N/A'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
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
  detailsContainer: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    flex: 1,
    fontWeight: 'bold',
    color: '#666',
  },
  value: {
    flex: 2,
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

