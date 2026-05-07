"use client";

import type { ChangeEventHandler } from "react";
import type { InputHTMLAttributes } from "react";
import { AppIcon } from "@/components/ui/icons/AppIcon";

export function IconInput({
  id,
  type,
  placeholder,
  icon,
  className = "",
  value,
  onChange,
  ...inputProps
}: {
  id: string;
  type: string;
  placeholder: string;
  icon: "mail" | "lock" | "key";
  className?: string;
  value?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "type" | "placeholder" | "value" | "onChange">) {
  return (
    <div className="group relative">
      <AppIcon name={icon} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline transition-colors duration-300 group-focus-within:text-primary" />
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        required
        value={value}
        onChange={onChange}
        {...inputProps}
        className={`w-full rounded-lg border border-outline-variant/50 bg-surface-container-highest/60 py-2.5 pl-10 pr-4 font-body-base text-body-base text-on-surface outline-none transition-all duration-300 placeholder:text-outline-variant focus:border-primary-container focus:bg-surface-container-highest focus:ring-0 focus:shadow-[0_0_15px_rgba(85,141,255,0.25)] ${className}`}
      />
    </div>
  );
}
