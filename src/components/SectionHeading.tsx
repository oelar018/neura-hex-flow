import React from "react";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  eyebrow,
  title,
  subtitle,
  className = ""
}) => {
  return (
    <div className={`text-center mb-12 ${className}`}>
      {eyebrow && (
        <p className="text-sm font-semibold text-foreground-muted uppercase tracking-wider mb-3">
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className="text-lg text-foreground-muted max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
};