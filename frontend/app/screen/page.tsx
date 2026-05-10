"use client";

import SearchHotels from "@/components/searchHotels";

export default function HotelsScreenPage() {
  return (
    <main className="min-h-screen bg-[#f8f9fa] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <SearchHotels
          title="Hotel Finder"
          description="Search for hotels, guest houses, and hostels by city."
        />
      </div>
    </main>
  );
}
