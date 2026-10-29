import { AlertCircle, Calendar, CheckCircle2, Loader2, X } from 'lucide-react';
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Profile, Resource } from '../types';

interface BookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  resource: Resource;
  currentUser: Profile;
  onSuccess: (status: string) => void;
}

export function BookingDialog({
  isOpen,
  onClose,
  resource,
  currentUser,
  onSuccess,
}: BookingDialogProps) {
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [purpose, setPurpose] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [supabaseError, setSupabaseError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSupabaseError(null);
    setSuccessInfo(null);

    // Basic form verification
    if (!startDate || !endDate) {
      setSupabaseError('Please specify both start date and end date.');
      return;
    }
    if (!purpose.trim()) {
      setSupabaseError('Purpose is required. Please explain why you are borrowing this resource.');
      return;
    }

    setSubmitting(true);
    try {
      // Check 0: Self booking check
      if (resource.owner_id && currentUser.id === resource.owner_id) {
        throw new Error('You cannot request or book your own resource.');
      }

      // Check 1: Training check
      if (resource.requires_training && !currentUser.trained) {
        throw new Error(
          'Training required: This resource requires certified safety training before it can be borrowed. Your profile does not have this certification on file.'
        );
      }

      // Check 2: Max days check
      const start = new Date(startDate + 'T00:00:00');
      const end = new Date(endDate + 'T00:00:00');
      if (end < start) {
        throw new Error('End date cannot be earlier than start date.');
      }
      const diffTime = end.getTime() - start.getTime();
      const requestedDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
      if (requestedDays > resource.max_days) {
        throw new Error(
          `Requested duration (${requestedDays} day${requestedDays === 1 ? '' : 's'}) exceeds the maximum allowed ${resource.max_days} day${resource.max_days === 1 ? '' : 's'}.`
        );
      }

      // Check 3: User already has 2+ active bookings (pending, approved, in_use)
      const { data: userBookings, error: userBookingsError } = await supabase
        .from('bookings')
        .select('id, status')
        .eq('user_id', currentUser.id)
        .in('status', ['pending', 'approved', 'in_use']);

      if (userBookingsError) {
        throw new Error(`Database error: ${userBookingsError.message}`);
      }

      if (userBookings && userBookings.length >= 2) {
        throw new Error(
          `Booking limit reached: You already have ${userBookings.length} active reservation(s) in pending, approved, or in-use status. Please complete or cancel existing bookings first.`
        );
      }

      // Check 4: Overlap with approved or in_use bookings on the same resource
      const { data: overlappingBookings, error: overlapError } = await supabase
        .from('bookings')
        .select('id, start_date, end_date, status')
        .eq('resource_id', resource.id)
        .in('status', ['approved', 'in_use']);

      if (overlapError) {
        throw new Error(`Database error: ${overlapError.message}`);
      }

      let isOverlapping = false;
      if (overlappingBookings && overlappingBookings.length > 0) {
        for (const b of overlappingBookings) {
          if (b.start_date && b.end_date) {
            if (startDate <= b.end_date && endDate >= b.start_date) {
              isOverlapping = true;
              break;
            }
          }
        }
      }

      const bookingStatus = isOverlapping ? 'waitlisted' : 'pending';
      const decisionReason = isOverlapping
        ? 'Dates overlap with an approved reservation; placed on waitlist.'
        : null;

      // Insert into bookings table
      const { data: newBooking, error: bookingInsertError } = await supabase
        .from('bookings')
        .insert([
          {
            resource_id: resource.id,
            user_id: currentUser.id,
            start_date: startDate,
            end_date: endDate,
            purpose: purpose.trim(),
            status: bookingStatus,
            decision_reason: decisionReason,
          },
        ])
        .select()
        .single();

      if (bookingInsertError) {
        throw new Error(`Supabase booking insert error: ${bookingInsertError.message}`);
      }

      // Insert activity_log row
      try {
        await supabase.from('activity_log').insert([
          {
            action: `booking_request_${bookingStatus}`,
            booking_id: newBooking?.id || null,
            actor_id: currentUser.id,
            note: `Requested "${resource.name}" (${startDate} to ${endDate}) with status: ${bookingStatus}`,
          },
        ]);
      } catch (actErr: unknown) {
        console.warn('Activity log notice:', actErr);
      }

      // Insert notifications row for resource owner
      if (resource.owner_id) {
        try {
          await supabase.from('notifications').insert([
            {
              user_id: resource.owner_id,
              message: `${currentUser.name} requested to book "${resource.name}" (${startDate} to ${endDate}) with status: ${bookingStatus}.`,
              read: false,
            },
          ]);
        } catch (notifErr: unknown) {
          console.warn('Notification notice:', notifErr);
        }
      }

      setSuccessInfo(
        bookingStatus === 'waitlisted'
          ? 'Your request was placed on the waitlist because the requested dates overlap with an approved booking.'
          : 'Your booking request was submitted successfully with status: pending review.'
      );

      setTimeout(() => {
        onSuccess(bookingStatus);
        onClose();
      }, 1400);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setSupabaseError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F2A2E]/40 dark:bg-black/65 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#12201F] border border-[#0F2A2E]/10 dark:border-[#E6F4F2]/12 p-6 sm:p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2
              id="booking-dialog-title"
              className="text-xl font-semibold text-[#0F2A2E] dark:text-[#E6F4F2]"
            >
              Request to borrow
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#0F2A2E]/65 dark:text-[#E6F4F2]/65">
              {resource.name} · Max {resource.max_days} days
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="w-9 h-9 inline-flex items-center justify-center rounded-xl text-[#0F2A2E]/60 dark:text-[#E6F4F2]/60 hover:bg-[#CCFBF1]/50 dark:hover:bg-[#2DD4BF]/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Real Supabase Error Alert in visible red */}
        {supabaseError && (
          <div
            role="alert"
            className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-500 text-rose-900 dark:text-rose-200 text-sm flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" aria-hidden="true" />
            <div className="flex-1">
              <p className="font-semibold text-rose-900 dark:text-rose-100">Booking Request Failed</p>
              <p className="mt-1 text-xs sm:text-sm text-rose-800 dark:text-rose-200 font-mono break-all leading-relaxed">
                {supabaseError}
              </p>
            </div>
          </div>
        )}

        {/* Success Banner */}
        {successInfo && (
          <div
            role="status"
            className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-400 text-emerald-900 dark:text-emerald-200 text-sm flex items-start gap-3"
          >
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" aria-hidden="true" />
            <div className="flex-1">
              <p className="font-semibold">Request Received</p>
              <p className="mt-1 text-xs sm:text-sm leading-relaxed">{successInfo}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="dialog-start-date"
                className="block text-xs font-medium text-[#0F2A2E] dark:text-[#E6F4F2] mb-1.5"
              >
                Start date (YYYY-MM-DD) *
              </label>
              <input
                id="dialog-start-date"
                type="date"
                required
                value={startDate}
                min={today}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (e.target.value > endDate) setEndDate(e.target.value);
                }}
                className="w-full h-11 px-3.5 rounded-xl bg-[#F7FBFA] dark:bg-[#0B1415] border border-[#0F2A2E]/15 dark:border-[#E6F4F2]/15 text-sm tabular-nums text-[#0F2A2E] dark:text-[#E6F4F2] focus:outline-none focus:border-[#0D9488] dark:focus:border-[#2DD4BF]"
              />
            </div>

            <div>
              <label
                htmlFor="dialog-end-date"
                className="block text-xs font-medium text-[#0F2A2E] dark:text-[#E6F4F2] mb-1.5"
              >
                End date (YYYY-MM-DD) *
              </label>
              <input
                id="dialog-end-date"
                type="date"
                required
                value={endDate}
                min={startDate || today}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-[#F7FBFA] dark:bg-[#0B1415] border border-[#0F2A2E]/15 dark:border-[#E6F4F2]/15 text-sm tabular-nums text-[#0F2A2E] dark:text-[#E6F4F2] focus:outline-none focus:border-[#0D9488] dark:focus:border-[#2DD4BF]"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="dialog-purpose"
              className="block text-xs font-medium text-[#0F2A2E] dark:text-[#E6F4F2] mb-1.5"
            >
              Purpose & Project Note *
            </label>
            <textarea
              id="dialog-purpose"
              required
              rows={3}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Explain how you will use this equipment or lab space..."
              className="w-full p-3.5 rounded-xl bg-[#F7FBFA] dark:bg-[#0B1415] border border-[#0F2A2E]/15 dark:border-[#E6F4F2]/15 text-sm text-[#0F2A2E] dark:text-[#E6F4F2] placeholder:text-[#0F2A2E]/40 dark:placeholder:text-[#E6F4F2]/40 focus:outline-none focus:border-[#0D9488] dark:focus:border-[#2DD4BF] resize-none"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-[#0F2A2E]/75 dark:text-[#E6F4F2]/75 hover:bg-[#F7FBFA] dark:hover:bg-[#0B1415] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-[#0D9488] hover:bg-[#0F766E] text-white dark:bg-[#2DD4BF] dark:hover:bg-[#14B8A6] dark:text-[#0B1415] transition-colors duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span>Checking rules & booking...</span>
                </>
              ) : (
                <span>Submit booking request</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
