'use client'

import React, { createContext, useContext, useState } from 'react'
import { User, Trip } from './types'

interface AppContextType {
  currentUser: User | null
  setCurrentUser: (user: User | null) => void
  currentScreen: string
  setCurrentScreen: (screen: string) => void
  trips: Trip[]
  setTrips: (trips: Trip[]) => void
  currentTrip: Trip | null
  setCurrentTrip: (trip: Trip | null) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentScreen, setCurrentScreen] = useState('login')
  const [trips, setTrips] = useState<Trip[]>([])
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null)

  return (
    <AppContext.Provider 
      value={{
        currentUser,
        setCurrentUser,
        currentScreen,
        setCurrentScreen,
        trips,
        setTrips,
        currentTrip,
        setCurrentTrip
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider')
  }
  return context
}
