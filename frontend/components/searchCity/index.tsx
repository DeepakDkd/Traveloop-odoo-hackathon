"use client";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import dynamic from "next/dynamic";
import { Clock, ExternalLink, MapPin, Phone, Plus } from "lucide-react";

import "leaflet/dist/leaflet.css";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { createTripStopId } from "@/features/trips/lib/storage";
import type { TripStop } from "@/features/trips/lib/types";

const MapContainer = dynamic(
  () => import("react-leaflet").then((module) => module.MapContainer),
  { ssr: false },
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((module) => module.TileLayer),
  { ssr: false },
);

const Marker = dynamic(
  () => import("react-leaflet").then((module) => module.Marker),
  { ssr: false },
);

const Popup = dynamic(
  () => import("react-leaflet").then((module) => module.Popup),
  { ssr: false },
);

const GEOAPIFY_KEY =
  process.env.NEXT_PUBLIC_GEOAPIFY_KEY ?? "458a639d9c464ddea7aa44dc003d3ccd";

const CATEGORY_META = {
  "entertainment.museum": {
    label: "Museum",
    color: "#6c5ce7",
  },
  "tourism.sights": {
    label: "Landmark",
    color: "#e17055",
  },
  "tourism.attraction": {
    label: "Attraction",
    color: "#fd79a8",
  },
  "tourism.sights.place_of_worship": {
    label: "Place of worship",
    color: "#a29bfe",
  },
  "leisure.park": {
    label: "Park",
    color: "#00b894",
  },
  natural: {
    label: "Nature",
    color: "#55efc4",
  },
  "natural.water": {
    label: "Lake or river",
    color: "#74b9ff",
  },
  "natural.forest": {
    label: "Forest",
    color: "#00cec9",
  },
  heritage: {
    label: "Heritage",
    color: "#fdcb6e",
  },
} as const;

type GeoapifyGeocodeResponse = {
  features?: Array<{
    geometry: {
      coordinates: [number, number];
    };
  }>;
};

type GeoapifyPlacesResponse = {
  features?: Array<{
    geometry: {
      coordinates: [number, number];
    };
    properties?: {
      name?: string;
      formatted?: string;
      categories?: string[];
      datasource?: {
        raw?: Record<string, string>;
      };
    };
  }>;
};

type PlaceResult = {
  id: string;
  city: string;
  name: string;
  label: string;
  color: string;
  trending: boolean;
  address: string;
  openingHours: string;
  website: string;
  wikipedia: string;
  phone: string;
  lat: number;
  lon: number;
};

type SearchCityProps = {
  title?: string;
  description?: string;
  selectedStopIds?: string[];
  onToggleStop?: (stop: TripStop) => void;
  showMap?: boolean;
  showTrending?: boolean;
  className?: string;
};

function getCategoryMeta(categories: string[]) {
  for (const category of categories) {
    const entry = Object.entries(CATEGORY_META).find(([key]) => key === category);

    if (entry) {
      return entry[1];
    }
  }

  return {
    label: "Point of interest",
    color: "#94a3b8",
  };
}

function wikiUrl(wikiTag: string) {
  if (!wikiTag) {
    return "";
  }

  if (wikiTag.startsWith("http")) {
    return wikiTag;
  }

  if (wikiTag.includes(":")) {
    const [language, title] = wikiTag.split(":");
    return `https://${language}.wikipedia.org/wiki/${encodeURIComponent(title)}`;
  }

  return `https://en.wikipedia.org/wiki/${encodeURIComponent(wikiTag)}`;
}

function mapPlaceToTripStop(place: PlaceResult): TripStop {
  return {
    id: place.id,
    kind: "place",
    city: place.city,
    name: place.name,
    subtitle: place.label,
    address: place.address,
    lat: place.lat,
    lon: place.lon,
    website: place.website,
    phone: place.phone,
    wikipedia: place.wikipedia,
    openingHours: place.openingHours,
    categoryColor: place.color,
  };
}

