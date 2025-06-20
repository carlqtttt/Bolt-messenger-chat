export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  isOnline: boolean;
  lastSeen: Date;
  createdAt: Date;
}

export interface Message {
  id: string;
  text?: string;
  imageUrl?: string;
  senderId: string;
  receiverId: string;
  chatId: string;
  timestamp: Date;
  type: 'text' | 'image';
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: Message;
  lastMessageTimestamp: Date;
  participantNames: { [key: string]: string };
  participantPhotos: { [key: string]: string };
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
}