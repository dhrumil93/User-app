import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Image,
  Button,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import * as ImagePicker from 'expo-image-picker';

export default function TokenDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tokenData, setTokenData] = useState(null);
  const [imageKey, setImageKey] = useState(Date.now());
  const [isMultipleImageUploading, setIsMultipleImageUploading] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imageError, setImageError] = useState('');
  const [uploadedImages, setUploadedImages] = useState([]);
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingItemFile, setEditingItemFile] = useState(null);
  const [isCartItemEditing, setIsCartItemEditing] = useState(false);

  useEffect(() => {
    handleTokenDisplay();
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
            "Authorization": token
          }
        }
      );
      
      const result = await response.json();
      console.log('API Response:', result);

      if (result.success) {
        setUser(result.data);
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

  const handleMultipleImageUpload = () => {
    setIsMultipleImageUploading(true);
    setSelectedImages([]);
    setImageError('');
  };

  const handleMultipleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate files
    const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      setImageError('Please select only image files');
      return;
    }

    // Check file sizes
    const largeFiles = files.filter(file => file.size > 5000000);
    if (largeFiles.length > 0) {
      setImageError('Each file should be less than 5MB');
      return;
    }

    setSelectedImages(files);
    setImageError('');
  };

  const handleUploadMultipleImages = async () => {
    if (selectedImages.length === 0) {
      setImageError('Please select images to upload');
      return;
    }

    try {
      const userId = JSON.parse(params.userData)?.id;
      if (!userId) {
        setImageError('User ID not found');
        return;
      }

      for (const image of selectedImages) {
        const formData = new FormData();
        formData.append('userId', userId);
        formData.append('image', {
          uri: Platform.OS === 'ios' ? image.uri.replace('file://', '') : image.uri,
          type: 'image/jpeg',
          name: 'photo.jpg'
        });

        const response = await fetch(
          'https://interview-task-bmcl.onrender.com/api/cart/add_cart',
          {
            method: 'POST',
            headers: {
              'Authorization': params.authToken,
              'Content-Type': 'multipart/form-data',
            },
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error(`Upload failed with status ${response.status}`);
        }
      }

      // After successful upload, update the display
      setIsMultipleImageUploading(false);
      setSelectedImages([]);
      setImageError('');
      Alert.alert('Success', 'Images uploaded successfully!');
      
    } catch (error) {
      console.error('Upload error:', error);
      setImageError('Failed to upload images. Please try again.');
    }
  };

  const handleCartItemEdit = (itemId) => {
    setEditingItemId(itemId);
    setIsCartItemEditing(true);
  };

  const handleCartItemFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setEditingItemFile(file);
    } else {
      alert('Please select an image file');
    }
  };

  const handleCartItemUpdate = () => {
    if (!editingItemFile) return;

    setUploadedImages(prevImages => 
      prevImages.map(item => {
        if (item.id === editingItemId) {
          return {
            ...item,
            url: URL.createObjectURL(editingItemFile),
            name: editingItemFile.name
          };
        }
        return item;
      })
    );

    setIsCartItemEditing(false);
    setEditingItemId(null);
    setEditingItemFile(null);
  };

  const handleDeleteCart = () => {
    if (window.confirm('Are you sure you want to delete all items from cart?')) {
      setUploadedImages([]);
    }
  };

  const handleDeleteCartItem = (itemId) => {
    if (window.confirm('Are you sure you want to remove this item?')) {
      setUploadedImages(prevImages => 
        prevImages.filter(item => item.id !== itemId)
      );
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
                uri: `${user.profile_photo}?timestamp=${params.timestamp}`,
                headers: { Authorization: params.authToken }
              }} 
              style={styles.profilePhoto}
              resizeMode="cover"
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
          style={styles.deleteButton}
          onPress={() => router.push({
            pathname: "/deleteaccount",
            params: { 
              userData: JSON.stringify(user)
            }
          })}
        >
          <Text style={styles.deleteButtonText}>Delete Account</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.uploadButton}
          onPress={handleMultipleImageUpload}
        >
          <Text style={styles.uploadButtonText}>Upload Multiple Images</Text>
        </TouchableOpacity>

        {isMultipleImageUploading && (
          <View style={styles.uploadContainer}>
            <TouchableOpacity
              style={styles.uploadSubmitButton}
              onPress={async () => {
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
                    quality: 1,
                  });

                  if (!result.canceled && result.assets) {
                    setSelectedImages(result.assets);
                  }
                } catch (error) {
                  console.error('Error picking images:', error);
                  setImageError('Failed to pick images');
                }
              }}
            >
              <Text style={styles.uploadSubmitButtonText}>Select Images</Text>
            </TouchableOpacity>
            <Text style={styles.uploadError}>{imageError}</Text>
            {selectedImages.length > 0 && (
              <TouchableOpacity
                style={styles.uploadSubmitButton}
                onPress={handleUploadMultipleImages}
              >
                <Text style={styles.uploadSubmitButtonText}>Upload Selected Images</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {uploadedImages.length > 0 && (
          <View style={styles.uploadedImagesContainer}>
            {uploadedImages.map((image) => (
              <View key={image.id} style={styles.uploadedImageContainer}>
                <Image 
                  source={{ uri: image.url }} 
                  style={styles.uploadedImage}
                  resizeMode="cover"
                />
                <Text style={styles.uploadedImageName}>{image.name}</Text>
                {isCartItemEditing && editingItemId === image.id ? (
                  <TouchableOpacity
                    style={styles.editImageButton}
                    onPress={() => handleCartItemEdit(image.id)}
                  >
                    <Text style={styles.editImageButtonText}>Edit</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.deleteImageButton}
                    onPress={() => handleDeleteCartItem(image.id)}
                  >
                    <Text style={styles.deleteImageButtonText}>Delete</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}
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
    color: "#333", // Changed color for better readability
  },
  detailRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    justifyContent: "space-between", // Added for better spacing
  },
  label: {
    flex: 1,
    fontWeight: "bold",
    color: "#666",
    marginRight: 8, // Added for better spacing
  },
  value: {
    flex: 2,
    color: "#333",
    marginLeft: 8, // Added for better spacing
  },
  updateButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10, // Added for better spacing
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
  deleteButton: {
    backgroundColor: "#FF3B30",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10, // Adjusted for better spacing
  },
  deleteButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  uploadButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10, // Added for better spacing
  },
  uploadButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  uploadContainer: {
    marginTop: 20,
    marginBottom: 10,
  },
  uploadError: {
    color: "red",
    marginBottom: 10,
  },
  uploadSubmitButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  uploadSubmitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  uploadedImagesContainer: {
    marginTop: 20,
    marginBottom: 10,
  },
  uploadedImageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  uploadedImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
});
