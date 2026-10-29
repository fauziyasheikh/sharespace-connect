import { AlertCircle, CheckCircle2, Clock, Loader2, RotateCcw, Search, ShieldAlert } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookingDialog } from '../components/BookingDialog';
import { ResourceImage } from '../components/ResourceImage';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { Resource } from '../types';

export function BrowsePage() {
  const { currentUser } = useApp();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [bookingResource, setBookingResource] = useState<Resource | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchResources = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await supabase
        .from('resources')
        .select('*')
        .order('name', { ascending: true });

      if (fetchErr) {
        setError(fetchErr.message || 'Unable to load campus resources from database.');
      } else {
        setResources(data || []);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred while loading resources.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  // Distinct categories from loaded resources
  const categories = useMemo(() => {
    const set = new Set<string>();
    resources.forEach((r) => {
      if (r.category) set.add(r.category);
    });
    return ['All', ...Array.from(set)];
  }, [resources]);

  const filteredResources = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return resources.filter((item) => {
      const matchesCategory =
        selectedCategory === 'All' ||
        (item.category && item.category.toLowerCase() === selectedCategory.toLowerCase());

      if (!matchesCategory) return false;
      if (!q) return true;

      const nameMatch = item.name ? item.name.toLowerCase().includes(q) : false;
      const catMatch = item.category ? item.category.toLowerCase().includes(q) : false;
      const locMatch = item.location ? item.location.toLowerCase().includes(q) : false;

      return nameMatch || catMatch || locMatch;
    });
  }, [resources, searchQuery, selectedCategory]);

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
        <div>
          <p className="text-sm font-medium text-[#0D9488] dark:text-[#2DD4BF] mb-2">
            Use what exists. Share what matters.
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0F2A2E] dark:text-[#E6F4F2] text-balance">
            Campus resources
          </h1>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchResources}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#0F2A2E]/12 dark:border-[#E6F4F2]/12 bg-white dark:bg-[#12201F] text-[#0F2A2E] dark:text-[#E6F4F2] hover:bg-[#CCFBF1]/50 dark:hover:bg-[#2DD4BF]/10 text-xs sm:text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>Refresh</span>
          </button>

          {/* Single Primary Button on screen */}
          <button
            type="button"
            onClick={() => navigate('/listings')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white dark:bg-[#2DD4BF] dark:hover:bg-[#14B8A6] dark:text-[#0B1415] text-xs sm:text-sm font-medium transition-colors duration-150 cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D9488] dark:focus-visible:outline-[#2DD4BF]"
          >
            <span>Share equipment</span>
          </button>
        </div>
      </div>

      {/* Success Toast Banner */}
      {successToast && (
        <div
          role="status"
          className="mb-8 p-4 rounded-2xl bg-[#CCFBF1]/70 dark:bg-[#2DD4BF]/15 border border-[#0D9488]/30 dark:border-[#2DD4BF]/30 text-[#0F2A2E] dark:text-[#E6F4F2] text-sm flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#0D9488] dark:text-[#2DD4BF] shrink-0" aria-hidden="true" />
            <span>{successToast}</span>
          </div>
          <button
            type="button"
            onClick={() => navigate('/bookings')}
            className="text-xs font-semibold text-[#0D9488] dark:text-[#2DD4BF] underline hover:opacity-80 shrink-0 cursor-pointer"
          >
            View in My Bookings →
          </button>
        </div>
      )}

      {/* Search Bar & Category Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div className="relative flex-1 max-w-xl">
          <Search
            className="w-4 h-4 text-[#0F2A2E]/45 dark:text-[#E6F4F2]/45 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Filter resources by name and category"
            placeholder="Search resources by name or category..."
            className="w-full h-12 pl-11 pr-4 rounded-2xl bg-white dark:bg-[#12201F] border border-[#0F2A2E]/10 dark:border-[#E6F4F2]/12 text-sm text-[#0F2A2E] dark:text-[#E6F4F2] placeholder:text-[#0F2A2E]/45 dark:placeholder:text-[#E6F4F2]/45 focus:outline-none focus:border-[#0D9488] dark:focus:border-[#2DD4BF] transition-colors"
          />
        </div>

        {/* Category Filter Tabs */}
        {categories.length > 1 && (
          <div
            role="tablist"
            aria-label="Filter by category"
            className="flex items-center gap-1 p-1 rounded-xl bg-white dark:bg-[#12201F] border border-[#0F2A2E]/8 dark:border-[#E6F4F2]/10 overflow-x-auto max-w-full"
          >
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  role="tab"
                  type="button"
                  aria-selected={active}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#CCFBF1] text-[#0F2A2E] dark:bg-[#2DD4BF]/20 dark:text-[#2DD4BF]'
                      : 'text-[#0F2A2E]/65 dark:text-[#E6F4F2]/65 hover:text-[#0F2A2E] dark:hover:text-[#E6F4F2]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Friendly Loading State */}
      {loading && (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#0D9488] dark:text-[#2DD4BF] mb-4" aria-hidden="true" />
          <p className="text-sm font-medium text-[#0F2A2E] dark:text-[#E6F4F2]">
            Loading campus resources from database...
          </p>
          <p className="text-xs text-[#0F2A2E]/60 dark:text-[#E6F4F2]/60 mt-1">
            Connecting to Supabase
          </p>
        </div>
      )}

      {/* Friendly Error State */}
      {!loading && error && (
        <div
          role="alert"
          className="rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 p-8 text-center max-w-lg mx-auto"
        >
          <AlertCircle className="w-8 h-8 text-rose-600 dark:text-rose-400 mx-auto mb-3" aria-hidden="true" />
          <h2 className="text-base font-semibold text-rose-900 dark:text-rose-200">
            Could not load resources
          </h2>
          <p className="text-sm text-rose-800 dark:text-rose-300 mt-2 leading-relaxed">
            {error}
          </p>
          <button
            type="button"
            onClick={fetchResources}
            className="mt-5 px-4 py-2 rounded-xl bg-white dark:bg-[#12201F] border border-rose-300 dark:border-rose-800 text-xs sm:text-sm font-medium text-rose-800 dark:text-rose-200 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors cursor-pointer"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredResources.length === 0 && (
        <div className="rounded-2xl bg-white dark:bg-[#12201F] border border-[#0F2A2E]/8 dark:border-[#E6F4F2]/10 py-16 px-6 text-center">
          <h2 className="text-lg font-medium text-[#0F2A2E] dark:text-[#E6F4F2]">
            {resources.length === 0 ? 'No resources in catalog yet' : 'No matching resources found'}
          </h2>
          <p className="mt-2 text-sm text-[#0F2A2E]/65 dark:text-[#E6F4F2]/65 max-w-md mx-auto">
            {resources.length === 0
              ? 'There are currently no rows in the Supabase resources table.'
              : 'Try clearing your search terms or selecting all categories.'}
          </p>
          {resources.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="mt-5 px-4 py-2 rounded-xl border border-[#0F2A2E]/15 dark:border-[#E6F4F2]/15 text-sm font-medium text-[#0F2A2E] dark:text-[#E6F4F2] hover:bg-[#CCFBF1]/50 dark:hover:bg-[#2DD4BF]/10 transition-colors cursor-pointer"
            >
              Reset filters
            </button>
          )}
        </div>
      )}

      {/* Resource Cards Grid */}
      {!loading && !error && filteredResources.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <article
              key={resource.id}
              onClick={() => navigate(`/resource/${resource.id}`)}
              className="group rounded-2xl bg-white dark:bg-[#12201F] border border-[#0F2A2E]/8 dark:border-[#E6F4F2]/10 overflow-hidden flex flex-col transition-all duration-150 hover:border-[#0D9488]/40 dark:hover:border-[#2DD4BF]/40 cursor-pointer shadow-xs hover:shadow-md"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-[#F7FBFA] dark:bg-[#0B1415] relative">
                <ResourceImage
                  src={resource.image_url}
                  alt={resource.name}
                  category={resource.category}
                  className="w-full h-full transition-transform duration-200 group-hover:scale-[1.02]"
                />
                {/* Small Training Required Badge */}
                {resource.requires_training && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/90 text-white text-xs font-medium backdrop-blur-xs shadow-xs">
                    <ShieldAlert className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Training required</span>
                  </div>
                )}
              </div>

              <div className="p-6 flex-1 flex flex-col">
                {/* Category & Location */}
                <div className="flex items-center gap-2 text-xs text-[#0F2A2E]/60 dark:text-[#E6F4F2]/60">
                  <span className="font-medium text-[#0D9488] dark:text-[#2DD4BF]">{resource.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="truncate">{resource.location}</span>
                </div>

                <h2 className="mt-2 text-lg font-semibold text-[#0F2A2E] dark:text-[#E6F4F2] leading-snug group-hover:text-[#0D9488] dark:group-hover:text-[#2DD4BF] transition-colors">
                  {resource.name}
                </h2>

                {resource.description && (
                  <p className="mt-2 text-sm text-[#0F2A2E]/70 dark:text-[#E6F4F2]/70 leading-relaxed line-clamp-2">
                    {resource.description}
                  </p>
                )}

                <div className="mt-auto pt-5">
                  <div className="pt-4 border-t border-[#0F2A2E]/8 dark:border-[#E6F4F2]/10 flex items-center justify-between gap-3 text-xs text-[#0F2A2E]/65 dark:text-[#E6F4F2]/65">
                    <span className="inline-flex items-center gap-1 tabular-nums font-medium">
                      <Clock className="w-3.5 h-3.5 text-[#0F2A2E]/50 dark:text-[#E6F4F2]/50" aria-hidden="true" />
                      <span>
                        Max {resource.max_days} day{resource.max_days === 1 ? '' : 's'}
                      </span>
                    </span>

                    <div className="flex items-center gap-2">
                      {currentUser && resource.owner_id === currentUser.id ? (
                        <span className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 text-xs font-medium">
                          Your item
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setBookingResource(resource);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white dark:bg-[#2DD4BF] dark:hover:bg-[#14B8A6] dark:text-[#0B1415] text-xs font-medium transition-colors cursor-pointer"
                        >
                          Request
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Booking Dialog for selected resource */}
      {bookingResource && currentUser && (
        <BookingDialog
          isOpen={Boolean(bookingResource)}
          onClose={() => setBookingResource(null)}
          resource={bookingResource}
          currentUser={currentUser}
          onSuccess={(status) => {
            setSuccessToast(
              `Booking request for "${bookingResource.name}" submitted successfully! (Status: ${status})`
            );
          }}
        />
      )}
    </main>
  );
}
