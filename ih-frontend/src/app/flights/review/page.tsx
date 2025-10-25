"use client";
import { useRouter } from "next/navigation";
import { useFlightSearch } from "@/lib/stores/flightSearch";

export default function ReviewPage() {
  const router = useRouter();
  const { selected, lastSearchPayload } = useFlightSearch();

  if (!selected) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h2 className="text-xl font-semibold mb-2">No Flight Selected</h2>
        <p className="text-gray-500 mb-6">Please go back and select a flight to continue.</p>
        <button onClick={() => router.back()} className="px-4 py-2 bg-slate-700 text-white rounded-lg">Go Back</button>
      </div>
    );
  }

  const r = selected.raw; // normalized object from results
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Review & Continue</h1>
      <div className="p-5 bg-white border rounded-xl shadow-sm">
        <div className="flex justify-between">
          <div>
            <div className="text-sm text-gray-500">{r.airline.code} • {r.airline.flightNumber}</div>
            <div className="text-lg font-semibold">{r.airline.name}</div>
            <div className="text-sm mt-1">{r.leg.from} → {r.leg.to}</div>
          </div>
          <div className="text-right">
            <div className="text-emerald-600 text-2xl font-bold">₹{Math.round(r.fare.offered).toLocaleString()}</div>
            <div className="text-xs text-gray-500">{r.fare.currency}</div>
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <button
            onClick={() => router.push("/flights/ssr")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
          >
            Continue
          </button>
          <button onClick={() => router.back()} className="px-4 py-2 border rounded-lg">Change Flight</button>
        </div>
      </div>

      <pre className="text-xs bg-slate-50 p-3 rounded mt-6 overflow-auto">
        {JSON.stringify({ lastSearchPayload }, null, 2)}
      </pre>
    </div>
  );
}