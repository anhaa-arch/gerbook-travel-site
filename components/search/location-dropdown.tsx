"use client";

interface LocationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (value: string) => void;
}

export function LocationDropdown({
  isOpen,
  onClose,
  onSelect,
}: LocationDropdownProps) {
  if (!isOpen) return null;

  const locations = [
    "Улаанбаатар",
    "Өвөрхангай",
    "Архангай",
    "Баян-Өлгий",
    "Говь-Алтай",
  ];

  return (
    <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
      <ul className="max-h-64 overflow-auto">
        {locations.map((loc) => (
          <li key={loc}>
            <button
              className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
              onClick={() => {
                onSelect(loc);
                onClose();
              }}
            >
              {loc}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
