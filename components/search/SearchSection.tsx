"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Calendar, Users, X, ChevronDown, Mountain } from "lucide-react";
import { DatePickerModal } from "@/components/search/date-picker-modal";
import { GuestSelector } from "@/components/search/guest-selector";
import mnData from "@/data";
import { translateWithMap } from "@/lib/translations";
import { provinceTranslations, districtTranslations } from "@/lib/translations/geo";
import { useTranslatedValue } from "@/hooks/use-translation";
import { gql, useQuery } from "@apollo/client";
import { getLocalizedField } from "@/lib/localization";

// Архангай аймгийн сумдын жагсаалт
const ARKHANGAI_ZIPCODE = "65000";

const GET_SITE_TEXTS = gql`
  query GetSiteTexts {
    siteTexts {
      key
      value_mn
      value_en
      value_ko
    }
  }
`;

export function SearchSection() {
  const { t, i18n } = useTranslation();

  const { data: siteTextsData } = useQuery(GET_SITE_TEXTS);

  const getSiteText = (key: string, defaultValue: string) => {
    if (!siteTextsData?.siteTexts) return defaultValue;
    const item = siteTextsData.siteTexts.find((st: any) => st.key === key);
    if (!item) return defaultValue;
    return getLocalizedField(item, "value", i18n.language);
  };

  const router = useRouter();
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("Цэнхэр");
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

  // Аймаг сумдын өгөгдөл
  const provinces = [
    { mnname: "Архангай", zipcode: "65000", districts: [{ mnname: "Цэнхэр", zipcode: "65080" }] },
    { mnname: "Өвөрхангай", zipcode: "62000", districts: [{ mnname: "Хужирт", zipcode: "62060" }] }
  ];

  // Get districts for selected province
  const currentProvinceData = provinces.find(p => p.mnname === selectedProvince);
  const districts = currentProvinceData?.districts ?? [];

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
    setSelectedDistrict("Цэнхэр");
  };

  const handleProvinceItemSelect = (provinceName: string) => {
    setSelectedProvince(provinceName);
    setShowProvinceDropdown(false);
    // Select first district of the province by default
    const province = provinces.find(p => p.mnname === provinceName);
    if (province && province.districts.length > 0) {
      setSelectedDistrict(province.districts[0].mnname);
    }
  };

  const handleDistrictSelect = (districtName: string) => {
    setSelectedDistrict(districtName);
    setShowDistrictDropdown(false);
  };

  const handleProvinceClear = () => {
    setSelectedProvince("Архангай");
    setSelectedDistrict("Цэнхэр");
  };

  const handleDistrictClear = () => {
    setSelectedDistrict("Цэнхэр");
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
    const url = queryString ? `/listings?${queryString}` : "/listings";

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
      <div className="max-w-6xl 2xl:max-w-7xl 3xl:max-w-[1800px] 4k:max-w-[2400px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12 mt-4 sm:mt-8">
          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#0F3D2E] via-emerald-800 to-[#0F3D2E] tracking-tight leading-tight mb-4 font-display drop-shadow-sm py-1 uppercase sm:whitespace-nowrap">
            {getSiteText("landing.hero.title", "ТАСАЛЖ БОЛОХГҮЙ ТАЛЫН СОЁЛ")}
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-500 max-w-2xl mx-auto font-medium tracking-wide">
            {getSiteText("landing.hero.subtitle", "Нүүдэлчин ахуй соёлтой танилцах хамгийн таатай боломж")}
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white/90 backdrop-blur-xl p-4 sm:p-5 md:p-6 lg:p-8 rounded-[2rem] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] border border-white/60 ring-1 ring-black/[0.03] max-w-5xl 2xl:max-w-6xl 3xl:max-w-[1800px] 4k:max-w-[2400px] mx-auto transform transition-all hover:shadow-[0_8px_50px_-12px_rgba(0,0,0,0.15)] auto-mx">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-end">

            <div className="flex-1 relative min-w-0" ref={provinceRef}>
              <label className="block text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5 sm:mb-1">
                {useTranslatedValue("search.province_label", "Аймаг")}
              </label>
              <div className="relative">
                <Mountain className="absolute left-2 sm:left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
                <button
                  onClick={() => setShowProvinceDropdown(!showProvinceDropdown)}
                  className="w-full h-9 sm:h-10 pl-7 sm:pl-9 pr-8 sm:pr-9 rounded-lg cursor-pointer text-xs sm:text-sm text-left border border-gray-200 hover:border-emerald-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all bg-white flex items-center"
                >
                  <span className={selectedProvince ? "text-gray-800 font-medium" : "text-gray-400"}>
                    {selectedProvince
                      ? translateWithMap(selectedProvince, i18n.language, provinceTranslations)
                      : useTranslatedValue("search.select_province_placeholder", "Аймаг сонгох")}
                  </span>
                </button>
                <ChevronDown className="absolute right-2 sm:right-2.5 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 pointer-events-none" />

                {/* Province Dropdown */}
                {showProvinceDropdown && (
                  <div className="absolute left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="p-1.5">
                      {provinces.map((province) => (
                        <button
                          key={province.zipcode}
                          onClick={() => handleProvinceItemSelect(province.mnname)}
                          className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-emerald-50 rounded-md transition-colors group text-left"
                        >
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-200 transition-colors">
                            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                          </div>
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-800 block">
                              {translateWithMap(province.mnname, i18n.language, provinceTranslations)}
                            </span>
                            <span className="text-[10px] sm:text-xs text-gray-400">{province.districts.length} {t("search.districts_open", "сум нээлттэй")}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 relative min-w-0" ref={districtRef}>
              <label className="block text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5 sm:mb-1">
                {useTranslatedValue("search.district_label", "Сум")}
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
                    {selectedDistrict ? translateWithMap(selectedDistrict, i18n.language, districtTranslations) : useTranslatedValue("search.select_district_placeholder", "Сум сонгох")}
                  </span>
                </button>
                <ChevronDown className="absolute right-2 sm:right-2.5 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 pointer-events-none" />

                {/* District Dropdown */}
                {showDistrictDropdown && (
                  <div className="absolute left-0 right-0 sm:w-[280px] mt-1.5 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="px-3 py-2 border-b border-gray-100 bg-gray-50">
                      <span className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {translateWithMap(selectedProvince, i18n.language, provinceTranslations)} {t("search.province_districts", "аймгийн сумд")}
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
                          <span className="text-xs sm:text-sm font-medium">
                            {translateWithMap(district.mnname, i18n.language, districtTranslations)}
                          </span>
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
                {useTranslatedValue("search.when_label", "Хэзээ")}
              </label>
              <div className="relative">
                <Calendar className="absolute left-2 sm:left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
                <button
                  onClick={() => setShowDatePicker(true)}
                  className="w-full h-9 sm:h-10 pl-7 sm:pl-9 pr-8 sm:pr-9 rounded-lg cursor-pointer text-xs sm:text-sm text-left border border-gray-200 hover:border-emerald-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all bg-white flex items-center"
                >
                  <span className={selectedDates.start ? "text-gray-800 font-medium" : "text-gray-400"}>
                    {formatDateRange() || useTranslatedValue("search.select_dates_placeholder", "Огноо сонгох")}
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
                {useTranslatedValue("search.guests_label", "Зочид")}
              </label>
              <div className="relative">
                <Users className="absolute left-2 sm:left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
                <button
                  onClick={() => setShowGuestSelector(true)}
                  className="w-full h-9 sm:h-10 pl-7 sm:pl-9 pr-8 sm:pr-9 rounded-lg cursor-pointer text-xs sm:text-sm text-left border border-gray-200 hover:border-emerald-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all bg-white flex items-center"
                >
                  <span className={selectedGuests > 1 ? "text-gray-800 font-medium" : "text-gray-400"}>
                    {formatGuests() || useTranslatedValue("search.guests_placeholder", "Зочид")}
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
                <span className="text-xs sm:text-sm md:text-base">{useTranslatedValue("search.button_text", "Хайх")}</span>
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
