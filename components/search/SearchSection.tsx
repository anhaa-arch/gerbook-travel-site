"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Calendar, Users, X } from "lucide-react";
import { LocationDropdown } from "@/components/search/location-dropdown";
import { DatePickerModal } from "@/components/search/date-picker-modal";
import { GuestSelector } from "@/components/search/guest-selector";
import mnData from "@/data";

export function SearchSection() {
  const router = useRouter();
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedDates, setSelectedDates] = useState<{
    start: Date | null;
    end: Date | null;
  }>({
    start: null,
    end: null,
  });
  const [selectedGuests, setSelectedGuests] = useState(1);

  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGuestSelector, setShowGuestSelector] = useState(false);

  const formatDateRange = () => {
    if (!selectedDates.start) return "Огноо сонгох";
    const date = selectedDates.start;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
  };

  const formatGuests = () => {
    return selectedGuests === 1 ? "Зочин нэмэх" : `${selectedGuests} зочин`;
  };

  const handleLocationSelect = (location: string) => {
    setSelectedLocation(location);
    setShowLocationDropdown(false);
  };

  const handleLocationClear = () => {
    setSelectedLocation("");
  };

  const handleDateClear = () => {
    setSelectedDates({ start: null, end: null });
  };

  const handleGuestClear = () => {
    setSelectedGuests(1);
  };

  const handleSearch = () => {
    // Build query parameters
    const params = new URLSearchParams();
    
    if (selectedLocation) {
      params.append("province", selectedLocation);
    }
    
    if (selectedGuests > 0) {
      params.append("guests", selectedGuests.toString());
    }
    
    // Navigate to camps page with filters
    const queryString = params.toString();
    const url = queryString ? `/camps?${queryString}` : "/camps";
    
    router.push(url);
  };

  return (
    <div className="bg-white py-4 sm:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-4 sm:p-6 rounded-lg sm:rounded-full shadow-lg">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
            {/* Location Search */}
            <div className="flex-1 relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Хаана
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Газар хайх"
                  value={selectedLocation}
                  onClick={() => setShowLocationDropdown(true)}
                  readOnly
                  className="w-full h-10 pl-10 pr-10 rounded-lg cursor-pointer text-gray-500 border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
                {selectedLocation && (
                  <button
                    onClick={handleLocationClear}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
                    aria-label="Байршил цэвэрлэх"
                    title="Байршил цэвэрлэх"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                )}
                <LocationDropdown
                  isOpen={showLocationDropdown}
                  onClose={() => setShowLocationDropdown(false)}
                  onSelect={handleLocationSelect}
                />
              </div>
            </div>

            {/* Date Range */}
            <div className="flex-1 relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Хэзээ
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Огноо сонгох"
                  value={formatDateRange()}
                  onClick={() => setShowDatePicker(true)}
                  readOnly
                  className="w-full h-10 pl-10 pr-10 rounded-lg cursor-pointer text-gray-500 border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
                {selectedDates.start && (
                  <button
                    onClick={handleDateClear}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
                    aria-label="Огноо цэвэрлэх"
                    title="Огноо цэвэрлэх"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                )}
              </div>
            </div>

            {/* Guests */}
            <div className="flex-1 relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Хэдэн
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Зочин нэмэх"
                  value={formatGuests()}
                  onClick={() => setShowGuestSelector(true)}
                  readOnly
                  className="w-full h-10 pl-10 pr-10 rounded-lg cursor-pointer text-gray-500 border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
                {selectedGuests > 1 && (
                  <button
                    onClick={handleGuestClear}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
                    aria-label="Зочин тоо цэвэрлэх"
                    title="Зочин тоо цэвэрлэх"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                )}
                <GuestSelector
                  isOpen={showGuestSelector}
                  onClose={() => setShowGuestSelector(false)}
                  onSelect={(count) => {
                    setSelectedGuests(count);
                  }}
                />
              </div>
            </div>

            {/* Search Button */}
            <div className="flex items-end">
              <Button
                className="bg-green-700 hover:bg-green-800 text-white h-10 w-full sm:w-auto px-6 rounded-lg sm:rounded-full"
                onClick={handleSearch}
              >
                <Search className="w-4 h-4 sm:w-6 sm:h-6 mr-2" />
                <span className="text-sm sm:text-lg">Хайх</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Date Picker Modal */}
      <DatePickerModal
        isOpen={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSelect={(start, end) => setSelectedDates({ start, end })}
      />
    </div>
  );
}
