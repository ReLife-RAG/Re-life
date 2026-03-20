"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import CounselorCard from "@/components/counselors/CounselorCard";
import CounselorFilters from "@/components/counselors/CounselorFilters";
import CounselorPageToggle from "@/components/counselors/CounselorPageToggle";
import BookingModal from "@/components/counselors/BookingModal";
import { Counselor, FilterState, SessionBooking, TimeSlot } from "@/components/counselors/types";

const API_BASE = "";

type RawCounselor = {
  _id: string;
  userId?: { _id?: string; name?: string; image?: string };
  specializations?: string[];
  rating?: number;
  ratingCount?: number;
  hourlyRate?: number;
  bio?: string;
  credentials?: { yearsOfExperience?: number; degree?: string };
  profileImage?: string;
};

type RawBooking = {
  _id: string;
  counselorId?: {
    _id?: string;
    profileImage?: string;
    userId?: { name?: string };
  };
  slotStart: string;
  slotEnd: string;
  fee: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  contactEmail?: string;
  notes?: string;
};

function toTitleCase(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getAvailability(slotsCount: number) {
  if (slotsCount > 20) {
    return "available_today" as const;
  }
  if (slotsCount > 10) {
    return "next_monday" as const;
  }
  return "next_week" as const;
}

function mapCounselor(c: RawCounselor): Counselor {
  return {
    id: c._id,
    userId: c.userId?._id,
    name: c.userId?.name || "Counselor",
    title: c.credentials?.degree || "Licensed Counselor",
    specialty: (c.specializations || []).map(toTitleCase),
    rating: Number(c.rating || 0),
    reviews: Number(c.ratingCount || 0),
    fee: Number(c.hourlyRate || 0),
    availability: getAvailability((c as any).availableSlots?.length || 0),
    availableSlots: [],
    image: c.profileImage || c.userId?.image || "https://randomuser.me/api/portraits/lego/1.jpg",
    bio: c.bio || "",
    experience: Number(c.credentials?.yearsOfExperience || 0),
  };
}

function mapBooking(b: RawBooking): SessionBooking {
  return {
    id: b._id,
    counselorId: b.counselorId?._id || "",
    counselorName: b.counselorId?.userId?.name || "Counselor",
    counselorImage: b.counselorId?.profileImage,
    slotStart: b.slotStart,
    slotEnd: b.slotEnd,
    fee: b.fee,
    status: b.status,
    contactEmail: b.contactEmail,
    notes: b.notes,
  };
}

function formatSlot(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  return `${s.toLocaleDateString()} ${s.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })} - ${e.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

export default function CounselorsPage() {
  const [activeTab, setActiveTab] = useState<"find" | "sessions">("find");
  const [filters, setFilters] = useState<FilterState>({
    specializations: [],
    availability: "Anytime",
  });

  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [selectedCounselor, setSelectedCounselor] = useState<Counselor | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);

  const [modalSlots, setModalSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [bookings, setBookings] = useState<SessionBooking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState<SessionBooking | null>(null);
  const [rescheduleSlots, setRescheduleSlots] = useState<TimeSlot[]>([]);
  const [selectedRescheduleSlot, setSelectedRescheduleSlot] = useState<TimeSlot | null>(null);
  const [rescheduleLoading, setRescheduleLoading] = useState(false);

  const loadCounselors = useCallback(async () => {
    try {
      setPageError(null);
      const res = await fetch(`${API_BASE}/api/counselor/counselors`, {
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to load counselors");
      }
      setCounselors((json.counselors || []).map(mapCounselor));
    } catch (error: any) {
      setPageError(error?.message || "Failed to load counselors");
    }
  }, []);

  const loadBookings = useCallback(async () => {
    try {
      setBookingsLoading(true);
      const res = await fetch(`${API_BASE}/api/bookings`, {
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to load sessions");
      }
      setBookings((json.bookings || []).map(mapBooking));
    } catch (error: any) {
      setPageError(error?.message || "Failed to load sessions");
    } finally {
      setBookingsLoading(false);
    }
  }, []);

  const loadSlotsForCounselor = useCallback(async (counselorId: string, setIntoReschedule = false) => {
    try {
      if (!setIntoReschedule) {
        setLoadingSlots(true);
        setSlotError(null);
      }
      const res = await fetch(`${API_BASE}/api/counselors/${counselorId}/available-slots`, {
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to fetch slots");
      }

      const slots: TimeSlot[] = (json.slots || []).map((s: { start: string; end: string }) => ({
        time: formatSlot(s.start, s.end),
        start: s.start,
        end: s.end,
        available: true,
      }));

      if (setIntoReschedule) {
        setRescheduleSlots(slots);
      } else {
        setModalSlots(slots);
      }
    } catch (error: any) {
      const message = error?.message || "Failed to load available slots";
      if (setIntoReschedule) {
        setPageError(message);
      } else {
        setSlotError(message);
      }
    } finally {
      if (!setIntoReschedule) {
        setLoadingSlots(false);
      }
    }
  }, []);

  useEffect(() => {
    loadCounselors();
    loadBookings();
  }, [loadCounselors, loadBookings]);

  useEffect(() => {
    if (selectedCounselor) {
      loadSlotsForCounselor(selectedCounselor.id);
    }
  }, [selectedCounselor, loadSlotsForCounselor]);

  const filteredCounselors = useMemo(() => {
    return counselors.filter((c) => {
      if (filters.specializations.length > 0) {
        const hasMatch = filters.specializations.some((s) =>
          c.specialty.some((cs) => cs.toLowerCase().includes(s.toLowerCase()))
        );
        if (!hasMatch) {
          return false;
        }
      }

      if (filters.availability === "Available Today" && c.availability !== "available_today") {
        return false;
      }

      return true;
    });
  }, [counselors, filters]);

  const handleConfirmBooking = async (payload: {
    slotStart: string;
    slotEnd: string;
    contactEmail: string;
    notes?: string;
  }) => {
    if (!selectedCounselor) {
      return;
    }

    try {
      setBookingLoading(true);
      const res = await fetch(`${API_BASE}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          counselorId: selectedCounselor.id,
          slotStart: payload.slotStart,
          slotEnd: payload.slotEnd,
          contactEmail: payload.contactEmail,
          notes: payload.notes,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to create booking");
      }

      setBookingSuccess(`Session with ${selectedCounselor.name} booked successfully.`);
      setSelectedCounselor(null);
      setTimeout(() => setBookingSuccess(null), 4000);
      await loadCounselors();
      await loadBookings();
    } catch (error: any) {
      setSlotError(error?.message || "Booking failed");
    } finally {
      setBookingLoading(false);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/bookings/${bookingId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ cancellationReason: "Cancelled by user" }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to cancel booking");
      }
      await loadCounselors();
      await loadBookings();
    } catch (error: any) {
      setPageError(error?.message || "Failed to cancel booking");
    }
  };

  const openReschedule = async (booking: SessionBooking) => {
    setRescheduleTarget(booking);
    setSelectedRescheduleSlot(null);
    await loadSlotsForCounselor(booking.counselorId, true);
  };

  const submitReschedule = async () => {
    if (!rescheduleTarget || !selectedRescheduleSlot?.start || !selectedRescheduleSlot.end) {
      return;
    }

    try {
      setRescheduleLoading(true);
      const res = await fetch(`${API_BASE}/api/bookings/${rescheduleTarget.id}/reschedule`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          slotStart: selectedRescheduleSlot.start,
          slotEnd: selectedRescheduleSlot.end,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to reschedule");
      }
      setRescheduleTarget(null);
      setRescheduleSlots([]);
      setSelectedRescheduleSlot(null);
      await loadCounselors();
      await loadBookings();
    } catch (error: any) {
      setPageError(error?.message || "Failed to reschedule");
    } finally {
      setRescheduleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
          <span>Portal</span>
          <span>{">"}</span>
          <span className="text-gray-600">Counseling</span>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-7">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Find Your Guide</h1>
          <CounselorPageToggle activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {pageError && <p className="text-sm text-red-600 mb-4">{pageError}</p>}

        {activeTab === "find" ? (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="hidden lg:block">
              <CounselorFilters filters={filters} onChange={setFilters} />
            </div>

            <div className="flex-1">
              <p className="text-sm text-gray-400 mb-4">
                {filteredCounselors.length} counselor{filteredCounselors.length !== 1 ? "s" : ""} found
              </p>

              {filteredCounselors.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <p className="text-gray-500 font-medium">No counselors match your filters</p>
                  <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredCounselors.map((counselor) => (
                    <CounselorCard key={counselor.id} counselor={counselor} onBook={setSelectedCounselor} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            {bookingsLoading ? (
              <p className="text-gray-500">Loading sessions...</p>
            ) : bookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="text-gray-600 font-semibold text-lg">No sessions booked yet</p>
                <p className="text-gray-400 text-sm mt-1 mb-5">Find a counselor and book your first session</p>
                <button
                  onClick={() => setActiveTab("find")}
                  className="px-5 py-2.5 rounded-full bg-[#4caf7d] text-white text-sm font-semibold hover:bg-[#3d9e6d] transition-colors"
                >
                  Browse Counselors
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => {
                  const canChange =
                    booking.status === "confirmed" && new Date(booking.slotStart).getTime() > Date.now();

                  return (
                    <div key={booking.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                          <p className="text-sm text-gray-500">Counselor</p>
                          <p className="font-semibold text-gray-900">{booking.counselorName}</p>
                          <p className="text-sm text-gray-600 mt-1">{formatSlot(booking.slotStart, booking.slotEnd)}</p>
                          <p className="text-sm text-gray-600">Fee: ${booking.fee}</p>
                          <p className="text-sm text-gray-600">Status: {booking.status}</p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            disabled={!canChange}
                            onClick={() => openReschedule(booking)}
                            className={`px-3 py-2 rounded-full text-sm font-semibold ${
                              canChange
                                ? "bg-[#e8f5ee] text-[#2d7a55] hover:bg-[#d5efe3]"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                          >
                            Change Slot
                          </button>
                          <button
                            disabled={!canChange}
                            onClick={() => cancelBooking(booking.id)}
                            className={`px-3 py-2 rounded-full text-sm font-semibold ${
                              canChange
                                ? "bg-red-50 text-red-600 hover:bg-red-100"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedCounselor && (
        <BookingModal
          counselor={selectedCounselor}
          slots={modalSlots}
          loadingSlots={loadingSlots}
          bookingLoading={bookingLoading}
          slotError={slotError}
          onClose={() => {
            setSelectedCounselor(null);
            setSlotError(null);
            setModalSlots([]);
          }}
          onConfirm={handleConfirmBooking}
        />
      )}

      {rescheduleTarget && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-5">
            <h3 className="text-lg font-semibold text-gray-900">Change Session Slot</h3>
            <p className="text-sm text-gray-500 mb-4">Choose a new available slot for {rescheduleTarget.counselorName}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-auto">
              {rescheduleSlots.length === 0 ? (
                <p className="text-sm text-gray-500">No slots available.</p>
              ) : (
                rescheduleSlots.map((slot) => (
                  <button
                    key={`${slot.start}-${slot.end}`}
                    onClick={() => setSelectedRescheduleSlot(slot)}
                    className={`px-3 py-2 rounded-lg border text-sm ${
                      selectedRescheduleSlot?.start === slot.start && selectedRescheduleSlot?.end === slot.end
                        ? "bg-[#4caf7d] border-[#4caf7d] text-white"
                        : "border-gray-200 text-gray-700 hover:border-[#4caf7d]"
                    }`}
                  >
                    {slot.time}
                  </button>
                ))
              )}
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setRescheduleTarget(null)}
                className="px-4 py-2 rounded-full border border-gray-200 text-gray-700"
              >
                Close
              </button>
              <button
                disabled={!selectedRescheduleSlot || rescheduleLoading}
                onClick={submitReschedule}
                className={`px-4 py-2 rounded-full text-white ${
                  selectedRescheduleSlot ? "bg-[#4caf7d]" : "bg-gray-300"
                }`}
              >
                {rescheduleLoading ? "Updating..." : "Confirm Change"}
              </button>
            </div>
          </div>
        </div>
      )}

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
