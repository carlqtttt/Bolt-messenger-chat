import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { LogOut } from 'lucide-react-native';
import Avatar from '@/components/Avatar';

export default function Settings() {
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/login');
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.profileSection}>
          <Avatar
            size={80}
            name={user?.displayName || ''}
            photoURL={user?.photoURL}
          />
          <Text style={styles.profileName}>{user?.displayName}</Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
        </View>

        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Update Profile Picture</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Notification Settings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Privacy Settings</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.signOutButton} 
          onPress={handleSignOut}
        >
          <LogOut size={20} color="#FF3B30" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
  },
  profileEmail: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  menuSection: {
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  signOutText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '600',
    marginLeft: 8,
  },
});