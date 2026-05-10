"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowUpDown, Bookmark, Loader2, MapPin, Search, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { DashboardPage } from "@/components/layout/dashboard-page";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { apiImageUrl, apiRequest } from "@/lib/api";
import { Activity, City } from "@/lib/types";

type ApiData<T> = {
  success: boolean;
  data: T;
};

const categories = ["", "SIGHTSEEING", "FOOD", "ADVENTURE", "CULTURE", "SHOPPING", "TRANSPORT", "OTHER"];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [mode, setMode] = useState<"cities" | "activities">("cities");
  const [cities, setCities] = useState<City[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q") || "";
    setQuery(initialQuery);
    loadInitial(initialQuery, params.get("cityId") || "");
  }, []);

  async function loadInitial(initialQuery: string, cityId: string) {
    try {
      setLoading(true);
      const cityPayload = initialQuery
        ? await apiRequest<ApiData<City[]>>(`/api/cities/search?q=${encodeURIComponent(initialQuery)}&take=20`)
        : await apiRequest<ApiData<City[]>>("/api/cities/popular");
      setCities(cityPayload.data || []);

      if (cityId) {
        const payload = await apiRequest<ApiData<{ city: City; activities: Activity[] }>>(`/api/cities/${cityId}/activities`);
        setSelectedCity(payload.data.city);
        setActivities(payload.data.activities || []);
        setMode("activities");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load search");
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    try {
      setLoading(true);
      setError("");

      if (mode === "cities") {
        const path = query
          ? `/api/cities/search?q=${encodeURIComponent(query)}&take=30`
          : "/api/cities/popular";
        const payload = await apiRequest<ApiData<City[]>>(path);
        setCities(payload.data || []);
      } else {
        const params = new URLSearchParams();
        if (query) params.set("q", query);
        if (category) params.set("category", category);
        if (selectedCity) params.set("cityId", selectedCity.id);
        params.set("take", "30");
        const payload = await apiRequest<ApiData<Activity[]>>(`/api/activities/search?${params.toString()}`);
        setActivities(payload.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }

  async function loadCityActivities(city: City) {
    try {
      setSelectedCity(city);
      setMode("activities");
      setLoading(true);
      const payload = await apiRequest<ApiData<{ city: City; activities: Activity[] }>>(`/api/cities/${city.id}/activities`);
      setActivities(payload.data.activities || []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to load city activities");
    } finally {
      setLoading(false);
    }
  }

  async function saveCity(cityId: string) {
    try {
      await apiRequest(`/api/cities/${cityId}/save`, {
        method: "POST",
      });
      toast.success("City saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to save city");
    }
  }

  return (
    <DashboardShell>
      <DashboardPage>
        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium text-[#6b7280]">Explore</p>
            <h1 className="mt-1 text-[28px] font-bold">Activity Search / City Search</h1>
          </div>

          <form onSubmit={handleSearch} className="grid gap-3 lg:grid-cols-[auto_1fr_auto_auto_auto]">
            <div className="flex rounded-xl border border-black/10 bg-white p-1">
              <button
                type="button"
                onClick={() => setMode("cities")}
                className={`rounded-lg px-3 py-2 text-sm ${mode === "cities" ? "bg-[#0d6e6e] text-white" : "text-[#6b7280]"}`}
              >
                Cities
              </button>
              <button
                type="button"
                onClick={() => setMode("activities")}
                className={`rounded-lg px-3 py-2 text-sm ${mode === "activities" ? "bg-[#0d6e6e] text-white" : "text-[#6b7280]"}`}
              >
                Activities
              </button>
            </div>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={mode === "cities" ? "Search cities or countries..." : "Search activities..."}
                className="h-11 w-full rounded-xl border border-black/10 bg-white pl-10 pr-3 text-sm outline-none focus:border-[#0d6e6e] focus:ring-2 focus:ring-[#0d6e6e]/15"
              />
            </div>
            <label className="flex h-11 items-center gap-2 rounded-xl border border-black/10 bg-white px-3 text-sm">
              <SlidersHorizontal size={18} className="text-[#6b7280]" />
              <select
                value={category}
                disabled={mode === "cities"}
                onChange={(event) => setCategory(event.target.value)}
                className="bg-transparent outline-none disabled:text-[#9ca3af]"
              >
                {categories.map((item) => (
                  <option key={item || "all"} value={item}>
                    {item || "All categories"}
                  </option>
                ))}
              </select>
            </label>
            <span className="flex h-11 items-center gap-2 rounded-xl border border-black/10 bg-white px-3 text-sm text-[#6b7280]">
              <ArrowUpDown size={18} /> Relevance
            </span>
            <Button type="submit">Search</Button>
          </form>

          {selectedCity && mode === "activities" ? (
            <div className="rounded-xl bg-[#0d6e6e]/10 px-4 py-3 text-sm text-[#0d6e6e]">
              Showing activities for {selectedCity.name}, {selectedCity.country}
            </div>
          ) : null}

          {error ? <Notice tone="error" text={error} /> : null}

          {loading ? (
            <div className="flex items-center gap-2 rounded-xl bg-white p-4 text-sm text-[#6b7280]">
              <Loader2 size={16} className="animate-spin" /> Searching...
            </div>
          ) : mode === "cities" ? (
            cities.length ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {cities.map((city) => (
                  <Card key={city.id} className="overflow-hidden p-0">
                    <img
                      src={apiImageUrl(city.imageUrl) || "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600&h=360&fit=crop"}
                      alt={city.name}
                      className="h-40 w-full object-cover"
                    />
                    <div className="space-y-3 p-4">
                      <div>
                        <h2 className="text-lg font-semibold">{city.name}</h2>
                        <p className="flex items-center gap-1 text-sm text-[#6b7280]">
                          <MapPin size={14} /> {city.country}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button type="button" onClick={() => loadCityActivities(city)} className="flex-1">
                          View Activities
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => saveCity(city.id)}>
                          <Bookmark size={16} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Notice text="No cities found." />
            )
          ) : activities.length ? (
            <div className="space-y-3">
              {activities.map((activity) => (
                <Card key={activity.id} className="grid gap-3 p-5 sm:grid-cols-[1fr_auto]">
                  <div>
                    <h2 className="text-lg font-semibold">{activity.name}</h2>
                    <p className="mt-1 text-sm text-[#6b7280]">{activity.description || "No description available"}</p>
                    <p className="mt-2 text-xs font-medium text-[#0d6e6e]">
                      {activity.category} {typeof activity.city === "object" ? `| ${activity.city.name}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    {activity.cost ? `$${activity.cost}` : "Free/unknown"}
                    <Link href="/trip-itinerary">
                      <Button type="button" variant="secondary">Plan</Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Notice text="No activities found." />
          )}
        </div>
      </DashboardPage>
    </DashboardShell>
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
