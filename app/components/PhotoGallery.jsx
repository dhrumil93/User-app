import React from 'react';
import { View, Image, StyleSheet, ScrollView, Text } from 'react-native';

export default function PhotoGallery({ photos, authToken }) {
  if (!photos || photos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No photos uploaded yet</Text>
      </View>
    );
  }

  return (
    <ScrollView horizontal style={styles.container}>
      {photos.map((photo, index) => (
        <View key={index} style={styles.photoContainer}>
          <Image
            source={{ 
              uri: photo.image_url,
              headers: { Authorization: authToken }
            }}
            style={styles.photo}
            resizeMode="cover"
          />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
    marginVertical: 10,
  },
  photoContainer: {
    marginRight: 10,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
  },
}); 