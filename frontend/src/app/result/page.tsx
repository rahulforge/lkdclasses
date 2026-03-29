"use client";

import { useState } from "react";
import { resultService, type TseresultRow } from "@/services/resultService";

const RESULT_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export default function ResultLookupPage() {
  const [rollNumber, setRollNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [className, setClassName] = useState("");
  const [result, setResult] = useState<TseresultRow | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [downloadError, setDownloadError] = useState("");
  const [downloadSuccess, setDownloadSuccess] = useState("");

  const handleLookup = async () => {
    try {
      if (downloading) return;
      setLoading(true);
      setError("");
      setDownloadSuccess("");
      setResult(null);

    const roll = rollNumber.trim();
const cls = className.trim();

if (!cls && !roll) {
  throw new Error("Select class and enter roll number");
}

if (!cls) {
  throw new Error("Please select class");
}

if (!roll) {
  throw new Error("Please enter roll number");
}

      try {
        const cachedRaw = localStorage.getItem(`tse_result_${cls}_${roll}`);
        if (cachedRaw) {
          const cached = JSON.parse(cachedRaw) as { ts: number; row: TseresultRow };
          if (cached?.ts && cached?.row && Date.now() - cached.ts < RESULT_CACHE_TTL_MS) {
            setResult(cached.row);
            return;
          }
          localStorage.removeItem(`tse_result_${cls}_${roll}`);
        }
      } catch {
        // ignore cache errors
      }

      const row = await resultService.getTseResult(roll, cls);
      if (!row) {
        throw new Error("Result not found for this roll number");
      }
      setResult(row);

      try {
        localStorage.setItem(
          `tse_result_${cls}_${roll}`,
          JSON.stringify({ ts: Date.now(), row })
        );
      } catch {
        // ignore cache errors
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unable to fetch result");
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = async () => {
    if (!result || downloading) return;
    try {
      setDownloading(true);
      setDownloadError("");
      setDownloadProgress(null);
      setDownloadSuccess("");

      let fakeTimer: ReturnType<typeof setInterval> | null = null;
      let fakeValue = 0;
      let hasFirstChunk = false;
      const cacheKey = `tse_cert_${result.rollNumber}`;
      const now = Date.now();
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

      const downloadFromDataUrl = (dataUrl: string) => {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `TSE-${result.rollNumber}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
      };

      try {
        const cachedRaw = localStorage.getItem(cacheKey);
        if (cachedRaw) {
          const cached = JSON.parse(cachedRaw) as { ts: number; dataUrl: string };
          if (cached?.ts && cached?.dataUrl && now - cached.ts < sevenDaysMs) {
            downloadFromDataUrl(cached.dataUrl);
            setDownloadSuccess("Your certificate downloaded successfully.");
            return;
          }
          localStorage.removeItem(cacheKey);
        }
      } catch {
        // ignore cache errors
      }

      const startFakeProgress = () => {
        if (fakeTimer) return;
        fakeTimer = setInterval(() => {
          if (!hasFirstChunk) return;
          fakeValue = Math.min(
            fakeValue + Math.max(1, Math.round((100 - fakeValue) * 0.08)),
            96
          );
          setDownloadProgress((prev) => (prev === null || prev < fakeValue ? fakeValue : prev));
        }, 180);
      };

      const url =
        result.certificateUrl ||
        `/api/certificates/tse?roll=${encodeURIComponent(result.rollNumber)}`;
      const res = await fetch(url);
      if (!res.ok || !res.body) {
        throw new Error("Certificate download failed");
      }

      const total = Number(res.headers.get("content-length")) || 0;
      if (!total) {
        startFakeProgress();
      }
      const reader = res.body.getReader();
      const chunks: Uint8Array[] = [];
      let received = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          if (!hasFirstChunk) {
            hasFirstChunk = true;
            setDownloadProgress(5);
          }
          chunks.push(value);
          received += value.length;
          if (total > 0) {
            const nextValue = Math.min(99, Math.round((received / total) * 100));
            setDownloadProgress(nextValue);
          }
        }
      }

      if (fakeTimer) {
        clearInterval(fakeTimer);
      }
      setDownloadProgress(100);

      const blob = new Blob(chunks, { type: "application/pdf" });
      const blobUrl = URL.createObjectURL(blob);
      downloadFromDataUrl(blobUrl);

      try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(new Error("Failed to cache certificate"));
          reader.readAsDataURL(blob);
        });
        localStorage.setItem(cacheKey, JSON.stringify({ ts: now, dataUrl }));
      } catch {
        // ignore cache errors (quota or browser restrictions)
      } finally {
        URL.revokeObjectURL(blobUrl);
      }
      setDownloadSuccess("Your certificate downloaded successfully.");
    } catch (e: unknown) {
      setDownloadError(e instanceof Error ? e.message : "Download failed");
    } finally {
      setTimeout(() => setDownloadProgress(null), 600);
      setDownloading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-slate-100 px-4 py-26">
      <section className="mx-auto w-full max-w-3xl rounded-3xl border border-indigo-400/20 bg-slate-900/70 p-6 shadow-[0_24px_80px_rgba(30,64,175,0.35)] backdrop-blur md:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white md:text-3xl">TSE Result</h1>
          <p className="mt-2 text-sm text-slate-300 md:text-base">
            Roll number daalkar apna TSE result dekhein.
          </p>
        </div>

        <div className="grid gap-4 rounded-2xl border border-slate-700/70 bg-slate-950/70 p-4">
        <div>
  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
    Class
  </label>
  <select
  value={className}
  onChange={(e) => setClassName(e.target.value)}
  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white"
>
  <option value="">Select Class</option>
  <option value="6">Class 6</option>
  <option value="7">Class 7</option>
  <option value="8">Class 8</option>
  <option value="9">Class 9</option>
  <option value="10">Class 10</option>
  <option value="11">Class 11</option>
  <option value="12">Class 12</option>
</select>
</div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">Roll Number</label>
            <input
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              placeholder="Enter roll number"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-indigo-500"
              disabled={downloading}
            />
          </div>
          <button
            type="button"
            onClick={handleLookup}
            disabled={loading || downloading || !className || !rollNumber}
            className="rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Checking..." : "Check Result"}
          </button>
        </div>

        {error && (
          <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </p>
        )}

        {!result && !loading && !error && (
          <div className="mt-6 rounded-xl border border-slate-700 bg-slate-950/70 p-4 text-sm text-slate-300">
            Enter roll number to view result.
          </div>
        )}

        {result && (
          <div className="mt-6 bg-white text-slate-900 rounded-2xl shadow p-5">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-indigo-700">{result.examName ?? "TSE"}</h3>
                <p className="text-sm text-gray-500">Date: {result.testDate ? String(result.testDate).slice(0, 10) : "-"}</p>
              </div>
              <div className="text-sm text-gray-600">
                Roll: <span className="font-semibold">{result.rollNumber}</span>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3">
                <p className="text-xs uppercase text-indigo-600">Name</p>
                <p className="font-semibold">{result.name || "-"}</p>
              </div>
              <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3">
                <p className="text-xs uppercase text-indigo-600">Rank</p>
                <p className="font-semibold">{result.rank ?? "-"}</p>
              </div>
              <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3">
                <p className="text-xs uppercase text-indigo-600">Percentage</p>
                <p className="font-semibold">{result.percentage ?? "-"}%</p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-gray-200 p-3">
                <p className="text-xs uppercase text-gray-500">Right</p>
                <p className="text-lg font-semibold">{result.rightCount ?? "-"}</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-3">
                <p className="text-xs uppercase text-gray-500">Wrong</p>
                <p className="text-lg font-semibold">{result.wrongCount ?? "-"}</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-3">
                <p className="text-xs uppercase text-gray-500">Total</p>
                <p className="text-lg font-semibold">{result.total ?? "-"}</p>
              </div>
            </div>

            <div className="mt-5">
              <button
                type="button"
                onClick={downloadCertificate}
                disabled={downloading}
                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {downloading ? "Downloading..." : "Download Certificate"}
              </button>
              {downloading && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>
                      {downloadProgress === null
                        ? "Preparing your certificate..."
                        : "Downloading certificate"}
                    </span>
                    <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                      {downloadProgress === null ? "..." : `${downloadProgress}%`}
                    </span>
                  </div>
                  <div className="relative mt-2 h-2.5 w-full overflow-hidden rounded-full bg-indigo-100">
                    <div
                      className="h-2.5 rounded-full bg-gradient-to-r from-indigo-500 via-sky-400 to-indigo-600 transition-all"
                      style={{ width: downloadProgress === null ? "100%" : `${downloadProgress}%` }}
                    />
                    {downloadProgress === null && (
                      <div className="absolute inset-0 animate-[pulse_1.2s_ease-in-out_infinite] bg-white/30" />
                    )}
                  </div>
                </div>
              )}
              {downloadError && (
                <p className="mt-3 text-xs text-red-600">{downloadError}</p>
              )}
              {downloadSuccess && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] text-white">
                    ?
                  </span>
                  {downloadSuccess}
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

// Coming Soon backup:
// export default function ResultLookupPage() {
//   return (
//     <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-slate-100 px-4 py-50">
//       <section className="mx-auto w-full max-w-3xl rounded-3xl border border-indigo-400/20 bg-slate-900/70 p-10 text-center shadow-[0_24px_80px_rgba(30,64,175,0.35)] backdrop-blur">
//         <p className="text-xs uppercase tracking-[0.35em] text-indigo-200/80">TSE Results</p>
//         <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">Coming Soon</h1>
//         <p className="mt-3 text-sm text-slate-300 md:text-base">
//            Jaldi hi yahan live result aa jayega.
//         </p>
//       </section>
//     </main>
//   );
// }