export function SearchCity({
  title = "Select places to explore",
  description = "Search for landmarks, attractions, and local highlights to add to the trip.",
  selectedStopIds = [],
  onToggleStop,
  showMap = false,
  showTrending = false,
  className,
}: SearchCityProps) {
  const [placeQuery, setPlaceQuery] = useState("");
  const [places, setPlaces] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [center, setCenter] = useState({ lat: 20.5937, lon: 78.9629 });
  const [activeCity, setActiveCity] = useState("");

  const selectedIdSet = useMemo(() => new Set(selectedStopIds), [selectedStopIds]);
  const trendingPlaces = useMemo(
    () => places.filter((item) => item.trending),
    [places],
  );
  const isSelectable = typeof onToggleStop === "function";

  useEffect(() => {
    let isCancelled = false;

    void import("leaflet").then((leaflet) => {
      if (isCancelled) {
        return;
      }

      const defaultIcon = leaflet.Icon.Default.prototype as {
        _getIconUrl?: string;
      };

      delete defaultIcon._getIconUrl;

      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
    });

    return () => {
      isCancelled = true;
    };
  }, []);

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedQuery = placeQuery.trim();

    if (!normalizedQuery) {
      setError("Please enter a city or place name.");
      return;
    }

    setLoading(true);
    setError("");
    setPlaces([]);

    try {
      const geoResponse = await fetch(
        `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
          normalizedQuery,
        )}&limit=1&apiKey=${GEOAPIFY_KEY}`,
      );

      const geoData = (await geoResponse.json()) as GeoapifyGeocodeResponse;
      const features = geoData.features ?? [];

      if (features.length === 0) {
        setError("Place not found.");
        setLoading(false);
        return;
      }

      const [lon, lat] = features[0].geometry.coordinates;

      setCenter({ lat, lon });
      setActiveCity(normalizedQuery);

      const placesResponse = await fetch(
        `https://api.geoapify.com/v2/places?categories=tourism.sights,tourism.attraction,entertainment.museum,leisure.park,natural,heritage,building.tourism&filter=circle:${lon},${lat},15000&limit=60&lang=en&apiKey=${GEOAPIFY_KEY}`,
      );

      const placesData = (await placesResponse.json()) as GeoapifyPlacesResponse;

      const formattedPlaces =
        placesData.features?.flatMap((feature) => {
          const properties = feature.properties ?? {};
          const placeName = properties.name?.trim();

          if (!placeName) {
            return [];
          }

          const raw = properties.datasource?.raw ?? {};
          const categories = properties.categories ?? [];
          const categoryMeta = getCategoryMeta(categories);
          const [resultLon, resultLat] = feature.geometry.coordinates;
          const address = properties.formatted ?? "";

          return [
            {
              id: createTripStopId(
                "place",
                placeName,
                normalizedQuery,
                address,
                resultLat,
                resultLon,
              ),
              city: normalizedQuery,
              name: placeName,
              label: categoryMeta.label,
              color: categoryMeta.color,
              trending: Boolean(raw.wikipedia || raw.opening_hours),
              address,
              openingHours: raw.opening_hours ?? "",
              website: raw.website ?? "",
              wikipedia: wikiUrl(raw.wikipedia ?? ""),
              phone: raw.phone ?? "",
              lat: resultLat,
              lon: resultLon,
            },
          ] satisfies PlaceResult[];
        }) ?? [];

      console.log("Searching city:", normalizedQuery);
      console.log("Found places:", formattedPlaces);

      setPlaces(formattedPlaces);
    } catch (searchError) {
      console.error(searchError);
      setError("Something went wrong while loading places.");
    }

    setLoading(false);
  }

  return (
    <section className={cn("space-y-5", className)}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0d6e6e]">
            Places
          </p>
          <h2 className="mt-2 text-[22px] font-semibold text-[#1a1a2e]">
            {title}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-[#6b7280]">{description}</p>
        </div>

        {isSelectable ? (
          <span className="rounded-full bg-[#f59e0b]/15 px-3 py-1 text-sm font-medium text-[#a16207]">
            {selectedStopIds.filter((id) => id.startsWith("place:")).length} place
            {selectedStopIds.filter((id) => id.startsWith("place:")).length === 1
              ? ""
              : "s"}{" "}
            selected
          </span>
        ) : null}
      </div>

      <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          placeholder="Search any city"
          value={placeQuery}
          onChange={(event) => setPlaceQuery(event.target.value)}
          className="h-11 flex-1 rounded-xl border border-black/10 bg-white px-4 text-sm text-[#1a1a2e] outline-none transition-all duration-200 placeholder:text-[#6b7280] focus:border-[#0d6e6e] focus:ring-2 focus:ring-[#0d6e6e]/15"
        />

        <Button type="submit" variant="primary" className="sm:min-w-[140px]">
          {loading ? "Searching..." : "Find Places"}
        </Button>
      </form>

      {activeCity ? (
        <p className="text-sm text-[#4b5563]">Showing places around {activeCity}</p>
      ) : null}

      {error ? (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-[#dc2626]">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-dashed border-black/10 bg-white px-5 py-8 text-center text-sm text-[#6b7280]">
          Searching places...
        </div>
      ) : null}

      {showMap && places.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-black/10 shadow-[0_4px_16px_rgba(15,23,42,0.08)]">
          <MapContainer
            center={[center.lat, center.lon]}
            zoom={12}
            scrollWheelZoom
            className="h-[420px] w-full"
            key={`${center.lat}-${center.lon}`}
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {places.map((place) => (
              <Marker key={place.id} position={[place.lat, place.lon]}>
                <Popup>
                  <div className="space-y-2 text-sm">
                    <h3 className="font-semibold text-[#1a1a2e]">{place.name}</h3>
                    <p>{place.label}</p>
                    <p>{place.address}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      ) : null}

      {showTrending && trendingPlaces.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-[#1a1a2e]">Trending picks</h3>
            <span className="text-sm text-[#6b7280]">
              {trendingPlaces.length} highlighted stops
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {trendingPlaces.map((place) => (
              <PlaceCard
                key={`trending-${place.id}`}
                place={place}
                isSelectable={isSelectable}
                isSelected={selectedIdSet.has(place.id)}
                onToggleStop={onToggleStop}
                compact
              />
            ))}
          </div>
        </div>
      ) : null}

      {places.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-[#1a1a2e]">All places</h3>
            <span className="text-sm text-[#6b7280]">{places.length} results</span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {places.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                isSelectable={isSelectable}
                isSelected={selectedIdSet.has(place.id)}
                onToggleStop={onToggleStop}
              />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function PlaceCard({
  place,
  isSelectable,
  isSelected,
  onToggleStop,
  compact = false,
}: {
  place: PlaceResult;
  isSelectable: boolean;
  isSelected: boolean;
  onToggleStop?: (stop: TripStop) => void;
  compact?: boolean;
}) {
  const tripStop = mapPlaceToTripStop(place);

  return (
    <Card
      className={cn(
        "h-full p-5",
        isSelected && "border-[#f59e0b] ring-2 ring-[#f59e0b]/20",
      )}
    >
      <div className="flex h-full flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div
              className="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
              style={{
                backgroundColor: `${place.color}20`,
                color: place.color,
              }}
            >
              {place.label}
            </div>
            <h3
              className={cn(
                "mt-3 font-semibold text-[#1a1a2e]",
                compact ? "text-base" : "text-lg",
              )}
            >
              {place.name}
            </h3>
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

        <InfoLine icon={<MapPin size={14} />} label={place.address} />

        {place.openingHours ? (
          <InfoLine icon={<Clock size={14} />} label={place.openingHours} />
        ) : null}

        <div className="mt-auto flex flex-wrap gap-3 text-sm">
          {place.phone ? (
            <span className="inline-flex items-center gap-2 text-[#4b5563]">
              <Phone size={14} />
              {place.phone}
            </span>
          ) : null}

          {place.website ? (
            <a
              href={place.website}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-[#0d6e6e] hover:underline"
            >
              <ExternalLink size={14} />
              Website
            </a>
          ) : null}

          {place.wikipedia ? (
            <a
              href={place.wikipedia}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-[#0d6e6e] hover:underline"
            >
              <ExternalLink size={14} />
              Wikipedia
            </a>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

function InfoLine({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <p className="flex items-start gap-2 text-sm leading-6 text-[#4b5563]">
      <span className="mt-1 text-[#0d6e6e]">{icon}</span>
      <span>{label}</span>
    </p>
  );
}

export default SearchCity;
