"use client";

import { useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, Plus } from "lucide-react";

import { DashboardPage } from "@/components/layout/dashboard-page";
import { Card } from "@/components/ui/card";
import {
  getLastStoredTripId,
  subscribeToTripStorage,
} from "@/features/trips/lib/storage";

export function TripItinerary() {
  const router = useRouter();
  const latestTripId = useSyncExternalStore(
    subscribeToTripStorage,
    getLastStoredTripId,
    () => null,
  );

  useEffect(() => {
    if (latestTripId) {
      router.replace(`/trip-itinerary/${latestTripId}`);
    }
  }, [latestTripId, router]);

  return (
    <DashboardPage>
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="max-w-2xl space-y-6 p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#0d6e6e]/10 text-[#0d6e6e]">
            <Calendar size={24} />
          </div>

          <div className="space-y-3">
            <h1 className="text-[28px] font-bold text-[#1a1a2e]">
              {latestTripId
                ? "Opening your latest itinerary"
                : "No saved trip itinerary yet"}
            </h1>
            <p className="text-sm leading-6 text-[#6b7280]">
              {latestTripId
                ? "Checking local storage for your most recent trip."
                : "Create a trip first, then this page will open the latest saved itinerary automatically."}
            </p>
          </div>

          {latestTripId ? null : (
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/create-trip"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#f59e0b] px-4 text-[14px] font-medium text-[#1a1a2e] transition-all duration-200 hover:bg-[#e58e0a]"
              >
                <Plus size={16} />
                Create Trip
              </Link>
              <Link
                href="/my-trips"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border-2 border-[#0d6e6e] px-4 text-[14px] font-medium text-[#0d6e6e] transition-all duration-200 hover:bg-[#0d6e6e]/5"
              >
                <MapPin size={16} />
                View My Trips
              </Link>
            </div>
          )}
        </Card>
      </div>
    </DashboardPage>
  );
}
