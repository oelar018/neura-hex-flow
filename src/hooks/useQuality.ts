import { useState, useEffect } from 'react';
import { QualityMode, detectQualityMode, getCurrentQuality, getQualityConfig } from '../config/visual';

export const useQuality = () => {
  const [quality, setQuality] = useState<QualityMode>(getCurrentQuality);
  const [config, setConfig] = useState(() => getQualityConfig());

  useEffect(() => {
    const handleQualityChange = (event: CustomEvent<QualityMode>) => {
      setQuality(event.detail);
      setConfig(getQualityConfig());
    };

    window.addEventListener('qualitychange', handleQualityChange as EventListener);
    return () => window.removeEventListener('qualitychange', handleQualityChange as EventListener);
  }, []);

  return { quality, config };
};

export const usePerformanceOptimization = () => {
  const { config } = useQuality();
  
  useEffect(() => {
    // Remove will-change from all elements when not needed
    const removeWillChange = () => {
      const elements = document.querySelectorAll('[style*="will-change"]');
      elements.forEach(el => {
        (el as HTMLElement).style.willChange = 'auto';
      });
    };

    // Only apply will-change on user interaction
    const handleInteractionStart = (e: Event) => {
      if (e.target instanceof HTMLElement) {
        e.target.style.willChange = 'transform, opacity';
      }
    };

    const handleInteractionEnd = (e: Event) => {
      if (e.target instanceof HTMLElement) {
        e.target.style.willChange = 'auto';
      }
    };

    document.addEventListener('mouseenter', handleInteractionStart, true);
    document.addEventListener('mouseleave', handleInteractionEnd, true);
    document.addEventListener('focus', handleInteractionStart, true);
    document.addEventListener('blur', handleInteractionEnd, true);

    removeWillChange();

    return () => {
      document.removeEventListener('mouseenter', handleInteractionStart, true);
      document.removeEventListener('mouseleave', handleInteractionEnd, true);
      document.removeEventListener('focus', handleInteractionStart, true);
      document.removeEventListener('blur', handleInteractionEnd, true);
    };
  }, [config]);

  return config;
};