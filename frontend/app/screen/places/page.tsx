"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";

type PlaceData = {
  icon: string;
  name: string;
  label: string;
  address: string;
  website?: string;
};

type ApiResponse = {
  placeName: string;
  places: PlaceData[];
  trending: PlaceData[];
};

export default function PlacesPage() {
  const [place, setPlace] = useState<string>("");
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  async function handleSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setError("");
    setData(null);

    try {
      const res = await fetch("/api/places", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ place }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || "An error occurred");
      } else {
        setData(result);
      }
    } catch (err) {
      setError("Something went wrong");
      console.error(err);
    }

    setLoading(false);
  }

  return (
    <main className="p-8">
      <h1 className="text-4xl font-bold mb-6">
        Places Explorer
      </h1>

      <form
        onSubmit={handleSearch}
        className="flex gap-4 mb-8"
      >
        <input
          type="text"
          placeholder="Enter city"
          value={place}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setPlace(e.target.value)
          }
          className="border p-3 rounded w-full"
        />

        <button
          type="submit"
          className="bg-black text-white px-6 rounded"
        >
          Search
        </button>
      </form>

      {loading && <p>Loading...</p>}

      {error && (
        <p className="text-red-500">{error}</p>
      )}

      {data && (
        <div>
          <h2 className="text-2xl font-bold mb-4">
            {data.placeName}
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            {data.places.map((place, index) => (
              <div
                key={index}
                className="border rounded-xl p-4 shadow"
              >
                <div className="text-3xl">
                  {place.icon}
                </div>

                <h3 className="font-bold text-lg">
                  {place.name}
                </h3>

                <p>{place.label}</p>

                <p className="text-sm mt-2">
                  {place.address}
                </p>

                {place.website && (
                  <a
                    href={place.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-500"
                  >
                    Website
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}