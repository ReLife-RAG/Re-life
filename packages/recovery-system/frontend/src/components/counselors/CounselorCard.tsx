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
  const availabilityLabel =
    counselor.availability === "available_today"
      ? "Available Today"
      : counselor.availability === "next_monday"
      ? "This Week"
      : "Next Week";

  return (
    <div className="bg-white rounded-3xl border border-[#DDE9E8] shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group p-5">

      {/* Top section — avatar, name, title, specialization tags, star rating */}
      <div>
        <div className="flex gap-4">
          {/* Profile photo with a green online dot if available today */}
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-full overflow-hidden">
              <img
                src={counselor.image}
                alt={counselor.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            {isAvailableToday && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#86D293] border-2 border-white rounded-full" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-[#0f2420] text-base leading-tight">{counselor.name}</h3>
                <p className="text-xs text-[#6b8a87] mt-0.5">{counselor.title} · {counselor.experience} yrs</p>
              </div>
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${isAvailableToday ? "bg-[#EAF7ED] text-[#5fa86e] border-[#b0dfc4]" : "bg-[#EBF4F4] text-[#4A7C7C] border-[#CFE1E1]"}`}>
                {availabilityLabel}
              </span>
              <StarRating rating={counselor.rating} />
            </div>

            {/* Specialty tags — one green pill per specialization */}
            <div className="flex flex-wrap gap-1 mt-2">
              {counselor.specialty.map((s) => (
                <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-[#EBF4F4] text-[#4A7C7C] font-medium">
                  {s}
                </span>
              ))}
            </div>

            {!!counselor.bio && (
              <p className="text-xs text-[#2d4a47] mt-2 leading-relaxed">
                {counselor.bio.length > 120 ? `${counselor.bio.slice(0, 120)}...` : counselor.bio}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom footer — availability status, price, and the "View & Book" CTA button */}
      <div className="mt-4 pt-4 border-t border-[#DDE9E8] flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
          {/* Green dot = available today, amber dot = coming up later */}
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isAvailableToday ? "bg-[#86D293]" : "bg-[#4A7C7C]"}`} />
            <span className={`text-xs font-semibold uppercase tracking-wide ${isAvailableToday ? "text-[#5fa86e]" : "text-[#4A7C7C]"}`}>
              {availabilityLabel}
            </span>
          </div>
          <span className="text-sm font-semibold text-[#0f2420]">
            ${counselor.fee}
            <span className="text-xs font-normal text-[#6b8a87]"> / session</span>
          </span>
        </div>

        {/* Clicking this passes the counselor up to the parent to open the BookingModal */}
        <button
          onClick={() => onBook(counselor)}
          className="w-full md:w-auto px-4 py-2 rounded-xl border border-transparent bg-gradient-to-r from-[#4A7C7C] to-[#86D293] text-white text-xs font-semibold hover:opacity-95 transition-all duration-200"
        >
          View & Book
        </button>
      </div>
    </div>
  );
}
