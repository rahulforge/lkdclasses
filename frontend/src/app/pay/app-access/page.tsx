"use client";

const APP_DOWNLOAD_URL = String(process.env.NEXT_PUBLIC_APP_DOWNLOAD_URL ?? "").trim();

export default function AppAccessPayPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-slate-100 px-4 py-10">
      <section className="mx-auto w-full max-w-2xl rounded-3xl border border-indigo-400/20 bg-slate-900/70 p-6 shadow-[0_24px_80px_rgba(30,64,175,0.35)] backdrop-blur md:p-8 text-center">
        <h1 className="text-2xl font-bold text-white md:text-3xl">Download LKD Classes App</h1>
        <p className="mt-2 text-sm text-slate-300 md:text-base">
          Latest app download link below.
        </p>

        {APP_DOWNLOAD_URL ? (
          <a
            href={APP_DOWNLOAD_URL}
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-emerald-400 px-6 py-3 text-sm font-bold text-slate-900 transition hover:bg-emerald-300"
          >
            Download App
          </a>
        ) : (
          <p className="mt-6 text-xs text-amber-300">
            Set NEXT_PUBLIC_APP_DOWNLOAD_URL to enable direct download.
          </p>
        )}
      </section>
    </main>
  );
}
