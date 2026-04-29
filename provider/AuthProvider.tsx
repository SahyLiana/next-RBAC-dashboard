"use client";

import { apiClient } from "@/app/lib/apiClient";
import { AuthContextType, Role, User } from "@/app/types";
import {
  createContext,
  useActionState,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext<AuthContextType | undefined>(undefined);
type LoginState = {
  success?: boolean;
  user?: User | null;
  error?: string;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  //React 19 useActionState for login
  const [loginState, loginAction, isLoginPending] = useActionState(
    async (prevState: LoginState, formData: FormData): Promise<LoginState> => {
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;

      try {
        const data = await apiClient.login(email, password);
        setUser(data);
        return { success: true, user: data.user };
      } catch (e) {
        console.error(e);
        return {
          error: e instanceof Error ? e.message : "Login failed",
        };
      }
    },
    {
      error: undefined,
      success: undefined,
      user: undefined,
    } as LoginState,
  );

  const logout = async () => {
    try {
      await apiClient.logout();
      setUser(null);
      window.location.href = "/";
    } catch (e) {
      console.error("logout error", e);
    }
  };

  const hasPermission = (requiredRole: Role): boolean => {
    if (!user) return false;
    const roleHierarchy = {
      [Role.GUEST]: 0,
      [Role.USER]: 1,
      [Role.MANAGER]: 2,
      [Role.ADMIN]: 3,
    };
    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
  };

  //Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await apiClient.getCurrentUser();
        console.log(data);
        setUser(data);
      } catch (e) {
        console.error("failed to load user:", e);
      }
    };

    loadUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, login: loginAction, logout, hasPermission }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return context;
};

export default AuthProvider;
