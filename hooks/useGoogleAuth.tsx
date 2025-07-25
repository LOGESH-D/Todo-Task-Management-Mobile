import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

interface User {
  name?: string;
  email: string;
  picture?: string;
}

interface AuthContextProps {
  user: User | null;
  signIn: () => Promise<void>;
  signOut: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  signIn: async () => {},
  signOut: () => {},
  error: null,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: '353785517249-u253i4t706o1847fr36pa8anlttc94ef.apps.googleusercontent.com',
    webClientId: '353785517249-efofrn7kef5ataekjs8cfrs0n40av0lk.apps.googleusercontent.com',
    redirectUri: makeRedirectUri({ useProxy: true }) as string,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${authentication?.accessToken}` },
      })
        .then(res => res.json())
        .then(data => {
          setUser({
            name: data.name,
            email: data.email,
            picture: data.picture,
          });
          setError(null);
        })
        .catch(() => setError('Failed to fetch user info'));
    } else if (response?.type === 'error') {
      setError('Authentication failed');
    }
  }, [response]);

  const signIn = async () => {
    setError(null);
    try {
      await promptAsync();
    } catch (e) {
      setError('Google sign-in error');
    }
  };

  const signOut = () => {
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useGoogleAuth = () => useContext(AuthContext); 