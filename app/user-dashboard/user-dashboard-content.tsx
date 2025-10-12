"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Calendar, MapPin, Star, Package, Heart, ShoppingBag, Clock, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useQuery } from "@apollo/client"
import '../../lib/i18n'
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"
import { GET_USER_BOOKINGS, GET_USER_ORDERS, GET_USER_TRAVEL_BOOKINGS, GET_AVAILABLE_YURTS, GET_AVAILABLE_PRODUCTS, GET_AVAILABLE_TRAVELS } from "./queries"

// Type definitions
interface Booking {
  id: string
  camp: string
  location: string
  checkIn: string
  checkOut: string
  guests: number
  amount: number
  status: string
  image: string
}

interface Order {
  id: string
  product: string
  seller: string
  quantity: number
  amount: number
  status: string
  date: string
  image: string
}

interface TravelBooking {
  id: string
  travel: string
  location: string
  startDate: string
  numberOfPeople: number
  amount: number
  status: string
  image: string
}

interface Favorite {
  id: string
  name: string
  location?: string
  seller?: string
  price: number
  rating: number
  type: string
  image: string
}

interface TravelRoute {
  id: string
  title: string
  duration: string
  regions: string[]
  status: string
  createdDate: string
  completedDate?: string
  totalDistance: string
  estimatedCost: number
  difficulty: string
  attractions: Array<{
    name: string
    type: string
    duration: string
    activities: string[]
    image: string
  }>
  weatherSeason: string
  childFriendly: boolean
  transportation: string
  accommodations: string[]
  notes: string
  rating?: number
  review?: string
}

