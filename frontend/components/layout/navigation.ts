import type { LucideIcon } from "lucide-react";
import {
  Calendar,
  CheckSquare,
  FileText,
  Home,
  LogIn,
  Map,
  Plane,
  Search,
  User,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";

export type AppNavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
};

export type AppNavigationSection = {
  title: string;
  items: AppNavigationItem[];
};

export const headerLinks: AppNavigationItem[] = [
  { label: "Home", href: "/", icon: Home },
  { label: "Create Trip", href: "/create-trip", icon: Plane },
  { label: "Register", href: "/register", icon: UserPlus },
  { label: "Login", href: "/login", icon: LogIn },
];

export const sidebarSections: AppNavigationSection[] = [
  {
    title: "Planning",
    items: [
      { label: "Dashboard", href: "/", icon: Home },
      { label: "Create Trip", href: "/create-trip", icon: Plane },
      { label: "My Trips", href: "/my-trips", icon: Map },
      { label: "Trip Itinerary", href: "/trip-itinerary", icon: Calendar },
      { label: "Budget", href: "/trip-budget", icon: Wallet },
      { label: "Checklist", href: "/packing-checklist", icon: CheckSquare },
      { label: "Expenses", href: "/expenses", icon: FileText },
    ],
  },
  {
    title: "Explore",
    items: [
      { label: "Search", href: "/search", icon: Search },
      { label: "Community", href: "/community", icon: Users },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Register", href: "/register", icon: UserPlus },
      { label: "Login", href: "/login", icon: LogIn },
      { label: "Profile", href: "/profile", icon: User },
      { label: "Notes", href: "/trip-notes", icon: FileText },
    ],
  },
];
