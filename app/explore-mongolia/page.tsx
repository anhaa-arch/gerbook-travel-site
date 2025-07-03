"use client"

import { useState, useMemo, useRef } from "react"
import { useTranslation } from "react-i18next"
import {
  MapPin,
  Calendar,
  Users,
  Thermometer,
  Mountain,
  Waves,
  TreePine,
  Sun,
  Snowflake,
  Search,
  Filter,
  Star,
  Clock,
  Camera,
  Heart,
  Share2,
  Navigation,
  Award,
  Info,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import "../../lib/i18n"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { useRouter } from "next/navigation"

// Mongolia's Natural Attractions Database
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
  {
    id: 2,
    name: "Gobi Desert",
    mongolianName: "Говь",
    description: "Vast desert with sand dunes, dinosaur fossils, and unique wildlife",
    longDescription:
      "The Gobi Desert spans across southern Mongolia and northern China. Famous for its dinosaur fossils, the Flaming Cliffs, and the singing sand dunes of Khongoryn Els.",
    location: "Ömnögovi Province",
    coordinates: { lat: 43.5, lng: 104.0 },
    type: ["desert", "geological"],
    difficulty: "challenging",
    bestSeason: ["spring", "autumn"],
    duration: "3-7 days",
    childFriendly: false,
    temperature: "hot",
    rating: 4.7,
    reviewCount: 892,
    images: [
      "/placeholder.svg?height=300&width=400&text=Gobi+Desert",
      "/placeholder.svg?height=300&width=400&text=Sand+Dunes",
      "/placeholder.svg?height=300&width=400&text=Camel+Riding",
    ],
    activities: ["Camel riding", "Fossil hunting", "Sand dune climbing", "Stargazing", "Photography"],
    unesco: false,
    nearbyAttractions: ["Flaming Cliffs", "Khongoryn Els", "Yolyn Am"],
    nearbyCamps: [
      { name: "Gobi Desert Camp", price: 180, rating: 4.5, distance: "0 km" },
      { name: "Three Camel Lodge", price: 250, rating: 4.8, distance: "15 km" },
    ],
    tips: "Extreme temperature variations. Bring sun protection and warm clothes for nights.",
    transportation: "4WD essential. Domestic flights to Dalanzadgad available.",
  },
  {
    id: 3,
    name: "Uvs Lake",
    mongolianName: "Увс нуур",
    description: "UNESCO World Heritage site with unique ecosystem",
    longDescription:
      "Uvs Lake is Mongolia's largest lake and a UNESCO World Heritage site. It's a closed basin with both freshwater and saltwater areas, supporting diverse wildlife including snow leopards and argali sheep.",
    location: "Uvs Province",
    coordinates: { lat: 50.3167, lng: 92.7167 },
    type: ["lake", "wildlife"],
    difficulty: "moderate",
    bestSeason: ["summer", "autumn"],
    duration: "2-4 days",
    childFriendly: true,
    temperature: "moderate",
    rating: 4.6,
    reviewCount: 456,
    images: [
      "/placeholder.svg?height=300&width=400&text=Uvs+Lake",
      "/placeholder.svg?height=300&width=400&text=Wildlife",
      "/placeholder.svg?height=300&width=400&text=Sunset",
    ],
    activities: ["Bird watching", "Wildlife photography", "Hiking", "Cultural tours"],
    unesco: true,
    nearbyAttractions: ["Altai Mountains", "Kazakh Eagle Hunters"],
    nearbyCamps: [{ name: "Uvs Lake Eco Camp", price: 140, rating: 4.3, distance: "2 km" }],
    tips: "UNESCO site with strict conservation rules. Best for wildlife enthusiasts.",
    transportation: "Long drive from Ulaanbaatar. Charter flights available.",
  },
  {
    id: 4,
    name: "Khermen Tsav",
    mongolianName: "Хэрмэн цав",
    description: "Mongolia's Grand Canyon with dramatic red cliffs",
    longDescription:
      "Known as Mongolia's Grand Canyon, Khermen Tsav features dramatic red sandstone cliffs and canyons. It's a paleontological treasure trove with numerous dinosaur fossils.",
    location: "Ömnögovi Province",
    coordinates: { lat: 43.25, lng: 108.5 },
    type: ["geological", "canyon"],
    difficulty: "challenging",
    bestSeason: ["spring", "autumn"],
    duration: "2-3 days",
    childFriendly: false,
    temperature: "hot",
    rating: 4.8,
    reviewCount: 234,
    images: [
      "/placeholder.svg?height=300&width=400&text=Red+Canyon",
      "/placeholder.svg?height=300&width=400&text=Rock+Formations",
      "/placeholder.svg?height=300&width=400&text=Fossils",
    ],
    activities: ["Hiking", "Rock climbing", "Fossil hunting", "Photography", "Geology tours"],
    unesco: false,
    nearbyAttractions: ["Gobi Desert", "Nemegt Formation"],
    nearbyCamps: [{ name: "Canyon Explorer Camp", price: 160, rating: 4.4, distance: "10 km" }],
    tips: "Remote location requires experienced guide. Bring plenty of water.",
    transportation: "4WD essential. Very remote, requires careful planning.",
  },
  {
    id: 5,
    name: "Orkhon Valley",
    mongolianName: "Орхон хөндий",
    description: "UNESCO World Heritage cultural landscape",
    longDescription:
      "The Orkhon Valley is a UNESCO World Heritage site representing the evolution of nomadic pastoral traditions spanning more than two millennia. Features the beautiful Orkhon Waterfall.",
    location: "Övörkhangai Province",
    coordinates: { lat: 47.0556, lng: 102.8417 },
    type: ["cultural", "valley", "waterfall"],
    difficulty: "easy",
    bestSeason: ["summer", "autumn"],
    duration: "2-4 days",
    childFriendly: true,
    temperature: "moderate",
    rating: 4.7,
    reviewCount: 678,
    images: [
      "/placeholder.svg?height=300&width=400&text=Orkhon+Valley",
      "/placeholder.svg?height=300&width=400&text=Waterfall",
      "/placeholder.svg?height=300&width=400&text=Nomadic+Life",
    ],
    activities: ["Hiking", "Horseback riding", "Cultural tours", "Photography", "Waterfall viewing"],
    unesco: true,
    nearbyAttractions: ["Karakorum", "Erdene Zuu Monastery"],
    nearbyCamps: [
      { name: "Orkhon Valley Camp", price: 130, rating: 4.5, distance: "1 km" },
      { name: "Waterfall Ger Camp", price: 110, rating: 4.2, distance: "3 km" },
    ],
    tips: "Perfect for families. Combine with historical sites in Karakorum.",
    transportation: "Accessible by regular vehicle. 6-hour drive from Ulaanbaatar.",
  },
  {
    id: 6,
    name: "Amarbayasgalant Monastery",
    mongolianName: "Амарбаясгалант хийд",
    description: "Important Buddhist heritage site in pristine valley",
    longDescription:
      "One of Mongolia's three largest Buddhist monasteries, Amarbayasgalant was built in the 18th century. Nestled in a pristine valley, it's an architectural masterpiece and active monastery.",
    location: "Selenge Province",
    coordinates: { lat: 49.4167, lng: 106.2167 },
    type: ["cultural", "religious", "valley"],
    difficulty: "easy",
    bestSeason: ["summer", "autumn"],
    duration: "1-2 days",
    childFriendly: true,
    temperature: "moderate",
    rating: 4.5,
    reviewCount: 345,
    images: [
      "/placeholder.svg?height=300&width=400&text=Monastery",
      "/placeholder.svg?height=300&width=400&text=Buddhist+Temple",
      "/placeholder.svg?height=300&width=400&text=Valley+View",
    ],
    activities: ["Temple visits", "Meditation", "Photography", "Cultural learning", "Hiking"],
    unesco: false,
    nearbyAttractions: ["Darkhan City", "Selenge River"],
    nearbyCamps: [{ name: "Monastery Guesthouse", price: 80, rating: 4.1, distance: "0.5 km" }],
    tips: "Respect monastery rules. Early morning prayers are particularly beautiful.",
    transportation: "Good road access. 4-hour drive from Ulaanbaatar.",
  },
  {
    id: 7,
    name: "Yolyn Am",
    mongolianName: "Ёлын ам",
    description: "Ice canyon in the Gobi Desert with diverse wildlife",
    longDescription:
      "Yolyn Am (Eagle Valley) is a remarkable ice canyon in the Gobi Desert that stays frozen until July. Despite being in the desert, it supports diverse wildlife and has a unique microclimate.",
    location: "Ömnögovi Province",
    coordinates: { lat: 43.4667, lng: 104.0667 },
    type: ["canyon", "wildlife", "geological"],
    difficulty: "moderate",
    bestSeason: ["summer", "autumn"],
    duration: "1-2 days",
    childFriendly: true,
    temperature: "cool",
    rating: 4.6,
    reviewCount: 567,
    images: [
      "/placeholder.svg?height=300&width=400&text=Ice+Canyon",
      "/placeholder.svg?height=300&width=400&text=Wildlife",
      "/placeholder.svg?height=300&width=400&text=Desert+Oasis",
    ],
    activities: ["Hiking", "Wildlife watching", "Photography", "Ice walking", "Bird watching"],
    unesco: false,
    nearbyAttractions: ["Gobi Desert", "Khongoryn Els"],
    nearbyCamps: [{ name: "Eagle Valley Camp", price: 140, rating: 4.3, distance: "5 km" }],
    tips: "Bring warm clothes even in summer. Ice formations best seen in early summer.",
    transportation: "Part of Gobi Desert circuit. 4WD recommended.",
  },
  {
    id: 8,
    name: "Khustai National Park",
    mongolianName: "Хустайн байгалийн цогцолборт газар",
    description: "Home of the wild takhi horses (Przewalski's horses)",
    longDescription:
      "Khustai National Park is famous for the successful reintroduction of takhi (Przewalski's horses), the world's last truly wild horses. The park also supports diverse steppe wildlife.",
    location: "Töv Province",
    coordinates: { lat: 47.75, lng: 106.25 },
    type: ["wildlife", "steppe", "conservation"],
    difficulty: "easy",
    bestSeason: ["summer", "autumn"],
    duration: "1-2 days",
    childFriendly: true,
    temperature: "moderate",
    rating: 4.4,
    reviewCount: 423,
    images: [
      "/placeholder.svg?height=300&width=400&text=Wild+Horses",
      "/placeholder.svg?height=300&width=400&text=Steppe+Landscape",
      "/placeholder.svg?height=300&width=400&text=Wildlife",
    ],
    activities: ["Wildlife watching", "Photography", "Hiking", "Educational tours", "Horseback riding"],
    unesco: false,
    nearbyAttractions: ["Ulaanbaatar", "Terelj National Park"],
    nearbyCamps: [{ name: "Khustai Ger Camp", price: 100, rating: 4.2, distance: "2 km" }],
    tips: "Best horse viewing at dawn and dusk. Visitor center has excellent exhibits.",
    transportation: "2-hour drive from Ulaanbaatar. Good road access.",
  },
  {
    id: 9,
    name: "Terelj National Park",
    mongolianName: "Горхи-Тэрэлж байгалийн цогцолборт газар",
    description: "Scenic granite formations close to Ulaanbaatar",
    longDescription:
      "Gorkhi-Terelj National Park features spectacular granite rock formations, alpine scenery, and is easily accessible from Ulaanbaatar. Famous for Turtle Rock and the Aryabal Meditation Temple.",
    location: "Töv Province",
    coordinates: { lat: 47.9167, lng: 107.4167 },
    type: ["mountains", "granite", "forest"],
    difficulty: "easy",
    bestSeason: ["summer", "autumn"],
    duration: "1-3 days",
    childFriendly: true,
    temperature: "moderate",
    rating: 4.3,
    reviewCount: 789,
    images: [
      "/placeholder.svg?height=300&width=400&text=Granite+Rocks",
      "/placeholder.svg?height=300&width=400&text=Turtle+Rock",
      "/placeholder.svg?height=300&width=400&text=Alpine+Scenery",
    ],
    activities: ["Hiking", "Rock climbing", "Horseback riding", "Photography", "Temple visits"],
    unesco: false,
    nearbyAttractions: ["Chinggis Khaan Statue", "Ulaanbaatar"],
    nearbyCamps: [
      { name: "Terelj Lodge", price: 120, rating: 4.4, distance: "1 km" },
      { name: "Granite Rock Camp", price: 90, rating: 4.1, distance: "3 km" },
    ],
    tips: "Perfect for day trips from Ulaanbaatar. Don't miss the meditation temple hike.",
    transportation: "1.5-hour drive from Ulaanbaatar. Paved road access.",
  },
]

