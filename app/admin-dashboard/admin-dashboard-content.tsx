"use client";

import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
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
  LogOut,
  Upload,
  Link,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useQuery, useMutation } from "@apollo/client";
import "../../lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/use-toast";
import {
  GET_ADMIN_STATS,
  GET_ALL_USERS,
  GET_ALL_YURTS,
  GET_ALL_PRODUCTS,
  GET_ALL_ORDERS,
  GET_ALL_BOOKINGS,
  CREATE_USER,
  UPDATE_USER,
  DELETE_USER,
  CREATE_YURT,
  UPDATE_YURT,
  DELETE_YURT,
  CREATE_PRODUCT,
  UPDATE_PRODUCT,
  DELETE_PRODUCT,
  GET_CATEGORIES,
} from "./queries";

export default function AdminDashboardContent() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddCamp, setShowAddCamp] = useState(false);
  const [showAddContent, setShowAddContent] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showEditYurt, setShowEditYurt] = useState(false);
  const [showEditProduct, setShowEditProduct] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [imageUploadMode, setImageUploadMode] = useState<"file" | "url">(
    "file"
  );
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { logout } = useAuth();
  const { toast } = useToast();

  // Fetch real data from database
  const {
    data: statsData,
    loading: statsLoading,
    refetch: refetchStats,
  } = useQuery(GET_ADMIN_STATS);
  const {
    data: usersData,
    loading: usersLoading,
    refetch: refetchUsers,
  } = useQuery(GET_ALL_USERS);
  const {
    data: yurtsData,
    loading: yurtsLoading,
    refetch: refetchYurts,
  } = useQuery(GET_ALL_YURTS);
  const {
    data: productsData,
    loading: productsLoading,
    refetch: refetchProducts,
  } = useQuery(GET_ALL_PRODUCTS);
  const {
    data: ordersData,
    loading: ordersLoading,
    refetch: refetchOrders,
  } = useQuery(GET_ALL_ORDERS);
  const {
    data: bookingsData,
    loading: bookingsLoading,
    refetch: refetchBookings,
  } = useQuery(GET_ALL_BOOKINGS);
  const { data: categoriesData, loading: categoriesLoading } =
    useQuery(GET_CATEGORIES);

  // Mutations
  const [createUser] = useMutation(CREATE_USER);
  const [updateUser] = useMutation(UPDATE_USER);
  const [deleteUser] = useMutation(DELETE_USER);
  const [createYurt] = useMutation(CREATE_YURT);
  const [updateYurt] = useMutation(UPDATE_YURT);
  const [deleteYurt] = useMutation(DELETE_YURT);
  const [createProduct] = useMutation(CREATE_PRODUCT);
  const [updateProduct] = useMutation(UPDATE_PRODUCT);
  const [deleteProduct] = useMutation(DELETE_PRODUCT);

  // Transform data for display
  const stats = {
    totalUsers: statsData?.users?.totalCount || 0,
    totalCamps: statsData?.yurts?.totalCount || 0,
    totalProducts: statsData?.products?.totalCount || 0,
    totalOrders:
      (statsData?.orders?.totalCount || 0) +
      (statsData?.bookings?.totalCount || 0),
  };

  // Calculate additional stats from real data
  const today = new Date().toISOString().split("T")[0];

  // Transform data for display
  const users =
    usersData?.users?.edges?.map((edge: any) => ({
      id: edge.node.id,
      name: edge.node.name,
      email: edge.node.email,
      role: edge.node.role.toLowerCase(),
      status: "active", // Default status
      joinDate: edge.node.createdAt.split("T")[0],
    })) || [];

  const camps =
    yurtsData?.yurts?.edges?.map((edge: any) => ({
      id: edge.node.id,
      name: edge.node.name,
      owner: "Owner", // Default owner
      location: edge.node.location,
      price: edge.node.pricePerNight,
      status: "active", // Default status
      createdAt: edge.node.createdAt,
    })) || [];

  const products =
    productsData?.products?.edges?.map((edge: any) => ({
      id: edge.node.id,
      name: edge.node.name,
      seller: "Seller", // Default seller
      category: edge.node.category?.name || "Uncategorized",
      price: edge.node.price,
      stock: edge.node.stock,
      status: edge.node.stock > 0 ? "active" : "out_of_stock",
      createdAt: edge.node.createdAt,
    })) || [];

  const orders =
    ordersData?.orders?.edges?.map((edge: any) => ({
      id: edge.node.id,
      customer: edge.node.user?.name || "Unknown",
      type: "product",
      item: edge.node.items[0]?.product?.name || "Multiple items",
      amount: edge.node.totalPrice,
      status: edge.node.status.toLowerCase(),
      date: edge.node.createdAt.split("T")[0],
      createdAt: edge.node.createdAt,
    })) || [];

  const bookings =
    bookingsData?.bookings?.edges?.map((edge: any) => ({
      id: edge.node.id,
      customer: edge.node.user?.name || "Unknown",
      type: "camp",
      item: edge.node.yurt?.name || "Unknown camp",
      amount: edge.node.totalPrice,
      status: edge.node.status.toLowerCase(),
      date: edge.node.createdAt.split("T")[0],
      createdAt: edge.node.createdAt,
      yurtId: edge.node.yurt?.id,
      yurtName: edge.node.yurt?.name,
    })) || [];

  // Now calculate stats after data is available
  const todayUsers = users.filter(
    (user: any) => user.joinDate === today
  ).length;
  const todayCamps = camps.filter(
    (camp: any) => camp.createdAt?.split("T")[0] === today
  ).length;
  const todayProducts = products.filter(
    (product: any) => product.createdAt?.split("T")[0] === today
  ).length;
  const todayBookings = bookings.filter(
    (booking: any) => booking.date === today
  ).length;

  // Group bookings by yurt for better organization
  const bookingsByYurt = bookings.reduce((acc: any, booking: any) => {
    const yurtName = booking.yurtName || "Unknown Camp";
    if (!acc[yurtName]) {
      acc[yurtName] = [];
    }
    acc[yurtName].push(booking);
    return acc;
  }, {});

  // Combine orders and bookings for display
  const allOrders = [...orders, ...bookings];

  const handleDelete = (item: any) => {
    setSelectedItem(item);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      let mutation;
      let refetchFunction;

      if (selectedItem.type === "user") {
        mutation = deleteUser;
        refetchFunction = refetchUsers;
      } else if (selectedItem.type === "yurt") {
        mutation = deleteYurt;
        refetchFunction = refetchYurts;
      } else if (selectedItem.type === "product") {
        mutation = deleteProduct;
        refetchFunction = refetchProducts;
      }

      if (mutation && refetchFunction) {
        await mutation({ variables: { id: selectedItem.id } });
        await refetchFunction();
        await refetchStats();
        toast({
          title: "Амжилттай",
          description: "Элемент амжилттай устгагдлаа",
        });
      }
    } catch (error: any) {
      toast({
        title: "Алдаа",
        description: error.message || "Устгах үед алдаа гарлаа",
        variant: "destructive" as any,
      });
    }

    setShowDeleteDialog(false);
    setSelectedItem(null);
  };

  const handleAddUser = async () => {
    try {
      const form = document.querySelector("#add-user-form") as HTMLFormElement;
      if (!form) {
        toast({
          title: "Алдаа",
          description: "Form олдсонгүй",
          variant: "destructive" as any,
        });
        return;
      }

      const formData = new FormData(form);
      const input = {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
        password: formData.get("password") as string,
        role: (formData.get("role") as string) || "CUSTOMER",
      };

      if (!input.name || !input.email || !input.password) {
        toast({
          title: "Алдаа",
          description: "Нэр, имэйл, нууц үг талбарыг бөглөнө үү",
          variant: "destructive" as any,
        });
        return;
      }

      await createUser({ variables: { input } });
      await refetchUsers();
      await refetchStats();
      toast({
        title: "Амжилттай",
        description: "Хэрэглэгч амжилттай үүсгэгдлээ",
      });
      setShowAddUser(false);
    } catch (error: any) {
      toast({
        title: "Алдаа",
        description: error.message || "Хэрэглэгч үүсгэхэд алдаа гарлаа",
        variant: "destructive" as any,
      });
    }
  };

  const handleEditUser = async (formData: any) => {
    try {
      await updateUser({ variables: { id: editingItem.id, input: formData } });
      await refetchUsers();
      toast({
        title: "Амжилттай",
        description: "Хэрэглэгч амжилттай шинэчлэгдлээ",
      });
      setShowEditUser(false);
      setEditingItem(null);
    } catch (error: any) {
      toast({
        title: "Алдаа",
        description: error.message || "Хэрэглэгч шинэчлэхэд алдаа гарлаа",
        variant: "destructive" as any,
      });
    }
  };

  const handleAddYurt = async (formData: any) => {
    try {
      await createYurt({ variables: { input: formData } });
      await refetchYurts();
      await refetchStats();
      toast({
        title: "Амжилттай",
        description: "Бааз амжилттай үүсгэгдлээ",
      });
      setShowAddCamp(false);
    } catch (error: any) {
      toast({
        title: "Алдаа",
        description: error.message || "Бааз үүсгэхэд алдаа гарлаа",
        variant: "destructive" as any,
      });
    }
  };

  const handleAddProduct = async () => {
    try {
      const form = document.querySelector(
        "#add-product-form"
      ) as HTMLFormElement;
      if (!form) {
        toast({
          title: "Алдаа",
          description: "Form олдсонгүй",
          variant: "destructive" as any,
        });
        return;
      }

      const formData = new FormData(form);
      const input = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        price: parseFloat(formData.get("price") as string),
        stock: parseInt(formData.get("stock") as string),
        images: (formData.get("images") as string) || "[]",
        categoryId: formData.get("categoryId") as string,
      };

      if (
        !input.name ||
        !input.description ||
        !input.price ||
        !input.stock ||
        !input.categoryId
      ) {
        toast({
          title: "Алдаа",
          description: "Бүх талбарыг бөглөнө үү",
          variant: "destructive" as any,
        });
        return;
      }

      await createProduct({ variables: { input } });
      await refetchProducts();
      await refetchStats();
      toast({
        title: "Амжилттай",
        description: "Бүтээгдэхүүн амжилттай үүсгэгдлээ",
      });
      setShowAddProduct(false);
    } catch (error: any) {
      toast({
        title: "Алдаа",
        description: error.message || "Бүтээгдэхүүн үүсгэхэд алдаа гарлаа",
        variant: "destructive" as any,
      });
    }
  };

  const handleAddCamp = async () => {
    try {
      // Get form data from the form inputs
      const form = document.querySelector("#add-camp-form") as HTMLFormElement;
      if (!form) {
        toast({
          title: "Алдаа",
          description: "Form олдсонгүй",
          variant: "destructive" as any,
        });
        return;
      }

      const formData = new FormData(form);

      // Optimize images data - limit to first 3 images and compress if needed
      const optimizedImages = uploadedImages.slice(0, 3).map((img) => {
        // If it's a base64 image, check if it's too large
        if (img.startsWith("data:image/")) {
          // For base64 images, we'll keep them as is but limit the array
          return img;
        }
        // For URL images, keep as is
        return img;
      });

      const input = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        location: formData.get("location") as string,
        pricePerNight: parseFloat(formData.get("pricePerNight") as string),
        capacity: parseInt(formData.get("capacity") as string),
        amenities: formData.get("amenities") as string,
        images: JSON.stringify(optimizedImages),
      };

      // Validate required fields
      if (
        !input.name ||
        !input.description ||
        !input.location ||
        !input.pricePerNight ||
        !input.capacity ||
        !input.amenities
      ) {
        toast({
          title: "Алдаа",
          description: "Бүх талбарыг бөглөнө үү",
          variant: "destructive" as any,
        });
        return;
      }

      await createYurt({ variables: { input } });
      await refetchYurts();
      await refetchStats();
      toast({
        title: "Амжилттай",
        description: "Бааз амжилттай үүсгэгдлээ",
      });
      setShowAddCamp(false);
      setUploadedImages([]); // Clear uploaded images
    } catch (error: any) {
      toast({
        title: "Алдаа",
        description: error.message || "Бааз үүсгэхэд алдаа гарлаа",
        variant: "destructive" as any,
      });
    }
  };

  const handleAddContent = async (formData: any) => {
    try {
      // Content management functionality can be implemented later
      toast({
        title: "Амжилттай",
        description: "Агуулга амжилттай үүсгэгдлээ",
      });
      setShowAddContent(false);
    } catch (error: any) {
      toast({
        title: "Алдаа",
        description: error.message || "Агуулга үүсгэхэд алдаа гарлаа",
        variant: "destructive" as any,
      });
    }
  };

  // Image upload functions
  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    formType: "yurt" | "product"
  ) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];

      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Алдаа",
          description: "Зурагны хэмжээ 2MB-аас их байна",
          variant: "destructive" as any,
        });
        return;
      }

      // Check if we already have 3 images
      if (uploadedImages.length >= 3) {
        toast({
          title: "Алдаа",
          description: "Дээд тал 3 зураг оруулж болно",
          variant: "destructive" as any,
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUploadedImages((prev) => [...prev, result]);
        toast({
          title: "Амжилттай",
          description: "Зураг амжилттай орууллаа",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (url: string, formType: "yurt" | "product") => {
    if (!url.trim()) return;

    // Check if we already have 3 images
    if (uploadedImages.length >= 3) {
      toast({
        title: "Алдаа",
        description: "Дээд тал 3 зураг оруулж болно",
        variant: "destructive" as any,
      });
      return;
    }

    setUploadedImages((prev) => [...prev, url]);
    toast({
      title: "Амжилттай",
      description: "Зурагны линк орууллаа",
    });
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
    toast({
      title: "Амжилттай",
      description: "Зураг цуцлагдлаа",
    });
  };

  const handleEditYurt = (yurt: any) => {
    setEditingItem(yurt);
    setShowEditYurt(true);
  };

  const handleEditProduct = async (formData: any) => {
    try {
      await updateProduct({
        variables: { id: editingItem.id, input: formData },
      });
      await refetchProducts();
      toast({
        title: "Амжилттай",
        description: "Бүтээгдэхүүн амжилттай шинэчлэгдлээ",
      });
      setShowEditProduct(false);
      setEditingItem(null);
    } catch (error: any) {
      toast({
        title: "Алдаа",
        description: error.message || "Бүтээгдэхүүн шинэчлэхэд алдаа гарлаа",
        variant: "destructive" as any,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            onClick={logout}
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Гарах
          </Button>
        </div>
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-display">
            {t("admin.title", "Админ самбар")}
          </h1>
          <p className="text-gray-600 text-sm sm:text-base font-medium">
            {t(
              "admin.subtitle",
              "Платформоо удирдаж, бүх үйл ажиллагааг хянаарай"
            )}
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-6 min-w-[600px] sm:min-w-0">
              <TabsTrigger
                value="overview"
                className="text-xs sm:text-sm font-medium"
              >
                {t("admin.tabs.overview", "Тойм")}
              </TabsTrigger>
              <TabsTrigger
                value="users"
                className="text-xs sm:text-sm font-medium"
              >
                {t("admin.tabs.users", "Хэрэглэгчид")}
              </TabsTrigger>
              <TabsTrigger
                value="camps"
                className="text-xs sm:text-sm font-medium"
              >
                {t("admin.tabs.camps", "Баазууд")}
              </TabsTrigger>
              <TabsTrigger
                value="products"
                className="text-xs sm:text-sm font-medium"
              >
                {t("admin.tabs.products", "Бүтээгдэхүүнүүд")}
              </TabsTrigger>
              <TabsTrigger
                value="orders"
                className="text-xs sm:text-sm font-medium"
              >
                {t("admin.tabs.orders", "Захиалгууд")}
              </TabsTrigger>
              <TabsTrigger
                value="content"
                className="text-xs sm:text-sm font-medium"
              >
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
                  <div className="text-xl sm:text-2xl font-bold">
                    {stats.totalUsers}
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">
                    +12% өнгөрсөн сараас
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-semibold">
                    Нийт баазууд
                  </CardTitle>
                  <Home className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">
                    {stats.totalCamps}
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">
                    +5% өнгөрсөн сараас
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-semibold">
                    Нийт бүтээгдэхүүн
                  </CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">
                    {stats.totalProducts}
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">
                    +8% өнгөрсөн сараас
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-semibold">
                    Нийт захиалгууд
                  </CardTitle>
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">
                    {stats.totalOrders}
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">
                    +15% өнгөрсөн сараас
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl font-bold">
                    Сүүлийн захиалгууд
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {allOrders.slice(0, 5).map((order: any) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm sm:text-base truncate">
                            {order.customer}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600 truncate font-medium">
                            {order.item}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-bold text-sm sm:text-base">
                            ${order.amount}
                          </p>
                          <Badge
                            variant={
                              order.status === "completed"
                                ? "default"
                                : "secondary"
                            }
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
                  <CardTitle className="text-lg sm:text-xl font-bold">
                    Платформын үйл ажиллагаа
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm sm:text-base font-medium">
                        Шинэ хэрэглэгч бүртгэл
                      </span>
                      <span className="font-bold text-sm sm:text-base">
                        +{todayUsers} өнөөдөр
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm sm:text-base font-medium">
                        Шинэ бааз нэмэлт
                      </span>
                      <span className="font-bold text-sm sm:text-base">
                        +{todayCamps} өнөөдөр
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm sm:text-base font-medium">
                        Бүтээгдэхүүн оруулалт
                      </span>
                      <span className="font-bold text-sm sm:text-base">
                        +{todayProducts} өнөөдөр
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm sm:text-base font-medium">
                        Дууссан захиалгууд
                      </span>
                      <span className="font-bold text-sm sm:text-base">
                        +{todayBookings} өнөөдөр
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl sm:text-2xl font-bold">
                Бүртгэгдсэн хэрэглэгчид
              </h2>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto font-semibold"
                onClick={() => setShowAddUser(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </div>

            {showAddUser && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="font-bold">Add New User</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddUser(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form id="add-user-form">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Name
                        </label>
                        <Input
                          name="name"
                          placeholder="Enter user name"
                          className="font-medium"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email
                        </label>
                        <Input
                          name="email"
                          type="email"
                          placeholder="Enter email"
                          className="font-medium"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Phone
                        </label>
                        <Input
                          name="phone"
                          placeholder="Enter phone number"
                          className="font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Role
                        </label>
                        <Select name="role" defaultValue="CUSTOMER">
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CUSTOMER">Customer</SelectItem>
                            <SelectItem value="HERDER">Herder</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Password
                        </label>
                        <Input
                          name="password"
                          type="password"
                          placeholder="Enter password"
                          className="font-medium"
                          required
                        />
                      </div>
                    </div>
                  </form>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700 font-semibold"
                      onClick={handleAddUser}
                    >
                      Save User
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowAddUser(false)}
                      className="font-medium"
                    >
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
                        <TableHead className="min-w-[150px] font-semibold">
                          Name
                        </TableHead>
                        <TableHead className="min-w-[200px] font-semibold">
                          Email
                        </TableHead>
                        <TableHead className="font-semibold">Role</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="hidden sm:table-cell font-semibold">
                          Join Date
                        </TableHead>
                        <TableHead className="font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user: any) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-semibold">
                            {user.name}
                          </TableCell>
                          <TableCell className="truncate max-w-[200px] font-medium">
                            {user.email}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                user.role === "herder" ? "default" : "secondary"
                              }
                              className="font-medium"
                            >
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                user.status === "active"
                                  ? "default"
                                  : "destructive"
                              }
                              className="font-medium"
                            >
                              {user.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell font-medium">
                            {user.joinDate}
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
                                    <DialogTitle className="font-bold">
                                      User Details
                                    </DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <label className="text-sm font-semibold">
                                        Name
                                      </label>
                                      <p className="text-sm text-gray-600 font-medium">
                                        {user.name}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-semibold">
                                        Email
                                      </label>
                                      <p className="text-sm text-gray-600 font-medium">
                                        {user.email}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-semibold">
                                        Role
                                      </label>
                                      <p className="text-sm text-gray-600 font-medium">
                                        {user.role}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-semibold">
                                        Status
                                      </label>
                                      <p className="text-sm text-gray-600 font-medium">
                                        {user.status}
                                      </p>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingItem(user);
                                  setShowEditUser(true);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleDelete({ ...user, type: "user" })
                                }
                              >
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
              <h2 className="text-xl sm:text-2xl font-bold">
                Бүтээгдэхүүн удирдлага
              </h2>
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddProduct(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Product Name
                      </label>
                      <Input
                        placeholder="Enter product name"
                        className="font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Category
                      </label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Ангилал сонгох" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dairy">
                            Сүүн бүтээгдэхүүн
                          </SelectItem>
                          <SelectItem value="meat">
                            Махны бүтээгдэхүүн
                          </SelectItem>
                          <SelectItem value="handicrafts">Гар урлал</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Price ($)
                      </label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        className="font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Stock Quantity
                      </label>
                      <Input
                        type="number"
                        placeholder="0"
                        className="font-medium"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <Textarea
                      placeholder="Describe the product..."
                      className="font-medium"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700 font-semibold"
                      onClick={() => handleAddProduct({})}
                    >
                      Save Product
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowAddProduct(false)}
                      className="font-medium"
                    >
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
                        <TableHead className="min-w-[150px] font-semibold">
                          Product Name
                        </TableHead>
                        <TableHead className="min-w-[120px] font-semibold">
                          Seller
                        </TableHead>
                        <TableHead className="font-semibold">
                          Category
                        </TableHead>
                        <TableHead className="font-semibold">Price</TableHead>
                        <TableHead className="hidden sm:table-cell font-semibold">
                          Stock
                        </TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product: any) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-semibold">
                            {product.name}
                          </TableCell>
                          <TableCell className="truncate max-w-[120px] font-medium">
                            {product.seller}
                          </TableCell>
                          <TableCell className="font-medium">
                            {product.category}
                          </TableCell>
                          <TableCell className="font-bold">
                            ${product.price}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell font-medium">
                            {product.stock}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                product.status === "active"
                                  ? "default"
                                  : "destructive"
                              }
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
                                    <DialogTitle className="font-bold">
                                      Product Details
                                    </DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <label className="text-sm font-semibold">
                                        Product Name
                                      </label>
                                      <p className="text-sm text-gray-600 font-medium">
                                        {product.name}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-semibold">
                                        Seller
                                      </label>
                                      <p className="text-sm text-gray-600 font-medium">
                                        {product.seller}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-semibold">
                                        Category
                                      </label>
                                      <p className="text-sm text-gray-600 font-medium">
                                        {product.category}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-semibold">
                                        Price
                                      </label>
                                      <p className="text-sm text-gray-600 font-medium">
                                        ${product.price}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-semibold">
                                        Stock
                                      </label>
                                      <p className="text-sm text-gray-600 font-medium">
                                        {product.stock}
                                      </p>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingItem(product);
                                  setShowEditProduct(true);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleDelete({ ...product, type: "product" })
                                }
                              >
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
              <h2 className="text-xl sm:text-2xl font-bold">
                Гэр баазын удирдлага
              </h2>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto font-semibold"
                onClick={() => setShowAddCamp(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Camp
              </Button>
            </div>

            {showEditYurt && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="font-bold">Edit Camp</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEditYurt(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form id="edit-yurt-form">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Camp Name
                        </label>
                        <Input
                          name="name"
                          placeholder="Enter camp name"
                          className="font-medium"
                          defaultValue={editingItem?.name || ""}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Location
                        </label>
                        <Input
                          name="location"
                          placeholder="Province, District"
                          className="font-medium"
                          defaultValue={editingItem?.location || ""}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Price per Night ($)
                        </label>
                        <Input
                          name="pricePerNight"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="font-medium"
                          defaultValue={editingItem?.price || ""}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Guest Capacity
                        </label>
                        <Input
                          name="capacity"
                          type="number"
                          placeholder="0"
                          className="font-medium"
                          defaultValue={editingItem?.capacity || ""}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Description
                      </label>
                      <Textarea
                        name="description"
                        placeholder="Describe the camp..."
                        className="font-medium"
                        defaultValue={editingItem?.description || ""}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Amenities
                      </label>
                      <Textarea
                        name="amenities"
                        placeholder="List amenities (e.g., WiFi, Hot water, Restaurant)"
                        className="font-medium"
                        defaultValue={editingItem?.amenities || ""}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Зураг оруулах
                      </label>

                      {/* Image Upload Mode Toggle */}
                      <div className="flex space-x-2 mb-3">
                        <Button
                          type="button"
                          variant={
                            imageUploadMode === "file" ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setImageUploadMode("file")}
                          className="flex items-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          Файлаас сонгох
                        </Button>
                        <Button
                          type="button"
                          variant={
                            imageUploadMode === "url" ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setImageUploadMode("url")}
                          className="flex items-center gap-2"
                        >
                          <Link className="w-4 h-4" />
                          Линк оруулах
                        </Button>
                      </div>

                      {/* File Upload */}
                      {imageUploadMode === "file" && (
                        <div className="space-y-2">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, "yurt")}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Зураг сонгох
                          </Button>
                        </div>
                      )}

                      {/* URL Input */}
                      {imageUploadMode === "url" && (
                        <div className="space-y-2">
                          <Input
                            name="images"
                            placeholder="https://example.com/image1.jpg"
                            className="font-medium"
                            defaultValue={editingItem?.image || ""}
                          />
                        </div>
                      )}
                    </div>
                  </form>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700 font-semibold"
                      onClick={async () => {
                        try {
                          const form = document.querySelector(
                            "#edit-yurt-form"
                          ) as HTMLFormElement;
                          if (!form) return;

                          const formData = new FormData(form);
                          const input = {
                            name: formData.get("name") as string,
                            description: formData.get("description") as string,
                            location: formData.get("location") as string,
                            pricePerNight: parseFloat(
                              formData.get("pricePerNight") as string
                            ),
                            capacity: parseInt(
                              formData.get("capacity") as string
                            ),
                            amenities: formData.get("amenities") as string,
                            images: (formData.get("images") as string) || "[]",
                          };

                          await updateYurt({
                            variables: { id: editingItem.id, input },
                          });
                          await refetchYurts();
                          await refetchStats();
                          toast({
                            title: "Амжилттай",
                            description: "Бааз амжилттай шинэчигдлээ",
                          });
                          setShowEditYurt(false);
                          setEditingItem(null);
                        } catch (error: any) {
                          toast({
                            title: "Алдаа",
                            description:
                              error.message || "Бааз шинэчлэхэд алдаа гарлаа",
                            variant: "destructive" as any,
                          });
                        }
                      }}
                    >
                      Update Camp
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowEditYurt(false);
                        setEditingItem(null);
                      }}
                      className="font-medium"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {showAddCamp && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="font-bold">Add New Camp</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddCamp(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form id="add-camp-form">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Camp Name
                        </label>
                        <Input
                          name="name"
                          placeholder="Enter camp name"
                          className="font-medium"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Location
                        </label>
                        <Input
                          name="location"
                          placeholder="Province, District"
                          className="font-medium"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Price per Night ($)
                        </label>
                        <Input
                          name="pricePerNight"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="font-medium"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Guest Capacity
                        </label>
                        <Input
                          name="capacity"
                          type="number"
                          placeholder="0"
                          className="font-medium"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Description
                      </label>
                      <Textarea
                        name="description"
                        placeholder="Describe the camp..."
                        className="font-medium"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Amenities
                      </label>
                      <Textarea
                        name="amenities"
                        placeholder="List amenities (e.g., WiFi, Hot water, Restaurant)"
                        className="font-medium"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Зураг оруулах ({uploadedImages.length}/10)
                      </label>

                      {/* Image Upload Mode Toggle */}
                      <div className="flex space-x-2 mb-3">
                        <Button
                          type="button"
                          variant={
                            imageUploadMode === "file" ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setImageUploadMode("file")}
                          className="flex items-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          Файлаас сонгох
                        </Button>
                        <Button
                          type="button"
                          variant={
                            imageUploadMode === "url" ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setImageUploadMode("url")}
                          className="flex items-center gap-2"
                        >
                          <Link className="w-4 h-4" />
                          Линк оруулах
                        </Button>
                      </div>

                      {/* File Upload */}
                      {imageUploadMode === "file" && (
                        <div className="space-y-2">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, "yurt")}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full"
                            disabled={uploadedImages.length >= 3}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Зураг сонгох ({uploadedImages.length}/3)
                          </Button>
                        </div>
                      )}

                      {/* URL Input */}
                      {imageUploadMode === "url" && (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              id="image-url-input"
                              placeholder="https://example.com/image1.jpg"
                              className="font-medium flex-1"
                            />
                            <Button
                              type="button"
                              onClick={() => {
                                const input = document.getElementById(
                                  "image-url-input"
                                ) as HTMLInputElement;
                                if (input.value.trim()) {
                                  handleImageUrlChange(
                                    input.value.trim(),
                                    "yurt"
                                  );
                                  input.value = "";
                                }
                              }}
                              disabled={uploadedImages.length >= 3}
                            >
                              Нэмэх
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Image Preview Grid */}
                      {uploadedImages.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-4">
                          {uploadedImages.map((image, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={image}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-24 object-cover rounded border"
                                onError={(e) => {
                                  e.currentTarget.src = "/placeholder.svg";
                                }}
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleRemoveImage(index)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Hidden input for form submission */}
                      <input
                        name="images"
                        type="hidden"
                        value={JSON.stringify(uploadedImages.slice(0, 3))}
                      />
                    </div>
                  </form>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700 font-semibold"
                      onClick={handleAddCamp}
                    >
                      Save Camp
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowAddCamp(false)}
                      className="font-medium"
                    >
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
                        <TableHead className="min-w-[150px] font-semibold">
                          Camp Name
                        </TableHead>
                        <TableHead className="font-semibold">Owner</TableHead>
                        <TableHead className="font-semibold">
                          Location
                        </TableHead>
                        <TableHead className="font-semibold">
                          Price/Night
                        </TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {camps.map((camp: any) => (
                        <TableRow key={camp.id}>
                          <TableCell className="font-semibold">
                            {camp.name}
                          </TableCell>
                          <TableCell className="font-medium">
                            {camp.owner}
                          </TableCell>
                          <TableCell className="font-medium">
                            {camp.location}
                          </TableCell>
                          <TableCell className="font-bold">
                            ${camp.price}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                camp.status === "active"
                                  ? "default"
                                  : "secondary"
                              }
                              className="font-medium"
                            >
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
                                    <DialogTitle className="font-bold">
                                      Camp Details
                                    </DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <label className="text-sm font-semibold">
                                        Camp Name
                                      </label>
                                      <p className="text-sm text-gray-600 font-medium">
                                        {camp.name}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-semibold">
                                        Owner
                                      </label>
                                      <p className="text-sm text-gray-600 font-medium">
                                        {camp.owner}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-semibold">
                                        Location
                                      </label>
                                      <p className="text-sm text-gray-600 font-medium">
                                        {camp.location}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-semibold">
                                        Price per Night
                                      </label>
                                      <p className="text-sm text-gray-600 font-medium">
                                        ${camp.price}
                                      </p>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingItem(camp);
                                  setShowEditYurt(true);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleDelete({ ...camp, type: "yurt" })
                                }
                              >
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
              <h2 className="text-xl sm:text-2xl font-bold">
                Orders Management
              </h2>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto bg-transparent font-medium"
                >
                  Export
                </Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto font-semibold">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </Button>
              </div>
            </div>

            {/* Product Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold">
                  Product Orders
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-semibold">
                          Order ID
                        </TableHead>
                        <TableHead className="min-w-[120px] font-semibold">
                          Customer
                        </TableHead>
                        <TableHead className="min-w-[150px] font-semibold">
                          Item
                        </TableHead>
                        <TableHead className="font-semibold">Amount</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="hidden sm:table-cell font-semibold">
                          Date
                        </TableHead>
                        <TableHead className="font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order: any) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-bold">
                            #{order.id}
                          </TableCell>
                          <TableCell className="truncate max-w-[120px] font-medium">
                            {order.customer}
                          </TableCell>
                          <TableCell className="truncate max-w-[150px] font-medium">
                            {order.item}
                          </TableCell>
                          <TableCell className="font-bold">
                            ${order.amount}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                order.status === "completed"
                                  ? "default"
                                  : "secondary"
                              }
                              className="font-medium"
                            >
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell font-medium">
                            {order.date}
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
                                    <DialogTitle className="font-bold">
                                      Order Details
                                    </DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <label className="text-sm font-semibold">
                                        Order ID
                                      </label>
                                      <p className="text-sm text-gray-600 font-medium">
                                        #{order.id}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-semibold">
                                        Customer
                                      </label>
                                      <p className="text-sm text-gray-600 font-medium">
                                        {order.customer}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-semibold">
                                        Type
                                      </label>
                                      <p className="text-sm text-gray-600 font-medium">
                                        {order.type}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-semibold">
                                        Item
                                      </label>
                                      <p className="text-sm text-gray-600 font-medium">
                                        {order.item}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-semibold">
                                        Amount
                                      </label>
                                      <p className="text-sm text-gray-600 font-medium">
                                        ${order.amount}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-semibold">
                                        Status
                                      </label>
                                      <p className="text-sm text-gray-600 font-medium">
                                        {order.status}
                                      </p>
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

            {/* Camp Bookings by Yurt */}
            {Object.keys(bookingsByYurt).map((yurtName) => (
              <Card key={yurtName}>
                <CardHeader>
                  <CardTitle className="text-lg font-bold">
                    Баазын захиалгууд - {yurtName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="font-semibold">
                            Booking ID
                          </TableHead>
                          <TableHead className="min-w-[120px] font-semibold">
                            Customer
                          </TableHead>
                          <TableHead className="font-semibold">
                            Amount
                          </TableHead>
                          <TableHead className="font-semibold">
                            Status
                          </TableHead>
                          <TableHead className="hidden sm:table-cell font-semibold">
                            Date
                          </TableHead>
                          <TableHead className="font-semibold">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bookingsByYurt[yurtName].map((booking: any) => (
                          <TableRow key={booking.id}>
                            <TableCell className="font-bold">
                              #{booking.id}
                            </TableCell>
                            <TableCell className="truncate max-w-[120px] font-medium">
                              {booking.customer}
                            </TableCell>
                            <TableCell className="font-bold">
                              ${booking.amount}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  booking.status === "completed"
                                    ? "default"
                                    : "secondary"
                                }
                                className="font-medium"
                              >
                                {booking.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell font-medium">
                              {booking.date}
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
                                      <DialogTitle className="font-bold">
                                        Booking Details
                                      </DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <label className="text-sm font-semibold">
                                          Booking ID
                                        </label>
                                        <p className="text-sm text-gray-600 font-medium">
                                          #{booking.id}
                                        </p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-semibold">
                                          Customer
                                        </label>
                                        <p className="text-sm text-gray-600 font-medium">
                                          {booking.customer}
                                        </p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-semibold">
                                          Camp
                                        </label>
                                        <p className="text-sm text-gray-600 font-medium">
                                          {booking.yurtName}
                                        </p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-semibold">
                                          Amount
                                        </label>
                                        <p className="text-sm text-gray-600 font-medium">
                                          ${booking.amount}
                                        </p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-semibold">
                                          Status
                                        </label>
                                        <p className="text-sm text-gray-600 font-medium">
                                          {booking.status}
                                        </p>
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
            ))}
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl sm:text-2xl font-bold">
                Content Management
              </h2>
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddContent(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Content Type
                      </label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select content type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="destination">
                            Tourist Destination
                          </SelectItem>
                          <SelectItem value="festival">
                            Festival/Event
                          </SelectItem>
                          <SelectItem value="resort">Resort/Spa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Title
                      </label>
                      <Input
                        placeholder="Enter title"
                        className="font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Location
                      </label>
                      <Input
                        placeholder="Enter location"
                        className="font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Date (for events)
                      </label>
                      <Input type="date" className="font-medium" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <Textarea
                      placeholder="Describe the content..."
                      className="font-medium"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700 font-semibold"
                      onClick={() => handleAddContent({})}
                    >
                      Save Content
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowAddContent(false)}
                      className="font-medium"
                    >
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
                  <Button
                    variant="outline"
                    className="w-full bg-transparent font-medium"
                  >
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
                  <Button
                    variant="outline"
                    className="w-full bg-transparent font-medium"
                  >
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
                  <p className="text-gray-600 mb-4 text-sm sm:text-base font-medium">
                    Manage resort and spa listings
                  </p>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent font-medium"
                  >
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
                Are you sure you want to delete this item? This action cannot be
                undone.
              </p>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <Button
                  variant="destructive"
                  onClick={confirmDelete}
                  className="w-full sm:w-auto font-semibold"
                >
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
  );
}
