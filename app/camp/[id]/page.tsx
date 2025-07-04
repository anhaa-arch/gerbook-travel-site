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
import { Header } from "@/components/header"
import Link from "next/link"
import '../../../lib/i18n'

// Mock camp data
const campData = {
  1: {
    id: 1,
    name: "Naiman Nuur Eco Camp",
    location: "Arkhangai Province, Mongolia",
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
      "Experience authentic Mongolian nomadic life at our eco-friendly camp nestled beside the pristine Naiman Nuur (Eight Lakes). Our traditional gers offer modern comfort while maintaining cultural authenticity.",
    longDescription:
      "Naiman Nuur Eco Camp offers an unforgettable experience in one of Mongolia's most beautiful natural settings. Located in the heart of Arkhangai Province, our camp provides the perfect base for exploring the famous Eight Lakes region. Each traditional ger is equipped with comfortable beds, heating, and basic amenities while maintaining the authentic nomadic atmosphere. Our experienced local guides will take you on horseback riding adventures, hiking expeditions, and cultural experiences with local herder families.",
    amenities: [
      { icon: Wifi, name: "WiFi Available", available: true },
      { icon: Car, name: "Parking", available: true },
      { icon: Utensils, name: "Restaurant", available: true },
      { icon: Shield, name: "24/7 Security", available: true },
      { icon: Users, name: "Group Activities", available: true },
      { icon: Camera, name: "Photography Tours", available: true },
    ],
    activities: [
      "Horseback riding around the lakes",
      "Hiking and trekking",
      "Traditional fishing",
      "Cultural experiences with herder families",
      "Photography workshops",
      "Stargazing sessions",
      "Traditional Mongolian cooking classes",
      "Wildlife watching",
    ],
    accommodation: {
      type: "Traditional Mongolian Gers",
      capacity: "2-4 people per ger",
      totalGers: 12,
      facilities: ["Comfortable beds", "Heating system", "Private bathroom nearby", "Traditional furnishing"],
    },
    host: {
      name: "Batbayar Ganbaatar",
      avatar: "/placeholder.svg?height=60&width=60&text=Host",
      experience: "15 years",
      languages: ["Mongolian", "English", "Russian"],
      rating: 4.9,
      description:
        "Born and raised in Arkhangai Province, Batbayar has been sharing the beauty of Mongolian culture with visitors for over 15 years. He's passionate about sustainable tourism and preserving traditional nomadic lifestyle.",
    },
    reviews: [
      {
        id: 1,
        author: "Sarah Johnson",
        avatar: "/placeholder.svg?height=40&width=40&text=SJ",
        rating: 5,
        date: "December 2024",
        comment:
          "Absolutely incredible experience! The gers were comfortable and authentic, and Batbayar was an amazing host. The horseback riding around the lakes was the highlight of our trip.",
        helpful: 12,
      },
      {
        id: 2,
        author: "Michael Chen",
        avatar: "/placeholder.svg?height=40&width=40&text=MC",
        rating: 5,
        date: "November 2024",
        comment:
          "Perfect blend of adventure and comfort. The traditional meals were delicious and the stargazing sessions were unforgettable. Highly recommend for anyone wanting to experience real Mongolia.",
        helpful: 8,
      },
      {
        id: 3,
        author: "Emma Wilson",
        avatar: "/placeholder.svg?height=40&width=40&text=EW",
        rating: 4,
        date: "October 2024",
        comment:
          "Beautiful location and great activities. The only minor issue was the WiFi being a bit slow, but honestly, it was nice to disconnect. The cultural experiences were very authentic.",
        helpful: 5,
      },
    ],
    policies: {
      checkIn: "14:00",
      checkOut: "11:00",
      cancellation: "Free cancellation up to 48 hours before arrival",
      children: "Children of all ages welcome",
      pets: "Pets not allowed",
      smoking: "No smoking inside gers",
    },
    location_details: {
      nearbyAttractions: [
        { name: "Naiman Nuur (Eight Lakes)", distance: "Walking distance" },
        { name: "Orkhon Waterfall", distance: "45 km" },
        { name: "Taikhar Rock", distance: "60 km" },
        { name: "Tsenkher Hot Springs", distance: "80 km" },
      ],
      transportation:
        "4WD vehicle recommended. Transfer service available from Tsetserleg (120 km) or Ulaanbaatar (350 km)",
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
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Camp Not Found</h1>
            <p className="text-gray-600 mb-8">The camp you're looking for doesn't exist.</p>
            <Link href="/camps">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Camps
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/camps">
            <Button variant="ghost" className="p-0 h-auto font-normal text-gray-600 hover:text-gray-900">
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
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{camp.name}</h1>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{camp.location}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="font-medium">{camp.rating}</span>
                      <span className="text-gray-600 ml-1">({camp.reviewCount} reviews)</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Heart className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>

              <p className="text-gray-700 mb-6">{camp.description}</p>
              <p className="text-gray-600 text-sm leading-relaxed">{camp.longDescription}</p>
            </div>

            {/* Amenities */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {camp.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <amenity.icon className={`w-5 h-5 ${amenity.available ? "text-emerald-600" : "text-gray-400"}`} />
                    <span className={amenity.available ? "text-gray-900" : "text-gray-400 line-through"}>
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
                    <span className="text-gray-700">{activity}</span>
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
                      <h3 className="font-semibold text-gray-900 mb-2">{camp.accommodation.type}</h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Capacity:</span>
                          <span>{camp.accommodation.capacity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Units:</span>
                          <span>{camp.accommodation.totalGers}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Facilities</h3>
                      <ul className="space-y-1 text-sm text-gray-600">
                        {camp.accommodation.facilities.map((facility, index) => (
                          <li key={index} className="flex items-center">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></div>
                            {facility}
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
                        <h3 className="font-semibold text-lg">{camp.host.name}</h3>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                          <span className="text-sm font-medium">{camp.host.rating}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                        <span>{camp.host.experience} hosting experience</span>
                        <span>Languages: {camp.host.languages.join(", ")}</span>
                      </div>
                      <p className="text-gray-700 text-sm">{camp.host.description}</p>
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
                  <span className="font-semibold text-lg">{camp.rating}</span>
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
                            <h4 className="font-medium text-gray-900">{review.author}</h4>
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                {[...Array(review.rating)].map((_, i) => (
                                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                ))}
                              </div>
                              <span className="text-sm text-gray-600">{review.date}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-2">{review.comment}</p>
                        <button className="text-sm text-gray-500 hover:text-gray-700">
                          Helpful ({review.helpful})
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {camp.reviews.length > 3 && (
                <Button variant="outline" onClick={() => setShowAllReviews(!showAllReviews)} className="mt-4">
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
                      <h3 className="font-semibold text-gray-900 mb-3">Nearby Attractions</h3>
                      <div className="space-y-2">
                        {camp.location_details.nearbyAttractions.map((attraction, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-700">{attraction.name}</span>
                            <span className="text-gray-600">{attraction.distance}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Transportation</h3>
                      <p className="text-sm text-gray-700">{camp.location_details.transportation}</p>
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
                        <span className="text-gray-600">Check-in:</span>
                        <span className="font-medium">{camp.policies.checkIn}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Check-out:</span>
                        <span className="font-medium">{camp.policies.checkOut}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Children:</span>
                        <span className="font-medium">{camp.policies.children}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pets:</span>
                        <span className="font-medium">{camp.policies.pets}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Smoking:</span>
                        <span className="font-medium">{camp.policies.smoking}</span>
                      </div>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Cancellation Policy</h4>
                    <p className="text-sm text-gray-700">{camp.policies.cancellation}</p>
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
                    <span className="text-sm text-gray-600">per night</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
                      <Input
                        type="date"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
                      <Input
                        type="date"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        min={checkIn || new Date().toISOString().split("T")[0]}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Guests</label>
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setGuests(Math.max(1, guests - 1))}
                        disabled={guests <= 1}
                      >
                        -
                      </Button>
                      <span className="font-medium">{guests}</span>
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
                        <span>
                          ${camp.price} ×{" "}
                          {Math.ceil(
                            (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24),
                          )}{" "}
                          nights
                        </span>
                        <span>${calculateTotal()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Service fee</span>
                        <span>${Math.round(calculateTotal() * 0.1)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span>${calculateTotal() + Math.round(calculateTotal() * 0.1)}</span>
                      </div>
                    </div>
                  )}

                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={!checkIn || !checkOut}>
                    {!checkIn || !checkOut ? "Select Dates" : "Reserve Now"}
                  </Button>

                  <div className="text-center">
                    <p className="text-sm text-gray-600">You won't be charged yet</p>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Button variant="outline" className="w-full bg-transparent">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Contact Host
                    </Button>
                    <Button variant="outline" className="w-full bg-transparent">
                      <Calendar className="w-4 h-4 mr-2" />
                      Check Availability
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