export default function ExploreMongoliaPage() {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedDifficulty, setSelectedDifficulty] = useState<string[]>([])
  const [selectedSeason, setSelectedSeason] = useState<string[]>([])
  const [childFriendlyOnly, setChildFriendlyOnly] = useState(false)
  const [temperaturePreference, setTemperaturePreference] = useState<string[]>([])
  const [durationRange, setDurationRange] = useState([1, 7])
  const [durationType, setDurationType] = useState("days")
  const [selectedAttraction, setSelectedAttraction] = useState<any>(null)
  const [showFilters, setShowFilters] = useState(false)
  const mapSectionRef = useRef<HTMLDivElement>(null)
  const [highlightedId, setHighlightedId] = useState<number | null>(null)
  const router = useRouter()

  // Convert duration to days for filtering
  const convertDurationToDays = (duration: number, type: string) => {
    switch (type) {
      case "weeks":
        return duration * 7
      case "months":
        return duration * 30
      default:
        return duration
    }
  }

  const filteredAttractions = useMemo(() => {
    return mongoliaAttractions.filter((attraction) => {
      // Search filter
      if (
        searchTerm &&
        !attraction.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !attraction.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !attraction.location.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false
      }

      // Type filter
      if (selectedTypes.length > 0 && !selectedTypes.some((type) => attraction.type.includes(type))) {
        return false
      }

      // Difficulty filter
      if (selectedDifficulty.length > 0 && !selectedDifficulty.includes(attraction.difficulty)) {
        return false
      }

      // Season filter
      if (selectedSeason.length > 0 && !selectedSeason.some((season) => attraction.bestSeason.includes(season))) {
        return false
      }

      // Child friendly filter
      if (childFriendlyOnly && !attraction.childFriendly) {
        return false
      }

      // Temperature filter
      if (temperaturePreference.length > 0 && !temperaturePreference.includes(attraction.temperature)) {
        return false
      }

      // Duration filter (convert attraction duration to days for comparison)
      const attractionDays = Number.parseInt(attraction.duration.split("-")[1] || attraction.duration.split("-")[0])
      const minDays = convertDurationToDays(durationRange[0], durationType)
      const maxDays = convertDurationToDays(durationRange[1], durationType)

      if (attractionDays < minDays || attractionDays > maxDays) {
        return false
      }

      return true
    })
  }, [
    searchTerm,
    selectedTypes,
    selectedDifficulty,
    selectedSeason,
    childFriendlyOnly,
    temperaturePreference,
    durationRange,
    durationType,
  ])

  const handleTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setSelectedTypes([...selectedTypes, type])
    } else {
      setSelectedTypes(selectedTypes.filter((t) => t !== type))
    }
  }

  const handleDifficultyChange = (difficulty: string, checked: boolean) => {
    if (checked) {
      setSelectedDifficulty([...selectedDifficulty, difficulty])
    } else {
      setSelectedDifficulty(selectedDifficulty.filter((d) => d !== difficulty))
    }
  }

  const handleSeasonChange = (season: string, checked: boolean) => {
    if (checked) {
      setSelectedSeason([...selectedSeason, season])
    } else {
      setSelectedSeason(selectedSeason.filter((s) => s !== season))
    }
  }

  const handleTemperatureChange = (temp: string, checked: boolean) => {
    if (checked) {
      setTemperaturePreference([...temperaturePreference, temp])
    } else {
      setTemperaturePreference(temperaturePreference.filter((t) => t !== temp))
    }
  }

  const clearAllFilters = () => {
    setSearchTerm("")
    setSelectedTypes([])
    setSelectedDifficulty([])
    setSelectedSeason([])
    setChildFriendlyOnly(false)
    setTemperaturePreference([])
    setDurationRange([1, 7])
    setDurationType("days")
  }

  const getDurationRangeForType = (type: string) => {
    switch (type) {
      case "weeks":
        return { min: 1, max: 12, step: 1 }
      case "months":
        return { min: 1, max: 12, step: 1 }
      default:
        return { min: 1, max: 30, step: 1 }
    }
  }

  // Scroll to map and highlight marker
  const handleViewOnMap = (attraction: any) => {
    setHighlightedId(attraction.id)
    if (mapSectionRef.current) {
      mapSectionRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
    }
    setTimeout(() => setHighlightedId(null), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 font-display">
            🌄 Монгол орны байгалийн гайхамшгийг нээ
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-6 font-medium">
            Монгол орны олон янзын нуур, цөл, уул, баазуудыг судалж, өөрийн аяллын маршрутаа үүсгэн, ойролцоох баазуудыг олж мартагдашгүй адал явдалтай болоорой.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Award className="w-4 h-4 mr-1 text-emerald-600" />
              <span className="font-medium">ЮНЕСКО-гийн өв</span>
            </div>
            <div className="flex items-center">
              <Mountain className="w-4 h-4 mr-1 text-blue-600" />
              <span className="font-medium">9 гол үзвэр</span>
            </div>
            <div className="flex items-center">
              <Camera className="w-4 h-4 mr-1 text-purple-600" />
              <span className="font-medium">Гэрэл зургийн диваажин</span>
            </div>
          </div>
        </div>

        {/* Interactive Map Section */}
        <div ref={mapSectionRef} className="mb-10">
          <div className="w-full h-[400px] rounded-lg overflow-hidden shadow mb-2">
            <MapContainer center={[47.5, 105]} zoom={5} style={{ height: "100%", width: "100%" }} scrollWheelZoom={true}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {filteredAttractions.map((attraction) => (
                <Marker
                  key={attraction.id}
                  position={[attraction.coordinates.lat, attraction.coordinates.lng]}
                  eventHandlers={{ click: () => setSelectedAttraction(attraction) }}
                >
                  <Popup>
                    <div>
                      <div className="font-bold mb-1">{attraction.mongolianName}</div>
                      <div className="text-xs text-gray-600 mb-1">{attraction.location}</div>
                      <Button size="sm" className="mt-2 bg-emerald-600 hover:bg-emerald-700 font-semibold" onClick={() => setSelectedAttraction(attraction)}>
                        Дэлгэрэнгүй
                      </Button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
          <div className="text-center text-gray-600 text-sm">Газрын зураг дээр дарж үзвэрийн дэлгэрэнгүйг хараарай</div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder={t("map.search_attractions", "Үзвэр, байршил, үйл ажиллагаа хайх...")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 font-medium"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="h-12 px-6 font-medium">
                <Filter className="w-4 h-4 mr-2" />
                {t("map.filters", "Шүүлтүүр")}
                {showFilters ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
              </Button>
              {(selectedTypes.length > 0 ||
                selectedDifficulty.length > 0 ||
                selectedSeason.length > 0 ||
                childFriendlyOnly ||
                temperaturePreference.length > 0) && (
                <Button variant="ghost" onClick={clearAllFilters} className="h-12 font-medium">
                  <X className="w-4 h-4 mr-2" />
                  {t("common.clear", "Цэвэрлэх")}
                </Button>
              )}
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <Card className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Nature Types */}
                <div>
                  <Label className="text-sm font-bold mb-3 block">{t("map.nature_types", "Байгалийн төрөл")}</Label>
                  <div className="space-y-2">
                    {["lake", "desert", "mountains", "forest", "canyon", "steppe"].map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={type}
                          checked={selectedTypes.includes(type)}
                          onCheckedChange={(checked) => handleTypeChange(type, checked as boolean)}
                        />
                        <Label htmlFor={type} className="text-sm capitalize cursor-pointer font-medium">
                          {type === "lake" && "Нуур"}
                          {type === "desert" && "Цөл"}
                          {type === "mountains" && "Уул"}
                          {type === "forest" && "Ой"}
                          {type === "canyon" && "Хавцал"}
                          {type === "steppe" && "Тал"}
                          {type}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Difficulty Level */}
                <div>
                  <Label className="text-sm font-bold mb-3 block">{t("map.difficulty_level", "Хүндрэлийн түвшин")}</Label>
                  <div className="space-y-2">
                    {["easy", "moderate", "challenging", "extreme"].map((difficulty) => (
                      <div key={difficulty} className="flex items-center space-x-2">
                        <Checkbox
                          id={difficulty}
                          checked={selectedDifficulty.includes(difficulty)}
                          onCheckedChange={(checked) => handleDifficultyChange(difficulty, checked as boolean)}
                        />
                        <Label htmlFor={difficulty} className="text-sm capitalize cursor-pointer font-medium">
                          <Badge
                            variant="outline"
                            className={`mr-2 font-medium ${
                              difficulty === "extreme"
                                ? "border-red-500 text-red-600"
                                : difficulty === "challenging"
                                  ? "border-orange-500 text-orange-600"
                                  : difficulty === "moderate"
                                    ? "border-yellow-500 text-yellow-600"
                                    : "border-green-500 text-green-600"
                            }`}
                          >
                            {difficulty === "easy" && "Хялбар"}
                            {difficulty === "moderate" && "Дунд"}
                            {difficulty === "challenging" && "Хүнд"}
                            {difficulty === "extreme" && "Туйлын хүнд"}
                          </Badge>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Best Season */}
                <div>
                  <Label className="text-sm font-bold mb-3 block">{t("map.best_season", "Шилдэг улирал")}</Label>
                  <div className="space-y-2">
                    {["spring", "summer", "autumn", "winter"].map((season) => (
                      <div key={season} className="flex items-center space-x-2">
                        <Checkbox
                          id={season}
                          checked={selectedSeason.includes(season)}
                          onCheckedChange={(checked) => handleSeasonChange(season, checked as boolean)}
                        />
                        <Label htmlFor={season} className="text-sm capitalize cursor-pointer font-medium">
                          {season === "spring" && "Хавар"}
                          {season === "summer" && "Зун"}
                          {season === "autumn" && "Намар"}
                          {season === "winter" && "Өвөл"}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Temperature Preference */}
                <div>
                  <Label className="text-sm font-bold mb-3 block">{t("map.temperature_preference", "Температурын сонголт")}</Label>
                  <div className="space-y-2">
                    {["cool", "moderate", "hot"].map((temp) => (
                      <div key={temp} className="flex items-center space-x-2">
                        <Checkbox
                          id={temp}
                          checked={temperaturePreference.includes(temp)}
                          onCheckedChange={(checked) => handleTemperatureChange(temp, checked as boolean)}
                        />
                        <Label htmlFor={temp} className="text-sm capitalize cursor-pointer font-medium">
                          {temp === "cool" && "Сэрүүн"}
                          {temp === "hot" && "Халуун"}
                          {temp === "moderate" && "Дунд"}
                          {temp}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trip Duration */}
                <div>
                  <Label className="text-sm font-bold mb-3 block">{t("map.trip_duration", "Аяллын үргэлжлэх хугацаа")}</Label>
                  <div className="space-y-4">
                    <Select value={durationType} onValueChange={setDurationType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="days">Өдр</SelectItem>
                        <SelectItem value="weeks">Хугацаа</SelectItem>
                        <SelectItem value="months">Сар</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="px-2">
                      <Slider
                        value={durationRange}
                        onValueChange={setDurationRange}
                        min={getDurationRangeForType(durationType).min}
                        max={getDurationRangeForType(durationType).max}
                        step={getDurationRangeForType(durationType).step}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1 font-medium">
                        <span>
                          {durationRange[0]} {durationType}
                        </span>
                        <span>
                          {durationRange[1]} {durationType}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Child Friendly */}
                <div>
                  <Label className="text-sm font-bold mb-3 block">{t("map.special_requirements", "Тусгай шаардлага")}</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="childFriendly" checked={childFriendlyOnly} onCheckedChange={(checked) => setChildFriendlyOnly(!!checked)} />
                    <Label htmlFor="childFriendly" className="text-sm cursor-pointer font-medium">
                      <Users className="w-4 h-4 inline mr-1" />
                      {t("map.child_friendly_only", "Зөвхөн хүүхдэд ээлтэй")}
                    </Label>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{filteredAttractions.length} үзвэр олдлоо</h2>
            <p className="text-gray-600 text-sm font-medium">{t("map.beautiful_nature", "Монголын хамгийн үзэсгэлэнтэй байгалийн газруудыг нээ")}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs font-medium">
              {mongoliaAttractions.filter((a) => a.unesco).length} ЮНЕСКО-гийн газар
            </Badge>
          </div>
        </div>

        {/* Attractions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredAttractions.map((attraction) => (
            <Card key={attraction.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <div className="aspect-video bg-gray-200">
                  <img
                    src={attraction.images[0] || "/placeholder.svg"}
                    alt={attraction.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute top-3 left-3 flex gap-2">
                  {attraction.unesco && (
                    <Badge className="bg-blue-600 text-white text-xs font-medium">
                      <Award className="w-3 h-3 mr-1" />
                      UNESCO
                    </Badge>
                  )}
                  <Badge
                    variant="secondary"
                    className={`text-xs font-medium ${
                      attraction.difficulty === "extreme"
                        ? "bg-red-100 text-red-700"
                        : attraction.difficulty === "challenging"
                          ? "bg-orange-100 text-orange-700"
                          : attraction.difficulty === "moderate"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                    }`}
                  >
                    {attraction.difficulty === "easy" && "Хялбар"}
                    {attraction.difficulty === "moderate" && "Дунд"}
                    {attraction.difficulty === "challenging" && "Хүнд"}
                    {attraction.difficulty === "extreme" && "Туйлын хүнд"}
                  </Badge>
                </div>
                <div className="absolute top-3 right-3 flex gap-1">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 bg-white/80 hover:bg-white">
                    <Heart className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 bg-white/80 hover:bg-white">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1 line-clamp-1">{attraction.mongolianName}</h3>
                    <p className="text-sm text-gray-600 mb-1 font-medium">{attraction.name}</p>
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="text-sm font-medium">{attraction.location}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="font-semibold text-sm">{attraction.rating}</span>
                    </div>
                    <span className="text-xs text-gray-500 font-medium">({attraction.reviewCount})</span>
                  </div>
                </div>

                <p className="text-gray-700 text-sm mb-3 line-clamp-2 font-medium">{attraction.description}</p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {attraction.type.slice(0, 3).map((type, index) => (
                    <Badge key={index} variant="outline" className="text-xs font-medium">
                      {type === "lake" && "Нуур"}
                      {type === "desert" && "Цөл"}
                      {type === "mountains" && "Уул"}
                      {type === "forest" && "Ой"}
                      {type === "canyon" && "Хавцал"}
                      {type === "steppe" && "Тал"}
                      {!(type in {lake:1,desert:1,mountains:1,forest:1,canyon:1,steppe:1}) && type}
                    </Badge>
                  ))}
                  {attraction.childFriendly && (
                    <Badge variant="outline" className="text-xs text-green-600 border-green-300 font-medium">
                      <Users className="w-3 h-3 mr-1" />
                      {t("map.child_friendly", "Хүүхдэд ээлтэй")}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span className="font-medium">{attraction.duration} {t("map.days", "өдөр")}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span className="capitalize font-medium">{attraction.bestSeason.map(season => season === "spring" ? "Хавар" : season === "summer" ? "Зун" : season === "autumn" ? "Намар" : season === "winter" ? "Өвөл" : season).join(", ")}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent font-medium"
                        onClick={() => setSelectedAttraction(attraction)}
                      >
                        <Info className="w-4 h-4 mr-1" />
                        Дэлгэрэнгүй
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      {selectedAttraction && (
                        <>
                          <DialogHeader>
                            <DialogTitle className="text-2xl font-bold">{selectedAttraction.mongolianName}</DialogTitle>
                            <p className="text-gray-600 font-medium">{selectedAttraction.name}</p>
                          </DialogHeader>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                              <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden mb-4">
                                <img
                                  src={selectedAttraction.images[0] || "/placeholder.svg"}
                                  alt={selectedAttraction.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              <div className="grid grid-cols-3 gap-2 mb-4">
                                {selectedAttraction.images.slice(1, 4).map((image: string, index: number) => (
                                  <div key={index} className="aspect-video bg-gray-200 rounded overflow-hidden">
                                    <img
                                      src={image || "/placeholder.svg"}
                                      alt=""
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div>
                                <h3 className="font-bold mb-2">{t("map.about_destination", "Энэ газрын тухай")}</h3>
                                <p className="text-gray-700 text-sm leading-relaxed font-medium">
                                  {selectedAttraction.longDescription}
                                </p>
                              </div>

                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600 font-medium">{t("map.location", "Байршил")}:</span>
                                  <p className="font-semibold">{selectedAttraction.location}</p>
                                </div>
                                <div>
                                  <span className="text-gray-600 font-medium">{t("map.duration", "Хугацаа")}:</span>
                                  <p className="font-semibold">{selectedAttraction.duration}</p>
                                </div>
                                <div>
                                  <span className="text-gray-600 font-medium">{t("map.difficulty", "Хүндрэлийн түвшин")}:</span>
                                  <Badge
                                    variant="outline"
                                    className={`font-medium ${
                                      selectedAttraction.difficulty === "extreme"
                                        ? "border-red-500 text-red-600"
                                        : selectedAttraction.difficulty === "challenging"
                                          ? "border-orange-500 text-orange-600"
                                          : selectedAttraction.difficulty === "moderate"
                                            ? "border-yellow-500 text-yellow-600"
                                            : "border-green-500 text-green-600"
                                    }`}
                                  >
                                    {selectedAttraction.difficulty}
                                  </Badge>
                                </div>
                                <div>
                                  <span className="text-gray-600 font-medium">{t("map.best_season", "Шилдэг улирал")}:</span>
                                  <p className="font-semibold capitalize">{selectedAttraction.bestSeason.join(", ")}</p>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-bold mb-2">{t("map.activities", "Үйл ажиллагаа")}</h4>
                                <div className="flex flex-wrap gap-1">
                                  {selectedAttraction.activities.map((activity: string, index: number) => (
                                    <Badge key={index} variant="secondary" className="text-xs font-medium">
                                      {activity}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <h4 className="font-bold mb-2">{t("map.travel_tips", "Аяллын зөвлөгөө")}</h4>
                                <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg font-medium">
                                  <Info className="w-4 h-4 inline mr-1 text-blue-600" />
                                  {selectedAttraction.tips}
                                </p>
                              </div>

                              <div>
                                <h4 className="font-bold mb-2">{t("map.transportation", "Тээвэр")}</h4>
                                <p className="text-sm text-gray-700 font-medium">
                                  <Navigation className="w-4 h-4 inline mr-1" />
                                  {selectedAttraction.transportation}
                                </p>
                              </div>

                              {selectedAttraction.nearbyCamps.length > 0 && (
                                <div>
                                  <h4 className="font-bold mb-2">{t("map.nearby_accommodations", "Ойролцоох байр")}</h4>
                                  <div className="space-y-2">
                                    {selectedAttraction.nearbyCamps.map((camp: any, index: number) => (
                                      <div
                                        key={index}
                                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                                      >
                                        <div>
                                          <p className="font-semibold text-sm">{camp.name}</p>
                                          <p className="text-xs text-gray-600 font-medium">{camp.distance}</p>
                                        </div>
                                        <div className="text-right">
                                          <div className="flex items-center">
                                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                                            <span className="text-sm font-medium">{camp.rating}</span>
                                          </div>
                                          <p className="text-sm font-bold">${camp.price}/night</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-3 pt-4 border-t">
                            <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 font-semibold" onClick={() => router.push("/travel-routes")}>
                              <Calendar className="w-4 h-4 mr-2" />
                              Энд аяллаа төлөвлөх
                            </Button>
                            <Button variant="outline" className="flex-1 bg-transparent font-medium" onClick={() => handleViewOnMap(selectedAttraction)}>
                              <MapPin className="w-4 h-4 mr-1" />
                              Газрын зураг дээр харах
                            </Button>
                            <Button variant="outline">
                              <Heart className="w-4 h-4" />
                            </Button>
                            <Button variant="outline">
                              <Share2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </>
                      )}
                    </DialogContent>
                  </Dialog>

                  <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700 font-semibold" onClick={() => router.push("/travel-routes")}>
                    <Navigation className="w-4 h-4 mr-1" />
                    Маршрут төлөвлөх
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredAttractions.length === 0 && (
          <div className="text-center py-12">
            <Mountain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t("common.no_data", "Мэдээлэл олдсонгүй.")}</h3>
            <p className="text-gray-600 mb-4 font-medium">{t("map.beautiful_nature", "Монголын хамгийн үзэсгэлэнтэй байгалийн газруудыг нээ")}</p>
            <Button onClick={clearAllFilters} variant="outline" className="font-medium bg-transparent">
              {t("common.clear", "Цэвэрлэх")}
            </Button>
          </div>
        )}

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-emerald-600 to-blue-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">{t("map.discover_nature", "Монгол орны байгалийн гайхамшгийг нээ")}</h2>
          <p className="text-lg mb-6 opacity-90 font-medium">
            {t("map.discover_nature_desc", "Монгол орны олон янзын нуур, цөл, уул, баазуудыг судлаарай")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-emerald-600 hover:bg-gray-100 font-semibold">
              <Calendar className="w-5 h-5 mr-2" />
              Энд аяллаа төлөвлөх
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-emerald-600 bg-transparent font-semibold"
              onClick={() => mapSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })}
            >
              <MapPin className="w-5 h-5 mr-2" />
              Газрын зураг дээр харах
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
