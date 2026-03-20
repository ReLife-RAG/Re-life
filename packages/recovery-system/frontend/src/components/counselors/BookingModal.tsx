"use client";

// =============================================================================
// BookingModal.tsx
// The popup that opens when a user clicks "View & Book" on a counselor card.
// Split into two panels:
//   Left  — dark green panel showing the counselor's photo, name, rating & reviews
//   Right — white panel with time slot picker, fee breakdown, and confirm button
// The modal closes when clicking the backdrop or the X button.
// The confirm button is disabled until a time slot is selected.
// =============================================================================

import { useState } from "react";
import { Counselor } from "@/components/counselors/types";

interface BookingModalProps {
  counselor: Counselor;
  onClose: () => void;
  onConfirm: (slot: string) => void; // Sends the selected time back to the parent on confirm
}

export default function BookingModal({ counselor, onClose, onConfirm }: BookingModalProps) {

  // Tracks which time slot the user has clicked — null means none selected yet
  const [selected, setSelected] = useState<string | null>(null);

  // Fee calculation — 5% tax added on top of the base session fee
  const TAX_RATE = 0.05;
  const tax = counselor.fee * TAX_RATE;
  const total = counselor.fee + tax;

  // Shows today's date in the slot section header, e.g. "OCT 24"
  const today = new Date();
  const dateLabel = today.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-2xl w-full max-w-2xl min-h-[400px]">

        {/* ── Left Panel: Counselor profile summary ── */}
        <div
          className="flex flex-col items-center justify-center px-6 py-8 md:py-10 gap-5 w-full md:w-[240px] bg-[#3d8b7a]"
        >
          {/* X button in the top-left corner of the modal */}
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

          {/* Counselor profile photo */}
          <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-white/30 shadow-lg">
            <img src={counselor.image} alt={counselor.name} className="w-full h-full object-cover" />
          </div>

          {/* Name and professional title */}
          <div className="text-center">
            <h3 className="text-white font-bold text-lg leading-tight">{counselor.name}</h3>
            <p className="text-white/70 text-sm mt-1">{counselor.title}</p>
          </div>

          {/* Two stat boxes — rating and total reviews */}
          <div className="flex gap-3 w-full">
            <div className="flex-1 bg-white/10 rounded-xl p-3 text-center">
              <p className="text-white font-bold text-lg">{counselor.rating}</p>
              <p className="text-white/60 text-xs uppercase tracking-wide mt-0.5">Rating</p>
            </div>
            <div className="flex-1 bg-white/10 rounded-xl p-3 text-center">
              <p className="text-white font-bold text-lg">{counselor.reviews}</p>
              <p className="text-white/60 text-xs uppercase tracking-wide mt-0.5">Reviews</p>
            </div>
          </div>
        </div>

        {/* ── Right Panel: Booking form ── */}
        <div className="flex-1 bg-white px-6 md:px-8 py-8 flex flex-col">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-5">Book a Session</h2>

          {/* Time slot grid — greyed out if unavailable, green if selected */}
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Available Slots ({dateLabel})
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-6">
            {counselor.availableSlots.map((slot) => (
              <button
                key={slot.time}
                disabled={!slot.available}
                onClick={() => setSelected(slot.time)}
                className={`py-2 rounded-lg text-sm font-medium border transition-all ${
                  !slot.available
                    ? "border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50"
                    : selected === slot.time
                    ? "bg-[#4caf7d] border-[#4caf7d] text-white shadow-md"
                    : "border-gray-200 text-gray-700 hover:border-[#4caf7d] hover:text-[#4caf7d]"
                }`}
              >
                {slot.time}
              </button>
            ))}
          </div>

          {/* Fee breakdown — session fee + 5% tax + total in green */}
          <div className="bg-gray-50 rounded-xl p-4 mb-5">
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

          {/* Confirm button — disabled (grey) until a slot is selected */}
          <button
            disabled={!selected}
            onClick={() => selected && onConfirm(selected)}
            className={`w-full py-3 rounded-full font-semibold text-sm transition-all ${
              selected
                ? "bg-[#4caf7d] hover:bg-[#3d9e6d] text-white shadow-md hover:shadow-lg"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {selected ? `Confirm Booking – ${selected}` : "Select a time slot"}
          </button>
        </div>

      </div>
    </div>
  );
}
