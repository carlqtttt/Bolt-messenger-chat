import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

interface AvatarProps {
  size?: number;
  name?: string;
  photoURL?: string;
  showOnlineStatus?: boolean;
  isOnline?: boolean;
}

export default function Avatar({ 
  size = 40, 
  name = '', 
  photoURL, 
  showOnlineStatus = false,
  isOnline = false 
}: AvatarProps) {
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {photoURL ? (
        <Image source={{ uri: photoURL }} style={[styles.image, { width: size, height: size }]} />
      ) : (
        <View style={[styles.placeholder, { width: size, height: size }]}>
          <Text style={[styles.initials, { fontSize: size * 0.4 }]}>
            {initials}
          </Text>
        </View>
      )}
      
      {showOnlineStatus && (
        <View style={[
          styles.onlineIndicator,
          { 
            width: size * 0.3,
            height: size * 0.3,
            backgroundColor: isOnline ? '#4CAF50' : '#9E9E9E',
            right: size * 0.05,
            bottom: size * 0.05
          }
        ]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    borderRadius: 50,
    backgroundColor: '#E0E0E0',
  },
  placeholder: {
    borderRadius: 50,
    backgroundColor: '#6B73FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  onlineIndicator: {
    position: 'absolute',
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});