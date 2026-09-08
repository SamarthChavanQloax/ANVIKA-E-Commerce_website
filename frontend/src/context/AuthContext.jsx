import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(() => {
    const savedUser = localStorage.getItem('userInfo');
    return savedUser ? JSON.parse(savedUser) : null;
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

  const logout = () => {
    setUserInfo(null);
    delete axios.defaults.headers.common['Authorization'];
    axios.post('/api/users/logout', {}, { withCredentials: true }).catch(() => {});
  };

  return (
    <AuthContext.Provider value={{ userInfo, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
