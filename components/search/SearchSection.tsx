"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Calendar, Users, X, ChevronDown, Mountain } from "lucide-react";
import { DatePickerModal } from "@/components/search/date-picker-modal";
import { GuestSelector } from "@/components/search/guest-selector";
import mnData from "@/data";

// Архангай аймгийн сумдын жагсаалт
const ARKHANGAI_ZIPCODE = "65000";

export function SearchSection() {
  const router = useRouter();
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedDates, setSelectedDates] = useState<{
    start: Date | null;
    end: Date | null;
  }>({
    start: null,
    end: null,
  });
  const [selectedGuests, setSelectedGuests] = useState(1);

  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGuestSelector, setShowGuestSelector] = useState(false);

  const provinceRef = useRef<HTMLDivElement>(null);
  const districtRef = useRef<HTMLDivElement>(null);

  // Get location data
  const locationData = mnData();

  // Find Архангай province
  const arkhangaiProvince = locationData.zipcode.find(
    (loc: any) => loc.zipcode === ARKHANGAI_ZIPCODE
  );

  // Get districts for selected province (Архангай)
  const districts = arkhangaiProvince?.sub_items || [];

  // Outside click handler for province dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (provinceRef.current && !provinceRef.current.contains(event.target as Node)) {
        setShowProvinceDropdown(false);
      }
      if (districtRef.current && !districtRef.current.contains(event.target as Node)) {
        setShowDistrictDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDateRange = () => {
    if (!selectedDates.start) return "";
    const startStr = formatDate(selectedDates.start);
    if (!selectedDates.end) return startStr;
    return `${startStr} - ${formatDate(selectedDates.end)}`;
  };

  const formatDate = (date: Date) => {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${month}/${day}`;
  };

  const formatGuests = () => {
    return selectedGuests === 1 ? "" : `${selectedGuests} зочин`;
  };

  const handleProvinceSelect = () => {
    setSelectedProvince("Архангай");
    setShowProvinceDropdown(false);
    // Reset district when province changes
    setSelectedDistrict("");
  };

  const handleDistrictSelect = (districtName: string) => {
    setSelectedDistrict(districtName);
    setShowDistrictDropdown(false);
  };

  const handleProvinceClear = () => {
    setSelectedProvince("");
    setSelectedDistrict("");
  };

  const handleDistrictClear = () => {
    setSelectedDistrict("");
  };

  const handleDateClear = () => {
    setSelectedDates({ start: null, end: null });
  };

  const handleGuestClear = () => {
    setSelectedGuests(1);
  };

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (selectedProvince) {
      params.append("province", selectedProvince);
    }

    if (selectedDistrict) {
      params.append("district", selectedDistrict);
    }

    if (selectedDates.start) {
      const startDate = selectedDates.start.toISOString().split("T")[0];
      params.append("checkIn", startDate);

      if (selectedDates.end) {
        const endDate = selectedDates.end.toISOString().split("T")[0];
        params.append("checkOut", endDate);
      }
    }

    if (selectedGuests > 0) {
      params.append("guests", selectedGuests.toString());
    }

    const queryString = params.toString();
    const url = queryString ? `/camps?${queryString}` : "/camps";

    console.log("🔍 Searching with params:", {
      selectedProvince,
      selectedDistrict,
      selectedDates,
      selectedGuests,
      url,
    });
    router.push(url);
  };

  return (
    <div className="bg-white py-3 sm:py-4 md:py-6 lg:py-8">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Hero text */}
        <div className="text-center mb-4 sm:mb-5 md:mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-1.5 sm:mb-2 font-display">
            Монголын гэр буудлуудыг нээцгээ
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-500 font-medium">
            Архангай аймгийн байгалийн үзэсгэлэнт газруудад амраарай
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-3 sm:p-4 md:p-5 lg:p-6 rounded-xl md:rounded-2xl lg:rounded-full shadow-md sm:shadow-lg border border-gray-100">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-2.5 md:gap-3 items-stretch sm:items-end">

            {/* Province (Аймаг) */}
            <div className="flex-1 relative min-w-0" ref={provinceRef}>
              <label className="block text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5 sm:mb-1">
                Аймаг
              </label>
              <div className="relative">
                <Mountain className="absolute left-2 sm:left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
                <button
                  onClick={() => setShowProvinceDropdown(!showProvinceDropdown)}
                  className="w-full h-9 sm:h-10 pl-7 sm:pl-9 pr-8 sm:pr-9 rounded-lg cursor-pointer text-xs sm:text-sm text-left border border-gray-200 hover:border-emerald-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all bg-white flex items-center"
                >
                  <span className={selectedProvince ? "text-gray-800 font-medium" : "text-gray-400"}>
                    {selectedProvince || "Аймаг сонгох"}
                  </span>
                </button>
                {selectedProvince ? (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleProvinceClear(); }}
                    className="absolute right-2 sm:right-2.5 top-1/2 transform -translate-y-1/2 p-0.5 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Аймаг цэвэрлэх"
                  >
                    <X className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-500" />
                  </button>
                ) : (
                  <ChevronDown className="absolute right-2 sm:right-2.5 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 pointer-events-none" />
                )}

                {/* Province Dropdown */}
                {showProvinceDropdown && (
                  <div className="absolute left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="p-1.5">
                      <button
                        onClick={() => handleProvinceSelect()}
                        className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-emerald-50 rounded-md transition-colors group"
                      >
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-200 transition-colors">
                          <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                        </div>
                        <div className="text-left">
                          <span className="text-sm font-medium text-gray-800 block">Архангай</span>
                          <span className="text-[10px] sm:text-xs text-gray-400">19 сум</span>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* District (Сум) */}
            <div className="flex-1 relative min-w-0" ref={districtRef}>
              <label className="block text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5 sm:mb-1">
                Сум
              </label>
              <div className="relative">
                <MapPin className="absolute left-2 sm:left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
                <button
                  onClick={() => {
                    if (!selectedProvince) {
                      // Auto-select Архангай if not selected
                      setSelectedProvince("Архангай");
                    }
                    setShowDistrictDropdown(!showDistrictDropdown);
                  }}
                  className="w-full h-9 sm:h-10 pl-7 sm:pl-9 pr-8 sm:pr-9 rounded-lg cursor-pointer text-xs sm:text-sm text-left border border-gray-200 hover:border-emerald-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all bg-white flex items-center"
                >
                  <span className={selectedDistrict ? "text-gray-800 font-medium" : "text-gray-400"}>
                    {selectedDistrict || "Сум сонгох"}
                  </span>
                </button>
                {selectedDistrict ? (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDistrictClear(); }}
                    className="absolute right-2 sm:right-2.5 top-1/2 transform -translate-y-1/2 p-0.5 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Сум цэвэрлэх"
                  >
                    <X className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-500" />
                  </button>
                ) : (
                  <ChevronDown className="absolute right-2 sm:right-2.5 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 pointer-events-none" />
                )}

                {/* District Dropdown */}
                {showDistrictDropdown && (
                  <div className="absolute left-0 right-0 sm:w-[280px] mt-1.5 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="px-3 py-2 border-b border-gray-100 bg-gray-50">
                      <span className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Архангай аймгийн сумд
                      </span>
                    </div>
                    <div className="max-h-52 sm:max-h-64 overflow-y-auto p-1.5 scrollbar-thin">
                      {districts.map((district: any) => (
                        <button
                          key={district.zipcode}
                          onClick={() => handleDistrictSelect(district.mnname)}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-left ${selectedDistrict === district.mnname
                              ? "bg-emerald-50 text-emerald-700"
                              : "hover:bg-gray-50 text-gray-700"
                            }`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${selectedDistrict === district.mnname ? "bg-emerald-500" : "bg-gray-300"
                            }`} />
                          <span className="text-xs sm:text-sm font-medium">{district.mnname}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Date */}
            <div className="flex-1 relative min-w-0">
              <label className="block text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5 sm:mb-1">
                Хэзээ
              </label>
              <div className="relative">
                <Calendar className="absolute left-2 sm:left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
                <button
                  onClick={() => setShowDatePicker(true)}
                  className="w-full h-9 sm:h-10 pl-7 sm:pl-9 pr-8 sm:pr-9 rounded-lg cursor-pointer text-xs sm:text-sm text-left border border-gray-200 hover:border-emerald-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all bg-white flex items-center"
                >
                  <span className={selectedDates.start ? "text-gray-800 font-medium" : "text-gray-400"}>
                    {formatDateRange() || "Огноо сонгох"}
                  </span>
                </button>
                {selectedDates.start && (
                  <button
                    onClick={handleDateClear}
                    className="absolute right-2 sm:right-2.5 top-1/2 transform -translate-y-1/2 p-0.5 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Огноо цэвэрлэх"
                  >
                    <X className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-500" />
                  </button>
                )}
              </div>
            </div>

            {/* Guests */}
            <div className="flex-1 relative min-w-0">
              <label className="block text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5 sm:mb-1">
                Зочид
              </label>
              <div className="relative">
                <Users className="absolute left-2 sm:left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
                <button
                  onClick={() => setShowGuestSelector(true)}
                  className="w-full h-9 sm:h-10 pl-7 sm:pl-9 pr-8 sm:pr-9 rounded-lg cursor-pointer text-xs sm:text-sm text-left border border-gray-200 hover:border-emerald-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all bg-white flex items-center"
                >
                  <span className={selectedGuests > 1 ? "text-gray-800 font-medium" : "text-gray-400"}>
                    {formatGuests() || "Зочин нэмэх"}
                  </span>
                </button>
                {selectedGuests > 1 && (
                  <button
                    onClick={handleGuestClear}
                    className="absolute right-2 sm:right-2.5 top-1/2 transform -translate-y-1/2 p-0.5 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Зочид цэвэрлэх"
                  >
                    <X className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-500" />
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
            <div className="flex items-end sm:flex-shrink-0">
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white h-9 sm:h-10 w-full sm:w-auto px-4 sm:px-5 md:px-6 rounded-lg sm:rounded-xl md:rounded-full font-semibold transition-all shadow-sm hover:shadow-md"
                onClick={handleSearch}
              >
                <Search className="w-4 h-4 mr-1.5 sm:mr-2" />
                <span className="text-xs sm:text-sm md:text-base">Хайх</span>
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
