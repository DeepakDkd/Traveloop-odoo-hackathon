"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Plus } from "lucide-react";

import { DashboardPage } from "@/components/layout/dashboard-page";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const suggestedPlaces = [
  {
    id: 1,
    name: "The Pyramids",
    type: "Historical Site",
    image:
      "https://images.unsplash.com/photo-1705628078522-8cbb49acae1f?w=400&h=300&fit=crop",
  },
  {
    id: 2,
    name: "Eiffel Tower",
    type: "Landmark",
    image:
      "https://images.unsplash.com/photo-1706782804418-a791eb8dc8e1f?w=400&h=300&fit=crop",
  },
  {
    id: 3,
    name: "Taj Mahal",
    type: "Monument",
    image:
      "https://images.unsplash.com/photo-1732308988547-bfbcf9171f69?w=400&h=300&fit=crop",
  },
  {
    id: 4,
    name: "Burj Al Arab",
    type: "Hotel & Resort",
    image:
      "https://images.unsplash.com/photo-1774552803467-49c1ce010f02?w=400&h=300&fit=crop",
  },
  {
    id: 5,
    name: "Sydney Opera",
    type: "Cultural Venue",
    image:
      "https://images.unsplash.com/photo-1773490591776-5c4a19769f42?w=400&h=300&fit=crop",
  },
  {
    id: 6,
    name: "Florence Duomo",
    type: "Cathedral",
    image:
      "https://images.unsplash.com/photo-1764215209063-d72a64ba4804?w=400&h=300&fit=crop",
  },
];

type TripFormValues = {
  tripName: string;
  place: string;
  startDate: string;
  endDate: string;
};

type TripFormErrors = Partial<Record<keyof TripFormValues, string>>;

const initialValues: TripFormValues = {
  tripName: "",
  place: "",
  startDate: "",
  endDate: "",
};

export function CreateTrip() {
  const [tripData, setTripData] = useState(initialValues);
  const [selectedPlaces, setSelectedPlaces] = useState<number[]>([]);
  const [errors, setErrors] = useState<TripFormErrors>({});
  const [statusMessage, setStatusMessage] = useState("");

  function handleChange(field: keyof TripFormValues, value: string) {
    setTripData((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));

    setStatusMessage("");
  }

  function togglePlace(placeId: number) {
    setSelectedPlaces((current) =>
      current.includes(placeId)
        ? current.filter((id) => id !== placeId)
        : [...current, placeId],
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateTrip(tripData);
    setErrors(nextErrors);
    setStatusMessage("");

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    console.log("Create trip data:", {
      ...tripData,
      selectedPlaceIds: selectedPlaces,
    });

    setStatusMessage("Trip data saved locally. Check the console for details.");
    setTripData(initialValues);
    setSelectedPlaces([]);
  }

  return (
    <DashboardPage className="pb-16 lg:pb-16">
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <Link
          href="/"
          className="app-icon-button inline-flex h-11 w-11 items-center justify-center rounded-xl border border-black/10 bg-white text-[#1a1a2e]"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <p className="text-sm font-medium text-[#6b7280]">Back to dashboard</p>
          <h1 className="mt-1 text-[28px] font-bold text-[#1a1a2e]">
            Plan a new trip
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
          <Card className="p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <Input
                  label="Trip Name"
                  type="text"
                  placeholder="e.g., European Summer Adventure"
                  value={tripData.tripName}
                  onChange={(event) =>
                    handleChange("tripName", event.target.value)
                  }
                  error={errors.tripName}
                />
              </div>

              <div className="md:col-span-2">
                <div className="flex w-full flex-col gap-1.5">
                  <label className="text-[14px] font-medium text-[#1a1a2e]">
                    Select a Place
                  </label>
                  <div className="relative">
                    <MapPin
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]"
                      size={18}
                    />
                    <input
                      type="text"
                      className={`h-10 w-full rounded-[0.5rem] border bg-white pl-10 pr-3 text-[14px] text-[#1a1a2e] placeholder:text-[#6b7280] transition-all duration-200 focus:outline-none focus:ring-2 ${
                        errors.place
                          ? "border-[#ef4444] focus:border-[#ef4444] focus:ring-[#ef4444]/20"
                          : "border-black/10 focus:border-[#0d6e6e] focus:ring-[#0d6e6e]/20"
                      }`}
                      placeholder="Enter destination city or country"
                      value={tripData.place}
                      onChange={(event) =>
                        handleChange("place", event.target.value)
                      }
                    />
                  </div>
                  {errors.place ? (
                    <span className="text-[12px] text-[#ef4444]">
                      {errors.place}
                    </span>
                  ) : null}
                </div>
              </div>

              <Input
                label="Start Date"
                type="date"
                value={tripData.startDate}
                onChange={(event) =>
                  handleChange("startDate", event.target.value)
                }
                error={errors.startDate}
              />

              <Input
                label="End Date"
                type="date"
                value={tripData.endDate}
                onChange={(event) => handleChange("endDate", event.target.value)}
                error={errors.endDate}
              />
            </div>
          </Card>

          <div className="space-y-4">
            <h3 className="text-[20px] font-semibold text-[#1a1a2e]">
              Suggestions for Places to Visit / Activities to Perform
            </h3>
            <p className="text-[14px] text-[#6b7280]">
              Select activities and landmarks to add to your itinerary
            </p>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {suggestedPlaces.map((place) => (
                <button
                  key={place.id}
                  type="button"
                  onClick={() => togglePlace(place.id)}
                  className={`relative overflow-hidden rounded-2xl text-left transition-all duration-200 ${
                    selectedPlaces.includes(place.id)
                      ? "scale-[1.02] ring-4 ring-[#f59e0b] shadow-lg"
                      : "hover:scale-[1.01] hover:shadow-md"
                  }`}
                >
                  <div className="relative aspect-[4/3]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={place.image}
                      alt={place.name}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-3">
                      <h4 className="mb-0.5 text-[14px] font-semibold text-white">
                        {place.name}
                      </h4>
                      <p className="text-[12px] text-white/80">{place.type}</p>
                    </div>
                    {selectedPlaces.includes(place.id) ? (
                      <div className="absolute right-2 top-2 rounded-full bg-[#f59e0b] p-1.5">
                        <Plus size={16} className="rotate-45 text-white" />
                      </div>
                    ) : null}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {statusMessage ? (
            <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-[#10b981]">
              {statusMessage}
            </div>
          ) : null}

          <div className="flex justify-end gap-4 pt-4">
            <Link
              href="/"
              className="inline-flex h-10 items-center justify-center rounded-xl border-2 border-[#0d6e6e] px-4 text-[14px] font-medium text-[#0d6e6e] transition-all duration-200 hover:bg-[#0d6e6e]/5 active:bg-[#0d6e6e]/10"
            >
              Cancel
            </Link>
            <Button type="submit" variant="primary">
              Save & Continue to Itinerary
            </Button>
          </div>
      </form>
    </DashboardPage>
  );
}

function validateTrip(values: TripFormValues) {
  const errors: TripFormErrors = {};

  if (!values.tripName.trim()) errors.tripName = "Trip name is required.";
  if (!values.place.trim()) errors.place = "Destination is required.";
  if (!values.startDate) errors.startDate = "Start date is required.";
  if (!values.endDate) errors.endDate = "End date is required.";

  if (
    values.startDate &&
    values.endDate &&
    new Date(values.endDate) < new Date(values.startDate)
  ) {
    errors.endDate = "End date must be after start date.";
  }

  return errors;
}
