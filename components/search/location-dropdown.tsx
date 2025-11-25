"use client";
import mnData from "@/data";
import { MapPin, ChevronRight, X, ArrowLeft } from "lucide-react";
import { useState, useEffect, useref } from "react";

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
  const [showProvinceInfo, setShowProvinceInfo] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const dropdownRef = useref<HTMLDivElement>(null);

  // Outside click handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
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

  if (!isOpen) return null;

  const locationData = mnData();

  const handleProvinceSelect = (province: any) => {
    // If clicking on province name (left side), select the province directly
    if (province.mnname) {
      const fullLocation = province.mnname;
      onSelect(fullLocation);
      onClose();
      return;
    }

    // If clicking on chevron (right side), show districts
    setShowProvinceInfo(true);
    setSelectedProvince(province.zipcode);
    setSelectedLocation(province.mnname);
  };

  const handleSubLocationSelect = (subLocation: any) => {
    const fullLocation = `${selectedLocation} - ${subLocation.mnname}`;
    onSelect(fullLocation);
    onClose();
  };

  const handleBack = () => {
    setShowProvinceInfo(false);
    setSelectedProvince(null);
    setSelectedLocation("");
  };

  const handleClear = () => {
    setSelectedLocation("");
    setShowProvinceInfo(false);
    setSelectedProvince(null);
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute left-0 right-0 w-full sm:w-[50vw] mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
    >
      {/* Header with back button and clear button */}
      <div className="flex items-center justify-between p-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          {showProvinceInfo && (
            <button
              onClick={handleBack}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-4 h-4 text-gray-600" />
            </button>
          )}
          <h3 className="text-sm font-medium text-gray-700">
            {showProvinceInfo ? selectedLocation : "Газар сонгох"}
          </h3>
        </div>
        <button
          onClick={handleClear}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      <div className="w-full">
        {showProvinceInfo &&
          showProvinceInfoComp(selectedProvince ?? "", handleSubLocationSelect)}
      </div>

      <div className="overflow-auto w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 p-2 gap-x-2 gap-y-1">
        {!showProvinceInfo &&
          locationData.zipcode.map((loc) => (
            <div key={loc.mnname}>
              <div className="w-full flex items-center justify-between gap-2 text-left px-3 py-2 hover:bg-gray-50 text-sm rounded-md">
                <button
                  className="flex items-center gap-2 flex-1"
                  onClick={() => handleProvinceSelect({ mnname: loc.mnname })}
                >
                  <div className="p-1 aspect-square flex items-center justify-center rounded-full bg-slate-100">
                    <MapPin height={20} className="text-green-400" />
                  </div>
                  <span className="text-xs sm:text-sm">{loc.mnname}</span>
                </button>
                <button
                  className="p-1 hover:bg-gray-100 rounded"
                  onClick={() => handleProvinceSelect(loc)}
                >
                  <ChevronRight height={10} />
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

function showProvinceInfoComp(
  zipcode: string,
  onSubLocationSelect: (subLocation: any) => void
) {
  const locationData = mnData();
  const province = locationData.zipcode.find((el) => el.zipcode == zipcode);

  return (
    <div className="w-full p-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-2 gap-y-1">
      {province?.sub_items.map((item) => {
        return (
          <div key={item.mnname}>
            <button
              className="w-full flex items-center justify-between gap-2 text-left px-3 py-2 hover:bg-gray-50 text-sm rounded-md"
              onClick={() => onSubLocationSelect(item)}
            >
              <div className="flex items-center gap-2">
                <div className="p-1 aspect-square flex items-center justify-center rounded-full bg-slate-100">
                  <MapPin height={20} className="text-green-400" />
                </div>
                <span className="text-xs sm:text-sm">{item.mnname}</span>
              </div>
              <ChevronRight height={10} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
