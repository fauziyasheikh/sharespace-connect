import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  FileQuestion,
  Loader2,
  RotateCcw,
  X,
  XCircle,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { Booking, Resource } from '../types';

export function MyBookingsPage() {
  const { currentUser } = useApp();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchMyBookings = async () => {
    if (!currentUser) return;
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch bookings for current user
      const { data: bData, error: bErr } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (bErr) {
        throw new Error(bErr.message);
      }

      const userBookings = bData || [];

      // 2. Fetch associated resources for display
      const resourceIds = Array.from(new Set(userBookings.map((b) => b.resource_id)));
      if (resourceIds.length > 0) {
        const { data: resData, error: resErr } = await supabase
          .from('resources')
          .select('*')
          .in('id', resourceIds);

        if (!resErr && resData) {
          const resMap = new Map<string, Resource>(resData.map((r) => [r.id, r]));
          const enriched = userBookings.map((b) => ({
            ...b,
            resource: resMap.get(b.resource_id),
          }));
          setBookings(enriched);
          return;
        }
      }

      setBookings(userBookings);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load your reservations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();
  }, [currentUser]);

  const handleCancelBooking = async (bookingId: string) => {
    setCancellingId(bookingId);
    try {
      const { error: cancelErr } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (cancelErr) {
        throw new Error(cancelErr.message);
      }

      // Log cancellation
      await supabase.from('activity_log').insert([
        {
          action: 'booking_cancelled',
          booking_id: bookingId,
          actor_id: currentUser?.id,
        },
      ]);

      fetchMyBookings();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to cancel reservation.');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      {/* Header & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <p className="text-sm font-medium text-[#0D9488] dark:text-[#2DD4BF] mb-2">
            Reservations & equipment requests
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0F2A2E] dark:text-[#E6F4F2]">
            My Bookings
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchMyBookings}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#0F2A2E]/12 dark:border-[#E6F4F2]/12 bg-white dark:bg-[#12201F] text-[#0F2A2E] dark:text-[#E6F4F2] hover:bg-[#CCFBF1]/50 dark:hover:bg-[#2DD4BF]/10 text-xs sm:text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>Refresh</span>
          </button>

          {/* Primary Action Button */}
          <Link
            to="/"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white dark:bg-[#2DD4BF] dark:hover:bg-[#14B8A6] dark:text-[#0B1415] text-xs sm:text-sm font-medium transition-colors duration-150 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D9488] dark:focus-visible:outline-[#2DD4BF]"
          >
            Browse resources
          </Link>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-sm flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1">
            <p className="font-semibold">Notice</p>
            <p className="mt-1 text-xs sm:text-sm font-mono break-all">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#0D9488] dark:text-[#2DD4BF] mx-auto mb-3" aria-hidden="true" />
          <p className="text-sm font-medium text-[#0F2A2E] dark:text-[#E6F4F2]">
            Loading your reservations...
          </p>
        </div>
      )}

      {/* Empty State */}
      {!loading && bookings.length === 0 && (
        <div className="rounded-2xl bg-white dark:bg-[#12201F] border border-[#0F2A2E]/8 dark:border-[#E6F4F2]/10 py-16 px-6 text-center">
          <FileQuestion className="w-10 h-10 text-[#0F2A2E]/30 dark:text-[#E6F4F2]/30 mx-auto mb-3" aria-hidden="true" />
          <h2 className="text-lg font-medium text-[#0F2A2E] dark:text-[#E6F4F2]">
            No bookings yet
          </h2>
          <p className="mt-2 text-sm text-[#0F2A2E]/65 dark:text-[#E6F4F2]/65 max-w-md mx-auto">
            You have not requested any campus equipment or spaces. Explore available resources to get started.
          </p>
          <Link
            to="/"
            className="inline-block mt-5 px-4 py-2 rounded-xl border border-[#0D9488] text-[#0D9488] dark:border-[#2DD4BF] dark:text-[#2DD4BF] text-xs sm:text-sm font-medium hover:bg-[#CCFBF1]/40 dark:hover:bg-[#2DD4BF]/10 transition-colors"
          >
            Explore campus resources
          </Link>
        </div>
      )}

      {/* Bookings List */}
      {!loading && bookings.length > 0 && (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const canCancel =
              booking.status === 'pending' || booking.status === 'waitlisted';

            return (
              <article
                key={booking.id}
                className="rounded-2xl bg-white dark:bg-[#12201F] border border-[#0F2A2E]/8 dark:border-[#E6F4F2]/10 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xs"
              >
                <div className="space-y-2 min-w-0">
                  {/* Status & Dates */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#0F2A2E]/65 dark:text-[#E6F4F2]/65">
                    <span className="font-medium tabular-nums text-[#0F2A2E] dark:text-[#E6F4F2]">
                      {booking.start_date} to {booking.end_date}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span
                      className={`font-semibold capitalize px-2 py-0.5 rounded text-[11px] ${
                        booking.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : booking.status === 'waitlisted'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : booking.status === 'declined' || booking.status === 'cancelled'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                              : 'bg-[#CCFBF1] text-[#0F2A2E] dark:bg-[#2DD4BF]/20 dark:text-[#2DD4BF]'
                      }`}
                    >
                      {booking.status}
                    </span>
                    {booking.resource?.location && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{booking.resource.location}</span>
                      </>
                    )}
                  </div>

                  {/* Resource Name */}
                  <h2 className="text-lg font-semibold text-[#0F2A2E] dark:text-[#E6F4F2]">
                    {booking.resource?.name || `Resource ID: ${booking.resource_id}`}
                  </h2>

                  {/* Purpose */}
                  <p className="text-xs sm:text-sm text-[#0F2A2E]/70 dark:text-[#E6F4F2]/70 leading-relaxed">
                    Purpose: “{booking.purpose}”
                  </p>

                  {/* Decision Reason (if waitlisted or declined) */}
                  {booking.decision_reason && (
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                      Reason: {booking.decision_reason}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {booking.resource_id && (
                    <Link
                      to={`/resource/${booking.resource_id}`}
                      className="px-3.5 py-1.5 rounded-xl border border-[#0F2A2E]/15 dark:border-[#E6F4F2]/15 text-xs font-medium text-[#0F2A2E] dark:text-[#E6F4F2] hover:bg-[#CCFBF1]/50 dark:hover:bg-[#2DD4BF]/10 transition-colors"
                    >
                      View item
                    </Link>
                  )}

                  {canCancel && (
                    <button
                      type="button"
                      disabled={cancellingId === booking.id}
                      onClick={() => handleCancelBooking(booking.id)}
                      className="px-3.5 py-1.5 rounded-xl border border-rose-300 dark:border-rose-800 text-xs font-medium text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {cancellingId === booking.id ? 'Cancelling...' : 'Cancel'}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
