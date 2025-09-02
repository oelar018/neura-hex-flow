import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-4xl mx-4 bg-card rounded-2xl shadow-2xl border border-border overflow-hidden">
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-background/80 hover:bg-background text-foreground"
        >
          <X className="w-5 h-5" />
        </Button>

        {/* Video content */}
        <div className="aspect-video bg-background-muted flex items-center justify-center">
          {/* Placeholder for actual video */}
          <div className="text-center space-y-4 p-8">
            <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-8 h-8 text-primary"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-foreground">
              30-Second Preview Coming Soon
            </h3>
            <p className="text-foreground-muted max-w-md">
              We're putting the finishing touches on our demo video. Join the waitlist to be the first to see Neura AI in action.
            </p>
          </div>
        </div>

        {/* Optional: Video metadata */}
        <div className="p-6 border-t border-border bg-background-subtle">
          <h4 className="font-medium text-foreground mb-2">
            See Neura AI in Action
          </h4>
          <p className="text-sm text-foreground-muted">
            Watch how Neura AI provides real-time insights during conversations without interrupting your flow.
          </p>
        </div>
      </div>
    </div>
  );
};