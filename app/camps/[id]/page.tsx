"use client"

import { use, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  ArrowLeft,
  Star,
  MapPin,
  Users,
  Wifi,
  Car,
  Utensils,
  Shield,
  Calendar,
  Heart,
  Share2,
  MessageCircle,
  Camera,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import "../../../lib/i18n"
import { useToast } from "@/components/ui/use-toast"

// Mock camp data
const campData = {
  1: {
    id: 1,
    name: "Найман нуур эко бааз",
    location: "Архангай аймаг, Монгол",
    coordinates: { lat: 46.8625, lng: 99.2124 },
    price: 120,
    rating: 4.8,
    reviewCount: 156,
    images: [
      "/placeholder.svg?height=400&width=600&text=Camp+Main",
      "/placeholder.svg?height=400&width=600&text=Ger+Interior",
      "/placeholder.svg?height=400&width=600&text=Lake+View",
      "/placeholder.svg?height=400&width=600&text=Activities",
      "/placeholder.svg?height=400&width=600&text=Dining",
    ],
    description:
      "Найман нуурын эрэг дээр байрлах эко баазад жинхэнэ монгол нүүдэлчдийн амьдралыг мэдрээрэй. Манай уламжлалт гэрүүд нь орчин үеийн тав тухтай бөгөөд соёлын өвийг хадгалсан.",
    longDescription:
      "Найман нуур эко бааз нь Монголын хамгийн үзэсгэлэнтэй байгалийн нэгэн хэсэгт мартагдашгүй аяллыг санал болгодог. Архангай аймгийн зүрхэнд байрлах манай бааз нь Найман нуурын бүсийг судлахад төгс суурь болно. Гэр бүр нь тухтай ор, халаалт, үндсэн хэрэгслээр тоноглогдсон бөгөөд жинхэнэ нүүдэлчдийн уур амьсгалыг хадгалсан. Манай туршлагатай нутгийн хөтөч нар морин аялал, явган аялал, малчин айлуудтай соёлын солилцоо зэрэг олон төрлийн үйл ажиллагааг санал болгодог.",
    amenities: [
      { icon: Wifi, name: "WiFi холболт", available: true },
      { icon: Car, name: "Зогсоол", available: true },
      { icon: Utensils, name: "Ресторан", available: true },
      { icon: Shield, name: "24/7 хамгаалалт", available: true },
      { icon: Users, name: "Бүлгийн үйл ажиллагаа", available: true },
      { icon: Camera, name: "Гэрэл зургийн аялал", available: true },
    ],
    activities: [
      "Нуурын эргээр морин аялал",
      "Явган аялал, ууланд алхах",
      "Уламжлалт загасчлал",
      "Малчин айлуудтай соёлын солилцоо",
      "Гэрэл зургийн сургалт",
      "Од харвах ажиглалт",
      "Монгол хоолны сургалт",
      "Зэрлэг амьтан ажиглах",
    ],
    accommodation: {
      type: "Уламжлалт монгол гэр",
      capacity: "Гэр бүрт 2-4 хүн",
      totalGers: 12,
      facilities: ["Тав тухтай ор", "Халаалтын систем", "Хувийн ариун цэврийн өрөө ойр", "Уламжлалт тавилга"],
    },
    host: {
      name: "Ганбаатар Батбаяр",
      avatar: "/placeholder.svg?height=60&width=60&text=Host",
      experience: "15 жил",
      languages: ["Монгол", "Англи", "Орос"],
      rating: 4.9,
      description:
        "Архангай аймагт төрж өссөн Батбаяр нь 15 гаруй жил зочдод монгол соёлыг таниулж байна. Тэрээр тогтвортой аялал жуулчлал, уламжлалт нүүдэлчдийн амьдралыг хадгалахыг эрхэмлэдэг.",
    },
    reviews: [
      {
        id: 1,
        author: "Сараа Жонсон",
        avatar: "/placeholder.svg?height=40&width=40&text=SJ",
        rating: 5,
        date: "2024 оны 12 сар",
        comment:
          "Үнэхээр гайхалтай туршлага байлаа! Гэрүүд нь тухтай, жинхэнэ монгол уур амьсгалтай. Батбаяр маш сайн хөтөч байсан. Нуурын эргээр морин аялал хамгийн гоё нь байлаа.",
        helpful: 12,
      },
      {
        id: 2,
        author: "Майкл Чен",
        avatar: "/placeholder.svg?height=40&width=40&text=MC",
        rating: 5,
        date: "2024 оны 11 сар",
        comment:
          "Адал явдал, тав тухыг хослуулсан аялал байлаа. Уламжлалт хоол амттай, од харвах ажиглалт мартагдашгүй. Жинхэнэ Монголыг мэдрэхийг хүсвэл заавал ирээрэй!",
        helpful: 8,
      },
      {
        id: 3,
        author: "Эмма Вилсон",
        avatar: "/placeholder.svg?height=40&width=40&text=EW",
        rating: 4,
        date: "2024 оны 10 сар",
        comment:
          "Үзэсгэлэнт байгаль, олон төрлийн үйл ажиллагаа. WiFi бага зэрэг удаан байсан ч, үнэндээ холбогдолгүй. Соёлын солилцоо маш жинхэнэ байлаа.",
        helpful: 5,
      },
    ],
    policies: {
      checkIn: "14:00",
      checkOut: "11:00",
      cancellation: "Ирэхээс 48 цагийн өмнө цуцлавал төлбөргүй",
      children: "Бүх насны хүүхдүүдийг хүлээн авна",
      pets: "Амьтан авчрахыг хориглоно",
      smoking: "Гэр дотор тамхи татахыг хориглоно",
    },
    location_details: {
      nearbyAttractions: [
        { name: "Найман нуур", distance: "Алхах зайд" },
        { name: "Орхоны хүрхрээ", distance: "45 км" },
        { name: "Тайхар чулуу", distance: "60 км" },
        { name: "Цэнхэр халуун рашаан", distance: "80 км" },
      ],
      transportation:
        "4WD машин санал болгоно. Тээврийн үйлчилгээ Цэцэрлэг (120 км) болон Улаанбаатар (350 км)-аас авах боломжтой.",
    },
  },
  2: {
    id: 2,
    name: "Khuvsgul Lake Camp",
    location: "Khövsgöl Province, Mongolia",
    coordinates: { lat: 51.2, lng: 100.1667 },
    price: 150,
    rating: 4.6,
    reviewCount: 203,
    images: [
      "/placeholder.svg?height=400&width=600&text=Lake+Camp",
      "/placeholder.svg?height=400&width=600&text=Blue+Lake",
      "/placeholder.svg?height=400&width=600&text=Ger+Setup",
      "/placeholder.svg?height=400&width=600&text=Boat+Tours",
    ],
    description:
      "Discover the 'Blue Pearl of Mongolia' at our lakeside camp offering stunning views of Khuvsgul Lake, crystal-clear waters, and authentic nomadic experiences.",
    longDescription:
      "Located on the shores of Mongolia's largest freshwater lake, our camp offers breathtaking views and unique experiences. Known as the 'Blue Pearl of Mongolia,' Khuvsgul Lake is one of the world's largest and oldest freshwater lakes. Our camp combines traditional Mongolian hospitality with modern comfort, offering boat tours, horseback riding, and cultural immersion with local Tsaatan reindeer herders.",
    amenities: [
      { icon: Wifi, name: "Limited WiFi", available: true },
      { icon: Car, name: "Parking", available: true },
      { icon: Utensils, name: "Traditional Dining", available: true },
      { icon: Shield, name: "Security", available: true },
      { icon: Users, name: "Group Tours", available: true },
    ],
    activities: [
      "Boat tours on Khuvsgul Lake",
      "Horseback riding",
      "Visit to Tsaatan reindeer herders",
      "Fishing (with permit)",
      "Hiking in surrounding mountains",
      "Traditional music performances",
      "Kayaking and water sports",
    ],
    accommodation: {
      type: "Lakeside Gers",
      capacity: "2-6 people per ger",
      totalGers: 15,
      facilities: ["Lake views", "Heating", "Shared facilities", "Traditional decor"],
    },
    host: {
      name: "Oyunaa Batbold",
      avatar: "/placeholder.svg?height=60&width=60&text=OB",
      experience: "12 years",
      languages: ["Mongolian", "English", "German"],
      rating: 4.7,
      description:
        "Oyunaa grew up near Khuvsgul Lake and has deep connections with local Tsaatan families. She specializes in cultural tourism and sustainable lake conservation.",
    },
    reviews: [
      {
        id: 1,
        author: "Hans Mueller",
        avatar: "/placeholder.svg?height=40&width=40&text=HM",
        rating: 5,
        date: "September 2024",
        comment:
          "The lake is absolutely stunning! Oyunaa arranged an amazing visit to the reindeer herders. The boat tour at sunset was magical.",
        helpful: 15,
      },
    ],
    policies: {
      checkIn: "15:00",
      checkOut: "10:00",
      cancellation: "Free cancellation up to 72 hours before arrival",
      children: "Children welcome with supervision near water",
      pets: "No pets allowed",
      smoking: "Designated smoking areas only",
    },
    location_details: {
      nearbyAttractions: [
        { name: "Khuvsgul Lake", distance: "Lakeside" },
        { name: "Tsaatan Reindeer Herders", distance: "50 km" },
        { name: "Murun Town", distance: "100 km" },
        { name: "Darkhad Valley", distance: "120 km" },
      ],
      transportation: "Accessible by 4WD. Daily flights to Murun airport available. Transfer service provided.",
    },
  },
}

interface CampDetailPageProps {
  params: Promise<{ id: string }>
}

export default function CampDetailPage({ params }: CampDetailPageProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const resolvedParams = use(params)
  const campId = Number.parseInt(resolvedParams.id)
  const camp = campData[campId as keyof typeof campData]

  const [selectedImage, setSelectedImage] = useState(0)
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [guests, setGuests] = useState(2)
  const [showAllReviews, setShowAllReviews] = useState(false)

  if (!camp) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{t("error.camp_not_found")}</h1>
            <p className="text-gray-600 mb-8 font-medium">{t("error.camp_not_found_desc")}</p>
            <Link href="/camps">
              <Button className="bg-emerald-600 hover:bg-emerald-700 font-semibold">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("common.back_to_camps")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const calculateTotal = () => {
    if (!checkIn || !checkOut) return 0
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    return nights > 0 ? nights * camp.price : 0
  }

  const handleBooking = () => {
    if (!checkIn || !checkOut) return
    toast({
      title: t("booking.success_title"),
      description: t("booking.success_desc"),
      status: "success",
    })
    setCheckIn("")
    setCheckOut("")
    setGuests(2)
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/camps">
            <Button variant="ghost" className="p-0 h-auto font-medium text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Camps
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                <img
                  src={camp.images[selectedImage] || "/placeholder.svg"}
                  alt={camp.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {camp.images.slice(0, 4).map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-video bg-gray-200 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? "border-emerald-500" : "border-transparent"
                    }`}
                  >
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`${camp.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Camp Info */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 font-display">{camp.name}</h1>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="font-medium">{camp.location}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="font-semibold">{camp.rating}</span>
                      <span className="text-gray-600 ml-1 font-medium">({camp.reviewCount} reviews)</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="font-medium bg-transparent">
                    <Heart className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" size="sm" className="font-medium bg-transparent">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>

              <p className="text-gray-700 mb-6 font-medium">{camp.description}</p>
              <p className="text-gray-600 text-sm leading-relaxed font-medium">{camp.longDescription}</p>
            </div>

            {/* Amenities */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {camp.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <amenity.icon className={`w-5 h-5 ${amenity.available ? "text-emerald-600" : "text-gray-400"}`} />
                    <span
                      className={`font-medium ${amenity.available ? "text-gray-900" : "text-gray-400 line-through"}`}
                    >
                      {amenity.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Activities */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Activities & Experiences</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {camp.activities.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-gray-700 font-medium">{activity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Accommodation Details */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Accommodation</h2>
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">{camp.accommodation.type}</h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span className="font-medium">Capacity:</span>
                          <span className="font-semibold">{camp.accommodation.capacity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Total Units:</span>
                          <span className="font-semibold">{camp.accommodation.totalGers}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Facilities</h3>
                      <ul className="space-y-1 text-sm text-gray-600">
                        {camp.accommodation.facilities.map((facility, index) => (
                          <li key={index} className="flex items-center">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></div>
                            <span className="font-medium">{facility}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Host Information */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Meet Your Host</h2>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <img
                      src={camp.host.avatar || "/placeholder.svg"}
                      alt={camp.host.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg">{camp.host.name}</h3>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                          <span className="text-sm font-semibold">{camp.host.rating}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                        <span className="font-medium">{camp.host.experience} hosting experience</span>
                        <span className="font-medium">Languages: {camp.host.languages.join(", ")}</span>
                      </div>
                      <p className="text-gray-700 text-sm font-medium">{camp.host.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Reviews */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Reviews ({camp.reviewCount})</h2>
                <div className="flex items-center">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 mr-1" />
                  <span className="font-bold text-lg">{camp.rating}</span>
                </div>
              </div>

              <div className="space-y-6">
                {camp.reviews.slice(0, showAllReviews ? camp.reviews.length : 3).map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                    <div className="flex items-start space-x-4">
                      <img
                        src={review.avatar || "/placeholder.svg"}
                        alt={review.author}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">{review.author}</h4>
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                {[...Array(review.rating)].map((_, i) => (
                                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                ))}
                              </div>
                              <span className="text-sm text-gray-600 font-medium">{review.date}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-2 font-medium">{review.comment}</p>
                        <button className="text-sm text-gray-500 hover:text-gray-700 font-medium">
                          Helpful ({review.helpful})
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {camp.reviews.length > 3 && (
                <Button
                  variant="outline"
                  onClick={() => setShowAllReviews(!showAllReviews)}
                  className="mt-4 font-medium"
                >
                  {showAllReviews ? "Show Less" : `Show All ${camp.reviewCount} Reviews`}
                </Button>
              )}
            </div>

            {/* Location & Transportation */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Location & Getting There</h2>
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-bold text-gray-900 mb-3">Nearby Attractions</h3>
                      <div className="space-y-2">
                        {camp.location_details.nearbyAttractions.map((attraction, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-700 font-medium">{attraction.name}</span>
                            <span className="text-gray-600 font-medium">{attraction.distance}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-3">Transportation</h3>
                      <p className="text-sm text-gray-700 font-medium">{camp.location_details.transportation}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Policies */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Policies</h2>
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">Check-in:</span>
                        <span className="font-semibold">{camp.policies.checkIn}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">Check-out:</span>
                        <span className="font-semibold">{camp.policies.checkOut}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">Children:</span>
                        <span className="font-semibold">{camp.policies.children}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">Pets:</span>
                        <span className="font-semibold">{camp.policies.pets}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">Smoking:</span>
                        <span className="font-semibold">{camp.policies.smoking}</span>
                      </div>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Cancellation Policy</h4>
                    <p className="text-sm text-gray-700 font-medium">{camp.policies.cancellation}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-2xl font-bold">${camp.price}</span>
                    <span className="text-sm text-gray-600 font-medium">{t("common.per_night")}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Check-in</label>
                      <Input
                        type="date"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        className="font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Check-out</label>
                      <Input
                        type="date"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        min={checkIn || new Date().toISOString().split("T")[0]}
                        className="font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Guests</label>
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setGuests(Math.max(1, guests - 1))}
                        disabled={guests <= 1}
                      >
                        -
                      </Button>
                      <span className="font-semibold">{guests}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setGuests(Math.min(6, guests + 1))}
                        disabled={guests >= 6}
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  {checkIn && checkOut && (
                    <div className="space-y-2 pt-4 border-t">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">
                          ${camp.price} ×{" "}
                          {Math.ceil(
                            (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24),
                          )}{" "}
                          nights
                        </span>
                        <span className="font-semibold">${calculateTotal()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{t("common.service_fee")}</span>
                        <span className="font-semibold">${Math.round(calculateTotal() * 0.1)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold">
                        <span>{t("common.total")}</span>
                        <span>${calculateTotal() + Math.round(calculateTotal() * 0.1)}</span>
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 font-semibold py-3 sm:py-2 px-4 sm:px-6 text-base sm:text-sm rounded-lg sm:rounded-md transition-all"
                    disabled={!checkIn || !checkOut}
                    onClick={handleBooking}
                  >
                    {!checkIn || !checkOut ? t("common.select_dates") : t("common.reserve_now")}
                  </Button>

                  <div className="text-center">
                    <p className="text-sm text-gray-600 font-medium">{t("common.not_charged_yet")}</p>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Button variant="outline" className="w-full bg-transparent font-medium">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      {t("common.contact_host")}
                    </Button>
                    <Button variant="outline" className="w-full bg-transparent font-medium">
                      <Calendar className="w-4 h-4 mr-2" />
                      {t("common.check_availability")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
