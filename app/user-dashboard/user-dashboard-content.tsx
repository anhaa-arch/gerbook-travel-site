"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Calendar, MapPin, Star, Package, Heart, ShoppingBag, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import "../../lib/i18n"

export default function UserDashboardContent() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState("overview")

  // Mock user data
  const user = {
    name: "Сараа Жонсон",
    email: "sarah@email.com",
    phone: "+976 9911 2233",
    location: "Улаанбаатар, Монгол",
    joinDate: "2024 оны 1-р сар",
    totalBookings: 5,
    totalOrders: 12,
    totalSpent: 1850,
    favoriteDestination: "Хөвсгөл нуур",
  }

  const bookings = [
    {
      id: 1,
      camp: "Найман нуур эко гэр бааз",
      location: "Архангай аймаг",
      checkIn: "2024-07-15",
      checkOut: "2024-07-18",
      guests: 2,
      amount: 360,
      status: "confirmed",
      image: "/placeholder.svg?height=60&width=60&text=Бааз",
    },
    {
      id: 2,
      camp: "Хөвсгөл нуурын бааз",
      location: "Хөвсгөл аймаг",
      checkIn: "2024-08-10",
      checkOut: "2024-08-12",
      guests: 4,
      amount: 500,
      status: "completed",
      image: "/placeholder.svg?height=60&width=60&text=Нуур",
    },
    {
      id: 3,
      camp: "Говь цөлийн адал явдал",
      location: "Өмнөговь аймаг",
      checkIn: "2024-09-05",
      checkOut: "2024-09-08",
      guests: 2,
      amount: 540,
      status: "upcoming",
      image: "/placeholder.svg?height=60&width=60&text=Цөл",
    },
  ]

  const orders = [
    {
      id: 1,
      product: "Айраг",
      seller: "Батбаярын гэр бүл",
      quantity: 3,
      amount: 75,
      status: "delivered",
      date: "2024-12-20",
      image: "/placeholder.svg?height=40&width=40&text=Айраг",
    },
    {
      id: 2,
      product: "Гар нэхмэл хивс",
      seller: "Оюунаагийн урлал",
      quantity: 1,
      amount: 150,
      status: "shipped",
      date: "2024-12-18",
      image: "/placeholder.svg?height=40&width=40&text=Хивс",
    },
    {
      id: 3,
      product: "Ямаа бяслаг",
      seller: "Уулын малчид",
      quantity: 2,
      amount: 70,
      status: "processing",
      date: "2024-12-15",
      image: "/placeholder.svg?height=40&width=40&text=Бяслаг",
    },
  ]

  const favorites = [
    {
      id: 1,
      name: "Алтайн уулсын гэр бааз",
      location: "Баян-Өлгий аймаг",
      price: 160,
      rating: 4.6,
      type: "camp",
      image: "/placeholder.svg?height=60&width=60&text=Уул",
    },
    {
      id: 2,
      name: "Монгол гутал",
      seller: "Нүүдэлчдийн урлал",
      price: 85,
      rating: 4.8,
      type: "product",
      image: "/placeholder.svg?height=60&width=60&text=Гутал",
    },
    {
      id: 3,
      name: "Орхоны хөндийн бааз",
      location: "Өвөрхангай аймаг",
      price: 140,
      rating: 4.5,
      type: "camp",
      image: "/placeholder.svg?height=60&width=60&text=Хөндий",
    },
  ]

  const travelRoutes = [
    {
      id: 1,
      title: "Northern Lakes Adventure",
      duration: "7 days",
      regions: ["Khövsgöl Lake", "Orkhon Valley", "Amarbayasgalant Monastery"],
      status: "saved",
      createdDate: "2024-12-15",
      totalDistance: "1,250 km",
      estimatedCost: 850,
      difficulty: "moderate",
      attractions: [
        {
          name: "Khövsgöl Lake",
          type: "lake",
          duration: "3 days",
          activities: ["Horseback riding", "Boat tours", "Camping"],
          image: "/placeholder.svg?height=60&width=60&text=Lake",
        },
        {
          name: "Orkhon Valley",
          type: "valley",
          duration: "2 days",
          activities: ["Hiking", "Cultural tours", "Photography"],
          image: "/placeholder.svg?height=60&width=60&text=Valley",
        },
        {
          name: "Amarbayasgalant Monastery",
          type: "cultural",
          duration: "2 days",
          activities: ["Temple visits", "Meditation", "Local crafts"],
          image: "/placeholder.svg?height=60&width=60&text=Temple",
        },
      ],
      weatherSeason: "summer",
      childFriendly: true,
      transportation: "4WD vehicle + guide",
      accommodations: ["Ger camps", "Guesthouses"],
      notes: "Perfect for families, includes cultural experiences and natural beauty",
    },
    {
      id: 2,
      title: "Gobi Desert Explorer",
      duration: "5 days",
      regions: ["Gobi Desert", "Flaming Cliffs", "Khermen Tsav"],
      status: "completed",
      createdDate: "2024-11-20",
      completedDate: "2024-12-01",
      totalDistance: "980 km",
      estimatedCost: 720,
      difficulty: "challenging",
      attractions: [
        {
          name: "Gobi Desert",
          type: "desert",
          duration: "2 days",
          activities: ["Camel riding", "Sand dune climbing", "Stargazing"],
          image: "/placeholder.svg?height=60&width=60&text=Desert",
        },
        {
          name: "Flaming Cliffs",
          type: "geological",
          duration: "1 day",
          activities: ["Fossil hunting", "Photography", "Hiking"],
          image: "/placeholder.svg?height=60&width=60&text=Cliffs",
        },
        {
          name: "Khermen Tsav",
          type: "canyon",
          duration: "2 days",
          activities: ["Canyon exploration", "Rock climbing", "Wildlife watching"],
          image: "/placeholder.svg?height=60&width=60&text=Canyon",
        },
      ],
      weatherSeason: "autumn",
      childFriendly: false,
      transportation: "Specialized desert vehicle",
      accommodations: ["Desert camps", "Traditional gers"],
      notes: "Completed trip - Amazing desert landscapes and dinosaur fossils!",
      rating: 5,
      review:
        "Incredible experience! The desert sunsets were breathtaking and our guide was very knowledgeable about the fossil sites.",
    },
    {
      id: 3,
      title: "Western Mongolia Expedition",
      duration: "10 days",
      regions: ["Altai Mountains", "Uvs Lake", "Kazakh Eagle Hunters"],
      status: "planning",
      createdDate: "2024-12-28",
      totalDistance: "1,800 km",
      estimatedCost: 1200,
      difficulty: "extreme",
      attractions: [
        {
          name: "Altai Mountains",
          type: "mountains",
          duration: "4 days",
          activities: ["Mountain climbing", "Glacier viewing", "Wildlife photography"],
          image: "/placeholder.svg?height=60&width=60&text=Mountains",
        },
        {
          name: "Uvs Lake",
          type: "lake",
          duration: "3 days",
          activities: ["Bird watching", "Fishing", "Cultural immersion"],
          image: "/placeholder.svg?height=60&width=60&text=UvsLake",
        },
        {
          name: "Kazakh Eagle Hunters",
          type: "cultural",
          duration: "3 days",
          activities: ["Eagle hunting demonstration", "Horseback riding", "Traditional crafts"],
          image: "/placeholder.svg?height=60&width=60&text=Eagle",
        },
      ],
      weatherSeason: "winter",
      childFriendly: false,
      transportation: "Specialized mountain vehicle + horses",
      accommodations: ["Mountain lodges", "Kazakh family stays"],
      notes: "Advanced expedition requiring good physical fitness and cold weather gear",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-display">Хэрэглэгчийн хянах самбар</h1>
          <p className="text-gray-600 text-sm sm:text-base font-medium">
            Захиалга, бараа болон аяллын тохиргоогоо удирдах
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-6 min-w-[600px] sm:min-w-0">
              <TabsTrigger value="overview" className="text-xs sm:text-sm font-semibold">
                Тойм
              </TabsTrigger>
              <TabsTrigger value="bookings" className="text-xs sm:text-sm font-semibold">
                Миний захиалгууд
              </TabsTrigger>
              <TabsTrigger value="orders" className="text-xs sm:text-sm font-semibold">
                Барааны захиалга
              </TabsTrigger>
              <TabsTrigger value="favorites" className="text-xs sm:text-sm font-semibold">
                Хадгалсан
              </TabsTrigger>
              <TabsTrigger value="routes" className="text-xs sm:text-sm font-semibold">
                Маршрут
              </TabsTrigger>
              <TabsTrigger value="profile" className="text-xs sm:text-sm font-semibold">
                Профайл
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-semibold">Нийт захиалга</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">{user.totalBookings}</div>
                  <p className="text-xs text-muted-foreground font-medium">Энэ сард +1</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-semibold">Барааны захиалга</CardTitle>
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">{user.totalOrders}</div>
                  <p className="text-xs text-muted-foreground font-medium">Энэ сард +3</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-semibold">Нийт зарцуулсан</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">${user.totalSpent}</div>
                  <p className="text-xs text-muted-foreground font-medium">Энэ сард +$320</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-semibold">Хадгалсан</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">{favorites.length}</div>
                  <p className="text-xs text-muted-foreground font-medium">Хадгалсан</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl font-bold">Ирэх захиалгууд</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {bookings
                      .filter((booking) => booking.status === "upcoming" || booking.status === "confirmed")
                      .map((booking) => (
                        <div key={booking.id} className="flex items-center space-x-4">
                          <img
                            src={booking.image || "/placeholder.svg"}
                            alt={booking.camp}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-sm sm:text-base truncate">{booking.camp}</p>
                            <p className="text-xs sm:text-sm text-gray-600 truncate font-medium">{booking.location}</p>
                            <p className="text-xs text-gray-500 font-medium">
                              {booking.checkIn} - {booking.checkOut}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm sm:text-base">${booking.amount}</p>
                            <Badge
                              variant={booking.status === "confirmed" ? "default" : "secondary"}
                              className="text-xs font-medium"
                            >
                              {booking.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl font-bold">Сүүлийн захиалгууд</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orders.slice(0, 3).map((order) => (
                      <div key={order.id} className="flex items-center space-x-4">
                        <img
                          src={order.image || "/placeholder.svg"}
                          alt={order.product}
                          className="w-10 h-10 rounded object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm sm:text-base truncate">{order.product}</p>
                          <p className="text-xs sm:text-sm text-gray-600 truncate font-medium">{order.seller}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm sm:text-base">${order.amount}</p>
                          <Badge
                            variant={order.status === "delivered" ? "default" : "secondary"}
                            className="text-xs font-medium"
                          >
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl sm:text-2xl font-bold">Миний захиалгууд</h2>
              <Button className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto font-semibold">
                Шинэ бааз захиалах
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {bookings.map((booking) => (
                <Card key={booking.id} className="overflow-hidden">
                  <div className="aspect-video bg-gray-100 flex items-center justify-center">
                    <img
                      src={booking.image || "/placeholder.svg"}
                      alt={booking.camp}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-base sm:text-lg truncate flex-1">{booking.camp}</h3>
                      <Badge
                        variant={
                          booking.status === "completed"
                            ? "default"
                            : booking.status === "confirmed"
                              ? "secondary"
                              : "outline"
                        }
                        className="text-xs ml-2 font-medium"
                      >
                        {booking.status}
                      </Badge>
                    </div>
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="text-sm truncate font-medium">{booking.location}</span>
                    </div>
                    <div className="flex items-center text-gray-600 mb-4">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span className="text-sm font-medium">
                        {booking.checkIn} - {booking.checkOut}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xl font-bold">${booking.amount}</span>
                        <span className="text-gray-600 ml-1 text-sm font-medium">total</span>
                      </div>
                      <span className="text-sm text-gray-600 font-medium">{booking.guests} guests</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl sm:text-2xl font-bold">Миний барааны захиалгууд</h2>
              <Button className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto font-semibold">
                Бүх бараа
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-semibold">Захиалгын №</TableHead>
                        <TableHead className="min-w-[150px] font-semibold">Бараа</TableHead>
                        <TableHead className="min-w-[120px] font-semibold">Борлуулагч</TableHead>
                        <TableHead className="font-semibold">Тоо</TableHead>
                        <TableHead className="font-semibold">Дүн</TableHead>
                        <TableHead className="font-semibold">Төлөв</TableHead>
                        <TableHead className="hidden sm:table-cell font-semibold">Огноо</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-semibold">#{order.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <img
                                src={order.image || "/placeholder.svg"}
                                alt={order.product}
                                className="w-8 h-8 rounded object-cover"
                              />
                              <span className="truncate max-w-[120px] font-medium">{order.product}</span>
                            </div>
                          </TableCell>
                          <TableCell className="truncate max-w-[120px] font-medium">{order.seller}</TableCell>
                          <TableCell className="font-medium">{order.quantity}</TableCell>
                          <TableCell className="font-bold">${order.amount}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                order.status === "delivered"
                                  ? "default"
                                  : order.status === "shipped"
                                    ? "secondary"
                                    : "outline"
                              }
                              className="font-medium"
                            >
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell font-medium">{order.date}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl sm:text-2xl font-bold">Миний хадгалсан зүйлс</h2>
              <Button variant="outline" className="w-full sm:w-auto bg-transparent font-semibold">
                Бүгдийг цэвэрлэх
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {favorites.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <div className="aspect-video bg-gray-100 flex items-center justify-center">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-base sm:text-lg truncate flex-1">{item.name}</h3>
                      <Badge variant="outline" className="text-xs ml-2 font-medium">
                        {item.type}
                      </Badge>
                    </div>
                    {item.type === "camp" ? (
                      <div className="flex items-center text-gray-600 mb-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="text-sm truncate font-medium">{item.location}</span>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600 mb-2 font-medium">by {item.seller}</p>
                    )}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                        <span className="text-sm font-semibold">{item.rating}</span>
                      </div>
                      <span className="text-xl font-bold">${item.price}</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700 font-semibold">
                        {item.type === "camp" ? "Одоо захиалах" : "Сагсанд нэмэх"}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Travel Routes Tab */}
          <TabsContent value="routes" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Миний аяллын маршрут</h2>
                <p className="text-gray-600 text-sm font-medium">Таны сонирхолд нийцсэн хувийн маршрут</p>
              </div>
              <Button className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto font-semibold">
                Шинэ маршрут үүсгэх
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {travelRoutes.map((route) => (
                <Card key={route.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-4 sm:p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                        {/* Route Header */}
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-4">
                            <div>
                              <h3 className="font-bold text-lg sm:text-xl mb-2 font-display">{route.title}</h3>
                              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <Clock className="w-4 h-4 mr-1" />
                                  <span className="font-medium">{route.duration}</span>
                                </div>
                                <div className="flex items-center">
                                  <MapPin className="w-4 h-4 mr-1" />
                                  <span className="font-medium">{route.totalDistance}</span>
                                </div>
                                <div className="flex items-center">
                                  <Package className="w-4 h-4 mr-1" />
                                  <span className="font-medium">${route.estimatedCost}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-start sm:items-end gap-2">
                              <Badge
                                variant={
                                  route.status === "completed"
                                    ? "default"
                                    : route.status === "planning"
                                      ? "secondary"
                                      : "outline"
                                }
                                className="font-medium"
                              >
                                {route.status}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={`font-medium ${
                                  route.difficulty === "extreme"
                                    ? "border-red-500 text-red-600"
                                    : route.difficulty === "challenging"
                                      ? "border-orange-500 text-orange-600"
                                      : "border-green-500 text-green-600"
                                }`}
                              >
                                {route.difficulty}
                              </Badge>
                            </div>
                          </div>

                          {/* Route Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <h4 className="font-bold text-sm text-gray-700 mb-2">Trip Details</h4>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600 font-medium">Season:</span>
                                  <span className="capitalize font-semibold">{route.weatherSeason}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600 font-medium">Child Friendly:</span>
                                  <span
                                    className={`font-semibold ${route.childFriendly ? "text-green-600" : "text-red-600"}`}
                                  >
                                    {route.childFriendly ? "Yes" : "No"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600 font-medium">Transportation:</span>
                                  <span className="text-right font-semibold">{route.transportation}</span>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-gray-700 mb-2">Accommodations</h4>
                              <div className="flex flex-wrap gap-1">
                                {route.accommodations.map((acc, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs font-medium">
                                    {acc}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Attractions */}
                          <div className="mb-4">
                            <h4 className="font-bold text-sm text-gray-700 mb-3">Attractions & Activities</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {route.attractions.map((attraction, index) => (
                                <div key={index} className="border rounded-lg p-3 bg-gray-50">
                                  <div className="flex items-center space-x-3 mb-2">
                                    <img
                                      src={attraction.image || "/placeholder.svg"}
                                      alt={attraction.name}
                                      className="w-10 h-10 rounded object-cover"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <h5 className="font-semibold text-sm truncate">{attraction.name}</h5>
                                      <p className="text-xs text-gray-600 capitalize font-medium">
                                        {attraction.type} • {attraction.duration}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {attraction.activities.slice(0, 2).map((activity, actIndex) => (
                                      <Badge key={actIndex} variant="outline" className="text-xs font-medium">
                                        {activity}
                                      </Badge>
                                    ))}
                                    {attraction.activities.length > 2 && (
                                      <Badge variant="outline" className="text-xs font-medium">
                                        +{attraction.activities.length - 2} more
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Notes and Review */}
                          <div className="mb-4">
                            <p className="text-sm text-gray-700 italic font-medium">{route.notes}</p>
                            {route.review && (
                              <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                                <div className="flex items-center mb-1">
                                  <div className="flex">
                                    {[...Array(route.rating)].map((_, i) => (
                                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    ))}
                                  </div>
                                  <span className="ml-2 text-sm font-semibold">Your Review</span>
                                </div>
                                <p className="text-sm text-gray-700 font-medium">"{route.review}"</p>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-2">
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 font-semibold">
                              {route.status === "completed"
                                ? "Ижил аялал захиалах"
                                : route.status === "planning"
                                  ? "Захиалгаа баталгаажуулах"
                                  : "Энэ маршрутыг ашиглах"}
                            </Button>
                            <Button variant="outline" size="sm" className="font-semibold bg-transparent">
                              Газрын зураг дээр харах
                            </Button>
                            <Button variant="outline" size="sm" className="font-semibold bg-transparent">
                              Маршрутыг хуваалцах
                            </Button>
                            {route.status === "completed" && (
                              <Button variant="outline" size="sm" className="font-semibold bg-transparent">
                                Сэтгэгдэл бичих
                              </Button>
                            )}
                          </div>

                          {/* Dates */}
                          <div className="flex justify-between items-center mt-4 pt-4 border-t text-xs text-gray-500">
                            <span className="font-medium">Created: {route.createdDate}</span>
                            {route.completedDate && (
                              <span className="font-medium">Completed: {route.completedDate}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-emerald-600">
                    {travelRoutes.filter((r) => r.status === "completed").length}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Completed Routes</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {travelRoutes.filter((r) => r.status === "planning").length}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Planning</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {travelRoutes.reduce((total, route) => total + Number.parseInt(route.duration), 0)}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Total Days Planned</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    ${travelRoutes.reduce((total, route) => total + route.estimatedCost, 0)}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Total Investment</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold">Профайл тохиргоо</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-bold">Хувийн мэдээлэл</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Бүтэн нэр</label>
                    <Input defaultValue={user.name} className="font-medium" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Имэйл</label>
                    <Input defaultValue={user.email} className="font-medium" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Утас</label>
                    <Input defaultValue={user.phone} className="font-medium" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Байршил</label>
                    <Input defaultValue={user.location} className="font-medium" />
                  </div>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 font-semibold">Профайл шинэчлэх</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-bold">Дансны тойм</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 font-medium">Гишүүн болсон огноо</span>
                    <span className="font-semibold">{user.joinDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 font-medium">Нийт захиалга</span>
                    <span className="font-semibold">{user.totalBookings}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 font-medium">Нийт барааны захиалга</span>
                    <span className="font-semibold">{user.totalOrders}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 font-medium">Нийт зарцуулсан</span>
                    <span className="font-semibold">${user.totalSpent}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 font-medium">Хамгийн дуртай газар</span>
                    <span className="font-semibold">{user.favoriteDestination}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
