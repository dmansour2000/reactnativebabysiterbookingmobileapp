import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('@carenest_token');
      const storedUser = await AsyncStorage.getItem('@carenest_user');

      if (storedToken && storedUser) {
        let parsed = null;
        try {
          parsed = JSON.parse(storedUser);
        } catch (_) {}

        if (parsed?.role === 'admin') {
          await logout();
          return;
        }

        if (parsed) {
          setToken(storedToken);
          setUser(parsed);
        }
        
        // Fetch fresh profile in background
        try {
          const fresh = await apiRequest('/api/user', {
            headers: { 'x-auth-token': storedToken }
          });
          const freshUser = fresh?.user || (fresh?.id || fresh?._id ? fresh : null);
          if (freshUser) {
            if (freshUser.role === 'admin') {
              await logout();
              return;
            }
            let sitterPhoto = freshUser.photoUrl;
            let sitterName = freshUser.name;
            if (freshUser.role === 'babysitter') {
              try {
                const sitterProf = await apiRequest('/api/babysitter/profile', {
                  headers: { 'x-auth-token': storedToken }
                });
                if (sitterProf) {
                  if (sitterProf.photoUrl) sitterPhoto = sitterProf.photoUrl;
                  if (sitterProf.name) sitterName = sitterProf.name;
                }
              } catch (_) {}
            }
            const normalized = {
              ...freshUser,
              name: sitterName || freshUser.name || freshUser.username,
              photoUrl: sitterPhoto || freshUser.photoUrl,
              id: freshUser.id || freshUser._id,
            };
            setUser(normalized);
            await AsyncStorage.setItem('@carenest_user', JSON.stringify(normalized));
          }
        } catch (e) {
          // Token might be expired or access forbidden
          if (e.status === 401 || e.status === 403) {
            await logout();
          }
        }
      }
    } catch (e) {
      console.error('Failed to restore auth session:', e);
    } finally {
      setLoading(false);
    }
  };

  const login = async (identifier, password) => {
    const raw = (identifier || '').trim();
    const isEmail = raw.includes('@');
    const payload = {
      username: raw,
      email: isEmail ? raw.toLowerCase() : raw,
      identifier: raw,
      password,
    };

    const data = await apiRequest('/api/user/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (data.token && data.user) {
      if (data.user.role === 'admin') {
        await logout();
        const err = new Error('Admin accounts can only be accessed through the web admin dashboard.');
        err.status = 403;
        err.code = 'ADMIN_NOT_ALLOWED';
        throw err;
      }
      setToken(data.token);
      setUser(data.user);
      await AsyncStorage.setItem('@carenest_token', data.token);
      await AsyncStorage.setItem('@carenest_user', JSON.stringify(data.user));
    }
    return data;
  };

  const registerFamily = async ({ username, email, password }) => {
    const data = await apiRequest('/api/user/register', {
      method: 'POST',
      body: JSON.stringify({
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password
      })
    });

    if (data.token && data.user) {
      setToken(data.token);
      setUser(data.user);
      await AsyncStorage.setItem('@carenest_token', data.token);
      await AsyncStorage.setItem('@carenest_user', JSON.stringify(data.user));
    }
    return data;
  };

  const registerCaregiver = async (payload) => {
    const isForm = typeof FormData !== 'undefined' && payload instanceof FormData;
    const data = await apiRequest('/api/babysitter/register', {
      method: 'POST',
      body: isForm ? payload : JSON.stringify(payload)
    });

    if (data.token && data.user) {
      const caregiverUser = {
        ...data.user,
        role: 'babysitter',
        name: data.user.name || (isForm ? '' : payload?.name) || data.user.username,
      };
      setToken(data.token);
      setUser(caregiverUser);
      await AsyncStorage.setItem('@carenest_token', data.token);
      await AsyncStorage.setItem('@carenest_user', JSON.stringify(caregiverUser));
    }
    return data;
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    try {
      await AsyncStorage.removeItem('@carenest_token');
      await AsyncStorage.removeItem('@carenest_user');
    } catch (e) {}
  };

  const handleOAuthSession = async (data) => {
    if (data?.token && data?.user) {
      if (data.user.role === 'admin') {
        await logout();
        const err = new Error('Admin accounts can only be accessed through the web admin dashboard.');
        err.status = 403;
        err.code = 'ADMIN_NOT_ALLOWED';
        throw err;
      }
      setToken(data.token);
      setUser(data.user);
      await AsyncStorage.setItem('@carenest_token', data.token);
      await AsyncStorage.setItem('@carenest_user', JSON.stringify(data.user));
    }
    return data;
  };

  const changePassword = async (currentPassword, newPassword) => {
    return apiRequest('/api/user/password', {
      method: 'PATCH',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  };

  const changeEmail = async (currentPassword, newEmail) => {
    const res = await apiRequest('/api/user/email', {
      method: 'PATCH',
      body: JSON.stringify({ currentPassword, newEmail: newEmail.trim().toLowerCase() })
    });
    if (user && res.email) {
      const updatedUser = { ...user, email: res.email };
      setUser(updatedUser);
      await AsyncStorage.setItem('@carenest_user', JSON.stringify(updatedUser));
    }
    return res;
  };

  const updateUserLocal = async (partial) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...partial };
      AsyncStorage.setItem('@carenest_user', JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated: !!token && !!user,
      isCaregiver: user?.role === 'babysitter',
      isFamily: user?.role === 'user',
      isAdmin: user?.role === 'admin',
      login,
      registerFamily,
      registerCaregiver,
      handleOAuthSession,
      logout,
      changePassword,
      changeEmail,
      updateUserLocal,
      refreshUser: restoreSession
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
