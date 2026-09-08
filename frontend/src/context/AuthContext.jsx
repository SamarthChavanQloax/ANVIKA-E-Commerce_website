import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(() => {
    try {
      const savedUser = localStorage.getItem('userInfo');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (userInfo) {
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      if (userInfo.token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${userInfo.token}`;
      }
    } else {
      localStorage.removeItem('userInfo');
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [userInfo]);

  const login = (data) => {
    setUserInfo(data);
    if (data.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    }
  };

  const updateUser = (updatedData) => {
    setUserInfo((prev) => {
      const nextUser = {
        ...prev,
        ...updatedData,
        // preserve existing token if not returned in profile update
        token: updatedData.token || prev?.token,
      };
      return nextUser;
    });
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout', {}, { withCredentials: true }).catch(() => {});
      await axios.post('/api/users/logout', {}, { withCredentials: true }).catch(() => {});
    } catch (e) {}
    setUserInfo(null);
    delete axios.defaults.headers.common['Authorization'];
    localStorage.removeItem('userInfo');
    localStorage.removeItem('anvika_cart');
    localStorage.removeItem('anvika_wishlist');
  };

  return (
    <AuthContext.Provider value={{ userInfo, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
