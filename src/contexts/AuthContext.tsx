import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, SecurityLevel } from '@/types/security';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const MOCK_USERS: (User & { password: string })[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@security.gov',
    role: 'admin',
    securityLevel: 'top-secret',
    password: 'admin123',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    username: 'public_user',
    email: 'public@company.com',
    role: 'user',
    securityLevel: 'public',
    password: 'user123',
    createdAt: new Date('2024-03-15'),
  },
  {
    id: '3',
    username: 'secret_user',
    email: 'secret@security.gov',
    role: 'user',
    securityLevel: 'top-secret',
    password: 'secret123',
    createdAt: new Date('2024-02-20'),
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const foundUser = MOCK_USERS.find(
      u => u.username === username && u.password === password
    );
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
