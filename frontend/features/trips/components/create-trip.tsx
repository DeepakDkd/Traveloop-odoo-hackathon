"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BedDouble,
  Calendar,
  Landmark,
  MapPin,
  Wallet,
} from "lucide-react";

import SearchCity from "@/components/searchCity";
import SearchHotels from "@/components/searchHotels";
import { DashboardPage } from "@/components/layout/dashboard-page";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TripNotesBoard } from "@/features/trips/components/trip-notes-board";
import {
  createTripId,
  formatTripBudget,
  getTripDestinations,
  getTripStopCounts,
  saveStoredTrip,
} from "@/features/trips/lib/storage";
import type { SavedTrip, TripNote, TripStop } from "@/features/trips/lib/types";

type TripFormValues = {
  tripName: string;
  startDate: string;
  endDate: string;
  budget: string;
};

type TripFormErrors = Partial<Record<keyof TripFormValues | "stops", string>>;

type ApiData<T> = {
  success: boolean;
  data: T;
};

const initialValues: TripFormValues = {
  tripName: "",
  startDate: "",
  endDate: "",
  budget: "",
};

function validateTrip(
  values: TripFormValues,
  selectedStops: TripStop[],
): TripFormErrors {
  const errors: TripFormErrors = {};
  const parsedBudget = Number.parseFloat(values.budget);

  if (!values.tripName.trim()) {
    errors.tripName = "Trip name is required.";
  }

  if (!values.startDate) {
    errors.startDate = "Start date is required.";
  }

  if (!values.endDate) {
    errors.endDate = "End date is required.";
  }

  if (
    values.startDate &&
    values.endDate &&
    new Date(values.endDate) < new Date(values.startDate)
  ) {
    errors.endDate = "End date must be after start date.";
  }

  if (!values.budget) {
    errors.budget = "Budget is required.";
  } else if (Number.isNaN(parsedBudget) || parsedBudget <= 0) {
    errors.budget = "Budget must be greater than 0.";
  }

  if (selectedStops.length === 0) {
    errors.stops = "Select at least one hotel or place before saving.";
  }

  return errors;
}

