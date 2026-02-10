"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useTranslation } from "react-i18next"
import Image from "next/image"
import Link from "next/link"
import { MapPin, Star, Users, Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { gql, useQuery } from "@apollo/client"
import { getPrimaryImage } from "@/lib/imageUtils"
import mnzipData from "@/data/mnzip.json"
import { amenitiesOptions } from "@/data/camp-options"
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
  const [selectedProvince, setSelectedProvince] = useState("")
  const [selectedDistrict, setSelectedDistrict] = useState("")
  const [minCapacity, setMinCapacity] = useState(0)
  const [checkInDate, setCheckInDate] = useState<string>("")
  const [checkOutDate, setCheckOutDate] = useState<string>("")

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
  const arkhangaiProvince = allProvinces.find((p: any) => p.zipcode === "65000")
  const provinces = arkhangaiProvince ? [arkhangaiProvince] : []
  const selectedProvinceData = allProvinces.find((p: any) => p.mnname === selectedProvince)
  const availableDistricts = selectedProvinceData?.sub_items || []

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

      // Check for overlap
      const overlap = (
        // Booking starts during requested period
        (bookingStart >= requestedCheckIn && bookingStart < requestedCheckOut) ||
        // Booking ends during requested period
        (bookingEnd > requestedCheckIn && bookingEnd <= requestedCheckOut) ||
        // Booking spans entire requested period
        (bookingStart <= requestedCheckIn && bookingEnd >= requestedCheckOut)
      )

      return overlap
    })

    return !hasOverlap // Camp is available if there's NO overlap
  }

  // Filter yurts by location, capacity, and date availability
  const filteredCamps = yurts.filter((camp: any) => {
    // camp.location format: "Сүхбаатар, Уулбаян" or just "Сүхбаатар"
    const location = camp.location || ""

    // Check province match
    if (selectedProvince) {
      if (!location.includes(selectedProvince)) {
        return false
      }
    }

    // Check district match
    if (selectedDistrict) {
      if (!location.includes(selectedDistrict)) {
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
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

            <div className="flex items-end sm:col-span-2 md:col-span-1">
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
            {filteredCamps.map((camp: any) => {
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
                if (camp.amenities && typeof camp.amenities === 'string' && !camp.amenities.startsWith('{')) {
                  amenitiesDisplay = camp.amenities.split(',').slice(0, 3)
                }
              }

              return (
                <Card key={camp.id} className="overflow-hidden hover:shadow-lg transition-all duration-200">
                  <div className="relative">
                    <Image
                      src={imageSrc}
                      alt={camp.name}
                      width={300}
                      height={200}
                      className="w-full h-40 xs:h-44 sm:h-48 md:h-52 object-cover"
                    />
                    <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 bg-white rounded-full p-1">
                      <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-emerald-600" />
                    </div>
                  </div>
                  <CardContent className="p-3 xs:p-4 sm:p-5 md:p-6">
                    <h3 className="font-bold text-sm xs:text-base md:text-lg mb-1.5 sm:mb-2 truncate">{camp.name}</h3>
                    <div className="flex items-center justify-between mb-1.5 sm:mb-2 gap-2">
                      <div className="flex items-center text-gray-600 min-w-0 flex-1">
                        <MapPin className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                        <span className="text-xs xs:text-sm font-medium truncate">{camp.location}</span>
                      </div>
                      <div className="flex items-center text-gray-600 flex-shrink-0">
                        <Users className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 mr-0.5 sm:mr-1" />
                        <span className="text-xs xs:text-sm font-medium whitespace-nowrap">
                          {camp.capacity} зочин
                        </span>
                      </div>
                    </div>
                    <div className="mb-3 sm:mb-4">
                      <div className="flex flex-wrap gap-1">
                        {amenitiesDisplay.length > 0 ? (
                          amenitiesDisplay.map((amenity: string, index: number) => (
                            <span key={index} className="text-[10px] xs:text-xs bg-emerald-50 text-emerald-700 px-1.5 xs:px-2 py-0.5 xs:py-1 rounded font-medium">
                              {amenity.trim()}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] xs:text-xs text-gray-500">Тав тухтай орчин</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold">{camp.pricePerNight?.toLocaleString()}₮</span>
                        <span className="text-gray-600 ml-0.5 sm:ml-1 text-[10px] xs:text-xs sm:text-sm font-medium">хоног</span>
                      </div>
                      <Link href={`/camp/${camp.id}`} className="flex-shrink-0">
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 font-semibold text-[10px] xs:text-xs sm:text-sm px-2 xs:px-3 h-7 xs:h-8 sm:h-9">
                          Дэлгэрэнгүй
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
