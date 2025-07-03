"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import Image from "next/image"
import Link from "next/link"
import { MapPin, Star, Users, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mongoliaData } from "@/lib/data"
import "../../lib/i18n"

export default function CampsPage() {
  const { t, i18n } = useTranslation()
  const [selectedProvince, setSelectedProvince] = useState("")
  const [selectedDistrict, setSelectedDistrict] = useState("")
  const [camps, setCamps] = useState<any[]>([])

  // Mock camps data
  const mockCamps = [
    {
      id: 1,
      name: "Найман нуур эко гэр бааз",
      province: "arkhangai",
      district: "tsetserleg",
      price: 120,
      rating: 4.8,
      reviews: 127,
      guests: 4,
      image: "/placeholder.svg?height=200&width=300&text=Traditional+Ger+Camp",
      coordinates: { lat: 47.4753, lng: 101.4544 },
      amenities: ["WiFi", "Хоол", "Морь унах"],
    },
    {
      id: 2,
      name: "Хөвсгөл нуурын тансаг бааз",
      province: "arkhangai",
      district: "khairkhan",
      price: 250,
      rating: 4.9,
      reviews: 89,
      guests: 6,
      image: "/placeholder.svg?height=200&width=300&text=Lake+Ger+Camp",
      coordinates: { lat: 50.4265, lng: 100.1629 },
      amenities: ["Спа", "Тансаг хоол", "Нуурын үйл ажиллагаа"],
    },
    {
      id: 3,
      name: "Уулын үзэмжит гэр бааз",
      province: "bayan-olgii",
      district: "olgii",
      price: 180,
      rating: 4.7,
      reviews: 156,
      guests: 4,
      image: "/placeholder.svg?height=200&width=300&text=Mountain+Camp",
      coordinates: { lat: 48.9687, lng: 89.9336 },
      amenities: ["Уулын аялал", "Бүргэдийн ан", "Соёлын аялал"],
    },
  ]

  const filteredCamps =
    camps.length > 0
      ? camps
      : mockCamps.filter((camp) => {
          if (selectedProvince && camp.province !== selectedProvince) return false
          if (selectedDistrict && camp.district !== selectedDistrict) return false
          return true
        })

  const selectedProvinceData = mongoliaData.provinces.find((p) => p.id === selectedProvince)
  const availableDistricts = selectedProvinceData?.districts || []

  const handleProvinceChange = (provinceId: string) => {
    setSelectedProvince(provinceId)
    setSelectedDistrict("")
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t("camps.select_province")}</label>
              <Select value={selectedProvince} onValueChange={handleProvinceChange}>
                <SelectTrigger>
                  <SelectValue placeholder={t("camps.select_province")} />
                </SelectTrigger>
                <SelectContent>
                  {mongoliaData.provinces.map((province) => (
                    <SelectItem key={province.id} value={province.id}>
                      {province.name.mn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t("camps.select_district")}</label>
              <Select value={selectedDistrict} onValueChange={setSelectedDistrict} disabled={!selectedProvince}>
                <SelectTrigger>
                  <SelectValue placeholder={t("camps.select_district")} />
                </SelectTrigger>
                <SelectContent>
                  {availableDistricts.map((district) => (
                    <SelectItem key={district.id} value={district.id}>
                      {district.name.mn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" className="w-full bg-transparent font-medium">
                <Filter className="w-4 h-4 mr-2" />
                {t("common.filter")}
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
              {selectedProvince && (
                <span className="ml-2">
                  {mongoliaData.provinces.find((p) => p.id === selectedProvince)?.name.mn ||
                    selectedProvince}
                </span>
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCamps.map((camp) => (
              <Card key={camp.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <Image
                    src={camp.image || "/placeholder.svg"}
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
                    <div className="flex items-center">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="text-sm font-semibold">{camp.rating}</span>
                      <span className="text-gray-600 text-sm ml-1 font-medium">({camp.reviews})</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users className="w-4 h-4 mr-1" />
                      <span className="text-sm font-medium">
                        {camp.guests} {t("camps.guests")}
                      </span>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {camp.amenities.slice(0, 3).map((amenity: string, index: number) => (
                        <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-medium">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold">${camp.price}</span>
                      <span className="text-gray-600 ml-1 font-medium">{t("camps.per_night")}</span>
                    </div>
                    <Link href={`/camps/${camp.id}`}>
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 font-semibold">
                        {t("common.details")}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
