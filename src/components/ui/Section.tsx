import * as React from "react";
import { cn } from "@/lib/utils";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  padding?: "sm" | "md" | "lg" | "xl";
  divider?: boolean;
  gradient?: boolean;
}

const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ 
    className, 
    maxWidth = "xl", 
    padding = "lg", 
    divider = false,
    gradient = false,
    children, 
    ...props 
  }, ref) => {
    const maxWidthClasses = {
      sm: "max-w-2xl",
      md: "max-w-4xl", 
      lg: "max-w-5xl",
      xl: "max-w-6xl",
      "2xl": "max-w-7xl",
      full: "max-w-full"
    };

    const paddingClasses = {
      sm: "py-12 px-6",
      md: "py-16 px-6", 
      lg: "py-24 px-6",
      xl: "py-32 px-6"
    };

    return (
      <section
        ref={ref}
        className={cn(
          "relative",
          gradient && "bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent",
          className
        )}
        {...props}
      >
        {/* Subtle divider */}
        {divider && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        )}
        
        {/* Hero blend gradient */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background/100 via-background/95 to-background/80 pointer-events-none" />
        
        <div className={cn(
          "container mx-auto relative",
          maxWidthClasses[maxWidth],
          paddingClasses[padding]
        )}>
          {children}
        </div>
      </section>
    );
  }
);

Section.displayName = "Section";

export { Section };