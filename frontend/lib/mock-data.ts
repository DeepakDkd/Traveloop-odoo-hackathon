import { User, Trip, Activity, City, BudgetEntry } from './types'

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    avatar: '👩‍🦰'
  },
  {
    id: '2',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: '👨‍💼'
  }
]

export const mockTrips: Trip[] = [
  {
    id: '1',
    name: 'Summer Europe Adventure',
    startDate: '2024-06-01',
    endDate: '2024-06-30',
    description: 'Exploring 5 countries in 30 days',
    cities: ['Paris', 'Barcelona', 'Rome', 'Amsterdam', 'Berlin'],
    budget: 5000,
    totalSpent: 4200,
    coverImage: '🗼'
  },
  {
    id: '2',
    name: 'Japan Spring Break',
    startDate: '2024-04-01',
    endDate: '2024-04-15',
    description: 'Cherry blossom festival and cultural exploration',
    cities: ['Tokyo', 'Kyoto', 'Osaka'],
    budget: 3500,
    totalSpent: 3200,
    coverImage: '⛩️'
  },
  {
    id: '3',
    name: 'Caribbean Beach Trip',
    startDate: '2024-12-20',
    endDate: '2024-12-27',
    description: 'Relaxation and water activities',
    cities: ['Cancun', 'Aruba'],
    budget: 2500,
    totalSpent: 1800,
    coverImage: '🏖️'
  }
]

export const mockCities: City[] = [
  {
    id: '1',
    name: 'Paris',
    country: 'France',
    costIndex: 85,
    description: 'The City of Light with iconic landmarks'
  },
  {
    id: '2',
    name: 'Tokyo',
    country: 'Japan',
    costIndex: 72,
    description: 'Modern metropolis with traditional culture'
  },
  {
    id: '3',
    name: 'Barcelona',
    country: 'Spain',
    costIndex: 65,
    description: 'Vibrant city with unique architecture'
  },
  {
    id: '4',
    name: 'New York',
    country: 'USA',
    costIndex: 90,
    description: 'The city that never sleeps'
  },
  {
    id: '5',
    name: 'Bangkok',
    country: 'Thailand',
    costIndex: 40,
    description: 'Ancient temples and street food paradise'
  },
  {
    id: '6',
    name: 'Rome',
    country: 'Italy',
    costIndex: 70,
    description: 'Historic city with ancient ruins'
  }
]

export const mockActivities: Activity[] = [
  {
    id: '1',
    name: 'Eiffel Tower Visit',
    city: 'Paris',
    cost: 25,
    duration: '2 hours',
    category: 'Landmark',
    description: 'Climb to the top for panoramic views'
  },
  {
    id: '2',
    name: 'Louvre Museum',
    city: 'Paris',
    cost: 18,
    duration: '3 hours',
    category: 'Museum',
    description: 'World\'s largest art museum'
  },
  {
    id: '3',
    name: 'Shibuya Crossing',
    city: 'Tokyo',
    cost: 0,
    duration: '1 hour',
    category: 'Experience',
    description: 'Witness the busiest pedestrian crossing'
  },
  {
    id: '4',
    name: 'Cherry Blossom Festival',
    city: 'Tokyo',
    cost: 15,
    duration: '4 hours',
    category: 'Festival',
    description: 'Seasonal celebration of spring'
  },
  {
    id: '5',
    name: 'Sagrada Familia',
    city: 'Barcelona',
    cost: 32,
    duration: '2.5 hours',
    category: 'Architecture',
    description: 'Iconic basilica by Gaudí'
  }
]

export const mockBudgetEntries: BudgetEntry[] = [
  { id: '1', category: 'Accommodation', amount: 2000, spent: 1800 },
  { id: '2', category: 'Transportation', amount: 1000, spent: 950 },
  { id: '3', category: 'Food & Dining', amount: 1200, spent: 1100 },
  { id: '4', category: 'Activities', amount: 500, spent: 350 },
  { id: '5', category: 'Shopping', amount: 300, spent: 200 }
]
