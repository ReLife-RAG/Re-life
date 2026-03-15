"use client";

// =============================================================================
// CounselorFilters.tsx
// The left sidebar that lets users narrow down the counselor list.
// Contains two filter sections:
//   1. Specialization — multi-select checkboxes (Trauma, Addiction, Anxiety, Family)
//   2. Availability   — single-select options (Anytime, Available Today, This Weekend)
// Does NOT hold its own state — it receives `filters` and calls `onChange`
// so the parent (CounselorsPage) owns the filter state and runs the filtering logic.
// =============================================================================

import { FilterState, SpecializationFilter, AvailabilityFilter } from "@/components/counselors/types";

// All available options — defined here so they're easy to extend later
const SPECIALIZATIONS: SpecializationFilter[] = ["Trauma", "Addiction", "Anxiety", "Family"];
const AVAILABILITY_OPTIONS: AvailabilityFilter[] = ["Anytime", "Available Today", "This Weekend"];

interface CounselorFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

export default function CounselorFilters({ filters, onChange }: CounselorFiltersProps) {

  // Adds the specialization if not selected, removes it if already selected
  const toggleSpecialization = (spec: SpecializationFilter) => {
    const exists = filters.specializations.includes(spec);
    onChange({
      ...filters,
      specializations: exists
        ? filters.specializations.filter((s) => s !== spec)
        : [...filters.specializations, spec],
    });
  };

  // Clears all filters back to defaults — wired to the "RESET" button
  const resetFilters = () => {
    onChange({ specializations: [], availability: "Anytime" });
  };

  return (
    <aside className="w-56 shrink-0">
      {/* Header row with title and reset button */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 010 2H4a1 1 0 01-1-1zm3 6a1 1 0 011-1h10a1 1 0 010 2H7a1 1 0 01-1-1zm4 6a1 1 0 011-1h4a1 1 0 010 2h-4a1 1 0 01-1-1z" />
          </svg>
          <span className="font-semibold text-gray-800 text-sm">Filters</span>
        </div>
        <button type="button" onClick={resetFilters} className="text-xs text-[#4caf7d] font-medium hover:underline">
          RESET
        </button>
      </div>

      {/* Specialization checkboxes — each click calls toggleSpecialization() */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Specialization
        </p>
        <div className="space-y-2.5">
          {SPECIALIZATIONS.map((spec) => {
            const checked = filters.specializations.includes(spec);
            return (
              <label key={spec} className="flex items-center gap-3 cursor-pointer group">
                {/* Custom styled checkbox — green when checked, grey border when not */}
                <div
                  onClick={() => toggleSpecialization(spec)}
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                    checked ? "bg-[#4caf7d] border-[#4caf7d]" : "border-gray-300 group-hover:border-[#4caf7d]"
                  }`}
                >
                  {checked && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className={`text-sm transition-colors ${checked ? "text-gray-900 font-medium" : "text-gray-600"}`}>
                  {spec}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Availability options — selecting one highlights it and deselects the previous */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Availability
        </p>
        <div className="space-y-1.5">
          {AVAILABILITY_OPTIONS.map((option) => {
            const active = filters.availability === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => onChange({ ...filters, availability: option })}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-[#e8f5ee] text-[#2d7a55] border border-[#b2dfca]"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
