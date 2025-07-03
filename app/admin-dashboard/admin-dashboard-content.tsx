"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import {
  Users,
  Home,
  Package,
  MapPin,
  ShoppingBag,
  Calendar,
  Edit,
  Trash2,
  Plus,
  Eye,
  BarChart3,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import "../../lib/i18n"

export default function AdminDashboardContent() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState("overview")
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [showAddCamp, setShowAddCamp] = useState(false)
  const [showAddContent, setShowAddContent] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Mock data
  const stats = {
    totalUsers: 1247,
    totalCamps: 89,
    totalProducts: 456,
    totalOrders: 234,
  }

  const users = [
    {
      id: 1,
      name: "Ганбаатар Батбаяр",
      email: "batbayar@email.com",
      role: "herder",
      status: "active",
      joinDate: "2024-01-15",
    },
    { id: 2, name: "Сараа Жонсон", email: "sarah@email.com", role: "user", status: "active", joinDate: "2024-02-20" },
    {
      id: 3,
      name: "Оюунаа Цэрэн",
      email: "oyunaa@email.com",
      role: "herder",
      status: "inactive",
      joinDate: "2024-01-10",
    },
  ]

  const camps = [
    { id: 1, name: "Найман нуур эко бааз", owner: "Батбаяр", location: "Архангай", price: 120, status: "active" },
    { id: 2, name: "Хөвсгөл нуурын бааз", owner: "Оюунаа", location: "Хөвсгөл", price: 250, status: "active" },
    { id: 3, name: "Говь цөлийн бааз", owner: "Мөнх", location: "Говь", price: 180, status: "pending" },
  ]

  const products = [
    {
      id: 1,
      name: "Айраг",
      seller: "Батбаярын гэр бүл",
      category: "Сүүн бүтээгдэхүүн",
      price: 25,
      stock: 50,
      status: "active",
    },
    {
      id: 2,
      name: "Гар нэхмэл хивс",
      seller: "Оюунаагийн урлал",
      category: "Гар урлал",
      price: 150,
      stock: 12,
      status: "active",
    },
    {
      id: 3,
      name: "Хатаасан мах",
      seller: "Нүүдэлчдийн хүнс",
      category: "Мах",
      price: 45,
      stock: 0,
      status: "out_of_stock",
    },
  ]

  const orders = [
    {
      id: 1,
      customer: "Сараа Жонсон",
      type: "product",
      item: "Айраг",
      amount: 75,
      status: "completed",
      date: "2024-12-28",
    },
    {
      id: 2,
      customer: "Майк Чен",
      type: "camp",
      item: "Найман нуурын бааз",
      amount: 360,
      status: "confirmed",
      date: "2024-12-27",
    },
    {
      id: 3,
      customer: "Эмма Вилсон",
      type: "product",
      item: "Гар нэхмэл хивс",
      amount: 150,
      status: "pending",
      date: "2024-12-26",
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

  const handleAddProduct = (formData: any) => {
    console.log("Adding product:", formData)
    setShowAddProduct(false)
  }

  const handleAddCamp = (formData: any) => {
    console.log("Adding camp:", formData)
    setShowAddCamp(false)
  }

  const handleAddContent = (formData: any) => {
    console.log("Adding content:", formData)
    setShowAddContent(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-display">
            {t("admin.title", "Админ самбар")}
          </h1>
          <p className="text-gray-600 text-sm sm:text-base font-medium">
            {t("admin.subtitle", "Платформоо удирдаж, бүх үйл ажиллагааг хянаарай")}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-6 min-w-[600px] sm:min-w-0">
              <TabsTrigger value="overview" className="text-xs sm:text-sm font-medium">
                {t("admin.tabs.overview", "Тойм")}
              </TabsTrigger>
              <TabsTrigger value="users" className="text-xs sm:text-sm font-medium">
                {t("admin.tabs.users", "Хэрэглэгчид")}
              </TabsTrigger>
              <TabsTrigger value="camps" className="text-xs sm:text-sm font-medium">
                {t("admin.tabs.camps", "Баазууд")}
              </TabsTrigger>
              <TabsTrigger value="products" className="text-xs sm:text-sm font-medium">
                {t("admin.tabs.products", "Бүтээгдэхүүнүүд")}
              </TabsTrigger>
              <TabsTrigger value="orders" className="text-xs sm:text-sm font-medium">
                {t("admin.tabs.orders", "Захиалгууд")}
              </TabsTrigger>
              <TabsTrigger value="content" className="text-xs sm:text-sm font-medium">
                {t("admin.tabs.content", "Агуулга")}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-semibold">
                    {t("admin.stats.total_users", "Нийт хэрэглэгчид")}
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground font-medium">+12% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-semibold">Total Camps</CardTitle>
                  <Home className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">{stats.totalCamps}</div>
                  <p className="text-xs text-muted-foreground font-medium">+5% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-semibold">Total Products</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">{stats.totalProducts}</div>
                  <p className="text-xs text-muted-foreground font-medium">+8% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-semibold">Total Orders</CardTitle>
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">{stats.totalOrders}</div>
                  <p className="text-xs text-muted-foreground font-medium">+15% from last month</p>
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
                          <p className="text-xs sm:text-sm text-gray-600 truncate font-medium">{order.item}</p>
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
                  <CardTitle className="text-lg sm:text-xl font-bold">Platform Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm sm:text-base font-medium">New user registrations</span>
                      <span className="font-bold text-sm sm:text-base">+23 today</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm sm:text-base font-medium">New camp listings</span>
                      <span className="font-bold text-sm sm:text-base">+5 today</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm sm:text-base font-medium">Product uploads</span>
                      <span className="font-bold text-sm sm:text-base">+12 today</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm sm:text-base font-medium">Completed bookings</span>
                      <span className="font-bold text-sm sm:text-base">+8 today</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl sm:text-2xl font-bold">Registered Users</h2>
              <Button className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto font-semibold">
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[150px] font-semibold">Name</TableHead>
                        <TableHead className="min-w-[200px] font-semibold">Email</TableHead>
                        <TableHead className="font-semibold">Role</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="hidden sm:table-cell font-semibold">Join Date</TableHead>
                        <TableHead className="font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-semibold">{user.name}</TableCell>
                          <TableCell className="truncate max-w-[200px] font-medium">{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={user.role === "herder" ? "default" : "secondary"} className="font-medium">
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={user.status === "active" ? "default" : "destructive"}
                              className="font-medium"
                            >
                              {user.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell font-medium">{user.joinDate}</TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                  <DialogHeader>
                                    <DialogTitle className="font-bold">User Details</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <label className="text-sm font-semibold">Name</label>
                                      <p className="text-sm text-gray-600 font-medium">{user.name}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-semibold">Email</label>
                                      <p className="text-sm text-gray-600 font-medium">{user.email}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-semibold">Role</label>
                                      <p className="text-sm text-gray-600 font-medium">{user.role}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-semibold">Status</label>
                                      <p className="text-sm text-gray-600 font-medium">{user.status}</p>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleDelete(user)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl sm:text-2xl font-bold">Products Management</h2>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto font-semibold"
                onClick={() => setShowAddProduct(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Product
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
                    <Textarea placeholder="Describe the product..." className="font-medium" />
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700 font-semibold"
                      onClick={() => handleAddProduct({})}
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

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[150px] font-semibold">Product Name</TableHead>
                        <TableHead className="min-w-[120px] font-semibold">Seller</TableHead>
                        <TableHead className="font-semibold">Category</TableHead>
                        <TableHead className="font-semibold">Price</TableHead>
                        <TableHead className="hidden sm:table-cell font-semibold">Stock</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-semibold">{product.name}</TableCell>
                          <TableCell className="truncate max-w-[120px] font-medium">{product.seller}</TableCell>
                          <TableCell className="font-medium">{product.category}</TableCell>
                          <TableCell className="font-bold">${product.price}</TableCell>
                          <TableCell className="hidden sm:table-cell font-medium">{product.stock}</TableCell>
                          <TableCell>
                            <Badge
                              variant={product.status === "active" ? "default" : "destructive"}
                              className="font-medium"
                            >
                              {product.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                  <DialogHeader>
                                    <DialogTitle className="font-bold">Product Details</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <label className="text-sm font-semibold">Product Name</label>
                                      <p className="text-sm text-gray-600 font-medium">{product.name}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-semibold">Seller</label>
                                      <p className="text-sm text-gray-600 font-medium">{product.seller}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-semibold">Category</label>
                                      <p className="text-sm text-gray-600 font-medium">{product.category}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-semibold">Price</label>
                                      <p className="text-sm text-gray-600 font-medium">${product.price}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-semibold">Stock</label>
                                      <p className="text-sm text-gray-600 font-medium">{product.stock}</p>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleDelete(product)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Camps Tab */}
          <TabsContent value="camps" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl sm:text-2xl font-bold">Ger Camps Management</h2>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto font-semibold"
                onClick={() => setShowAddCamp(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Camp
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
                    <Textarea placeholder="Describe the camp..." className="font-medium" />
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700 font-semibold"
                      onClick={() => handleAddCamp({})}
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

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[150px] font-semibold">Camp Name</TableHead>
                        <TableHead className="font-semibold">Owner</TableHead>
                        <TableHead className="font-semibold">Location</TableHead>
                        <TableHead className="font-semibold">Price/Night</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {camps.map((camp) => (
                        <TableRow key={camp.id}>
                          <TableCell className="font-semibold">{camp.name}</TableCell>
                          <TableCell className="font-medium">{camp.owner}</TableCell>
                          <TableCell className="font-medium">{camp.location}</TableCell>
                          <TableCell className="font-bold">${camp.price}</TableCell>
                          <TableCell>
                            <Badge variant={camp.status === "active" ? "default" : "secondary"} className="font-medium">
                              {camp.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                  <DialogHeader>
                                    <DialogTitle className="font-bold">Camp Details</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <label className="text-sm font-semibold">Camp Name</label>
                                      <p className="text-sm text-gray-600 font-medium">{camp.name}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-semibold">Owner</label>
                                      <p className="text-sm text-gray-600 font-medium">{camp.owner}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-semibold">Location</label>
                                      <p className="text-sm text-gray-600 font-medium">{camp.location}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-semibold">Price per Night</label>
                                      <p className="text-sm text-gray-600 font-medium">${camp.price}</p>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleDelete(camp)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl sm:text-2xl font-bold">Orders Management</h2>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto bg-transparent font-medium">
                  Export
                </Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto font-semibold">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-semibold">Order ID</TableHead>
                        <TableHead className="min-w-[120px] font-semibold">Customer</TableHead>
                        <TableHead className="font-semibold">Type</TableHead>
                        <TableHead className="min-w-[150px] font-semibold">Item</TableHead>
                        <TableHead className="font-semibold">Amount</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="hidden sm:table-cell font-semibold">Date</TableHead>
                        <TableHead className="font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-bold">#{order.id}</TableCell>
                          <TableCell className="truncate max-w-[120px] font-medium">{order.customer}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-medium">
                              {order.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="truncate max-w-[150px] font-medium">{order.item}</TableCell>
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
                          <TableCell>
                            <div className="flex space-x-1">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                  <DialogHeader>
                                    <DialogTitle className="font-bold">Order Details</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <label className="text-sm font-semibold">Order ID</label>
                                      <p className="text-sm text-gray-600 font-medium">#{order.id}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-semibold">Customer</label>
                                      <p className="text-sm text-gray-600 font-medium">{order.customer}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-semibold">Type</label>
                                      <p className="text-sm text-gray-600 font-medium">{order.type}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-semibold">Item</label>
                                      <p className="text-sm text-gray-600 font-medium">{order.item}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-semibold">Amount</label>
                                      <p className="text-sm text-gray-600 font-medium">${order.amount}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-semibold">Status</label>
                                      <p className="text-sm text-gray-600 font-medium">{order.status}</p>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl sm:text-2xl font-bold">Content Management</h2>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto font-semibold"
                onClick={() => setShowAddContent(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Content
              </Button>
            </div>

            {showAddContent && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="font-bold">Add New Content</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowAddContent(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Content Type</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select content type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="destination">Tourist Destination</SelectItem>
                          <SelectItem value="festival">Festival/Event</SelectItem>
                          <SelectItem value="resort">Resort/Spa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                      <Input placeholder="Enter title" className="font-medium" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                      <Input placeholder="Enter location" className="font-medium" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Date (for events)</label>
                      <Input type="date" className="font-medium" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <Textarea placeholder="Describe the content..." className="font-medium" />
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700 font-semibold"
                      onClick={() => handleAddContent({})}
                    >
                      Save Content
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddContent(false)} className="font-medium">
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-base sm:text-lg font-bold">
                    <MapPin className="w-5 h-5 mr-2" />
                    Tourist Destinations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 text-sm sm:text-base font-medium">
                    Manage tourist attractions and destinations
                  </p>
                  <Button variant="outline" className="w-full bg-transparent font-medium">
                    Manage Destinations
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-base sm:text-lg font-bold">
                    <Calendar className="w-5 h-5 mr-2" />
                    Festivals & Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 text-sm sm:text-base font-medium">
                    Manage cultural festivals and events
                  </p>
                  <Button variant="outline" className="w-full bg-transparent font-medium">
                    Manage Events
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-base sm:text-lg font-bold">
                    <Home className="w-5 h-5 mr-2" />
                    Resort & Spa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 text-sm sm:text-base font-medium">Manage resort and spa listings</p>
                  <Button variant="outline" className="w-full bg-transparent font-medium">
                    Manage Resorts
                  </Button>
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
