import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthContextType, User } from '@/types';
import StorageService from '@/services/StorageService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      await StorageService.initializeStorage();
      const currentUser = await StorageService.getCurrentUser();
      if (currentUser) {
        // Update user's online status
        await StorageService.updateUser(currentUser.id, {
          isOnline: true,
          lastSeen: new Date(),
        });
        setUser({ ...currentUser, isOnline: true, lastSeen: new Date() });
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const existingUser = await StorageService.getUserByEmail(email);
      if (!existingUser) {
        throw new Error('User not found');
      }

      // In a real app, you would verify the password here
      // For this demo, we'll just check if password is not empty
      if (!password) {
        throw new Error('Password is required');
      }

      // Update user's online status
      const updatedUser = {
        ...existingUser,
        isOnline: true,
        lastSeen: new Date(),
      };

      await StorageService.updateUser(existingUser.id, {
        isOnline: true,
        lastSeen: new Date(),
      });

      await StorageService.setCurrentUser(updatedUser);
      setUser(updatedUser);
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      // Check if user already exists
      const existingUser = await StorageService.getUserByEmail(email);
      if (existingUser) {
        throw new Error('User already exists');
      }

      // Create new user
      const newUser: User = {
        id: StorageService.generateId(),
        email,
        displayName,
        photoURL: `https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2`,
        isOnline: true,
        lastSeen: new Date(),
        createdAt: new Date(),
      };

      await StorageService.addUser(newUser);
      await StorageService.setCurrentUser(newUser);
      setUser(newUser);
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      if (user) {
        // Update user's online status to false before signing out
        await StorageService.updateUser(user.id, {
          isOnline: false,
          lastSeen: new Date(),
        });
      }
      await StorageService.clearCurrentUser();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}