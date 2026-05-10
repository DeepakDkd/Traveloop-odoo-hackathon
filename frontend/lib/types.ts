export interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

export interface Trip {
  id: string
  name: string
  startDate: string
  endDate: string
  description?: string
  cities: string[]
  budget?: number
  totalSpent?: number
  coverImage?: string
}

export interface Activity {
  id: string
  name: string
  city: string
  cost?: number
  duration?: string
  category: string
  description?: string
}

export interface City {
  id: string
  name: string
  country: string
  costIndex: number
  image?: string
  description?: string
}

export interface BudgetEntry {
  id: string
  category: string
  amount: number
  spent: number
}

export interface Note {
  id: string
  title: string
  content: string
  createdAt: string
  tripId: string
}
