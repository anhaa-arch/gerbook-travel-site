"use client"

import { useState, useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"
import {
  MapPin,
  Clock,
  Route,
  Calendar,
  Users,
  Baby,
  Mountain,
  AlertTriangle,
  Navigation,
  Download,
  Share2,
  Star,
  Camera,
  Fuel,
  Utensils,
  Bed,
  Home,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import '../../lib/i18n'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface TravelPlan {
  id: string
  title: string
  startDate: string
  duration: number
  travelers: number
  withChildren: boolean
  includeScenic: boolean
  totalDistance: number
  estimatedCost: number
  route: RouteSegment[]
  warnings: string[]
  alternatives: AlternativeRoute[]
}

interface RouteSegment {
  id: string
  day: number
  location: string
  coordinates: { lat: number; lng: number }
  type: "camp" | "scenic" | "landmark" | "rest" | "fuel"
  name: string
  description: string
  duration: number
  activities: string[]
  cost: number
  rating: number
  image: string
  travelTime: number
  distance: number
  amenities: string[]
  childFriendly: boolean
}

interface AlternativeRoute {
  id: string
  reason: string
  description: string
  additionalTime: number
  additionalCost: number
}

// --- Copy mongoliaAttractions from app/explore-mongolia/page.tsx ---
const mongoliaAttractions = [
  {
    id: 1,
    name: "Khuvsgul Lake",
    mongolianName: "Хөвсгөл нуур",
    description: "The 'Blue Pearl of Mongolia' - crystal-clear freshwater lake",
    longDescription:
      "Known as the 'Switzerland of Mongolia,' Khuvsgul Lake is one of the world's largest and oldest freshwater lakes. Its pristine waters are so clear you can see 20 meters deep, and it contains 2% of the world's fresh water.",
    location: "Khövsgöl Province",
    coordinates: { lat: 51.2, lng: 100.1667 },
    type: ["lake", "nature"],
    difficulty: "easy",
    bestSeason: ["summer", "autumn"],
    duration: "2-5 days",
    childFriendly: true,
    temperature: "cool",
    rating: 4.9,
    reviewCount: 1247,
    images: [
      "/placeholder.svg?height=300&width=400&text=Khuvsgul+Lake",
      "/placeholder.svg?height=300&width=400&text=Blue+Waters",
      "/placeholder.svg?height=300&width=400&text=Horseback+Riding",
    ],
    activities: ["Horseback riding", "Boat tours", "Fishing", "Camping", "Photography"],
    unesco: false,
    nearbyAttractions: ["Tsaatan Reindeer Herders", "Darkhad Valley"],
    nearbyCamps: [
      { name: "Khuvsgul Lake Camp", price: 150, rating: 4.6, distance: "0 km" },
      { name: "Blue Pearl Ger Camp", price: 120, rating: 4.4, distance: "5 km" },
    ],
    tips: "Best visited June-September. Bring warm clothes even in summer as nights can be cold.",
    transportation: "4WD vehicle recommended. Daily flights to Murun airport.",
  },
  // ... (copy all other attractions from explore-mongolia/page.tsx here) ...
]

export default function TravelRoutesPage() {
  const { t } = useTranslation()

  // Form state
  const [startDate, setStartDate] = useState("")
  const [duration, setDuration] = useState([7])
  const [travelers, setTravelers] = useState(2)
  const [withChildren, setWithChildren] = useState(false)
  const [includeScenic, setIncludeScenic] = useState(true)
  const [routeConditions, setRouteConditions] = useState("scenic")
  const [routeType, setRouteType] = useState("driving-car") // default: Засмал зам
  const [routePolyline, setRoutePolyline] = useState<[number, number][]>([])
  const [routeLoading, setRouteLoading] = useState(false)
  const [routeError, setRouteError] = useState<string | null>(null)

  // Planning state
  const [isPlanning, setIsPlanning] = useState(false)
  const [travelPlan, setTravelPlan] = useState<TravelPlan | null>(null)
  const [selectedSegment, setSelectedSegment] = useState<RouteSegment | null>(null)
  const [activeTab, setActiveTab] = useState("planner")

  // Floating camp icon button state
  const [campModalOpen, setCampModalOpen] = useState(false)
  const [mapCenter, setMapCenter] = useState<[number, number]>([47.5, 105])
  const [selectedCampIndex, setSelectedCampIndex] = useState<number | null>(null)
  const mapRef = useRef<any>(null)

  // Mock data for demonstration
  const mockRouteSegments: RouteSegment[] = [
    {
      id: "1",
      day: 1,
      location: "Ulaanbaatar",
      coordinates: { lat: 47.8864, lng: 106.9057 },
      type: "landmark",
      name: "Ulaanbaatar City Center",
      description: "Mongolia's capital city with museums and cultural sites",
      duration: 4,
      activities: ["City Tour", "Museums", "Shopping"],
      cost: 80,
      rating: 4.3,
      image: "/placeholder.svg?height=200&width=300&text=Ulaanbaatar",
      travelTime: 0,
      distance: 0,
      amenities: ["Hotels", "Restaurants", "ATM", "Hospital"],
      childFriendly: true,
    },
    {
      id: "2",
      day: 2,
      location: "Terelj National Park",
      coordinates: { lat: 47.9833, lng: 107.4667 },
      type: "scenic",
      name: "Terelj National Park",
      description: "Beautiful rock formations and traditional ger camps",
      duration: 8,
      activities: ["Hiking", "Rock Climbing", "Horseback Riding"],
      cost: 120,
      rating: 4.7,
      image: "/placeholder.svg?height=200&width=300&text=Terelj+Park",
      travelTime: 2,
      distance: 70,
      amenities: ["Ger Camps", "Restaurant", "Guides"],
      childFriendly: true,
    },
    {
      id: "3",
      day: 3,
      location: "Khuvsgul Lake",
      coordinates: { lat: 50.4265, lng: 100.1629 },
      type: "scenic",
      name: "Khuvsgul Lake",
      description: "Mongolia's pristine blue pearl",
      duration: 12,
      activities: ["Boating", "Fishing", "Swimming"],
      cost: 200,
      rating: 4.9,
      image: "/placeholder.svg?height=200&width=300&text=Khuvsgul+Lake",
      travelTime: 6,
      distance: 450,
      amenities: ["Lakeside Camps", "Boat Rental", "Restaurant"],
      childFriendly: true,
    },
    {
      id: "4",
      day: 5,
      location: "Orkhon Valley",
      coordinates: { lat: 47.0667, lng: 102.8333 },
      type: "landmark",
      name: "Orkhon Valley",
      description: "UNESCO World Heritage site with waterfalls",
      duration: 10,
      activities: ["Waterfall Hiking", "Historical Sites", "Photography"],
      cost: 150,
      rating: 4.6,
      image: "/placeholder.svg?height=200&width=300&text=Orkhon+Valley",
      travelTime: 4,
      distance: 280,
      amenities: ["Ger Camps", "Guides", "Restaurant"],
      childFriendly: false,
    },
  ]

  const generateTravelPlan = async () => {
    setIsPlanning(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Generate plan based on inputs
    const filteredSegments = mockRouteSegments.filter((segment) => {
      if (withChildren && !segment.childFriendly) return false
      if (!includeScenic && segment.type === "scenic") return false
      return true
    })

    const plan: TravelPlan = {
      id: Date.now().toString(),
      title: `${duration[0]}-Day Mongolia Adventure`,
      startDate,
      duration: duration[0],
      travelers,
      withChildren,
      includeScenic,
      totalDistance: filteredSegments.reduce((sum, seg) => sum + seg.distance, 0),
      estimatedCost: filteredSegments.reduce((sum, seg) => sum + seg.cost, 0) * travelers,
      route: filteredSegments.slice(0, duration[0]),
      warnings: [
        ...(withChildren ? ["Some routes may be challenging with young children"] : []),
        "Weather conditions can change rapidly in mountainous areas",
        "Fuel stations are limited in remote areas",
      ],
      alternatives: [
        {
          id: "alt1",
          reason: "Weather conditions",
          description: "Alternative route via southern valleys if northern passes are blocked",
          additionalTime: 2,
          additionalCost: 50,
        },
      ],
    }

    setTravelPlan(plan)
    setIsPlanning(false)
    setActiveTab("itinerary")
  }

  const canGenerate = startDate && duration[0] > 0 && travelers > 0

  const getSegmentIcon = (type: string) => {
    switch (type) {
      case "camp":
        return <Bed className="w-4 h-4" />
      case "scenic":
        return <Camera className="w-4 h-4" />
      case "landmark":
        return <Mountain className="w-4 h-4" />
      case "rest":
        return <Utensils className="w-4 h-4" />
      case "fuel":
        return <Fuel className="w-4 h-4" />
      default:
        return <MapPin className="w-4 h-4" />
    }
  }

  const getSegmentColor = (type: string) => {
    switch (type) {
      case "camp":
        return "bg-emerald-500"
      case "scenic":
        return "bg-blue-500"
      case "landmark":
        return "bg-purple-500"
      case "rest":
        return "bg-orange-500"
      case "fuel":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  // Fetch route polyline from proxy when travelPlan or routeType changes
  useEffect(() => {
    const fetchRoute = async () => {
      if (!travelPlan || travelPlan.route.length < 2) return
      setRouteLoading(true)
      setRouteError(null)
      try {
        const coordinates = travelPlan.route.map(seg => [seg.coordinates.lng, seg.coordinates.lat])
        const res = await fetch("http://localhost:4000/api/directions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ coordinates, profile: routeType }),
        })
        if (!res.ok) throw new Error("Маршрут татахад алдаа гарлаа")
        const data = await res.json()
        // GeoJSON polyline
        const poly = data.features[0].geometry.coordinates.map((c: number[]) => [c[1], c[0]])
        setRoutePolyline(poly)
      } catch (e: any) {
        setRouteError(e.message || "Маршрут татахад алдаа гарлаа")
        setRoutePolyline([])
      } finally {
        setRouteLoading(false)
      }
    }
    fetchRoute()
  }, [travelPlan, routeType])

  // Helper: Aggregate all camps from mongoliaAttractions
  const allCamps = mongoliaAttractions.flatMap((attr: any) =>
    (attr.nearbyCamps || []).map((camp: any, i: number) => ({
      ...camp,
      parent: attr.mongolianName,
      location: attr.location,
      coordinates: {
        lat: attr.coordinates.lat + 0.03 * Math.cos(i * 2 * Math.PI / (attr.nearbyCamps.length || 1)),
        lng: attr.coordinates.lng + 0.03 * Math.sin(i * 2 * Math.PI / (attr.nearbyCamps.length || 1)),
      },
    }))
  )

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 font-display">{t("travel.title")}</h1>
          <p className="text-sm sm:text-base text-gray-600 font-medium">{t("travel.subtitle")}</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="planner" className="font-semibold">Аяллын төлөвлөлт</TabsTrigger>
            <TabsTrigger value="itinerary" className="font-semibold">Маршрут</TabsTrigger>
            <TabsTrigger value="map" className="font-semibold">Газрын зураг</TabsTrigger>
          </TabsList>

          {/* Route Planner Tab */}
          <TabsContent value="planner" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {/* Planning Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center font-bold">
                    <Route className="w-5 h-5 mr-2" />
                    Аяллын төлөвлөгөө гаргах
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Эхлэх огноо
                    </label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="font-medium"
                    />
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Үргэлжлэх хугацаа: {duration[0]} өдөр
                    </label>
                    <Slider value={duration} onValueChange={setDuration} max={21} min={3} step={1} className="w-full" />
                    <div className="flex justify-between text-xs text-gray-500 mt-1 font-medium">
                      <span>3 өдөр</span>
                      <span>21 өдөр</span>
                    </div>
                  </div>

                  {/* Number of Travelers */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Users className="w-4 h-4 inline mr-2" />
                      Хамт явах хүмүүс
                    </label>
                    <Select
                      value={travelers.toString()}
                      onValueChange={(value) => setTravelers(Number.parseInt(value))}
                    >
                      <SelectTrigger className="font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} {num === 1 ? "хүн" : "хүн"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Travel with Children */}
                  <div className="flex items-center space-x-2">
                    <Checkbox id="children" checked={withChildren} onCheckedChange={checked => setWithChildren(checked === true)} />
                    <label htmlFor="children" className="text-sm flex items-center cursor-pointer font-semibold">
                      <Baby className="w-4 h-4 mr-2" />
                      Хүүхэдтэй аялж байна
                    </label>
                  </div>

                  {/* Route Conditions */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Аяллын сонголт</label>
                    <Select value={routeConditions} onValueChange={setRouteConditions}>
                      <SelectTrigger className="font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scenic">Байгалийн үзэсгэлэнт</SelectItem>
                        <SelectItem value="landmarks">Түүхэн дурсгалт</SelectItem>
                        <SelectItem value="fastest">Хамгийн хурдан</SelectItem>
                        <SelectItem value="cultural">Соёлын аялал</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Include Scenic Spots */}
                  <div className="flex items-center space-x-2">
                    <Checkbox id="scenic" checked={includeScenic} onCheckedChange={checked => setIncludeScenic(checked === true)} />
                    <label htmlFor="scenic" className="text-sm flex items-center cursor-pointer font-semibold">
                      <Mountain className="w-4 h-4 mr-2" />
                      Байгалийн үзэсгэлэнт газруудыг багтаах
                    </label>
                  </div>

                  {/* Route Type Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Замын төрөл</label>
                    <Select value={routeType} onValueChange={setRouteType}>
                      <SelectTrigger className="font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="driving-car">Засмал зам (машин)</SelectItem>
                        <SelectItem value="driving-hgv">Ачааны машин</SelectItem>
                        <SelectItem value="cycling-regular">Дугуй</SelectItem>
                        <SelectItem value="foot-walking">Явган</SelectItem>
                        <SelectItem value="foot-hiking">Явган аялал</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={generateTravelPlan}
                    disabled={!canGenerate || isPlanning}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 font-semibold"
                  >
                    {isPlanning ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Төлөвлөж байна...
                      </>
                    ) : (
                      <>
                        <Navigation className="w-4 h-4 mr-2" />
                        Төлөвлөгөө гаргах
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Preview/Instructions */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-bold">Хэрхэн ажилладаг вэ?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-sm font-bold">
                        1
                      </div>
                      <div>
                        <h4 className="font-semibold">Алхам 1</h4>
                        <p className="text-sm text-gray-600 font-medium">
                          Аяллын мэдээллээ оруулна
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-sm font-bold">
                        2
                      </div>
                      <div>
                        <h4 className="font-semibold">Алхам 2</h4>
                        <p className="text-sm text-gray-600 font-medium">
                          Тохирох маршрут автоматаар үүснэ
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-sm font-bold">
                        3
                      </div>
                      <div>
                        <h4 className="font-semibold">Алхам 3</h4>
                        <p className="text-sm text-gray-600 font-medium">
                          Маршрутаа хянаж, өөрчлөлт оруулна
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-sm font-bold">
                        4
                      </div>
                      <div>
                        <h4 className="font-semibold">Алхам 4</h4>
                        <p className="text-sm text-gray-600 font-medium">
                          Аяллаа баталгаажуулж захиална
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Аюулгүй байдлын боломжууд</h4>
                    <ul className="text-sm text-blue-800 space-y-1 font-medium">
                      <li>• Цаг агаарын мэдээлэл</li>
                      <li>• Замын нөхцөл шинэчлэлт</li>
                      <li>• Орлох маршрут санал болгох</li>
                      <li>• Хүүхдэд ээлтэй маршрут</li>
                      <li>• Яаралтай тусламжийн цэгүүд</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Travel Itinerary Tab */}
          <TabsContent value="itinerary" className="space-y-6">
            {!travelPlan ? (
              <Card className="h-96 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Route className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Маршрут үүсээгүй байна</h3>
                  <p className="text-sm font-medium">Аяллын төлөвлөлт хэсгийг ашиглана уу</p>
                </div>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Plan Header */}
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-4">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 font-display">
                          {travelPlan.title}
                        </h2>
                        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span className="font-medium">{travelPlan.startDate}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            <span className="font-medium">{travelPlan.duration} өдөр</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            <span className="font-medium">{travelPlan.travelers} хүн</span>
                          </div>
                          <div className="flex items-center">
                            <Navigation className="w-4 h-4 mr-1" />
                            <span className="font-medium">{travelPlan.totalDistance} км</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <div className="text-xl sm:text-2xl font-bold text-emerald-600">
                          ${travelPlan.estimatedCost}
                        </div>
                        <div className="text-sm text-gray-600 font-medium">Нийт зардал</div>
                      </div>
                    </div>

                    {/* Warnings */}
                    {travelPlan.warnings.length > 0 && (
                      <Alert className="mb-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="space-y-1 font-medium">
                            {travelPlan.warnings.map((warning, index) => (
                              <div key={index}>• {warning}</div>
                            ))}
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 font-semibold">
                        <Download className="w-4 h-4 mr-2" />
                        Татах
                      </Button>
                      <Button size="sm" variant="outline" className="font-semibold bg-transparent">
                        <Share2 className="w-4 h-4 mr-2" />
                        Хуваалцах
                      </Button>
                      <Button size="sm" variant="outline" className="font-semibold bg-transparent">
                        Бүгдийг захиалах
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Route Timeline */}
                <div className="space-y-4">
                  {travelPlan.route.map((segment, index) => (
                    <Card key={segment.id} className="overflow-hidden">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4">
                          {/* Day Number */}
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                              <span className="text-emerald-600 font-bold text-sm">Өдөр {segment.day}</span>
                            </div>
                          </div>

                          {/* Segment Image */}
                          <div className="flex-shrink-0 w-full sm:w-auto">
                            <img
                              src={segment.image || "/placeholder.svg"}
                              alt={segment.name}
                              className="w-full sm:w-24 h-32 sm:h-24 rounded-lg object-cover"
                            />
                          </div>

                          {/* Segment Details */}
                          <div className="flex-1 w-full">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2 gap-2">
                              <div className="flex-1">
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900">{segment.name}</h3>
                                <div className="flex items-center text-gray-600 mt-1">
                                  <MapPin className="w-4 h-4 mr-1" />
                                  <span className="text-sm font-medium">{segment.location}</span>
                                </div>
                              </div>
                              <div className="text-left sm:text-right">
                                <div className="flex items-center sm:justify-end">
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                                  <span className="text-sm font-semibold">{segment.rating}</span>
                                </div>
                                <div className="text-lg font-bold text-emerald-600">${segment.cost}</div>
                              </div>
                            </div>

                            <p className="text-gray-600 mb-3 font-medium">{segment.description}</p>

                            {/* Travel Info */}
                            {segment.travelTime > 0 && (
                              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                                <div className="flex items-center">
                                  <Clock className="w-4 h-4 mr-1" />
                                  <span className="font-medium">{segment.travelTime}h {t("travel.travel")}</span>
                                </div>
                                <div className="flex items-center">
                                  <Navigation className="w-4 h-4 mr-1" />
                                  <span className="font-medium">{segment.distance} км</span>
                                </div>
                                <div className="flex items-center">
                                  {getSegmentIcon(segment.type)}
                                  <span className="ml-1 capitalize font-medium">{segment.type}</span>
                                </div>
                              </div>
                            )}

                            {/* Activities */}
                            <div className="flex flex-wrap gap-2 mb-3">
                              {segment.activities.map((activity, actIndex) => (
                                <Badge key={actIndex} variant="secondary" className="text-xs font-medium">
                                  {activity}
                                </Badge>
                              ))}
                            </div>

                            {/* Amenities */}
                            <div className="flex flex-wrap gap-2">
                              {segment.amenities.map((amenity, amenityIndex) => (
                                <Badge key={amenityIndex} variant="outline" className="text-xs font-medium">
                                  {amenity}
                                </Badge>
                              ))}
                              {segment.childFriendly && (
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-green-50 text-green-700 border-green-200 font-medium"
                                >
                                  <Baby className="w-3 h-3 mr-1" />
                                  Хүүхдэд ээлтэй
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Alternative Routes */}
                {travelPlan.alternatives.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="font-bold">Орлох маршрут санал болгох</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {travelPlan.alternatives.map((alt) => (
                          <div key={alt.id} className="p-4 border rounded-lg">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                              <div className="flex-1">
                                <h4 className="font-semibold">{alt.reason}</h4>
                                <p className="text-sm text-gray-600 font-medium">{alt.description}</p>
                              </div>
                              <div className="text-left sm:text-right text-sm font-medium">
                                <div>+{alt.additionalTime}h</div>
                                <div>+${alt.additionalCost}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          {/* Interactive Map Tab */}
          <TabsContent value="map" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Map */}
              <div className="lg:col-span-3">
                <Card>
                  <CardContent className="p-0">
                    <div className="relative h-80 sm:h-96 lg:h-[600px] rounded-lg overflow-hidden mb-8 shadow">
                      {/* Floating camp icon button */}
                      <button
                        className="absolute top-4 right-4 z-[1100] bg-white rounded-full shadow p-2 border border-gray-200 hover:bg-emerald-50 transition"
                        onClick={() => setCampModalOpen(true)}
                        title="Бүх баазуудыг харах"
                      >
                        <Home className="w-6 h-6 text-emerald-700" />
                      </button>
                      {/* Camp list modal */}
                      <Dialog open={campModalOpen} onOpenChange={setCampModalOpen}>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Бүх баазууд</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-2 max-h-96 overflow-y-auto">
                            {allCamps.map((camp: any, i: number) => (
                              <div
                                key={camp.name + i}
                                className="flex items-center justify-between p-2 rounded hover:bg-emerald-50 cursor-pointer"
                                onClick={() => {
                                  setMapCenter([camp.coordinates.lat, camp.coordinates.lng])
                                  setSelectedCampIndex(i)
                                  setCampModalOpen(false)
                                  setTimeout(() => setSelectedCampIndex(null), 2000)
                                }}
                              >
                                <div>
                                  <div className="font-bold">{camp.name}</div>
                                  <div className="text-xs text-gray-500">{camp.parent} — {camp.location}</div>
                                </div>
                                <div className="flex items-center">
                                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                                  <span className="font-semibold">{camp.rating}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>
                      <MapContainer
                        center={mapCenter}
                        zoom={5}
                        style={{ height: "100%", width: "100%" }}
                        scrollWheelZoom={true}
                        whenCreated={mapInstance => (mapRef.current = mapInstance)}
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        {routeLoading && (
                          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/80 px-4 py-2 rounded shadow text-emerald-700 font-semibold z-[1000]">
                            Маршрут татаж байна...
                          </div>
                        )}
                        {routeError && (
                          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-100 px-4 py-2 rounded shadow text-red-700 font-semibold z-[1000]">
                            {routeError}
                          </div>
                        )}
                        {routePolyline.length > 1 && (
                          <Polyline positions={routePolyline} pathOptions={{ color: "#10b981", weight: 5 }} />
                        )}
                        {travelPlan && travelPlan.route.map((segment, index) => (
                          <Marker
                            key={segment.id}
                            position={[segment.coordinates.lat, segment.coordinates.lng]}
                            eventHandlers={{ click: () => setSelectedSegment(segment) }}
                          >
                            <Popup>
                              <div>
                                <div className="font-bold mb-1">{segment.name}</div>
                                <div className="text-xs text-gray-600 mb-1">{segment.location}</div>
                                <div className="text-xs">Өдөр {segment.day}</div>
                              </div>
                            </Popup>
                          </Marker>
                        ))}
                        {/* Show all camps as markers */}
                        {allCamps.map((camp: any, i: number) => (
                          <Marker key={camp.name + i} position={[camp.coordinates.lat, camp.coordinates.lng]}>
                            <Popup autoOpen={selectedCampIndex === i}>
                              <div>
                                <div className="flex items-center mb-1">
                                  <Home className="w-4 h-4 mr-1 text-emerald-600" />
                                  <span className="font-bold">{camp.name}</span>
                                </div>
                                <div className="text-xs text-gray-600 mb-1">{camp.parent} — {camp.location}</div>
                                <div className="flex items-center text-sm mb-1">
                                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                                  <span className="font-semibold">{camp.rating}</span>
                                </div>
                                <div className="text-sm font-bold text-emerald-700 mb-1">{camp.price ? `$${camp.price}/шөнө` : ""}</div>
                              </div>
                            </Popup>
                          </Marker>
                        ))}
                      </MapContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Selected Segment Details */}
              <div className="lg:col-span-1">
                {selectedSegment ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base sm:text-lg font-bold">Өдөр {selectedSegment.day}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <img
                        src={selectedSegment.image || "/placeholder.svg"}
                        alt={selectedSegment.name}
                        className="w-full h-32 object-cover rounded-lg mb-4"
                      />
                      <h3 className="font-bold mb-2">{selectedSegment.name}</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="font-medium">{selectedSegment.location}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="font-medium">{selectedSegment.duration}h {t("travel.duration")}</span>
                        </div>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-2 text-yellow-400 fill-current" />
                          <span className="font-medium">{selectedSegment.rating} {t("travel.rating")}</span>
                        </div>
                        {selectedSegment.travelTime > 0 && (
                          <div className="flex items-center">
                            <Navigation className="w-4 h-4 mr-2 text-gray-500" />
                            <span className="font-medium">
                              {selectedSegment.travelTime}h {t("travel.travel")}, {selectedSegment.distance} км
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-3 font-medium">{selectedSegment.description}</p>
                      <div className="mt-4">
                        <div className="text-lg font-bold text-emerald-600">${selectedSegment.cost}</div>
                        <Button size="sm" className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 font-semibold">
                          {t("travel.book_now")}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600 font-medium">Газрын зураг тайлбар</p>
                    </CardContent>
                  </Card>
                )}

                {/* Map Legend */}
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg font-bold">Газрын зураг тайлбар</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-emerald-500 rounded-full mr-2"></div>
                        <span className="font-medium">Кемп</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
                        <span className="font-medium">Байгалийн үзэсгэлэнт</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-purple-500 rounded-full mr-2"></div>
                        <span className="font-medium">Түүхэн дурсгалт</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-orange-500 rounded-full mr-2"></div>
                        <span className="font-medium">Амралтын цэг</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                        <span className="font-medium">Шатахуун</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
