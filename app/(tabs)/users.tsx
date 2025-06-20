import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useUsers } from '@/hooks/useUsers';
import { createChat } from '@/hooks/useChat';
import Avatar from '@/components/Avatar';

export default function Users() {
  const { user } = useAuth();
  const { users, loading } = useUsers(user?.id);

  const handleUserPress = async (selectedUser: any) => {
    if (!user) return;
    
    try {
      const chatId = await createChat(user.id, selectedUser.id);
      router.push(`/chat/${chatId}?userId=${selectedUser.id}&userName=${selectedUser.displayName}`);
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const formatLastSeen = (lastSeen: Date, isOnline: boolean) => {
    if (isOnline) return 'Online';
    
    const now = new Date();
    const diffInMs = now.getTime() - lastSeen.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return lastSeen.toLocaleDateString();
  };

  const renderUserItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.userItem} onPress={() => handleUserPress(item)}>
      <Avatar
        size={50}
        name={item.displayName}
        photoURL={item.photoURL}
        showOnlineStatus={true}
        isOnline={item.isOnline}
      />
      
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.displayName}</Text>
        <Text style={[styles.userStatus, item.isOnline && styles.onlineStatus]}>
          {formatLastSeen(item.lastSeen, item.isOnline)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>Loading users...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Users</Text>
      </View>
      
      <FlatList
        data={users}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  list: {
    flex: 1,
  },
  userItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  userStatus: {
    fontSize: 14,
    color: '#8E8E93',
  },
  onlineStatus: {
    color: '#4CAF50',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});