import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useMessages, sendMessage } from '@/hooks/useChat';
import MessageBubble from '@/components/MessageBubble';
import ChatInput from '@/components/ChatInput';
import Avatar from '@/components/Avatar';

export default function ChatScreen() {
  const { id, userId, userName } = useLocalSearchParams();
  const { user } = useAuth();
  const { messages, loading } = useMessages(id as string);
  const [sendingMessage, setSendingMessage] = useState(false);

  const handleSendMessage = async (text: string) => {
    if (!user || !userId) return;
    
    setSendingMessage(true);
    try {
      await sendMessage(id as string, user.id, userId as string, text);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleSendImage = async (imageUri: string) => {
    if (!user || !userId) return;
    
    setSendingMessage(true);
    try {
      // In a real app, you would upload the image to Firebase Storage first
      // and then send the download URL
      await sendMessage(id as string, user.id, userId as string, undefined, imageUri);
    } catch (error) {
      console.error('Error sending image:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const renderMessage = ({ item }: { item: any }) => (
    <MessageBubble
      message={item}
      isOwn={item.senderId === user?.id}
    />
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#007AFF" />
        </TouchableOpacity>
        
        <Avatar
          size={32}
          name={userName as string}
        />
        
        <Text style={styles.headerTitle}>{userName}</Text>
        
        <View style={styles.spacer} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <Text>Loading messages...</Text>
        </View>
      ) : (
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          inverted
        />
      )}

      <ChatInput
        onSendMessage={handleSendMessage}
        onSendImage={handleSendImage}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  spacer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
    paddingVertical: 8,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});