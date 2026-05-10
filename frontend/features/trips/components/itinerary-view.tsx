"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowUpDown,
  Calendar,
  Camera,
  Clock,
  Coffee,
  DollarSign,
  Download,
  Edit2,
  Filter,
  type LucideIcon,
  MapPin,
  Mountain,
  Plus,
  Search,
  SlidersHorizontal,
  TrendingDown,
  TrendingUp,
  Utensils,
  Waves,
} from "lucide-react";

import { DashboardPage } from "@/components/layout/dashboard-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type BudgetCategory = {
  name: string;
  amount: number;
  color: string;
};

type ActivityItem = {
  id: number;
  time: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  location: string;
  icon: LucideIcon;
  image: string;
  expense: number;
  paid: boolean;
};

type DayPlan = {
  day: number;
  date: string;
  activities: ActivityItem[];
};

const itineraryData = {
  destination: "Swiss Alps & Italian Coast",
  dateRange: "June 15-22, 2026",
  totalDays: 7,
  activities: 12,
  budget: {
    total: 3500,
    spent: 2340,
    remaining: 1160,
    dailyAverage: 334.29,
    categories: [
      { name: "Activities", amount: 890, color: "#0d6e6e" },
      { name: "Food & Dining", amount: 650, color: "#f59e0b" },
      { name: "Accommodation", amount: 600, color: "#3d52a0" },
      { name: "Transportation", amount: 200, color: "#10b981" },
    ] satisfies BudgetCategory[],
  },
};

const days: DayPlan[] = [
  {
    day: 1,
    date: "June 15",
    activities: [
      {
        id: 1,
        time: "08:00 AM",
        title: "Mountain Hiking Adventure",
        description: "Explore scenic alpine trails with breathtaking views",
        duration: "4 hours",
        category: "Adventure",
        location: "Zermatt",
        icon: Mountain,
        image:
          "https://images.unsplash.com/photo-1603475429038-44361bcde123?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        expense: 120,
        paid: true,
      },
      {
        id: 2,
        time: "02:00 PM",
        title: "Traditional Swiss Lunch",
        description: "Authentic mountain cuisine with local specialties",
        duration: "1.5 hours",
        category: "Food",
        location: "Alpine Restaurant",
        icon: Utensils,
        image:
          "https://images.unsplash.com/photo-1762922425226-8cfe6987e7b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        expense: 75,
        paid: true,
      },
      {
        id: 3,
        time: "06:00 PM",
        title: "Sunset Photography Walk",
        description: "Capture the golden hour in the mountains",
        duration: "2 hours",
        category: "Photography",
        location: "Mountain Vista",
        icon: Camera,
        image:
          "https://images.unsplash.com/photo-1713860052825-4798abffb5b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        expense: 0,
        paid: true,
      },
    ],
  },
  {
    day: 2,
    date: "June 16",
    activities: [
      {
        id: 4,
        time: "10:00 AM",
        title: "Historic City Walking Tour",
        description: "Discover hidden gems and local history",
        duration: "3 hours",
        category: "Sightseeing",
        location: "Old Town",
        icon: MapPin,
        image:
          "https://images.unsplash.com/photo-1652793822141-35666e9db853?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        expense: 45,
        paid: false,
      },
      {
        id: 5,
        time: "01:00 PM",
        title: "Art Museum Visit",
        description: "Contemporary and classical art exhibitions",
        duration: "2 hours",
        category: "Culture",
        location: "National Gallery",
        icon: Camera,
        image:
          "https://images.unsplash.com/photo-1611501768223-65061dd288c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        expense: 25,
        paid: false,
      },
      {
        id: 6,
        time: "07:00 PM",
        title: "Fine Dining Experience",
        description: "Michelin-starred restaurant with wine pairing",
        duration: "2.5 hours",
        category: "Food",
        location: "Le Gourmet",
        icon: Utensils,
        image:
          "https://images.unsplash.com/photo-1544148103-0773bf10d330?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        expense: 180,
        paid: false,
      },
    ],
  },
  {
    day: 3,
    date: "June 17",
    activities: [
      {
        id: 7,
        time: "09:00 AM",
        title: "Beach Relaxation & Swim",
        description: "Unwind at the pristine coastal beaches",
        duration: "4 hours",
        category: "Leisure",
        location: "Riviera Beach",
        icon: Waves,
        image:
          "https://images.unsplash.com/photo-1693812049402-aa914fe44074?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        expense: 0,
        paid: true,
      },
      {
        id: 8,
        time: "02:00 PM",
        title: "Coastal Café & Coffee",
        description: "Italian espresso and pastries by the sea",
        duration: "1 hour",
        category: "Food",
        location: "Seaside Café",
        icon: Coffee,
        image:
          "https://images.unsplash.com/photo-1544148103-0773bf10d330?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        expense: 15,
        paid: true,
      },
    ],
  },
];

const searchOptions = [
  "All activities",
  "Paid only",
  "Pending expenses",
  "Free activities",
];

const sortOptions = ["Time", "Expense", "Category"];
const groupOptions = ["By day", "By category"];

