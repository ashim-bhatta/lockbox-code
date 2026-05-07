"use client";

import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { DashboardPageHeader, MutedActionButton } from "@/components/dashboard/DashboardPrimitives";
import { AppIcon } from "@/components/ui/icons/AppIcon";

export function AnalyticsHeader({
  title = "Analytics",
  subtitle = "SYSTEM_PERFORMANCE_METRICS_V4",
  dateFrom,
  dateTo,
  onApplyRange,
  onClearRange,
  onExport,
  canExport,
}: {
  title?: string;
  subtitle?: string;
  dateFrom: string;
  dateTo: string;
  onApplyRange: (from: string, to: string) => void;
  onClearRange: () => void;
  onExport: () => void;
  canExport: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [draftFrom, setDraftFrom] = useState(dateFrom);
  const [draftTo, setDraftTo] = useState(dateTo);

  const today = new Date();
  const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const previousMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);

  const rangeLabel = useMemo(() => {
    if (!dateFrom || !dateTo) return "Date range";
    return `${dateFrom} to ${dateTo}`;
  }, [dateFrom, dateTo]);

  function formatMonthLabel(monthStart: Date) {
    return monthStart.toLocaleString("en-US", { month: "long", year: "numeric" });
  }

  function toIsoDate(value: Date) {
    return new Date(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()))
      .toISOString()
      .slice(0, 10);
  }

  function buildMonthDays(monthStart: Date) {
    const daysInMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
    const startDay = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1).getDay();
    const cells: Array<{ date: string; day: number; inMonth: boolean }> = [];
    for (let i = 0; i < startDay; i += 1) {
      cells.push({ date: `pad-${monthStart.toISOString()}-${i}`, day: 0, inMonth: false });
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      const value = new Date(monthStart.getFullYear(), monthStart.getMonth(), day);
      cells.push({ date: toIsoDate(value), day, inMonth: true });
    }
    return cells;
  }

  function handlePickDate(value: string) {
    if (!draftFrom || (draftFrom && draftTo)) {
      setDraftFrom(value);
      setDraftTo("");
      return;
    }
    if (value < draftFrom) {
      setDraftTo(draftFrom);
      setDraftFrom(value);
      return;
    }
    setDraftTo(value);
  }

  function dayClassName(day: { date: string; inMonth: boolean }) {
    if (!day.inMonth) return "h-8 w-8";
    const inRange = draftFrom && draftTo && day.date >= draftFrom && day.date <= draftTo;
    const edge = day.date === draftFrom || day.date === draftTo;
    return `h-8 w-8 text-[10px] font-mono-data transition-premium ${
      edge
        ? "bg-primary text-black font-bold"
        : inRange
          ? "bg-primary/20 text-primary"
          : "text-on-surface hover:bg-white/10"
    }`;
  }

  return (
    <DashboardPageHeader
      title={title}
      subtitle={subtitle}
      actions={
        <>
          <div className="relative z-20">
            <MutedActionButton
              onClick={() => {
                setDraftFrom(dateFrom);
                setDraftTo(dateTo);
                setOpen((value) => !value);
              }}
            >
              <AppIcon name="calendar_today" size={16} /> {rangeLabel.toUpperCase()}
            </MutedActionButton>
            {open && typeof document !== "undefined" ? createPortal(
              <>
                <button
                  type="button"
                  aria-label="Close date range picker"
                  className="noise-bg fixed inset-0 z-[105] bg-black/60"
                  onClick={() => setOpen(false)}
                />
                <div className="border-razor fixed inset-x-2 top-24 z-[110] max-h-[calc(100dvh-6rem)] overflow-y-auto bg-black p-8 shadow-[0_0_100px_rgba(0,0,0,0.8)] md:left-auto md:right-10 md:top-24 md:max-h-none md:w-[680px] md:max-w-[95vw] md:overflow-visible">
                  <div className="absolute top-0 right-0 h-4 w-4 border-r border-t border-primary/40" />
                  
                  <p className="mb-6 font-display-lg text-sm uppercase tracking-tight text-on-surface">SELECT_TEMPORAL_WINDOW</p>
                  
                  <div className="mb-8 flex flex-wrap gap-4">
                    {[
                      { label: "7_DAYS", days: 7 },
                      { label: "30_DAYS", days: 30 },
                      { label: "90_DAYS", days: 90 },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        className="border-razor px-4 py-2 font-mono-data text-[10px] tracking-widest text-on-surface-variant transition-premium hover:bg-surface-container-high hover:text-on-surface"
                        onClick={() => {
                          const to = new Date();
                          const from = new Date(to.getTime() - (preset.days - 1) * 24 * 60 * 60 * 1000);
                          setDraftFrom(toIsoDate(from));
                          setDraftTo(toIsoDate(to));
                        }}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    {[previousMonthStart, currentMonthStart].map((monthStart) => (
                      <div key={monthStart.toISOString()} className="border-razor bg-surface-container-low p-4">
                        <div className="mb-4 font-mono-data text-[10px] uppercase tracking-[0.3em] text-primary">{formatMonthLabel(monthStart).toUpperCase()}</div>
                        <div className="mb-4 grid grid-cols-7 text-center font-mono-data text-[8px] uppercase tracking-widest text-on-surface-variant">
                          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                            <span key={d}>{d}</span>
                          ))}
                        </div>
                        <div className="grid grid-cols-7 justify-items-center gap-y-1">
                          {buildMonthDays(monthStart).map((day) =>
                            day.inMonth ? (
                              <button
                                key={day.date}
                                type="button"
                                className={dayClassName(day)}
                                onClick={() => handlePickDate(day.date)}
                              >
                                {day.day}
                              </button>
                            ) : (
                              <span key={day.date} className="h-8 w-8" />
                            )
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-8">
                    <p className="font-mono-data text-[10px] uppercase tracking-widest text-on-surface-variant">
                      ACTIVE_RANGE: <span className="text-primary">{draftFrom || "NULL"}</span> — <span className="text-primary">{draftTo || "NULL"}</span>
                    </p>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        className="border-razor px-6 py-2 font-mono-data text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-on-surface"
                        onClick={() => {
                          onClearRange();
                          setOpen(false);
                        }}
                      >
                        CLEAR
                      </button>
                      <button
                        type="button"
                        disabled={!draftFrom || !draftTo || draftFrom > draftTo}
                        className="btn-primary px-8 py-2 font-mono-data text-[10px] uppercase tracking-widest disabled:opacity-20"
                        onClick={() => {
                          onApplyRange(draftFrom, draftTo);
                          setOpen(false);
                        }}
                      >
                        EXECUTE_RANGE
                      </button>
                    </div>
                  </div>
                </div>
              </>,
              document.body
            ) : null}
          </div>
          <MutedActionButton onClick={onExport} disabled={!canExport}>
            <AppIcon name="download" size={16} /> EXPORT_DATA
          </MutedActionButton>
        </>
      }
    />
  );
}
