import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/security';
import api from '@/lib/api';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // 初始化时检查 Token 是否有效
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.get('/users/me');
          // 需要转换一下后端返回的数据结构以匹配前端 User 类型
          const userData = mapBackendUserToFrontend(response.data);
          setUser(userData);
        } catch (error) {
          console.error("Token invalid", error);
          localStorage.removeItem('token');
        }
      }
    };
    checkAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // 1. 获取 Token (注意 FastAPI 需要 form-data 格式)
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);

      const res = await api.post('/token', formData);
      const { access_token } = res.data;

      localStorage.setItem('token', access_token);

      // 2. 获取用户信息
      const userRes = await api.get('/users/me');
      const userData = mapBackendUserToFrontend(userRes.data);
      setUser(userData);
      return true;
    } catch (error) {
      console.error("Login failed", error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // 辅助函数：转换后端数据格式
  const mapBackendUserToFrontend = (data: any): User => ({
    id: data.id.toString(),
    username: data.username,
    email: data.email,
    role: data.role,
    securityLevel: data.security_level.level_name, // 取出嵌套的 level_name
    createdAt: new Date(data.created_at),
  });

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