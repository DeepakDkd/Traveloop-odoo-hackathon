"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpDown,
  Bookmark,
  Clock,
  Filter,
  MapPin,
  Search,
  SlidersHorizontal,
  Star,
} from "lucide-react";

import { DashboardPage } from "@/components/layout/dashboard-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type ActivityCategory =
  | "Adventure"
  | "Water Sports"
  | "Cultural"
  | "Sightseeing";

type Activity = {
  id: number;
  name: string;
  category: ActivityCategory;
  description: string;
  location: string;
  duration: string;
  price: string;
  rating: number;
  reviews: number;
  image: string;
};

type FilterMode = "All" | ActivityCategory;
type SortMode = "Rating" | "Price" | "Reviews";
type GroupMode = "None" | "Category";

const activities: Activity[] = [
  {
    id: 1,
    name: "Paragliding Over Mountains",
    category: "Adventure",
    description:
      "Soar through the skies with breathtaking mountain views and a guided tandem launch designed for first-timers and thrill-seekers.",
    location: "Swiss Alps, Switzerland",
    duration: "2-3 hours",
    price: "$189",
    rating: 4.9,
    reviews: 342,
    image:
      "https://images.unsplash.com/photo-1764022398343-f1bd1d845e17?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    id: 2,
    name: "Scuba Diving Adventure",
    category: "Water Sports",
    description:
      "Explore coral gardens and marine life in crystal-clear waters with expert instructors and beginner-friendly guidance.",
    location: "Great Barrier Reef, Australia",
    duration: "4 hours",
    price: "$249",
    rating: 4.8,
    reviews: 567,
    image:
      "https://images.unsplash.com/photo-1580128789542-d484253e94a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    id: 3,
    name: "Desert Safari Experience",
    category: "Cultural",
    description:
      "Ride through golden dunes, enjoy traditional performances, and end the evening with local cuisine under the stars.",
    location: "Dubai, UAE",
    duration: "6 hours",
    price: "$129",
    rating: 4.7,
    reviews: 891,
    image:
      "https://images.unsplash.com/photo-1624062999726-083e5268525d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    id: 4,
    name: "Mountain Hiking Expedition",
    category: "Adventure",
    description:
      "Trek through dramatic alpine landscapes with expert guides and a route planned for strong views and manageable pacing.",
    location: "Patagonia, Chile",
    duration: "Full day",
    price: "$159",
    rating: 4.9,
    reviews: 423,
    image:
      "https://images.unsplash.com/photo-1609373066983-cee8662ea93f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    id: 5,
    name: "European City Walking Tour",
    category: "Sightseeing",
    description:
      "Discover hidden gems and iconic landmarks with a local guide, including historical context and quick tasting stops.",
    location: "Prague, Czech Republic",
    duration: "3 hours",
    price: "$45",
    rating: 4.6,
    reviews: 1203,
    image:
      "https://images.unsplash.com/photo-1775740738694-1d590125a704?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    id: 6,
    name: "Camel Desert Trek",
    category: "Cultural",
    description:
      "Travel across sweeping desert landscapes with a guided camel route and a calm overnight camp atmosphere.",
    location: "Sahara, Morocco",
    duration: "2 days",
    price: "$299",
    rating: 4.8,
    reviews: 234,
    image:
      "https://images.unsplash.com/photo-1557273261-6503c11a27f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    id: 7,
    name: "Aerial Paragliding Experience",
    category: "Adventure",
    description:
      "Feel the rush of flying over coastal cliffs and turquoise bays with a short briefing and scenic tandem flight.",
    location: "Oludeniz, Turkey",
    duration: "1-2 hours",
    price: "$149",
    rating: 4.9,
    reviews: 678,
    image:
      "https://images.unsplash.com/photo-1766483677150-3235ed9f8439?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
];

const filterModes: FilterMode[] = [
  "All",
  "Adventure",
  "Water Sports",
  "Cultural",
  "Sightseeing",
];

const sortModes: SortMode[] = ["Rating", "Price", "Reviews"];
const groupModes: GroupMode[] = ["None", "Category"];

export function ActivitySearch() {
  const [query, setQuery] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>("All");
  const [sortMode, setSortMode] = useState<SortMode>("Rating");
  const [groupMode, setGroupMode] = useState<GroupMode>("None");
  const [savedIds, setSavedIds] = useState<number[]>([]);

  const filteredActivities = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const nextItems = activities.filter((activity) => {
      const matchesFilter =
        filterMode === "All" ? true : activity.category === filterMode;

      const matchesQuery =
        normalizedQuery.length === 0
          ? true
          : `${activity.name} ${activity.category} ${activity.location} ${activity.description}`
              .toLowerCase()
              .includes(normalizedQuery);

      return matchesFilter && matchesQuery;
    });

    return [...nextItems].sort((first, second) => {
      if (sortMode === "Price") {
        return getPriceValue(first.price) - getPriceValue(second.price);
      }

      if (sortMode === "Reviews") {
        return second.reviews - first.reviews;
      }

      return second.rating - first.rating;
    });
  }, [filterMode, query, sortMode]);

  const groupedActivities = useMemo(() => {
    if (groupMode === "None") {
      return [{ label: "Results", items: filteredActivities }];
    }

    return filterModes
      .filter((mode): mode is ActivityCategory => mode !== "All")
      .map((category) => ({
        label: category,
        items: filteredActivities.filter(
          (activity) => activity.category === category,
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [filteredActivities, groupMode]);

  function cycleFilterMode() {
    const currentIndex = filterModes.indexOf(filterMode);
    const nextIndex = (currentIndex + 1) % filterModes.length;
    setFilterMode(filterModes[nextIndex]);
  }

  function cycleSortMode() {
    const currentIndex = sortModes.indexOf(sortMode);
    const nextIndex = (currentIndex + 1) % sortModes.length;
    setSortMode(sortModes[nextIndex]);
  }

  function cycleGroupMode() {
    const currentIndex = groupModes.indexOf(groupMode);
    const nextIndex = (currentIndex + 1) % groupModes.length;
    setGroupMode(groupModes[nextIndex]);
  }

  function toggleSaved(id: number) {
    setSavedIds((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );
  }

  function addToTrip(activity: Activity) {
    console.log("Added activity to trip:", activity);
  }

  return (
    <DashboardPage>
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#6b7280]">
                Find experiences that fit your itinerary
              </p>
              <h1 className="mt-1 text-[28px] font-bold text-[#1a1a2e]">
                Activity Search
              </h1>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0d6e6e]">
                Search Results
              </p>
              <p className="mt-1 text-lg font-semibold text-[#1a1a2e]">
                {filteredActivities.length} activities found
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search cities, activities, adventures..."
                className="h-11 w-full rounded-xl border border-black/10 bg-white pl-10 pr-3 text-sm text-[#1a1a2e] outline-none transition-all duration-200 placeholder:text-[#6b7280] focus:border-[#0d6e6e] focus:ring-2 focus:ring-[#0d6e6e]/15"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <ControlButton
                icon={<SlidersHorizontal size={18} />}
                label={`Group: ${groupMode}`}
                onClick={cycleGroupMode}
              />
              <ControlButton
                icon={<Filter size={18} />}
                label={`Filter: ${filterMode}`}
                onClick={cycleFilterMode}
              />
              <ControlButton
                icon={<ArrowUpDown size={18} />}
                label={`Sort: ${sortMode}`}
                onClick={cycleSortMode}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge className="bg-[#0d6e6e]/10 text-[#0d6e6e]">
              Group {groupMode}
            </Badge>
            <Badge className="bg-[#3d52a0]/10 text-[#3d52a0]">
              Filter {filterMode}
            </Badge>
            <Badge className="bg-[#f59e0b]/15 text-[#8a5a00]">
              Sort {sortMode}
            </Badge>
          </div>
        </div>

        <div className="space-y-8">
          {groupedActivities.length > 0 ? (
            groupedActivities.map((group) => (
              <section key={group.label} className="space-y-4">
                {groupMode === "Category" ? (
                  <div className="flex items-center gap-2">
                    <h2 className="text-[20px] font-semibold text-[#1a1a2e]">
                      {group.label}
                    </h2>
                    <span className="text-sm text-[#6b7280]">
                      ({group.items.length})
                    </span>
                  </div>
                ) : (
                  <h2 className="text-[20px] font-semibold text-[#1a1a2e]">
                    Results
                  </h2>
                )}

                <div className="space-y-4">
                  {group.items.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.22, delay: index * 0.03 }}
                    >
                      <ActivityCard
                        activity={activity}
                        isSaved={savedIds.includes(activity.id)}
                        onToggleSaved={() => toggleSaved(activity.id)}
                        onAddToTrip={() => addToTrip(activity)}
                      />
                    </motion.div>
                  ))}
                </div>
              </section>
            ))
          ) : (
            <EmptyResults />
          )}
        </div>
      </div>
    </DashboardPage>
  );
}

