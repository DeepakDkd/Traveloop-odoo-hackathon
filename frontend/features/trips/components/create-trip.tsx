"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, MapPin, Plus } from "lucide-react";
import { toast } from "sonner";

import { DashboardPage } from "@/components/layout/dashboard-page";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiImageUrl, apiRequest, setSelectedTripId } from "@/lib/api";
import { City, Trip } from "@/lib/types";

type TripFormValues = {
  tripName: string;
  description: string;
  place: string;
  startDate: string;
  endDate: string;
};

type TripFormErrors = Partial<Record<keyof TripFormValues, string>>;

type ApiData<T> = {
  success: boolean;
  data: T;
};

const initialValues: TripFormValues = {
  tripName: "",
  description: "",
  place: "",
  startDate: "",
  endDate: "",
};

export function CreateTrip() {
  const router = useRouter();
  const [tripData, setTripData] = useState(initialValues);
  const [suggestedCities, setSuggestedCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [errors, setErrors] = useState<TripFormErrors>({});
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const search = tripData.place.trim();

    if (search.length < 2) {
      setSuggestedCities([]);
      setSelectedCity(null);
      return;
    }

    const timeout = window.setTimeout(async () => {
      try {
        setIsSearching(true);
        const payload = await apiRequest<ApiData<City[]>>(
          `/api/cities/search?q=${encodeURIComponent(search)}&take=6`,
        );
        setSuggestedCities(payload.data || []);
      } catch {
        setSuggestedCities([]);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [tripData.place]);

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

    setStatusMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateTrip(tripData);
    setErrors(nextErrors);
    setStatusMessage("");

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      const createPayload = await apiRequest<ApiData<Trip>>("/api/trips", {
        method: "POST",
        body: {
          name: tripData.tripName,
          description: tripData.description || tripData.place,
          startDate: tripData.startDate,
          endDate: tripData.endDate,
          isPublic: false,
        },
      });

      const trip = createPayload.data;

      if (selectedCity) {
        await apiRequest(`/api/trips/${trip.id}/stops`, {
          method: "POST",
          body: {
            cityId: selectedCity.id,
            startDate: tripData.startDate,
            endDate: tripData.endDate,
            order: 0,
            notes: `Starting in ${selectedCity.name}`,
          },
        });
      }

      setSelectedTripId(trip.id);
      toast.success("Trip created");
      router.push(`/trip-itinerary?tripId=${trip.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to create trip";
      setStatusMessage(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
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
                onChange={(event) => handleChange("tripName", event.target.value)}
                error={errors.tripName}
              />
            </div>

            <div className="md:col-span-2">
              <Input
                label="Short Description"
                type="text"
                placeholder="Food walks, museums, and slow train days"
                value={tripData.description}
                onChange={(event) => handleChange("description", event.target.value)}
                error={errors.description}
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
                    onChange={(event) => handleChange("place", event.target.value)}
                  />
                  {isSearching ? (
                    <Loader2
                      size={16}
                      className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[#6b7280]"
                    />
                  ) : null}
                </div>
                {errors.place ? (
                  <span className="text-[12px] text-[#ef4444]">{errors.place}</span>
                ) : null}
                {selectedCity ? (
                  <span className="text-[12px] text-[#0d6e6e]">
                    First stop selected: {selectedCity.name}, {selectedCity.country}
                  </span>
                ) : null}
              </div>
            </div>

            <Input
              label="Start Date"
              type="date"
              value={tripData.startDate}
              onChange={(event) => handleChange("startDate", event.target.value)}
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
            Select a city suggestion to add it as the first itinerary section.
          </p>

          {suggestedCities.length ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {suggestedCities.map((city) => (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => {
                    setSelectedCity(city);
                    setTripData((current) => ({
                      ...current,
                      place: `${city.name}, ${city.country}`,
                    }));
                  }}
                  className={`relative overflow-hidden rounded-2xl text-left transition-all duration-200 ${
                    selectedCity?.id === city.id
                      ? "scale-[1.02] ring-4 ring-[#f59e0b] shadow-lg"
                      : "hover:scale-[1.01] hover:shadow-md"
                  }`}
                >
                  <div className="relative aspect-[4/3]">
                    <img
                      src={
                        apiImageUrl(city.imageUrl) ||
                        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=400&h=300&fit=crop"
                      }
                      alt={city.name}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-3">
                      <h4 className="mb-0.5 text-[14px] font-semibold text-white">
                        {city.name}
                      </h4>
                      <p className="text-[12px] text-white/80">{city.country}</p>
                    </div>
                    {selectedCity?.id === city.id ? (
                      <div className="absolute right-2 top-2 rounded-full bg-[#f59e0b] p-1.5">
                        <Plus size={16} className="rotate-45 text-white" />
                      </div>
                    ) : null}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-black/15 bg-white px-4 py-8 text-center text-sm text-[#6b7280]">
              Type a destination to load city suggestions.
            </div>
          )}
        </div>

        {statusMessage ? (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
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
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Save & Continue to Itinerary"}
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
