import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { User } from '@/types';

export function useUsers(currentUserId?: string) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = currentUserId 
      ? query(collection(db, 'users'), where('id', '!=', currentUserId))
      : query(collection(db, 'users'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData: User[] = [];
      snapshot.forEach((doc) => {
        usersData.push({
          id: doc.id,
          ...doc.data(),
          lastSeen: doc.data().lastSeen?.toDate() || new Date(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        } as User);
      });
      setUsers(usersData);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUserId]);

  return { users, loading };
}