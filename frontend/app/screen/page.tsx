"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";

const GEOAPIFY_KEY = "458a639d9c464ddea7aa44dc003d3ccd";

const PRICE_DEFAULTS = {
  hotel: "$80 – $250 / night",
  guest_house: "$40 – $90 / night",
  hostel: "$15 – $40 / night",
};

type Hotel = {
  name: string;
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

type HotelCategory = "hotel" | "guest_house" | "hostel";

type GeoResult = {
  lat: number;
  lon: number;
  name: string;
};

type GeocodeFeature = {
  geometry: {
    coordinates: [number, number];
  };
  properties: {
    city?: string;
    name?: string;
  };
};

type GeocodeResponse = {
  features?: GeocodeFeature[];
};

type OpenMeteoResult = {
  latitude: number;
  longitude: number;
  name: string;
  country: string;
};

type OpenMeteoResponse = {
  results?: OpenMeteoResult[];
};

type HotelFeature = {
  geometry: {
    coordinates: [number, number];
  };
  properties: {
    name?: string;
    formatted?: string;
    categories?: string[];
    datasource?: {
      raw?: {
        stars?: string;
        price_range?: string;
        website?: string;
        phone?: string;
        "contact:phone"?: string;
      };
    };
  };
};

type HotelSearchResponse = {
  features?: HotelFeature[];
};

export default function Home() {
  const [cityName, setCityName] = useState<string>("");
  const [resolvedCity, setResolvedCity] = useState<string>("");
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // ─────────────────────────────────────────────
  // GEOCODING
  // ─────────────────────────────────────────────
  const geocodeCity = async (city: string): Promise<GeoResult | null> => {
    try {
      // Geoapify
      let response = await fetch(
        `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
          city
        )}&limit=1&type=city&apiKey=${GEOAPIFY_KEY}`
      );

      const geocodeData: GeocodeResponse = await response.json();

      const geocodeFeatures = geocodeData.features ?? [];

      if (geocodeFeatures.length > 0) {
        const feature = geocodeFeatures[0];

        const [lon, lat] = feature.geometry.coordinates;

        return {
          lat,
          lon,
          name:
            feature.properties.city ||
            feature.properties.name ||
            city,
        };
      }

      // Open-Meteo fallback
      response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          city
        )}&count=1&language=en&format=json`
      );

      const openMeteoData: OpenMeteoResponse = await response.json();

      const openMeteoResults = openMeteoData.results ?? [];

      if (openMeteoResults.length > 0) {
        const result = openMeteoResults[0];

        return {
          lat: result.latitude,
          lon: result.longitude,
          name: `${result.name}, ${result.country}`,
        };
      }

      return null;
    } catch (err) {
      console.error("Geocoding failed:", err);
      return null;
    }
  };

  // ─────────────────────────────────────────────
  // HOTEL SEARCH
  // ─────────────────────────────────────────────
  const searchHotels = async (
    lat: number,
    lon: number
  ): Promise<Hotel[]> => {
    try {
      const response = await fetch(
        `https://api.geoapify.com/v2/places?categories=accommodation.hotel,accommodation.guest_house,accommodation.hostel&filter=circle:${lon},${lat},20000&limit=40&apiKey=${GEOAPIFY_KEY}`
      );

      const data: HotelSearchResponse = await response.json();

      return (
        data.features?.map((feature: HotelFeature) => {
          const props = feature.properties;

          let type: HotelCategory = "hotel";

          const categories = props.categories || [];

          for (const cat of categories) {
            if (cat.includes("hostel")) {
              type = "hostel";
              break;
            }

            if (cat.includes("guest_house")) {
              type = "guest_house";
              break;
            }
          }

          const raw = props.datasource?.raw || {};

          const stars = raw.stars
            ? parseInt(raw.stars)
            : null;

          return {
            name: props.name || "Unnamed hotel",
            type: type.replace("_", " "),
            stars,
            ratingText: stars
              ? `${stars} Stars`
              : "Not rated",
            priceRange:
              raw.price_range ||
              PRICE_DEFAULTS[type],
            address: props.formatted || "",
            website: raw.website || "",
            phone:
              raw.phone ||
              raw["contact:phone"] ||
              "",
            lat: feature.geometry.coordinates[1],
            lon: feature.geometry.coordinates[0],
          };
        }) || []
      );
    } catch (err) {
      console.error("Hotel search failed:", err);
      return [];
    }
  };

  // ─────────────────────────────────────────────
  // FORM SUBMIT
  // ─────────────────────────────────────────────
  const handleSearch = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setHotels([]);
    setResolvedCity("");

    if (!cityName.trim()) {
      setError("Please enter a city name.");
      setLoading(false);
      return;
    }

    const geo = await geocodeCity(cityName);

    if (!geo) {
      setError(
        `Could not find "${cityName}".`
      );
      setLoading(false);
      return;
    }

    setResolvedCity(geo.name);

    const hotelResults = await searchHotels(
      geo.lat,
      geo.lon
    );

    if (hotelResults.length === 0) {
      setError(
        `No hotels found near "${geo.name}".`
      );
    }

    setHotels(hotelResults);
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">
          Hotel Finder
        </h1>

        <form
          onSubmit={handleSearch}
          className="flex gap-4 mb-8"
        >
          <input
            type="text"
            placeholder="Enter city name"
            value={cityName}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setCityName(e.target.value)
            }
            className="flex-1 border rounded-lg p-3"
          />

          <button
            type="submit"
            className="bg-black text-white px-6 py-3 rounded-lg"
          >
            Search
          </button>
        </form>

        {loading && (
          <p className="text-lg">
            Searching hotels...
          </p>
        )}

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {resolvedCity && (
          <h2 className="text-2xl font-semibold mb-6">
            Hotels in {resolvedCity}
          </h2>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {hotels.map((hotel, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow p-6"
            >
              <h3 className="text-2xl font-bold mb-2">
                {hotel.name}
              </h3>

              <p className="capitalize text-gray-600">
                {hotel.type}
              </p>

              <p className="mt-2">
                ⭐ {hotel.ratingText}
              </p>

              <p className="mt-2">
                💰 {hotel.priceRange}
              </p>

              <p className="mt-2">
                📍 {hotel.address}
              </p>

              {hotel.phone && (
                <p className="mt-2">
                  📞 {hotel.phone}
                </p>
              )}

              {hotel.website && (
                <a
                  href={hotel.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block mt-4 text-blue-600 underline"
                >
                  Visit Website
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
