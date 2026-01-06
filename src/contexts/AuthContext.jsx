import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase/config';

const AuthContext = createContext();

// Hardcoded admin credentials
const ADMIN_EMAIL = 'admin';
const ADMIN_PASSWORD = 'admin123';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for admin in localStorage
    const adminUser = localStorage.getItem('adminUser');
    if (adminUser === 'true') {
      setCurrentUser({ email: ADMIN_EMAIL, isAdmin: true });
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setCurrentUser({
          email: session.user.email,
          id: session.user.id,
          isAdmin: false,
        });
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentUser({
          email: session.user.email,
          id: session.user.id,
          isAdmin: false,
        });
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    // Check for hardcoded admin credentials (case-insensitive)
    if (email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
      const adminUser = { email: ADMIN_EMAIL, isAdmin: true };
      localStorage.setItem('adminUser', 'true');
      setCurrentUser(adminUser);
      return Promise.resolve();
    }

    // Regular user login via Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Provide user-friendly error messages
      if (error.message?.includes('Email not confirmed') || 
          error.message?.includes('email_not_confirmed') ||
          error.message?.includes('signup_disabled')) {
        throw new Error('Please check your email and confirm your account before logging in.');
      } else if (error.message?.includes('Invalid login credentials') || 
                 error.message?.includes('invalid_credentials')) {
        throw new Error('Invalid email or password. Please check your credentials.');
      }
      throw error;
    }
    return data;
  };

  const logout = async () => {
    // Clear admin session
    localStorage.removeItem('adminUser');
    
    // Logout from Supabase if it's a regular user
    if (currentUser && !currentUser.isAdmin) {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    }
    
    setCurrentUser(null);
    return Promise.resolve();
  };

  const signup = async (email, password) => {
    // Admin signup is not allowed - only hardcoded admin exists
    if (email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase()) {
      throw new Error('Admin account cannot be created. Use the default admin credentials to login.');
    }
    
    // Regular user signup via Supabase
    // Note: Supabase requires email confirmation by default
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      }
    });

    if (error) {
      // Provide user-friendly error messages
      if (error.message.includes('already registered') || error.message.includes('already been registered')) {
        throw new Error('This email is already registered. Please log in instead.');
      }
      throw error;
    }
    
    // If email confirmation is required, return success with confirmation message
    if (data.user && !data.session) {
      // Return data with a flag indicating email confirmation is needed
      return { ...data, requiresEmailConfirmation: true };
    }
    
    return data;
  };

  const value = {
    currentUser,
    login,
    logout,
    signup,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
