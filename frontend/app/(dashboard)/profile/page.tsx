"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { Camera, Edit2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { DashboardPage } from "@/components/layout/dashboard-page";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { apiImageUrl, apiRequest, setSelectedTripId } from "@/lib/api";
import { useAppContext } from "@/lib/context";
import { Trip, User } from "@/lib/types";

type MeResponse = {
  success: boolean;
  data: {
    user: User;
    stats: {
      tripSummaries: Trip[];
      upcomingTrips: Trip[];
      totalSpent: number;
      tripCount: number;
      savedCityCount: number;
    };
  };
};

type ApiData<T> = {
  success: boolean;
  data: T;
};

type ProfileForm = {
  firstName: string;
  lastName: string;
  phone: string;
  city: string;
  country: string;
  addInfo: string;
};

export default function ProfileScreen() {
  const { refreshUser } = useAppContext();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<MeResponse["data"]["stats"] | null>(null);
  const [preplannedTrips, setPreplannedTrips] = useState<Trip[]>([]);
  const [form, setForm] = useState<ProfileForm>({
    firstName: "",
    lastName: "",
    phone: "",
    city: "",
    country: "",
    addInfo: "",
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      setError("");
      const [mePayload, preplannedPayload] = await Promise.all([
        apiRequest<MeResponse>("/api/users/me"),
        apiRequest<ApiData<Trip[]>>("/api/trips/preplanned?take=6").catch(() => ({
          success: false,
          data: [] as Trip[],
        })),
      ]);
      const nextUser = mePayload.data.user;
      setUser(nextUser);
      setStats(mePayload.data.stats);
      setPreplannedTrips(preplannedPayload.data || []);
      setForm({
        firstName: nextUser.firstName || "",
        lastName: nextUser.lastName || "",
        phone: nextUser.phone || "",
        city: nextUser.city || "",
        country: nextUser.country || "",
        addInfo: nextUser.addInfo || "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load profile");
    } finally {
      setLoading(false);
    }
  }

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      const payload = await apiRequest<ApiData<User>>("/api/users/me", {
        method: "PATCH",
        body: form,
      });
      setUser(payload.data);
      await refreshUser();
      setEditing(false);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to update profile");
    } finally {
      setSaving(false);
    }
  }

  async function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("photo", file);
      const payload = await apiRequest<ApiData<User>>("/api/users/photo", {
        method: "PATCH",
        body: formData,
      });
      setUser(payload.data);
      await refreshUser();
      toast.success("Profile photo updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to upload photo");
    }
  }

  async function cloneTrip(tripId: string) {
    try {
      const payload = await apiRequest<ApiData<Trip>>(`/api/trips/preplanned/${tripId}/clone`, {
        method: "POST",
      });
      setSelectedTripId(payload.data.id);
      toast.success("Preplanned trip added");
      await loadProfile();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to add preplanned trip");
    }
  }

  return (
    <DashboardPage>
      <div className="space-y-8">
        <div>
          <p className="text-sm font-medium text-[#6b7280]">Account</p>
          <h1 className="mt-1 text-[28px] font-bold text-[#1a1a2e]">User Profile</h1>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 rounded-xl bg-white p-4 text-sm text-[#6b7280]">
            <Loader2 size={16} className="animate-spin" /> Loading profile...
          </div>
        ) : error ? (
          <Notice tone="error" text={error} />
        ) : user ? (
          <>
            <section className="grid gap-6 rounded-2xl border border-black/10 bg-white p-6 shadow-sm lg:grid-cols-[220px_1fr]">
              <div className="flex flex-col items-center gap-3">
                <div className="h-40 w-40 overflow-hidden rounded-full border border-black/10 bg-[#f3f4f6]">
                  {user.photo ? (
                    <img src={apiImageUrl(user.photo)} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-[#0d6e6e]">
                      {(user.firstName?.[0] || user.email[0]).toUpperCase()}
                    </div>
                  )}
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-black/10 px-3 py-2 text-sm font-medium hover:bg-black/5">
                  <Camera size={16} /> Upload Photo
                  <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={handlePhotoChange} />
                </label>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {user.firstName || "Traveler"} {user.lastName || ""}
                    </h2>
                    <p className="text-sm text-[#6b7280]">{user.email}</p>
                  </div>
                  <Button type="button" variant="secondary" onClick={() => setEditing((current) => !current)}>
                    <Edit2 size={16} /> {editing ? "Cancel" : "Edit Profile"}
                  </Button>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {(["firstName", "lastName", "phone", "city", "country"] as const).map((field) => (
                    <input
                      key={field}
                      value={form[field]}
                      disabled={!editing}
                      onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))}
                      placeholder={field}
                      className="h-11 rounded-xl border border-black/10 bg-white px-3 text-sm outline-none disabled:bg-black/5"
                    />
                  ))}
                </div>
                <textarea
                  value={form.addInfo}
                  disabled={!editing}
                  onChange={(event) => setForm((current) => ({ ...current, addInfo: event.target.value }))}
                  placeholder="Additional information"
                  className="min-h-28 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none disabled:bg-black/5"
                />
                {editing ? (
                  <Button type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                ) : null}
              </form>
            </section>

            <section className="grid gap-4 sm:grid-cols-3">
              <StatCard label="Trips" value={stats?.tripCount || 0} />
              <StatCard label="Saved Cities" value={stats?.savedCityCount || 0} />
              <StatCard label="Total Spent" value={`$${Math.round(stats?.totalSpent || 0)}`} />
            </section>

            <TripSection title="Preplanned Trips" trips={preplannedTrips} actionLabel="Add to My Trips" onAction={cloneTrip} />
            <TripSection title="Previous Trips" trips={stats?.tripSummaries || []} actionLabel="View" />
          </>
        ) : null}
      </div>
    </DashboardPage>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="p-5">
      <p className="text-sm text-[#6b7280]">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </Card>
  );
}

function TripSection({
  title,
  trips,
  actionLabel,
  onAction,
}: {
  title: string;
  trips: Trip[];
  actionLabel: string;
  onAction?: (tripId: string) => void;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      {trips.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trips.slice(0, 6).map((trip) => (
            <Card key={trip.id} className="flex min-h-44 flex-col justify-between p-5">
              <div>
                <h3 className="font-semibold">{trip.name}</h3>
                <p className="mt-2 text-sm text-[#6b7280]">{trip.description || "No description"}</p>
              </div>
              {onAction ? (
                <Button type="button" onClick={() => onAction(trip.id)} className="mt-4">
                  {actionLabel}
                </Button>
              ) : (
                <Link href={`/trip-itinerary?tripId=${trip.id}`} onClick={() => setSelectedTripId(trip.id)}>
                  <Button type="button" className="mt-4 w-full">
                    {actionLabel}
                  </Button>
                </Link>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Notice text={`No ${title.toLowerCase()} yet.`} />
      )}
    </section>
  );
}

function Notice({ text, tone = "muted" }: { text: string; tone?: "muted" | "error" }) {
  return (
    <div className={`rounded-xl border px-4 py-6 text-center text-sm ${
      tone === "error"
        ? "border-red-200 bg-red-50 text-red-700"
        : "border-dashed border-black/15 bg-white text-[#6b7280]"
    }`}>
      {text}
    </div>
  );
}
