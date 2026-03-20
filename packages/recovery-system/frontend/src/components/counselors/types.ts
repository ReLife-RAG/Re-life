// =============================================================================
// types.ts — Shared TypeScript types for the entire Counselors feature.
// Import these into any component that deals with counselor data or filters.
// =============================================================================

// Represents how soon a counselor is available (used for badge display on cards)
export type AvailabilityStatus = "available_today" | "next_monday" | "next_week";

// A single time slot in the booking modal — tracks the time and whether it's already taken
export interface TimeSlot {
  time: string;
  start?: string;
  end?: string;
  available: boolean;
}

// Full counselor profile shape — mirrors what GET /api/counselors will return in production
export interface Counselor {
  id: string;
  userId?: string;
  name: string;
  title: string;
  specialty: string[];
  rating: number;
  reviews: number;
  fee: number;
  availability: AvailabilityStatus;
  availableSlots: TimeSlot[];
  image: string;
  bio: string;
  experience: number;
}

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export interface SessionBooking {
  id: string;
  counselorId: string;
  counselorName: string;
  counselorImage?: string;
  slotStart: string;
  slotEnd: string;
  fee: number;
  status: BookingStatus;
  contactEmail?: string;
  notes?: string;
}

// Allowed values for the specialization checkboxes in the filter sidebar
export type SpecializationFilter = "Trauma" | "Addiction" | "Anxiety" | "Family";

// Allowed values for the availability dropdown in the filter sidebar
export type AvailabilityFilter = "Anytime" | "Available Today" | "This Weekend";

// Combined filter state — lives in CounselorsPage and passed down to CounselorFilters
export interface FilterState {
  specializations: SpecializationFilter[];
  availability: AvailabilityFilter;
}
