export type User = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  name?: string;
  email: string;
  phone?: string | null;
  photo?: string | null;
  avatar?: string;
  language?: string | null;
  role?: "USER" | "ADMIN";
  city?: string | null;
  country?: string | null;
  addInfo?: string | null;
};

export type City = {
  id: string;
  name: string;
  country: string;
  region?: string | null;
  costIndex?: number | null;
  popularity?: number | null;
  imageUrl?: string | null;
  image?: string;
  description?: string;
};

export type Activity = {
  id: string;
  cityId?: string;
  name: string;
  city?: City | string;
  cost?: number | null;
  duration?: number | string | null;
  category: string;
  description?: string | null;
  imageUrl?: string | null;
};

export type StopActivity = {
  id: string;
  stopId: string;
  activityId: string;
  scheduledAt?: string | null;
  notes?: string | null;
  activity: Activity;
};

export type Stop = {
  id: string;
  tripId: string;
  cityId: string;
  order: number;
  startDate: string;
  endDate: string;
  city: City;
  activities?: StopActivity[];
  notes?: Note[];
  expenses?: Expense[];
};

export type Trip = {
  id: string;
  userId?: string;
  name: string;
  startDate: string;
  endDate: string;
  status?: "UPCOMING" | "ONGOING" | "COMPLETED";
  description?: string | null;
  cities?: string[];
  budget?: Budget | null;
  totalSpent?: number;
  coverImage?: string | null;
  stops?: Stop[];
  expenses?: Expense[];
  packingList?: PackingItem[];
  notes?: Note[];
  shareToken?: string | null;
  isPublic?: boolean;
  isPreplanned?: boolean;
};

export type Budget = {
  id: string;
  tripId: string;
  totalBudget: number;
  transportBudget?: number;
  stayBudget?: number;
  activityBudget?: number;
  mealBudget?: number;
  otherBudget?: number;
};

export type BudgetSummary = {
  budget: Budget | null;
  currency: string;
  spentAmount: number;
  remainingAmount: number;
  categoryTotals: Record<string, number>;
  paidTotal: number;
  unpaidTotal: number;
};

export type Expense = {
  id: string;
  tripId: string;
  stopId?: string | null;
  invoiceNumber?: string | null;
  category: string;
  description: string;
  quantity?: number;
  unitCost: number;
  totalCost: number;
  taxPercent?: number;
  discount?: number;
  grandTotal: number;
  isPaid: boolean;
  createdAt: string;
  stop?: Stop | null;
};

export type PackingItem = {
  id: string;
  tripId: string;
  name: string;
  category: string;
  isPacked: boolean;
  createdAt: string;
};

export type Note = {
  id: string;
  title?: string | null;
  content: string;
  createdAt: string;
  tripId: string;
  stopId?: string | null;
  scope?: "TRIP" | "STOP";
  stop?: Stop | null;
};

export type CommunityPost = {
  id: string;
  tripId: string;
  caption?: string | null;
  likes: number;
  views: number;
  createdAt: string;
  trip: Trip & {
    user?: User;
  };
};

export interface BudgetEntry {
  id: string;
  category: string;
  amount: number;
  spent: number;
}
