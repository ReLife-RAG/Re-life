"use client";

// =============================================================================
// page.tsx — The main "Find Your Guide" counselors page.
// This is the root component that owns all state and assembles the full layout:
//
//   [Nav Bar]
//   [Breadcrumb + Title + Tab Toggle]
//   [Filter Sidebar]  |  [Counselor Card Grid]
//   [BookingModal]  (conditionally rendered when a card is clicked)
//   [Success Toast] (conditionally rendered after a booking is confirmed)
//
// State managed here:
//   - activeTab       : which tab is shown ("find" or "sessions")
//   - filters         : current sidebar filter values (passed to CounselorFilters)
//   - filteredCounselors : derived list after applying filters (via useMemo)
//   - selectedCounselor : which counselor's modal is open (null = closed)
//   - bookingSuccess  : toast message after confirming a booking (null = hidden)
// =============================================================================

import { useState, useMemo } from "react";
import CounselorCard from "@/components/counselors/CounselorCard";
import CounselorFilters from "@/components/counselors/CounselorFilters";
import CounselorPageToggle from "@/components/counselors/CounselorPageToggle";
import BookingModal from "@/components/counselors/BookingModal";
import { MOCK_COUNSELORS } from "@/components/counselors/mockData";
import { Counselor, FilterState } from "@/components/counselors/types";

export default function CounselorsPage() {
  const [activeTab, setActiveTab] = useState<"find" | "sessions">("find");
  const [filters, setFilters] = useState<FilterState>({
    specializations: [],
    availability: "Anytime",
  });
  const [selectedCounselor, setSelectedCounselor] = useState<Counselor | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  // Recomputes the visible counselor list whenever filters change.
  // Checks specialization overlap and availability match.
  // When you switch to real API calls, replace MOCK_COUNSELORS with fetched data here.
  const filteredCounselors = useMemo(() => {
    return MOCK_COUNSELORS.filter((c) => {
      if (filters.specializations.length > 0) {
        const hasMatch = filters.specializations.some((s) => c.specialty.includes(s));
        if (!hasMatch) return false;
      }
      if (filters.availability === "Available Today") {
        if (c.availability !== "available_today") return false;
      }
      return true;
    });
  }, [filters]);

  // Called by BookingModal's confirm button — shows a toast then auto-hides it after 4s
  const handleConfirmBooking = (slot: string) => {
    setBookingSuccess(`Session with ${selectedCounselor?.name} booked at ${slot}!`);
    setSelectedCounselor(null);
    setTimeout(() => setBookingSuccess(null), 4000);
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Page Body ─────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8">

        {/* Breadcrumb — "Portal > Counseling" for navigation context */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
          <span>Portal</span>
          <span>›</span>
          <span className="text-gray-600">Counseling</span>
        </div>

        {/* Page title + tab toggle in the same row */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-7">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Find Your Guide</h1>
          <CounselorPageToggle activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* ── Find Counselors Tab ───────────────────────────────────────────
            Two-column layout: filter sidebar on the left, card grid on the right.
            The grid re-renders automatically when filters change (via useMemo).
        ── */}
        {activeTab === "find" ? (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filter sidebar — receives current filters and updates them via onChange */}
            <div className="hidden lg:block">
              <CounselorFilters filters={filters} onChange={setFilters} />
            </div>

            <div className="flex-1">
              {/* Dynamic result count above the grid */}
              <p className="text-sm text-gray-400 mb-4">
                {filteredCounselors.length} counselor{filteredCounselors.length !== 1 ? "s" : ""} found
              </p>

              {/* Empty state — shown when no counselors match the active filters */}
              {filteredCounselors.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 font-medium">No counselors match your filters</p>
                  <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
                </div>
              ) : (
                /* 2-column grid of counselor cards.
                   onBook sets selectedCounselor which triggers the modal to open. */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredCounselors.map((counselor) => (
                    <CounselorCard
                      key={counselor.id}
                      counselor={counselor}
                      onBook={setSelectedCounselor}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

        ) : (
          /* ── My Sessions Tab ───────────────────────────────────────────────
              Placeholder empty state until real booking history is implemented.
              The "Browse Counselors" button switches back to the find tab.
          ── */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-[#e8f5ee] flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-[#4caf7d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-600 font-semibold text-lg">No sessions booked yet</p>
            <p className="text-gray-400 text-sm mt-1 mb-5">Find a counselor and book your first session</p>
            <button
              onClick={() => setActiveTab("find")}
              className="px-5 py-2.5 rounded-full bg-[#4caf7d] text-white text-sm font-semibold hover:bg-[#3d9e6d] transition-colors"
            >
              Browse Counselors
            </button>
          </div>
        )}
      </div>

      {/* ── BookingModal ──────────────────────────────────────────────────────
          Only rendered when a counselor is selected (selectedCounselor !== null).
          Clears selectedCounselor on close; calls handleConfirmBooking on confirm.
      ── */}
      {selectedCounselor && (
        <BookingModal
          counselor={selectedCounselor}
          onClose={() => setSelectedCounselor(null)}
          onConfirm={handleConfirmBooking}
        />
      )}

      {/* ── Success Toast ─────────────────────────────────────────────────────
          Appears at the bottom center after a booking is confirmed.
          Auto-dismisses after 4 seconds via setTimeout in handleConfirmBooking.
      ── */}
      {bookingSuccess && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-4 md:px-5 py-3 rounded-full text-xs md:text-sm font-medium shadow-xl flex items-center gap-2 animate-bounce mx-4">
          <span className="w-5 h-5 rounded-full bg-[#4caf7d] flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </span>
          {bookingSuccess}
        </div>
      )}
    </div>
  );
}
