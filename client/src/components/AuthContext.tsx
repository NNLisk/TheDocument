import { createContext, useContext, useState, useEffect } from "react";


// authcontext this is the component to pass login state related stuff to lower components
// components can do const auth = useAuth(); to use this.
// mainly manages the localstorage token
// handles the session timeout also


interface AuthContextType {
  token: string | null;
  isLoggedIn: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {

  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  const login = (newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  useEffect(() => {
    if (!token) return;
    const payload = JSON.parse(atob(token.split(".")[1]));
    const exp = payload.exp * 1000;
    const timeout = exp - Date.now();
    if (timeout <= 0) {
      logout();
      return;
    }
    const timer = setTimeout(() => logout(), timeout);
    return () => clearTimeout(timer);
  }, [token]);

  return (
    <AuthContext.Provider
      value={{ token, isLoggedIn: !!token, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("Authentication err");
  return context;
};