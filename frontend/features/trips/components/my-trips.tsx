"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowUpDown,
  Calendar,
  Edit,
  Eye,
  MapPin,
  Search,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";

import { DashboardPage } from "@/components/layout/dashboard-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type TripStatus = "ongoing" | "upcoming" | "completed";

type Trip = {
  id: number;
  name: string;
  destination: string;
  dates: string;
  progress: number;
  image: string;
  status: TripStatus;
};

const initialTrips: Trip[] = [
  {
    id: 1,
    name: "Southeast Asia Backpacking",
    destination: "Thailand, Vietnam, Cambodia",
    dates: "May 1 - May 21, 2026",
    progress: 45,
    image:
      "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=900&h=520&fit=crop",
    status: "ongoing",
  },
  {
    id: 2,
    name: "European Summer",
    destination: "Paris, Rome, Barcelona",
    dates: "Jun 15 - Jun 30, 2026",
    progress: 0,
    image:
      "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=900&h=520&fit=crop",
    status: "upcoming",
  },
  {
    id: 3,
    name: "Japan Cherry Blossom",
    destination: "Tokyo, Kyoto, Osaka",
    dates: "Apr 1 - Apr 12, 2026",
    progress: 100,
    image:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=900&h=520&fit=crop",
    status: "completed",
  },
  {
    id: 4,
    name: "New York City Weekend",
    destination: "New York, USA",
    dates: "Mar 20 - Mar 23, 2026",
    progress: 100,
    image:
      "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=900&h=520&fit=crop",
    status: "completed",
  },
];

const sectionOrder: TripStatus[] = ["ongoing", "upcoming", "completed"];

const sectionLabels: Record<TripStatus, string> = {
  ongoing: "Ongoing",
  upcoming: "Upcoming",
  completed: "Completed",
};

