"use client";
import { AppIcon } from "@/components/ui/icons/AppIcon";

type Option = {
  value: string;
  label: string;
};

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="border-razor w-full appearance-none bg-surface-container-high py-4 pl-12 pr-10 text-left font-mono-data text-[12px] uppercase tracking-widest text-on-surface outline-none transition-premium focus:border-primary focus:bg-black"
      >
        {placeholder ? <option value="" className="bg-black text-on-surface-variant">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-black text-on-surface">
            {option.label.toUpperCase()}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
        <AppIcon name="settings" className="text-primary/40" size={16} />
      </span>
      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
        <AppIcon name="expand_more" className="text-outline-variant" size={16} />
      </span>
      
      {/* Blueprint Line */}
      <div className="absolute -left-2 top-1/2 h-px w-2 bg-primary/20" />
    </div>
  );
}
