"use client";

import {
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import { BedDouble, ExternalLink, MapPin, Phone, Plus, Search, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  createTripStopId,
} from "@/features/trips/lib/storage";
import type { TripStop } from "@/features/trips/lib/types";

const GEOAPIFY_KEY =
  process.env.NEXT_PUBLIC_GEOAPIFY_KEY ?? "458a639d9c464ddea7aa44dc003d3ccd";

const PRICE_DEFAULTS = {
  hotel: "$80 - $250 / night",
  guest_house: "$40 - $90 / night",
  hostel: "$15 - $40 / night",
} as const;

type GeoResult = {
  lat: number;
  lon: number;
  name: string;
};

type GeoapifyGeocodeResponse = {
  features?: Array<{
    geometry: {
      coordinates: [number, number];
    };
    properties: {
      city?: string;
      name?: string;
    };
  }>;
};

type OpenMeteoResponse = {
  results?: Array<{
    latitude: number;
    longitude: number;
    name: string;
    country?: string;
  }>;
};

type GeoapifyPlacesResponse = {
  features?: Array<{
    geometry: {
      coordinates: [number, number];
    };
    properties: {
      name?: string;
      formatted?: string;
      categories?: string[];
      datasource?: {
        raw?: Record<string, string>;
      };
    };
  }>;
};

type HotelResult = {
  id: string;
  name: string;
  city: string;
  type: string;
  stars: number | null;
  ratingText: string;
  priceRange: string;
  address: string;
  website: string;
  phone: string;
  lat: number;
  lon: number;
};

type SearchHotelsProps = {
  title?: string;
  description?: string;
  selectedStopIds?: string[];
  onToggleStop?: (stop: TripStop) => void;
  className?: string;
};

async function geocodeCity(city: string): Promise<GeoResult | null> {
  try {
    let response = await fetch(
      `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
        city,
      )}&limit=1&type=city&apiKey=${GEOAPIFY_KEY}`,
    );

    const geoapifyData = (await response.json()) as GeoapifyGeocodeResponse;

    if (geoapifyData.features?.length) {
      const feature = geoapifyData.features[0];
      const [lon, lat] = feature.geometry.coordinates;

      return {
        lat,
        lon,
        name: feature.properties.city || feature.properties.name || city,
      };
    }

    response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        city,
      )}&count=1&language=en&format=json`,
    );

    const openMeteoData = (await response.json()) as OpenMeteoResponse;

    if (openMeteoData.results?.length) {
      const result = openMeteoData.results[0];

      return {
        lat: result.latitude,
        lon: result.longitude,
        name: `${result.name}, ${result.country ?? ""}`.replace(/, $/, ""),
      };
    }

    return null;
  } catch (error) {
    console.error("Hotel geocoding failed:", error);
    return null;
  }
}

async function searchHotels(lat: number, lon: number, city: string) {
  try {
    const response = await fetch(
      `https://api.geoapify.com/v2/places?categories=accommodation.hotel,accommodation.guest_house,accommodation.hostel&filter=circle:${lon},${lat},20000&limit=40&apiKey=${GEOAPIFY_KEY}`,
    );

    const data = (await response.json()) as GeoapifyPlacesResponse;

    return (
      data.features?.flatMap((feature) => {
        const properties = feature.properties;
        const hotelName = properties.name?.trim();

        if (!hotelName) {
          return [];
        }

        let hotelType: keyof typeof PRICE_DEFAULTS = "hotel";
        const categories = properties.categories ?? [];

        for (const category of categories) {
          if (category.includes("hostel")) {
            hotelType = "hostel";
            break;
          }

          if (category.includes("guest_house")) {
            hotelType = "guest_house";
            break;
          }
        }

        const raw = properties.datasource?.raw ?? {};
        const starsValue = raw.stars ? Number.parseInt(raw.stars, 10) : null;
        const [resultLon, resultLat] = feature.geometry.coordinates;
        const address = properties.formatted ?? "";

        return [
          {
            id: createTripStopId(
              "hotel",
              hotelName,
              city,
              address,
              resultLat,
              resultLon,
            ),
            name: hotelName,
            city,
            type: hotelType.replace("_", " "),
            stars: Number.isNaN(starsValue) ? null : starsValue,
            ratingText: starsValue ? `${starsValue} star` : "Not rated",
            priceRange: raw.price_range ?? PRICE_DEFAULTS[hotelType],
            address,
            website: raw.website ?? "",
            phone: raw.phone ?? raw["contact:phone"] ?? "",
            lat: resultLat,
            lon: resultLon,
          },
        ] satisfies HotelResult[];
      }) ?? []
    );
  } catch (error) {
    console.error("Hotel search failed:", error);
    return [] as HotelResult[];
  }
}

function mapHotelToTripStop(hotel: HotelResult): TripStop {
  return {
    id: hotel.id,
    kind: "hotel",
    city: hotel.city,
    name: hotel.name,
    subtitle: hotel.type,
    address: hotel.address,
    lat: hotel.lat,
    lon: hotel.lon,
    website: hotel.website,
    phone: hotel.phone,
    priceLabel: hotel.priceRange,
    ratingLabel: hotel.ratingText,
  };
}

