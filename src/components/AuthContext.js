import React, { createContext, useState, useEffect } from 'react';
import API_URL from '../config/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await fetch(`${API_URL}/logged`, {
          credentials: 'include',
        });
        const data = await res.json();
        if (data.logged_in) {
          setLoggedIn(true);
          const userRes = await fetch(`${API_URL}/me`, {
            credentials: 'include',
          });
          if (userRes.ok) {
            const userData = await userRes.json();
            setCurrentUser(userData);
          } else {
            console.error('Failed to fetch user data from /me endpoint:', userRes.status);
            try {
              const errorData = await userRes.json();
              console.error('Error details:', errorData);
            } catch (e) {
              console.error('Could not parse error response');
            }
          }
        } else {
          setLoggedIn(false);
          setCurrentUser(null);
        }
      } catch (err) {
        console.error('Failed to check login', err);
        setLoggedIn(false);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkLogin();
  }, []);

  return (
    <AuthContext.Provider value={{ loggedIn, setLoggedIn, currentUser, setCurrentUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
