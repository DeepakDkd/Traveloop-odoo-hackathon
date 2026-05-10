"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Calendar, Plus, Wallet } from "lucide-react";

import { DashboardPage } from "@/components/layout/dashboard-page";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type ItinerarySection = {
  id: number;
  title: string;
  description: string;
  dateRange: string;
  budget: string;
  tag: string;
};

const initialSections: ItinerarySection[] = [
  {
    id: 1,
    title: "Arrival and Hotel Check-In",
    description:
      "Settle into your stay, confirm bookings, and keep the first day relaxed so the trip begins smoothly without rushed transitions.",
    dateRange: "May 18 to May 19",
    budget: "$320 for stay and transfers",
    tag: "Stay",
  },
  {
    id: 2,
    title: "City Exploration and Landmark Visits",
    description:
      "Use this section for museum visits, walking tours, and key sightseeing stops that define the destination experience.",
    dateRange: "May 20 to May 21",
    budget: "$180 for tickets and local travel",
    tag: "Explore",
  },
  {
    id: 3,
    title: "Food Trail and Evening Activities",
    description:
      "Plan dinner spots, local cafe breaks, and night experiences so the itinerary stays balanced between activities and downtime.",
    dateRange: "May 22 to May 23",
    budget: "$140 for dining and extras",
    tag: "Leisure",
  },
];

const extraSections: Omit<ItinerarySection, "id">[] = [
  {
    title: "Day Trip Outside the City",
    description:
      "Reserve a full block for short-distance travel, scenic visits, and return timing so the plan stays realistic and easy to follow.",
    dateRange: "May 24 to May 24",
    budget: "$210 for transport and passes",
    tag: "Excursion",
  },
  {
    title: "Departure and Final Packing",
    description:
      "Keep the final section focused on checkout, airport transfer, shopping buffer, and any last-minute adjustments before departure.",
    dateRange: "May 25 to May 25",
    budget: "$90 for final logistics",
    tag: "Wrap-up",
  },
];

export function TripItinerary() {
  const [sections, setSections] = useState(initialSections);

  function handleAddSection() {
    const nextTemplate =
      extraSections[sections.length - initialSections.length] ?? {
        title: `Flexible Section ${sections.length + 1}`,
        description:
          "Use this section for hotel changes, activity blocks, or any custom travel step that needs its own dates and budget.",
        dateRange: "Add dates",
        budget: "Add budget",
        tag: "Custom",
      };

    setSections((current) => [
      ...current,
      {
        id: current.length + 1,
        ...nextTemplate,
      },
    ]);
  }

  return (
    <DashboardPage>
      <div className="space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/create-trip"
              className="app-icon-button inline-flex h-11 w-11 items-center justify-center rounded-xl border border-black/10 bg-white text-[#1a1a2e]"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <p className="text-sm font-medium text-[#6b7280]">
                Continue planning
              </p>
              <h1 className="mt-1 text-[28px] font-bold text-[#1a1a2e]">
                Trip itinerary
              </h1>
            </div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0d6e6e]">
              Planned Sections
            </p>
            <p className="mt-1 text-lg font-semibold text-[#1a1a2e]">
              {sections.length} sections ready
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <AnimatePresence initial={false}>
            {sections.map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.24, ease: "easeOut" }}
              >
                <Card className="overflow-hidden rounded-[1.5rem] border border-black/10 bg-white p-0 shadow-[0_6px_24px_rgba(15,23,42,0.06)]">
                  <div className="border-l-[5px] border-[#0d6e6e] px-5 py-6 sm:px-7">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#0d6e6e]">
                          Section {index + 1}
                        </p>
                        <h2 className="mt-2 text-[24px] font-semibold text-[#1a1a2e]">
                          {section.title}
                        </h2>
                      </div>

                      <span className="rounded-full bg-[#0d6e6e]/10 px-3 py-1 text-xs font-semibold text-[#0d6e6e]">
                        {section.tag}
                      </span>
                    </div>

                    <p className="mt-4 max-w-4xl text-[15px] leading-7 text-[#6b7280]">
                      {section.description}
                    </p>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                      <InfoTile
                        icon={<Calendar size={18} />}
                        label="Date Range"
                        value={section.dateRange}
                      />
                      <InfoTile
                        icon={<Wallet size={18} />}
                        label="Budget"
                        value={section.budget}
                      />
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="flex justify-center pt-2">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={handleAddSection}
            className="rounded-2xl px-6"
          >
            <Plus size={18} />
            Add another section
          </Button>
        </div>
      </div>
    </DashboardPage>
  );
}

function InfoTile({
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
        <p className="text-sm font-semibold uppercase tracking-[0.14em]">
          {label}
        </p>
      </div>
      <p className="mt-2 text-base font-medium text-[#1a1a2e]">{value}</p>
    </div>
  );
}