export function SearchHotels({
  title = "Select hotels",
  description = "Search by city and add one or more stays to the trip.",
  selectedStopIds = [],
  onToggleStop,
  className,
}: SearchHotelsProps) {
  const [cityName, setCityName] = useState("");
  const [resolvedCity, setResolvedCity] = useState("");
  const [hotels, setHotels] = useState<HotelResult[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedIdSet = useMemo(() => new Set(selectedStopIds), [selectedStopIds]);
  const isSelectable = typeof onToggleStop === "function";

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedCity = cityName.trim();

    if (!normalizedCity) {
      setError("Please enter a city name.");
      return;
    }

    setLoading(true);
    setError("");
    setHotels([]);
    setResolvedCity("");

    const geo = await geocodeCity(normalizedCity);

    if (!geo) {
      setError(`Could not find "${normalizedCity}".`);
      setLoading(false);
      return;
    }

    setResolvedCity(geo.name);

    const hotelResults = await searchHotels(geo.lat, geo.lon, geo.name);

    if (hotelResults.length === 0) {
      setError(`No hotels found near "${geo.name}".`);
    }

    setHotels(hotelResults);
    setLoading(false);
  }

  return (
    <section className={cn("space-y-5", className)}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0d6e6e]">
            Hotels
          </p>
          <h2 className="mt-2 text-[22px] font-semibold text-[#1a1a2e]">
            {title}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-[#6b7280]">{description}</p>
        </div>

        {isSelectable ? (
          <span className="rounded-full bg-[#f59e0b]/15 px-3 py-1 text-sm font-medium text-[#a16207]">
            {selectedStopIds.filter((id) => id.startsWith("hotel:")).length} hotel
            {selectedStopIds.filter((id) => id.startsWith("hotel:")).length === 1
              ? ""
              : "s"}{" "}
            selected
          </span>
        ) : null}
      </div>

      <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]"
          />
          <input
            type="search"
            value={cityName}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setCityName(event.target.value)
            }
            placeholder="Search hotels by city"
            className="h-11 w-full rounded-xl border border-black/10 bg-white pl-10 pr-3 text-sm text-[#1a1a2e] outline-none transition-all duration-200 placeholder:text-[#6b7280] focus:border-[#0d6e6e] focus:ring-2 focus:ring-[#0d6e6e]/15"
          />
        </div>

        <Button type="submit" variant="primary" className="sm:min-w-[140px]">
          {loading ? "Searching..." : "Find Hotels"}
        </Button>
      </form>

      {resolvedCity ? (
        <p className="text-sm text-[#4b5563]">Showing stays near {resolvedCity}</p>
      ) : null}

      {error ? (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-[#dc2626]">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-dashed border-black/10 bg-white px-5 py-8 text-center text-sm text-[#6b7280]">
          Searching hotels...
        </div>
      ) : null}

      {hotels.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {hotels.map((hotel) => {
            const isSelected = selectedIdSet.has(hotel.id);
            const tripStop = mapHotelToTripStop(hotel);

            return (
              <Card
                key={hotel.id}
                className={cn(
                  "h-full p-5",
                  isSelected && "border-[#f59e0b] ring-2 ring-[#f59e0b]/20",
                )}
              >
                <div className="flex h-full flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-[#1a1a2e]">
                        {hotel.name}
                      </h3>
                      <p className="mt-1 flex items-center gap-2 text-sm capitalize text-[#6b7280]">
                        <BedDouble size={14} />
                        {hotel.type}
                      </p>
                    </div>

                    {isSelectable ? (
                      <Button
                        type="button"
                        variant={isSelected ? "secondary" : "primary"}
                        size="sm"
                        onClick={() => onToggleStop?.(tripStop)}
                      >
                        <Plus size={14} className={isSelected ? "rotate-45" : ""} />
                        {isSelected ? "Remove" : "Add"}
                      </Button>
                    ) : null}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <InfoRow icon={<Star size={14} />} label={hotel.ratingText} />
                    <InfoRow icon={<MapPin size={14} />} label={hotel.priceRange} />
                  </div>

                  <p className="text-sm leading-6 text-[#4b5563]">{hotel.address}</p>

                  <div className="mt-auto flex flex-wrap gap-3 text-sm">
                    {hotel.phone ? (
                      <span className="inline-flex items-center gap-2 text-[#4b5563]">
                        <Phone size={14} />
                        {hotel.phone}
                      </span>
                    ) : null}

                    {hotel.website ? (
                      <a
                        href={hotel.website}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-[#0d6e6e] hover:underline"
                      >
                        <ExternalLink size={14} />
                        Website
                      </a>
                    ) : null}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}

function InfoRow({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="rounded-xl bg-[#f8f9fa] px-3 py-3 text-sm text-[#4b5563]">
      <span className="inline-flex items-center gap-2">
        <span className="text-[#0d6e6e]">{icon}</span>
        {label}
      </span>
    </div>
  );
}

export default SearchHotels;
