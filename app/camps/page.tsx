"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useTranslation } from "react-i18next"
import Image from "next/image"
import Link from "next/link"
import { MapPin, Star, Users, Filter, X, Calendar } from "lucide-react"
import { DatePickerModal } from "@/components/search/date-picker-modal"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { gql, useQuery } from "@apollo/client"
import { getPrimaryImage } from "@/lib/imageUtils"
import mnzipData from "@/data/mnzip.json"
import { amenitiesOptions } from "@/data/camp-options"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import '../../lib/i18n'

const GET_YURTS = gql`
  query GetYurts($first: Int, $filter: String, $orderBy: String) {
    yurts(first: $first, filter: $filter, orderBy: $orderBy) {
      edges {
        node {
          id
          name
          location
          pricePerNight
          capacity
          images
          amenities
          isFeatured
          bookings {
            id
            startDate
            endDate
            status
          }
        }
      }
      totalCount
      pageInfo { endCursor hasNextPage }
    }
  }
`

export default function CampsPage() {
  const { t, i18n } = useTranslation()
  const searchParams = useSearchParams()
  const [selectedProvince, setSelectedProvince] = useState("Архангай")
  const [selectedDistrict, setSelectedDistrict] = useState("Цэнхэр")
  const [minCapacity, setMinCapacity] = useState(0)
  const [checkInDate, setCheckInDate] = useState<string>("")
  const [checkOutDate, setCheckOutDate] = useState<string>("")
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Initialize from URL query params
  useEffect(() => {
    const provinceParam = searchParams.get("province")
    const districtParam = searchParams.get("district")
    const guestsParam = searchParams.get("guests")
    const checkInParam = searchParams.get("checkIn")
    const checkOutParam = searchParams.get("checkOut")

    if (provinceParam) {
      setSelectedProvince(provinceParam)
    }

    if (districtParam) {
      setSelectedDistrict(districtParam)
    }

    if (guestsParam) {
      const guests = parseInt(guestsParam, 10)
      if (!isNaN(guests)) {
        setMinCapacity(guests)
      }
    }

    if (checkInParam) {
      setCheckInDate(checkInParam)
    }

    if (checkOutParam) {
      setCheckOutDate(checkOutParam)
    }

    console.log('🔍 Camps page URL params:', {
      province: provinceParam,
      district: districtParam,
      guests: guestsParam,
      checkIn: checkInParam,
      checkOut: checkOutParam
    })
  }, [searchParams])

  const { data: yurtsData, loading: yurtsLoading, error: yurtsError } = useQuery(GET_YURTS, {
    variables: { first: 50, orderBy: "createdAt_DESC" },
    fetchPolicy: "cache-and-network",
    errorPolicy: "all"
  })

  // Handle GraphQL loading and error states
  if (yurtsError) {
    console.error("GraphQL Yurts Error:", yurtsError)
  }

  const yurts = (yurtsData?.yurts?.edges ?? []).map((e: any) => e.node)

  // Province and district data from mnzip.json
  // Only show Архангай province
  const allProvinces = mnzipData.zipcode
  const provinces = allProvinces.filter((p: any) => p.zipcode === "65000" || p.zipcode === "62000")
  
  // Get available districts for the selected province
  const currentProvince = provinces.find((p: any) => p.mnname === selectedProvince || p.name === selectedProvince)
  const availableDistricts = currentProvince?.sub_items || []

  // Helper function to check if camp is available during selected dates
  const isCampAvailable = (camp: any, checkIn: string, checkOut: string): boolean => {
    if (!checkIn || !checkOut) {
      return true // No date filter, show all camps
    }

    const requestedCheckIn = new Date(checkIn)
    const requestedCheckOut = new Date(checkOut)

    if (!camp.bookings || camp.bookings.length === 0) {
      return true // No bookings, camp is available
    }

    // Check if requested dates overlap with any active booking
    const hasOverlap = camp.bookings.some((booking: any) => {
      // Only check PENDING and CONFIRMED bookings
      if (booking.status !== 'PENDING' && booking.status !== 'CONFIRMED') {
        return false
      }

      // Parse booking dates (handle both timestamp strings and ISO strings)
      let bookingStart: Date
      let bookingEnd: Date

      if (typeof booking.startDate === 'string' && /^\d+$/.test(booking.startDate)) {
        bookingStart = new Date(parseInt(booking.startDate))
        bookingEnd = new Date(parseInt(booking.endDate))
      } else {
        bookingStart = new Date(booking.startDate)
        bookingEnd = new Date(booking.endDate)
      }

      // Check for overlap using strict logic
      // Booking starts before requested end AND booking ends after requested start
      const overlap = bookingStart < requestedCheckOut && bookingEnd > requestedCheckIn

      if (overlap) {
        console.log(`[Filter] Camp ${camp.name} overlap with booking ${booking.id}: ${bookingStart.toISOString()} - ${bookingEnd.toISOString()}`)
      }
      return overlap
    })

    return !hasOverlap // Camp is available if there's NO overlap
  }

  // Filter yurts by location, capacity, and date availability
  const filteredCamps = yurts.filter((camp: any) => {
    // RESTRICTION: Only show camps in Arkhangai, Tsenkher -> REMOVED to allow all camps
    const campLocation = camp.location || ""
    // if (!campLocation.includes("Архангай") || !campLocation.includes("Цэнхэр")) {
    //   return false
    // }

    // Secondary filters
    if (selectedProvince && !campLocation.includes(selectedProvince)) {
      return false
    }

    // Check district match
    if (selectedDistrict) {
      if (!campLocation.includes(selectedDistrict)) {
        return false
      }
    }

    // Check capacity (minimum capacity required)
    if (minCapacity > 0) {
      const campCapacity = parseInt(camp.capacity, 10) || 0
      if (campCapacity < minCapacity) {
        return false
      }
    }

    // Check date availability
    if (checkInDate && checkOutDate) {
      if (!isCampAvailable(camp, checkInDate, checkOutDate)) {
        console.log(`🚫 Camp ${camp.name} is NOT available for ${checkInDate} to ${checkOutDate}`)
        return false
      }
      console.log(`✅ Camp ${camp.name} IS available for ${checkInDate} to ${checkOutDate}`)
    }

    return true
  }).sort((a: any, b: any) => {
    // Prioritize featured camps
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    return 0;
  })

  const handleProvinceChange = (provinceName: string) => {
    setSelectedProvince(provinceName)
    setSelectedDistrict("")
  }

  const handleDistrictChange = (districtName: string) => {
    setSelectedDistrict(districtName)
  }

  const handleClearFilters = () => {
    setSelectedProvince("")
    setSelectedDistrict("")
    setMinCapacity(0)
    setCheckInDate("")
    setCheckOutDate("")
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Page Header */}
      <section className="bg-white border-b border-gray-200 py-4 sm:py-6 md:py-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 sm:mb-5 md:mb-6 font-display">
            {t("camps.title")}
          </h1>

          {/* Location Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                Аймаг сонгох
              </label>
              <Select value={selectedProvince} onValueChange={handleProvinceChange}>
                <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm">
                  <SelectValue placeholder="Аймаг сонгох" />
                </SelectTrigger>
                <SelectContent className="max-h-[40vh] sm:max-h-[300px]">
                  {provinces.map((province: any) => (
                    <SelectItem
                      key={province.zipcode}
                      value={province.mnname}
                      className="text-xs sm:text-sm"
                    >
                      {province.mnname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                Сум сонгох
              </label>
              <Select
                value={selectedDistrict}
                onValueChange={handleDistrictChange}
                disabled={!selectedProvince}
              >
                <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm">
                  <SelectValue placeholder={selectedProvince ? "Сум сонгох" : "Эхлээд аймаг сонгоно уу"} />
                </SelectTrigger>
                <SelectContent className="max-h-[40vh] sm:max-h-[300px]">
                  {availableDistricts.length > 0 ? (
                    availableDistricts.map((district: any) => (
                      <SelectItem
                        key={district.zipcode}
                        value={district.mnname}
                        className="text-xs sm:text-sm"
                      >
                        {district.mnname}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-xs sm:text-sm text-gray-500">
                      Сум олдсонгүй
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                Огноо
              </label>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal bg-white h-9 sm:h-10 text-xs sm:text-sm border-input"
                onClick={() => setShowDatePicker(true)}
              >
                <Calendar className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500" />
                {checkInDate && checkOutDate ? (
                  <span className="text-gray-900 font-medium">
                    {new Date(checkInDate).toLocaleDateString('mn-MN', { month: 'numeric', day: 'numeric' })} - {new Date(checkOutDate).toLocaleDateString('mn-MN', { month: 'numeric', day: 'numeric' })}
                  </span>
                ) : (
                  <span className="text-gray-500">Огноо сонгох</span>
                )}
              </Button>
            </div>

            <div className="flex items-end sm:col-span-2 lg:col-span-1">
              <Button
                variant="outline"
                className="w-full bg-transparent font-medium text-xs sm:text-sm h-9 sm:h-10"
                onClick={handleClearFilters}
                disabled={!selectedProvince && !selectedDistrict && minCapacity === 0 && !checkInDate && !checkOutDate}
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                Цэвэрлэх
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Camps Grid */}
      <section className="py-4 sm:py-6 md:py-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="mb-4 sm:mb-5 md:mb-6">

            <p className="text-xs sm:text-sm md:text-base text-gray-600 font-medium">
              <span className="font-semibold">{filteredCamps.length}</span> бааз олдлоо
              {(selectedProvince || minCapacity > 0 || checkInDate) && (
                <span className="ml-1.5 sm:ml-2 text-emerald-600">
                  {selectedProvince && (
                    <>
                      {selectedProvince}
                      {selectedDistrict && `, ${selectedDistrict}`}
                    </>
                  )}
                  {selectedProvince && (minCapacity > 0 || checkInDate) && " • "}
                  {minCapacity > 0 && `${minCapacity}+ зочин`}
                  {minCapacity > 0 && checkInDate && " • "}
                  {checkInDate && checkOutDate && (
                    <>
                      {new Date(checkInDate).toLocaleDateString('mn-MN', { month: 'short', day: 'numeric' })}
                      {" - "}
                      {new Date(checkOutDate).toLocaleDateString('mn-MN', { month: 'short', day: 'numeric' })}
                    </>
                  )}
                </span>
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
            {filteredCamps
              .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
              .map((camp: any) => {
                const imageSrc = getPrimaryImage(camp.images)

                // Parse amenities from JSON string
                let amenitiesDisplay: string[] = []
                try {
                  if (camp.amenities) {
                    const parsed = JSON.parse(camp.amenities)
                    if (parsed.items && Array.isArray(parsed.items) && parsed.items.length > 0) {
                      amenitiesDisplay = parsed.items.slice(0, 3).map((value: string) => {
                        const option = amenitiesOptions.find(opt => opt.value === value)
                        return option ? option.label : value
                      })
                    }
                  }
                } catch (e) {
                  // Fallback: if old format or parse error, use split
                  const amenitiesStr = typeof camp.amenities === 'string' ? camp.amenities : '';
                  if (amenitiesStr && !amenitiesStr.startsWith('{')) {
                    amenitiesDisplay = amenitiesStr.split(',').slice(0, 3)
                  }
                }

                return (
                  <Card
                    key={camp.id}
                    className="relative group border border-emerald-900/10 bg-[#fdfcf0] rounded-2xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5"
                  >
                    <div className="flex flex-col h-full">
                      <div className="relative h-44 sm:h-52 w-full overflow-hidden">
                        <Image
                          src={imageSrc}
                          alt={camp.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute top-2 left-2 right-2 flex flex-col gap-1.5 items-start sm:flex-row sm:justify-between sm:items-center z-10 pointer-events-none">
                          {camp.isFeatured && (
                            <div className="bg-gradient-to-r from-amber-400/90 to-yellow-600/90 text-white px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl backdrop-blur-md border border-white/30 flex items-center gap-1 ring-1 ring-black/5">
                              <Star className="w-2.5 h-2.5 fill-white" />
                              Онцгой хамтрагч
                            </div>
                          )}
                          <div className="bg-emerald-900/60 text-white px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl backdrop-blur-md border border-white/20 ml-auto sm:ml-0 ring-1 ring-black/5">
                            {camp.location.split(',')[0]}
                          </div>
                        </div>
                      </div>

                      <div className="p-4 sm:p-5 flex flex-col flex-1">
                        <div className="mb-3 sm:mb-4">
                          <h3 className="font-black text-base sm:text-xl text-[#0F3D2E] leading-tight tracking-tight uppercase line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem]">
                            {camp.name}
                          </h3>
                        </div>

                        <div className="space-y-1.5 mb-5 sm:mb-6 text-[#0F3D2E]/80 font-bold">
                          <div className="flex items-center">
                            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 text-emerald-600 flex-shrink-0" />
                            <span className="text-xs sm:text-sm truncate">
                              {camp.location}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 text-emerald-600 flex-shrink-0" />
                            <span className="text-xs sm:text-sm">
                              {camp.capacity} зочин
                            </span>
                          </div>
                          {amenitiesDisplay.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {amenitiesDisplay.map((amenity: string, index: number) => (
                                <span key={index} className="text-[9px] sm:text-[10px] bg-emerald-900/5 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-900/10">
                                  {amenity.trim()}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="mt-auto space-y-3 sm:space-y-4">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-lg sm:text-2xl font-black text-[#0F3D2E] leading-none">
                              {camp.pricePerNight?.toLocaleString()}₮
                            </span>
                            <span className="text-emerald-900/40 text-[10px] sm:text-xs font-bold">
                              /хоног
                            </span>
                          </div>
                          
                          {/* Create URL with search params to pass to camp details */}
                          <Link href={`/camp/${camp.id}${checkInDate && checkOutDate ? `?checkIn=${checkInDate}&checkOut=${checkOutDate}${minCapacity ? `&guests=${minCapacity}` : ''}` : ''}`} className="block">
                            <Button
                              className="w-full bg-[#246e50] hover:bg-[#1a5a40] text-white font-black text-xs sm:text-sm h-10 sm:h-11 rounded-xl shadow-lg transition-all active:scale-95"
                            >
                              Захиалах
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
          </div>

          {/* Pagination */}
          {filteredCamps.length > itemsPerPage && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {[...Array(Math.ceil(filteredCamps.length / itemsPerPage))].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      isActive={currentPage === i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className="cursor-pointer"
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredCamps.length / itemsPerPage), prev + 1))}
                    className={currentPage === Math.ceil(filteredCamps.length / itemsPerPage) ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </section>

      <DatePickerModal
        isOpen={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSelect={(start, end) => {
          if (start && end) {
            // Adjust dates to local string format YYYY-MM-DD
            // This prevents timezone shifts when converting to string
            const formatDate = (date: Date) => {
              const offsetDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
              return offsetDate.toISOString().split('T')[0];
            };

            setCheckInDate(formatDate(start))
            setCheckOutDate(formatDate(end))
          } else {
            setCheckInDate("")
            setCheckOutDate("")
          }
        }}
      />
    </div>
  )
}
