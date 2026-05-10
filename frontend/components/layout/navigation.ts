import type { LucideIcon } from "lucide-react";
import {
  Calendar,
  Home,
  LogIn,
  Map,
  Plane,
  ReceiptText,
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
      {
        label: "Trip Itinerary",
        href: "/trip-itinerary",
        icon: Calendar,
      },
      { label: "Itinerary View", href: "/itinerary-view", icon: ReceiptText },
      { label: "Budget", href: "/budget", icon: Wallet, disabled: true },
    ],
  },
  {
    title: "Explore",
    items: [
      { label: "Activity Search", href: "/search", icon: Search },
      { label: "Community", href: "/community", icon: Users, disabled: true },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Register", href: "/register", icon: UserPlus },
      { label: "Login", href: "/login", icon: LogIn },
      { label: "Profile", href: "/profile", icon: User, disabled: true },
    ],
  },
];
