import { useState, useEffect } from 'react';
import { Message, Chat } from '@/types';
import StorageService from '@/services/StorageService';

export function useMessages(chatId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chatId) return;

    loadMessages();
    
    // Set up polling for real-time updates (simulate real-time)
    const interval = setInterval(loadMessages, 2000);
    
    return () => clearInterval(interval);
  }, [chatId]);

  const loadMessages = async () => {
    try {
      const messagesData = await StorageService.getMessagesByChatId(chatId);
      setMessages(messagesData.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
      setLoading(false);
    } catch (error) {
      console.error('Error loading messages:', error);
      setLoading(false);
    }
  };

  return { messages, loading };
}

export function useChats(userId: string) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    loadChats();
    
    // Set up polling for real-time updates
    const interval = setInterval(loadChats, 3000);
    
    return () => clearInterval(interval);
  }, [userId]);

  const loadChats = async () => {
    try {
      const chatsData = await StorageService.getChatsByUserId(userId);
      
      // Populate participant names and photos
      const users = await StorageService.getUsers();
      const populatedChats = chatsData.map(chat => {
        const participantNames: { [key: string]: string } = {};
        const participantPhotos: { [key: string]: string } = {};
        
        chat.participants.forEach(participantId => {
          const user = users.find(u => u.id === participantId);
          if (user) {
            participantNames[participantId] = user.displayName;
            participantPhotos[participantId] = user.photoURL || '';
          }
        });
        
        return {
          ...chat,
          participantNames,
          participantPhotos,
        };
      });
      
      // Sort by last message timestamp
      populatedChats.sort((a, b) => b.lastMessageTimestamp.getTime() - a.lastMessageTimestamp.getTime());
      
      setChats(populatedChats);
      setLoading(false);
    } catch (error) {
      console.error('Error loading chats:', error);
      setLoading(false);
    }
  };

  return { chats, loading };
}

export async function sendMessage(
  chatId: string,
  senderId: string,
  receiverId: string,
  text?: string,
  imageUrl?: string
) {
  try {
    const message: Message = {
      id: StorageService.generateId(),
      text,
      imageUrl,
      senderId,
      receiverId,
      chatId,
      timestamp: new Date(),
      type: imageUrl ? 'image' : 'text'
    };

    // Add message to storage
    await StorageService.addMessage(message);

    // Update chat's last message
    await StorageService.updateChat(chatId, {
      lastMessage: message,
      lastMessageTimestamp: new Date(),
    });

    // Simulate receiving a response after a delay (for demo purposes)
    if (text && text.toLowerCase().includes('hello')) {
      setTimeout(async () => {
        const responseMessage: Message = {
          id: StorageService.generateId(),
          text: "Hello! How are you doing?",
          senderId: receiverId,
          receiverId: senderId,
          chatId,
          timestamp: new Date(),
          type: 'text'
        };
        
        await StorageService.addMessage(responseMessage);
        await StorageService.updateChat(chatId, {
          lastMessage: responseMessage,
          lastMessageTimestamp: new Date(),
        });
      }, 2000);
    }
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

export async function createChat(userId1: string, userId2: string): Promise<string> {
  try {
    // Check if chat already exists
    const existingChat = await StorageService.findChatByParticipants(userId1, userId2);
    if (existingChat) {
      return existingChat.id;
    }

    // Get user information for participant names and photos
    const users = await StorageService.getUsers();
    const user1 = users.find(u => u.id === userId1);
    const user2 = users.find(u => u.id === userId2);

    // Create new chat
    const newChat: Chat = {
      id: StorageService.generateId(),
      participants: [userId1, userId2],
      lastMessageTimestamp: new Date(),
      participantNames: {
        [userId1]: user1?.displayName || 'Unknown',
        [userId2]: user2?.displayName || 'Unknown',
      },
      participantPhotos: {
        [userId1]: user1?.photoURL || '',
        [userId2]: user2?.photoURL || '',
      },
    };

    await StorageService.addChat(newChat);
    return newChat.id;
  } catch (error) {
    console.error('Error creating chat:', error);
    throw error;
  }
}