"use client";

import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useIdleLogout } from "@/hooks/use-idle-logout";
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
  Link,
  Download,
  Check,
  Upload,
  Clock,
  CheckCircle2,
  Truck,
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
  GET_ALL_userS,
  GET_ALL_YURTS,
  GET_ALL_PRODUCTS,
  GET_ALL_ORDERS,
  GET_ALL_BOOKINGS,
  CREATE_user,
  UPDATE_user,
  DELETE_user,
  CREATE_YURT,
  UPDATE_YURT,
  DELETE_YURT,
  CREATE_PRODUCT,
  UPDATE_PRODUCT,
  DELETE_PRODUCT,
  GET_CATEGORIES,
  UPDATE_BOOKING,
} from "./queries";
import {
  formatDate,
  formatDateTime,
  formatCurrency,
  getTodayCount,
  getStatusBadgeColor,
  translateStatus,
  translateRole,
  exportToExcel,
  prepareBookingsForExport,
  prepareOrdersForExport,
  prepareusersForExport,
  prepareYurtsForExport,
  calculateNights,
} from "@/lib/admin-utils";
import {
  amenitiesOptions,
  activitiesOptions,
  accommodationTypes,
  facilitiesOptions,
  policiesOptions,
} from "@/data/camp-options";
import mnzipDataRaw from "@/data/mnzip.json";
import { Checkbox } from "@/components/ui/checkbox";

