"use client";

import { useState, type FormEvent } from "react";
import { FileText, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { TripNote } from "@/features/trips/lib/types";

type NoteComposerProps = {
  notes: TripNote[];
  onChange: (notes: TripNote[]) => void;
  title?: string;
  description?: string;
  className?: string;
};

const initialForm = {
  title: "",
  content: "",
};

function formatCreatedAt(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function TripNotesBoard({
  notes,
  onChange,
  title = "Trip Notes",
  description = "Capture reminders, bookings, and travel details before you save the trip.",
  className,
}: NoteComposerProps) {
  const [isComposerOpen, setIsComposerOpen] = useState(notes.length === 0);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

  function resetComposer() {
    setForm(initialForm);
    setError("");
    setIsComposerOpen(false);
  }

  function handleCreateNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const titleValue = form.title.trim();
    const contentValue = form.content.trim();

    if (!titleValue || !contentValue) {
      setError("Add both a note title and note details.");
      return;
    }

    const nextNote: TripNote = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `note-${Date.now()}`,
      title: titleValue,
      content: contentValue,
      createdAt: new Date().toISOString(),
    };

    onChange([nextNote, ...notes]);
    resetComposer();
  }

  function handleDeleteNote(noteId: string) {
    onChange(notes.filter((note) => note.id !== noteId));
  }

  return (
    <Card className={cn("space-y-5 p-6", className)}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0d6e6e]">
            Notes
          </p>
          <h2 className="mt-2 text-[22px] font-semibold text-[#1a1a2e]">
            {title}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-[#6b7280]">
            {description}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-full bg-[#0d6e6e]/10 px-3 py-1 text-sm font-medium text-[#0d6e6e]">
            {notes.length} {notes.length === 1 ? "note" : "notes"}
          </span>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setIsComposerOpen(true);
              setError("");
            }}
          >
            <Plus size={16} />
            Add Note
          </Button>
        </div>
      </div>

      {isComposerOpen ? (
        <form
          onSubmit={handleCreateNote}
          className="space-y-4 rounded-2xl border border-dashed border-[#0d6e6e]/30 bg-[#f8fffd] p-5"
        >
          <div className="space-y-2">
            <label
              htmlFor="trip-note-title"
              className="text-sm font-medium text-[#1a1a2e]"
            >
              Note title
            </label>
            <input
              id="trip-note-title"
              type="text"
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              className="h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-sm text-[#1a1a2e] outline-none transition-all focus:border-[#0d6e6e] focus:ring-2 focus:ring-[#0d6e6e]/15"
              placeholder="Ex: Check-in instructions"
              maxLength={80}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <label
                htmlFor="trip-note-content"
                className="text-sm font-medium text-[#1a1a2e]"
              >
                Note details
              </label>
              <span className="text-xs text-[#6b7280]">
                {form.content.length}/500
              </span>
            </div>
            <textarea
              id="trip-note-content"
              value={form.content}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  content: event.target.value,
                }))
              }
              className="min-h-32 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-[#1a1a2e] outline-none transition-all focus:border-[#0d6e6e] focus:ring-2 focus:ring-[#0d6e6e]/15"
              placeholder="Add confirmations, addresses, reminders, or anything else worth keeping."
              maxLength={500}
            />
          </div>

          {error ? (
            <p className="text-sm text-[#ef4444]">{error}</p>
          ) : null}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={resetComposer}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Note
            </Button>
          </div>
        </form>
      ) : null}

      {notes.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {notes.map((note) => (
            <div
              key={note.id}
              className="rounded-2xl border border-black/10 bg-[#fbfcfe] p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="truncate text-base font-semibold text-[#1a1a2e]">
                    {note.title}
                  </h3>
                  <p className="mt-1 text-xs text-[#6b7280]">
                    {formatCreatedAt(note.createdAt)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteNote(note.id)}
                  className="text-[#ef4444] hover:bg-[#ef4444]/10 hover:text-[#dc2626]"
                >
                  <Trash2 size={14} />
                </Button>
              </div>

              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#4b5563]">
                {note.content}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-black/10 bg-white px-5 py-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#0d6e6e]/10 text-[#0d6e6e]">
            <FileText size={20} />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-[#1a1a2e]">
            No notes yet
          </h3>
          <p className="mt-2 text-sm text-[#6b7280]">
            Save booking info, packing reminders, or favorite ideas for this trip.
          </p>
        </div>
      )}
    </Card>
  );
}
