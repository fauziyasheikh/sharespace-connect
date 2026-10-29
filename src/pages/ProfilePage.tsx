import {
  Award,
  CheckCircle2,
  Clock,
  Compass,
  FileBox,
  GraduationCap,
  Loader2,
  Lock,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Trophy,
  User,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';

interface LevelInfo {
  name: string;
  minPoints: number;
  nextPoints: number | null;
  progressPercent: number;
  remainingPoints: number;
}

export function ProfilePage() {
  const { currentUser } = useApp();
  const [listingsCount, setListingsCount] = useState<number>(0);
  const [borrowsCount, setBorrowsCount] = useState<number>(0);
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUserData() {
      if (!currentUser) return;
      setLoading(true);
      try {
        // Query user listings count
        const { count: resCount } = await supabase
          .from('resources')
          .select('id', { count: 'exact', head: true })
          .eq('owner_id', currentUser.id);

        setListingsCount(resCount || 0);

        // Query user bookings count
        const { data: bookingsData } = await supabase
          .from('bookings')
          .select('id, status')
          .eq('user_id', currentUser.id);

        const totalBorrows = bookingsData?.length || 0;
        const completed =
          bookingsData?.filter((b) => b.status === 'completed' || b.status === 'approved').length || 0;

        setBorrowsCount(totalBorrows);
        setCompletedCount(completed);
      } catch (err: unknown) {
        console.warn('Error computing gamification profile metrics:', err);
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, [currentUser]);

  if (!currentUser) return null;

  // Compute total points from base points + activity
  const calculatedPoints = Math.max(
    currentUser.points ?? 0,
    listingsCount * 50 + borrowsCount * 25 + (currentUser.trained ? 25 : 0)
  );

  // Compute level
  // Levels: Newcomer 0, Helper 50, Trusted Sharer 150, Community Hero 300
  const getLevelInfo = (pts: number): LevelInfo => {
    if (pts >= 300) {
      return {
        name: 'Community Hero',
        minPoints: 300,
        nextPoints: null,
        progressPercent: 100,
        remainingPoints: 0,
      };
    }
    if (pts >= 150) {
      const range = 300 - 150;
      const progress = ((pts - 150) / range) * 100;
      return {
        name: 'Trusted Sharer',
        minPoints: 150,
        nextPoints: 300,
        progressPercent: Math.min(100, Math.max(0, Math.round(progress))),
        remainingPoints: 300 - pts,
      };
    }
    if (pts >= 50) {
      const range = 150 - 50;
      const progress = ((pts - 50) / range) * 100;
      return {
        name: 'Helper',
        minPoints: 50,
        nextPoints: 150,
        progressPercent: Math.min(100, Math.max(0, Math.round(progress))),
        remainingPoints: 150 - pts,
      };
    }
    const range = 50;
    const progress = (pts / range) * 100;
    return {
      name: 'Newcomer',
      minPoints: 0,
      nextPoints: 50,
      progressPercent: Math.min(100, Math.max(0, Math.round(progress))),
      remainingPoints: 50 - pts,
    };
  };

  const level = getLevelInfo(calculatedPoints);

  // Badges computed from data
  const hasFirstListing = listingsCount > 0;
  const hasFirstBorrow = borrowsCount > 0;
  const hasOnTimeReturner = completedCount > 0 || (borrowsCount > 0 && calculatedPoints >= 50);

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      {/* Header Profile Card */}
      <div className="rounded-3xl bg-white dark:bg-[#12201F] border border-[#0F2A2E]/8 dark:border-[#E6F4F2]/10 p-6 sm:p-10 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-[#0F2A2E]/8 dark:border-[#E6F4F2]/10">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#CCFBF1] dark:bg-[#2DD4BF]/20 text-[#0D9488] dark:text-[#2DD4BF] flex items-center justify-center font-bold text-2xl sm:text-3xl shrink-0">
              {currentUser.name.charAt(0)}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0F2A2E] dark:text-[#E6F4F2]">
                  {currentUser.name}
                </h1>

                {/* Verified tick if verified */}
                {currentUser.verified && (
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#CCFBF1] text-[#0F2A2E] dark:bg-[#2DD4BF]/20 dark:text-[#2DD4BF]"
                    title="Verified campus community member"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Verified</span>
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-[#0F2A2E]/65 dark:text-[#E6F4F2]/65 mt-1">
                {currentUser.email} ·{' '}
                <span className="capitalize font-medium text-[#0D9488] dark:text-[#2DD4BF]">
                  {currentUser.role}
                </span>
              </p>
            </div>
          </div>

          {/* Primary Action Button on screen */}
          <Link
            to="/listings"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white dark:bg-[#2DD4BF] dark:hover:bg-[#14B8A6] dark:text-[#0B1415] text-xs sm:text-sm font-medium transition-colors duration-150 whitespace-nowrap self-start sm:self-center"
          >
            Manage my listings
          </Link>
        </div>

        {/* Gamified Points & Level Progress Bar */}
        <div className="pt-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-[#0D9488] dark:text-[#2DD4BF]">
                Current Tier
              </p>
              <h2 className="text-xl sm:text-2xl font-semibold text-[#0F2A2E] dark:text-[#E6F4F2] mt-0.5 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#0D9488] dark:text-[#2DD4BF]" aria-hidden="true" />
                <span>{level.name}</span>
              </h2>
            </div>

            <div className="text-right sm:text-right">
              <span className="text-2xl sm:text-3xl font-bold tabular-nums text-[#0F2A2E] dark:text-[#E6F4F2]">
                {calculatedPoints}
              </span>
              <span className="text-xs sm:text-sm text-[#0F2A2E]/60 dark:text-[#E6F4F2]/60 ml-1">
                points
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="h-3 w-full bg-[#0F2A2E]/8 dark:bg-[#E6F4F2]/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#0D9488] dark:bg-[#2DD4BF] transition-all duration-500 rounded-full"
                style={{ width: `${level.progressPercent}%` }}
              />
            </div>

            <div className="mt-2.5 flex items-center justify-between text-xs text-[#0F2A2E]/60 dark:text-[#E6F4F2]/60 tabular-nums">
              <span>{level.progressPercent}% to next rank</span>
              {level.nextPoints ? (
                <span>
                  {level.remainingPoints} pts until {level.name === 'Newcomer' ? 'Helper' : level.name === 'Helper' ? 'Trusted Sharer' : 'Community Hero'}
                </span>
              ) : (
                <span className="font-medium text-[#0D9488] dark:text-[#2DD4BF]">
                  Maximum Community Tier
                </span>
              )}
            </div>
          </div>

          {/* Level Tiers Reference */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
            {[
              { name: 'Newcomer', pts: 0 },
              { name: 'Helper', pts: 50 },
              { name: 'Trusted Sharer', pts: 150 },
              { name: 'Community Hero', pts: 300 },
            ].map((tier) => {
              const isReached = calculatedPoints >= tier.pts;
              const isCurrent = level.name === tier.name;
              return (
                <div
                  key={tier.name}
                  className={`p-3 rounded-2xl border text-center transition-colors ${
                    isCurrent
                      ? 'border-[#0D9488] dark:border-[#2DD4BF] bg-[#CCFBF1]/40 dark:bg-[#2DD4BF]/10'
                      : isReached
                        ? 'border-[#0F2A2E]/10 dark:border-[#E6F4F2]/10 bg-white dark:bg-[#12201F]'
                        : 'border-[#0F2A2E]/6 dark:border-[#E6F4F2]/6 opacity-50 bg-[#F7FBFA] dark:bg-[#0B1415]'
                  }`}
                >
                  <p className="text-xs font-semibold text-[#0F2A2E] dark:text-[#E6F4F2]">
                    {tier.name}
                  </p>
                  <p className="text-[11px] tabular-nums text-[#0F2A2E]/60 dark:text-[#E6F4F2]/60 mt-0.5">
                    {tier.pts} pts
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Badges Section */}
      <div className="rounded-3xl bg-white dark:bg-[#12201F] border border-[#0F2A2E]/8 dark:border-[#E6F4F2]/10 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-[#0F2A2E] dark:text-[#E6F4F2] flex items-center gap-2">
            <Award className="w-5 h-5 text-[#0D9488] dark:text-[#2DD4BF]" aria-hidden="true" />
            <span>Community Badges</span>
          </h2>
          <p className="text-xs text-[#0F2A2E]/60 dark:text-[#E6F4F2]/60 mt-0.5">
            Badges earned through active sharing, borrowing, and on-time equipment returns.
          </p>
        </div>

        {/* Small Rounded Chips as requested */}
        <div className="flex flex-wrap gap-3">
          {/* Badge 1: First Listing */}
          <div
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full border text-xs font-medium transition-all ${
              hasFirstListing
                ? 'bg-[#CCFBF1] text-[#0F2A2E] border-[#0D9488]/30 dark:bg-[#2DD4BF]/20 dark:text-[#2DD4BF] dark:border-[#2DD4BF]/40 shadow-xs'
                : 'opacity-40 grayscale border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400'
            }`}
            title={hasFirstListing ? 'Earned! You listed equipment.' : 'Locked: List your first resource to unlock.'}
          >
            {hasFirstListing ? (
              <PackageCheck className="w-4 h-4 text-[#0D9488] dark:text-[#2DD4BF]" aria-hidden="true" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-neutral-400" aria-hidden="true" />
            )}
            <span>First Listing</span>
          </div>

          {/* Badge 2: First Borrow */}
          <div
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full border text-xs font-medium transition-all ${
              hasFirstBorrow
                ? 'bg-[#CCFBF1] text-[#0F2A2E] border-[#0D9488]/30 dark:bg-[#2DD4BF]/20 dark:text-[#2DD4BF] dark:border-[#2DD4BF]/40 shadow-xs'
                : 'opacity-40 grayscale border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400'
            }`}
            title={hasFirstBorrow ? 'Earned! You requested a borrow.' : 'Locked: Request to borrow your first resource.'}
          >
            {hasFirstBorrow ? (
              <Compass className="w-4 h-4 text-[#0D9488] dark:text-[#2DD4BF]" aria-hidden="true" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-neutral-400" aria-hidden="true" />
            )}
            <span>First Borrow</span>
          </div>

          {/* Badge 3: On-Time Returner */}
          <div
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full border text-xs font-medium transition-all ${
              hasOnTimeReturner
                ? 'bg-[#CCFBF1] text-[#0F2A2E] border-[#0D9488]/30 dark:bg-[#2DD4BF]/20 dark:text-[#2DD4BF] dark:border-[#2DD4BF]/40 shadow-xs'
                : 'opacity-40 grayscale border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400'
            }`}
            title={hasOnTimeReturner ? 'Earned! Excellent community standing.' : 'Locked: Return resources on-time without dispute.'}
          >
            {hasOnTimeReturner ? (
              <Clock className="w-4 h-4 text-[#0D9488] dark:text-[#2DD4BF]" aria-hidden="true" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-neutral-400" aria-hidden="true" />
            )}
            <span>On-Time Returner</span>
          </div>
        </div>
      </div>

      {/* Safety Training Status Card */}
      <div className="rounded-3xl bg-white dark:bg-[#12201F] border border-[#0F2A2E]/8 dark:border-[#E6F4F2]/10 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-[#0F2A2E] dark:text-[#E6F4F2] flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-[#0D9488] dark:text-[#2DD4BF]" aria-hidden="true" />
            <span>Campus Safety & Lab Certification</span>
          </h3>
          <p className="text-xs text-[#0F2A2E]/65 dark:text-[#E6F4F2]/65">
            {currentUser.trained
              ? 'Safety certification is on file. You are certified to borrow restricted 3D printers and specialized equipment.'
              : 'No safety certification recorded yet. You can borrow open resources; visit the makerspace to complete training.'}
          </p>
        </div>

        <div className="shrink-0">
          {currentUser.trained ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Certified</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
              <span>Training Needed</span>
            </span>
          )}
        </div>
      </div>
    </main>
  );
}
