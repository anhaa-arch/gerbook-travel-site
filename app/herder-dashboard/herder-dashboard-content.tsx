"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Plus, Package, Home, Edit, Trash2, Star, TrendingUp, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Header } from "@/components/header"
import "../../lib/i18n"

export default function HerderDashboardContent() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState("overview")
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [showAddCamp, setShowAddCamp] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Mock herder data
  const herder = {
    name: "Ганбаатар Батбаяр",
    email: "batbayar@email.com",
    phone: "+976 9999 5678",
    location: "Архангай аймаг",
    joinDate: "2023 оны 3-р сар",
    totalProducts: 15,
    totalCamps: 2,
    totalEarnings: 2450,
    rating: 4.8,
  }

  const products = [
    {
      id: 1,
      name: "Айраг",
      category: "Сүүн бүтээгдэхүүн",
      price: 25,
      stock: 50,
      sold: 120,
      status: "active",
      image: "/placeholder.svg?height=60&width=60&text=Айраг",
    },
    {
      id: 2,
      name: "Ямаа бяслаг",
      category: "Сүүн бүтээгдэхүүн",
      price: 35,
      stock: 25,
      sold: 45,
      status: "active",
      image: "/placeholder.svg?height=60&width=60&text=Бяслаг",
    },
    {
      id: 3,
      name: "Хатаасан мах",
      category: "Мах",
      price: 45,
      stock: 0,
      sold: 78,
      status: "out_of_stock",
      image: "/placeholder.svg?height=60&width=60&text=Мах",
    },
  ]

  const camps = [
    {
      id: 1,
      name: "Найман нуур эко гэр бааз",
      location: "Архангай аймаг",
      price: 120,
      capacity: 20,
      bookings: 45,
      rating: 4.8,
      status: "active",
      image: "/placeholder.svg?height=60&width=60&text=Бааз",
    },
    {
      id: 2,
      name: "Уулын үзэмжит гэр бааз",
      location: "Архангай аймаг",
      price: 95,
      capacity: 12,
      bookings: 23,
      rating: 4.6,
      status: "active",
      image: "/placeholder.svg?height=60&width=60&text=Уул",
    },
  ]

  const orders = [
    {
      id: 1,
      customer: "Сараа Жонсон",
      product: "Айраг",
      quantity: 3,
      amount: 75,
      status: "completed",
      date: "2024-12-20",
    },
    {
      id: 2,
      customer: "Майк Чен",
      product: "Ямаа бяслаг",
      quantity: 2,
      amount: 70,
      status: "shipped",
      date: "2024-12-18",
    },
    {
      id: 3,
      customer: "Эмма Вилсон",
      product: "Хатаасан мах",
      quantity: 1,
      amount: 45,
      status: "processing",
      date: "2024-12-15",
    },
  ]

  const bookings = [
    {
      id: 1,
      customer: "Жон Смит",
      camp: "Найман нуур эко гэр бааз",
      checkIn: "2024-07-15",
      checkOut: "2024-07-18",
      guests: 2,
      amount: 360,
      status: "confirmed",
    },
    {
      id: 2,
      customer: "Лиза Ван",
      camp: "Уулын үзэмжит гэр бааз",
      checkIn: "2024-08-10",
      checkOut: "2024-08-12",
      guests: 4,
      amount: 190,
      status: "completed",
    },
  ]

  const handleDelete = (item: any) => {
    setSelectedItem(item)
    setShowDeleteDialog(true)
  }

  const confirmDelete = () => {
    console.log("Deleting:", selectedItem)
    setShowDeleteDialog(false)
    setSelectedItem(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-display">Малчны самбар</h1>
          <p className="text-gray-600 text-sm sm:text-base font-medium">Өөрийн бүтээгдэхүүн, бааз, захиалгаа удирдаарай</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-5 min-w-[500px] sm:min-w-0">
              <TabsTrigger value="overview" className="text-xs sm:text-sm font-medium">
                Overview
              </TabsTrigger>
              <TabsTrigger value="products" className="text-xs sm:text-sm font-medium">
                Products
              </TabsTrigger>
              <TabsTrigger value="camps" className="text-xs sm:text-sm font-medium">
                Camps
              </TabsTrigger>
              <TabsTrigger value="orders" className="text-xs sm:text-sm font-medium">
                Orders
              </TabsTrigger>
              <TabsTrigger value="profile" className="text-xs sm:text-sm font-medium">
                Profile
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-semibold">Total Products</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">{herder.totalProducts}</div>
                  <p className="text-xs text-muted-foreground font-medium">+2 from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-semibold">Active Camps</CardTitle>
                  <Home className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">{herder.totalCamps}</div>
                  <p className="text-xs text-muted-foreground font-medium">All active</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-semibold">Total Earnings</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">${herder.totalEarnings}</div>
                  <p className="text-xs text-muted-foreground font-medium">+15% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-semibold">Average Rating</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">{herder.rating}</div>
                  <p className="text-xs text-muted-foreground font-medium">Based on 89 reviews</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl font-bold">Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm sm:text-base truncate">{order.customer}</p>
                          <p className="text-xs sm:text-sm text-gray-600 truncate font-medium">{order.product}</p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-bold text-sm sm:text-base">${order.amount}</p>
                          <Badge
                            variant={order.status === "completed" ? "default" : "secondary"}
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

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl font-bold">Recent Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm sm:text-base truncate">{booking.customer}</p>
                          <p className="text-xs sm:text-sm text-gray-600 truncate font-medium">{booking.camp}</p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-bold text-sm sm:text-base">${booking.amount}</p>
                          <Badge
                            variant={booking.status === "completed" ? "default" : "secondary"}
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
            </div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl sm:text-2xl font-bold">My Products</h2>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto font-semibold"
                onClick={() => setShowAddProduct(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Product
              </Button>
            </div>

            {showAddProduct && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="font-bold">Add New Product</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowAddProduct(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name</label>
                      <Input placeholder="Enter product name" className="font-medium" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dairy">Dairy Products</SelectItem>
                          <SelectItem value="meat">Meat Products</SelectItem>
                          <SelectItem value="handicrafts">Handicrafts</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Price ($)</label>
                      <Input type="number" placeholder="0.00" className="font-medium" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Stock Quantity</label>
                      <Input type="number" placeholder="0" className="font-medium" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <Textarea placeholder="Describe your product..." className="font-medium" />
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700 font-semibold"
                      onClick={() => setShowAddProduct(false)}
                    >
                      Save Product
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddProduct(false)} className="font-medium">
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <div className="aspect-video bg-gray-100 flex items-center justify-center">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-base sm:text-lg truncate flex-1">{product.name}</h3>
                      <Badge
                        variant={product.status === "active" ? "default" : "destructive"}
                        className="text-xs ml-2 font-medium"
                      >
                        {product.status}
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm mb-2 capitalize font-medium">{product.category}</p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xl font-bold">${product.price}</span>
                      <span className="text-sm text-gray-600 font-medium">Stock: {product.stock}</span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-600 font-medium">Sold: {product.sold}</span>
                      <span className="text-sm text-emerald-600 font-bold">
                        ${(product.price * product.sold).toFixed(0)} earned
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent font-medium">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(product)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Camps Tab */}
          <TabsContent value="camps" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl sm:text-2xl font-bold">My Ger Camps</h2>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto font-semibold"
                onClick={() => setShowAddCamp(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Camp
              </Button>
            </div>

            {showAddCamp && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="font-bold">Add New Camp</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowAddCamp(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Camp Name</label>
                      <Input placeholder="Enter camp name" className="font-medium" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                      <Input placeholder="Province, District" className="font-medium" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Price per Night ($)</label>
                      <Input type="number" placeholder="0.00" className="font-medium" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Guest Capacity</label>
                      <Input type="number" placeholder="0" className="font-medium" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <Textarea placeholder="Describe your camp..." className="font-medium" />
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700 font-semibold"
                      onClick={() => setShowAddCamp(false)}
                    >
                      Save Camp
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddCamp(false)} className="font-medium">
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {camps.map((camp) => (
                <Card key={camp.id} className="overflow-hidden">
                  <div className="aspect-video bg-gray-100 flex items-center justify-center">
                    <img
                      src={camp.image || "/placeholder.svg"}
                      alt={camp.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-base sm:text-lg truncate flex-1">{camp.name}</h3>
                      <Badge variant="default" className="text-xs ml-2 font-medium">
                        {camp.status}
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 font-medium">{camp.location}</p>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Price per night</p>
                        <p className="text-xl font-bold">${camp.price}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Capacity</p>
                        <p className="text-xl font-bold">{camp.capacity} guests</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                        <span className="text-sm font-semibold">{camp.rating}</span>
                      </div>
                      <span className="text-sm text-gray-600 font-medium">{camp.bookings} bookings</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent font-medium">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(camp)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold">Product Orders & Camp Bookings</h2>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-bold">Product Orders</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="font-semibold">Order ID</TableHead>
                          <TableHead className="min-w-[120px] font-semibold">Customer</TableHead>
                          <TableHead className="min-w-[120px] font-semibold">Product</TableHead>
                          <TableHead className="font-semibold">Qty</TableHead>
                          <TableHead className="font-semibold">Amount</TableHead>
                          <TableHead className="font-semibold">Status</TableHead>
                          <TableHead className="hidden sm:table-cell font-semibold">Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-bold">#{order.id}</TableCell>
                            <TableCell className="truncate max-w-[120px] font-medium">{order.customer}</TableCell>
                            <TableCell className="truncate max-w-[120px] font-medium">{order.product}</TableCell>
                            <TableCell className="font-medium">{order.quantity}</TableCell>
                            <TableCell className="font-bold">${order.amount}</TableCell>
                            <TableCell>
                              <Badge
                                variant={order.status === "completed" ? "default" : "secondary"}
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

              <Card>
                <CardHeader>
                  <CardTitle className="font-bold">Camp Bookings</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="font-semibold">Booking ID</TableHead>
                          <TableHead className="min-w-[120px] font-semibold">Customer</TableHead>
                          <TableHead className="min-w-[150px] font-semibold">Camp</TableHead>
                          <TableHead className="hidden sm:table-cell font-semibold">Check-in</TableHead>
                          <TableHead className="hidden sm:table-cell font-semibold">Check-out</TableHead>
                          <TableHead className="font-semibold">Guests</TableHead>
                          <TableHead className="font-semibold">Amount</TableHead>
                          <TableHead className="font-semibold">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bookings.map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell className="font-bold">#{booking.id}</TableCell>
                            <TableCell className="truncate max-w-[120px] font-medium">{booking.customer}</TableCell>
                            <TableCell className="truncate max-w-[150px] font-medium">{booking.camp}</TableCell>
                            <TableCell className="hidden sm:table-cell font-medium">{booking.checkIn}</TableCell>
                            <TableCell className="hidden sm:table-cell font-medium">{booking.checkOut}</TableCell>
                            <TableCell className="font-medium">{booking.guests}</TableCell>
                            <TableCell className="font-bold">${booking.amount}</TableCell>
                            <TableCell>
                              <Badge
                                variant={booking.status === "completed" ? "default" : "secondary"}
                                className="font-medium"
                              >
                                {booking.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold">Profile Settings</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-bold">Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                    <Input defaultValue={herder.name} className="font-medium" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <Input defaultValue={herder.email} className="font-medium" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                    <Input defaultValue={herder.phone} className="font-medium" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                    <Input defaultValue={herder.location} className="font-medium" />
                  </div>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 font-semibold">{t('user.update_profile')}</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-bold">Account Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 font-medium">Member since</span>
                    <span className="font-semibold">{herder.joinDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 font-medium">Total products</span>
                    <span className="font-semibold">{herder.totalProducts}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 font-medium">Active camps</span>
                    <span className="font-semibold">{herder.totalCamps}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 font-medium">Total earnings</span>
                    <span className="font-bold text-emerald-600">${herder.totalEarnings}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 font-medium">Average rating</span>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="font-semibold">{herder.rating}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-bold">Confirm Delete</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 font-medium">
                Are you sure you want to delete this item? This action cannot be undone.
              </p>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <Button variant="destructive" onClick={confirmDelete} className="w-full sm:w-auto font-semibold">
                  Delete
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteDialog(false)}
                  className="w-full sm:w-auto font-medium"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
