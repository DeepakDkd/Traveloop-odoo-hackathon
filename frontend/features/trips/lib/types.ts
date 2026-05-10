export type TripStopKind = "hotel" | "place";

export interface TripNote {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface TripStop {
  id: string;
  kind: TripStopKind;
  city: string;
  name: string;
  subtitle: string;
  address: string;
  lat: number;
  lon: number;
  website?: string;
  phone?: string;
  wikipedia?: string;
  priceLabel?: string;
  ratingLabel?: string;
  openingHours?: string;
  categoryColor?: string;
}

export interface SavedTrip {
  id: string;
  tripName: string;
  startDate: string;
  endDate: string;
  budget: number;
  notes: TripNote[];
  stops: TripStop[];
  createdAt: string;
  updatedAt: string;
}

export type SavedTripStatus = "ongoing" | "upcoming" | "completed";
