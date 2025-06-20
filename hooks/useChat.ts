import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  orderBy, 
  addDoc, 
  serverTimestamp,
  where,
  getDocs,
  doc,
  setDoc
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Message, Chat } from '@/types';

export function useMessages(chatId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chatId) return;

    const q = query(
      collection(db, 'messages'),
      where('chatId', '==', chatId),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData: Message[] = [];
      snapshot.forEach((doc) => {
        messagesData.push({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date()
        } as Message);
      });
      setMessages(messagesData);
      setLoading(false);
    });

    return unsubscribe;
  }, [chatId]);

  return { messages, loading };
}

export function useChats(userId: string) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', userId),
      orderBy('lastMessageTimestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatsData: Chat[] = [];
      snapshot.forEach((doc) => {
        chatsData.push({
          id: doc.id,
          ...doc.data(),
          lastMessageTimestamp: doc.data().lastMessageTimestamp?.toDate() || new Date()
        } as Chat);
      });
      setChats(chatsData);
      setLoading(false);
    });

    return unsubscribe;
  }, [userId]);

  return { chats, loading };
}

export async function sendMessage(
  chatId: string,
  senderId: string,
  receiverId: string,
  text?: string,
  imageUrl?: string
) {
  const message: Omit<Message, 'id'> = {
    text,
    imageUrl,
    senderId,
    receiverId,
    chatId,
    timestamp: new Date(),
    type: imageUrl ? 'image' : 'text'
  };

  // Add message to messages collection
  const messageRef = await addDoc(collection(db, 'messages'), {
    ...message,
    timestamp: serverTimestamp()
  });

  // Update chat's last message
  await setDoc(doc(db, 'chats', chatId), {
    participants: [senderId, receiverId],
    lastMessage: { ...message, id: messageRef.id },
    lastMessageTimestamp: serverTimestamp(),
    participantNames: {}, // This should be populated with actual names
    participantPhotos: {} // This should be populated with actual photos
  }, { merge: true });
}

export async function createChat(userId1: string, userId2: string): Promise<string> {
  // Check if chat already exists
  const q = query(
    collection(db, 'chats'),
    where('participants', 'array-contains', userId1)
  );
  
  const querySnapshot = await getDocs(q);
  let existingChatId: string | null = null;
  
  querySnapshot.forEach((doc) => {
    const chatData = doc.data();
    if (chatData.participants.includes(userId2)) {
      existingChatId = doc.id;
    }
  });

  if (existingChatId) {
    return existingChatId;
  }

  // Create new chat
  const chatRef = doc(collection(db, 'chats'));
  await setDoc(chatRef, {
    participants: [userId1, userId2],
    lastMessageTimestamp: serverTimestamp(),
    participantNames: {},
    participantPhotos: {}
  });

  return chatRef.id;
}