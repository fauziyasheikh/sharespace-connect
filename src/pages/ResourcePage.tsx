import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BookingDialog } from '../components/BookingDialog';
import { ResourceImage } from '../components/ResourceImage';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { Resource } from '../types';

export function ResourcePage() {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useApp();
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'info'; message: string } | null>(
    null
  );
  const navigate = useNavigate();

  const fetchResource = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await supabase
        .from('resources')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (fetchErr) {
        setError(fetchErr.message || 'Unable to load resource details.');
      } else if (!data) {
        setError('Resource not found in the campus catalog.');
      } else {
        setResource(data);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResource();
  }, [id]);

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#0D9488] dark:text-[#2DD4BF] mx-auto mb-4" aria-hidden="true" />
        <p className="text-sm font-medium text-[#0F2A2E] dark:text-[#E6F4F2]">
          Loading resource details from database...
        </p>
      </main>
    );
  }

  if (error || !resource) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#0F2A2E]/70 dark:text-[#E6F4F2]/70 hover:text-[#0D9488] dark:hover:text-[#2DD4BF] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back to catalog</span>
        </Link>
        <div
          role="alert"
          className="rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 p-8 text-center max-w-lg mx-auto"
        >
          <AlertCircle className="w-8 h-8 text-rose-600 dark:text-rose-400 mx-auto mb-3" aria-hidden="true" />
          <h2 className="text-base font-semibold text-rose-900 dark:text-rose-200">
            Resource unavailable
          </h2>
          <p className="text-sm text-rose-800 dark:text-rose-300 mt-2 leading-relaxed">
            {error || 'The requested resource could not be found.'}
          </p>
          <Link
            to="/"
            className="inline-block mt-5 px-4 py-2 rounded-xl bg-white dark:bg-[#12201F] border border-rose-300 dark:border-rose-800 text-xs sm:text-sm font-medium text-rose-800 dark:text-rose-200 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
          >
            Return to Browse
          </Link>
        </div>
      </main>
    );
  }

  const isOwner = Boolean(currentUser && resource.owner_id && currentUser.id === resource.owner_id);
  const isTrainingRequired = resource.requires_training;
  const userHasTraining = Boolean(currentUser?.trained);

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Back to Catalog Link */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#0F2A2E]/70 dark:text-[#E6F4F2]/70 hover:text-[#0D9488] dark:hover:text-[#2DD4BF] transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        <span>Back to catalog</span>
      </Link>

      {/* Confirmation Notification */}
      {notification && (
        <div
          role="status"
          className="mb-6 p-4 rounded-2xl bg-[#CCFBF1]/70 dark:bg-[#2DD4BF]/15 border border-[#0D9488]/30 dark:border-[#2DD4BF]/30 text-[#0F2A2E] dark:text-[#E6F4F2] text-sm flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#0D9488] dark:text-[#2DD4BF] shrink-0" aria-hidden="true" />
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => navigate('/bookings')}
            className="text-xs font-semibold text-[#0D9488] dark:text-[#2DD4BF] underline hover:opacity-80 shrink-0"
          >
            View in My Bookings →
          </button>
        </div>
      )}

      <div className="rounded-3xl bg-white dark:bg-[#12201F] border border-[#0F2A2E]/8 dark:border-[#E6F4F2]/10 overflow-hidden shadow-xs">
        {/* Resource Image Header */}
        <div className="aspect-[16/9] sm:aspect-[21/9] w-full bg-[#F7FBFA] dark:bg-[#0B1415] overflow-hidden relative">
          <ResourceImage
            src={resource.image_url}
            alt={resource.name}
            category={resource.category}
            className="w-full h-full object-cover"
          />
          {resource.requires_training && (
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/90 text-white text-xs font-medium backdrop-blur-xs shadow-xs">
              <ShieldAlert className="w-4 h-4" aria-hidden="true" />
              <span>Training required</span>
            </div>
          )}
        </div>

        <div className="p-6 sm:p-10 space-y-8">
          {/* Header & Meta */}
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#0F2A2E]/60 dark:text-[#E6F4F2]/60 mb-2">
              <span className="font-medium text-[#0D9488] dark:text-[#2DD4BF]">
                {resource.category}
              </span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#0F2A2E]/50 dark:text-[#E6F4F2]/50" aria-hidden="true" />
                <span>{resource.location}</span>
              </span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 tabular-nums">
                <Clock className="w-3.5 h-3.5 text-[#0F2A2E]/50 dark:text-[#E6F4F2]/50" aria-hidden="true" />
                <span>
                  Max {resource.max_days} day{resource.max_days === 1 ? '' : 's'}
                </span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0F2A2E] dark:text-[#E6F4F2]">
              {resource.name}
            </h1>
          </div>

          {/* Description */}
          {resource.description && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#0F2A2E]/60 dark:text-[#E6F4F2]/60 mb-2">
                Description
              </h2>
              <p className="text-base text-[#0F2A2E]/80 dark:text-[#E6F4F2]/80 leading-relaxed">
                {resource.description}
              </p>
            </div>
          )}

          {/* Rules & Guidelines */}
          {resource.rules && (
            <div className="p-5 rounded-2xl bg-[#F7FBFA] dark:bg-[#0B1415] border border-[#0F2A2E]/8 dark:border-[#E6F4F2]/10">
              <h2 className="text-sm font-semibold text-[#0F2A2E] dark:text-[#E6F4F2] flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-[#0D9488] dark:text-[#2DD4BF]" aria-hidden="true" />
                <span>Rules & Borrowing Guidelines</span>
              </h2>
              <p className="text-sm text-[#0F2A2E]/75 dark:text-[#E6F4F2]/75 leading-relaxed whitespace-pre-line">
                {resource.rules}
              </p>
            </div>
          )}

          {/* Eligibility Checklist */}
          <div className="p-6 rounded-2xl border border-[#0F2A2E]/10 dark:border-[#E6F4F2]/12 bg-[#F7FBFA]/60 dark:bg-[#0B1415]/60">
            <h2 className="text-base font-semibold text-[#0F2A2E] dark:text-[#E6F4F2] flex items-center gap-2 mb-4">
              <ShieldCheck className="w-5 h-5 text-[#0D9488] dark:text-[#2DD4BF]" aria-hidden="true" />
              <span>Eligibility Checklist</span>
            </h2>

            <div className="space-y-3.5">
              {/* Training requirement check */}
              {isTrainingRequired ? (
                userHasTraining ? (
                  <div className="flex items-start gap-3 text-sm">
                    <CheckCircle2
                      className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="font-medium text-emerald-800 dark:text-emerald-300">
                        Training completed
                      </p>
                      <p className="text-xs text-[#0F2A2E]/65 dark:text-[#E6F4F2]/65 mt-0.5">
                        Your profile is marked as trained for this specialized equipment.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 text-sm">
                    <XCircle
                      className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="font-medium text-rose-800 dark:text-rose-300">
                        Prerequisite safety training required
                      </p>
                      <p className="text-xs text-rose-700/80 dark:text-rose-300/80 mt-0.5">
                        Your profile does not currently have the required workshop certification on file.
                      </p>
                    </div>
                  </div>
                )
              ) : (
                <div className="flex items-start gap-3 text-sm">
                  <CheckCircle2
                    className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="font-medium text-emerald-800 dark:text-emerald-300">
                      Open access
                    </p>
                    <p className="text-xs text-[#0F2A2E]/65 dark:text-[#E6F4F2]/65 mt-0.5">
                      No prerequisite training required to request this resource.
                    </p>
                  </div>
                </div>
              )}

              {/* Ownership Check */}
              {isOwner ? (
                <div className="flex items-start gap-3 text-sm">
                  <AlertTriangle
                    className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="font-medium text-amber-800 dark:text-amber-300">
                      You are the owner of this listing
                    </p>
                    <p className="text-xs text-amber-700/80 dark:text-amber-300/80 mt-0.5">
                      Campus rules prohibit owners from requesting or booking their own items.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 text-sm">
                  <CheckCircle2
                    className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="font-medium text-emerald-800 dark:text-emerald-300">
                      Borrower eligibility
                    </p>
                    <p className="text-xs text-[#0F2A2E]/65 dark:text-[#E6F4F2]/65 mt-0.5">
                      You are eligible to borrow equipment from peers and campus labs.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Row: Single Primary Button */}
          <div className="pt-4 border-t border-[#0F2A2E]/8 dark:border-[#E6F4F2]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-[#0F2A2E]/60 dark:text-[#E6F4F2]/60">
              <p>Borrowing duration: up to {resource.max_days} days per request.</p>
              {isOwner ? (
                <p className="mt-0.5 text-amber-700 dark:text-amber-400 font-medium">
                  You own this resource. Manage it from your My Listings page.
                </p>
              ) : null}
            </div>

            {/* Request Button */}
            {isOwner ? (
              <button
                type="button"
                disabled
                className="px-6 py-3 rounded-xl bg-neutral-200 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 font-medium text-sm cursor-not-allowed whitespace-nowrap self-start sm:self-auto"
              >
                Cannot book own listing
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsDialogOpen(true)}
                className="px-6 py-3 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white dark:bg-[#2DD4BF] dark:hover:bg-[#14B8A6] dark:text-[#0B1415] font-medium text-sm transition-colors duration-150 cursor-pointer whitespace-nowrap self-start sm:self-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D9488] dark:focus-visible:outline-[#2DD4BF]"
              >
                Request to borrow
              </button>
            )}
          </div>
        </div>
      </div>

      {currentUser && (
        <BookingDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          resource={resource}
          currentUser={currentUser}
          onSuccess={(status) => {
            setNotification({
              type: 'success',
              message: `Booking request submitted! (Status: ${status})`,
            });
          }}
        />
      )}
    </main>
  );
}
