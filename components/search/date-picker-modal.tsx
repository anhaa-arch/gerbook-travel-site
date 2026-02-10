"use client";

import React, { useState, useEffect, useRef } from "react";
import { Calendar } from "@/components/ui/calendar";
import type { DateRange } from "react-day-picker";
import type { Matcher } from "react-day-picker";
import { CalendarDays, ArrowRight } from "lucide-react";

interface DatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (start: Date | null, end: Date | null) => void;
  disabledDates?: Date[];
  title?: string;
}

export function DatePickerModal({
  isOpen,
  onClose,
  onSelect,
  disabledDates = [],
  title = "Огноо сонгох",
}: DatePickerModalProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const modalRef = useRef<HTMLDivElement>(null);

  // Outside click handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Escape key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setDateRange(undefined);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate number of nights
  const calculateNights = () => {
    if (!dateRange?.from || !dateRange?.to) return 0;
    const diff = dateRange.to.getTime() - dateRange.from.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const nights = calculateNights();

  // Format date for display
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
  };

  const handleApply = () => {
    if (dateRange?.from) {
      onSelect(dateRange.from, dateRange.to || null);
      onClose();
    }
  };

  const handleClear = () => {
    setDateRange(undefined);
  };

  // Disabled dates matcher - disable past dates and booked dates
  const disabledMatcher: Matcher = (date: Date) => {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    // Disable past dates
    if (checkDate < today) return true;

    // Disable booked dates
    const isBooked = disabledDates.some((disabledDate) => {
      const d2 = new Date(disabledDate);
      d2.setHours(0, 0, 0, 0);
      return checkDate.getTime() === d2.getTime();
    });

    return isBooked;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 sm:p-4">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md sm:max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base sm:text-lg font-bold text-gray-900">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500"
            >
              ✕
            </button>
          </div>

          {/* Selected Range Display */}
          <div className="flex items-center gap-2 sm:gap-3 bg-gray-50 rounded-xl p-2.5 sm:p-3">
            <div className="flex-1 text-center">
              <div className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                Ирэх өдөр
              </div>
              <div className={`text-sm sm:text-base font-bold ${dateRange?.from ? "text-emerald-700" : "text-gray-300"}`}>
                {dateRange?.from ? formatDate(dateRange.from) : "-- / -- / --"}
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-100 flex items-center justify-center">
                <ArrowRight className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <div className="flex-1 text-center">
              <div className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                Гарах өдөр
              </div>
              <div className={`text-sm sm:text-base font-bold ${dateRange?.to ? "text-emerald-700" : "text-gray-300"}`}>
                {dateRange?.to ? formatDate(dateRange.to) : "-- / -- / --"}
              </div>
            </div>
            {nights > 0 && (
              <div className="flex-shrink-0 bg-emerald-600 text-white px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-center">
                <div className="text-sm sm:text-base font-bold leading-tight">{nights}</div>
                <div className="text-[9px] sm:text-[10px] leading-tight opacity-90">хоног</div>
              </div>
            )}
          </div>
        </div>

        {/* Calendar */}
        <div className="px-2 sm:px-4 py-3 sm:py-4 flex justify-center">
          <style>{`
            /* Range selection styles */
            .rdp .rdp-day_range_start,
            .rdp .rdp-day_range_end {
              background-color: #059669 !important;
              color: white !important;
              font-weight: 700 !important;
              border-radius: 9999px !important;
            }
            .rdp .rdp-day_range_middle {
              background-color: #d1fae5 !important;
              color: #065f46 !important;
              border-radius: 0 !important;
            }
            
            /* Available dates */
            .rdp .available-date:not(.rdp-day_disabled):not(.rdp-day_range_start):not(.rdp-day_range_end):not(.rdp-day_range_middle) {
              color: #065f46 !important;
              font-weight: 500;
            }
            .rdp .available-date:not(.rdp-day_disabled):hover {
              background-color: #a7f3d0 !important;
            }
            
            /* Disabled/booked dates */
            .rdp .rdp-day_disabled,
            .rdp button.rdp-day_disabled,
            .rdp button[disabled] {
              background-color: #fee2e2 !important;
              color: #ef4444 !important;
              opacity: 0.5 !important;
              cursor: not-allowed !important;
              pointer-events: none !important;
              text-decoration: line-through;
            }
            
            /* Today */
            .rdp .rdp-day_today:not(.rdp-day_range_start):not(.rdp-day_range_end) {
              border: 2px solid #059669 !important;
              font-weight: 700;
            }
            
            /* Cell spacing for range highlight */
            .rdp .rdp-cell:has([aria-selected]) {
              background-color: #d1fae5;
            }
            .rdp .rdp-cell:has(.rdp-day_range_start) {
              border-radius: 9999px 0 0 9999px;
            }
            .rdp .rdp-cell:has(.rdp-day_range_end) {
              border-radius: 0 9999px 9999px 0;
            }
            .rdp .rdp-cell:has(.rdp-day_range_start.rdp-day_range_end) {
              border-radius: 9999px;
            }
          `}</style>
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={(range: DateRange | undefined) => {
              setDateRange(range);
            }}
            numberOfMonths={1}
            disabled={disabledMatcher}
            modifiers={{
              available: (date: Date) => {
                const checkDate = new Date(date);
                checkDate.setHours(0, 0, 0, 0);
                if (checkDate < today) return false;
                const isBooked = disabledDates.some((d) => {
                  const d2 = new Date(d);
                  d2.setHours(0, 0, 0, 0);
                  return checkDate.getTime() === d2.getTime();
                });
                return !isBooked;
              },
            }}
            modifiersClassNames={{
              available: "available-date",
            }}
            fromDate={today}
            className="!p-0"
          />
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 pb-4 sm:pb-5 pt-2 border-t border-gray-100">
          {/* Legend */}
          <div className="flex items-center justify-center gap-3 sm:gap-5 mb-3 sm:mb-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-emerald-600"></div>
              <span className="text-[10px] sm:text-xs text-gray-500 font-medium">Сонгосон</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded bg-emerald-100 border border-emerald-200"></div>
              <span className="text-[10px] sm:text-xs text-gray-500 font-medium">Хугацаа</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded bg-red-100 border border-red-200"></div>
              <span className="text-[10px] sm:text-xs text-gray-500 font-medium">Захиалагдсан</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 sm:gap-3">
            <button
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200"
              onClick={handleClear}
              disabled={!dateRange?.from}
            >
              Цэвэрлэх
            </button>
            <button
              className="flex-1 px-4 py-2.5 text-sm font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 active:bg-emerald-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              onClick={handleApply}
              disabled={!dateRange?.from || !dateRange?.to}
            >
              {dateRange?.from && dateRange?.to
                ? `${nights} хоног сонгох`
                : dateRange?.from
                  ? "Гарах өдөр сонгоно уу"
                  : "Огноо сонгоно уу"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
