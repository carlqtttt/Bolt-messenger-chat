import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { AuthContextType, User } from '@/types';

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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          displayName: firebaseUser.displayName || 'Anonymous',
          photoURL: firebaseUser.photoURL || undefined,
          isOnline: true,
          lastSeen: new Date(),
          createdAt: new Date()
        };
        setUser(userData);
        
        // Update user's online status in Firestore
        await updateDoc(doc(db, 'users', firebaseUser.uid), {
          isOnline: true,
          lastSeen: serverTimestamp()
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName });
    
    // Create user document in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      id: userCredential.user.uid,
      email,
      displayName,
      isOnline: true,
      lastSeen: serverTimestamp(),
      createdAt: serverTimestamp()
    });
  };

  const signOut = async () => {
    if (user) {
      // Update user's online status to false before signing out
      await updateDoc(doc(db, 'users', user.id), {
        isOnline: false,
        lastSeen: serverTimestamp()
      });
    }
    await firebaseSignOut(auth);
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