import { createContext, useContext, useReducer, useEffect } from 'react';

export const AuthContext = createContext();

const initialState = {
  user: localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')) : null,
  role: localStorage.getItem('role') || null,
  token: localStorage.getItem('token') || null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return {
        user: action.payload.user,
        token: action.payload.token,
        role: action.payload.user.role,
      };

    case 'LOGOUT':
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      localStorage.removeItem('role');
      return {
        user: null,
        token: null,
        role: null,
      };

    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userData', JSON.stringify(userData));
    localStorage.setItem('role', userData.role);

    dispatch({
      type: 'LOGIN',
      payload: {
        user: userData,
        token,
      },
    });
  };

  const logout = () => {
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