export function CreateTrip() {
  const router = useRouter();
  const [tripData, setTripData] = useState(initialValues);
  const [selectedStops, setSelectedStops] = useState<TripStop[]>([]);
  const [notes, setNotes] = useState<TripNote[]>([]);
  const [errors, setErrors] = useState<TripFormErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  const selectedStopIds = useMemo(
    () => selectedStops.map((stop) => stop.id),
    [selectedStops],
  );
  const tripDestinations = useMemo(
    () => getTripDestinations({ stops: selectedStops }),
    [selectedStops],
  );
  const stopCounts = useMemo(
    () => getTripStopCounts({ stops: selectedStops }),
    [selectedStops],
  );
  const parsedBudget = Number.parseFloat(tripData.budget || "0");

  function handleChange(field: keyof TripFormValues, value: string) {
    setTripData((current) => ({
      ...current,
      [field]: value,
    }));

    if (field === "place") setSelectedCity(null);

    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  }

  function toggleStop(stop: TripStop) {
    setSelectedStops((current) => {
      const existingStop = current.find((item) => item.id === stop.id);

      if (existingStop) {
        return current.filter((item) => item.id !== stop.id);
      }

      return [...current, stop];
    });

    setErrors((current) => ({
      ...current,
      stops: undefined,
    }));
  }

  function handleRemoveStop(stopId: string) {
    setSelectedStops((current) => current.filter((stop) => stop.id !== stopId));
  }

  function handleSaveTrip() {
    const nextErrors = validateTrip(tripData, selectedStops);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const now = new Date().toISOString();

    const nextTrip: SavedTrip = {
      id: createTripId(),
      tripName: tripData.tripName.trim(),
      startDate: tripData.startDate,
      endDate: tripData.endDate,
      budget: Number.parseFloat(tripData.budget),
      notes,
      stops: selectedStops,
      createdAt: now,
      updatedAt: now,
    };

    setIsSaving(true);

    try {
      saveStoredTrip(nextTrip);
      router.push(`/trip-itinerary/${nextTrip.id}`);
    } catch (error) {
      console.error("Failed to save trip:", error);
      setIsSaving(false);
    }
  }

  return (
    <DashboardPage className="pb-16 lg:pb-16">
      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-black/10 bg-white text-[#1a1a2e]"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <p className="text-sm font-medium text-[#6b7280]">
                Build your trip and save it locally
              </p>
              <h1 className="mt-1 text-[28px] font-bold text-[#1a1a2e]">
                Create a trip
              </h1>
            </div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0d6e6e]">
              Trip Summary
            </p>
            <p className="mt-1 text-lg font-semibold text-[#1a1a2e]">
              {selectedStops.length} stop{selectedStops.length === 1 ? "" : "s"} planned
            </p>
          </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-8">
            <Card className="p-6">
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0d6e6e]">
                  Basics
                </p>
                <h2 className="mt-2 text-[22px] font-semibold text-[#1a1a2e]">
                  Trip details
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-[#6b7280]">
                  Start with the core details, then choose hotels, places, and notes for
                  the itinerary.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Input
                    label="Trip name"
                    type="text"
                    placeholder="Example: Kerala monsoon break"
                    value={tripData.tripName}
                    onChange={(event) => handleChange("tripName", event.target.value)}
                    error={errors.tripName}
                  />
                </div>

                <Input
                  label="Start date"
                  type="date"
                  value={tripData.startDate}
                  onChange={(event) => handleChange("startDate", event.target.value)}
                  error={errors.startDate}
                />

                <Input
                  label="End date"
                  type="date"
                  value={tripData.endDate}
                  onChange={(event) => handleChange("endDate", event.target.value)}
                  error={errors.endDate}
                />

                <div className="md:col-span-2">
                  <Input
                    label="Budget"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Enter your planned budget"
                    value={tripData.budget}
                    onChange={(event) => handleChange("budget", event.target.value)}
                    error={errors.budget}
                  />
                </div>
              </div>
            </Card>

            <TripNotesBoard notes={notes} onChange={setNotes} />

            <SearchHotels
              selectedStopIds={selectedStopIds}
              onToggleStop={toggleStop}
            />

            <SearchCity
              selectedStopIds={selectedStopIds}
              onToggleStop={toggleStop}
            />

            {errors.stops ? (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-[#dc2626]">
                {errors.stops}
              </div>
            ) : null}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Link
                href="/"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-black/15 bg-white px-4 text-[14px] font-medium text-[#1a1a2e] transition-all duration-200 hover:bg-[#f8f9fa] active:bg-[#e5e7eb]"
              >
                Cancel
              </Link>
              <Button
                type="button"
                variant="primary"
                onClick={handleSaveTrip}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save and Continue"}
              </Button>
            </div>
          </div>

          <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
            <Card className="space-y-4 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0d6e6e]">
                  Live summary
                </p>
                <h2 className="mt-2 text-xl font-semibold text-[#1a1a2e]">
                  {tripData.tripName.trim() || "Untitled trip"}
                </h2>
                <p className="mt-2 text-sm text-[#6b7280]">{tripDestinations}</p>
              </div>

              <div className="grid gap-3">
                <SummaryTile
                  icon={<Calendar size={16} />}
                  label="Dates"
                  value={
                    tripData.startDate && tripData.endDate
                      ? `${tripData.startDate} to ${tripData.endDate}`
                      : "Add travel dates"
                  }
                />
                <SummaryTile
                  icon={<Wallet size={16} />}
                  label="Budget"
                  value={
                    parsedBudget > 0 ? formatTripBudget(parsedBudget) : "Add budget"
                  }
                />
                <SummaryTile
                  icon={<MapPin size={16} />}
                  label="Total stops"
                  value={`${selectedStops.length} selected`}
                />
              </div>
            </Card>

            <Card className="space-y-4 p-5">
              <h3 className="text-lg font-semibold text-[#1a1a2e]">Selected stops</h3>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <SummaryTile
                  icon={<BedDouble size={16} />}
                  label="Hotels"
                  value={`${stopCounts.hotels} saved`}
                />
                <SummaryTile
                  icon={<Landmark size={16} />}
                  label="Places"
                  value={`${stopCounts.places} saved`}
                />
              </div>

              {selectedStops.length > 0 ? (
                <div className="space-y-3">
                  {selectedStops.map((stop) => (
                    <div
                      key={stop.id}
                      className="rounded-2xl border border-black/10 bg-[#fbfcfe] px-4 py-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[#1a1a2e]">
                            {stop.name}
                          </p>
                          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#0d6e6e]">
                            {stop.kind} in {stop.city}
                          </p>
                          <p className="mt-2 text-sm text-[#6b7280]">{stop.address}</p>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveStop(stop.id)}
                          className="text-[#ef4444] hover:bg-[#ef4444]/10 hover:text-[#dc2626]"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-black/10 bg-white px-4 py-8 text-center text-sm text-[#6b7280]">
                  Search hotels and places, then add the stops you want in this trip.
                </div>
              )}

              <div className="rounded-2xl bg-[#0d6e6e]/6 px-4 py-4">
                <p className="text-sm font-medium text-[#1a1a2e]">
                  {notes.length} note{notes.length === 1 ? "" : "s"} prepared
                </p>
                <p className="mt-1 text-sm text-[#6b7280]">
                  Notes will be saved with this itinerary and shown on the next page.
                </p>
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </DashboardPage>
  );
}

function SummaryTile({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-[#fbfcfe] px-4 py-4">
      <div className="flex items-center gap-2 text-[#0d6e6e]">
        {icon}
        <p className="text-xs font-semibold uppercase tracking-[0.16em]">{label}</p>
      </div>
      <p className="mt-2 text-sm font-medium text-[#1a1a2e]">{value}</p>
    </div>
  );
}
