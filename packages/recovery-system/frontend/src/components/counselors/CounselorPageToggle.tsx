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
    <div className="inline-flex items-center bg-gray-100 rounded-full p-0.5 md:p-1">
      <button
        onClick={() => onTabChange("find")}
        className={`px-3 md:px-5 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-200 ${
          activeTab === "find"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        Find Counselors
      </button>
      <button
        onClick={() => onTabChange("sessions")}
        className={`px-3 md:px-5 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-200 ${
          activeTab === "sessions"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        My Sessions
      </button>
    </div>
  );
}
