"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Calendar, Users } from "lucide-react";
import { LocationDropdown } from "@/components/search/location-dropdown";
import { DatePickerModal } from "@/components/search/date-picker-modal";
import { GuestSelector } from "@/components/search/guest-selector";

export function SearchSection() {
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

  return (
    <div className="bg-white py-8 ">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-2 lg:py-2 rounded-full shadow-lg">
        <div className="flex flex-col md:flex-row gap-4 items-center ">
          {/* Location Search */}
          <div className="flex-1 relative ">
            <label className="block text-sm font-medium text-gray-700 ">
              Хаана
            </label>
            <div className="relative">
              <MapPin className="absolute  top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Газар хайх"
                value={selectedLocation}
                onClick={() => setShowLocationDropdown(true)}
                readOnly
                className="w-full h-10 ml-2  rounded-lg cursor-pointer text-gray-500 border-0 ring-0 outline-none focus:ring-0 focus:border-0 focus:outline-none focus-visible:outline-none"
              />
              <LocationDropdown
                isOpen={showLocationDropdown}
                onClose={() => setShowLocationDropdown(false)}
                onSelect={setSelectedLocation}
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="flex gap-4 ">
            <div className="flex-1 relative">
              <label className="block text-sm font-medium text-gray-700 ">
                Хэзээ
              </label>
              <div className="relative">
                <Calendar className="absolute  top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Огноо сонгох"
                  value={formatDateRange()}
                  onClick={() => setShowDatePicker(true)}
                  readOnly
                  className="w-full h-10 ml-2 rounded-lg cursor-pointer text-gray-500 border-0 ring-0 outline-none focus:ring-0 focus:border-0 focus:outline-none focus-visible:outline-none"
                />
              </div>
            </div>

            {/* Guests */}
            <div className="flex-1 relative">
              <label className="block text-sm font-medium text-gray-700 ">
                Хэдэн
              </label>
              <div className="relative ">
                <Users className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Зочин нэмэх"
                  value={formatGuests()}
                  onClick={() => setShowGuestSelector(true)}
                  readOnly
                  className="w-full ml-2 h-10 rounded-lg cursor-pointer text-gray-500 border-0 ring-0 outline-none focus:ring-0 focus:border-0 focus:outline-none focus-visible:outline-none"
                />
                <GuestSelector
                  isOpen={showGuestSelector}
                  onClose={() => setShowGuestSelector(false)}
                  onSelect={(count) => {
                    setSelectedGuests(count);
                  }}
                />
              </div>
            </div>
            <div>
              <Button className="bg-green-700 hover:bg-green-800 text-white h-10 rounded-full">
                <Search className="w-6 h-6" />
                <span className="text-[18px]">Хайх</span>
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
