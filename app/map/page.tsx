"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { MapPin, Star, Calendar, Search, Filter, Navigation } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import '../../lib/i18n'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import type { CheckedState } from "@radix-ui/react-checkbox"

interface MapLocation {
  id: number
  name: { en: string; mn: string }
  type: "camp" | "festival" | "attraction" | "rest" | "fuel"
  location: string
  coordinates: { lat: number; lng: number }
  price?: number
  rating: number
  description: { en: string; mn: string }
  image: string
  date?: string
  amenities?: string[]
  activities?: string[]
  childFriendly?: boolean
  accessibility?: "easy" | "moderate" | "difficult"
  longDescription: { en: string; mn: string }
  tips: { en: string; mn: string }
}

export default function MapPage() {
  const { t } = useTranslation()
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showChildFriendly, setShowChildFriendly] = useState(false)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([])
  const [routeLoading, setRouteLoading] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)

  const mapLocations: MapLocation[] = [
    {
      id: 1,
      name: { en: "Naiman Nuur Eco Camp", mn: "Наиман нуур эко камп" },
      type: "camp",
      location: "Arkhangai Province",
      coordinates: { lat: 47.4753, lng: 101.4544 },
      price: 120,
      rating: 4.8,
      description: { en: "Eco-friendly ger camp near eight beautiful lakes with traditional nomadic experiences", mn: "Наиман нуурын эко камп, 8 ширээний нуурын традицийн номын цагааны туршлагатай" },
      amenities: ["WiFi", "Meals", "Horseback Riding", "Guides"],
      activities: ["Lake Tours", "Hiking", "Photography", "Fishing"],
      image: "/placeholder.svg?height=200&width=300&text=Eco+Camp",
      childFriendly: true,
      accessibility: "easy",
      longDescription: { en: "...", mn: "..." },
      tips: { en: "...", mn: "..." },
    },
    {
      id: 2,
      name: { en: "Naadam Festival", mn: "Наадам фестиваль" },
      type: "festival",
      location: "Ulaanbaatar",
      coordinates: { lat: 47.8864, lng: 106.9057 },
      rating: 4.9,
      description: { en: "Mongolia's most important festival featuring wrestling, archery, and horse racing", mn: "Монголын хамгийн чухал фестиваль, бордоо, арчны, нуудад эргэхээр" },
      activities: ["Wrestling", "Archery", "Horse Racing", "Cultural Shows"],
      image: "/placeholder.svg?height=200&width=300&text=Naadam+Festival",
      date: "July 11-13, 2025",
      childFriendly: true,
      accessibility: "easy",
      longDescription: { en: "...", mn: "..." },
      tips: { en: "...", mn: "..." },
    },
    {
      id: 3,
      name: { en: "Khuvsgul Lake", mn: "Хөвсгөл нуур" },
      type: "attraction",
      location: "Khövsgöl Province",
      coordinates: { lat: 50.4265, lng: 100.1629 },
      rating: 4.9,
      description: { en: "Mongolia's pristine blue pearl, one of the world's largest freshwater lakes", mn: "Монголын шинэ цэвэр хөвсгөл, дэлхийн хамгийн том нуур" },
      activities: ["Boating", "Swimming", "Fishing", "Hiking"],
      amenities: ["Boat Rental", "Restaurants", "Accommodation"],
      image: "/placeholder.svg?height=200&width=300&text=Khuvsgul+Lake",
      childFriendly: true,
      accessibility: "easy",
      longDescription: { en: "...", mn: "..." },
      tips: { en: "...", mn: "..." },
    },
    {
      id: 4,
      name: { en: "Gobi Desert Adventure Camp", mn: "Гоби шаврын авантюр камп" },
      type: "camp",
      location: "Ömnögovi Province",
      coordinates: { lat: 43.5563, lng: 104.4739 },
      price: 180,
      rating: 4.7,
      description: { en: "Experience the vast Gobi Desert with camel riding and stargazing", mn: "Гоби шаврын авантюр кампт хөвсгөл нуурын туршлагатай, нуурын авантюр туршлагатай" },
      amenities: ["Camel Riding", "Stargazing", "Desert Tours", "Traditional Meals"],
      activities: ["Camel Trekking", "Fossil Hunting", "Stargazing", "Photography"],
      image: "/placeholder.svg?height=200&width=300&text=Gobi+Camp",
      childFriendly: false,
      accessibility: "moderate",
      longDescription: { en: "...", mn: "..." },
      tips: { en: "...", mn: "..." },
    },
    {
      id: 5,
      name: { en: "Eagle Festival", mn: "Эйрэлэг фестиваль" },
      type: "festival",
      location: "Bayan-Ölgii Province",
      coordinates: { lat: 48.9687, lng: 89.9336 },
      rating: 4.8,
      description: { en: "Traditional Kazakh eagle hunting festival in the Altai Mountains", mn: "Алтайын тосгойгоор эйрэлэг эрхэм фестиваль" },
      activities: ["Eagle Hunting", "Traditional Games", "Cultural Shows", "Horseback Riding"],
      image: "/placeholder.svg?height=200&width=300&text=Eagle+Festival",
      date: "October 5-6, 2025",
      childFriendly: false,
      accessibility: "difficult",
      longDescription: { en: "...", mn: "..." },
      tips: { en: "...", mn: "..." },
    },
    {
      id: 6,
      name: { en: "Flaming Cliffs", mn: "Эйрэлэг хэвтээ" },
      type: "attraction",
      location: "Ömnögovi Province",
      coordinates: { lat: 44.1378, lng: 103.2267 },
      rating: 4.6,
      description: { en: "Famous paleontological site where dinosaur eggs were first discovered", mn: "Дэлхийн энэтхэгтэй хэвтээ, динозавруудын ягаан ягааныг эхний олдог энэтхэгтэй" },
      activities: ["Fossil Hunting", "Photography", "Hiking", "Sunset Viewing"],
      amenities: ["Guides", "Information Center"],
      image: "/placeholder.svg?height=200&width=300&text=Flaming+Cliffs",
      childFriendly: true,
      accessibility: "moderate",
      longDescription: { en: "...", mn: "..." },
      tips: { en: "...", mn: "..." },
    },
    {
      id: 7,
      name: { en: "Terelj Rest Stop", mn: "Тэрэлжийн эргэлт" },
      type: "rest",
      location: "Töv Province",
      coordinates: { lat: 47.9833, lng: 107.4667 },
      rating: 4.2,
      description: { en: "Convenient rest stop with facilities and local food", mn: "Эргэлттэй эргэлт, бүрэн бүрээсээр" },
      amenities: ["Restaurant", "Restrooms", "Fuel", "Shop"],
      image: "/placeholder.svg?height=200&width=300&text=Rest+Stop",
      childFriendly: true,
      accessibility: "easy",
      longDescription: { en: "...", mn: "..." },
      tips: { en: "...", mn: "..." },
    },
    {
      id: 8,
      name: { en: "Highway Fuel Station", mn: "Гурвалжин эргэлт" },
      type: "fuel",
      location: "Darkhan-Uul Province",
      coordinates: { lat: 49.4864, lng: 105.9057 },
      rating: 4.0,
      description: { en: "24/7 fuel station with convenience store", mn: "24/7 эргэлт, бүрэн бүрээсээр" },
      amenities: ["Fuel", "Shop", "ATM", "Restrooms"],
      image: "/placeholder.svg?height=200&width=300&text=Fuel+Station",
      childFriendly: true,
      accessibility: "easy",
      longDescription: { en: "...", mn: "..." },
      tips: { en: "...", mn: "..." },
    },
  ]

  const handleFilterChange = (filter: string, checked: boolean) => {
    setSelectedFilters((prev) => (checked ? [...prev, filter] : prev.filter((f) => f !== filter)))
  }

  const filteredLocations = mapLocations.filter((location) => {
    const matchesFilter = selectedFilters.length === 0 || selectedFilters.includes(location.type)
    const matchesSearch =
      searchQuery === "" ||
      location.name.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.name.mn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesChildFriendly = !showChildFriendly || location.childFriendly

    return matchesFilter && matchesSearch && matchesChildFriendly
  })

  const getLocationIcon = (type: string) => {
    switch (type) {
      case "camp":
        return "🏕️"
      case "festival":
        return "🎭"
      case "attraction":
        return "🏔️"
      case "rest":
        return "🍽️"
      case "fuel":
        return "⛽"
      default:
        return "📍"
    }
  }

  const getLocationColor = (type: string) => {
    switch (type) {
      case "camp":
        return "bg-emerald-500"
      case "festival":
        return "bg-purple-500"
      case "attraction":
        return "bg-blue-500"
      case "rest":
        return "bg-orange-500"
      case "fuel":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getAccessibilityColor = (accessibility: string) => {
    switch (accessibility) {
      case "easy":
        return "text-green-600"
      case "moderate":
        return "text-yellow-600"
      case "difficult":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude])
        },
        (err) => {
          setGeoError("Байршил авах боломжгүй байна.")
        }
      )
    } else {
      setGeoError("Таны браузер байршил дэмжихгүй байна.")
    }
  }, [])

  // Fetch route when marker is clicked
  const handleMarkerClick = async (location: MapLocation) => {
    setSelectedLocation(location)
    setRouteCoords([])
    if (!userLocation) return
    setRouteLoading(true)
    try {
      // OpenRouteService Directions API
      const apiKey = "YOUR_ORS_API_KEY" // <-- энд өөрийн API key-г тавина уу
      const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}`
      const body = {
        coordinates: [
          [userLocation[1], userLocation[0]], // [lng, lat]
          [location.coordinates.lng, location.coordinates.lat],
        ],
      }
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error("Маршрут олдсонгүй")
      const data = await res.json()
      const coords = data.features[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]])
      setRouteCoords(coords)
    } catch (e) {
      setGeoError("Маршрут татахад алдаа гарлаа.")
    } finally {
      setRouteLoading(false)
    }
  }

  // Fix Checkbox handler type
  const handleChildFriendlyChange = (checked: CheckedState) => {
    setShowChildFriendly(checked === true)
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 font-display">{t("map.title")}</h1>
          <p className="text-sm sm:text-base text-gray-600 font-medium">{t("map.subtitle")}</p>
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-6 sm:mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={t("map.search_placeholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 font-medium"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <Button variant="outline" className="w-full bg-transparent font-semibold">
                <Filter className="w-4 h-4 mr-2" />
                Advanced Filters
              </Button>
            </div>
          </div>

          {/* Filter Checkboxes */}
          <div className="flex flex-wrap gap-4">
            {[
              { id: "camp", label: t("map.camps"), count: mapLocations.filter((l) => l.type === "camp").length },
              {
                id: "festival",
                label: t("map.festivals"),
                count: mapLocations.filter((l) => l.type === "festival").length,
              },
              {
                id: "attraction",
                label: t("map.attractions"),
                count: mapLocations.filter((l) => l.type === "attraction").length,
              },
              { id: "rest", label: "Rest Stops", count: mapLocations.filter((l) => l.type === "rest").length },
              { id: "fuel", label: "Fuel Stations", count: mapLocations.filter((l) => l.type === "fuel").length },
            ].map((filter) => (
              <div key={filter.id} className="flex items-center space-x-2">
                <Checkbox
                  id={filter.id}
                  checked={selectedFilters.includes(filter.id)}
                  onCheckedChange={(checked) => handleFilterChange(filter.id, checked as boolean)}
                />
                <label htmlFor={filter.id} className="text-sm font-semibold cursor-pointer">
                  {filter.label} ({filter.count})
                </label>
              </div>
            ))}
          </div>

          {/* Additional Filters */}
          <div className="flex items-center space-x-2">
            <Checkbox checked={showChildFriendly} onCheckedChange={handleChildFriendlyChange} />
            <label htmlFor="childFriendly" className="text-sm font-semibold cursor-pointer">
              Child-friendly locations only
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="flex items-center gap-1 font-medium">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              Ger Camps ({mapLocations.filter((l) => l.type === "camp").length})
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1 font-medium">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              Festivals ({mapLocations.filter((l) => l.type === "festival").length})
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1 font-medium">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              Attractions ({mapLocations.filter((l) => l.type === "attraction").length})
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1 font-medium">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              Rest Stops ({mapLocations.filter((l) => l.type === "rest").length})
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1 font-medium">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              Fuel Stations ({mapLocations.filter((l) => l.type === "fuel").length})
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Map Area */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-0">
                <div className="w-full h-[500px] rounded-lg overflow-hidden mb-8 shadow">
                  <MapContainer center={[47.5, 105]} zoom={5} style={{ height: "100%", width: "100%" }} scrollWheelZoom={true}>
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {userLocation && (
                      <Marker position={userLocation}>
                        <Popup>Таны байршил</Popup>
                      </Marker>
                    )}
                    {filteredLocations.map((location) => (
                      <Marker key={location.id} position={[location.coordinates.lat, location.coordinates.lng]} eventHandlers={{ click: () => handleMarkerClick(location) }}>
                        <Popup>
                          <div>
                            <div className="font-bold mb-1">{location.name.mn}</div>
                            <div className="text-xs text-gray-600 mb-1">{location.type}</div>
                            <div className="text-xs">{location.location}</div>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                    {routeCoords.length > 0 && <Polyline positions={routeCoords} pathOptions={{ color: "blue" }} />}
                  </MapContainer>
                </div>
                {routeLoading && <div className="text-blue-600 font-medium mb-2">Маршрут татаж байна...</div>}
                {geoError && <div className="text-red-600 font-medium mb-2">{geoError}</div>}
              </CardContent>
            </Card>
          </div>

          {/* Location Details & List */}
          <div className="space-y-6">
            {/* Selected Location Details */}
            {selectedLocation && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg font-bold">{selectedLocation.name.en}</CardTitle>
                </CardHeader>
                <CardContent>
                  <img
                    src={selectedLocation.image || "/placeholder.svg"}
                    alt={selectedLocation.name.en}
                    className="w-full h-32 object-cover rounded-lg mb-4"
                  />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="capitalize font-medium">
                        {selectedLocation.type}
                      </Badge>
                      {selectedLocation.childFriendly && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 font-medium">
                          Child Friendly
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="text-sm font-medium">{selectedLocation.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="text-sm font-semibold">{selectedLocation.rating}</span>
                    </div>
                    {selectedLocation.accessibility && (
                      <div className="flex items-center">
                        <Navigation className="w-4 h-4 mr-1 text-gray-500" />
                        <span
                          className={`text-sm font-semibold capitalize ${getAccessibilityColor(selectedLocation.accessibility)}`}
                        >
                          {selectedLocation.accessibility} Access
                        </span>
                      </div>
                    )}
                    {selectedLocation.price && (
                      <div className="text-lg font-bold text-emerald-600">
                        {selectedLocation.price}₮
                        <span className="text-sm text-gray-600 font-medium">/шөнө</span>
                      </div>
                    )}
                    {selectedLocation.date && (
                      <div className="flex items-center text-purple-600">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span className="text-sm font-semibold">{selectedLocation.date}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-3 font-medium">{selectedLocation.description.en}</p>

                  {/* Activities */}
                  {selectedLocation.activities && selectedLocation.activities.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold mb-2">Activities</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedLocation.activities.map((activity, index) => (
                          <Badge key={index} variant="secondary" className="text-xs font-medium">
                            {activity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Amenities */}
                  {selectedLocation.amenities && selectedLocation.amenities.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold mb-2">Amenities</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedLocation.amenities.map((amenity, index) => (
                          <Badge key={index} variant="outline" className="text-xs font-medium">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 font-semibold">
                    {selectedLocation.type === "camp"
                      ? "Book Now"
                      : selectedLocation.type === "festival"
                        ? "Get Tickets"
                        : "Learn More"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Location List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg font-bold">
                  {t("map.locations")} ({filteredLocations.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-80 sm:max-h-96 overflow-y-auto">
                  {filteredLocations.map((location) => (
                    <div
                      key={location.id}
                      className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedLocation?.id === location.id ? "border-emerald-500 bg-emerald-50" : ""
                      }`}
                      onClick={() => setSelectedLocation(location)}
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={`w-8 h-8 ${getLocationColor(location.type)} rounded-full flex items-center justify-center text-white text-sm flex-shrink-0`}
                        >
                          {getLocationIcon(location.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate">{location.name.en}</h4>
                          <div className="flex items-center text-xs text-gray-600 mt-1">
                            <MapPin className="w-3 h-3 mr-1" />
                            <span className="truncate font-medium">{location.location}</span>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                              <span className="text-xs font-semibold">{location.rating}</span>
                            </div>
                            {location.price && (
                              <span className="text-xs font-bold text-emerald-600">{location.price}₮</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
