"use client";

import SearchCity from "@/components/searchCity";

export default function PlacesScreenPage() {
  return (
    <main className="min-h-screen bg-[#f8f9fa] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <SearchCity
          title="Places Explorer"
          description="Search landmarks, attractions, museums, parks, and other interesting places by city."
          showMap
          showTrending
        />
      </div>
    </main>
  );
}