export function MyTrips() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<TripStatus | "all">("all");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [trips, setTrips] = useState(initialTrips);

  const filteredTrips = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const nextTrips = trips.filter((trip) => {
      const matchesFilter =
        activeFilter === "all" ? true : trip.status === activeFilter;

      const matchesQuery =
        normalizedQuery.length === 0
          ? true
          : `${trip.name} ${trip.destination} ${trip.dates}`
              .toLowerCase()
              .includes(normalizedQuery);

      return matchesFilter && matchesQuery;
    });

    return nextTrips.sort((a, b) => {
      const comparison = a.name.localeCompare(b.name);
      return sortDirection === "asc" ? comparison : comparison * -1;
    });
  }, [activeFilter, searchQuery, sortDirection, trips]);

  const groupedTrips = useMemo(() => {
    return sectionOrder.map((status) => ({
      status,
      title: sectionLabels[status],
      trips: filteredTrips.filter((trip) => trip.status === status),
    }));
  }, [filteredTrips]);

  function handleDeleteTrip(id: number) {
    setTrips((current) => current.filter((trip) => trip.id !== id));
  }

  function toggleFilter() {
    const nextValue =
      activeFilter === "all"
        ? "ongoing"
        : activeFilter === "ongoing"
          ? "upcoming"
          : activeFilter === "upcoming"
            ? "completed"
            : "all";

    setActiveFilter(nextValue);
  }

  function toggleSort() {
    setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
  }

  return (
    <DashboardPage>
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#6b7280]">
                Organize, review, and continue planning
              </p>
              <h1 className="mt-1 text-[28px] font-bold text-[#1a1a2e]">
                My Trips
              </h1>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0d6e6e]">
                Total Trips
              </p>
              <p className="mt-1 text-lg font-semibold text-[#1a1a2e]">
                {trips.length} trips saved
              </p>
            </div>
          </div>

          <TripsToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeFilter={activeFilter}
            sortDirection={sortDirection}
            onToggleFilter={toggleFilter}
            onToggleSort={toggleSort}
          />
        </div>

        <div className="space-y-8">
          {groupedTrips.map((section) => (
            <section key={section.status} className="space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="text-[20px] font-semibold text-[#1a1a2e]">
                  {section.title}
                </h2>
                <span className="text-[14px] font-normal text-[#6b7280]">
                  ({section.trips.length})
                </span>
              </div>

              {section.trips.length > 0 ? (
                <div className="space-y-4">
                  {section.trips.map((trip) => (
                    <TripCard
                      key={trip.id}
                      trip={trip}
                      onDelete={() => handleDeleteTrip(trip.id)}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState title={section.title} />
              )}
            </section>
          ))}
        </div>
      </div>
    </DashboardPage>
  );
}

function TripsToolbar({
  searchQuery,
  onSearchChange,
  activeFilter,
  sortDirection,
  onToggleFilter,
  onToggleSort,
}: {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  activeFilter: TripStatus | "all";
  sortDirection: "asc" | "desc";
  onToggleFilter: () => void;
  onToggleSort: () => void;
}) {
  const filterLabel =
    activeFilter === "all"
      ? "All Trips"
      : `${sectionLabels[activeFilter]} Only`;

  return (
    <div className="flex w-full flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]"
        />
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search your trips..."
          className="h-11 w-full rounded-xl border border-black/10 bg-white pl-10 pr-3 text-sm text-[#1a1a2e] outline-none transition-all duration-200 placeholder:text-[#6b7280] focus:border-[#0d6e6e] focus:ring-2 focus:ring-[#0d6e6e]/15"
        />
      </div>

      <div className="flex gap-2 sm:w-auto">
        <ToolbarButton
          icon={<SlidersHorizontal size={18} />}
          label={filterLabel}
          onClick={onToggleFilter}
        />
        <ToolbarButton
          icon={<ArrowUpDown size={18} />}
          label={sortDirection === "asc" ? "A to Z" : "Z to A"}
          onClick={onToggleSort}
        />
      </div>
    </div>
  );
}

function ToolbarButton({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-11 items-center gap-2 rounded-xl border border-black/10 bg-white px-4 text-sm font-medium text-[#1a1a2e] transition-colors hover:bg-[#e5e7eb]"
    >
      <span className="text-[#6b7280]">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function TripCard({
  trip,
  onDelete,
}: {
  trip: Trip;
  onDelete: () => void;
}) {
  return (
    <Card hover className="overflow-hidden p-0">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative aspect-[2/1] overflow-hidden sm:w-48 sm:shrink-0 sm:aspect-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={trip.image}
            alt={trip.name}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex-1 p-4 sm:py-4 sm:pl-0 sm:pr-4">
          <div className="mb-2 flex items-start justify-between gap-4">
            <div>
              <h3 className="mb-1 text-[16px] font-semibold text-[#1a1a2e]">
                {trip.name}
              </h3>
              <div className="flex flex-col gap-1">
                <p className="flex items-center gap-1 text-[14px] text-[#6b7280]">
                  <MapPin size={14} />
                  {trip.destination}
                </p>
                <p className="flex items-center gap-1 text-[12px] text-[#6b7280]">
                  <Calendar size={12} />
                  {trip.dates}
                </p>
              </div>
            </div>
            <Badge variant={trip.status}>
              {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
            </Badge>
          </div>

          {trip.progress > 0 && trip.progress < 100 ? (
            <div className="mb-3">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[12px] text-[#6b7280]">Trip Progress</span>
                <span className="text-[12px] font-medium text-[#1a1a2e]">
                  {trip.progress}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#e5e7eb]">
                <div
                  className="h-full bg-[#f59e0b] transition-all duration-300"
                  style={{ width: `${trip.progress}%` }}
                />
              </div>
            </div>
          ) : null}

          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/itinerary-view">
              <Button size="sm" variant="primary" className="min-w-[92px]">
                <Eye size={14} />
                View
              </Button>
            </Link>
            <Link href="/create-trip">
              <Button size="sm" variant="secondary" className="min-w-[92px]">
                <Edit size={14} />
                Edit
              </Button>
            </Link>
            <Button
              size="sm"
              variant="ghost"
              onClick={onDelete}
              className="text-[#ef4444] hover:bg-[#ef4444]/10 hover:text-[#dc2626]"
            >
              <Trash2 size={14} />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

function EmptyState({ title }: { title: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-black/10 bg-white px-5 py-8 text-center",
      )}
    >
      <p className="text-base font-semibold text-[#1a1a2e]">
        No {title.toLowerCase()} trips
      </p>
      <p className="mt-2 text-sm text-[#6b7280]">
        Adjust the search or filter, or create a new trip to fill this section.
      </p>
    </div>
  );
}
