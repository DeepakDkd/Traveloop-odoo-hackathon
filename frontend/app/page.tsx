import Link from "next/link";
import {
  Bell,
  Calendar,
  Home,
  LogIn,
  Map,
  MapPin,
  Plane,
  Plus,
  Settings,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  UserPlus,
  Users,
  User,
} from "lucide-react";

const regionalDestinations = [
  {
    id: 1,
    city: "Paris",
    country: "France",
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=600&fit=crop",
  },
  {
    id: 2,
    city: "Tokyo",
    country: "Japan",
    image:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop",
  },
  {
    id: 3,
    city: "New York",
    country: "USA",
    image:
      "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop",
  },
  {
    id: 4,
    city: "Bali",
    country: "Indonesia",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=600&fit=crop",
  },
];

const previousTrips = [
  {
    id: 1,
    name: "European Adventure",
    destination: "Paris, Rome, Barcelona",
    dates: "Mar 15 - Mar 28, 2026",
    image:
      "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=900&h=520&fit=crop",
  },
  {
    id: 2,
    name: "Asian Exploration",
    destination: "Tokyo, Seoul, Bangkok",
    dates: "Jan 10 - Jan 24, 2026",
    image:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=900&h=520&fit=crop",
  },
  {
    id: 3,
    name: "Beach Getaway",
    destination: "Maldives",
    dates: "Dec 1 - Dec 7, 2025",
    image:
      "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=900&h=520&fit=crop",
  },
];

const mobileNavItems = [
  { id: "dashboard", label: "Home", icon: Home },
  { id: "my-trips", label: "My Trips", icon: Map },
  { id: "search", label: "Search", icon: Search },
  { id: "community", label: "Community", icon: Users },
  { id: "profile", label: "Profile", icon: User },
];

const sidebarItems = [
  { label: "Dashboard", href: "/", icon: Home, active: true },
  { label: "Register", href: "/register", icon: UserPlus },
  { label: "Login", href: "/login", icon: LogIn },
  { label: "Search", href: "#", icon: Search, disabled: true },
  { label: "Community", href: "#", icon: Users, disabled: true },
  { label: "Settings", href: "#", icon: Settings, disabled: true },
];

