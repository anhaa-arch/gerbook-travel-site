"use client";

import { useState, useEffect } from "react";

interface GuestSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (guests: number) => void;
}

export function GuestSelector({
  isOpen,
  onClose,
  onSelect,
}: GuestSelectorProps) {
  const [guests, setGuests] = useState(1);

  useEffect(() => {
    if (!isOpen) setGuests(1);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="absolute left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-[60] p-3 w-56">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Зочин</span>
        <div className="flex items-center gap-2">
          <button
            className="px-2 py-1 bg-gray-100 rounded"
            onClick={() => setGuests((g) => Math.max(1, g - 1))}
          >
            -
          </button>
          <span className="w-6 text-center">{guests}</span>
          <button
            className="px-2 py-1 bg-gray-100 rounded"
            onClick={() => setGuests((g) => g + 1)}
          >
            +
          </button>
        </div>
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <button className="text-sm" onClick={onClose}>
          Болих
        </button>
        <button
          className="px-3 py-1 bg-emerald-600 text-white rounded text-sm"
          onClick={() => {
            onSelect(guests);
            onClose();
          }}
        >
          Сонгох
        </button>
      </div>
    </div>
  );
}
