"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { Calendar, Loader2, MapPin, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DashboardPage } from "@/components/layout/dashboard-page";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest, getSelectedTripId, setSelectedTripId } from "@/lib/api";
import { Activity, City, Stop, Trip } from "@/lib/types";

type ApiData<T> = {
  success: boolean;
  data: T;
};

type StopForm = {
  place: string;
  startDate: string;
  endDate: string;
  notes: string;
};

type ActivityForm = {
  q: string;
  scheduledAt: string;
  notes: string;
};

const initialStopForm: StopForm = {
  place: "",
  startDate: "",
  endDate: "",
  notes: "",
};

const initialActivityForm: ActivityForm = {
  q: "",
  scheduledAt: "",
  notes: "",
};

export default function TripItineraryPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [tripId, setTripId] = useState("");
  const [trip, setTrip] = useState<Trip | null>(null);
  const [stops, setStops] = useState<Stop[]>([]);
  const [selectedStopId, setSelectedStopId] = useState("");
  const [cityResults, setCityResults] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [activityResults, setActivityResults] = useState<Activity[]>([]);
  const [selectedActivityId, setSelectedActivityId] = useState("");
  const [stopForm, setStopForm] = useState<StopForm>(initialStopForm);
  const [activityForm, setActivityForm] = useState<ActivityForm>(initialActivityForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const urlTripId = new URLSearchParams(window.location.search).get("tripId");
    const storedTripId = getSelectedTripId();

    async function loadTrips() {
      try {
        setLoading(true);
        const payload = await apiRequest<ApiData<Trip[]>>("/api/trips/user/all?sort=startDate&order=desc");
        const loadedTrips = payload.data || [];
        const nextTripId = urlTripId || storedTripId || loadedTrips[0]?.id || "";
        setTrips(loadedTrips);
        setTripId(nextTripId);
        if (nextTripId) setSelectedTripId(nextTripId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load trips");
      } finally {
        setLoading(false);
      }
    }

    loadTrips();
  }, []);

  useEffect(() => {
    if (!tripId) return;
    loadTripDetails(tripId);
  }, [tripId]);

  useEffect(() => {
    const search = stopForm.place.trim();
    if (search.length < 2) {
      setCityResults([]);
      return;
    }

    const timeout = window.setTimeout(async () => {
      const payload = await apiRequest<ApiData<City[]>>(
        `/api/cities/search?q=${encodeURIComponent(search)}&take=6`,
      ).catch(() => ({ success: false, data: [] as City[] }));
      setCityResults(payload.data || []);
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [stopForm.place]);

  useEffect(() => {
    const stop = stops.find((item) => item.id === selectedStopId);
    const search = activityForm.q.trim();

    if (!stop || search.length < 2) {
      setActivityResults([]);
      return;
    }

    const timeout = window.setTimeout(async () => {
      const payload = await apiRequest<ApiData<Activity[]>>(
        `/api/activities/search?q=${encodeURIComponent(search)}&cityId=${stop.cityId}&take=8`,
      ).catch(() => ({ success: false, data: [] as Activity[] }));
      setActivityResults(payload.data || []);
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [activityForm.q, selectedStopId, stops]);

  async function loadTripDetails(id: string) {
    try {
      setError("");
      const [tripPayload, stopsPayload] = await Promise.all([
        apiRequest<ApiData<Trip>>(`/api/trips/${id}`),
        apiRequest<ApiData<Stop[]>>(`/api/trips/${id}/stops`),
      ]);
      setTrip(tripPayload.data);
      setStops(stopsPayload.data || []);
      setSelectedStopId((current) => current || stopsPayload.data?.[0]?.id || "");
      setSelectedTripId(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load itinerary");
    }
  }

  async function handleAddStop(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!tripId || !selectedCity || !stopForm.startDate || !stopForm.endDate) {
      toast.error("Select a city and date range");
      return;
    }

    try {
      setSaving(true);
      await apiRequest(`/api/trips/${tripId}/stops`, {
        method: "POST",
        body: {
          cityId: selectedCity.id,
          startDate: stopForm.startDate,
          endDate: stopForm.endDate,
          notes: stopForm.notes,
        },
      });
      setStopForm(initialStopForm);
      setSelectedCity(null);
      setCityResults([]);
      await loadTripDetails(tripId);
      toast.success("Itinerary section added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to add stop");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteStop(stopId: string) {
    const previous = stops;
    setStops((current) => current.filter((stop) => stop.id !== stopId));

    try {
      await apiRequest(`/api/stops/${stopId}`, {
        method: "DELETE",
      });
      toast.success("Section removed");
    } catch (err) {
      setStops(previous);
      toast.error(err instanceof Error ? err.message : "Unable to remove section");
    }
  }

  async function handleAddActivity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedStopId) {
      toast.error("Select an itinerary section first");
      return;
    }

    if (!selectedActivityId && !activityForm.q.trim()) {
      toast.error("Choose or name an activity");
      return;
    }

    try {
      setSaving(true);
      await apiRequest(`/api/stops/${selectedStopId}/activities`, {
        method: "POST",
        body: selectedActivityId
          ? {
              activityId: selectedActivityId,
              scheduledAt: activityForm.scheduledAt || null,
              notes: activityForm.notes,
            }
          : {
              name: activityForm.q,
              category: "OTHER",
              scheduledAt: activityForm.scheduledAt || null,
              notes: activityForm.notes,
            },
      });
      setActivityForm(initialActivityForm);
      setSelectedActivityId("");
      setActivityResults([]);
      await loadTripDetails(tripId);
      toast.success("Activity added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to add activity");
    } finally {
      setSaving(false);
    }
  }

  const selectedStop = useMemo(
    () => stops.find((stop) => stop.id === selectedStopId) || stops[0],
    [selectedStopId, stops],
  );

  return (
    <DashboardShell>
      <DashboardPage>
        <div className="space-y-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium text-[#6b7280]">Build itinerary</p>
              <h1 className="mt-1 text-[28px] font-bold text-[#1a1a2e]">
                {trip?.name || "Trip Itinerary"}
              </h1>
            </div>
            <select
              value={tripId}
              onChange={(event) => {
                setTripId(event.target.value);
                setSelectedTripId(event.target.value);
              }}
              className="h-11 rounded-xl border border-black/10 bg-white px-3 text-sm outline-none"
            >
              <option value="">Select trip</option>
              {trips.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          {error ? <Notice tone="error" text={error} /> : null}

          {loading ? (
            <div className="flex items-center gap-2 rounded-xl bg-white p-4 text-sm text-[#6b7280]">
              <Loader2 size={16} className="animate-spin" /> Loading itinerary...
            </div>
          ) : !tripId ? (
            <Notice text="Create or select a trip to build the itinerary." />
          ) : (
            <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
              <div className="space-y-6">
                <form onSubmit={handleAddStop} className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
                  <h2 className="text-lg font-semibold">Add another section</h2>
                  <div className="mt-4 space-y-4">
                    <div>
                      <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" />
                        <input
                          value={stopForm.place}
                          onChange={(event) => {
                            setStopForm((current) => ({ ...current, place: event.target.value }));
                            setSelectedCity(null);
                          }}
                          placeholder="Search city"
                          className="h-10 w-full rounded-lg border border-black/10 pl-9 pr-3 text-sm outline-none focus:border-[#0d6e6e]"
                        />
                      </div>
                      {cityResults.length ? (
                        <div className="mt-2 max-h-44 overflow-y-auto rounded-lg border border-black/10">
                          {cityResults.map((city) => (
                            <button
                              type="button"
                              key={city.id}
                              onClick={() => {
                                setSelectedCity(city);
                                setStopForm((current) => ({
                                  ...current,
                                  place: `${city.name}, ${city.country}`,
                                }));
                                setCityResults([]);
                              }}
                              className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-black/5"
                            >
                              <span>{city.name}</span>
                              <span className="text-[#6b7280]">{city.country}</span>
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input
                        label="Start Date"
                        type="date"
                        value={stopForm.startDate}
                        onChange={(event) => setStopForm((current) => ({ ...current, startDate: event.target.value }))}
                      />
                      <Input
                        label="End Date"
                        type="date"
                        value={stopForm.endDate}
                        onChange={(event) => setStopForm((current) => ({ ...current, endDate: event.target.value }))}
                      />
                    </div>
                    <textarea
                      value={stopForm.notes}
                      onChange={(event) => setStopForm((current) => ({ ...current, notes: event.target.value }))}
                      placeholder="Section notes"
                      className="min-h-24 w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[#0d6e6e]"
                    />
                    <Button type="submit" disabled={saving} className="w-full">
                      <Plus size={16} /> Add Section
                    </Button>
                  </div>
                </form>

                <form onSubmit={handleAddActivity} className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
                  <h2 className="text-lg font-semibold">Add activity</h2>
                  <div className="mt-4 space-y-4">
                    <select
                      value={selectedStopId}
                      onChange={(event) => setSelectedStopId(event.target.value)}
                      className="h-10 w-full rounded-lg border border-black/10 bg-white px-3 text-sm outline-none"
                    >
                      {stops.map((stop) => (
                        <option key={stop.id} value={stop.id}>
                          {stop.city?.name} | {new Date(stop.startDate).toLocaleDateString()}
                        </option>
                      ))}
                    </select>
                    <input
                      value={activityForm.q}
                      onChange={(event) => {
                        setActivityForm((current) => ({ ...current, q: event.target.value }));
                        setSelectedActivityId("");
                      }}
                      placeholder="Search or type activity"
                      className="h-10 w-full rounded-lg border border-black/10 px-3 text-sm outline-none focus:border-[#0d6e6e]"
                    />
                    {activityResults.length ? (
                      <div className="max-h-44 overflow-y-auto rounded-lg border border-black/10">
                        {activityResults.map((activity) => (
                          <button
                            type="button"
                            key={activity.id}
                            onClick={() => {
                              setSelectedActivityId(activity.id);
                              setActivityForm((current) => ({ ...current, q: activity.name }));
                              setActivityResults([]);
                            }}
                            className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-black/5"
                          >
                            <span>{activity.name}</span>
                            <span className="text-[#6b7280]">{activity.category}</span>
                          </button>
                        ))}
                      </div>
                    ) : null}
                    <Input
                      label="Scheduled At"
                      type="datetime-local"
                      value={activityForm.scheduledAt}
                      onChange={(event) => setActivityForm((current) => ({ ...current, scheduledAt: event.target.value }))}
                    />
                    <textarea
                      value={activityForm.notes}
                      onChange={(event) => setActivityForm((current) => ({ ...current, notes: event.target.value }))}
                      placeholder="Activity notes"
                      className="min-h-20 w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[#0d6e6e]"
                    />
                    <Button type="submit" disabled={saving || !stops.length} className="w-full">
                      <Plus size={16} /> Add Activity
                    </Button>
                  </div>
                </form>
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold">Itinerary for selected place</h2>
                  <div className="flex gap-2">
                    <Link href={`/trip-budget?tripId=${tripId}`}>
                      <Button variant="secondary">Budget</Button>
                    </Link>
                    <Link href={`/packing-checklist?tripId=${tripId}`}>
                      <Button variant="ghost">Checklist</Button>
                    </Link>
                  </div>
                </div>

                {stops.length ? (
                  <div className="space-y-4">
                    {stops.map((stop, index) => (
                      <section
                        key={stop.id}
                        className={`rounded-2xl border bg-white p-5 shadow-sm ${
                          selectedStop?.id === stop.id ? "border-[#0d6e6e]" : "border-black/10"
                        }`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => setSelectedStopId(stop.id)}
                            className="text-left"
                          >
                            <p className="text-sm font-medium text-[#0d6e6e]">Day {index + 1}</p>
                            <h3 className="mt-1 text-lg font-semibold">{stop.city?.name}, {stop.city?.country}</h3>
                            <p className="mt-1 flex items-center gap-1 text-sm text-[#6b7280]">
                              <Calendar size={14} />
                              {new Date(stop.startDate).toLocaleDateString()} - {new Date(stop.endDate).toLocaleDateString()}
                            </p>
                          </button>
                          <Button type="button" variant="destructive" size="sm" onClick={() => handleDeleteStop(stop.id)}>
                            <Trash2 size={14} />
                          </Button>
                        </div>
                        <div className="mt-4 space-y-2">
                          {stop.activities?.length ? (
                            stop.activities.map((item) => (
                              <div key={item.id} className="grid gap-3 rounded-xl border border-black/10 p-3 sm:grid-cols-[1fr_auto]">
                                <div>
                                  <p className="font-medium">{item.activity?.name}</p>
                                  <p className="text-sm text-[#6b7280]">{item.notes || item.activity?.description || "No notes"}</p>
                                  <p className="mt-1 flex items-center gap-1 text-xs text-[#6b7280]">
                                    <MapPin size={12} /> {item.activity?.category}
                                  </p>
                                </div>
                                <div className="text-sm font-semibold text-[#1a1a2e]">
                                  {item.activity?.cost ? `$${item.activity.cost}` : "No cost"}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="rounded-xl border border-dashed border-black/15 px-4 py-5 text-center text-sm text-[#6b7280]">
                              No activities yet.
                            </div>
                          )}
                        </div>
                      </section>
                    ))}
                  </div>
                ) : (
                  <Notice text="No itinerary sections yet. Add your first city stop." />
                )}
              </div>
            </div>
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
