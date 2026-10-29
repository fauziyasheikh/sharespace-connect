import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Inbox,
  Loader2,
  MapPin,
  Plus,
  RotateCcw,
  ShieldAlert,
  User,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ResourceImage } from '../components/ResourceImage';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { Booking, Resource } from '../types';

export function MyListingsPage() {
  const { currentUser } = useApp();
  const [myResources, setMyResources] = useState<Resource[]>([]);
  const [incomingBookings, setIncomingBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add resource modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addName, setAddName] = useState('');
  const [addCategory, setAddCategory] = useState('Cameras');
  const [addLocation, setAddLocation] = useState('');
  const [addDescription, setAddDescription] = useState('');
  const [addRules, setAddRules] = useState('');
  const [addRequiresTraining, setAddRequiresTraining] = useState(false);
  const [addMaxDays, setAddMaxDays] = useState('3');
  const [addingResource, setAddingResource] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Action status message
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchMyData = async () => {
    if (!currentUser) return;
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch resources where owner_id = currentUser.id
      const { data: resData, error: resErr } = await supabase
        .from('resources')
        .select('*')
        .eq('owner_id', currentUser.id)
        .order('name', { ascending: true });

      if (resErr) {
        throw new Error(`Failed to load your listings: ${resErr.message}`);
      }

      setMyResources(resData || []);

      // 2. Fetch incoming booking requests for resources owned by currentUser
      const myResourceIds = (resData || []).map((r) => r.id);
      if (myResourceIds.length > 0) {
        const { data: bData, error: bErr } = await supabase
          .from('bookings')
          .select('*')
          .in('resource_id', myResourceIds)
          .order('created_at', { ascending: false });

        if (bErr) {
          console.warn('Incoming bookings notice:', bErr.message);
        } else {
          // Attach resource object to each booking for display
          const resourceMap = new Map((resData || []).map((r) => [r.id, r]));
          const enriched = (bData || []).map((b) => ({
            ...b,
            resource: resourceMap.get(b.resource_id),
          }));
          setIncomingBookings(enriched);
        }
      } else {
        setIncomingBookings([]);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred while loading your listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyData();
  }, [currentUser]);

  // Handle adding a new resource
  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setAddError(null);

    if (!addName.trim() || !addCategory.trim() || !addLocation.trim()) {
      setAddError('Name, category, and location are required.');
      return;
    }

    const maxDaysNum = parseInt(addMaxDays, 10);
    if (isNaN(maxDaysNum) || maxDaysNum < 1) {
      setAddError('Max days must be a number greater than 0.');
      return;
    }

    setAddingResource(true);
    try {
      const { data, error: insertErr } = await supabase
        .from('resources')
        .insert([
          {
            owner_id: currentUser.id,
            name: addName.trim(),
            category: addCategory.trim(),
            location: addLocation.trim(),
            description: addDescription.trim() || null,
            rules: addRules.trim() || null,
            requires_training: Boolean(addRequiresTraining),
            max_days: maxDaysNum,
            status: 'available',
          },
        ])
        .select()
        .single();

      if (insertErr) {
        throw new Error(`Supabase insert error: ${insertErr.message}`);
      }

      setActionSuccess(`"${addName}" has been listed successfully!`);
      setIsAddModalOpen(false);
      // Reset form
      setAddName('');
      setAddLocation('');
      setAddDescription('');
      setAddRules('');
      setAddRequiresTraining(false);
      setAddMaxDays('3');

      // Refresh listings
      fetchMyData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add resource.';
      setAddError(msg);
    } finally {
      setAddingResource(false);
    }
  };

  // Handle approving or declining an incoming request
  const handleUpdateBookingStatus = async (bookingId: string, newStatus: 'approved' | 'declined') => {
    try {
      const { error: updateErr } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (updateErr) {
        throw new Error(updateErr.message);
      }

      // Log activity
      await supabase.from('activity_log').insert([
        {
          action: `booking_${newStatus}`,
          booking_id: bookingId,
          actor_id: currentUser?.id,
        },
      ]);

      setActionSuccess(`Booking request marked as ${newStatus}.`);
      fetchMyData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update booking status.');
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">
      {/* Header & Add Resource Primary Button */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <p className="text-sm font-medium text-[#0D9488] dark:text-[#2DD4BF] mb-2">
            Lending & equipment management
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0F2A2E] dark:text-[#E6F4F2]">
            My Listings
          </h1>
          <p className="text-xs sm:text-sm text-[#0F2A2E]/65 dark:text-[#E6F4F2]/65 mt-1">
            Manage underused resources you share with the campus community.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchMyData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#0F2A2E]/12 dark:border-[#E6F4F2]/12 bg-white dark:bg-[#12201F] text-[#0F2A2E] dark:text-[#E6F4F2] hover:bg-[#CCFBF1]/50 dark:hover:bg-[#2DD4BF]/10 text-xs sm:text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>Refresh</span>
          </button>

          {/* Primary Action Button: Add resource */}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white dark:bg-[#2DD4BF] dark:hover:bg-[#14B8A6] dark:text-[#0B1415] text-sm font-medium transition-colors duration-150 cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D9488] dark:focus-visible:outline-[#2DD4BF]"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Add resource</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {actionSuccess && (
        <div
          role="status"
          className="p-4 rounded-2xl bg-[#CCFBF1]/70 dark:bg-[#2DD4BF]/15 border border-[#0D9488]/30 dark:border-[#2DD4BF]/30 text-[#0F2A2E] dark:text-[#E6F4F2] text-sm flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#0D9488] dark:text-[#2DD4BF] shrink-0" aria-hidden="true" />
            <span>{actionSuccess}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionSuccess(null)}
            className="p-1 text-[#0F2A2E]/60 dark:text-[#E6F4F2]/60 hover:text-[#0F2A2E] dark:hover:text-[#E6F4F2]"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-500 text-rose-900 dark:text-rose-200 text-sm flex items-start gap-3"
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
        <div className="py-16 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#0D9488] dark:text-[#2DD4BF] mx-auto mb-3" aria-hidden="true" />
          <p className="text-sm font-medium text-[#0F2A2E] dark:text-[#E6F4F2]">
            Loading your listings and requests...
          </p>
        </div>
      )}

      {!loading && (
        <>
          {/* Section 1: My Listed Resources */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#0F2A2E] dark:text-[#E6F4F2]">
                My Listed Equipment & Spaces ({myResources.length})
              </h2>
            </div>

            {myResources.length === 0 ? (
              <div className="rounded-2xl bg-white dark:bg-[#12201F] border border-[#0F2A2E]/8 dark:border-[#E6F4F2]/10 p-10 text-center">
                <p className="text-base font-medium text-[#0F2A2E] dark:text-[#E6F4F2]">
                  You have not listed any resources yet
                </p>
                <p className="text-xs sm:text-sm text-[#0F2A2E]/65 dark:text-[#E6F4F2]/65 mt-1 max-w-md mx-auto">
                  Have an underused 3D printer, camera kit, VR gear, or studio room? Share it with students and faculty.
                </p>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="mt-5 px-4 py-2 rounded-xl border border-[#0D9488] text-[#0D9488] dark:border-[#2DD4BF] dark:text-[#2DD4BF] text-xs sm:text-sm font-medium hover:bg-[#CCFBF1]/40 dark:hover:bg-[#2DD4BF]/10 transition-colors"
                >
                  + Add your first resource
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myResources.map((res) => (
                  <article
                    key={res.id}
                    className="rounded-2xl bg-white dark:bg-[#12201F] border border-[#0F2A2E]/8 dark:border-[#E6F4F2]/10 overflow-hidden flex flex-col shadow-xs"
                  >
                    <div className="aspect-[16/9] w-full bg-[#F7FBFA] dark:bg-[#0B1415] relative overflow-hidden">
                      <ResourceImage
                        src={res.image_url}
                        alt={res.name}
                        category={res.category}
                        className="w-full h-full object-cover"
                      />
                      {res.requires_training && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/90 text-white text-[11px] font-medium backdrop-blur-xs">
                          <ShieldAlert className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Training required</span>
                        </div>
                      )}
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-xs text-[#0F2A2E]/60 dark:text-[#E6F4F2]/60">
                          <span className="font-medium text-[#0D9488] dark:text-[#2DD4BF]">{res.category}</span>
                          <span aria-hidden="true">·</span>
                          <span className="truncate">{res.location}</span>
                        </div>

                        <h3 className="mt-2 text-base font-semibold text-[#0F2A2E] dark:text-[#E6F4F2]">
                          {res.name}
                        </h3>

                        {res.description && (
                          <p className="mt-1.5 text-xs sm:text-sm text-[#0F2A2E]/70 dark:text-[#E6F4F2]/70 line-clamp-2">
                            {res.description}
                          </p>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#0F2A2E]/8 dark:border-[#E6F4F2]/10 flex items-center justify-between text-xs text-[#0F2A2E]/60 dark:text-[#E6F4F2]/60">
                        <span>Max {res.max_days} days</span>
                        <Link
                          to={`/resource/${res.id}`}
                          className="text-[#0D9488] dark:text-[#2DD4BF] font-medium hover:underline"
                        >
                          View public page →
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* Section 2: Incoming Booking Requests for My Resources */}
          <section className="space-y-6 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#0F2A2E] dark:text-[#E6F4F2] flex items-center gap-2">
                  <Inbox className="w-5 h-5 text-[#0D9488] dark:text-[#2DD4BF]" aria-hidden="true" />
                  <span>Incoming Booking Requests ({incomingBookings.length})</span>
                </h2>
                <p className="text-xs text-[#0F2A2E]/60 dark:text-[#E6F4F2]/60 mt-0.5">
                  Requests submitted by students and colleagues for your listed equipment.
                </p>
              </div>
            </div>

            {incomingBookings.length === 0 ? (
              <div className="rounded-2xl bg-white dark:bg-[#12201F] border border-[#0F2A2E]/8 dark:border-[#E6F4F2]/10 p-8 text-center text-xs sm:text-sm text-[#0F2A2E]/65 dark:text-[#E6F4F2]/65">
                No incoming booking requests for your resources yet.
              </div>
            ) : (
              <div className="space-y-3.5">
                {incomingBookings.map((b) => (
                  <article
                    key={b.id}
                    className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#12201F] border border-[#0F2A2E]/8 dark:border-[#E6F4F2]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-xs"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#0F2A2E]/60 dark:text-[#E6F4F2]/60">
                        <span className="font-medium text-[#0F2A2E] dark:text-[#E6F4F2]">
                          Resource: {b.resource?.name || b.resource_id}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">
                          {b.start_date} to {b.end_date}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span
                          className={`font-semibold capitalize px-2 py-0.5 rounded text-[11px] ${
                            b.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : b.status === 'waitlisted'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                : b.status === 'declined'
                                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                                  : 'bg-[#CCFBF1] text-[#0F2A2E] dark:bg-[#2DD4BF]/20 dark:text-[#2DD4BF]'
                          }`}
                        >
                          {b.status}
                        </span>
                      </div>

                      <p className="text-sm font-medium text-[#0F2A2E] dark:text-[#E6F4F2]">
                        Purpose: “{b.purpose}”
                      </p>

                      {b.decision_reason && (
                        <p className="text-xs text-amber-700 dark:text-amber-400">
                          Note: {b.decision_reason}
                        </p>
                      )}
                    </div>

                    {/* Action buttons if pending or waitlisted */}
                    {(b.status === 'pending' || b.status === 'waitlisted') && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleUpdateBookingStatus(b.id, 'approved')}
                          className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Approve</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateBookingStatus(b.id, 'declined')}
                          className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl border border-[#0F2A2E]/15 dark:border-[#E6F4F2]/15 text-[#0F2A2E] dark:text-[#E6F4F2] hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-medium transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Decline</span>
                        </button>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* Add Resource Dialog Modal */}
      {isAddModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-resource-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F2A2E]/40 dark:bg-black/65 backdrop-blur-xs"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#12201F] border border-[#0F2A2E]/10 dark:border-[#E6F4F2]/12 p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2
                  id="add-resource-modal-title"
                  className="text-xl font-semibold text-[#0F2A2E] dark:text-[#E6F4F2]"
                >
                  List a campus resource
                </h2>
                <p className="mt-1 text-xs text-[#0F2A2E]/60 dark:text-[#E6F4F2]/60">
                  Share equipment or specialized lab space with peers.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                aria-label="Close dialog"
                className="w-9 h-9 inline-flex items-center justify-center rounded-xl text-[#0F2A2E]/60 dark:text-[#E6F4F2]/60 hover:bg-[#CCFBF1]/50 dark:hover:bg-[#2DD4BF]/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {/* Visible Red Error Alert */}
            {addError && (
              <div
                role="alert"
                className="mb-5 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-500 text-rose-900 dark:text-rose-200 text-xs sm:text-sm font-mono break-all leading-relaxed"
              >
                {addError}
              </div>
            )}

            <form onSubmit={handleAddResource} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#0F2A2E] dark:text-[#E6F4F2] mb-1.5">
                  Resource Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sony FX3 Cinema Kit, Prusa XL 3D Printer, Audio Studio"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-[#F7FBFA] dark:bg-[#0B1415] border border-[#0F2A2E]/15 dark:border-[#E6F4F2]/15 text-sm text-[#0F2A2E] dark:text-[#E6F4F2] focus:outline-none focus:border-[#0D9488] dark:focus:border-[#2DD4BF]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#0F2A2E] dark:text-[#E6F4F2] mb-1.5">
                    Category *
                  </label>
                  <select
                    value={addCategory}
                    onChange={(e) => setAddCategory(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-[#F7FBFA] dark:bg-[#0B1415] border border-[#0F2A2E]/15 dark:border-[#E6F4F2]/15 text-sm text-[#0F2A2E] dark:text-[#E6F4F2] focus:outline-none focus:border-[#0D9488] dark:focus:border-[#2DD4BF]"
                  >
                    <option value="Cameras">Cameras & Optics</option>
                    <option value="3D Printers">3D Printers</option>
                    <option value="Lab Rooms">Lab Rooms & Studios</option>
                    <option value="Fabrication">Fabrication & XR</option>
                    <option value="Audio Gear">Audio Gear</option>
                    <option value="Electronics">Electronics & Testing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#0F2A2E] dark:text-[#E6F4F2] mb-1.5">
                    Max Days per Booking *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    required
                    value={addMaxDays}
                    onChange={(e) => setAddMaxDays(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-[#F7FBFA] dark:bg-[#0B1415] border border-[#0F2A2E]/15 dark:border-[#E6F4F2]/15 text-sm tabular-nums text-[#0F2A2E] dark:text-[#E6F4F2] focus:outline-none focus:border-[#0D9488] dark:focus:border-[#2DD4BF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#0F2A2E] dark:text-[#E6F4F2] mb-1.5">
                  Campus Location & Room *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Media Lab 204, Calder Hall"
                  value={addLocation}
                  onChange={(e) => setAddLocation(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-[#F7FBFA] dark:bg-[#0B1415] border border-[#0F2A2E]/15 dark:border-[#E6F4F2]/15 text-sm text-[#0F2A2E] dark:text-[#E6F4F2] focus:outline-none focus:border-[#0D9488] dark:focus:border-[#2DD4BF]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#0F2A2E] dark:text-[#E6F4F2] mb-1.5">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="What is included, model specifications, what students can do with it..."
                  value={addDescription}
                  onChange={(e) => setAddDescription(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#F7FBFA] dark:bg-[#0B1415] border border-[#0F2A2E]/15 dark:border-[#E6F4F2]/15 text-sm text-[#0F2A2E] dark:text-[#E6F4F2] focus:outline-none focus:border-[#0D9488] dark:focus:border-[#2DD4BF] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#0F2A2E] dark:text-[#E6F4F2] mb-1.5">
                  Rules & Borrowing Guidelines
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Clean the nozzle after each print; return lenses in protective caps."
                  value={addRules}
                  onChange={(e) => setAddRules(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#F7FBFA] dark:bg-[#0B1415] border border-[#0F2A2E]/15 dark:border-[#E6F4F2]/15 text-sm text-[#0F2A2E] dark:text-[#E6F4F2] focus:outline-none focus:border-[#0D9488] dark:focus:border-[#2DD4BF] resize-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <input
                  type="checkbox"
                  id="add-requires-training"
                  checked={addRequiresTraining}
                  onChange={(e) => setAddRequiresTraining(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0D9488] focus:ring-[#0D9488]"
                />
                <label
                  htmlFor="add-requires-training"
                  className="text-xs sm:text-sm text-[#0F2A2E] dark:text-[#E6F4F2] cursor-pointer"
                >
                  Requires safety training / department certification
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={addingResource}
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-[#0F2A2E]/75 dark:text-[#E6F4F2]/75 hover:bg-[#F7FBFA] dark:hover:bg-[#0B1415] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingResource}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-[#0D9488] hover:bg-[#0F766E] text-white dark:bg-[#2DD4BF] dark:hover:bg-[#14B8A6] dark:text-[#0B1415] transition-colors duration-150 cursor-pointer disabled:opacity-60 whitespace-nowrap"
                >
                  {addingResource ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      <span>Saving to Supabase...</span>
                    </>
                  ) : (
                    <span>Publish listing</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
