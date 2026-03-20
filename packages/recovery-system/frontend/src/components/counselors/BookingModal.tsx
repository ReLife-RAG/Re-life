"use client";

import { useMemo, useState } from "react";
import { Counselor, TimeSlot } from "@/components/counselors/types";

interface BookingModalProps {
  counselor: Counselor;
  slots: TimeSlot[];
  loadingSlots: boolean;
  bookingLoading: boolean;
  slotError: string | null;
  onClose: () => void;
  onConfirm: (payload: {
    slotStart: string;
    slotEnd: string;
    contactEmail: string;
    notes?: string;
  }) => Promise<void>;
}

export default function BookingModal({
  counselor,
  slots,
  loadingSlots,
  bookingLoading,
  slotError,
  onClose,
  onConfirm,
}: BookingModalProps) {
  const [selected, setSelected] = useState<TimeSlot | null>(null);
  const [contactEmail, setContactEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const TAX_RATE = 0.05;
  const tax = counselor.fee * TAX_RATE;
  const total = counselor.fee + tax;

  const selectedLabel = useMemo(() => {
    if (!selected?.start) {
      return "";
    }
    return new Date(selected.start).toLocaleString();
  }, [selected]);

  const handleSubmit = async () => {
    if (!selected?.start || !selected?.end) {
      setError("Please select a slot.");
      return;
    }

    const trimmed = contactEmail.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }

    setError(null);
    await onConfirm({
      slotStart: selected.start,
      slotEnd: selected.end,
      contactEmail: trimmed,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-2xl w-full max-w-3xl min-h-[430px]">
        <div className="flex flex-col items-center justify-center px-6 py-8 md:py-10 gap-5 w-full md:w-[250px] bg-[#3d8b7a]">
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute top-4 left-4 w-8 h-8 rounded-full border-2 border-white/60 flex items-center justify-center text-white/80 hover:border-white hover:text-white transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-white/30 shadow-lg">
            <img src={counselor.image} alt={counselor.name} className="w-full h-full object-cover" />
          </div>

          <div className="text-center">
            <h3 className="text-white font-bold text-lg leading-tight">{counselor.name}</h3>
            <p className="text-white/70 text-sm mt-1">{counselor.title}</p>
          </div>
        </div>

        <div className="flex-1 bg-white px-6 md:px-8 py-8 flex flex-col">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Book a Session</h2>

          {slotError && <p className="text-sm text-red-600 mb-2">{slotError}</p>}

          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Available Slots
          </p>

          {loadingSlots ? (
            <p className="text-sm text-gray-500 mb-5">Loading slots...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-5 max-h-44 overflow-auto pr-1">
              {slots.length === 0 ? (
                <p className="text-sm text-gray-500">No available slots right now.</p>
              ) : (
                slots.map((slot) => (
                  <button
                    key={`${slot.start}-${slot.end}`}
                    disabled={!slot.available || !slot.start || !slot.end}
                    onClick={() => setSelected(slot)}
                    className={`py-2 px-2 rounded-lg text-sm font-medium border transition-all ${
                      !slot.available
                        ? "border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50"
                        : selected?.start === slot.start && selected?.end === slot.end
                        ? "bg-[#4caf7d] border-[#4caf7d] text-white shadow-md"
                        : "border-gray-200 text-gray-700 hover:border-[#4caf7d] hover:text-[#4caf7d]"
                    }`}
                  >
                    {slot.time}
                  </button>
                ))
              )}
            </div>
          )}

          <label className="text-xs font-semibold text-gray-500 mb-1">Booking Email</label>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="you@example.com"
            className="mb-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4caf7d]"
          />

          <label className="text-xs font-semibold text-gray-500 mb-1">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any note for the counselor"
            rows={2}
            className="mb-4 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4caf7d]"
          />

          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Session Fee</span>
              <span>${counselor.fee}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mb-3">
              <span>Service Tax</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-3">
              <span>Total</span>
              <span className="text-[#4caf7d]">${total.toFixed(0)}</span>
            </div>
          </div>

          {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

          <button
            disabled={!selected || bookingLoading || slots.length === 0}
            onClick={handleSubmit}
            className={`w-full py-3 rounded-full font-semibold text-sm transition-all ${
              selected && !bookingLoading
                ? "bg-[#4caf7d] hover:bg-[#3d9e6d] text-white shadow-md"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {bookingLoading
              ? "Booking..."
              : selectedLabel
              ? `Confirm Booking - ${selectedLabel}`
              : "Select a time slot"}
          </button>
        </div>
      </div>
    </div>
  );
}
