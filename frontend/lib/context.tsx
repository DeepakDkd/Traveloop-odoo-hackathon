"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { apiRequest } from "./api";
import { Trip, User } from "./types";

type MeResponse = {
  success: boolean;
  data: {
    user: User;
    stats: unknown;
  };
};

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isAuthLoading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  currentScreen: string;
  setCurrentScreen: (screen: string) => void;
  trips: Trip[];
  setTrips: (trips: Trip[]) => void;
  currentTrip: Trip | null;
  setCurrentTrip: (trip: Trip | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState("login");
  const [trips, setTrips] = useState<Trip[]>([]);
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);

  async function refreshUser() {
    try {
      const payload = await apiRequest<MeResponse>("/api/users/me");
      setCurrentUser(payload.data.user);
    } catch {
      setCurrentUser(null);
    } finally {
      setIsAuthLoading(false);
    }
  }

  async function logout() {
    await apiRequest("/api/auth/logout", {
      method: "POST",
    });
    setCurrentUser(null);
    setTrips([]);
    setCurrentTrip(null);
  }

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isAuthLoading,
        refreshUser,
        logout,
        currentScreen,
        setCurrentScreen,
        trips,
        setTrips,
        currentTrip,
        setCurrentTrip,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
};