export default function AdminDashboardContent() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddCamp, setShowAddCamp] = useState(false);
  const [showAddContent, setShowAddContent] = useState(false);
  const [showAdduser, setShowAdduser] = useState(false);
  const [showEdituser, setShowEdituser] = useState(false);
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

  // Camp form state (like herder dashboard)
  const [campForm, setCampForm] = useState({
    name: "",
    description: "",
    province: "",
    district: "",
    location: "",
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
    ownerId: "",
  });

  // Auto-logout after 30 minutes of inactivity
  useIdleLogout({
    timeout: 30 * 60 * 1000, // 30 minutes
    onLogout: logout,
  });

  // Fetch real data from database
  const {
    data: statsData,
    loading: statsLoading,
    refetch: refetchStats,
  } = useQuery(GET_ADMIN_STATS);
  const {
    data: usersData,
    loading: usersLoading,
    refetch: refetchusers,
  } = useQuery(GET_ALL_userS);
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
  const [createuser] = useMutation(CREATE_user);
  const [updateuser] = useMutation(UPDATE_user);
  const [deleteuser] = useMutation(DELETE_user);
  const [createYurt] = useMutation(CREATE_YURT);
  const [updateYurt] = useMutation(UPDATE_YURT);
  const [deleteYurt] = useMutation(DELETE_YURT);
  const [createProduct] = useMutation(CREATE_PRODUCT);
  const [updateProduct] = useMutation(UPDATE_PRODUCT);
  const [deleteProduct] = useMutation(DELETE_PRODUCT);
  const [updateBooking] = useMutation(UPDATE_BOOKING);

  // Transform data for display
  const stats = {
    totalusers: statsData?.users?.totalCount || 0,
    totalCamps: statsData?.yurts?.totalCount || 0,
    totalProducts: statsData?.products?.totalCount || 0,
    totalOrders:
      (statsData?.orders?.totalCount || 0) +
      (statsData?.bookings?.totalCount || 0),
  };

  // Calculate additional stats from real data
  const today = new Date().toISOString().split("T")[0];

  // Get provinces and districts from mnzipData (same as Herder Dashboard)
  const provinces = (mnzipDataRaw as any).zipcode || [];
  const selectedProvince = provinces.find((p: any) => p.mnname === campForm.province);
  const districts = selectedProvince?.sub_items || [];

  // Transform data for display
  const users =
    usersData?.users?.edges?.map((edge: any) => {
      // Debug log for first user
      if (edge.node && usersData.users.edges[0]?.node.id === edge.node.id) {
        console.warn('🔍 First user data:', {
          name: edge.node.name,
          email: edge.node.email,
          phone: edge.node.phone,
          role: edge.node.role
        });
      }
      return {
        id: edge.node.id,
        name: edge.node.name,
        email: edge.node.email,
        phone: edge.node.phone || "",
        role: edge.node.role,
        status: "active",
        joinDate: edge.node.createdAt ? edge.node.createdAt.split("T")[0] : "",
        createdAt: edge.node.createdAt,
      };
    }) || [];

  const camps =
    yurtsData?.yurts?.edges?.map((edge: any) => ({
      id: edge.node.id,
      name: edge.node.name,
      owner: edge.node.owner?.name || "Тодорхойгүй",
      ownerEmail: edge.node.owner?.email || "",
      ownerPhone: edge.node.owner?.phone || "",
      ownerId: edge.node.owner?.id || "",
      location: edge.node.location,
      price: edge.node.pricePerNight,
      capacity: edge.node.capacity,
      images: edge.node.images,
      description: edge.node.description,
      amenities: edge.node.amenities,
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
      customer: edge.node.user?.name || "Тодорхойгүй",
      customerEmail: edge.node.user?.email || "",
      customerPhone: edge.node.user?.phone || "",
      type: "product",
      item: edge.node.orderitem?.[0]?.product?.name || "Олон бүтээгдэхүүн",
      amount: edge.node.totalPrice,
      status: edge.node.status,
      shippingAddress: edge.node.shippingAddress || "",
      date: edge.node.createdAt ? edge.node.createdAt.split("T")[0] : "",
      createdAt: edge.node.createdAt,
    })) || [];

  const bookings =
    bookingsData?.bookings?.edges?.map((edge: any) => {
      // Debug log for first booking
      if (edge.node && bookingsData.bookings.edges[0]?.node.id === edge.node.id) {
        console.warn('🔍 First booking data:', {
          customer: edge.node.user?.name,
          customerPhone: edge.node.user?.phone,
          totalPrice: edge.node.totalPrice,
          ownerName: edge.node.yurt?.owner?.name,
          ownerPhone: edge.node.yurt?.owner?.phone
        });
      }
      return {
        id: edge.node.id,
        customer: edge.node.user?.name || "Тодорхойгүй",
        customerEmail: edge.node.user?.email || "",
        customerPhone: edge.node.user?.phone || "",
        userId: edge.node.user?.id || "",
        type: "camp",
        item: edge.node.yurt?.name || "Тодорхойгүй бааз",
        yurtId: edge.node.yurt?.id,
        yurtName: edge.node.yurt?.name || "Тодорхойгүй бааз",
        yurtLocation: edge.node.yurt?.location || "",
        yurtOwnerName: edge.node.yurt?.owner?.name || "",
        yurtOwnerEmail: edge.node.yurt?.owner?.email || "",
        yurtOwnerPhone: edge.node.yurt?.owner?.phone || "",
        amount: edge.node.totalPrice,
        status: edge.node.status,
        startDate: edge.node.startDate,
        endDate: edge.node.endDate,
        date: edge.node.createdAt ? edge.node.createdAt.split("T")[0] : "",
        createdAt: edge.node.createdAt,
      };
    }) || [];

  // Now calculate stats after data is available using utility function
  const todayusers = getTodayCount(users);
  const todayCamps = getTodayCount(camps);
  const todayProducts = getTodayCount(products);
  const todayBookings = getTodayCount(bookings);
  const todayOrders = getTodayCount(orders);

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
        mutation = deleteuser;
        refetchFunction = refetchusers;
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

  const handleAdduser = async () => {
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

      await createuser({ variables: { input } });
      await refetchusers();
      await refetchStats();
      toast({
        title: "Амжилттай",
        description: "Хэрэглэгч амжилттай үүсгэгдлээ",
      });
      setShowAdduser(false);
    } catch (error: any) {
      toast({
        title: "Алдаа",
        description: error.message || "Хэрэглэгч үүсгэхэд алдаа гарлаа",
        variant: "destructive" as any,
      });
    }
  };

  const handleEdituser = async (formData: any) => {
    try {
      await updateuser({ variables: { id: editingItem.id, input: formData } });
      await refetchusers();
      toast({
        title: "Амжилттай",
        description: "Хэрэглэгч амжилттай шинэчлэгдлээ",
      });
      setShowEdituser(false);
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
      // Validate
      if (!campForm.name || !campForm.description || !campForm.province || !campForm.pricePerNight || !campForm.capacity) {
        toast({
          title: "Алдаа",
          description: "Бүх талбарыг бөглөнө үү",
          variant: "destructive" as any,
        });
        return;
      }

      // Build location string
      const location = campForm.district
        ? `${campForm.province}, ${campForm.district}`
        : campForm.province;

      // Optimize images - limit to 3
      const optimizedImages = uploadedImages.slice(0, 3);

      const input = {
        name: campForm.name,
        description: campForm.description,
        location: location,
        pricePerNight: parseFloat(campForm.pricePerNight),
        capacity: parseInt(campForm.capacity),
        amenities: JSON.stringify({
          items: campForm.amenities,
          activities: campForm.activities,
          accommodationType: campForm.accommodationType,
          facilities: campForm.facilities,
          policies: {
            checkIn: campForm.checkIn,
            checkOut: campForm.checkOut,
            children: campForm.childrenPolicy,
            pets: campForm.petsPolicy,
            smoking: campForm.smokingPolicy,
            cancellation: campForm.cancellationPolicy,
          },
        }),
        images: JSON.stringify(optimizedImages),
        ownerId: campForm.ownerId || undefined,
      };

      await createYurt({ variables: { input } });
      await refetchYurts();
      await refetchStats();

      toast({
        title: "Амжилттай",
        description: "Бааз амжилттай үүсгэгдлээ",
      });

      // Reset form
      setShowAddCamp(false);
      setCampForm({
        name: "",
        description: "",
        province: "",
        district: "",
        location: "",
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
        ownerId: "",
      });
      setUploadedImages([]);
    } catch (error: any) {
      toast({
        title: "Алдаа",
        description: error.message || "Бааз үүсгэхэд алдаа гарлаа",
        variant: "destructive" as any,
      });
    }
  };

  const handleUpdateCamp = async () => {
    try {
      if (!editingItem) return;

      // Validate
      if (!campForm.name || !campForm.description || !campForm.province || !campForm.pricePerNight || !campForm.capacity) {
        toast({
          title: "Алдаа",
          description: "Бүх талбарыг бөглөнө үү",
          variant: "destructive" as any,
        });
        return;
      }

      // Build location string
      const location = campForm.district
        ? `${campForm.province}, ${campForm.district}`
        : campForm.province;

      // Optimize images - limit to 3
      const optimizedImages = uploadedImages.slice(0, 3);

      const input = {
        name: campForm.name,
        description: campForm.description,
        location: location,
        pricePerNight: parseFloat(campForm.pricePerNight),
        capacity: parseInt(campForm.capacity),
        amenities: JSON.stringify({
          items: campForm.amenities,
          activities: campForm.activities,
          accommodationType: campForm.accommodationType,
          facilities: campForm.facilities,
          policies: {
            checkIn: campForm.checkIn,
            checkOut: campForm.checkOut,
            children: campForm.childrenPolicy,
            pets: campForm.petsPolicy,
            smoking: campForm.smokingPolicy,
            cancellation: campForm.cancellationPolicy,
          },
        }),
        images: JSON.stringify(optimizedImages),
        ownerId: campForm.ownerId || undefined,
      };

      await updateYurt({ variables: { id: editingItem.id, input } });
      await refetchYurts();
      await refetchStats();

      toast({
        title: "Амжилттай",
        description: "Бааз амжилттай шинэчигдлээ",
      });

      // Reset
      setShowEditYurt(false);
      setEditingItem(null);
      setCampForm({
        name: "",
        description: "",
        province: "",
        district: "",
        location: "",
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
        ownerId: "",
      });
      setUploadedImages([]);
    } catch (error: any) {
      toast({
        title: "Алдаа",
        description: error.message || "Бааз шинэчлэхэд алдаа гарлаа",
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

  const handleUpdateBookingStatus = async (id: string, status: string) => {
    try {
      await updateBooking({
        variables: {
          id,
          input: { status }
        }
      });
      await refetchBookings();
      await refetchStats();
      toast({
        title: "Амжилттай",
        description: `Захиалгын төлөв ${translateStatus(status)} болж шинэчлэгдлээ`,
      });
    } catch (error: any) {
      toast({
        title: "Алдаа",
        description: error.message || "Захиалгын төлөв өөрчлөхөд алдаа гарлаа",
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

    // Parse amenities JSON
    let parsedAmenities: any = { items: [], activities: [], accommodationType: "", facilities: [], policies: {} };
    try {
      if (yurt.amenities) {
        parsedAmenities = typeof yurt.amenities === 'string' ? JSON.parse(yurt.amenities) : yurt.amenities;
      }
    } catch (e) {
      console.error('Failed to parse amenities:', e);
    }

    // Extract province and district from location
    const locationParts = (yurt.location || "").split(",").map((s: string) => s.trim());
    const province = locationParts[0] || "";
    const district = locationParts[1] || "";

    // Populate campForm with yurt data
    setCampForm({
      name: yurt.name || "",
      description: yurt.description || "",
      province: province,
      district: district,
      location: yurt.location || "",
      pricePerNight: yurt.price?.toString() || "",
      capacity: yurt.capacity?.toString() || "",
      amenities: Array.isArray(parsedAmenities.items) ? parsedAmenities.items : [],
      activities: Array.isArray(parsedAmenities.activities) ? parsedAmenities.activities : [],
      accommodationType: parsedAmenities.accommodationType || "",
      facilities: Array.isArray(parsedAmenities.facilities) ? parsedAmenities.facilities : [],
      checkIn: parsedAmenities.policies?.checkIn || "14:00",
      checkOut: parsedAmenities.policies?.checkOut || "11:00",
      childrenPolicy: parsedAmenities.policies?.children || "all_ages",
      petsPolicy: parsedAmenities.policies?.pets || "not_allowed",
      smokingPolicy: parsedAmenities.policies?.smoking || "no_smoking",
      cancellationPolicy: parsedAmenities.policies?.cancellation || "free_48h",
      ownerId: yurt.ownerId || "",
    });

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
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-8">
        <div className="flex justify-end mb-3 sm:mb-4">
          <Button
            variant="outline"
            onClick={logout}
            className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-2"
          >
            <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Гарах
          </Button>
        </div>
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 font-display">
            {t("admin.title", "Админ самбар")}
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm md:text-base font-medium mt-1">
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
          <div className="overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
            <TabsList className="inline-flex w-auto sm:w-full sm:grid sm:grid-cols-6 p-1 bg-gray-100/80 rounded-xl gap-1">
              <TabsTrigger
                value="overview"
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-[10px] xs:text-xs sm:text-sm font-bold min-w-[80px] sm:min-w-0 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-700 transition-all"
              >
                <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Тойм</span>
              </TabsTrigger>
              <TabsTrigger
                value="users"
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-[10px] xs:text-xs sm:text-sm font-bold min-w-[80px] sm:min-w-0 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-700 transition-all"
              >
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Хэрэглэгчид</span>
              </TabsTrigger>
              <TabsTrigger
                value="camps"
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-[10px] xs:text-xs sm:text-sm font-bold min-w-[80px] sm:min-w-0 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-700 transition-all"
              >
                <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Баазууд</span>
              </TabsTrigger>
              <TabsTrigger
                value="products"
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-[10px] xs:text-xs sm:text-sm font-bold min-w-[80px] sm:min-w-0 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-700 transition-all"
              >
                <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Бараа</span>
              </TabsTrigger>
              <TabsTrigger
                value="orders"
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-[10px] xs:text-xs sm:text-sm font-bold min-w-[80px] sm:min-w-0 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-700 transition-all"
              >
                <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Захиалга</span>
              </TabsTrigger>
              <TabsTrigger
                value="content"
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-[10px] xs:text-xs sm:text-sm font-bold min-w-[80px] sm:min-w-0 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-700 transition-all"
              >
                <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Агуулга</span>
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
                    {stats.totalusers}
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
                            {formatCurrency(order.amount)}
                          </p>
                          <Badge
                            variant={
                              order.status === "completed"
                                ? "default"
                                : "secondary"
                            }
                            className={`text-xs font-medium ${getStatusBadgeColor(order.status)}`}
                          >
                            {translateStatus(order.status)}
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
                        +{todayusers} өнөөдөр
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

          {/* users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl sm:text-2xl font-bold">
                Бүртгэгдсэн хэрэглэгчид
              </h2>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto font-semibold"
                onClick={() => setShowAdduser(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Хэрэглэгч нэмэх
              </Button>
            </div>

            {showAdduser && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="font-bold">Шинэ хэрэглэгч нэмэх</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAdduser(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form id="add-user-form">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Нэр
                        </label>
                        <Input
                          name="name"
                          placeholder="Нэрээ оруулна уу"
                          className="font-medium"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Имэйл
                        </label>
                        <Input
                          name="email"
                          type="email"
                          placeholder="Имэйл хаягаа оруулна уу"
                          className="font-medium"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Утасны дугаар
                        </label>
                        <Input
                          name="phone"
                          placeholder="Утасны дугаараа оруулна уу"
                          className="font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Эрх
                        </label>
                        <Select name="role" defaultValue="CUSTOMER">
                          <SelectTrigger>
                            <SelectValue placeholder="Эрх сонгох" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CUSTOMER">Хэрэглэгч</SelectItem>
                            <SelectItem value="HERDER">Малчин</SelectItem>
                            <SelectItem value="ADMIN">Админ</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Нууц үг
                        </label>
                        <Input
                          name="password"
                          type="password"
                          placeholder="Нууц үгээ оруулна уу"
                          className="font-medium"
                          required
                        />
                      </div>
                    </div>
                  </form>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700 font-semibold"
                      onClick={handleAdduser}
                    >
                      Хэрэглэгч нэмэх
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowAdduser(false)}
                      className="font-medium"
                    >
                      Цуцлах
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {showEdituser && editingItem && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="font-bold">Хэрэглэгч засах</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowEdituser(false);
                      setEditingItem(null);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form id="edit-user-form">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Нэр
                        </label>
                        <Input
                          name="name"
                          placeholder="Нэрээ оруулна уу"
                          className="font-medium"
                          defaultValue={editingItem.name}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Имэйл
                        </label>
                        <Input
                          name="email"
                          type="email"
                          placeholder="Имэйл хаягаа оруулна уу"
                          className="font-medium"
                          defaultValue={editingItem.email}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Утасны дугаар
                        </label>
                        <Input
                          name="phone"
                          placeholder="Утасны дугаараа оруулна уу"
                          className="font-medium"
                          defaultValue={editingItem.phone || ""}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Эрх
                        </label>
                        <Select name="role" defaultValue={editingItem.role}>
                          <SelectTrigger>
                            <SelectValue placeholder="Эрх сонгох" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CUSTOMER">Хэрэглэгч</SelectItem>
                            <SelectItem value="HERDER">Малчин</SelectItem>
                            <SelectItem value="ADMIN">Админ</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </form>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700 font-semibold"
                      onClick={async () => {
                        try {
                          const form = document.querySelector("#edit-user-form") as HTMLFormElement;
                          if (!form) return;

                          const formData = new FormData(form);
                          await handleEdituser({
                            name: formData.get("name") as string,
                            email: formData.get("email") as string,
                            phone: formData.get("phone") as string,
                            role: formData.get("role") as string,
                          });
                        } catch (error: any) {
                          toast({
                            title: "Алдаа",
                            description: error.message,
                            variant: "destructive" as any,
                          });
                        }
                      }}
                    >
                      Хадгалах
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowEdituser(false);
                        setEditingItem(null);
                      }}
                      className="font-medium"
                    >
                      Цуцлах
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
                          Нэр
                        </TableHead>
                        <TableHead className="min-w-[180px] font-semibold">
                          Холбоо барих
                        </TableHead>
                        <TableHead className="font-semibold">Эрх</TableHead>
                        <TableHead className="font-semibold">Төлөв</TableHead>
                        <TableHead className="hidden sm:table-cell font-semibold">
                          Бүртгүүлсэн
                        </TableHead>
                        <TableHead className="font-semibold">Үйлдэл</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user: any) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-semibold">
                            {user.name}
                          </TableCell>
                          <TableCell>
                            <div className="min-w-[170px]">
                              <p className="text-sm font-medium truncate">{user.email}</p>
                              {user.phone && (
                                <p className="text-xs text-gray-500">{user.phone}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={user.role === "ADMIN" ? "bg-red-100 text-red-800" : user.role === "HERDER" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}>
                              {translateRole(user.role)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800 font-medium">
                              Идэвхтэй
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell font-medium text-sm">
                            {formatDate(user.createdAt)}
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
                                      Хэрэглэгчийн дэлгэрэнгүй
                                    </DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <label className="text-sm font-semibold text-gray-700">
                                        ID
                                      </label>
                                      <p className="text-sm text-gray-900 font-mono">
                                        {user.id}
                                      </p>
                                    </div>
                                    <div className="border-t pt-3">
                                      <label className="text-sm font-semibold text-gray-700">
                                        Нэр
                                      </label>
                                      <p className="text-sm text-gray-900 mt-1 font-medium">
                                        {user.name}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-semibold text-gray-700">
                                        Имэйл
                                      </label>
                                      <p className="text-sm text-gray-900 mt-1 font-medium">
                                        {user.email}
                                      </p>
                                    </div>
                                    {user.phone && (
                                      <div>
                                        <label className="text-sm font-semibold text-gray-700">
                                          Утас
                                        </label>
                                        <p className="text-sm text-gray-900 mt-1 font-medium">
                                          {user.phone}
                                        </p>
                                      </div>
                                    )}
                                    <div>
                                      <label className="text-sm font-semibold text-gray-700">
                                        Эрх
                                      </label>
                                      <div className="mt-1">
                                        <Badge className={user.role === "ADMIN" ? "bg-red-100 text-red-800" : user.role === "HERDER" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}>
                                          {translateRole(user.role)}
                                        </Badge>
                                      </div>
                                    </div>
                                    <div>
                                      <label className="text-sm font-semibold text-gray-700">
                                        Бүртгүүлсэн огноо
                                      </label>
                                      <p className="text-sm text-gray-900 mt-1 font-medium">
                                        {formatDateTime(user.createdAt)}
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
                                  setShowEdituser(true);
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
                      onClick={handleAddProduct}
                    >
                      Бүтээгдэхүүн хадгалах
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
                  <CardTitle className="font-bold">Гэр бааз засах</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowEditYurt(false);
                      setEditingItem(null);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6 p-4 sm:p-6">
                  <div className="space-y-6">
                    {/* Basic Info Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Нэр
                        </label>
                        <Input
                          placeholder="Гэр баазын нэр"
                          className="font-medium"
                          value={campForm.name}
                          onChange={(e) =>
                            setCampForm({ ...campForm, name: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Аймаг
                        </label>
                        <Select
                          value={campForm.province}
                          onValueChange={(value) => {
                            setCampForm({
                              ...campForm,
                              province: value,
                              district: "",
                              location: value
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
                          value={campForm.district}
                          onValueChange={(value) => {
                            const location = `${campForm.province}, ${value}`;
                            setCampForm({
                              ...campForm,
                              district: value,
                              location: location
                            });
                          }}
                          disabled={!campForm.province}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={campForm.province ? "Сум/Дүүрэг сонгох" : "Эхлээд аймаг сонгоно уу"} />
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
                          Үнэ (₮ / шөнө)
                        </label>
                        <Input
                          type="number"
                          placeholder="0"
                          className="font-medium"
                          value={campForm.pricePerNight}
                          onChange={(e) =>
                            setCampForm({
                              ...campForm,
                              pricePerNight: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Багтаамж
                        </label>
                        <Input
                          type="number"
                          placeholder="0"
                          className="font-medium"
                          value={campForm.capacity}
                          onChange={(e) =>
                            setCampForm({ ...campForm, capacity: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Эзэмшигч (Хөтөч/Малчин)
                        </label>
                        <Select
                          value={campForm.ownerId}
                          onValueChange={(value) =>
                            setCampForm({ ...campForm, ownerId: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Эзэмшигч сонгох" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px]">
                            {users
                              .filter((u: any) => u.role === "HERDER" || u.role === "ADMIN")
                              .map((u: any) => (
                                <SelectItem key={u.id} value={u.id}>
                                  {u.name} ({u.email})
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Тайлбар
                      </label>
                      <Textarea
                        placeholder="Гэр баазын тухай дэлгэрэнгүй..."
                        className="font-medium"
                        value={campForm.description}
                        onChange={(e) =>
                          setCampForm({
                            ...campForm,
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
                              checked={campForm.amenities.includes(amenity.value)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setCampForm({
                                    ...campForm,
                                    amenities: [...campForm.amenities, amenity.value],
                                  });
                                } else {
                                  setCampForm({
                                    ...campForm,
                                    amenities: campForm.amenities.filter(
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
                              checked={campForm.activities.includes(activity.value)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setCampForm({
                                    ...campForm,
                                    activities: [...campForm.activities, activity.value],
                                  });
                                } else {
                                  setCampForm({
                                    ...campForm,
                                    activities: campForm.activities.filter(
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
                        value={campForm.accommodationType}
                        onValueChange={(value) =>
                          setCampForm({ ...campForm, accommodationType: value })
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
                              checked={campForm.facilities.includes(facility.value)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setCampForm({
                                    ...campForm,
                                    facilities: [...campForm.facilities, facility.value],
                                  });
                                } else {
                                  setCampForm({
                                    ...campForm,
                                    facilities: campForm.facilities.filter(
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
                            value={campForm.checkIn}
                            onValueChange={(value) =>
                              setCampForm({ ...campForm, checkIn: value })
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
                            value={campForm.checkOut}
                            onValueChange={(value) =>
                              setCampForm({ ...campForm, checkOut: value })
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
                            value={campForm.childrenPolicy}
                            onValueChange={(value) =>
                              setCampForm({ ...campForm, childrenPolicy: value })
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
                            value={campForm.petsPolicy}
                            onValueChange={(value) =>
                              setCampForm({ ...campForm, petsPolicy: value })
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
                            value={campForm.smokingPolicy}
                            onValueChange={(value) =>
                              setCampForm({ ...campForm, smokingPolicy: value })
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
                            value={campForm.cancellationPolicy}
                            onValueChange={(value) =>
                              setCampForm({ ...campForm, cancellationPolicy: value })
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
                            aria-label="Зураг файл сонгох"
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

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
                      <Button
                        className="bg-emerald-600 hover:bg-emerald-700 font-semibold"
                        onClick={handleUpdateCamp}
                      >
                        Шинэчлэх
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowEditYurt(false);
                          setEditingItem(null);
                        }}
                        className="font-medium"
                      >
                        Цуцлах
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {showAddCamp && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="font-bold">Гэр бааз нэмэх</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddCamp(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6 p-4 sm:p-6">
                  <div className="space-y-6">
                    {/* Basic Info Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Нэр
                        </label>
                        <Input
                          placeholder="Гэр баазын нэр"
                          className="font-medium"
                          value={campForm.name}
                          onChange={(e) =>
                            setCampForm({ ...campForm, name: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Аймаг
                        </label>
                        <Select
                          value={campForm.province}
                          onValueChange={(value) => {
                            setCampForm({
                              ...campForm,
                              province: value,
                              district: "",
                              location: value
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
                          value={campForm.district}
                          onValueChange={(value) => {
                            const location = `${campForm.province}, ${value}`;
                            setCampForm({
                              ...campForm,
                              district: value,
                              location: location
                            });
                          }}
                          disabled={!campForm.province}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={campForm.province ? "Сум/Дүүрэг сонгох" : "Эхлээд аймаг сонгоно уу"} />
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
                          Үнэ (₮ / шөнө)
                        </label>
                        <Input
                          type="number"
                          placeholder="0"
                          className="font-medium"
                          value={campForm.pricePerNight}
                          onChange={(e) =>
                            setCampForm({
                              ...campForm,
                              pricePerNight: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Багтаамж
                        </label>
                        <Input
                          type="number"
                          placeholder="0"
                          className="font-medium"
                          value={campForm.capacity}
                          onChange={(e) =>
                            setCampForm({ ...campForm, capacity: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Эзэмшигч (Хөтөч/Малчин)
                        </label>
                        <Select
                          value={campForm.ownerId}
                          onValueChange={(value) =>
                            setCampForm({ ...campForm, ownerId: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Эзэмшигч сонгох" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px]">
                            {users
                              .filter((u: any) => u.role === "HERDER" || u.role === "ADMIN")
                              .map((u: any) => (
                                <SelectItem key={u.id} value={u.id}>
                                  {u.name} ({u.email})
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Тайлбар
                      </label>
                      <Textarea
                        placeholder="Гэр баазын тухай дэлгэрэнгүй..."
                        className="font-medium"
                        value={campForm.description}
                        onChange={(e) =>
                          setCampForm({
                            ...campForm,
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
                              checked={campForm.amenities.includes(amenity.value)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setCampForm({
                                    ...campForm,
                                    amenities: [...campForm.amenities, amenity.value],
                                  });
                                } else {
                                  setCampForm({
                                    ...campForm,
                                    amenities: campForm.amenities.filter(
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
                              checked={campForm.activities.includes(activity.value)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setCampForm({
                                    ...campForm,
                                    activities: [...campForm.activities, activity.value],
                                  });
                                } else {
                                  setCampForm({
                                    ...campForm,
                                    activities: campForm.activities.filter(
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
                        value={campForm.accommodationType}
                        onValueChange={(value) =>
                          setCampForm({ ...campForm, accommodationType: value })
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
                              checked={campForm.facilities.includes(facility.value)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setCampForm({
                                    ...campForm,
                                    facilities: [...campForm.facilities, facility.value],
                                  });
                                } else {
                                  setCampForm({
                                    ...campForm,
                                    facilities: campForm.facilities.filter(
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
                            value={campForm.checkIn}
                            onValueChange={(value) =>
                              setCampForm({ ...campForm, checkIn: value })
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
                            value={campForm.checkOut}
                            onValueChange={(value) =>
                              setCampForm({ ...campForm, checkOut: value })
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
                            value={campForm.childrenPolicy}
                            onValueChange={(value) =>
                              setCampForm({ ...campForm, childrenPolicy: value })
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
                            value={campForm.petsPolicy}
                            onValueChange={(value) =>
                              setCampForm({ ...campForm, petsPolicy: value })
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
                            value={campForm.smokingPolicy}
                            onValueChange={(value) =>
                              setCampForm({ ...campForm, smokingPolicy: value })
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
                            value={campForm.cancellationPolicy}
                            onValueChange={(value) =>
                              setCampForm({ ...campForm, cancellationPolicy: value })
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
                            aria-label="Зураг файл сонгох"
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

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
                      <Button
                        className="bg-emerald-600 hover:bg-emerald-700 font-semibold"
                        onClick={handleAddCamp}
                      >
                        Хадгалах
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowAddCamp(false)}
                        className="font-medium"
                      >
                        Цуцлах
                      </Button>
                    </div>
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
                          Баазын нэр
                        </TableHead>
                        <TableHead className="min-w-[150px] font-semibold">Эзэмшигч</TableHead>
                        <TableHead className="font-semibold">
                          Байршил
                        </TableHead>
                        <TableHead className="font-semibold">
                          Үнэ/Шөнө
                        </TableHead>
                        <TableHead className="font-semibold">Төлөв</TableHead>
                        <TableHead className="font-semibold">Үйлдэл</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {camps.map((camp: any) => (
                        <TableRow key={camp.id}>
                          <TableCell className="font-semibold">
                            {camp.name}
                          </TableCell>
                          <TableCell>
                            <div className="min-w-[140px]">
                              <p className="font-semibold text-sm">{camp.owner}</p>
                              {camp.ownerEmail && (
                                <p className="text-xs text-gray-500 truncate">
                                  {camp.ownerEmail}
                                </p>
                              )}
                              {camp.ownerPhone && (
                                <p className="text-xs text-gray-500">
                                  {camp.ownerPhone}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {camp.location}
                          </TableCell>
                          <TableCell className="font-bold">
                            {formatCurrency(camp.price)}
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800 font-medium">
                              Идэвхтэй
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
                                <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle className="font-bold">
                                      Баазын дэлгэрэнгүй
                                    </DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <label className="text-sm font-semibold text-gray-700">
                                        Баазын нэр
                                      </label>
                                      <p className="text-sm text-gray-900 font-medium">
                                        {camp.name}
                                      </p>
                                    </div>
                                    <div className="border-t pt-3">
                                      <label className="text-sm font-semibold text-gray-700">
                                        Эзэмшигчийн мэдээлэл
                                      </label>
                                      <p className="text-sm text-gray-900 mt-1">
                                        <span className="font-medium">Нэр:</span> {camp.owner}
                                      </p>
                                      {camp.ownerEmail && (
                                        <p className="text-sm text-gray-900">
                                          <span className="font-medium">Имэйл:</span> {camp.ownerEmail}
                                        </p>
                                      )}
                                      {camp.ownerPhone && (
                                        <p className="text-sm text-gray-900">
                                          <span className="font-medium">Утас:</span> {camp.ownerPhone}
                                        </p>
                                      )}
                                    </div>
                                    <div className="border-t pt-3">
                                      <label className="text-sm font-semibold text-gray-700">
                                        Байршил
                                      </label>
                                      <p className="text-sm text-gray-900 mt-1">
                                        {camp.location}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-semibold text-gray-700">
                                        Багтаамж
                                      </label>
                                      <p className="text-sm text-gray-900 mt-1">
                                        {camp.capacity} хүн
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-semibold text-gray-700">
                                        Нэг шөнийн үнэ
                                      </label>
                                      <p className="text-lg font-bold text-emerald-600 mt-1">
                                        {formatCurrency(camp.price)}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-semibold text-gray-700">
                                        Бүртгүүлсэн огноо
                                      </label>
                                      <p className="text-sm text-gray-900 mt-1">
                                        {formatDateTime(camp.createdAt)}
                                      </p>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditYurt(camp)}
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
                Захиалгын удирдлага
              </h2>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto bg-transparent font-medium"
                  onClick={async () => {
                    const allData = [...orders, ...bookings];
                    const exportData = allData.map(item => ({
                      'ID': item.id,
                      'Захиалагч': item.customer,
                      'Имэйл': item.customerEmail,
                      'Утас': item.customerPhone,
                      'Төрөл': item.type === 'product' ? 'Бүтээгдэхүүн' : 'Бааз',
                      'Зүйл': item.item,
                      'Үнэ': item.amount,
                      'Төлөв': translateStatus(item.status),
                      'Огноо': formatDateTime(item.createdAt)
                    }));
                    const success = await exportToExcel(exportData, 'zahialgyn_jagsaalt');
                    if (success) {
                      toast({
                        title: "✅ Амжилттай",
                        description: "Захиалгын жагсаалт татагдлаа"
                      });
                    } else {
                      toast({
                        title: "❌ Алдаа",
                        description: "Excel файл үүсгэхэд алдаа гарлаа",
                        variant: "destructive" as any
                      });
                    }
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Excel татах
                </Button>
              </div>
            </div>

            {/* Product Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold">
                  Бүтээгдэхүүний захиалга
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-semibold">
                          ID
                        </TableHead>
                        <TableHead className="min-w-[150px] font-semibold">
                          Захиалагч
                        </TableHead>
                        <TableHead className="min-w-[150px] font-semibold">
                          Бүтээгдэхүүн
                        </TableHead>
                        <TableHead className="font-semibold">Үнэ</TableHead>
                        <TableHead className="font-semibold">Төлөв</TableHead>
                        <TableHead className="hidden sm:table-cell font-semibold">
                          Огноо
                        </TableHead>
                        <TableHead className="font-semibold">Үйлдэл</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order: any) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-xs">
                            {order.id.substring(0, 8)}...
                          </TableCell>
                          <TableCell>
                            <div className="min-w-[140px]">
                              <p className="font-semibold text-sm">{order.customer}</p>
                              {order.customerEmail && (
                                <p className="text-xs text-gray-500 truncate">
                                  {order.customerEmail}
                                </p>
                              )}
                              {order.customerPhone && (
                                <p className="text-xs text-gray-500">
                                  {order.customerPhone}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {order.item}
                          </TableCell>
                          <TableCell className="font-bold">
                            {formatCurrency(order.amount)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`${getStatusBadgeColor(
                                order.status
                              )} px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 border-none shadow-sm w-fit`}
                            >
                              {order.status === "PENDING" && <Clock className="w-3 h-3" />}
                              {order.status === "PAID" && <CheckCircle2 className="w-3 h-3" />}
                              {order.status === "CONFIRMED" && <Check className="w-3 h-3" />}
                              {order.status === "SHIPPED" && <Package className="w-3 h-3" />}
                              {order.status === "DELIVERED" && <Truck className="w-3 h-3" />}
                              {order.status === "CANCELLED" && <X className="w-3 h-3" />}
                              <span className="text-[11px] uppercase tracking-wider">{translateStatus(order.status)}</span>
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell font-medium text-sm">
                            {formatDate(order.createdAt)}
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
                                      Захиалгын дэлгэрэнгүй
                                    </DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <label className="text-sm font-semibold text-gray-700">
                                        Захиалгын ID
                                      </label>
                                      <p className="text-sm text-gray-900 font-mono">
                                        {order.id}
                                      </p>
                                    </div>
                                    <div className="border-t pt-3">
                                      <label className="text-sm font-semibold text-gray-700">
                                        Захиалагчийн мэдээлэл
                                      </label>
                                      <p className="text-sm text-gray-900 mt-1">
                                        <span className="font-medium">Нэр:</span> {order.customer}
                                      </p>
                                      {order.customerEmail && (
                                        <p className="text-sm text-gray-900">
                                          <span className="font-medium">Имэйл:</span> {order.customerEmail}
                                        </p>
                                      )}
                                      {order.customerPhone && (
                                        <p className="text-sm text-gray-900">
                                          <span className="font-medium">Утас:</span> {order.customerPhone}
                                        </p>
                                      )}
                                      {order.shippingAddress && (
                                        <p className="text-sm text-gray-900">
                                          <span className="font-medium">Хаяг:</span> {order.shippingAddress}
                                        </p>
                                      )}
                                    </div>
                                    <div className="border-t pt-3">
                                      <label className="text-sm font-semibold text-gray-700">
                                        Бүтээгдэхүүн
                                      </label>
                                      <p className="text-sm text-gray-900 mt-1">
                                        {order.item}
                                      </p>
                                    </div>
                                    <div className="border-t pt-3">
                                      <label className="text-sm font-semibold text-gray-700">
                                        Үнэ
                                      </label>
                                      <p className="text-lg font-bold text-emerald-600 mt-1">
                                        {formatCurrency(order.amount)}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-semibold text-gray-700">
                                        Төлөв
                                      </label>
                                      <div className="mt-1">
                                        <Badge className={getStatusBadgeColor(order.status)}>
                                          {translateStatus(order.status)}
                                        </Badge>
                                      </div>
                                    </div>
                                    <div>
                                      <label className="text-sm font-semibold text-gray-700">
                                        Огноо
                                      </label>
                                      <p className="text-sm text-gray-900 mt-1">
                                        {formatDateTime(order.createdAt)}
                                      </p>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
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
                    Баазын захиалга - {yurtName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="font-semibold">
                            ID
                          </TableHead>
                          <TableHead className="min-w-[150px] font-semibold">
                            Захиалагч
                          </TableHead>
                          <TableHead className="min-w-[120px] font-semibold">
                            Огноо
                          </TableHead>
                          <TableHead className="font-semibold">
                            Үнэ
                          </TableHead>
                          <TableHead className="font-semibold">
                            Төлөв
                          </TableHead>
                          <TableHead className="font-semibold">
                            Үйлдэл
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bookingsByYurt[yurtName].map((booking: any) => (
                          <TableRow key={booking.id}>
                            <TableCell className="font-mono text-xs">
                              {booking.id.substring(0, 8)}...
                            </TableCell>
                            <TableCell>
                              <div className="min-w-[140px]">
                                <p className="font-semibold text-sm">{booking.customer}</p>
                                {booking.customerEmail && (
                                  <p className="text-xs text-gray-500 truncate">
                                    {booking.customerEmail}
                                  </p>
                                )}
                                {booking.customerPhone && (
                                  <p className="text-xs text-gray-500">
                                    {booking.customerPhone}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">
                              <div>
                                <p className="font-medium">{formatDate(booking.startDate)}</p>
                                <p className="text-gray-500">→ {formatDate(booking.endDate)}</p>
                                <p className="text-xs text-emerald-600 font-semibold">
                                  {calculateNights(booking.startDate, booking.endDate)} хоног
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-bold text-emerald-600">
                                  {formatCurrency(booking.amount)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {calculateNights(booking.startDate, booking.endDate)} × {formatCurrency(booking.amount / calculateNights(booking.startDate, booking.endDate))}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={`${getStatusBadgeColor(
                                  booking.status
                                )} px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 border-none shadow-sm w-fit`}
                              >
                                {booking.status === "PENDING" && <Clock className="w-3 h-3" />}
                                {booking.status === "CONFIRMED" && <Check className="w-3 h-3" />}
                                {booking.status === "COMPLETED" && <CheckCircle2 className="w-3 h-3" />}
                                {booking.status === "CANCELLED" && <X className="w-3 h-3" />}
                                <span className="text-[11px] uppercase tracking-wider">{translateStatus(booking.status)}</span>
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
                                  <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                                    <DialogHeader>
                                      <DialogTitle className="font-bold">
                                        Захиалгын дэлгэрэнгүй
                                      </DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <label className="text-sm font-semibold text-gray-700">
                                          Захиалгын ID
                                        </label>
                                        <p className="text-sm text-gray-900 font-mono">
                                          {booking.id}
                                        </p>
                                      </div>
                                      <div className="border-t pt-3">
                                        <label className="text-sm font-semibold text-gray-700">
                                          Захиалагчийн мэдээлэл
                                        </label>
                                        <p className="text-sm text-gray-900 mt-1">
                                          <span className="font-medium">Нэр:</span> {booking.customer}
                                        </p>
                                        {booking.customerEmail && (
                                          <p className="text-sm text-gray-900">
                                            <span className="font-medium">Имэйл:</span> {booking.customerEmail}
                                          </p>
                                        )}
                                        {booking.customerPhone && (
                                          <p className="text-sm text-gray-900">
                                            <span className="font-medium">Утас:</span> {booking.customerPhone}
                                          </p>
                                        )}
                                      </div>
                                      <div className="border-t pt-3">
                                        <label className="text-sm font-semibold text-gray-700">
                                          Баазын мэдээлэл
                                        </label>
                                        <p className="text-sm text-gray-900 mt-1">
                                          <span className="font-medium">Нэр:</span> {booking.yurtName}
                                        </p>
                                        {booking.yurtLocation && (
                                          <p className="text-sm text-gray-900">
                                            <span className="font-medium">Байршил:</span> {booking.yurtLocation}
                                          </p>
                                        )}
                                      </div>
                                      {booking.yurtOwnerName && (
                                        <div className="border-t pt-3">
                                          <label className="text-sm font-semibold text-gray-700">
                                            Эзэмшигчийн мэдээлэл
                                          </label>
                                          <p className="text-sm text-gray-900 mt-1">
                                            <span className="font-medium">Нэр:</span> {booking.yurtOwnerName}
                                          </p>
                                          {booking.yurtOwnerEmail && (
                                            <p className="text-sm text-gray-900">
                                              <span className="font-medium">Имэйл:</span> {booking.yurtOwnerEmail}
                                            </p>
                                          )}
                                          {booking.yurtOwnerPhone && (
                                            <p className="text-sm text-gray-900">
                                              <span className="font-medium">Утас:</span> {booking.yurtOwnerPhone}
                                            </p>
                                          )}
                                        </div>
                                      )}
                                      <div className="border-t pt-3">
                                        <label className="text-sm font-semibold text-gray-700">
                                          Хугацаа
                                        </label>
                                        <p className="text-sm text-gray-900 mt-1">
                                          <span className="font-medium">Эхлэх:</span> {formatDate(booking.startDate)}
                                        </p>
                                        <p className="text-sm text-gray-900">
                                          <span className="font-medium">Дуусах:</span> {formatDate(booking.endDate)}
                                        </p>
                                        <p className="text-sm font-semibold text-emerald-600 mt-1">
                                          📅 {calculateNights(booking.startDate, booking.endDate)} хоног
                                        </p>
                                      </div>
                                      <div className="border-t pt-3">
                                        <label className="text-sm font-semibold text-gray-700">
                                          Үнийн тооцоо
                                        </label>
                                        <p className="text-sm text-gray-700 mt-1">
                                          {calculateNights(booking.startDate, booking.endDate)} хоног × {formatCurrency(booking.amount / calculateNights(booking.startDate, booking.endDate) || 0)}
                                        </p>
                                        <p className="text-lg font-bold text-emerald-600 mt-1">
                                          = {formatCurrency(booking.amount)}
                                        </p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-semibold text-gray-700">
                                          Төлөв
                                        </label>
                                        <div className="mt-1">
                                          <Badge className={getStatusBadgeColor(booking.status)}>
                                            {translateStatus(booking.status)}
                                          </Badge>
                                        </div>
                                      </div>
                                      <div>
                                        <label className="text-sm font-semibold text-gray-700">
                                          Захиалга үүссэн огноо
                                        </label>
                                        <p className="text-sm text-gray-900 mt-1">
                                          {formatDateTime(booking.createdAt)}
                                        </p>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>

                                <Select
                                  value={booking.status}
                                  onValueChange={(value) => handleUpdateBookingStatus(booking.id, value)}
                                >
                                  <SelectTrigger className="h-8 w-[130px] text-xs font-semibold">
                                    <SelectValue placeholder="Төлөв" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="PENDING" className="text-xs font-medium">Хүлээгдэж буй</SelectItem>
                                    <SelectItem value="CONFIRMED" className="text-xs font-medium">Батлагдсан</SelectItem>
                                    <SelectItem value="CANCELLED" className="text-xs font-medium text-red-600">Цуцлагдсан</SelectItem>
                                    <SelectItem value="COMPLETED" className="text-xs font-medium text-blue-600">Дууссан</SelectItem>
                                  </SelectContent>
                                </Select>

                                {booking.status === "PENDING" && (
                                  <div className="flex gap-1 mt-1">
                                    <Button
                                      size="sm"
                                      className="h-7 px-2 text-[10px] bg-emerald-600 hover:bg-emerald-700 font-bold"
                                      onClick={() => handleUpdateBookingStatus(booking.id, "CONFIRMED")}
                                    >
                                      <Check className="w-3 h-3 mr-1" />
                                      Батлах
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      className="h-7 px-2 text-[10px] font-bold"
                                      onClick={() => handleUpdateBookingStatus(booking.id, "CANCELLED")}
                                    >
                                      <X className="w-3 h-3 mr-1" />
                                      Татгалзах
                                    </Button>
                                  </div>
                                )}
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
                      Агуулга хадгалах
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
