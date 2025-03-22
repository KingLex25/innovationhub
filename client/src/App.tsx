import React from "react";
import { Route, Switch } from "wouter";
import HomePage from "@/pages/HomePage";
import AdminLoginPage from "@/pages/AdminLoginPage";
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import NotFound from "@/pages/not-found";
import { useEffect, useState } from "react";
import { getQueryFn } from "./lib/queryClient";

export interface AuthContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  user: { username: string } | null;
  setUser: (user: { username: string } | null) => void;
  isLoading: boolean;
}

export const AuthContext = React.createContext<AuthContextType>({
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  user: null,
  setUser: () => {},
  isLoading: true,
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated on load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        console.log("Checking authentication status...");
        // Use direct fetch instead of query to avoid tanstack query issues
        const response = await fetch('/api/auth/me', {
          credentials: 'include' // Important for cookies
        });
        
        if (response.ok) {
          const userData = await response.json();
          console.log("User is authenticated:", userData);
          setIsAuthenticated(true);
          setUser({ username: userData.username });
        } else {
          console.log("User is not authenticated");
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, user, setUser, isLoading }}>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/admin/login" component={AdminLoginPage} />
        <Route path="/admin/dashboard" component={AdminDashboardPage} />
        <Route path="/admin/dashboard/:section" component={AdminDashboardPage} />
        <Route component={NotFound} />
      </Switch>
    </AuthContext.Provider>
  );
}

export default App;
