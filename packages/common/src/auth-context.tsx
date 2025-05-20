"use client"

import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { BACKEND_URL } from "./config";

export type User = {
    id: string;
    email: string;
    name: string;
};

export type AuthContextType = {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
    checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const checkAuth = async () => {
        const token = localStorage.getItem("token");
        console.log("Checking auth with token:", token);

        if (!token) {
            console.log("No token found");
            setIsAuthenticated(false);
            setUser(null);
            return false;
        }

        try {
            console.log("Making request to /me with token");
            const response = await axios.get(`${BACKEND_URL}/api/v1/user/me`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log("Auth check response:", response.data);

            const { userId, email, name } = response.data;
            setUser({
                id: userId,
                email,
                name
            });
            setIsAuthenticated(true);
            return true;
        } catch (error) {
            console.error("Auth check failed:", error);
            localStorage.removeItem("token");
            setUser(null);
            setIsAuthenticated(false);
            return false;
        }
    };

    useEffect(() => {
        checkAuth().finally(() => {
            setIsLoading(false);
        });
    }, []);

    const login = (token: string, userData: User) => {
        console.log("Logging in with token:", token);
        localStorage.setItem("token", token);
        setUser(userData);
        setIsAuthenticated(true);
    }

    const logout = () => {
        console.log("Logging out");
        localStorage.removeItem("token");
        setUser(null);
        setIsAuthenticated(false);
    }

    return (
        <AuthContext.Provider
            value={{ user, isAuthenticated, isLoading, login, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
} 