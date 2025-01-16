import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const PHOTO_SIZE = width / 2 - 30;

export default function Photos() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPhotos = async () => {
    try {
      setRefreshing(true);
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
      } else {
        Alert.alert('Error', 'Failed to fetch photos');
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
      Alert.alert('Error', 'Failed to load photos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const handleDeletePhoto = async (photoId) => {
    try {
      const response = await fetch(
        `https://interview-task-bmcl.onrender.com/api/cart/delete_cart?cartId=${photoId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: params.authToken,
          },
        }
      );
      const result = await response.json();
      if (result.success) {
        Alert.alert('Success', 'Photo deleted successfully');
        fetchPhotos(); // Refresh the photos
      } else {
        Alert.alert('Error', 'Failed to delete photo');
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      Alert.alert('Error', 'Failed to delete photo');
    }
  };

  const confirmDelete = (photoId) => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: () => handleDeletePhoto(photoId), style: 'destructive' },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {photos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No photos uploaded yet</Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => router.back()}
            >
              <Text style={styles.uploadButtonText}>Upload Photos</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.photoGrid}>
            {photos.map((photo, index) => (
              <TouchableOpacity
                key={index}
                style={styles.photoContainer}
                onPress={() => setSelectedPhoto(photo)}
                onLongPress={() => confirmDelete(photo._id)}
              >
                <Image
                  source={{
                    uri: photo.image_url,
                    headers: { Authorization: params.authToken }
                  }}
                  style={styles.photo}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={selectedPhoto !== null}
        transparent={true}
        onRequestClose={() => setSelectedPhoto(null)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedPhoto(null)}
          >
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>
          {selectedPhoto && (
            <Image
              source={{
                uri: selectedPhoto.image_url,
                headers: { Authorization: params.authToken }
              }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 15,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  photoContainer: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  uploadButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '90%',
    height: '80%',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
}); 