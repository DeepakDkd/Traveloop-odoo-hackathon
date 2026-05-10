import Link from "next/link";

export default function Home() {
  return (
    <main className="app-shell flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
      <section className="w-full max-w-5xl rounded-[2rem] border border-slate-200/80 bg-white/70 px-6 py-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:px-10 sm:py-10">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-sky-700/70">
              Traveloop
            </p>
            <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-slate-800 sm:text-5xl">
              Plan trips simply, clearly, and one stop at a time.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
              A calm travel planning workspace for organizing destinations,
              dates, and details without making the experience feel heavy.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-xl bg-slate-800 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-700"
              >
                Create account
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                Open register page
              </Link>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-white/80 p-5">
            <div className="grid gap-4">
              <div className="rounded-[1.25rem] border border-slate-200 bg-sky-50/70 p-4">
                <p className="text-sm font-semibold text-slate-700">
                  Multi-city planning
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Organize cities and travel details in one clean flow.
                </p>
              </div>

              <div className="rounded-[1.25rem] border border-slate-200 bg-emerald-50/60 p-4">
                <p className="text-sm font-semibold text-slate-700">
                  Easy trip setup
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Start with registration, then build the rest of the planner
                  screen by screen.
                </p>
              </div>

              <div className="rounded-[1.25rem] border border-slate-200 bg-violet-50/60 p-4">
                <p className="text-sm font-semibold text-slate-700">
                  Minimal interface
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  A soft visual theme focused on clarity over clutter.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