function ControlButton({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-11 items-center gap-2 rounded-xl border border-black/10 bg-white px-4 text-sm font-medium text-[#1a1a2e] transition-colors hover:bg-[#e5e7eb]"
    >
      <span className="text-[#6b7280]">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function ActivityCard({
  activity,
  isSaved,
  onToggleSaved,
  onAddToTrip,
}: {
  activity: Activity;
  isSaved: boolean;
  onToggleSaved: () => void;
  onAddToTrip: () => void;
}) {
  return (
    <Card hover className="overflow-hidden p-0">
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="relative aspect-[16/10] overflow-hidden lg:h-auto lg:w-72 lg:shrink-0 rounded-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activity.image}
            alt={activity.name}
            className="h-full w-full  object-cover transition-transform duration-300 hover:scale-[1.03]"
          />
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-semibold text-[#1a1a2e]">
                  {activity.name}
                </h3>
                <Badge className="bg-[#eef2ff] text-[#3d52a0]">
                  {activity.category}
                </Badge>
              </div>

              <p className="max-w-3xl text-sm leading-7 text-[#6b7280]">
                {activity.description}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#6b7280]">
                From
              </p>
              <p className="mt-1 text-2xl font-bold text-[#1a1a2e]">
                {activity.price}
              </p>
              <p className="text-xs text-[#6b7280]">per person</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-4 text-sm text-[#6b7280]">
            <InfoPill icon={<MapPin size={15} />} text={activity.location} />
            <InfoPill icon={<Clock size={15} />} text={activity.duration} />
            <InfoPill
              icon={<Star size={15} className="fill-[#f59e0b] text-[#f59e0b]" />}
              text={`${activity.rating} (${activity.reviews})`}
            />
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-black/10 pt-4">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={onToggleSaved}
                className={
                  isSaved
                    ? "text-[#f59e0b] hover:bg-[#f59e0b]/10"
                    : "text-[#6b7280] hover:bg-[#e5e7eb]"
                }
              >
                <Bookmark
                  size={16}
                  className={isSaved ? "fill-[#f59e0b]" : undefined}
                />
                {isSaved ? "Saved" : "Save"}
              </Button>
            </div>

            <Button type="button" onClick={onAddToTrip}>
              Add to Trip
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

function InfoPill({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-[#f8f9fa] px-3 py-2">
      <span className="text-[#0d6e6e]">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function EmptyResults() {
  return (
    <Card className="rounded-[1.5rem] border border-dashed border-black/10 bg-white px-6 py-12 text-center">
      <h2 className="text-xl font-semibold text-[#1a1a2e]">
        No activities found
      </h2>
      <p className="mt-2 text-sm text-[#6b7280]">
        Try a different search term or cycle the filters to explore more
        destinations and experiences.
      </p>
    </Card>
  );
}

function getPriceValue(price: string) {
  return Number(price.replace(/[^\d]/g, ""));
}
