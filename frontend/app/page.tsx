"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
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
import { apiImageUrl, apiRequest, setSelectedTripId } from "@/lib/api";
import { City, Trip } from "@/lib/types";

type ApiList<T> = {
  success: boolean;
  data: T;
};

export default function HomePage() {
  const [cities, setCities] = useState<City[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("createdAt");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");
        const [cityPayload, tripPayload] = await Promise.all([
          apiRequest<ApiList<City[]>>("/api/cities/popular"),
          apiRequest<ApiList<Trip[]>>(
            `/api/trips/user/all?sort=${sort}&order=desc${status ? `&status=${status}` : ""}${query ? `&q=${encodeURIComponent(query)}` : ""}`,
          ).catch(() => ({ success: false, data: [] as Trip[] })),
        ]);

        if (isMounted) {
          setCities(cityPayload.data || []);
          setTrips(Array.isArray(tripPayload.data) ? tripPayload.data : []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Unable to load dashboard");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [query, sort, status]);

  const previousTrips = useMemo(() => trips.slice(0, 6), [trips]);

  return (
    <DashboardShell>
      <DashboardPage>
        <div className="space-y-8">
          <section className="relative h-64 overflow-hidden rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.1)] sm:h-80">
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

          <SearchBar
            query={query}
            status={status}
            sort={sort}
            onQueryChange={setQuery}
            onStatusChange={setStatus}
            onSortChange={setSort}
          />

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <section className="space-y-4">
            <SectionHeader title="Top Regional Selections" actionHref="/search" />

            {loading ? (
              <GridSkeleton count={4} />
            ) : cities.length ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {cities.slice(0, 8).map((destination) => (
                  <ImageCard
                    key={destination.id}
                    title={destination.name}
                    subtitle={destination.country}
                    image={
                      apiImageUrl(destination.imageUrl) ||
                      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=600&fit=crop"
                    }
                    icon={<MapPin size={12} />}
                    aspectClass="aspect-[4/3]"
                    href={`/search?cityId=${destination.id}&q=${encodeURIComponent(destination.name)}`}
                  />
                ))}
              </div>
            ) : (
              <EmptyState text="No popular cities are available yet." />
            )}
          </section>

          <section className="space-y-4">
            <SectionHeader title="Previous Trips" actionHref="/my-trips" />

            {loading ? (
              <GridSkeleton count={3} />
            ) : previousTrips.length ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {previousTrips.map((trip) => (
                  <TripCard key={trip.id} trip={trip} />
                ))}
              </div>
            ) : (
              <EmptyState text="No trips yet. Start with the Plan a Trip button." />
            )}
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

function SearchBar({
  query,
  status,
  sort,
  onQueryChange,
  onStatusChange,
  onSortChange,
}: {
  query: string;
  status: string;
  sort: string;
  onQueryChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSortChange: (value: string) => void;
}) {
  return (
    <section className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search destinations, trips, or activities..."
          className="h-11 w-full rounded-xl border border-black/10 bg-white pl-10 pr-3 text-sm text-[#1a1a2e] outline-none transition-all duration-200 placeholder:text-[#6b7280] focus:border-[#0d6e6e] focus:ring-2 focus:ring-[#0d6e6e]/15"
        />
      </div>

      <label className="flex h-11 items-center gap-2 rounded-xl border border-black/10 bg-white px-3 text-sm text-[#1a1a2e]">
        <SlidersHorizontal size={18} className="text-[#6b7280]" />
        <select
          value={status}
          onChange={(event) => onStatusChange(event.target.value)}
          className="bg-transparent outline-none"
        >
          <option value="">All trips</option>
          <option value="UPCOMING">Upcoming</option>
          <option value="ONGOING">Ongoing</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </label>

      <label className="flex h-11 items-center gap-2 rounded-xl border border-black/10 bg-white px-3 text-sm text-[#1a1a2e]">
        <ArrowUpDown size={18} className="text-[#6b7280]" />
        <select
          value={sort}
          onChange={(event) => onSortChange(event.target.value)}
          className="bg-transparent outline-none"
        >
          <option value="createdAt">Recently created</option>
          <option value="startDate">Start date</option>
          <option value="name">Name</option>
        </select>
      </label>
    </section>
  );
}

function SectionHeader({ title, actionHref }: { title: string; actionHref: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="text-[20px] font-semibold text-[#1a1a2e]">{title}</h2>
      <Link
        href={actionHref}
        className="text-sm font-medium text-[#0d6e6e] transition-colors hover:underline"
      >
        View all
      </Link>
    </div>
  );
}

function ImageCard({
  title,
  subtitle,
  image,
  icon,
  aspectClass,
  href,
}: {
  title: string;
  subtitle: string;
  image: string;
  icon: ReactNode;
  aspectClass: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="block overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]"
    >
      <div className={`relative ${aspectClass}`}>
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
    </Link>
  );
}

function TripCard({ trip }: { trip: Trip }) {
  const cities = trip.stops?.map((stop) => stop.city?.name).filter(Boolean).join(", ");
  const image = apiImageUrl(trip.coverImage) || "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=900&h=520&fit=crop";

  return (
    <Link
      href={`/trip-itinerary?tripId=${trip.id}`}
      onClick={() => setSelectedTripId(trip.id)}
      className="block overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]"
    >
      <div className="aspect-[16/9]">
        <img src={image} alt={trip.name} className="h-full w-full object-cover" />
      </div>
      <div className="space-y-2 p-4">
        <p className="text-base font-semibold text-[#1a1a2e]">{trip.name}</p>
        <p className="flex items-center gap-1 text-sm text-[#6b7280]">
          <MapPin size={14} />
          {cities || trip.description || "No stops added yet"}
        </p>
        <p className="flex items-center gap-1 text-xs text-[#6b7280]">
          <Calendar size={12} />
          {formatDateRange(trip.startDate, trip.endDate)}
        </p>
      </div>
    </Link>
  );
}

function GridSkeleton({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="h-48 animate-pulse rounded-2xl bg-black/10" />
      ))}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-black/15 bg-white px-4 py-8 text-center text-sm text-[#6b7280]">
      {text}
    </div>
  );
}

function formatDateRange(start: string, end: string) {
  const formatter = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${formatter.format(new Date(start))} - ${formatter.format(new Date(end))}`;
}