export default function UserDashboardContent() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState("overview")
  const { logout, user } = useAuth()

  // Fetch real data from database
  const { data: bookingsData, loading: bookingsLoading } = useQuery(GET_USER_BOOKINGS, {
    variables: { userId: user?.id },
    skip: !user?.id
  })

  const { data: ordersData, loading: ordersLoading } = useQuery(GET_USER_ORDERS, {
    variables: { userId: user?.id },
    skip: !user?.id
  })

  const { data: travelBookingsData, loading: travelBookingsLoading } = useQuery(GET_USER_TRAVEL_BOOKINGS, {
    variables: { userId: user?.id },
    skip: !user?.id
  })

  const { data: yurtsData, loading: yurtsLoading } = useQuery(GET_AVAILABLE_YURTS)
  const { data: productsData, loading: productsLoading } = useQuery(GET_AVAILABLE_PRODUCTS)
  const { data: travelsData, loading: travelsLoading } = useQuery(GET_AVAILABLE_TRAVELS)

  // Transform data for display
  const bookings: Booking[] = bookingsData?.bookings?.edges?.map((edge: any) => ({
    id: edge.node.id,
    camp: edge.node.yurt.name,
    location: edge.node.yurt.location,
    checkIn: edge.node.startDate,
    checkOut: edge.node.endDate,
    guests: 2, // Default since we don't have guest count in the schema
    amount: edge.node.totalPrice,
    status: edge.node.status.toLowerCase(),
    image: edge.node.yurt.images || "/placeholder.svg"
  })) || []

  const orders: Order[] = ordersData?.orders?.edges?.map((edge: any) => ({
    id: edge.node.id,
    product: edge.node.items[0]?.product.name || "Multiple items",
    seller: "Seller", // We don't have seller info in current schema
    quantity: edge.node.items.reduce((sum: number, item: any) => sum + item.quantity, 0),
    amount: edge.node.totalPrice,
    status: edge.node.status.toLowerCase(),
    date: edge.node.createdAt.split('T')[0],
    image: edge.node.items[0]?.product.images || "/placeholder.svg"
  })) || []

  const travelBookings: TravelBooking[] = travelBookingsData?.travelBookings?.edges?.map((edge: any) => ({
    id: edge.node.id,
    travel: edge.node.travel.name,
    location: edge.node.travel.location,
    startDate: edge.node.startDate,
    numberOfPeople: edge.node.numberOfPeople,
    amount: edge.node.totalPrice,
    status: edge.node.status.toLowerCase(),
    image: edge.node.travel.images || "/placeholder.svg"
  })) || []

  // Calculate stats
  const totalBookings = bookings.length
  const totalOrders = orders.length
  const totalSpent = orders.reduce((sum: number, order: Order) => sum + order.amount, 0) + 
                    bookings.reduce((sum: number, booking: Booking) => sum + booking.amount, 0) +
                    travelBookings.reduce((sum: number, booking: TravelBooking) => sum + booking.amount, 0)


  // Create favorites from available data
  const favorites: Favorite[] = [
    ...(yurtsData?.yurts?.edges?.slice(0, 2).map((edge: any) => ({
      id: edge.node.id,
      name: edge.node.name,
      location: edge.node.location,
      price: edge.node.pricePerNight,
      rating: 4.5, // Default rating
      type: "camp",
      image: edge.node.images || "/placeholder.svg"
    })) || []),
    ...(productsData?.products?.edges?.slice(0, 1).map((edge: any) => ({
      id: edge.node.id,
      name: edge.node.name,
      seller: "Seller",
      price: edge.node.price,
      rating: 4.8, // Default rating
      type: "product",
      image: edge.node.images || "/placeholder.svg"
    })) || [])
  ]

  // Create travel routes from available travel data
  const travelRoutes: TravelRoute[] = travelsData?.travels?.edges?.map((edge: any) => ({
    id: edge.node.id,
    title: edge.node.name,
    duration: `${edge.node.duration} days`,
    regions: [edge.node.location],
      status: "saved",
    createdDate: edge.node.createdAt.split('T')[0],
    totalDistance: "N/A",
    estimatedCost: edge.node.basePrice,
      difficulty: "moderate",
      attractions: [
        {
        name: edge.node.name,
        type: "travel",
        duration: `${edge.node.duration} days`,
        activities: ["Travel", "Exploration"],
        image: edge.node.images || "/placeholder.svg"
      }
      ],
      weatherSeason: "summer",
      childFriendly: true,
    transportation: "Guided tour",
    accommodations: ["Ger camps"],
    notes: edge.node.description
  })) || []

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-display">Хэрэглэгчийн хянах самбар</h1>
          <p className="text-gray-600 text-sm sm:text-base font-medium">
            Захиалга, бараа болон аяллын тохиргоогоо удирдах
          </p>
        </div>

        <div className="flex justify-end mb-4">
          <Button variant="outline" onClick={logout} className="flex items-center gap-2">
            <LogOut className="w-4 h-4" /> Гарах
          </Button>
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
                  <div className="text-xl sm:text-2xl font-bold">{totalBookings}</div>
                  <p className="text-xs text-muted-foreground font-medium">Энэ сард +1</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-semibold">Барааны захиалга</CardTitle>
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">{totalOrders}</div>
                  <p className="text-xs text-muted-foreground font-medium">Энэ сард +3</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-semibold">Нийт зарцуулсан</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">${totalSpent.toFixed(0)}</div>
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
                      .filter((booking: Booking) => booking.status === "upcoming" || booking.status === "confirmed")
                      .map((booking: Booking) => (
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
                    {orders.slice(0, 3).map((order: Order) => (
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
              {user?.role === 'user' && (
                <Link href="/camps">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto font-semibold">
                    Шинэ бааз захиалах
                  </Button>
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {bookings.map((booking: Booking) => (
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
                      {orders.map((order: Order) => (
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
              {favorites.map((item: Favorite) => (
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
              {travelRoutes.map((route: TravelRoute) => (
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
                                {route.accommodations.map((acc: string, index: number) => (
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
                              {route.attractions.map((attraction: any, index: number) => (
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
                                    {attraction.activities.slice(0, 2).map((activity: string, actIndex: number) => (
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
                    {travelRoutes.filter((r: TravelRoute) => r.status === "completed").length}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Completed Routes</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {travelRoutes.filter((r: TravelRoute) => r.status === "planning").length}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Planning</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {travelRoutes.reduce((total: number, route: TravelRoute) => total + Number.parseInt(route.duration), 0)}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Total Days Planned</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    ${travelRoutes.reduce((total: number, route: TravelRoute) => total + route.estimatedCost, 0)}
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
                    <Input defaultValue={user?.name || ""} className="font-medium" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Имэйл</label>
                    <Input defaultValue={user?.email || ""} className="font-medium" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Утас</label>
                    <Input defaultValue="+976 9911 2233" className="font-medium" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Байршил</label>
                    <Input defaultValue="Улаанбаатар, Монгол" className="font-medium" />
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
                    <span className="font-semibold">2024 оны 1-р сар</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 font-medium">Нийт захиалга</span>
                    <span className="font-semibold">{totalBookings}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 font-medium">Нийт барааны захиалга</span>
                    <span className="font-semibold">{totalOrders}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 font-medium">Нийт зарцуулсан</span>
                    <span className="font-semibold">${totalSpent.toFixed(0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 font-medium">Хамгийн дуртай газар</span>
                    <span className="font-semibold">Хөвсгөл нуур</span>
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
