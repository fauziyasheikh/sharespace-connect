import { AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { DEMO_PROFILES } from '../data/demoUsers';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';

const DEMO_EMAILS = [
  'student@sharespace.demo',
  'owner@sharespace.demo',
  'riya@sharespace.demo',
  'admin@sharespace.demo',
];

export function LoginPage() {
  const { loginWithEmail, isLoggingIn, loginError, clearLoginError } = useApp();
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [dbProfiles, setDbProfiles] = useState<Record<string, Profile>>({});
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const navigate = useNavigate();

  // Load profiles from the Supabase profiles table by email
  useEffect(() => {
    async function fetchProfiles() {
      setLoadingProfiles(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .in('email', DEMO_EMAILS);

        if (data && data.length > 0) {
          const profileMap: Record<string, Profile> = {};
          data.forEach((p) => {
            if (p.email) {
              profileMap[p.email.toLowerCase()] = p;
            }
          });
          setDbProfiles(profileMap);
        }
      } catch (err: unknown) {
        console.warn('Notice while loading demo profiles from Supabase:', err);
      } finally {
        setLoadingProfiles(false);
      }
    }

    fetchProfiles();
  }, []);

  const handleContinueAs = async (email: string) => {
    setSelectedEmail(email);
    clearLoginError();
    const result = await loginWithEmail(email);
    if (result.success) {
      navigate('/');
    }
    setSelectedEmail(null);
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 sm:px-6 py-12 sm:py-20">
      <div className="w-full max-w-xl">
        <div className="rounded-3xl bg-white dark:bg-[#12201F] border border-[#0F2A2E]/8 dark:border-[#E6F4F2]/10 p-8 sm:p-12 shadow-xs">
          <p className="text-sm font-medium text-[#0D9488] dark:text-[#2DD4BF] mb-3">
            Use what exists. Share what matters.
          </p>

          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#0F2A2E] dark:text-[#E6F4F2] text-balance">
            Welcome to ShareSpace
          </h1>

          <p className="mt-4 text-base leading-relaxed text-[#0F2A2E]/75 dark:text-[#E6F4F2]/75">
            Borrow underused cameras, 3D printers, and lab rooms shared across college departments.
          </p>

          {/* Friendly Error Notice */}
          {loginError && (
            <div
              role="alert"
              className="mt-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 text-rose-900 dark:text-rose-200 text-sm flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" aria-hidden="true" />
              <div className="flex-1">
                <p className="font-medium">Sign in notice</p>
                <p className="mt-1 text-xs sm:text-sm text-rose-800 dark:text-rose-300 leading-relaxed">
                  {loginError}
                </p>
              </div>
            </div>
          )}

          {/* 4 "Continue as" Buttons loaded from profiles table */}
          <div className="mt-8 space-y-3">
            {DEMO_EMAILS.map((email, index) => {
              const loadedProfile = dbProfiles[email.toLowerCase()];
              const fallbackProfile = DEMO_PROFILES.find(
                (p) => p.email.toLowerCase() === email.toLowerCase()
              );
              const person = loadedProfile || fallbackProfile;
              const personName = person?.name || email;

              const isPrimary = index === 0;
              const isCurrentLoading = isLoggingIn && selectedEmail === email;

              if (isPrimary) {
                return (
                  <button
                    key={email}
                    type="button"
                    disabled={isLoggingIn}
                    onClick={() => handleContinueAs(email)}
                    className="w-full min-h-14 px-5 py-3.5 rounded-2xl bg-[#0D9488] hover:bg-[#0F766E] text-white dark:bg-[#2DD4BF] dark:hover:bg-[#14B8A6] dark:text-[#0B1415] font-medium text-sm sm:text-base flex items-center justify-between transition-colors duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D9488] dark:focus-visible:outline-[#2DD4BF]"
                  >
                    <div className="min-w-0 pr-3">
                      <div className="flex items-center gap-2">
                        {isCurrentLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
                        ) : null}
                        <span className="font-semibold">
                          Continue as {personName}
                        </span>
                      </div>
                      <p className="text-xs opacity-90 font-normal truncate mt-0.5">
                        {email}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 shrink-0 opacity-90" aria-hidden="true" />
                  </button>
                );
              }

              return (
                <button
                  key={email}
                  type="button"
                  disabled={isLoggingIn}
                  onClick={() => handleContinueAs(email)}
                  className="w-full min-h-14 px-5 py-3.5 rounded-2xl bg-[#F7FBFA] dark:bg-[#0B1415] hover:bg-[#CCFBF1]/55 dark:hover:bg-[#2DD4BF]/12 border border-[#0F2A2E]/12 dark:border-[#E6F4F2]/12 text-[#0F2A2E] dark:text-[#E6F4F2] font-medium text-sm sm:text-base flex items-center justify-between transition-colors duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D9488] dark:focus-visible:outline-[#2DD4BF]"
                >
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      {isCurrentLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[#0D9488] dark:text-[#2DD4BF] shrink-0" aria-hidden="true" />
                      ) : null}
                      <span className="font-medium">
                        Continue as {personName}
                      </span>
                    </div>
                    <p className="text-xs text-[#0F2A2E]/60 dark:text-[#E6F4F2]/60 font-normal truncate mt-0.5">
                      {email}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 shrink-0 text-[#0F2A2E]/40 dark:text-[#E6F4F2]/40" aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
