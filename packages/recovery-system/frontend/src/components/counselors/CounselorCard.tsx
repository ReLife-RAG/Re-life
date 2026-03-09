"use client";

// =============================================================================
// CounselorCard.tsx
// Displays a single counselor in the grid. Shows their photo, name, title,
// specialization tags, star rating, availability badge, price, and a
// "View & Book" button. Clicking the button opens the BookingModal in the parent.
// =============================================================================

import { Counselor } from "@/components/counselors/types";

interface CounselorCardProps {
  counselor: Counselor;
  onBook: (counselor: Counselor) => void; // Tells the parent which counselor to open the modal for
}

// Renders 5 stars filled/unfilled based on the numeric rating value
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-3.5 h-3.5 ${star <= Math.floor(rating) ? "text-amber-400" : "text-gray-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs text-gray-500 ml-1">{rating}</span>
    </div>
  );
}

export default function CounselorCard({ counselor, onBook }: CounselorCardProps) {
  const isAvailableToday = counselor.availability === "available_today";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group">

      {/* Top section — avatar, name, title, specialization tags, star rating */}
      <div className="p-5">
        <div className="flex gap-4">
          {/* Profile photo with a green online dot if available today */}
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-xl overflow-hidden">
              <img
                src={counselor.image}
                alt={counselor.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            {isAvailableToday && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#4caf7d] border-2 border-white rounded-full" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-gray-900 text-sm leading-tight">{counselor.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{counselor.title}</p>
              </div>
              <StarRating rating={counselor.rating} />
            </div>

            {/* Specialty tags — one green pill per specialization */}
            <div className="flex flex-wrap gap-1 mt-2">
              {counselor.specialty.map((s) => (
                <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-[#e8f5ee] text-[#2d7a55] font-medium">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom footer — availability status, price, and the "View & Book" CTA button */}
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Green dot = available today, amber dot = coming up later */}
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isAvailableToday ? "bg-[#4caf7d]" : "bg-amber-400"}`} />
            <span className={`text-xs font-semibold uppercase tracking-wide ${isAvailableToday ? "text-[#2d7a55]" : "text-amber-600"}`}>
              {isAvailableToday ? "Available Today" : "Next: Monday"}
            </span>
          </div>
          <span className="text-sm font-semibold text-gray-700">
            ${counselor.fee}
            <span className="text-xs font-normal text-gray-400"> / session</span>
          </span>
        </div>

        {/* Clicking this passes the counselor up to the parent to open the BookingModal */}
        <button
          onClick={() => onBook(counselor)}
          className="px-4 py-1.5 rounded-full border border-[#4caf7d] text-[#2d7a55] text-xs font-semibold hover:bg-[#4caf7d] hover:text-white transition-all duration-200"
        >
          View & Book
        </button>
      </div>
    </div>
  );
}
