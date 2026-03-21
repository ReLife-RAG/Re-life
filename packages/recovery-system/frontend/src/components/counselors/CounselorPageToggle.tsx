"use client";

// =============================================================================
// CounselorPageToggle.tsx
// The pill-shaped toggle at the top right of the page that switches between
// "Find Counselors" (the main listing view) and "My Sessions" (booked sessions).
// The active tab gets a white background + shadow; the inactive one is plain text.
// =============================================================================

interface CounselorPageToggleProps {
  activeTab: "find" | "sessions";
  onTabChange: (tab: "find" | "sessions") => void; // Lifts tab state up to CounselorsPage
}

export default function CounselorPageToggle({
  activeTab,
  onTabChange,
}: CounselorPageToggleProps) {
  return (
    <div className="inline-flex items-center rounded-xl p-1 border border-[#DDE9E8] bg-[#F4F9F8]">
      <button
        onClick={() => onTabChange("find")}
        className={`px-3 md:px-5 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 ${
          activeTab === "find"
            ? "bg-white text-[#0f2420] shadow-sm"
            : "text-[#6b8a87] hover:text-[#2d4a47]"
        }`}
      >
        Find Counselors
      </button>
      <button
        onClick={() => onTabChange("sessions")}
        className={`px-3 md:px-5 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 ${
          activeTab === "sessions"
            ? "bg-white text-[#0f2420] shadow-sm"
            : "text-[#6b8a87] hover:text-[#2d4a47]"
        }`}
      >
        My Sessions
      </button>
    </div>
  );
}
