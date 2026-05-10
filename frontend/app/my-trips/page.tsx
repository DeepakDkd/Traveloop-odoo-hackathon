"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpDown, Calendar, MapPin, Search, SlidersHorizontal } from "lucide-react";
import { DashboardPage } from "@/components/layout/dashboard-page";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { apiImageUrl, apiRequest, setSelectedTripId } from "@/lib/api";
import { Trip } from "@/lib/types";

type ApiData<T> = {
  success: boolean;
  data: T;
};

const statuses = ["ONGOING", "UPCOMING", "COMPLETED"] as const;

export default function MyTripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("startDate");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadTrips() {
      try {
        setLoading(true);
        setError("");
        const params = new URLSearchParams({
          sort,
          order: sort === "name" ? "asc" : "desc",
        });
        if (query) params.set("q", query);
        if (status) params.set("status", status);

        const payload = await apiRequest<ApiData<Trip[]>>(
          `/api/trips/user/all?${params.toString()}`,
        );
        if (mounted) setTrips(payload.data || []);
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Unable to load trips");
          setTrips([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadTrips();

    return () => {
      mounted = false;
    };
  }, [query, sort, status]);

  const groupedTrips = useMemo(() => {
    return statuses.reduce<Record<string, Trip[]>>((groups, item) => {
      groups[item] = trips.filter((trip) => trip.status === item);
      return groups;
    }, {});
  }, [trips]);

  return (
    <DashboardShell>
      <DashboardPage>
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-[#6b7280]">Your travel plans</p>
              <h1 className="mt-1 text-[28px] font-bold text-[#1a1a2e]">My Trips</h1>
            </div>
            <Link href="/create-trip">
              <Button>Plan a Trip</Button>
            </Link>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search trips..."
                className="h-11 w-full rounded-xl border border-black/10 bg-white pl-10 pr-3 text-sm outline-none focus:border-[#0d6e6e] focus:ring-2 focus:ring-[#0d6e6e]/15"
              />
            </div>
            <label className="flex h-11 items-center gap-2 rounded-xl border border-black/10 bg-white px-3 text-sm">
              <SlidersHorizontal size={18} className="text-[#6b7280]" />
              <select value={status} onChange={(event) => setStatus(event.target.value)} className="bg-transparent outline-none">
                <option value="">All</option>
                <option value="ONGOING">Ongoing</option>
                <option value="UPCOMING">Upcoming</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </label>
            <label className="flex h-11 items-center gap-2 rounded-xl border border-black/10 bg-white px-3 text-sm">
              <ArrowUpDown size={18} className="text-[#6b7280]" />
              <select value={sort} onChange={(event) => setSort(event.target.value)} className="bg-transparent outline-none">
                <option value="startDate">Trip date</option>
                <option value="createdAt">Created</option>
                <option value="name">Name</option>
              </select>
            </label>
          </div>

          {error ? <Notice tone="error" text={error} /> : null}

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-32 animate-pulse rounded-2xl bg-black/10" />
              ))}
            </div>
          ) : trips.length ? (
            <div className="space-y-8">
              {statuses.map((group) => (
                <section key={group} className="space-y-3">
                  <h2 className="text-xl font-semibold capitalize text-[#1a1a2e]">
                    {group.toLowerCase().replace("_", " ")}
                  </h2>
                  {groupedTrips[group].length ? (
                    <div className="space-y-3">
                      {groupedTrips[group].map((trip) => (
                        <TripRow key={trip.id} trip={trip} />
                      ))}
                    </div>
                  ) : (
                    <Notice text={`No ${group.toLowerCase()} trips.`} />
                  )}
                </section>
              ))}
            </div>
          ) : (
            <Notice text="No trips match your filters." />
          )}
        </div>
      </DashboardPage>
    </DashboardShell>
  );
}

function TripRow({ trip }: { trip: Trip }) {
  const cities = trip.stops?.map((stop) => stop.city?.name).filter(Boolean).join(", ");
  const image = apiImageUrl(trip.coverImage) || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=300&fit=crop";

  return (
    <article className="grid gap-4 rounded-2xl border border-black/10 bg-white p-4 shadow-sm sm:grid-cols-[180px_1fr_auto]">
      <img src={image} alt={trip.name} className="h-32 w-full rounded-xl object-cover sm:h-full" />
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-semibold">{trip.name}</h3>
          <span className="rounded-full bg-[#0d6e6e]/10 px-2 py-1 text-xs font-medium text-[#0d6e6e]">
            {trip.status}
          </span>
        </div>
        <p className="text-sm text-[#6b7280]">{trip.description || "No description yet"}</p>
        <p className="flex items-center gap-1 text-sm text-[#6b7280]">
          <MapPin size={14} />
          {cities || "No stops added"}
        </p>
        <p className="flex items-center gap-1 text-sm text-[#6b7280]">
          <Calendar size={14} />
          {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
        </p>
      </div>
      <div className="flex flex-wrap gap-2 sm:flex-col sm:items-stretch">
        <Link href={`/trip-itinerary?tripId=${trip.id}`} onClick={() => setSelectedTripId(trip.id)}>
          <Button className="w-full">View</Button>
        </Link>
        <Link href={`/trip-budget?tripId=${trip.id}`} onClick={() => setSelectedTripId(trip.id)}>
          <Button variant="secondary" className="w-full">Budget</Button>
        </Link>
        <Link href={`/expenses?tripId=${trip.id}`} onClick={() => setSelectedTripId(trip.id)}>
          <Button variant="ghost" className="w-full">Expenses</Button>
        </Link>
      </div>
    </article>
  );
}

function Notice({ text, tone = "muted" }: { text: string; tone?: "muted" | "error" }) {
  return (
    <div className={`rounded-xl border px-4 py-6 text-center text-sm ${
      tone === "error"
        ? "border-red-200 bg-red-50 text-red-700"
        : "border-dashed border-black/15 bg-white text-[#6b7280]"
    }`}>
      {text}
    </div>
  );
}
