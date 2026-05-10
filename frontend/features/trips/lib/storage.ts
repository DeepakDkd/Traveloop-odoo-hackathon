import type { SavedTrip, SavedTripStatus, TripStop } from "./types";

const TRIPS_STORAGE_KEY = "traveloop.savedTrips";
const LAST_TRIP_STORAGE_KEY = "traveloop.lastTripId";
const TRIP_STORAGE_EVENT = "traveloop:trips-updated";

function normalizeIdPart(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function isBrowser() {
  return typeof window !== "undefined";
}

function emitTripStorageChange() {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new Event(TRIP_STORAGE_EVENT));
}

export function createTripId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `trip-${Date.now()}`;
}

export function createTripStopId(
  kind: TripStop["kind"],
  name: string,
  city: string,
  address: string,
  lat: number,
  lon: number,
) {
  return [
    kind,
    normalizeIdPart(name),
    normalizeIdPart(city),
    normalizeIdPart(address),
    lat.toFixed(4),
    lon.toFixed(4),
  ].join(":");
}

export function readStoredTrips() {
  if (!isBrowser()) {
    return [] as SavedTrip[];
  }

  try {
    const rawValue = window.localStorage.getItem(TRIPS_STORAGE_KEY);

    if (!rawValue) {
      return [] as SavedTrip[];
    }

    const parsed = JSON.parse(rawValue) as SavedTrip[];

    if (!Array.isArray(parsed)) {
      return [] as SavedTrip[];
    }

    return parsed.sort(
      (left, right) =>
        new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
    );
  } catch {
    return [] as SavedTrip[];
  }
}

export function writeStoredTrips(trips: SavedTrip[]) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(trips));
  emitTripStorageChange();
}

export function saveStoredTrip(trip: SavedTrip) {
  const currentTrips = readStoredTrips();
  const nextTrips = [trip, ...currentTrips.filter((item) => item.id !== trip.id)];

  if (isBrowser()) {
    window.localStorage.setItem(LAST_TRIP_STORAGE_KEY, trip.id);
  }

  writeStoredTrips(nextTrips);

  return trip;
}

export function getStoredTripById(tripId: string) {
  return readStoredTrips().find((trip) => trip.id === tripId) ?? null;
}

export function deleteStoredTrip(tripId: string) {
  const nextTrips = readStoredTrips().filter((trip) => trip.id !== tripId);

  if (!isBrowser()) {
    return;
  }

  const latestTripId = window.localStorage.getItem(LAST_TRIP_STORAGE_KEY);

  if (latestTripId === tripId) {
    const fallbackTripId = nextTrips[0]?.id ?? "";

    if (fallbackTripId) {
      window.localStorage.setItem(LAST_TRIP_STORAGE_KEY, fallbackTripId);
    } else {
      window.localStorage.removeItem(LAST_TRIP_STORAGE_KEY);
    }
  }

  writeStoredTrips(nextTrips);
}

export function getLastStoredTripId() {
  if (!isBrowser()) {
    return null;
  }

  return window.localStorage.getItem(LAST_TRIP_STORAGE_KEY);
}

export function subscribeToTripStorage(callback: () => void) {
  if (!isBrowser()) {
    return () => undefined;
  }

  const handler = () => callback();

  window.addEventListener(TRIP_STORAGE_EVENT, handler);
  window.addEventListener("storage", handler);

  return () => {
    window.removeEventListener(TRIP_STORAGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function getTripDestinations(trip: Pick<SavedTrip, "stops">) {
  const cities = Array.from(
    new Set(
      trip.stops
        .map((stop) => stop.city.trim())
        .filter((city) => city.length > 0),
    ),
  );

  return cities.length > 0 ? cities.join(", ") : "Custom trip";
}

export function getTripStopCounts(trip: Pick<SavedTrip, "stops">) {
  return trip.stops.reduce(
    (summary, stop) => {
      if (stop.kind === "hotel") {
        summary.hotels += 1;
      } else {
        summary.places += 1;
      }

      return summary;
    },
    { hotels: 0, places: 0 },
  );
}

export function getTripStatus(
  trip: Pick<SavedTrip, "startDate" | "endDate">,
  today = new Date(),
): SavedTripStatus {
  const tripStart = new Date(trip.startDate);
  const tripEnd = new Date(trip.endDate);
  const currentDate = new Date(today);

  tripStart.setHours(0, 0, 0, 0);
  tripEnd.setHours(23, 59, 59, 999);
  currentDate.setHours(12, 0, 0, 0);

  if (currentDate < tripStart) {
    return "upcoming";
  }

  if (currentDate > tripEnd) {
    return "completed";
  }

  return "ongoing";
}

export function formatTripDateRange(startDate: string, endDate: string) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${formatter.format(new Date(startDate))} - ${formatter.format(
    new Date(endDate),
  )}`;
}

export function formatTripBudget(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}
