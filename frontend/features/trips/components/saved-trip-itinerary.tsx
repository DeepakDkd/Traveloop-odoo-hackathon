"use client";

import { useMemo, useSyncExternalStore, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BedDouble,
  Calendar,
  Clock,
  ExternalLink,
  Landmark,
  MapPin,
  NotebookPen,
  Phone,
  Wallet,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DashboardPage } from "@/components/layout/dashboard-page";
import {
  formatTripBudget,
  formatTripDateRange,
  getStoredTripById,
  getTripDestinations,
  getTripStatus,
  getTripStopCounts,
  subscribeToTripStorage,
} from "@/features/trips/lib/storage";
import type { SavedTrip, TripStop } from "@/features/trips/lib/types";

type SavedTripItineraryProps = {
  tripId: string;
};

export function SavedTripItinerary({ tripId }: SavedTripItineraryProps) {
  const trip = useSyncExternalStore(
    subscribeToTripStorage,
    () => getStoredTripById(tripId),
    () => undefined as SavedTrip | null | undefined,
  );

  const groupedStops = useMemo(() => {
    if (!trip) {
      return {
        hotels: [] as TripStop[],
        places: [] as TripStop[],
      };
    }

    return {
      hotels: trip.stops.filter((stop) => stop.kind === "hotel"),
      places: trip.stops.filter((stop) => stop.kind === "place"),
    };
  }, [trip]);

  if (trip === undefined) {
    return (
      <DashboardPage>
        <div className="rounded-2xl border border-dashed border-black/10 bg-white px-5 py-10 text-center text-sm text-[#6b7280]">
          Loading itinerary...
        </div>
      </DashboardPage>
    );
  }

  if (!trip) {
    return (
      <DashboardPage>
        <div className="mx-auto max-w-2xl space-y-6 rounded-3xl border border-dashed border-black/10 bg-white px-6 py-12 text-center">
          <h1 className="text-[28px] font-bold text-[#1a1a2e]">Trip not found</h1>
          <p className="text-sm leading-6 text-[#6b7280]">
            This itinerary is not available in local storage anymore. Create a new
            trip or open one from your saved trips list.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/create-trip"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-[#f59e0b] px-4 text-[14px] font-medium text-[#1a1a2e] transition-all duration-200 hover:bg-[#e58e0a]"
            >
              Create Trip
            </Link>
            <Link
              href="/my-trips"
              className="inline-flex h-10 items-center justify-center rounded-xl border-2 border-[#0d6e6e] px-4 text-[14px] font-medium text-[#0d6e6e] transition-all duration-200 hover:bg-[#0d6e6e]/5"
            >
              My Trips
            </Link>
          </div>
        </div>
      </DashboardPage>
    );
  }

  const status = getTripStatus(trip);
  const stopCounts = getTripStopCounts(trip);
  const destinations = getTripDestinations(trip);

  return (
    <DashboardPage className="pb-16">
      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/my-trips"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-black/10 bg-white text-[#1a1a2e]"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <p className="text-sm font-medium text-[#6b7280]">Saved itinerary</p>
              <h1 className="mt-1 text-[28px] font-bold text-[#1a1a2e]">
                {trip.tripName}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
            <Link
              href="/create-trip"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-[#f59e0b] px-4 text-[14px] font-medium text-[#1a1a2e] transition-all duration-200 hover:bg-[#e58e0a]"
            >
              Create another
            </Link>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <Card className="overflow-hidden p-0">
              <div className="bg-[linear-gradient(135deg,#0d6e6e_0%,#14b8a6_55%,#f59e0b_100%)] px-6 py-8 text-white sm:px-8">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
                  Trip overview
                </p>
                <h2 className="mt-3 text-[30px] font-bold">{trip.tripName}</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/90">
                  {destinations}
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <HeroStat
                    icon={<Calendar size={16} />}
                    label="Dates"
                    value={formatTripDateRange(trip.startDate, trip.endDate)}
                  />
                  <HeroStat
                    icon={<Wallet size={16} />}
                    label="Budget"
                    value={formatTripBudget(trip.budget)}
                  />
                  <HeroStat
                    icon={<MapPin size={16} />}
                    label="Stops"
                    value={`${trip.stops.length} planned`}
                  />
                </div>
              </div>
            </Card>

            <section className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-[22px] font-semibold text-[#1a1a2e]">
                  Hotels
                </h2>
                <span className="text-sm text-[#6b7280]">
                  {stopCounts.hotels} saved
                </span>
              </div>

              {groupedStops.hotels.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {groupedStops.hotels.map((stop) => (
                    <StopCard key={stop.id} stop={stop} />
                  ))}
                </div>
              ) : (
                <EmptyStopState label="hotels" />
              )}
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-[22px] font-semibold text-[#1a1a2e]">
                  Places to explore
                </h2>
                <span className="text-sm text-[#6b7280]">
                  {stopCounts.places} saved
                </span>
              </div>

              {groupedStops.places.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {groupedStops.places.map((stop) => (
                    <StopCard key={stop.id} stop={stop} />
                  ))}
                </div>
              ) : (
                <EmptyStopState label="places" />
              )}
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-[22px] font-semibold text-[#1a1a2e]">
                  Trip notes
                </h2>
                <span className="text-sm text-[#6b7280]">
                  {trip.notes.length} note{trip.notes.length === 1 ? "" : "s"}
                </span>
              </div>

              {trip.notes.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {trip.notes.map((note) => (
                    <Card key={note.id} className="h-full p-5">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 text-[#0d6e6e]">
                          <NotebookPen size={18} />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-[#1a1a2e]">
                            {note.title}
                          </h3>
                          <p className="mt-1 text-xs text-[#6b7280]">
                            {new Intl.DateTimeFormat("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }).format(new Date(note.createdAt))}
                          </p>
                          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#4b5563]">
                            {note.content}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-black/10 bg-white px-5 py-8 text-center text-sm text-[#6b7280]">
                  No notes were saved for this trip.
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-4">
            <Card className="space-y-4 p-5">
              <h2 className="text-lg font-semibold text-[#1a1a2e]">
                At a glance
              </h2>
              <OverviewTile
                icon={<MapPin size={16} />}
                label="Destinations"
                value={destinations}
              />
              <OverviewTile
                icon={<BedDouble size={16} />}
                label="Hotels"
                value={`${stopCounts.hotels} saved`}
              />
              <OverviewTile
                icon={<Landmark size={16} />}
                label="Places"
                value={`${stopCounts.places} saved`}
              />
              <OverviewTile
                icon={<NotebookPen size={16} />}
                label="Notes"
                value={`${trip.notes.length} added`}
              />
            </Card>
          </aside>
        </div>
      </div>
    </DashboardPage>
  );
}

function HeroStat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white/12 px-4 py-4 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-white/85">
        {icon}
        <p className="text-xs font-semibold uppercase tracking-[0.16em]">{label}</p>
      </div>
      <p className="mt-2 text-sm font-medium text-white">{value}</p>
    </div>
  );
}

function OverviewTile({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-[#fbfcfe] px-4 py-4">
      <div className="flex items-center gap-2 text-[#0d6e6e]">
        {icon}
        <p className="text-xs font-semibold uppercase tracking-[0.16em]">{label}</p>
      </div>
      <p className="mt-2 text-sm font-medium text-[#1a1a2e]">{value}</p>
    </div>
  );
}

function StopCard({ stop }: { stop: TripStop }) {
  return (
    <Card className="h-full p-5">
      <div className="flex h-full flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div
              className="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
              style={{
                backgroundColor:
                  stop.kind === "place" && stop.categoryColor
                    ? `${stop.categoryColor}20`
                    : "#fef3c7",
                color:
                  stop.kind === "place" && stop.categoryColor
                    ? stop.categoryColor
                    : "#a16207",
              }}
            >
              {stop.subtitle}
            </div>
            <h3 className="mt-3 text-lg font-semibold text-[#1a1a2e]">
              {stop.name}
            </h3>
          </div>

          <span className="rounded-full bg-[#0d6e6e]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#0d6e6e]">
            {stop.kind}
          </span>
        </div>

        <InfoLine icon={<MapPin size={14} />} label={stop.address} />

        {stop.ratingLabel ? (
          <InfoLine icon={<BedDouble size={14} />} label={stop.ratingLabel} />
        ) : null}

        {stop.priceLabel ? (
          <InfoLine icon={<Wallet size={14} />} label={stop.priceLabel} />
        ) : null}

        {stop.openingHours ? (
          <InfoLine icon={<Clock size={14} />} label={stop.openingHours} />
        ) : null}

        <div className="mt-auto flex flex-wrap gap-3 text-sm">
          {stop.phone ? (
            <span className="inline-flex items-center gap-2 text-[#4b5563]">
              <Phone size={14} />
              {stop.phone}
            </span>
          ) : null}

          {stop.website ? (
            <a
              href={stop.website}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-[#0d6e6e] hover:underline"
            >
              <ExternalLink size={14} />
              Website
            </a>
          ) : null}

          {stop.wikipedia ? (
            <a
              href={stop.wikipedia}
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

function EmptyStopState({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-black/10 bg-white px-5 py-8 text-center text-sm text-[#6b7280]">
      No {label} were saved for this trip.
    </div>
  );
}
