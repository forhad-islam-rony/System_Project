import { useContext, useEffect, useReducer, createContext } from "react";

const getUserFromLocalStorage = () => {
  const user = localStorage.getItem('user');
  try {
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

const initialState = {
  user: getUserFromLocalStorage(),
  role: localStorage.getItem('role') || null,
  token: localStorage.getItem('token') || null,
};


export const AuthContext = createContext(initialState);

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        user: null,
        role: null,
        token: null,
      };
    case "LOGIN_SUCCESS":
      return {
        user: action.payload.user,
        role: action.payload.role,
        token: action.payload.token,
      };

      case "LOGOUT":
        return {
          user: null,
          token: null,
          role: null,
        };

      default:
        return state;
}
};  


export const AuthContextProvider = ({ children }) => {
  
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    if (state.user) {
      localStorage.setItem('user', JSON.stringify(state.user));
    } else {
      localStorage.removeItem('user');
    }
    if (state.token) {
      localStorage.setItem('token', state.token);
    } else {
      localStorage.removeItem('token');
    }
    if (state.role) {
      localStorage.setItem('role', state.role);
    } else {
      localStorage.removeItem('role');
    }
  }, [state]);
  
  
  return <AuthContext.Provider value={{user:state.user, role:state.role, token:state.token, dispatch}}>
    {children}
  </AuthContext.Provider>
}