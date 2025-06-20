import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Message, Chat } from '@/types';

const STORAGE_KEYS = {
  USERS: 'users',
  MESSAGES: 'messages',
  CHATS: 'chats',
  CURRENT_USER: 'currentUser',
};

// Mock data for initial users
const MOCK_USERS: User[] = [
  {
    id: 'user1',
    email: 'alice@example.com',
    displayName: 'Alice Johnson',
    photoURL: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    isOnline: true,
    lastSeen: new Date(),
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'user2',
    email: 'bob@example.com',
    displayName: 'Bob Smith',
    photoURL: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    isOnline: false,
    lastSeen: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    createdAt: new Date('2024-01-02'),
  },
  {
    id: 'user3',
    email: 'carol@example.com',
    displayName: 'Carol Davis',
    photoURL: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    isOnline: true,
    lastSeen: new Date(),
    createdAt: new Date('2024-01-03'),
  },
  {
    id: 'user4',
    email: 'david@example.com',
    displayName: 'David Wilson',
    photoURL: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    isOnline: false,
    lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    createdAt: new Date('2024-01-04'),
  },
];

class StorageService {
  // Initialize storage with mock data
  async initializeStorage() {
    try {
      const existingUsers = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
      if (!existingUsers) {
        await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(MOCK_USERS));
      }
      
      const existingMessages = await AsyncStorage.getItem(STORAGE_KEYS.MESSAGES);
      if (!existingMessages) {
        await AsyncStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify([]));
      }
      
      const existingChats = await AsyncStorage.getItem(STORAGE_KEYS.CHATS);
      if (!existingChats) {
        await AsyncStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify([]));
      }
    } catch (error) {
      console.error('Error initializing storage:', error);
    }
  }

  // User management
  async getUsers(): Promise<User[]> {
    try {
      const users = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
      return users ? JSON.parse(users).map((user: any) => ({
        ...user,
        lastSeen: new Date(user.lastSeen),
        createdAt: new Date(user.createdAt),
      })) : [];
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  }

  async addUser(user: User): Promise<void> {
    try {
      const users = await this.getUsers();
      const updatedUsers = [...users, user];
      await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
    } catch (error) {
      console.error('Error adding user:', error);
    }
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    try {
      const users = await this.getUsers();
      const updatedUsers = users.map(user => 
        user.id === userId ? { ...user, ...updates } : user
      );
      await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
    } catch (error) {
      console.error('Error updating user:', error);
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const users = await this.getUsers();
      return users.find(user => user.email === email) || null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  // Current user session
  async setCurrentUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } catch (error) {
      console.error('Error setting current user:', error);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const user = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return user ? {
        ...JSON.parse(user),
        lastSeen: new Date(JSON.parse(user).lastSeen),
        createdAt: new Date(JSON.parse(user).createdAt),
      } : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  async clearCurrentUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    } catch (error) {
      console.error('Error clearing current user:', error);
    }
  }

  // Messages
  async getMessages(): Promise<Message[]> {
    try {
      const messages = await AsyncStorage.getItem(STORAGE_KEYS.MESSAGES);
      return messages ? JSON.parse(messages).map((message: any) => ({
        ...message,
        timestamp: new Date(message.timestamp),
      })) : [];
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  }

  async addMessage(message: Message): Promise<void> {
    try {
      const messages = await this.getMessages();
      const updatedMessages = [...messages, message];
      await AsyncStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(updatedMessages));
    } catch (error) {
      console.error('Error adding message:', error);
    }
  }

  async getMessagesByChatId(chatId: string): Promise<Message[]> {
    try {
      const messages = await this.getMessages();
      return messages.filter(message => message.chatId === chatId);
    } catch (error) {
      console.error('Error getting messages by chat ID:', error);
      return [];
    }
  }

  // Chats
  async getChats(): Promise<Chat[]> {
    try {
      const chats = await AsyncStorage.getItem(STORAGE_KEYS.CHATS);
      return chats ? JSON.parse(chats).map((chat: any) => ({
        ...chat,
        lastMessageTimestamp: new Date(chat.lastMessageTimestamp),
        lastMessage: chat.lastMessage ? {
          ...chat.lastMessage,
          timestamp: new Date(chat.lastMessage.timestamp),
        } : undefined,
      })) : [];
    } catch (error) {
      console.error('Error getting chats:', error);
      return [];
    }
  }

  async addChat(chat: Chat): Promise<void> {
    try {
      const chats = await this.getChats();
      const updatedChats = [...chats, chat];
      await AsyncStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(updatedChats));
    } catch (error) {
      console.error('Error adding chat:', error);
    }
  }

  async updateChat(chatId: string, updates: Partial<Chat>): Promise<void> {
    try {
      const chats = await this.getChats();
      const updatedChats = chats.map(chat => 
        chat.id === chatId ? { ...chat, ...updates } : chat
      );
      await AsyncStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(updatedChats));
    } catch (error) {
      console.error('Error updating chat:', error);
    }
  }

  async getChatsByUserId(userId: string): Promise<Chat[]> {
    try {
      const chats = await this.getChats();
      return chats.filter(chat => chat.participants.includes(userId));
    } catch (error) {
      console.error('Error getting chats by user ID:', error);
      return [];
    }
  }

  async findChatByParticipants(userId1: string, userId2: string): Promise<Chat | null> {
    try {
      const chats = await this.getChats();
      return chats.find(chat => 
        chat.participants.includes(userId1) && chat.participants.includes(userId2)
      ) || null;
    } catch (error) {
      console.error('Error finding chat by participants:', error);
      return null;
    }
  }

  // Utility method to generate unique IDs
  generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}

export default new StorageService();