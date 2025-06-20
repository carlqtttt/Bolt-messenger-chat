import { useState, useEffect } from 'react';
import { User } from '@/types';
import StorageService from '@/services/StorageService';

export function useUsers(currentUserId?: string) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
    
    // Set up polling for real-time updates
    const interval = setInterval(loadUsers, 5000);
    
    return () => clearInterval(interval);
  }, [currentUserId]);

  const loadUsers = async () => {
    try {
      const allUsers = await StorageService.getUsers();
      // Filter out current user
      const filteredUsers = currentUserId 
        ? allUsers.filter(user => user.id !== currentUserId)
        : allUsers;
      
      setUsers(filteredUsers);
      setLoading(false);
    } catch (error) {
      console.error('Error loading users:', error);
      setLoading(false);
    }
  };

  return { users, loading };
}