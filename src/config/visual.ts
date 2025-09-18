export type QualityMode = 'high' | 'medium' | 'low' | 'auto';

// Default quality mode
export const VISUAL_QUALITY: QualityMode = 'auto';
export const MOTION_DENSITY_DEFAULT = 0.6;

// Performance thresholds
const LOW_END_MEMORY_THRESHOLD = 4; // GB
const MOBILE_SCREEN_THRESHOLD = 768; // px

// Detect device capabilities
export function detectQualityMode(): QualityMode {
  if (typeof window === 'undefined') return 'medium';
  
  // Check for query parameter override
  const params = new URLSearchParams(window.location.search);
  const queryQuality = params.get('quality') as QualityMode;
  if (queryQuality && ['high', 'medium', 'low'].includes(queryQuality)) {
    return queryQuality;
  }
  
  // Check for dev override
  if ((window as any).__visualQuality) {
    return (window as any).__visualQuality;
  }
  
  // Auto-detect based on device capabilities
  const isMobile = window.innerWidth < MOBILE_SCREEN_THRESHOLD;
  const hasLowMemory = (navigator as any).deviceMemory && (navigator as any).deviceMemory < LOW_END_MEMORY_THRESHOLD;
  const isSlowNetwork = (navigator as any).connection && (navigator as any).connection.effectiveType !== '4g';
  
  if (isMobile || hasLowMemory || isSlowNetwork) {
    return 'medium';
  }
  
  return 'high';
}

// Quality-specific configurations
export const QUALITY_CONFIG = {
  high: {
    particleCount: 120,
    particleAlpha: 1,
    blurRadius: 'blur-2xl',
    shadowLayers: 3,
    animationDuration: 0.3,
    parallaxStrength: 1,
    glowIntensity: 1,
    useBackdropBlur: true,
    enableParallax: true,
    contentVisibility: true,
  },
  medium: {
    particleCount: 80,
    particleAlpha: 0.85,
    blurRadius: 'blur-xl',
    shadowLayers: 2,
    animationDuration: 0.28,
    parallaxStrength: 0.7,
    glowIntensity: 0.9,
    useBackdropBlur: true,
    enableParallax: true,
    contentVisibility: true,
  },
  low: {
    particleCount: 40,
    particleAlpha: 0.7,
    blurRadius: 'blur-lg',
    shadowLayers: 1,
    animationDuration: 0.25,
    parallaxStrength: 0,
    glowIntensity: 0.8,
    useBackdropBlur: false,
    enableParallax: false,
    contentVisibility: true,
  },
} as const;

// Current quality mode (reactive)
let currentQuality: QualityMode = detectQualityMode();

export function getCurrentQuality(): QualityMode {
  return currentQuality;
}

export function setQuality(quality: QualityMode) {
  currentQuality = quality;
  // Trigger re-render if needed
  window.dispatchEvent(new CustomEvent('qualitychange', { detail: quality }));
}

export function getQualityConfig() {
  const mode = currentQuality === 'auto' ? detectQualityMode() : currentQuality;
  return QUALITY_CONFIG[mode];
}

// Dev helper
if (typeof window !== 'undefined') {
  (window as any).__setQuality = setQuality;
}