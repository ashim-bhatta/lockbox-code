"use client";

import type { ComponentProps, ReactNode } from "react";
import { AppIcon } from "@/components/ui/icons/AppIcon";

interface TechnicalCardProps {
  title: string;
  subtitle?: string;
  icon?: ComponentProps<typeof AppIcon>["name"];
  value?: string;
  badge?: ReactNode;
  footer?: ReactNode;
  accentColor?: "primary" | "secondary" | "tertiary";
  className?: string;
  children?: ReactNode;
}

export function TechnicalCard({
  title,
  subtitle,
  icon,
  value,
  badge,
  footer,
  accentColor = "primary",
  className = "",
  children,
}: TechnicalCardProps) {
  const accentClass = {
    primary: "group-hover:text-primary",
    secondary: "group-hover:text-secondary",
    tertiary: "group-hover:text-tertiary",
  }[accentColor];

  const glowClass = {
    primary: "data-glow-primary",
    secondary: "data-glow-secondary",
    tertiary: "data-glow-tertiary",
  }[accentColor];

  const borderAccentClass = {
    primary: "bg-primary/10 group-hover:bg-primary",
    secondary: "bg-secondary/10 group-hover:bg-secondary",
    tertiary: "bg-tertiary/10 group-hover:bg-tertiary",
  }[accentColor];

  return (
    <div className={`border-razor group relative flex flex-col bg-surface-container-low/50 p-8 transition-premium hover:bg-black ${glowClass} ${className}`}>
      {/* Corner Brackets */}
      <div className="absolute top-0 right-0 h-4 w-4 border-r border-t border-primary/20" />
      <div className="absolute bottom-0 left-0 h-4 w-4 border-b border-l border-primary/20" />
      
      <div className="mb-6 flex w-full items-center justify-between">
        <div className="flex flex-col gap-1">
          <h3 className={`font-mono-data text-[10px] uppercase tracking-[0.4em] text-on-surface-variant transition-premium ${accentClass}`}>
            {title}
          </h3>
          {subtitle && (
            <span className="font-mono-data text-[8px] uppercase tracking-widest text-outline-variant">
              {subtitle}
            </span>
          )}
        </div>
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center border-razor bg-surface-container group-hover:border-primary/40 transition-premium">
            <AppIcon name={icon} size={18} className={`text-primary/40 transition-premium ${accentClass}`} />
          </div>
        )}
      </div>
      
      <div className="flex w-full items-baseline justify-between gap-4">
        {value && (
          <span className={`font-display-lg text-4xl uppercase tracking-tighter text-on-surface transition-premium ${accentClass}`}>
            {value}
          </span>
        )}
        {badge && <div className="flex flex-col items-end">{badge}</div>}
      </div>

      {children}
      
      {footer && (
        <div className="z-10 mt-6 flex items-center gap-3">
          {footer}
        </div>
      )}
      
      {/* Structural Accent Strip */}
      <div className={`absolute bottom-0 inset-x-0 h-[2px] transition-premium ${borderAccentClass}`} />
    </div>
  );
}
