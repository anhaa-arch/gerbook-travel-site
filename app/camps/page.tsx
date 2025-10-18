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

  // Initialize from URL query params
  useEffect(() => {
    const provinceParam = searchParams.get("province")
    const guestsParam = searchParams.get("guests")
    
    if (provinceParam) {
      setSelectedProvince(provinceParam)
    }
    
    if (guestsParam) {
      const guests = parseInt(guestsParam, 10)
      if (!isNaN(guests)) {
        setMinCapacity(guests)
      }
    }
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
  const provinces = mnzipData.zipcode
  const selectedProvinceData = provinces.find((p: any) => p.mnname === selectedProvince)
  const availableDistricts = selectedProvinceData?.sub_items || []

  // Filter yurts by location and capacity
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
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Page Header */}
      <section className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 font-display">{t("camps.title")}</h1>

          {/* Location Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Аймаг сонгох</label>
              <Select value={selectedProvince} onValueChange={handleProvinceChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Аймаг сонгох" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {provinces.map((province: any) => (
                    <SelectItem key={province.zipcode} value={province.mnname}>
                      {province.mnname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Сум сонгох</label>
              <Select 
                value={selectedDistrict} 
                onValueChange={handleDistrictChange} 
                disabled={!selectedProvince}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedProvince ? "Сум сонгох" : "Эхлээд аймаг сонгоно уу"} />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {availableDistricts.length > 0 ? (
                    availableDistricts.map((district: any) => (
                      <SelectItem key={district.zipcode} value={district.mnname}>
                        {district.mnname}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-gray-500">
                      Сум олдсонгүй
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                className="w-full bg-transparent font-medium"
                onClick={handleClearFilters}
                disabled={!selectedProvince && !selectedDistrict && minCapacity === 0}
              >
                <X className="w-4 h-4 mr-2" />
                Цэвэрлэх
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Camps Grid */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <p className="text-gray-600 font-medium">
              {filteredCamps.length} бааз олдлоо
              {(selectedProvince || minCapacity > 0) && (
                <span className="ml-2 text-emerald-600">
                  {selectedProvince && (
                    <>
                      {selectedProvince}
                      {selectedDistrict && `, ${selectedDistrict}`}
                    </>
                  )}
                  {selectedProvince && minCapacity > 0 && " • "}
                  {minCapacity > 0 && `${minCapacity}+ зочин`}
                </span>
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                <Card key={camp.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <Image
                      src={imageSrc}
                      alt={camp.name}
                      width={300}
                      height={200}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-white rounded-full p-1">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-2">{camp.name}</h3>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium">{camp.location}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Users className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium">
                          {camp.capacity} зочин
                        </span>
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {amenitiesDisplay.length > 0 ? (
                          amenitiesDisplay.map((amenity: string, index: number) => (
                            <span key={index} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded font-medium">
                              {amenity.trim()}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-500">Тав тухтай орчин</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold">{camp.pricePerNight?.toLocaleString()}₮</span>
                        <span className="text-gray-600 ml-1 font-medium">хоног</span>
                      </div>
                      <Link href={`/camp/${camp.id}`}>
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 font-semibold">
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
