"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { DashboardPage } from "@/components/layout/dashboard-page";
import { TripNotesBoard } from "@/features/trips/components/trip-notes-board";
import type { TripNote } from "@/features/trips/lib/types";

export default function TripNotesPage() {
  const [notes, setNotes] = useState<TripNote[]>([]);

  return (
    <DashboardShell>
      <DashboardPage>
        <div className="space-y-8">
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/create-trip"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-black/10 bg-white text-[#1a1a2e]"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <p className="text-sm font-medium text-[#6b7280]">
                Standalone notes workspace
              </p>
              <h1 className="mt-1 text-[28px] font-bold text-[#1a1a2e]">
                Trip Notes
              </h1>
            </div>
          </div>

          <TripNotesBoard
            notes={notes}
            onChange={setNotes}
            description="Use the same note composer from the trip builder to draft reminders before adding them to a plan."
          />
        </div>
      </DashboardPage>
    </DashboardShell>
  );
}
