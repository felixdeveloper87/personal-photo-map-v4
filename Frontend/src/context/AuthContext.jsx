import React, { createContext, useState, useEffect } from 'react';

/**
 * AuthContext
 * This context is used to manage and provide authentication information throughout the application.
 * Exporting it allows any consumer to use AuthContext in other components.
 */
export const AuthContext = createContext();

/**
 * AuthProvider Component
 * This component acts as a wrapper that holds authentication-related state and methods.
 * It provides the following:
 *  - Authentication status (isLoggedIn)
 *  - User's full name (fullname)
 *  - User's email (email)
 *  - Premium status (isPremium)
 *  - Methods to log in, log out, and update the premium status
 * 
 * The context's state is kept in sync with localStorage to persist data across browser sessions.
 * 
 * @param {object} props - The properties for this component.
 * @param {JSX.Element} props.children - The child components that will consume the authentication data.
 * @returns {JSX.Element} A context provider that supplies authentication state and methods.
 */
export const AuthProvider = ({ children }) => {
  /**
   * Determines if a user is logged in by checking the presence of a "token" in localStorage.
   * This ensures that if a token exists, the state initializes as logged in.
   */
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  /**
   * Stores the user's full name from localStorage, or defaults to an empty string if not found.
   */
  const [fullname, setFullname] = useState(localStorage.getItem('fullname') || '');

  /**
   * Stores the user's email address from localStorage, or defaults to an empty string if not found.
   */
  const [email, setEmail] = useState(localStorage.getItem('email') || '');

  /**
   * Determines if a user is a premium user by checking the "premium" value in localStorage.
   * The initial state is converted to a boolean, avoiding issues on the first render.
   */
  const [isPremium, setIsPremium] = useState(() => {
    return localStorage.getItem('premium') === 'true';
  });

  /**
   * Validates the stored token by making a test API call
   * @returns {Promise<boolean>} true if token is valid, false otherwise
   */
  const validateToken = async () => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const url = import.meta.env.VITE_BACKEND_URL 
        ? `${import.meta.env.VITE_BACKEND_URL}/api/auth/validate`
        : '/api/auth/validate';

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        return true;
      } else if (response.status === 401) {
        // Token is invalid, logout user
        logout();
        return false;
      }
      return false;
    } catch (error) {
      console.error('Token validation error:', error);
      // On network error, assume token is invalid and logout
      logout();
      return false;
    }
  };

  /**
   * Checks token validity on component mount and sets up periodic validation
   */
  useEffect(() => {
    if (isLoggedIn) {
      // Validate token immediately
      validateToken();
      
      // Set up periodic validation every 5 minutes
      const interval = setInterval(validateToken, 5 * 60 * 1000);
      
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  /**
   * Sets up a global fetch interceptor to handle authentication failures
   */
  useEffect(() => {
    // Store the original fetch function
    const originalFetch = window.fetch;
    
    // Override fetch to intercept responses
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      
      // Check for authentication failures
      if (response.status === 401 && isLoggedIn) {
        console.warn('🔐 Global fetch interceptor: Authentication failed');
        
        // Clear invalid token
        logout();
        
        // Show notification if possible
        if (typeof window !== 'undefined' && window.showToast) {
          window.showToast({
            title: "Session Expired",
            description: "Your login session has expired. Please log in again.",
            status: "warning",
            duration: 5000,
            isClosable: true,
          });
        }
      }
      
      return response;
    };
    
    // Cleanup function to restore original fetch
    return () => {
      window.fetch = originalFetch;
    };
  }, [isLoggedIn, logout]);

  /**
   * login
   * Handles the process of storing new authentication data (token, fullname, email, premium) both
   * in localStorage and in the component state. It also triggers a 'storage' event to notify
   * any other listeners (e.g., other browser tabs) of changes in localStorage.
   *
   * @param {object} data - An object containing user information.
   * @param {string} data.token - The authentication token for the user.
   * @param {string} data.fullname - The user's full name.
   * @param {string} data.email - The user's email address.
   * @param {boolean|string} data.premium - Indicates whether the user is a premium member.
   */
  const login = (data) => {
    console.log("Data received in login function:", data);

    if (typeof data !== "object") {
      console.error("Error: login data is not a valid object!", data);
      return;
    }

    const { token, fullname, email, premium } = data;

    // Convert 'premium' to a boolean if it is a string, otherwise check its boolean value
    const isPremiumUser = premium === true || premium === "true";

    // Store user data in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('fullname', fullname);
    localStorage.setItem('email', email);
    localStorage.setItem('premium', isPremiumUser ? "true" : "false");

    // Update state to reflect authenticated status
    setIsLoggedIn(true);
    setFullname(fullname);
    setEmail(email);
    setIsPremium(isPremiumUser);

    console.log("Premium status on the frontend after login:", isPremiumUser);

    // Dispatch a storage event to notify other browser tabs or components
    window.dispatchEvent(new Event('storage'));
  };

  /**
   * logout
   * Handles the logout process by removing user-related data from localStorage,
   * resetting the relevant states, and dispatching a 'storage' event to inform
   * other parts of the application of the change.
   */
  const logout = () => {
    // Remove user credentials from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('fullname');
    localStorage.removeItem('email');
    // localStorage.setItem('premium', "false"); // Uncomment if needed

    // Reset the local state to reflect that the user is no longer logged in
    setIsLoggedIn(false);
    setFullname('');
    setEmail('');
    // setIsPremium(false); // Uncomment if you want to reset premium status on logout

    // Dispatch a storage event to notify other components or tabs
    window.dispatchEvent(new Event('storage'));
  };

  /**
   * register
   * Handles user registration by making an API call to the backend.
   * If successful, automatically logs the user in.
   *
   * @param {object} userData - Registration data (fullname, email, password)
   * @returns {Promise} - Promise that resolves with the response or rejects with an error
   */
  const register = async (userData) => {
    console.log('🚀 Register function called with:', userData);
    
    try {
      // Use o proxy do Vite quando VITE_BACKEND_URL não estiver definido
      const url = import.meta.env.VITE_BACKEND_URL 
        ? `${import.meta.env.VITE_BACKEND_URL}/api/auth/register`
        : '/api/auth/register';

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      console.log('📡 Register response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Register error response:', errorText);
        throw new Error(errorText || 'Registration failed');
      }

      const data = await response.json();
      console.log('✅ Register success data:', data);
      
      // Auto-login after successful registration
      if (data.token) {
        console.log('🔑 Auto-login with token');
        login(data);
      }
      
      return data;
    } catch (error) {
      console.error('💥 Register function error:', error);
      throw error;
    }
  };

  /**
   * updatePremiumStatus
   * Updates the premium status in both localStorage and the component state.
   *
   * @param {boolean|string} status - The new premium status to be set. Can be a boolean or a string.
   */
  const updatePremiumStatus = (status) => {
    const statusStr = String(status);
    localStorage.setItem('premium', statusStr);
    setIsPremium(statusStr === 'true');
    console.log("Premium status updated to:", statusStr);
  };

  /**
   * Render a Provider that makes all state variables and functions
   * available to any child components through the AuthContext.
   */
  return (
    <AuthContext.Provider 
      value={{ 
        isLoggedIn, 
        isPremium, 
        fullname, 
        email, 
        login, 
        logout, 
        updatePremiumStatus 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
