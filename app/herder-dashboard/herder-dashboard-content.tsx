"use client";

import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useIdleLogout } from "@/hooks/use-idle-logout";
import {
  Plus,
  Package,
  Home,
  Edit,
  Trash2,
  Star,
  TrendingUp,
  X,
  LogOut,
  Upload,
  Link,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  users,
  CreditCard,
  AlertTriangle,
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
} from "@/components/ui/dialog";
import { Header } from "@/components/header";
import { useQuery, useMutation } from "@apollo/client";
import "../../lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/use-toast";
import { ProfileSettings } from "@/components/profile-settings";
import mnzipData from "@/data/mnzip.json";
import {
  amenitiesOptions,
  activitiesOptions,
  accommodationTypes,
  facilitiesOptions,
  policiesOptions,
} from "@/data/camp-options";
import { Checkbox } from "@/components/ui/checkbox";
import {
  GET_HERDER_STATS,
  GET_HERDER_PRODUCTS,
  GET_HERDER_YURTS,
  GET_HERDER_ORDERS,
  GET_HERDER_BOOKINGS,
  CREATE_YURT,
  UPDATE_YURT,
  DELETE_YURT,
  CREATE_PRODUCT,
  UPDATE_PRODUCT,
  DELETE_PRODUCT,
  UPDATE_BOOKING_STATUS,
} from "./queries";

