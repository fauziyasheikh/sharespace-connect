import {
  Box,
  Camera,
  DoorClosed,
  Laptop,
  Microscope,
  Package,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useState } from 'react';

// Specific resource cover image mappings
const RESOURCE_COVERS: Record<string, string> = {
  'canon dslr camera': '/images/camera.jpg',
  '3d printer (ender 3)': '/images/printer.jpg',
  'seminar room 204': '/images/room.jpg',
  'oscilloscope': '/images/scope.jpg',
  'laptop with gpu': '/images/laptop.jpg',
};

function getCoverForName(name: string): string | null {
  const lower = name.toLowerCase().trim();
  for (const [key, path] of Object.entries(RESOURCE_COVERS)) {
    if (lower.includes(key) || key.includes(lower)) {
      return path;
    }
  }
  return null;
}

interface ResourceImageProps {
  src?: string | null;
  alt: string;
  category?: string;
  className?: string;
}

export function ResourceImage({ src, alt, category = '', className = '' }: ResourceImageProps) {
  const [failed, setFailed] = useState(false);

  // Check explicit src or fallback mapped cover for this specific resource name
  const effectiveSrc = (src && typeof src === 'string' && src.trim() !== '') ? src.trim() : getCoverForName(alt);

  const lowerCat = (category || '').toLowerCase();
  const lowerAlt = (alt || '').toLowerCase();

  // Pick category icon based on category or item name
  let CategoryIcon = Package;
  if (
    lowerCat.includes('media') ||
    lowerCat.includes('camera') ||
    lowerCat.includes('photo') ||
    lowerCat.includes('video') ||
    lowerAlt.includes('camera') ||
    lowerAlt.includes('dslr')
  ) {
    CategoryIcon = Camera;
  } else if (
    lowerCat.includes('fabrication') ||
    lowerCat.includes('3d') ||
    lowerCat.includes('printer') ||
    lowerAlt.includes('printer')
  ) {
    CategoryIcon = Box;
  } else if (
    lowerCat.includes('space') ||
    lowerCat.includes('room') ||
    lowerCat.includes('hall') ||
    lowerCat.includes('studio') ||
    lowerAlt.includes('room')
  ) {
    CategoryIcon = DoorClosed;
  } else if (
    lowerCat.includes('electronics') ||
    lowerCat.includes('circuit') ||
    lowerCat.includes('sensor') ||
    lowerAlt.includes('oscilloscope')
  ) {
    CategoryIcon = Zap;
  } else if (
    lowerCat.includes('computing') ||
    lowerCat.includes('laptop') ||
    lowerCat.includes('gpu') ||
    lowerCat.includes('pc') ||
    lowerAlt.includes('laptop')
  ) {
    CategoryIcon = Laptop;
  } else if (lowerCat.includes('lab') || lowerCat.includes('science')) {
    CategoryIcon = Microscope;
  } else {
    CategoryIcon = Sparkles;
  }

  const hasValidSrc = Boolean(effectiveSrc && !failed);

  if (!hasValidSrc) {
    return (
      <div
        className={`w-full h-full flex flex-col items-center justify-center p-6 text-center select-none bg-gradient-to-br from-[#0D9488]/15 via-[#14B8A6]/20 to-[#CCFBF1] dark:from-[#0F766E]/40 dark:via-[#115E59]/30 dark:to-[#2DD4BF]/20 ${className}`}
      >
        <div className="w-14 h-14 rounded-2xl bg-white/80 dark:bg-[#12201F]/80 backdrop-blur-xs shadow-xs border border-[#0D9488]/15 dark:border-[#2DD4BF]/25 flex items-center justify-center text-[#0D9488] dark:text-[#2DD4BF] transition-transform duration-200">
          <CategoryIcon className="w-7 h-7 stroke-[1.75]" aria-hidden="true" />
        </div>
        <span className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-[#0D9488] dark:text-[#2DD4BF]">
          {category || 'Campus Resource'}
        </span>
        <span className="mt-1 text-xs font-medium text-[#0F2A2E]/70 dark:text-[#E6F4F2]/70 line-clamp-1 max-w-[85%]">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={effectiveSrc || undefined}
      alt={alt}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setFailed(true)}
      className={`w-full h-full object-cover ${className}`}
    />
  );
}


