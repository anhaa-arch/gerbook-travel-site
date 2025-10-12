"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Plus, Package, Home, Edit, Trash2, Star, TrendingUp, X, LogOut } from "lucide-react"
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
import { useQuery, useMutation } from "@apollo/client"
import '../../lib/i18n'
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/components/ui/use-toast"
import { GET_HERDER_STATS, GET_HERDER_PRODUCTS, GET_HERDER_YURTS, GET_HERDER_ORDERS, GET_HERDER_BOOKINGS, CREATE_YURT, UPDATE_YURT, DELETE_YURT, CREATE_PRODUCT, UPDATE_PRODUCT, DELETE_PRODUCT } from "./queries"

export default function HerderDashboardContent() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState("overview")
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [showAddCamp, setShowAddCamp] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const { logout, user } = useAuth()
  const { toast } = useToast()

  // Form states
  const [yurtForm, setYurtForm] = useState({
    name: "",
    description: "",
    location: "",
    pricePerNight: "",
    capacity: "",
    amenities: "",
    images: ""
  })
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    images: "",
    categoryId: ""
  })

  // Fetch real data from database
  const { data: statsData, loading: statsLoading } = useQuery(GET_HERDER_STATS, {
    variables: { userId: user?.id },
    skip: !user?.id
  })
  const { data: productsData, loading: productsLoading } = useQuery(GET_HERDER_PRODUCTS)
  const { data: yurtsData, loading: yurtsLoading } = useQuery(GET_HERDER_YURTS)
  const { data: ordersData, loading: ordersLoading } = useQuery(GET_HERDER_ORDERS)
  const { data: bookingsData, loading: bookingsLoading } = useQuery(GET_HERDER_BOOKINGS)

  // Mutations
  const [createYurt] = useMutation(CREATE_YURT, {
    refetchQueries: [GET_HERDER_YURTS, GET_HERDER_STATS]
  })
  const [updateYurt] = useMutation(UPDATE_YURT, {
    refetchQueries: [GET_HERDER_YURTS]
  })
  const [deleteYurt] = useMutation(DELETE_YURT, {
    refetchQueries: [GET_HERDER_YURTS, GET_HERDER_STATS]
  })
  const [createProduct] = useMutation(CREATE_PRODUCT, {
    refetchQueries: [GET_HERDER_PRODUCTS, GET_HERDER_STATS]
  })
  const [updateProduct] = useMutation(UPDATE_PRODUCT, {
    refetchQueries: [GET_HERDER_PRODUCTS]
  })
  const [deleteProduct] = useMutation(DELETE_PRODUCT, {
    refetchQueries: [GET_HERDER_PRODUCTS, GET_HERDER_STATS]
  })

  // Transform data for display
  const herder = {
    name: user?.name || "Ганбаатар Батбаяр",
    email: user?.email || "batbayar@email.com",
    phone: "+976 9999 5678",
    location: "Архангай аймаг",
    joinDate: "2023 оны 3-р сар",
    totalProducts: productsData?.products?.edges?.length || 0,
    totalCamps: yurtsData?.yurts?.edges?.length || 0,
    totalEarnings: 2450, // Calculate from orders and bookings
    rating: 4.8,
  }

  // Transform data for display
  const products = productsData?.products?.edges?.map((edge: any) => ({
    id: edge.node.id,
    name: edge.node.name,
    category: edge.node.category?.name || "Uncategorized",
    price: edge.node.price,
    stock: edge.node.stock,
    sold: 0, // Default sold count
    status: edge.node.stock > 0 ? "active" : "out_of_stock",
    image: edge.node.images || "/placeholder.svg",
  })) || []

  const camps = yurtsData?.yurts?.edges?.map((edge: any) => ({
    id: edge.node.id,
    name: edge.node.name,
    location: edge.node.location,
    price: edge.node.pricePerNight,
    capacity: edge.node.capacity,
    bookings: 0, // Default booking count
    rating: 4.8, // Default rating
    status: "active",
    image: edge.node.images || "/placeholder.svg",
  })) || []

  const orders = ordersData?.orders?.edges?.map((edge: any) => ({
    id: edge.node.id,
    customer: edge.node.user?.name || "Unknown",
    product: edge.node.items[0]?.product?.name || "Multiple items",
    quantity: edge.node.items.reduce((sum: number, item: any) => sum + item.quantity, 0),
    amount: edge.node.totalPrice,
    status: edge.node.status.toLowerCase(),
    date: edge.node.createdAt.split('T')[0],
  })) || []

  const bookings = bookingsData?.bookings?.edges?.map((edge: any) => ({
    id: edge.node.id,
    customer: edge.node.user?.name || "Unknown",
    camp: edge.node.yurt?.name || "Unknown camp",
    checkIn: edge.node.startDate,
    checkOut: edge.node.endDate,
    guests: 2, // Default guest count
    amount: edge.node.totalPrice,
    status: edge.node.status.toLowerCase(),
  })) || []

  const handleDelete = (item: any) => {
    setSelectedItem(item)
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    try {
      // Determine if the item is a product or a yurt based on its properties
      const isProduct = 'stock' in selectedItem;
      
      if (isProduct) {
        await handleDeleteProduct();
      } else {
        await handleDeleteYurt();
      }
      
      toast({ 
        title: "Амжилттай", 
        description: isProduct ? "Бүтээгдэхүүн амжилттай устгагдлаа" : "Гэр амжилттай устгагдлаа" 
      });
    } catch (error: any) {
      toast({ 
        title: "Алдаа", 
        description: error.message || "Устгах үед алдаа гарлаа", 
        variant: "destructive" as any 
      });
    } finally {
      setShowDeleteDialog(false)
      setSelectedItem(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-display">Малчны самбар</h1>
          <p className="text-gray-600 text-sm sm:text-base font-medium">Өөрийн бүтээгдэхүүн, бааз, захиалгаа удирдаарай</p>
        </div>

        <div className="flex justify-end mb-4">
          <Button variant="outline" onClick={logout} className="flex items-center gap-2">
            <LogOut className="w-4 h-4" /> Гарах
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-5 min-w-[500px] sm:min-w-0">
              <TabsTrigger value="overview" className="text-xs sm:text-sm font-medium">Тойм</TabsTrigger>
              <TabsTrigger value="products" className="text-xs sm:text-sm font-medium">Бүтээгдэхүүнүүд</TabsTrigger>
              <TabsTrigger value="camps" className="text-xs sm:text-sm font-medium">Гэр баазууд</TabsTrigger>
              <TabsTrigger value="orders" className="text-xs sm:text-sm font-medium">Захиалгууд</TabsTrigger>
              <TabsTrigger value="profile" className="text-xs sm:text-sm font-medium">Профайл</TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-semibold">Нийт бүтээгдэхүүн</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">{herder.totalProducts}</div>
                  <p className="text-xs text-muted-foreground font-medium">+2 өнгөрсөн сараас</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-semibold">Идэвхтэй баазууд</CardTitle>
                  <Home className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">{herder.totalCamps}</div>
                  <p className="text-xs text-muted-foreground font-medium">Бүгд идэвхтэй</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-semibold">Нийт орлого</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">${herder.totalEarnings}</div>
                  <p className="text-xs text-muted-foreground font-medium">+15% өнгөрсөн сараас</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-semibold">Дундаж үнэлгээ</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">{herder.rating}</div>
                  <p className="text-xs text-muted-foreground font-medium">89 үнэлгээнд үндэслэв</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl font-bold">Сүүлийн захиалгууд</CardTitle>
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
                      <Input 
                        placeholder="Enter product name" 
                        className="font-medium" 
                        value={productForm.name}
                        onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                      <Select 
                        value={productForm.categoryId} 
                        onValueChange={(value) => setProductForm({...productForm, categoryId: value})}
                      >
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
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        className="font-medium" 
                        value={productForm.price}
                        onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Stock Quantity</label>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        className="font-medium" 
                        value={productForm.stock}
                        onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <Textarea 
                      placeholder="Describe your product..." 
                      className="font-medium" 
                      value={productForm.description}
                      onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Images (URLs, comma separated)</label>
                    <Input 
                      placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg" 
                      className="font-medium" 
                      value={productForm.images}
                      onChange={(e) => setProductForm({...productForm, images: e.target.value})}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700 font-semibold"
                      onClick={selectedItem ? handleUpdateProduct : handleCreateProduct}
                    >
                      {selectedItem ? "Update Product" : "Save Product"}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowAddProduct(false);
                        setSelectedItem(null);
                        setProductForm({
                          name: "",
                          description: "",
                          price: "",
                          stock: "",
                          images: "",
                          categoryId: ""
                        });
                      }} 
                      className="font-medium"
                    >
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
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 bg-transparent font-medium"
                        onClick={() => handleEditProduct(product)}
                      >
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
                      <Input 
                        placeholder="Enter camp name" 
                        className="font-medium" 
                        value={yurtForm.name}
                        onChange={(e) => setYurtForm({...yurtForm, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                      <Input 
                        placeholder="Province, District" 
                        className="font-medium" 
                        value={yurtForm.location}
                        onChange={(e) => setYurtForm({...yurtForm, location: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Price per Night ($)</label>
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        className="font-medium" 
                        value={yurtForm.pricePerNight}
                        onChange={(e) => setYurtForm({...yurtForm, pricePerNight: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Guest Capacity</label>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        className="font-medium" 
                        value={yurtForm.capacity}
                        onChange={(e) => setYurtForm({...yurtForm, capacity: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <Textarea 
                      placeholder="Describe your camp..." 
                      className="font-medium" 
                      value={yurtForm.description}
                      onChange={(e) => setYurtForm({...yurtForm, description: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Amenities (comma separated)</label>
                    <Input 
                      placeholder="WiFi, Heating, Breakfast..." 
                      className="font-medium" 
                      value={yurtForm.amenities}
                      onChange={(e) => setYurtForm({...yurtForm, amenities: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Images (URLs, comma separated)</label>
                    <Input 
                      placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg" 
                      className="font-medium" 
                      value={yurtForm.images}
                      onChange={(e) => setYurtForm({...yurtForm, images: e.target.value})}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700 font-semibold"
                      onClick={selectedItem ? handleUpdateYurt : handleCreateYurt}
                    >
                      {selectedItem ? "Update Camp" : "Save Camp"}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowAddCamp(false);
                        setSelectedItem(null);
                        setYurtForm({
                          name: "",
                          description: "",
                          location: "",
                          pricePerNight: "",
                          capacity: "",
                          amenities: "",
                          images: ""
                        });
                      }} 
                      className="font-medium"
                    >
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
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 bg-transparent font-medium"
                        onClick={() => handleEditYurt(camp)}
                      >
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

  // Yurt management functions
  const handleCreateYurt = async () => {
    try {
      await createYurt({
        variables: {
          input: {
            name: yurtForm.name,
            description: yurtForm.description,
            location: yurtForm.location,
            pricePerNight: parseFloat(yurtForm.pricePerNight),
            capacity: parseInt(yurtForm.capacity),
            amenities: yurtForm.amenities,
            images: yurtForm.images
          }
        }
      })
      toast({ title: "Амжилттай", description: "Гэр амжилттай нэмэгдлээ" })
      setShowAddCamp(false)
      setYurtForm({
        name: "",
        description: "",
        location: "",
        pricePerNight: "",
        capacity: "",
        amenities: "",
        images: ""
      })
    } catch (error: any) {
      toast({ title: "Алдаа", description: error.message, variant: "destructive" as any })
    }
  }

  const handleUpdateYurt = async () => {
    try {
      await updateYurt({
        variables: {
          id: selectedItem.id,
          input: {
            name: yurtForm.name,
            description: yurtForm.description,
            location: yurtForm.location,
            pricePerNight: parseFloat(yurtForm.pricePerNight),
            capacity: parseInt(yurtForm.capacity),
            amenities: yurtForm.amenities,
            images: yurtForm.images
          }
        }
      })
      toast({ title: "Амжилттай", description: "Гэр амжилттай шинэчигдлээ" })
      setSelectedItem(null)
      setYurtForm({
        name: "",
        description: "",
        location: "",
        pricePerNight: "",
        capacity: "",
        amenities: "",
        images: ""
      })
    } catch (error: any) {
      toast({ title: "Алдаа", description: error.message, variant: "destructive" as any })
    }
  }

  const handleDeleteYurt = async () => {
    try {
      await deleteYurt({
        variables: { id: selectedItem.id }
      })
      toast({ title: "Амжилттай", description: "Гэр амжилттай устгагдлаа" })
      setShowDeleteDialog(false)
      setSelectedItem(null)
    } catch (error: any) {
      toast({ title: "Алдаа", description: error.message, variant: "destructive" as any })
    }
  }

  // Product management functions
  const handleCreateProduct = async () => {
    try {
      await createProduct({
        variables: {
          input: {
            name: productForm.name,
            description: productForm.description,
            price: parseFloat(productForm.price),
            stock: parseInt(productForm.stock),
            images: productForm.images,
            categoryId: productForm.categoryId
          }
        }
      })
      toast({ title: "Амжилттай", description: "Бүтээгдэхүүн амжилттай нэмэгдлээ" })
      setShowAddProduct(false)
      setProductForm({
        name: "",
        description: "",
        price: "",
        stock: "",
        images: "",
        categoryId: ""
      })
    } catch (error: any) {
      toast({ title: "Алдаа", description: error.message, variant: "destructive" as any })
    }
  }

  const handleUpdateProduct = async () => {
    try {
      await updateProduct({
        variables: {
          id: selectedItem.id,
          input: {
            name: productForm.name,
            description: productForm.description,
            price: parseFloat(productForm.price),
            stock: parseInt(productForm.stock),
            images: productForm.images,
            categoryId: productForm.categoryId
          }
        }
      })
      toast({ title: "Амжилттай", description: "Бүтээгдэхүүн амжилттай шинэчигдлээ" })
      setSelectedItem(null)
      setProductForm({
        name: "",
        description: "",
        price: "",
        stock: "",
        images: "",
        categoryId: ""
      })
    } catch (error: any) {
      toast({ title: "Алдаа", description: error.message, variant: "destructive" as any })
    }
  }

  const handleDeleteProduct = async () => {
    try {
      await deleteProduct({
        variables: { id: selectedItem.id }
      })
      toast({ title: "Амжилттай", description: "Бүтээгдэхүүн амжилттай устгагдлаа" })
      setShowDeleteDialog(false)
      setSelectedItem(null)
    } catch (error: any) {
      toast({ title: "Алдаа", description: error.message, variant: "destructive" as any })
    }
  }

  const handleEditYurt = (yurt: any) => {
    setSelectedItem(yurt)
    setYurtForm({
      name: yurt.name,
      description: yurt.description,
      location: yurt.location,
      pricePerNight: yurt.pricePerNight.toString(),
      capacity: yurt.capacity.toString(),
      amenities: yurt.amenities,
      images: yurt.images
    })
    setShowAddCamp(true)
  }

  const handleEditProduct = (product: any) => {
    setSelectedItem(product)
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock.toString(),
      images: product.images,
      categoryId: product.categoryId
    })
    setShowAddProduct(true)
  }
}
