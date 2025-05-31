import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import type { IUser } from "@/types/user/user.types";
import axiosInstance from "@/helper/axiosInstance";
import { toast } from "sonner";

interface AuthContextType {
  isAuthenticated: boolean;
  user: IUser | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUser = async () => {
    try {
      const res = await axiosInstance.get("/user/me", {
        withCredentials: true,
      });
      setUser(res.data.user);
      setIsAuthenticated(true);
      toast.success("User authenticated ✅"); // ✅ Show success toast
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      toast.error("Failed to authenticate user ❌"); // ✅ Show error toast
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
