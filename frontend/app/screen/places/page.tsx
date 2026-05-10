"use client";

import { useState } from "react";
import axios from "axios";
import dynamic from "next/dynamic";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

import "leaflet/dist/leaflet.css";

if (typeof window !== "undefined") {
  const L = require("leaflet");

  delete L.Icon.Default.prototype._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

    iconUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

    shadowUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

const GEOAPIFY_KEY =
  process.env.NEXT_PUBLIC_GEOAPIFY_KEY || "458a639d9c464ddea7aa44dc003d3ccd";

const CATEGORY_META = {
  "entertainment.museum": [
    "🏛️",
    "Museum",
    "#6c5ce7",
  ],

  "tourism.sights": [
    "🏰",
    "Landmark",
    "#e17055",
  ],

  "tourism.attraction": [
    "🎯",
    "Attraction",
    "#fd79a8",
  ],

  "tourism.sights.place_of_worship": [
    "⛪",
    "Place of Worship",
    "#a29bfe",
  ],

  "leisure.park": [
    "🌳",
    "Park",
    "#00b894",
  ],

  natural: [
    "🌿",
    "Nature",
    "#55efc4",
  ],

  "natural.water": [
    "💧",
    "Lake / River",
    "#74b9ff",
  ],

  "natural.forest": [
    "🌲",
    "Forest",
    "#00cec9",
  ],

  heritage: [
    "🏺",
    "Heritage",
    "#fdcb6e",
  ],
};

function getCategoryMeta(categories = []) {
  for (const cat of categories) {
    for (const key in CATEGORY_META) {
      if (cat === key) {
        return CATEGORY_META[key];
      }
    }
  }

  return [
    "📍",
    "Point of Interest",
    "#dfe6e9",
  ];
}

function wikiUrl(wikiTag) {
  if (!wikiTag) return "";

  if (wikiTag.startsWith("http")) {
    return wikiTag;
  }

  if (wikiTag.includes(":")) {
    const [lang, title] =
      wikiTag.split(":");

    return `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(
      title
    )}`;
  }

  return `https://en.wikipedia.org/wiki/${encodeURIComponent(
    wikiTag
  )}`;
}

export default function Home() {
  const [place, setPlace] =
    useState("");

  const [places, setPlaces] =
    useState([]);

  const [trending, setTrending] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [center, setCenter] =
    useState({
      lat: 20.5937,
      lon: 78.9629,
    });

  async function handleSearch(e) {
    e.preventDefault();

    if (!place.trim()) {
      setError(
        "Please enter a place name"
      );
      return;
    }

    setLoading(true);

    setError("");

    setPlaces([]);

    try {
      console.log("Searching city:", place);
      // ── Geocoding ───────────────────────
      const geoResponse =
        await axios.get(
          "https://api.geoapify.com/v1/geocode/search",
          {
            params: {
              text: place,
              limit: 1,
              apiKey: GEOAPIFY_KEY,
            },
          }
        );

      const features =
        geoResponse.data.features;

      if (!features.length) {
        setError("Place not found");
        setLoading(false);
        return;
      }

      const feature =
        features[0];

      const lat =
        feature.geometry
          .coordinates[1];

      const lon =
        feature.geometry
          .coordinates[0];

      setCenter({
        lat,
        lon,
      });

      // ── Places Search ──────────────────
      const placesResponse =
        await axios.get(
          "https://api.geoapify.com/v2/places",
          {
            params: {
              categories:
                "tourism.sights,tourism.attraction,entertainment.museum,leisure.park,natural,heritage,building.tourism",

              filter: `circle:${lon},${lat},15000`,

              limit: 60,

              apiKey: GEOAPIFY_KEY,

              lang: "en",
            },
          }
        );

      const formattedPlaces =
        placesResponse.data.features
          .map((feat) => {
            const props =
              feat.properties ||
              {};

            const name =
              props.name?.trim() ||
              "";

            if (!name) return null;

            const raw =
              props.datasource
                ?.raw || {};

            const categories =
              props.categories ||
              [];

            const [
              icon,
              label,
              color,
            ] =
              getCategoryMeta(
                categories
              );

            const wikipedia =
              raw.wikipedia ||
              raw.wikidata;

            const trending =
              Boolean(
                wikipedia ||
                  raw.opening_hours
              );

            return {
              name,

              icon,

              label,

              color,

              trending,

              address:
                props.formatted ||
                "",

              opening_hours:
                raw.opening_hours ||
                "",

              website:
                raw.website ||
                "",

              wikipedia:
                wikiUrl(
                  raw.wikipedia ||
                    ""
                ),

              phone:
                raw.phone ||
                "",

              lat:
                feat.geometry
                  .coordinates[1],

              lon:
                feat.geometry
                  .coordinates[0],
            };
          })
          .filter(Boolean);

      console.log("Found places:", formattedPlaces);

      setPlaces(formattedPlaces);

      setTrending(
        formattedPlaces.filter(
          (p) => p.trending
        )
      );
    } catch (err) {
      console.error(err);

      setError(
        "Something went wrong"
      );
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">

        <h1 className="text-5xl font-bold mb-8 text-center">
          🌍 Places Explorer
        </h1>

        <form
          onSubmit={handleSearch}
          className="flex gap-4 mb-8"
        >
          <input
            type="text"
            placeholder="Search any city..."
            value={place}
            onChange={(e) =>
              setPlace(
                e.target.value
              )
            }
            className="flex-1 p-4 rounded-xl border border-gray-300 outline-none"
          />

          <button
            type="submit"
            className="bg-black text-white px-8 rounded-xl hover:bg-gray-800"
          >
            Search
          </button>
        </form>

        {error && (
          <div className="bg-red-100 text-red-600 p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center text-xl">
            Loading...
          </div>
        )}

        {/* ── MAP ───────────────────────── */}
        <div className="mb-10 rounded-2xl overflow-hidden shadow-lg">
          <MapContainer
            center={[
              center.lat,
              center.lon,
            ]}
            zoom={12}
            scrollWheelZoom={true}
            className="h-[500px] w-full"
            key={`${center.lat}-${center.lon}`}
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {places.map(
              (place, index) => (
                <Marker
                  key={`${place.lat}-${place.lon}-${place.name}`}
                  position={[
                    place.lat,
                    place.lon,
                  ]}
                >
                  <Popup>
                    <div className="space-y-2">
                      <h3 className="font-bold text-lg">
                        {place.name}
                      </h3>

                      <p>
                        {place.label}
                      </p>

                      <p>
                        {
                          place.address
                        }
                      </p>

                      {place.website && (
                        <a
                          href={
                            place.website
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500"
                        >
                          Website
                        </a>
                      )}
                    </div>
                  </Popup>
                </Marker>
              )
            )}
          </MapContainer>
        </div>

        {/* ── TRENDING ─────────────────── */}
        {trending.length > 0 && (
          <>
            <h2 className="text-3xl font-bold mb-6">
              🔥 Trending Places
            </h2>

            <div className="grid md:grid-cols-4 gap-6 mb-12">
              {trending.map(
                (place, index) => (
                  <div
                    key={`trending-${place.lat}-${place.lon}-${place.name}`}
                    className="bg-white rounded-2xl p-5 shadow"
                  >
                    <div className="text-4xl mb-3">
                      {place.icon}
                    </div>

                    <h3 className="font-bold text-lg">
                      {place.name}
                    </h3>

                    <p className="text-gray-500">
                      {place.label}
                    </p>
                  </div>
                )
              )}
            </div>
          </>
        )}

        {/* ── ALL PLACES ───────────────── */}
        {places.length > 0 && (
          <>
            <h2 className="text-3xl font-bold mb-6">
              📍 All Places
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {places.map(
                (place, index) => (
                  <div
                    key={`place-${place.lat}-${place.lon}-${place.name}`}
                    className="bg-white rounded-2xl p-5 shadow-lg"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-4xl">
                        {place.icon}
                      </div>

                      <div
                        className="px-3 py-1 rounded-full text-white text-sm"
                        style={{
                          background:
                            place.color,
                        }}
                      >
                        {
                          place.label
                        }
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold mb-2">
                      {place.name}
                    </h3>

                    <p className="text-gray-600 mb-3">
                      {
                        place.address
                      }
                    </p>

                    {place.opening_hours && (
                      <p className="text-sm mb-2">
                        🕒{" "}
                        {
                          place.opening_hours
                        }
                      </p>
                    )}

                    {place.phone && (
                      <p className="text-sm mb-2">
                        📞{" "}
                        {place.phone}
                      </p>
                    )}

                    <div className="flex gap-4 mt-4">
                      {place.website && (
                        <a
                          href={
                            place.website
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500"
                        >
                          Website
                        </a>
                      )}

                      {place.wikipedia && (
                        <a
                          href={
                            place.wikipedia
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600"
                        >
                          Wikipedia
                        </a>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
