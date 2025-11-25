"use client";

import React, { useState, useEffect, useref } from "react";
import { Calendar } from "@/components/ui/calendar";
import type { Matcher } from "react-day-picker";

interface DatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (start: Date | null, end: Date | null) => void;
  disabledDates?: Date[];
  minDate?: Date | null; // For check-out date to be after check-in date
  title?: string;
}

export function DatePickerModal({
  isOpen,
  onClose,
  onSelect,
  disabledDates = [],
  minDate = null,
  title = "Огноо сонгох",
}: DatePickerModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const modalRef = useref<HTMLDivElement>(null);
  
  // Debug: Log disabled dates when modal opens
  React.useEffect(() => {
    if (isOpen) {
      console.log('🔔 Modal opened with disabled dates:', disabledDates.length);
      console.log('🔔 Disabled dates:', disabledDates.map(d => {
        const date = new Date(d);
        return date.toISOString().split('T')[0];
      }));
    }
  }, [isOpen, disabledDates]);

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

  // Reset selected date when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedDate(undefined);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApply = () => {
    onSelect(selectedDate ?? null, selectedDate ?? null);
    onClose();
  };

  // Build disabled dates matcher
  const disabledMatcher: Matcher = (date: Date) => {
    // Disable past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    
    if (checkDate < today) return true;

    // If there's a minDate (for check-out picker), disable dates before or equal to it
    if (minDate) {
      const min = new Date(minDate);
      min.setHours(0, 0, 0, 0);
      if (checkDate <= min) return true;
    }
    
    // Disable dates that are already booked
    const isBooked = disabledDates.some((disabledDate) => {
      const d2 = new Date(disabledDate);
      d2.setHours(0, 0, 0, 0);
      return checkDate.getTime() === d2.getTime();
    });
    
    if (isBooked) {
      console.log('🚫 Date is booked:', checkDate.toISOString().split('T')[0]);
    }
    
    return isBooked;
  };

  // Build available dates matcher (for green styling)
  const availableMatcher: Matcher = (date: Date) => {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    
    // Past dates are not available
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (checkDate < today) return false;
    
    // If there's a minDate, dates before it are not available
    if (minDate) {
      const min = new Date(minDate);
      min.setHours(0, 0, 0, 0);
      if (checkDate <= min) return false;
    }
    
    // Check if date is booked
    const isBooked = disabledDates.some((disabledDate) => {
      const d2 = new Date(disabledDate);
      d2.setHours(0, 0, 0, 0);
      return checkDate.getTime() === d2.getTime();
    });
    
    return !isBooked;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-lg p-4 w-fit max-w-md"
      >
        <h3 className="text-lg font-semibold mb-3">{title}</h3>
        <div className="border rounded-md">
          <style>{`
            /* Available dates - green */
            .rdp .available-date {
              background-color: #d1fae5 !important;
              color: #065f46 !important;
              font-weight: 600 !important;
            }
            .rdp .available-date:hover {
              background-color: #a7f3d0 !important;
            }
            
            /* Disabled dates - gray with high specificity */
            .rdp .rdp-day_disabled,
            .rdp button.rdp-day_disabled,
            .rdp button[disabled].rdp-button,
            .rdp button[disabled] {
              background-color: #e5e7eb !important;
              color: #9ca3af !important;
              opacity: 0.6 !important;
              cursor: not-allowed !important;
              pointer-events: none !important;
            }
            .rdp .rdp-day_disabled:hover,
            .rdp button[disabled]:hover {
              background-color: #d1d5db !important;
            }
            
            /* Remove green from disabled dates */
            .rdp .rdp-day_disabled.available-date {
              background-color: #e5e7eb !important;
              color: #9ca3af !important;
            }
          `}</style>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(value: Date | undefined) => {
              if (value) {
                console.log('📅 Date selected:', value.toISOString());
              }
              setSelectedDate(value);
            }}
            disabled={disabledMatcher}
            modifiers={{
              available: availableMatcher,
            }}
            modifiersClassNames={{
              available: "available-date",
            }}
          />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button 
            className="px-4 py-2 text-sm hover:bg-gray-100 rounded transition-colors" 
            onClick={onClose}
          >
            Болих
          </button>
          <button
            className="px-4 py-2 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleApply}
            disabled={!selectedDate}
          >
            Сонгох
          </button>
        </div>
        <div className="mt-3 pt-3 border-t">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-emerald-100 border border-emerald-300"></div>
              <span className="text-gray-600">Боломжтой</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-gray-200 border border-gray-300"></div>
              <span className="text-gray-600">Захиалагдсан</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
