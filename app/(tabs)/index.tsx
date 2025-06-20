import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useChats } from '@/hooks/useChat';
import Avatar from '@/components/Avatar';

export default function ChatList() {
  const { user } = useAuth();
  const { chats, loading } = useChats(user?.id || '');

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getOtherParticipant = (chat: any) => {
    const otherParticipantId = chat.participants.find((id: string) => id !== user?.id);
    return {
      id: otherParticipantId,
      name: chat.participantNames[otherParticipantId] || 'Unknown User',
      photo: chat.participantPhotos[otherParticipantId]
    };
  };

  const renderChatItem = ({ item }: { item: any }) => {
    const otherParticipant = getOtherParticipant(item);
    
    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => router.push(`/chat/${item.id}?userId=${otherParticipant.id}&userName=${otherParticipant.name}`)}
      >
        <Avatar
          size={50}
          name={otherParticipant.name}
          photoURL={otherParticipant.photo}
        />
        
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatName}>{otherParticipant.name}</Text>
            <Text style={styles.timestamp}>
              {formatTimestamp(item.lastMessageTimestamp)}
            </Text>
          </View>
          
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage?.text || 'No messages yet'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>Loading chats...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>
      
      {chats.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No chats yet</Text>
          <Text style={styles.emptySubtext}>
            Go to Users tab to start a conversation
          </Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
        />
      )}
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
  chatItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  chatInfo: {
    flex: 1,
    marginLeft: 12,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#8E8E93',
  },
  lastMessage: {
    fontSize: 14,
    color: '#8E8E93',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
});