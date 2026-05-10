"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { DashboardPage } from "@/components/layout/dashboard-page";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiRequest, getSelectedTripId, setSelectedTripId } from "@/lib/api";
import { BudgetSummary, Trip } from "@/lib/types";

type ApiData<T> = {
  success: boolean;
  data: T;
};

type BudgetForm = {
  totalBudget: string;
  transportBudget: string;
  stayBudget: string;
  activityBudget: string;
  mealBudget: string;
  otherBudget: string;
};

const emptyForm: BudgetForm = {
  totalBudget: "",
  transportBudget: "",
  stayBudget: "",
  activityBudget: "",
  mealBudget: "",
  otherBudget: "",
};

const colors = ["#0d6e6e", "#f59e0b", "#3d52a0", "#10b981", "#ef4444"];

export default function BudgetScreen() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [tripId, setTripId] = useState("");
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [form, setForm] = useState<BudgetForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const urlTripId = new URLSearchParams(window.location.search).get("tripId");

    async function loadTrips() {
      try {
        const payload = await apiRequest<ApiData<Trip[]>>("/api/trips/user/all?sort=startDate&order=desc");
        const loadedTrips = payload.data || [];
        const nextTripId = urlTripId || getSelectedTripId() || loadedTrips[0]?.id || "";
        setTrips(loadedTrips);
        setTripId(nextTripId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load trips");
        setLoading(false);
      }
    }

    loadTrips();
  }, []);

  useEffect(() => {
    if (!tripId) return;
    loadBudget(tripId);
  }, [tripId]);

  async function loadBudget(id: string) {
    try {
      setLoading(true);
      setError("");
      setSelectedTripId(id);
      const payload = await apiRequest<ApiData<BudgetSummary>>(`/api/trips/${id}/budget`).catch(async () => {
        const expensePayload = await apiRequest<ApiData<{ totalBudget: number; remainingBudget: number; totalSpent: number; categoryTotals: Record<string, number>; paidTotal: number; unpaidTotal: number }>>(`/api/trips/${id}/expenses/summary`);
        return {
          success: true,
          data: {
            budget: null,
            currency: "INR",
            spentAmount: expensePayload.data.totalSpent,
            remainingAmount: expensePayload.data.remainingBudget,
            categoryTotals: expensePayload.data.categoryTotals,
            paidTotal: expensePayload.data.paidTotal,
            unpaidTotal: expensePayload.data.unpaidTotal,
          },
        };
      });
      setSummary(payload.data);
      setForm(payload.data.budget ? {
        totalBudget: String(payload.data.budget.totalBudget || ""),
        transportBudget: String(payload.data.budget.transportBudget || ""),
        stayBudget: String(payload.data.budget.stayBudget || ""),
        activityBudget: String(payload.data.budget.activityBudget || ""),
        mealBudget: String(payload.data.budget.mealBudget || ""),
        otherBudget: String(payload.data.budget.otherBudget || ""),
      } : emptyForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load budget");
    } finally {
      setLoading(false);
    }
  }

  async function saveBudget(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!tripId || !form.totalBudget) {
      toast.error("Total budget is required");
      return;
    }

    const body = Object.fromEntries(
      Object.entries(form).map(([key, value]) => [key, Number(value || 0)]),
    );

    try {
      setSaving(true);
      const method = summary?.budget ? "PATCH" : "POST";
      await apiRequest(`/api/trips/${tripId}/budget`, {
        method,
        body,
      });
      await loadBudget(tripId);
      toast.success("Budget saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to save budget");
    } finally {
      setSaving(false);
    }
  }

  const chartData = useMemo(() => {
    if (!summary) return [];
    const budgets = {
      TRANSPORT: Number(form.transportBudget || 0),
      STAY: Number(form.stayBudget || 0),
      ACTIVITY: Number(form.activityBudget || 0),
      MEAL: Number(form.mealBudget || 0),
      OTHER: Number(form.otherBudget || 0),
    };

    return Object.keys({ ...budgets, ...summary.categoryTotals }).map((category) => ({
      category,
      budget: budgets[category as keyof typeof budgets] || 0,
      spent: summary.categoryTotals[category] || 0,
    }));
  }, [form, summary]);

  const totalBudget = Number(form.totalBudget || summary?.budget?.totalBudget || 0);
  const spent = summary?.spentAmount || 0;
  const remaining = totalBudget - spent;

  return (
    <DashboardShell>
      <DashboardPage>
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-[#6b7280]">Budget insights</p>
              <h1 className="mt-1 text-[28px] font-bold">Itinerary View with Budget</h1>
            </div>
            <select
              value={tripId}
              onChange={(event) => setTripId(event.target.value)}
              className="h-11 rounded-xl border border-black/10 bg-white px-3 text-sm outline-none"
            >
              <option value="">Select trip</option>
              {trips.map((trip) => (
                <option key={trip.id} value={trip.id}>{trip.name}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 rounded-xl bg-white p-4 text-sm text-[#6b7280]">
              <Loader2 size={16} className="animate-spin" /> Loading budget...
            </div>
          ) : error ? (
            <Notice tone="error" text={error} />
          ) : !tripId ? (
            <Notice text="Select a trip to manage budget." />
          ) : (
            <>
              <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Total Budget" value={`$${totalBudget}`} />
                <StatCard label="Total Spent" value={`$${spent}`} tone="red" />
                <StatCard label="Remaining" value={`$${remaining}`} tone={remaining < 0 ? "red" : "green"} />
                <StatCard label="Spent %" value={`${totalBudget ? Math.round((spent / totalBudget) * 100) : 0}%`} />
              </section>

              <form onSubmit={saveBudget} className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold">Budget of this section</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {Object.keys(form).map((key) => (
                    <Input
                      key={key}
                      label={key.replace("Budget", " Budget")}
                      type="number"
                      min="0"
                      value={form[key as keyof BudgetForm]}
                      onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                    />
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Budget"}</Button>
                  <Link href={`/expenses?tripId=${tripId}`}><Button type="button" variant="secondary">View Expenses</Button></Link>
                </div>
              </form>

              <section className="grid gap-6 lg:grid-cols-2">
                <Card className="p-5">
                  <h3 className="mb-4 text-lg font-semibold">Budget vs Spent</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="budget" fill="#0d6e6e" name="Budget" />
                      <Bar dataKey="spent" fill="#f59e0b" name="Spent" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
                <Card className="p-5">
                  <h3 className="mb-4 text-lg font-semibold">Spending Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={chartData} dataKey="spent" nameKey="category" outerRadius={100} label>
                        {chartData.map((_, index) => (
                          <Cell key={index} fill={colors[index % colors.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </section>
            </>
          )}
        </div>
      </DashboardPage>
    </DashboardShell>
  );
}

function StatCard({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "red" | "green" }) {
  const color = tone === "red" ? "text-red-600" : tone === "green" ? "text-green-600" : "text-[#1a1a2e]";
  return (
    <Card className="p-5">
      <p className="text-sm text-[#6b7280]">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${color}`}>{value}</p>
    </Card>
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