export default function HerderDashboardContent() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");
  const { logout, user } = useAuth();
  
  // Auto-logout after 5 minutes of inactivity
  useIdleLogout({
    timeout: 5 * 60 * 1000, // 5 minutes
    onLogout: logout,
  });
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddCamp, setShowAddCamp] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [imageUploadMode, setImageUploadMode] = useState<"file" | "url">(
    "file"
  );
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Form states
  const [yurtForm, setYurtForm] = useState({
    name: "",
    description: "",
    location: "",
    province: "",
    district: "",
    pricePerNight: "",
    capacity: "",
    amenities: [] as string[],
    activities: [] as string[],
    accommodationType: "",
    facilities: [] as string[],
    checkIn: "14:00",
    checkOut: "11:00",
    childrenPolicy: "all_ages",
    petsPolicy: "not_allowed",
    smokingPolicy: "no_smoking",
    cancellationPolicy: "free_48h",
    images: "",
  });
  
  // Province and district data
  const provinces = mnzipData.zipcode;
  const selectedProvince = provinces.find((p: any) => p.mnname === yurtForm.province);
  const districts = selectedProvince?.sub_items || [];
  
  // Debug log for districts
  console.log('📍 Selected Province:', yurtForm.province);
  console.log('📍 Districts available:', districts.length);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    images: "",
    categoryId: "",
  });

  // Fetch real data from database
  const { data: statsData, loading: statsLoading } = useQuery(
    GET_HERDER_STATS
  );
  const { data: productsData, loading: productsLoading } =
    useQuery(GET_HERDER_PRODUCTS);
  const {
    data: yurtsData,
    loading: yurtsLoading,
    refetch: refetchYurts,
  } = useQuery(GET_HERDER_YURTS, {
    variables: { userId: user?.id },
    skip: !user?.id,
  });
  const { data: ordersData, loading: ordersLoading } =
    useQuery(GET_HERDER_ORDERS);
  const { data: bookingsData, loading: bookingsLoading, refetch: refetchBookings } =
    useQuery(GET_HERDER_BOOKINGS);

  // Mutations
  const [createYurt] = useMutation(CREATE_YURT, {
    refetchQueries: [GET_HERDER_YURTS, GET_HERDER_STATS],
  });
  const [updateYurt] = useMutation(UPDATE_YURT, {
    refetchQueries: [GET_HERDER_YURTS],
  });
  const [deleteYurt] = useMutation(DELETE_YURT, {
    refetchQueries: [GET_HERDER_YURTS, GET_HERDER_STATS],
  });
  const [createProduct] = useMutation(CREATE_PRODUCT, {
    refetchQueries: [GET_HERDER_PRODUCTS, GET_HERDER_STATS],
  });
  const [updateProduct] = useMutation(UPDATE_PRODUCT, {
    refetchQueries: [GET_HERDER_PRODUCTS],
  });
  const [deleteProduct] = useMutation(DELETE_PRODUCT, {
    refetchQueries: [GET_HERDER_PRODUCTS, GET_HERDER_STATS],
  });
  const [updateBookingStatus] = useMutation(UPDATE_BOOKING_STATUS, {
    refetchQueries: [GET_HERDER_BOOKINGS],
  });

  // Transform data for display
  const herder = {
    name: user?.name || "Ганбаатар Батбаяр",
    email: user?.email || "batbayar@email.com",
    phone: "+976 9999 5678",
    location: "Архангай аймаг",
    joinDate: "2023 оны 3-р сар",
    totalProducts: productsData?.products?.edges?.length || 0,
    totalCamps: yurtsData?.yurts?.edges?.length || 0,
    totalRevenue:
      (ordersData?.orders?.edges?.reduce(
        (sum: number, edge: any) => sum + edge.node.totalPrice,
        0
      ) || 0) +
      (bookingsData?.bookings?.edges?.reduce(
        (sum: number, edge: any) => sum + edge.node.totalPrice,
        0
      ) || 0),
    rating: 4.8,
  };

  // Safely parse images string (JSON array or single URL) and return first image URL/base64
  const getPrimaryImage = (images: any): string => {
    if (!images) return "/placeholder.svg";
    try {
      const parsed = typeof images === "string" ? JSON.parse(images) : images;
      if (Array.isArray(parsed) && parsed.length > 0) return String(parsed[0]);
      if (typeof parsed === "string" && parsed) return parsed;
      return "/placeholder.svg";
    } catch {
      return typeof images === "string" && images ? images : "/placeholder.svg";
    }
  };

  // Calculate additional stats from real data
  const todayProducts =
    productsData?.products?.edges?.filter(
      (edge: any) =>
        new Date(edge.node.createdAt).toDateString() ===
        new Date().toDateString()
    ).length || 0;

  const todayCamps =
    yurtsData?.yurts?.edges?.filter(
      (edge: any) =>
        new Date(edge.node.createdAt).toDateString() ===
        new Date().toDateString()
    ).length || 0;

  const todayOrders =
    ordersData?.orders?.edges?.filter(
      (edge: any) =>
        new Date(edge.node.createdAt).toDateString() ===
        new Date().toDateString()
    ).length || 0;

  const todayBookings =
    bookingsData?.bookings?.edges?.filter(
      (edge: any) =>
        new Date(edge.node.createdAt).toDateString() ===
        new Date().toDateString()
    ).length || 0;

  // Transform data for display
  const products =
    productsData?.products?.edges?.map((edge: any) => ({
      id: edge.node.id,
      name: edge.node.name,
      category: edge.node.category?.name || "Uncategorized",
      price: edge.node.price,
      stock: edge.node.stock,
      sold: 0, // Default sold count
      status: edge.node.stock > 0 ? "active" : "out_of_stock",
      image: getPrimaryImage(edge.node.images),
    })) || [];

  const camps =
    yurtsData?.yurts?.edges?.map((edge: any) => ({
      id: edge.node.id,
      name: edge.node.name,
      location: edge.node.location,
      price: edge.node.pricePerNight,
      capacity: edge.node.capacity,
      bookings: 0, // Default booking count
      rating: 4.8, // Default rating
      status: "active",
      image: getPrimaryImage(edge.node.images),
    })) || [];

  const orders =
    ordersData?.orders?.edges?.map((edge: any) => ({
      id: edge.node.id,
      customer: edge.node.user?.name || "Unknown",
      product: edge.node.items[0]?.product?.name || "Multiple items",
      quantity: edge.node.items.reduce(
        (sum: number, item: any) => sum + item.quantity,
        0
      ),
      amount: edge.node.totalPrice,
      status: edge.node.status.toLowerCase(),
      date: edge.node.createdAt.split("T")[0],
    })) || [];

  const bookings =
    bookingsData?.bookings?.edges?.map((edge: any) => ({
      id: edge.node.id,
      customer: edge.node.user?.name || "Unknown",
      customerEmail: edge.node.user?.email || "N/A",
      customerPhone: edge.node.user?.phone || "N/A",
      camp: edge.node.yurt?.name || "Unknown camp",
      campLocation: edge.node.yurt?.location || "N/A",
      checkIn: edge.node.startDate,
      checkOut: edge.node.endDate,
      guests: 2, // Default value since backend doesn't have this field yet
      amount: edge.node.totalPrice,
      paymentStatus: edge.node.status === "PENDING" || edge.node.status === "CONFIRMED" ? "unpaid" : "paid", // Derive from status
      status: edge.node.status.toLowerCase(),
      rawStatus: edge.node.status, // Keep original uppercase status
      image: getPrimaryImage(edge.node.yurt?.images),
      yurtId: edge.node.yurt?.id,
    })) || [];

  // Yurt management functions
  const handleCreateYurt = async () => {
    try {
      // Optimize images data - limit to first 3 images
      const optimizedImages = uploadedImages.slice(0, 3);

      await createYurt({
        variables: {
          input: {
            name: yurtForm.name,
            description: yurtForm.description,
            location: yurtForm.location,
            pricePerNight: parseFloat(yurtForm.pricePerNight),
            capacity: parseInt(yurtForm.capacity),
            amenities: JSON.stringify({
              items: yurtForm.amenities,
              activities: yurtForm.activities,
              accommodationType: yurtForm.accommodationType,
              facilities: yurtForm.facilities,
              policies: {
                checkIn: yurtForm.checkIn,
                checkOut: yurtForm.checkOut,
                children: yurtForm.childrenPolicy,
                pets: yurtForm.petsPolicy,
                smoking: yurtForm.smokingPolicy,
                cancellation: yurtForm.cancellationPolicy,
              },
            }),
            images: JSON.stringify(optimizedImages),
          },
        },
      });
      toast({ title: "Амжилттай", description: "Гэр амжилттай нэмэгдлээ" });
      setShowAddCamp(false);
      setYurtForm({
        name: "",
        description: "",
        location: "",
        province: "",
        district: "",
        pricePerNight: "",
        capacity: "",
        amenities: [],
        activities: [],
        accommodationType: "",
        facilities: [],
        checkIn: "14:00",
        checkOut: "11:00",
        childrenPolicy: "all_ages",
        petsPolicy: "not_allowed",
        smokingPolicy: "no_smoking",
        cancellationPolicy: "free_48h",
        images: "",
      });
      setUploadedImages([]);
    } catch (error: any) {
      toast({
        title: "Алдаа",
        description: error.message,
        variant: "destructive" as any,
      });
    }
  };

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
            amenities: JSON.stringify({
              items: yurtForm.amenities,
              activities: yurtForm.activities,
              accommodationType: yurtForm.accommodationType,
              facilities: yurtForm.facilities,
              policies: {
                checkIn: yurtForm.checkIn,
                checkOut: yurtForm.checkOut,
                children: yurtForm.childrenPolicy,
                pets: yurtForm.petsPolicy,
                smoking: yurtForm.smokingPolicy,
                cancellation: yurtForm.cancellationPolicy,
              },
            }),
            images: JSON.stringify(uploadedImages.slice(0, 3)),
          },
        },
      });
      toast({ title: "Амжилттай", description: "Гэр амжилттай шинэчигдлээ" });
      setSelectedItem(null);
      setShowAddCamp(false);
      setYurtForm({
        name: "",
        description: "",
        location: "",
        province: "",
        district: "",
        pricePerNight: "",
        capacity: "",
        amenities: [],
        activities: [],
        accommodationType: "",
        facilities: [],
        checkIn: "14:00",
        checkOut: "11:00",
        childrenPolicy: "all_ages",
        petsPolicy: "not_allowed",
        smokingPolicy: "no_smoking",
        cancellationPolicy: "free_48h",
        images: "",
      });
      setUploadedImages([]);
    } catch (error: any) {
      toast({
        title: "Алдаа",
        description: error.message,
        variant: "destructive" as any,
      });
    }
  };

  const handleDeleteYurt = async () => {
    try {
      await deleteYurt({
        variables: { id: selectedItem.id },
      });
      toast({ title: "Амжилттай", description: "Гэр амжилттай устгагдлаа" });
      setShowDeleteDialog(false);
      setSelectedItem(null);
    } catch (error: any) {
      toast({
        title: "Алдаа",
        description: error.message,
        variant: "destructive" as any,
      });
    }
  };

  const handleEditYurt = (yurt: any) => {
    setSelectedItem(yurt);
    // Parse location to get province and district
    const locationParts = yurt.location.split(', ');
    
    // Parse amenities JSON
    let parsedAmenities: any = {};
    try {
      parsedAmenities = yurt.amenities ? JSON.parse(yurt.amenities) : {};
    } catch (e) {
      // Fallback for old string format
      parsedAmenities = { items: [] };
    }
    
    setYurtForm({
      name: yurt.name,
      description: yurt.description || "",
      location: yurt.location,
      province: locationParts[0] || "",
      district: locationParts[1] || "",
      pricePerNight: yurt.pricePerNight?.toString() || "",
      capacity: yurt.capacity?.toString() || "",
      amenities: parsedAmenities.items || [],
      activities: parsedAmenities.activities || [],
      accommodationType: parsedAmenities.accommodationType || "",
      facilities: parsedAmenities.facilities || [],
      checkIn: parsedAmenities.policies?.checkIn || "14:00",
      checkOut: parsedAmenities.policies?.checkOut || "11:00",
      childrenPolicy: parsedAmenities.policies?.children || "all_ages",
      petsPolicy: parsedAmenities.policies?.pets || "not_allowed",
      smokingPolicy: parsedAmenities.policies?.smoking || "no_smoking",
      cancellationPolicy: parsedAmenities.policies?.cancellation || "free_48h",
      images: yurt.images || "",
    });
    
    // Parse images and set uploadedImages
    try {
      const images = JSON.parse(yurt.images);
      if (Array.isArray(images)) {
        setUploadedImages(images);
      }
    } catch (e) {
      // Handle single image or invalid format
      setUploadedImages([]);
    }
    
    setShowAddCamp(true);
  };

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
            images: JSON.stringify(uploadedImages.slice(0, 3)),
            categoryId: productForm.categoryId,
          },
        },
      });
      toast({
        title: "Амжилттай",
        description: "Бүтээгдэхүүн амжилттай нэмэгдлээ",
      });
      setShowAddProduct(false);
      setProductForm({
        name: "",
        description: "",
        price: "",
        stock: "",
        images: "",
        categoryId: "",
      });
      setUploadedImages([]); // Clear uploaded images
    } catch (error: any) {
      toast({
        title: "Алдаа",
        description: error.message,
        variant: "destructive" as any,
      });
    }
  };

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
            images: JSON.stringify(uploadedImages.slice(0, 3)),
            categoryId: productForm.categoryId,
          },
        },
      });
      toast({
        title: "Амжилттай",
        description: "Бүтээгдэхүүн амжилттай шинэчигдлээ",
      });
      setSelectedItem(null);
      setShowAddProduct(false);
      setProductForm({
        name: "",
        description: "",
        price: "",
        stock: "",
        images: "",
        categoryId: "",
      });
      setUploadedImages([]); // Clear uploaded images
    } catch (error: any) {
      toast({
        title: "Алдаа",
        description: error.message,
        variant: "destructive" as any,
      });
    }
  };

  const handleDeleteProduct = async () => {
    try {
      await deleteProduct({
        variables: { id: selectedItem.id },
      });
      toast({
        title: "Амжилттай",
        description: "Бүтээгдэхүүн амжилттай устгагдлаа",
      });
      setShowDeleteDialog(false);
      setSelectedItem(null);
    } catch (error: any) {
      toast({
        title: "Алдаа",
        description: error.message,
        variant: "destructive" as any,
      });
    }
  };

  const handleEditProduct = (product: any) => {
    setSelectedItem(product);
    setProductForm({
      name: product.name,
      description: product.description || "",
      price: product.price?.toString() || "",
      stock: product.stock?.toString() || "",
      images: product.image || "",
      categoryId: product.categoryId || "",
    });
    setShowAddProduct(true);
  };

  const handleDelete = (item: any) => {
    setSelectedItem(item);
    setShowDeleteDialog(true);
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

  const confirmDelete = async () => {
    try {
      // Determine if the item is a product or a yurt based on its properties
      const isProduct = "stock" in selectedItem;

      if (isProduct) {
        await handleDeleteProduct();
      } else {
        await handleDeleteYurt();
      }

      toast({
        title: "Амжилттай",
        description: isProduct
          ? "Бүтээгдэхүүн амжилттай устгагдлаа"
          : "Гэр амжилттай устгагдлаа",
      });
    } catch (error: any) {
      toast({
        title: "Алдаа",
        description: error.message || "Устгах үед алдаа гарлаа",
        variant: "destructive" as any,
      });
    } finally {
      setShowDeleteDialog(false);
      setSelectedItem(null);
    }
  };

  // Booking management functions
  const handleAcceptBooking = async (bookingId: string) => {
    try {
      await updateBookingStatus({
        variables: { 
          id: bookingId, 
          input: { status: "CONFIRMED" }
        },
      });
      toast({
        title: "Амжилттай",
        description: "Захиалгыг баталгаажууллаа",
      });
    } catch (error: any) {
      toast({
        title: "Алдаа",
        description: error.message,
        variant: "destructive" as any,
      });
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    try {
      await updateBookingStatus({
        variables: { 
          id: bookingId, 
          input: { status: "CANCELLED" }
        },
      });
      toast({
        title: "Амжилттай",
        description: "Захиалгыг цуцаллаа",
      });
    } catch (error: any) {
      toast({
        title: "Алдаа",
        description: error.message,
        variant: "destructive" as any,
      });
    }
  };

  // Check for booking date conflicts
  const checkDateConflicts = (yurtId: string, checkIn: string, checkOut: string, excludeBookingId?: string) => {
    const conflictingBookings = bookings.filter((booking: any) => {
      if (booking.yurtId !== yurtId) return false;
      if (excludeBookingId && booking.id === excludeBookingId) return false;
      if (booking.status === "cancelled" || booking.rawStatus === "CANCELLED") return false;

      const bookingStart = new Date(booking.checkIn).getTime();
      const bookingEnd = new Date(booking.checkOut).getTime();
      const newStart = new Date(checkIn).getTime();
      const newEnd = new Date(checkOut).getTime();

      // Check if dates overlap
      return (newStart < bookingEnd && newEnd > bookingStart);
    });

    return conflictingBookings;
  };

  // Format date to readable format
  const formatDate = (dateString: string) => {
    try {
      const timestamp = parseInt(dateString);
      if (!isNaN(timestamp)) {
        return new Date(timestamp).toLocaleDateString('mn-MN');
      }
      return new Date(dateString).toLocaleDateString('mn-MN');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-8">
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 font-display">
            Малчны самбар
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm md:text-base font-medium mt-1">
            Өөрийн бүтээгдэхүүн, бааз, захиалгаа удирдаарай
          </p>
        </div>

        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            onClick={logout}
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Гарах
          </Button>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-5 min-w-[500px] sm:min-w-0">
              <TabsTrigger
                value="overview"
                className="text-xs sm:text-sm font-medium"
              >
                Тойм
              </TabsTrigger>
              <TabsTrigger
                value="products"
                className="text-xs sm:text-sm font-medium"
              >
                Бүтээгдэхүүнүүд
              </TabsTrigger>
              <TabsTrigger
                value="camps"
                className="text-xs sm:text-sm font-medium"
              >
                Миний гэр
              </TabsTrigger>
              <TabsTrigger
                value="orders"
                className="text-xs sm:text-sm font-medium"
              >
                Захиалгууд
              </TabsTrigger>
              <TabsTrigger
                value="profile"
                className="text-xs sm:text-sm font-medium"
              >
                Профайл
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-semibold">
                    Нийт бүтээгдэхүүн
                  </CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">
                    {herder.totalProducts}
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">
                    +{todayProducts} өнөөдөр
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-semibold">
                    Идэвхтэй баазууд
                  </CardTitle>
                  <Home className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">
                    {herder.totalCamps}
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">
                    +{todayCamps} өнөөдөр
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-semibold">
                    Нийт орлого
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">
                    ${herder.totalRevenue}
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">
                    +15% өнгөрсөн сараас
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-semibold">
                    Дундаж үнэлгээ
                  </CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">
                    {herder.rating}
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">
                    89 үнэлгээнд үндэслэв
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
                    {orders.slice(0, 5).map((order: any) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm sm:text-base truncate">
                            {order.customer}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600 truncate font-medium">
                            {order.product}
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
                    Сүүлийн захиалгууд
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {bookings.map((booking: any) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm sm:text-base truncate">
                            {booking.customer}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600 truncate font-medium">
                            {booking.camp}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-bold text-sm sm:text-base">
                            ${booking.amount}
                          </p>
                          <Badge
                            variant={
                              booking.status === "completed"
                                ? "default"
                                : "secondary"
                            }
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
              <h2 className="text-xl sm:text-2xl font-bold">
                Миний бүтээгдэхүүн
              </h2>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto font-semibold"
                onClick={() => setShowAddProduct(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Шинэ бүтээгдэхүүн нэмэх
              </Button>
            </div>

            <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-bold">
                    {selectedItem ? "Бүтээгдэхүүн засах" : "Шинэ бүтээгдэхүүн нэмэх"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Product Name
                      </label>
                      <Input
                        placeholder="Enter product name"
                        className="font-medium"
                        value={productForm.name}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Category
                      </label>
                      <Select
                        value={productForm.categoryId}
                        onValueChange={(value) =>
                          setProductForm({ ...productForm, categoryId: value })
                        }
                      >
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
                        value={productForm.price}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            price: e.target.value,
                          })
                        }
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
                        value={productForm.stock}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            stock: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <Textarea
                      placeholder="Describe your product..."
                      className="font-medium"
                      value={productForm.description}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          description: e.target.value,
                        })
                      }
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
                          onChange={(e) => handleFileUpload(e, "product")}
                          className="hidden"
                          aria-label="Бүтээгдэхүүний зураг оруулах"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full"
                          disabled={uploadedImages.length >= 10}
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
                            id="product-image-url-input"
                            placeholder="https://example.com/image1.jpg"
                            className="font-medium flex-1"
                          />
                          <Button
                            type="button"
                            onClick={() => {
                              const input = document.getElementById(
                                "product-image-url-input"
                              ) as HTMLInputElement;
                              if (input.value.trim()) {
                                handleImageUrlChange(
                                  input.value.trim(),
                                  "product"
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
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700 font-semibold"
                      onClick={
                        selectedItem ? handleUpdateProduct : handleCreateProduct
                      }
                    >
                      {selectedItem
                        ? "Бүтээгдэхүүн шинэчлэх"
                        : "Бүтээгдэхүүн хадгалах"}
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
                          categoryId: "",
                        });
                        setUploadedImages([]);
                      }}
                      className="font-medium"
                    >
                      Цуцлах
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {products.map((product: any) => (
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
                      <h3 className="font-bold text-base sm:text-lg truncate flex-1">
                        {product.name}
                      </h3>
                      <Badge
                        variant={
                          product.status === "active"
                            ? "default"
                            : "destructive"
                        }
                        className="text-xs ml-2 font-medium"
                      >
                        {product.status}
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm mb-2 capitalize font-medium">
                      {product.category}
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xl font-bold">
                        ${product.price}
                      </span>
                      <span className="text-sm text-gray-600 font-medium">
                        Stock: {product.stock}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-600 font-medium">
                        Sold: {product.sold}
                      </span>
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
                        Засах
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(product)}
                      >
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
              <h2 className="text-xl sm:text-2xl font-bold">
                Миний гэр баазууд
              </h2>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto font-semibold"
                onClick={() => setShowAddCamp(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Шинэ бааз нэмэх
              </Button>
            </div>

            <Dialog open={showAddCamp} onOpenChange={setShowAddCamp}>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-bold">
                    {selectedItem ? "Бааз засах" : "Шинэ бааз нэмэх"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Camp Name
                      </label>
                      <Input
                        placeholder="Enter camp name"
                        className="font-medium"
                        value={yurtForm.name}
                        onChange={(e) =>
                          setYurtForm({ ...yurtForm, name: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Аймаг
                      </label>
                      <Select
                        value={yurtForm.province}
                        onValueChange={(value) => {
                          console.log('🏔️ Province selected:', value);
                          setYurtForm({ 
                            ...yurtForm, 
                            province: value,
                            district: "", // Reset district when province changes
                            location: value // Temporarily set to province only
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Аймаг сонгох" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {provinces.map((province: any) => (
                            <SelectItem key={province.zipcode} value={province.mnname}>
                              {province.mnname}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Сум/Дүүрэг
                      </label>
                      <Select
                        value={yurtForm.district}
                        onValueChange={(value) => {
                          console.log('🏘️ District selected:', value);
                          const location = `${yurtForm.province}, ${value}`;
                          setYurtForm({ 
                            ...yurtForm, 
                            district: value,
                            location: location
                          });
                        }}
                        disabled={!yurtForm.province}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={yurtForm.province ? "Сум/Дүүрэг сонгох" : "Эхлээд аймаг сонгоно уу"} />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {districts.length > 0 ? (
                            districts.map((district: any) => (
                              <SelectItem key={district.zipcode} value={district.mnname}>
                                {district.mnname}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-2 text-sm text-gray-500">
                              Сум олдсонгүй
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Price per Night ($)
                      </label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        className="font-medium"
                        value={yurtForm.pricePerNight}
                        onChange={(e) =>
                          setYurtForm({
                            ...yurtForm,
                            pricePerNight: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Guest Capacity
                      </label>
                      <Input
                        type="number"
                        placeholder="0"
                        className="font-medium"
                        value={yurtForm.capacity}
                        onChange={(e) =>
                          setYurtForm({ ...yurtForm, capacity: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <Textarea
                      placeholder="Describe your camp..."
                      className="font-medium"
                      value={yurtForm.description}
                      onChange={(e) =>
                        setYurtForm({
                          ...yurtForm,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  {/* Amenities - Checkbox */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Тасалбар
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 border rounded-lg bg-gray-50">
                      {amenitiesOptions.map((amenity) => (
                        <label
                          key={amenity.value}
                          className="flex items-center space-x-2 cursor-pointer hover:bg-white p-2 rounded transition-colors"
                        >
                          <Checkbox
                            checked={yurtForm.amenities.includes(amenity.value)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setYurtForm({
                                  ...yurtForm,
                                  amenities: [...yurtForm.amenities, amenity.value],
                                });
                              } else {
                                setYurtForm({
                                  ...yurtForm,
                                  amenities: yurtForm.amenities.filter(
                                    (a) => a !== amenity.value
                                  ),
                                });
                              }
                            }}
                          />
                          <span className="text-sm">{amenity.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Activities - Checkbox */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Үйл ажиллагаа
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 border rounded-lg bg-gray-50">
                      {activitiesOptions.map((activity) => (
                        <label
                          key={activity.value}
                          className="flex items-center space-x-2 cursor-pointer hover:bg-white p-2 rounded transition-colors"
                        >
                          <Checkbox
                            checked={yurtForm.activities.includes(activity.value)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setYurtForm({
                                  ...yurtForm,
                                  activities: [...yurtForm.activities, activity.value],
                                });
                              } else {
                                setYurtForm({
                                  ...yurtForm,
                                  activities: yurtForm.activities.filter(
                                    (a) => a !== activity.value
                                  ),
                                });
                              }
                            }}
                          />
                          <span className="text-sm">{activity.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Accommodation Type - Select */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Байрны төрөл
                    </label>
                    <Select
                      value={yurtForm.accommodationType}
                      onValueChange={(value) =>
                        setYurtForm({ ...yurtForm, accommodationType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Төрөл сонгох" />
                      </SelectTrigger>
                      <SelectContent>
                        {accommodationTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Facilities - Checkbox */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Тохижилт
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 border rounded-lg bg-gray-50">
                      {facilitiesOptions.map((facility) => (
                        <label
                          key={facility.value}
                          className="flex items-center space-x-2 cursor-pointer hover:bg-white p-2 rounded transition-colors"
                        >
                          <Checkbox
                            checked={yurtForm.facilities.includes(facility.value)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setYurtForm({
                                  ...yurtForm,
                                  facilities: [...yurtForm.facilities, facility.value],
                                });
                              } else {
                                setYurtForm({
                                  ...yurtForm,
                                  facilities: yurtForm.facilities.filter(
                                    (f) => f !== facility.value
                                  ),
                                });
                              }
                            }}
                          />
                          <span className="text-sm">{facility.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Policies */}
                  <div className="border-t pt-4 space-y-4">
                    <h3 className="font-bold text-base">Дүрэм журам</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Check-in Time */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Ирэх цаг
                        </label>
                        <Select
                          value={yurtForm.checkIn}
                          onValueChange={(value) =>
                            setYurtForm({ ...yurtForm, checkIn: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {policiesOptions.checkInTimes.map((time) => (
                              <SelectItem key={time.value} value={time.value}>
                                {time.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Check-out Time */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Гарах цаг
                        </label>
                        <Select
                          value={yurtForm.checkOut}
                          onValueChange={(value) =>
                            setYurtForm({ ...yurtForm, checkOut: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {policiesOptions.checkOutTimes.map((time) => (
                              <SelectItem key={time.value} value={time.value}>
                                {time.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Children Policy */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Хүүхдийн дүрэм
                        </label>
                        <Select
                          value={yurtForm.childrenPolicy}
                          onValueChange={(value) =>
                            setYurtForm({ ...yurtForm, childrenPolicy: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {policiesOptions.childrenPolicy.map((policy) => (
                              <SelectItem key={policy.value} value={policy.value}>
                                {policy.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Pets Policy */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Тэжээвэр амьтны дүрэм
                        </label>
                        <Select
                          value={yurtForm.petsPolicy}
                          onValueChange={(value) =>
                            setYurtForm({ ...yurtForm, petsPolicy: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {policiesOptions.petsPolicy.map((policy) => (
                              <SelectItem key={policy.value} value={policy.value}>
                                {policy.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Smoking Policy */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Тамхины дүрэм
                        </label>
                        <Select
                          value={yurtForm.smokingPolicy}
                          onValueChange={(value) =>
                            setYurtForm({ ...yurtForm, smokingPolicy: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {policiesOptions.smokingPolicy.map((policy) => (
                              <SelectItem key={policy.value} value={policy.value}>
                                {policy.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Cancellation Policy */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Цуцлалтын дүрэм
                        </label>
                        <Select
                          value={yurtForm.cancellationPolicy}
                          onValueChange={(value) =>
                            setYurtForm({ ...yurtForm, cancellationPolicy: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {policiesOptions.cancellationPolicy.map((policy) => (
                              <SelectItem key={policy.value} value={policy.value}>
                                {policy.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
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
                          aria-label="Гэр баазын зураг оруулах"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full"
                          disabled={uploadedImages.length >= 10}
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
                            id="yurt-image-url-input"
                            placeholder="https://example.com/image1.jpg"
                            className="font-medium flex-1"
                          />
                          <Button
                            type="button"
                            onClick={() => {
                              const input = document.getElementById(
                                "yurt-image-url-input"
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
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700 font-semibold"
                      onClick={
                        selectedItem ? handleUpdateYurt : handleCreateYurt
                      }
                    >
                      {selectedItem ? "Бааз шинэчлэх" : "Бааз хадгалах"}
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
                          province: "",
                          district: "",
                          pricePerNight: "",
                          capacity: "",
                          amenities: [],
                          activities: [],
                          accommodationType: "",
                          facilities: [],
                          checkIn: "14:00",
                          checkOut: "11:00",
                          childrenPolicy: "all_ages",
                          petsPolicy: "not_allowed",
                          smokingPolicy: "no_smoking",
                          cancellationPolicy: "free_48h",
                          images: "",
                        });
                        setUploadedImages([]);
                      }}
                      className="font-medium"
                    >
                      Цуцлах
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {camps.map((camp: any) => (
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
                      <h3 className="font-bold text-base sm:text-lg truncate flex-1">
                        {camp.name}
                      </h3>
                      <Badge
                        variant="default"
                        className="text-xs ml-2 font-medium"
                      >
                        {camp.status}
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 font-medium">
                      {camp.location}
                    </p>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600 font-medium">
                          Price per night
                        </p>
                        <p className="text-xl font-bold">${camp.price}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">
                          Capacity
                        </p>
                        <p className="text-xl font-bold">
                          {camp.capacity} guests
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                        <span className="text-sm font-semibold">
                          {camp.rating}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600 font-medium">
                        {camp.bookings} bookings
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent font-medium"
                        onClick={() => handleEditYurt(camp)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Засах
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(camp)}
                      >
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
            <h2 className="text-xl sm:text-2xl font-bold">
              Product Orders & Camp Bookings
            </h2>

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
                          <TableHead className="font-semibold">
                            Order ID
                          </TableHead>
                          <TableHead className="min-w-[120px] font-semibold">
                            Customer
                          </TableHead>
                          <TableHead className="min-w-[120px] font-semibold">
                            Product
                          </TableHead>
                          <TableHead className="font-semibold">Qty</TableHead>
                          <TableHead className="font-semibold">
                            Amount
                          </TableHead>
                          <TableHead className="font-semibold">
                            Status
                          </TableHead>
                          <TableHead className="hidden sm:table-cell font-semibold">
                            Date
                          </TableHead>
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
                            <TableCell className="truncate max-w-[120px] font-medium">
                              {order.product}
                            </TableCell>
                            <TableCell className="font-medium">
                              {order.quantity}
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
                <CardContent className="space-y-4">
                  {bookings.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Захиалга байхгүй байна
                    </div>
                  ) : (
                    bookings.map((booking: any) => {
                      const conflicts = checkDateConflicts(
                        booking.yurtId,
                        booking.checkIn,
                        booking.checkOut,
                        booking.id
                      );
                      const hasConflict = conflicts.length > 0;

                      return (
                        <Card
                          key={booking.id}
                          className={`border-l-4 ${
                            hasConflict
                              ? "border-l-orange-500"
                              : booking.status === "pending"
                              ? "border-l-yellow-500"
                              : booking.status === "confirmed"
                              ? "border-l-green-500"
                              : "border-l-gray-300"
                          }`}
                        >
                          <CardContent className="p-4 sm:p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Left Column - Booking Details */}
                              <div className="space-y-4">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h3 className="text-lg font-bold text-gray-900">
                              {booking.camp}
                                    </h3>
                                    <p className="text-sm text-gray-600 flex items-center mt-1">
                                      <MapPin className="w-3 h-3 mr-1" />
                                      {booking.campLocation}
                                    </p>
                                  </div>
                              <Badge
                                variant={
                                      booking.status === "confirmed"
                                    ? "default"
                                        : booking.status === "pending"
                                        ? "secondary"
                                        : "destructive"
                                }
                                className="font-medium"
                              >
                                {booking.status}
                              </Badge>
                                </div>

                                <div className="text-xs text-gray-500 font-mono">
                                  Захиалгын код: #{booking.id}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-1">
                                    <div className="flex items-center text-sm text-gray-600">
                                      <Calendar className="w-4 h-4 mr-2" />
                                      Ирэх
                                    </div>
                                    <div className="font-semibold">
                                      {formatDate(booking.checkIn)}
                                    </div>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex items-center text-sm text-gray-600">
                                      <Calendar className="w-4 h-4 mr-2" />
                                      Гарах
                                    </div>
                                    <div className="font-semibold">
                                      {formatDate(booking.checkOut)}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t">
                                  <div className="flex items-center text-sm text-gray-600">
                                    <users className="w-4 h-4 mr-2" />
                                    {booking.guests} зочин
                                  </div>
                                  <div className="text-right">
                                    <div className="text-2xl font-bold text-emerald-600">
                                      ${booking.amount}
                                    </div>
                                    <div className="flex items-center text-xs mt-1">
                                      <CreditCard className="w-3 h-3 mr-1" />
                                      <span
                                        className={
                                          booking.paymentStatus === "paid"
                                            ? "text-green-600 font-semibold"
                                            : "text-orange-600 font-semibold"
                                        }
                                      >
                                        {booking.paymentStatus === "paid"
                                          ? "Төлбөр төлөгдсөн"
                                          : "Төлбөр хүлээгдэж байна"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Right Column - Customer Details & Actions */}
                              <div className="space-y-4">
                                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                  <h4 className="font-semibold text-gray-900">
                                    Захиалагчийн мэдээлэл
                                  </h4>
                                  <div className="space-y-2">
                                    <div className="flex items-center text-sm">
                                      <users className="w-4 h-4 mr-2 text-gray-500" />
                                      <span className="font-medium">
                                        {booking.customer}
                                      </span>
                                    </div>
                                    <div className="flex items-center text-sm">
                                      <Mail className="w-4 h-4 mr-2 text-gray-500" />
                                      <a
                                        href={`mailto:${booking.customerEmail}`}
                                        className="text-blue-600 hover:underline"
                                      >
                                        {booking.customerEmail}
                                      </a>
                                    </div>
                                    <div className="flex items-center text-sm">
                                      <Phone className="w-4 h-4 mr-2 text-gray-500" />
                                      <a
                                        href={`tel:${booking.customerPhone}`}
                                        className="text-blue-600 hover:underline"
                                      >
                                        {booking.customerPhone}
                                      </a>
                                    </div>
                                  </div>
                                </div>

                                {hasConflict && (
                                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                    <div className="flex items-start">
                                      <AlertTriangle className="w-4 h-4 text-orange-600 mr-2 mt-0.5" />
                                      <div className="text-sm">
                                        <p className="font-semibold text-orange-800">
                                          Хугацаа давхцаж байна!
                                        </p>
                                        <p className="text-orange-700 text-xs mt-1">
                                          {conflicts.length} захиалгатай огноо
                                          давхцаж байна
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {booking.status === "pending" && (
                                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                                    <Button
                                      onClick={() =>
                                        handleAcceptBooking(booking.id)
                                      }
                                      className="flex-1 bg-green-600 hover:bg-green-700"
                                      size="sm"
                                    >
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Зөвшөөрөх
                                    </Button>
                                    <Button
                                      onClick={() =>
                                        handleRejectBooking(booking.id)
                                      }
                                      variant="destructive"
                                      className="flex-1"
                                      size="sm"
                                    >
                                      <XCircle className="w-4 h-4 mr-2" />
                                      Татгалзах
                                    </Button>
                                  </div>
                                )}
                              </div>
                  </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold">Профайл тохиргоо</h2>
            
            {user && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <ProfileSettings 
                    user={{
                      id: user.id,
                      name: user.name,
                      email: user.email,
                      phone: (user as any).phone,
                      role: user.role,
                      hostBio: (user as any).hostBio,
                      hostExperience: (user as any).hostExperience,
                      hostLanguages: (user as any).hostLanguages,
                    }}
                  />
                </div>

                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle className="font-bold">Дансны тойм</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 font-medium">
                          Нийт бүтээгдэхүүн
                        </span>
                        <span className="font-semibold">{herder.totalProducts}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 font-medium">
                          Нийт гэр
                        </span>
                        <span className="font-semibold">{herder.totalCamps}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 font-medium">
                          Нийт орлого
                        </span>
                        <span className="font-bold text-emerald-600">
                          ${herder.totalRevenue.toFixed(0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 font-medium">
                          Дундаж үнэлгээ
                        </span>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                          <span className="font-semibold">{herder.rating}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
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
