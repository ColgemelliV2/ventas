'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { login as loginAction } from '@/app/actions';
import type { Cajero } from '@/types';

const useAuth = () => {
  const [user, setUser] = useState<Cajero | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const userJson = localStorage.getItem('bingo_user');
      if (userJson) {
        setUser(JSON.parse(userJson));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('bingo_user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    try {
      const result = await loginAction({ username, password });
      if (result.success && result.user) {
        setUser(result.user);
        localStorage.setItem('bingo_user', JSON.stringify(result.user));
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('bingo_user');
    router.push('/login');
  }, [router]);

  return { user, login, logout, loading };
};

export default useAuth;