export function ItineraryView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchModeIndex, setSearchModeIndex] = useState(0);
  const [sortModeIndex, setSortModeIndex] = useState(0);
  const [groupModeIndex, setGroupModeIndex] = useState(0);

  const percentSpent =
    (itineraryData.budget.spent / itineraryData.budget.total) * 100;

  const filteredDays = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const mode = searchOptions[searchModeIndex];
    const sortMode = sortOptions[sortModeIndex];

    return days
      .map((day) => {
        const items = [...day.activities]
          .filter((activity) => {
            const matchesQuery =
              normalizedQuery.length === 0
                ? true
                : `${activity.title} ${activity.location} ${activity.category} ${activity.description}`
                    .toLowerCase()
                    .includes(normalizedQuery);

            const matchesMode =
              mode === "All activities"
                ? true
                : mode === "Paid only"
                  ? activity.paid && activity.expense > 0
                  : mode === "Pending expenses"
                    ? !activity.paid && activity.expense > 0
                    : activity.expense === 0;

            return matchesQuery && matchesMode;
          })
          .sort((first, second) => {
            if (sortMode === "Expense") {
              return second.expense - first.expense;
            }

            if (sortMode === "Category") {
              return first.category.localeCompare(second.category);
            }

            return first.time.localeCompare(second.time);
          });

        return { ...day, activities: items };
      })
      .filter((day) => day.activities.length > 0);
  }, [searchModeIndex, searchQuery, sortModeIndex]);

  const visibleActivityCount = filteredDays.reduce(
    (total, day) => total + day.activities.length,
    0,
  );

  return (
    <DashboardPage>
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#6b7280]">
                Review your plan and track every expense clearly
              </p>
              <h1 className="mt-1 text-[28px] font-bold text-[#1a1a2e]">
                Itinerary View with Budget
              </h1>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0d6e6e]">
                Visible Activities
              </p>
              <p className="mt-1 text-lg font-semibold text-[#1a1a2e]">
                {visibleActivityCount} activities
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-1 flex-col gap-3 lg:flex-row">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]"
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search activities, destinations, dates..."
                  className="h-11 w-full rounded-xl border border-black/10 bg-white pl-10 pr-3 text-sm text-[#1a1a2e] outline-none transition-all duration-200 placeholder:text-[#6b7280] focus:border-[#0d6e6e] focus:ring-2 focus:ring-[#0d6e6e]/15"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <ControlButton
                  icon={<SlidersHorizontal size={18} />}
                  label={groupOptions[groupModeIndex]}
                  onClick={() =>
                    setGroupModeIndex(
                      (current) => (current + 1) % groupOptions.length,
                    )
                  }
                />
                <ControlButton
                  icon={<Filter size={18} />}
                  label={searchOptions[searchModeIndex]}
                  onClick={() =>
                    setSearchModeIndex(
                      (current) => (current + 1) % searchOptions.length,
                    )
                  }
                />
                <ControlButton
                  icon={<ArrowUpDown size={18} />}
                  label={sortOptions[sortModeIndex]}
                  onClick={() =>
                    setSortModeIndex(
                      (current) => (current + 1) % sortOptions.length,
                    )
                  }
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline">
                <Download size={16} />
                Export PDF
              </Button>
              <Link href="/trip-itinerary">
                <Button variant="secondary">
                  <Edit2 size={16} />
                  Edit Itinerary
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap gap-5 text-sm text-[#6b7280]">
            <InfoStat
              icon={<Calendar size={15} className="text-[#3d52a0]" />}
              text={itineraryData.dateRange}
            />
            <InfoStat
              icon={<MapPin size={15} className="text-[#0d6e6e]" />}
              text={`${itineraryData.totalDays} days`}
            />
            <InfoStat
              icon={<Clock size={15} className="text-[#f59e0b]" />}
              text={`${itineraryData.activities} activities planned`}
            />
          </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-8">
            {filteredDays.map((day) => (
              <section key={day.day} className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl border border-[#0d6e6e]/15 bg-white px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                    <p className="text-sm font-semibold text-[#0d6e6e]">
                      Day {day.day}
                    </p>
                    <p className="mt-1 text-xs text-[#6b7280]">{day.date}</p>
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-[#0d6e6e]/20 to-transparent" />
                </div>

                <div className="space-y-4">
                  {day.activities.map((activity) => (
                    <ActivityTimelineCard
                      key={activity.id}
                      activity={activity}
                    />
                  ))}
                </div>
              </section>
            ))}

            <Button className="w-full rounded-2xl">
              <Plus size={18} />
              Add New Activity
            </Button>
          </div>

          <aside className="space-y-6">
            <Card className="sticky top-24 rounded-[1.5rem] p-0">
              <div className="space-y-6 p-6">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0d6e6e]/10 text-[#0d6e6e]">
                    <DollarSign size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[#1a1a2e]">
                      Budget Summary
                    </h2>
                    <p className="text-sm text-[#6b7280]">
                      {itineraryData.destination}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl bg-[linear-gradient(135deg,rgba(13,110,110,0.08),rgba(61,82,160,0.08))] p-5">
                  <p className="text-sm text-[#6b7280]">Total Budget</p>
                  <p className="mt-1 text-3xl font-bold text-[#1a1a2e]">
                    ${itineraryData.budget.total.toLocaleString()}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[#1a1a2e]">
                      Budget Used
                    </span>
                    <span className="text-sm font-semibold text-[#1a1a2e]">
                      {percentSpent.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-[#e5e7eb]">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#0d6e6e,#3d52a0)] transition-all duration-300"
                      style={{ width: `${percentSpent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#6b7280]">
                    <span>${itineraryData.budget.spent} spent</span>
                    <span>${itineraryData.budget.remaining} remaining</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <BudgetStat
                    icon={<TrendingUp size={16} className="text-[#ef4444]" />}
                    label="Total Spent"
                    value={`$${itineraryData.budget.spent}`}
                    valueClassName="text-[#1a1a2e]"
                  />
                  <BudgetStat
                    icon={<TrendingDown size={16} className="text-[#10b981]" />}
                    label="Remaining"
                    value={`$${itineraryData.budget.remaining}`}
                    valueClassName="text-[#10b981]"
                  />
                </div>

                <div className="rounded-2xl bg-[#f8f9fa] p-4">
                  <p className="text-xs text-[#6b7280]">Daily Average</p>
                  <p className="mt-1 text-2xl font-bold text-[#3d52a0]">
                    ${itineraryData.budget.dailyAverage.toFixed(2)}
                  </p>
                  <p className="mt-1 text-xs text-[#6b7280]">per day</p>
                </div>
              </div>
            </Card>

            <Card className="rounded-[1.5rem] p-0">
              <div className="space-y-5 p-6">
                <h2 className="text-lg font-semibold text-[#1a1a2e]">
                  Spending by Category
                </h2>

                {itineraryData.budget.categories.map((category) => {
                  const percentage =
                    (category.amount / itineraryData.budget.spent) * 100;

                  return (
                    <div key={category.name} className="space-y-2">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="text-sm font-medium text-[#1a1a2e]">
                            {category.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-[#1a1a2e]">
                            ${category.amount}
                          </p>
                          <p className="text-xs text-[#6b7280]">
                            {percentage.toFixed(0)}%
                          </p>
                        </div>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-[#e5e7eb]">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: category.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <div className="space-y-3">
              <Button variant="outline" className="w-full">
                <Download size={16} />
                Download Budget Report
              </Button>
              <Button className="w-full">
                <Plus size={16} />
                Add Expense
              </Button>
            </div>
          </aside>
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

function InfoStat({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span>{text}</span>
    </div>
  );
}

function ActivityTimelineCard({ activity }: { activity: ActivityItem }) {
  const Icon = activity.icon;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_140px]">
      <Card hover className="overflow-hidden p-0">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative aspect-[16/10] overflow-hidden sm:w-48 sm:shrink-0 sm:aspect-auto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activity.image}
              alt={activity.title}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex-1 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0d6e6e]/10 text-[#0d6e6e]">
                    <Icon size={16} />
                  </div>
                  <h3 className="text-lg font-semibold text-[#1a1a2e]">
                    {activity.title}
                  </h3>
                  <Badge className="bg-[#eef2ff] text-[#3d52a0]">
                    {activity.category}
                  </Badge>
                </div>
                <p className="text-sm leading-6 text-[#6b7280]">
                  {activity.description}
                </p>
              </div>

              <div className="rounded-full bg-[#f8f9fa] px-3 py-1 text-sm font-medium text-[#3d52a0]">
                {activity.time}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-sm text-[#6b7280]">
              <InfoStat
                icon={<Clock size={14} className="text-[#3d52a0]" />}
                text={activity.duration}
              />
              <InfoStat
                icon={<Calendar size={14} className="text-[#0d6e6e]" />}
                text={activity.time}
              />
              <InfoStat
                icon={<MapPin size={14} className="text-[#f59e0b]" />}
                text={activity.location}
              />
            </div>
          </div>
        </div>
      </Card>

      <Card className="flex items-center justify-center p-5 text-center">
        {activity.expense > 0 ? (
          <div>
            <p className="text-2xl font-bold text-[#1a1a2e]">
              ${activity.expense}
            </p>
            <Badge
              className={
                activity.paid
                  ? "mt-2 bg-[#d1fae5] text-[#047857]"
                  : "mt-2 bg-[#fef3c7] text-[#92400e]"
              }
            >
              {activity.paid ? "Paid" : "Pending"}
            </Badge>
          </div>
        ) : (
          <Badge className="bg-[#eef2ff] text-[#3d52a0]">Free</Badge>
        )}
      </Card>
    </div>
  );
}

function BudgetStat({
  icon,
  label,
  value,
  valueClassName,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-xl border border-black/10 bg-white p-4">
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <span className="text-xs text-[#6b7280]">{label}</span>
      </div>
      <p className={`text-xl font-bold ${valueClassName ?? "text-[#1a1a2e]"}`}>
        {value}
      </p>
    </div>
  );
}