export default function HomePage() {
  return (
    <div className="h-screen overflow-hidden bg-[#f8f9fa] text-[#1a1a2e]">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-black/10 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0d6e6e]">
              <Plane size={20} className="text-white" />
            </div>
            <p className="text-xl font-bold tracking-tight text-[#0d6e6e]">
              Traveloop
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-xl p-2 text-[#6b7280] transition-colors hover:bg-[#e5e7eb]"
            >
              <Bell size={20} />
            </button>
            <Link
              href="/login"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#3d52a0] to-[#0d6e6e] text-sm font-semibold text-white shadow-sm"
            >
              TL
            </Link>
          </div>
        </div>
      </header>

      <aside className="fixed bottom-0 left-0 top-16 z-40 hidden w-72 border-r border-black/10 bg-white lg:block">
        <div className="flex h-full flex-col px-4 py-6">
          <div className="rounded-2xl bg-[#f8f9fa] p-4">
            <p className="text-sm font-semibold text-[#1a1a2e]">
              Quick Navigation
            </p>
            <p className="mt-2 text-sm leading-6 text-[#6b7280]">
              Switch between available pages from one side panel.
            </p>
          </div>

          {/* <nav className="mt-6 space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;

              if (item.disabled) {
                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-[#9ca3af]"
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </div>
                );
              }

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    item.active
                      ? "bg-[#0d6e6e] text-white"
                      : "text-[#1a1a2e] hover:bg-[#e5e7eb]"
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav> */}

          <div className="mt-auto rounded-2xl border border-black/10 bg-[#f8f9fa] p-4">
            <p className="text-sm font-semibold text-[#1a1a2e]">
              Current screen
            </p>
            <p className="mt-2 text-sm text-[#6b7280]">
              Home dashboard is active. Register and Login are ready to open.
            </p>
          </div>
        </div>
      </aside>

      <div className="h-full overflow-y-auto pt-16">
        <main className="min-h-[calc(100vh-4rem)] px-4 py-8 pb-24 sm:px-6 lg:ml-72 lg:px-8 lg:pb-8">
          <div className="mx-auto max-w-7xl space-y-8">
            <section className="relative h-64 overflow-hidden rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.1)] sm:h-80">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1400&h=600&fit=crop"
                alt="Travel destination"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <h1 style={{color:"white"}} className="text-[28px] font-bold tracking-tight  sm:text-[36px]">
                  Discover Your Next Adventure
                </h1>
                <p className="mt-2 text-base text-white/90">
                  Plan, explore, and create unforgettable memories
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <SearchBar />
            </section>

            <section className="space-y-4">
              <SectionHeader
                title="Top Regional Selections"
                actionLabel="View all"
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {regionalDestinations.map((destination) => (
                  <ImageCard
                    key={destination.id}
                    title={destination.city}
                    subtitle={destination.country}
                    image={destination.image}
                    icon={<MapPin size={12} />}
                    aspectClass="aspect-[4/3]"
                  />
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <SectionHeader
                title="Previous Trips"
                actionLabel="View all trips"
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {previousTrips.map((trip) => (
                  <TripCard
                    key={trip.id}
                    title={trip.name}
                    destination={trip.destination}
                    dates={trip.dates}
                    image={trip.image}
                  />
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>

      <Link
        href="/register"
        className="group fixed bottom-20 right-6 z-40 flex items-center  rounded-full bg-[#f59e0b] px-4 py-4 text-[#1a1a2e] shadow-[0_4px_16px_rgba(245,158,11,0.4)] transition-all duration-200 hover:scale-105 hover:shadow-[0_6px_20px_rgba(245,158,11,0.5)] md:bottom-6"
      >
        <Plus size={24} />
        <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium transition-all duration-300 group-hover:max-w-xs">
          Plan a Trip
        </span>
      </Link>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-black/10 bg-white md:hidden">
        <div className="flex h-16 items-center justify-around">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === "dashboard";

            return (
              <button
                key={item.id}
                type="button"
                className={`flex h-full flex-1 flex-col items-center justify-center transition-colors ${
                  isActive
                    ? "text-[#0d6e6e]"
                    : "text-[#6b7280] hover:text-[#1a1a2e]"
                }`}
              >
                <Icon size={20} className={isActive ? "stroke-[2.5px]" : ""} />
                <span className="mt-1 text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function SearchBar() {
  return (
    <div className="flex w-full flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]"
        />
        <input
          type="search"
          placeholder="Search destinations, trips, or activities..."
          className="h-11 w-full rounded-xl border border-black/10 bg-white pl-10 pr-3 text-sm text-[#1a1a2e] outline-none transition-all duration-200 placeholder:text-[#6b7280] focus:border-[#0d6e6e] focus:ring-2 focus:ring-[#0d6e6e]/15"
        />
      </div>

      <div className="flex gap-2 sm:w-auto">
        <ActionButton icon={<SlidersHorizontal size={18} />} label="Filter" />
        <ActionButton icon={<ArrowUpDown size={18} />} label="Sort" />
      </div>
    </div>
  );
}

function ActionButton({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      className="flex h-11 items-center gap-2 rounded-xl border border-black/10 bg-white px-4 text-sm font-medium text-[#1a1a2e] transition-colors hover:bg-[#e5e7eb]"
    >
      <span className="text-[#6b7280]">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function SectionHeader({
  title,
  actionLabel,
}: {
  title: string;
  actionLabel: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="text-[20px] font-semibold text-[#1a1a2e]">{title}</h2>
      <button
        type="button"
        className="text-sm font-medium text-[#0d6e6e] transition-colors hover:underline"
      >
        {actionLabel}
      </button>
    </div>
  );
}

function ImageCard({
  title,
  subtitle,
  image,
  icon,
  aspectClass,
}: {
  title: string;
  subtitle: string;
  image: string;
  icon: React.ReactNode;
  aspectClass: string;
}) {
  return (
    <article className="cursor-pointer overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
      <div className={`relative ${aspectClass}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="text-base font-semibold text-white">{title}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-white/85">
            {icon}
            {subtitle}
          </p>
        </div>
      </div>
    </article>
  );
}

function TripCard({
  title,
  destination,
  dates,
  image,
}: {
  title: string;
  destination: string;
  dates: string;
  image: string;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
      <div className="aspect-[16/9]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={title} className="h-full w-full object-cover" />
      </div>
      <div className="space-y-2 p-4">
        <p className="text-base font-semibold text-[#1a1a2e]">{title}</p>
        <p className="flex items-center gap-1 text-sm text-[#6b7280]">
          <MapPin size={14} />
          {destination}
        </p>
        <p className="flex items-center gap-1 text-xs text-[#6b7280]">
          <Calendar size={12} />
          {dates}
        </p>
      </div>
    </article>
  );
}
