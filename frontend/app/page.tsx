import Link from "next/link";
import type { ReactNode } from "react";
import {
  Calendar,
  MapPin,
  Plus,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
} from "lucide-react";
import { DashboardPage } from "@/components/layout/dashboard-page";
import { DashboardShell } from "@/components/layout/dashboard-shell";

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

export default function HomePage() {
  return (
    <DashboardShell>
      <DashboardPage>
        <div className="space-y-8">
          <section className="relative h-64 overflow-hidden rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.1)] sm:h-80">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1400&h=600&fit=crop"
              alt="Travel destination"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <h1 className="text-[28px] font-bold tracking-tight text-white sm:text-[36px]">
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

        <Link
          href="/create-trip"
          className="group fixed bottom-20 right-6 z-40 flex items-center rounded-full bg-[#f59e0b] px-4 py-4 text-[#1a1a2e] shadow-[0_4px_16px_rgba(245,158,11,0.4)] transition-all duration-200 hover:scale-105 hover:shadow-[0_6px_20px_rgba(245,158,11,0.5)] md:bottom-6"
        >
          <Plus size={24} />
          <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium transition-all duration-300 group-hover:max-w-xs">
            Plan a Trip
          </span>
        </Link>
      </DashboardPage>
    </DashboardShell>
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
  icon: ReactNode;
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
  icon: ReactNode;
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
