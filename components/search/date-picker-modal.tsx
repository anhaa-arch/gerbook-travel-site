"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";

interface DatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (start: Date | null, end: Date | null) => void;
}

export function DatePickerModal({
  isOpen,
  onClose,
  onSelect,
}: DatePickerModalProps) {
  if (!isOpen) return null;

  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const handleApply = () => {
    onSelect(selectedDate ?? null, selectedDate ?? null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg p-4 w-fit max-w-md">
        <h3 className="text-lg font-semibold mb-3">Огноо сонгох</h3>
        <div className="border rounded-md">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(value: Date | undefined) => {
              setSelectedDate(value);
              if (value) {
                onSelect(value, value);
                onClose();
              }
            }}
          />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button className="px-4 py-2 text-sm" onClick={onClose}>
            Болих
          </button>
          <button
            className="px-4 py-2 text-sm bg-emerald-600 text-white rounded"
            onClick={handleApply}
          >
            Сонгох
          </button>
        </div>
      </div>
    </div>
  );
}
