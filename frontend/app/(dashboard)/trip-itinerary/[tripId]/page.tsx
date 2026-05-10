import { SavedTripItinerary } from "@/features/trips/components/saved-trip-itinerary";

type TripItineraryDetailsPageProps = {
  params: Promise<{
    tripId: string;
  }>;
};

export default async function TripItineraryDetailsPage({
  params,
}: TripItineraryDetailsPageProps) {
  const { tripId } = await params;

  return <SavedTripItinerary tripId={tripId} />;
}
