"use client";

import { useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowUpDown,
  Calendar,
  Eye,
  MapPin,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  Wallet,
} from "lucide-react";

import { DashboardPage } from "@/components/layout/dashboard-page";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  deleteStoredTrip,
  formatTripBudget,
  formatTripDateRange,
  getTripDestinations,
  getTripStatus,
  readStoredTrips,
  subscribeToTripStorage,
} from "@/features/trips/lib/storage";
import type { SavedTrip, SavedTripStatus } from "@/features/trips/lib/types";

const sectionOrder: SavedTripStatus[] = ["ongoing", "upcoming", "completed"];

const sectionLabels: Record<SavedTripStatus, string> = {
  ongoing: "Ongoing",
  upcoming: "Upcoming",
  completed: "Completed",
};

export function MyTrips() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<SavedTripStatus | "all">("all");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const trips = useSyncExternalStore(
    subscribeToTripStorage,
    readStoredTrips,
    () => [] as SavedTrip[],
  );

  const filteredTrips = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const nextTrips = trips.filter((trip) => {
      const tripStatus = getTripStatus(trip);
      const matchesFilter =
        activeFilter === "all" ? true : tripStatus === activeFilter;
      const matchesQuery =
        normalizedQuery.length === 0
          ? true
          : `${trip.tripName} ${getTripDestinations(trip)} ${trip.startDate} ${trip.endDate}`
              .toLowerCase()
              .includes(normalizedQuery);

      return matchesFilter && matchesQuery;
    });

    return nextTrips.sort((left, right) => {
      const comparison = left.tripName.localeCompare(right.tripName);
      return sortDirection === "asc" ? comparison : comparison * -1;
    });
  }, [activeFilter, searchQuery, sortDirection, trips]);

  const groupedTrips = useMemo(
    () =>
      sectionOrder.map((status) => ({
        status,
        title: sectionLabels[status],
        trips: filteredTrips.filter((trip) => getTripStatus(trip) === status),
      })),
    [filteredTrips],
  );

  function handleDeleteTrip(id: string) {
    deleteStoredTrip(id);
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
                Trips saved in your browser
              </p>
              <h1 className="mt-1 text-[28px] font-bold text-[#1a1a2e]">
                My Trips
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0d6e6e]">
                  Total Trips
                </p>
                <p className="mt-1 text-lg font-semibold text-[#1a1a2e]">
                  {trips.length} saved
                </p>
              </div>

              <Link
                href="/create-trip"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#f59e0b] px-4 text-[14px] font-medium text-[#1a1a2e] transition-all duration-200 hover:bg-[#e58e0a]"
              >
                <Plus size={16} />
                New Trip
              </Link>
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

        {trips.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-black/10 bg-white px-6 py-12 text-center">
            <h2 className="text-2xl font-semibold text-[#1a1a2e]">
              No trips saved yet
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#6b7280]">
              Create a trip, add hotels and places, then it will show up here with
              all of its saved stops and notes.
            </p>
            <Link
              href="/create-trip"
              className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#f59e0b] px-4 text-[14px] font-medium text-[#1a1a2e] transition-all duration-200 hover:bg-[#e58e0a]"
            >
              <Plus size={16} />
              Create Trip
            </Link>
          </div>
        ) : (
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
        )}
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
  activeFilter: SavedTripStatus | "all";
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
          placeholder="Search your saved trips..."
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
  trip: SavedTrip;
  onDelete: () => void;
}) {
  const tripStatus = getTripStatus(trip);
  const destinations = getTripDestinations(trip);

  return (
    <Card hover className="overflow-hidden p-0">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex items-end bg-[linear-gradient(135deg,#0d6e6e_0%,#14b8a6_55%,#f59e0b_100%)] p-5 text-white sm:w-56 sm:shrink-0">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
              {trip.stops.length} stop{trip.stops.length === 1 ? "" : "s"}
            </p>
            <h3 className="mt-3 text-xl font-semibold">{trip.tripName}</h3>
            <p className="mt-2 text-sm text-white/85">{destinations}</p>
          </div>
        </div>

        <div className="flex-1 p-4 sm:py-4 sm:pl-0 sm:pr-4">
          <div className="mb-3 flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="flex items-center gap-2 text-[14px] text-[#6b7280]">
                <MapPin size={14} />
                {destinations}
              </p>
              <p className="flex items-center gap-2 text-[13px] text-[#6b7280]">
                <Calendar size={13} />
                {formatTripDateRange(trip.startDate, trip.endDate)}
              </p>
              <p className="flex items-center gap-2 text-[13px] text-[#6b7280]">
                <Wallet size={13} />
                {formatTripBudget(trip.budget)}
              </p>
            </div>
            <Badge variant={tripStatus}>
              {tripStatus.charAt(0).toUpperCase() + tripStatus.slice(1)}
            </Badge>
          </div>

          <div className="mb-4 flex flex-wrap gap-2 text-xs text-[#6b7280]">
            <span className="rounded-full bg-[#f3f4f6] px-3 py-1">
              {trip.notes.length} note{trip.notes.length === 1 ? "" : "s"}
            </span>
            <span className="rounded-full bg-[#f3f4f6] px-3 py-1">
              Saved {new Intl.DateTimeFormat("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }).format(new Date(trip.updatedAt))}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href={`/trip-itinerary/${trip.id}`}
              className="inline-flex h-8 min-w-[92px] items-center justify-center gap-2 rounded-xl bg-[#f59e0b] px-3 text-[12px] font-medium text-[#1a1a2e] transition-all duration-200 hover:bg-[#e58e0a]"
            >
              <Eye size={14} />
              View
            </Link>
            <Button
              size="sm"
              variant="ghost"
              onClick={onDelete}
              className="text-[#ef4444] hover:bg-[#ef4444]/10 hover:text-[#dc2626]"
            >
              <Trash2 size={14} />
              Delete
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
