import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Create the context
export const AuthContext = createContext();

const initialState = {
  user: localStorage.getItem('user') !== undefined ? JSON.parse(localStorage.getItem('user')) : null,
  role: localStorage.getItem('role') || null,
  token: localStorage.getItem('token') || null,
};

export const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_START":
      return {
        user: null,
        token: null,
        role: null,
        loading: true,
        error: null,
      };

    case "LOGIN_SUCCESS":
      return {
        user: action.payload.user,
        token: action.payload.token,
        role: action.payload.role,
        loading: false,
        error: null,
      };

    case "LOGIN_FAILURE":
      return {
        user: null,
        token: null,
        role: null,
        loading: false,
        error: action.payload,
      };

    case "LOGOUT":
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      return {
        user: null,
        token: null,
        role: null,
        loading: false,
        error: null,
      };

    case "UPDATE_USER":
      return {
        ...state,
        user: action.payload.user,
        loading: false,
        error: null,
      };

    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(state.user));
    localStorage.setItem('token', state.token);
    localStorage.setItem('role', state.role);
  }, [state]);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('role', userData.role);

    dispatch({
      type: 'LOGIN_SUCCESS',
      payload: {
        user: userData,
        token,
        role: userData.role,
      },
    });
  };

  const logout = () => {
    // Clear cart data for the user
    const userId = state.user?._id;
    if (userId) {
      localStorage.removeItem(`cart_${userId}`);
    }

    // Clear auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider 
      value={{
        user: state.user,
        token: state.token,
        role: state.role,
        dispatch,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};