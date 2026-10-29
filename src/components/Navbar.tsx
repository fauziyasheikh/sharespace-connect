import { CheckCircle2, LogOut, Menu, Moon, Sun, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export function Navbar() {
  const { currentUser, logout, theme, toggleTheme } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSwitchUser = () => {
    setMobileMenuOpen(false);
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `relative py-1 text-sm font-medium transition-colors duration-150 whitespace-nowrap shrink-0 ${
      isActive
        ? 'text-[#0D9488] dark:text-[#2DD4BF] after:absolute after:inset-x-0 after:-bottom-[19px] after:h-[2px] after:bg-[#0D9488] dark:after:bg-[#2DD4BF]'
        : 'text-[#0F2A2E]/70 dark:text-[#E6F4F2]/70 hover:text-[#0F2A2E] dark:hover:text-[#E6F4F2]'
    }`;

  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block py-2.5 text-base font-medium transition-colors duration-150 ${
      isActive
        ? 'text-[#0D9488] dark:text-[#2DD4BF]'
        : 'text-[#0F2A2E]/80 dark:text-[#E6F4F2]/80 hover:text-[#0F2A2E] dark:hover:text-[#E6F4F2]'
    }`;

  return (
    <header className="sticky top-0 z-30 bg-[#F7FBFA]/90 dark:bg-[#0B1415]/90 backdrop-blur-md border-b border-[#0F2A2E]/8 dark:border-[#E6F4F2]/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark */}
        <Link
          to={currentUser ? '/' : '/login'}
          onClick={() => setMobileMenuOpen(false)}
          className="text-lg font-semibold tracking-tight text-[#0F2A2E] dark:text-[#E6F4F2] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0D9488] dark:focus-visible:outline-[#2DD4BF] rounded-sm"
        >
          ShareSpace
        </Link>

        {/* Zone 2: Navigation Links: Browse, My Bookings, My Listings, Profile */}
        {currentUser && (
          <nav aria-label="Main navigation" className="hidden md:flex items-center gap-7">
            <NavLink to="/" end className={navLinkClass}>
              Browse
            </NavLink>
            <NavLink to="/bookings" className={navLinkClass}>
              My Bookings
            </NavLink>
            <NavLink to="/listings" className={navLinkClass}>
              My Listings
            </NavLink>
            <NavLink to="/profile" className={navLinkClass}>
              Profile
            </NavLink>
          </nav>
        )}

        {/* Zone 3: Profile info + Theme Toggle */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {currentUser && (
            <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-[#0F2A2E]/75 dark:text-[#E6F4F2]/75">
              <Link
                to="/profile"
                className="flex items-center gap-1.5 hover:text-[#0D9488] dark:hover:text-[#2DD4BF] transition-colors"
                title="View your profile"
              >
                <span className="hidden sm:inline text-[#0F2A2E]/55 dark:text-[#E6F4F2]/55">
                  Signed in as
                </span>
                <strong className="font-medium text-[#0F2A2E] dark:text-[#E6F4F2] truncate max-w-[120px] sm:max-w-[180px]">
                  {currentUser.name}
                </strong>
                {currentUser.verified && (
                  <CheckCircle2
                    className="w-3.5 h-3.5 text-[#0D9488] dark:text-[#2DD4BF] shrink-0"
                    aria-label="Verified user"
                  />
                )}
              </Link>
              <span aria-hidden="true" className="text-[#0F2A2E]/25 dark:text-[#E6F4F2]/25">
                ·
              </span>
              <button
                type="button"
                onClick={handleSwitchUser}
                className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-[#0F2A2E]/70 dark:text-[#E6F4F2]/70 hover:text-[#0D9488] dark:hover:text-[#2DD4BF] transition-colors duration-150 whitespace-nowrap cursor-pointer py-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D9488] dark:focus-visible:outline-[#2DD4BF] rounded-sm"
              >
                <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Switch</span>
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            className="w-10 h-10 inline-flex items-center justify-center rounded-xl border border-[#0F2A2E]/10 dark:border-[#E6F4F2]/12 bg-white dark:bg-[#12201F] text-[#0F2A2E] dark:text-[#E6F4F2] hover:bg-[#CCFBF1]/60 dark:hover:bg-[#2DD4BF]/15 transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D9488] dark:focus-visible:outline-[#2DD4BF]"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 stroke-[1.75]" aria-hidden="true" />
            ) : (
              <Moon className="w-4 h-4 stroke-[1.75]" aria-hidden="true" />
            )}
          </button>

          {currentUser && (
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
              className="md:hidden w-10 h-10 inline-flex items-center justify-center rounded-xl border border-[#0F2A2E]/10 dark:border-[#E6F4F2]/12 bg-white dark:bg-[#12201F] text-[#0F2A2E] dark:text-[#E6F4F2] hover:bg-[#CCFBF1]/60 dark:hover:bg-[#2DD4BF]/15 transition-colors duration-150 cursor-pointer"
            >
              {mobileMenuOpen ? (
                <X className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Menu className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Responsive Mobile Navigation Drawer */}
      {currentUser && mobileMenuOpen && (
        <nav
          aria-label="Mobile navigation"
          className="md:hidden border-t border-[#0F2A2E]/8 dark:border-[#E6F4F2]/10 bg-white dark:bg-[#12201F] px-4 py-3 space-y-1"
        >
          <NavLink to="/" end onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass}>
            Browse
          </NavLink>
          <NavLink
            to="/bookings"
            onClick={() => setMobileMenuOpen(false)}
            className={mobileNavLinkClass}
          >
            My Bookings
          </NavLink>
          <NavLink
            to="/listings"
            onClick={() => setMobileMenuOpen(false)}
            className={mobileNavLinkClass}
          >
            My Listings
          </NavLink>
          <NavLink
            to="/profile"
            onClick={() => setMobileMenuOpen(false)}
            className={mobileNavLinkClass}
          >
            Profile
          </NavLink>
        </nav>
      )}
    </header>
  );
}
