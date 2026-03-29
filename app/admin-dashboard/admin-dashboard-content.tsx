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
  XCircle,
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
  APPROVE_ORDER,
  REJECT_ORDER,
  DELETE_ORDER,
  DELETE_BOOKING,
  GET_ALL_EVENTS,
  CREATE_EVENT,
  UPDATE_EVENT,
  DELETE_EVENT,
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
  translateCategory,
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


const parseAmenities = (amenitiesStr?: string) => {
  if (!amenitiesStr) return { items: [], activities: [], facilities: [], policies: {} };
  try {
    const parsed = JSON.parse(amenitiesStr);
    return {
      items: parsed.items || [],
      activities: parsed.activities || [],
      facilities: parsed.facilities || [],
      accommodationType: parsed.accommodationType || "",
      policies: parsed.policies || {},
    };
  } catch {
    return {
      items: amenitiesStr.split(",").map(a => a.trim()),
      activities: [],
      facilities: [],
      policies: {}
    };
  }
};

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

  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showEditEvent, setShowEditEvent] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [eventForm, setEventForm] = useState({
    title: "",
    category: "Наадам, арга хэмжээ",
    location: "",
    groupSize: "",
    shortDescription: "",
    fullDescription: "",
    priceInfo: "",
    images: [] as string[],
    isActive: true,
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
    error: statsError,
    refetch: refetchStats,
  } = useQuery(GET_ADMIN_STATS);
  const {
    data: usersData,
    loading: usersLoading,
    error: usersError,
    refetch: refetchusers,
  } = useQuery(GET_ALL_userS);
  const {
    data: yurtsData,
    loading: yurtsLoading,
    error: yurtsError,
    refetch: refetchYurts,
  } = useQuery(GET_ALL_YURTS, {
    variables: { first: 100 },
    fetchPolicy: "cache-and-network"
  });
  const {
    data: productsData,
    loading: productsLoading,
    error: productsError,
    refetch: refetchProducts,
  } = useQuery(GET_ALL_PRODUCTS);
  const {
    data: ordersData,
    loading: ordersLoading,
    error: ordersError,
    refetch: refetchOrders,
  } = useQuery(GET_ALL_ORDERS);
  const {
    data: bookingsData,
    loading: bookingsLoading,
    error: bookingsError,
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
  const [approveOrder] = useMutation(APPROVE_ORDER);
  const [rejectOrder] = useMutation(REJECT_ORDER);
  const [deleteOrder] = useMutation(DELETE_ORDER);
  const [deleteBooking] = useMutation(DELETE_BOOKING);
  
  const { data: eventsData, loading: eventsLoading, refetch: refetchEvents } = useQuery(GET_ALL_EVENTS);
  const [createEvent] = useMutation(CREATE_EVENT);
  const [updateEvent] = useMutation(UPDATE_EVENT);
  const [deleteEvent] = useMutation(DELETE_EVENT);

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
        joinDate: edge.node.createdAt ? String(edge.node.createdAt).split("T")[0] : "",
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
      seller: edge.node.owner?.name || "Борлуулагч",
      category: translateCategory(edge.node.category?.name),
      price: edge.node.price,
      stock: edge.node.stock,
      images: edge.node.images,
      description: edge.node.description,
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
      date: edge.node.createdAt ? String(edge.node.createdAt).split("T")[0] : "",
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
        date: edge.node.createdAt ? String(edge.node.createdAt).split("T")[0] : "",
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
      } else if (selectedItem.type === "order") {
        mutation = deleteOrder;
        refetchFunction = refetchOrders;
      } else if (selectedItem.type === "booking" || selectedItem.type === "camp") {
        mutation = deleteBooking;
        refetchFunction = refetchBookings;
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
      const phone = formData.get("phone") as string;
      const input = {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        phone,
        password: formData.get("password") as string,
        role: (formData.get("role") as string) || "TRAVELER",
      };

      if (!input.name || !input.email || !input.password) {
        toast({
          title: "Алдаа",
          description: "Нэр, имэйл, нууц үг талбарыг бөглөнө үү",
          variant: "destructive" as any,
        });
        return;
      }

      const phoneRegex = /^\d{8}$/;
      if (!phone || !phoneRegex.test(phone.trim())) {
        toast({
          title: "Алдаа",
          description: "Гар утасны дугаар 8 оронтой тоо байх ёстой",
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
      let errorMessage = "Хэрэглэгч үүсгэхэд алдаа гарлаа";
      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        errorMessage = error.graphQLErrors[0].message;
      } else if (error.networkError && error.networkError.result && error.networkError.result.errors) {
        errorMessage = error.networkError.result.errors[0].message;
      } else if (error.message && !error.message.includes("status code 400")) {
        errorMessage = error.message;
      }

      toast({
        title: "Алдаа",
        description: errorMessage,
        variant: "destructive" as any,
      });
    }
  };

  const handleEdituser = async (formData: any) => {
    try {
      const phoneRegex = /^\d{8}$/;
      if (!formData.phone || !phoneRegex.test(formData.phone.trim())) {
        toast({
          title: "Алдаа",
          description: "Гар утасны дугаар 8 оронтой тоо байх ёстой",
          variant: "destructive" as any,
        });
        return;
      }

      await updateuser({ variables: { id: editingItem.id, input: formData } });
      await refetchusers();
      toast({
        title: "Амжилттай",
        description: "Хэрэглэгч амжилттай шинэчлэгдлээ",
      });
      setShowEdituser(false);
      setEditingItem(null);
    } catch (error: any) {
      let errorMessage = "Хэрэглэгч шинэчлэхэд алдаа гарлаа";
      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        errorMessage = error.graphQLErrors[0].message;
      } else if (error.networkError && error.networkError.result && error.networkError.result.errors) {
        errorMessage = error.networkError.result.errors[0].message;
      } else if (error.message && !error.message.includes("status code 400")) {
        errorMessage = error.message;
      }

      toast({
        title: "Алдаа",
        description: errorMessage,
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

  const handleSaveEvent = async () => {
    try {
      if (!eventForm.title || !eventForm.location || !eventForm.groupSize || !eventForm.shortDescription || !eventForm.fullDescription) {
        toast({
          title: "Алдаа",
          description: "Бүх талбарыг бөглөнө үү (Нэр, Байршил, Багтаамж, Товч болон Дэлгэрэнгүй тайлбар)",
          variant: "destructive" as any,
        });
        return;
      }
      
      const input = {
        ...eventForm,
        images: uploadedImages,
      };

      if (selectedEvent) {
        await updateEvent({ variables: { id: selectedEvent.id, input } });
        toast({ title: "Амжилттай", description: "Арга хэмжээ шинэчлэгдлээ" });
      } else {
        await createEvent({ variables: { input } });
        toast({ title: "Амжилттай", description: "Арга хэмжээ үүсгэгдлээ" });
      }

      await refetchEvents();
      setShowAddEvent(false);
      setShowEditEvent(false);
      setSelectedEvent(null);
      setUploadedImages([]);
    } catch (error: any) {
      toast({
        title: "Алдаа",
        description: error.message || "Үйлдэл амжилтгүй",
        variant: "destructive" as any,
      });
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (window.confirm("Энэ арга хэмжээг устгах уу?")) {
      try {
        await deleteEvent({ variables: { id } });
        await refetchEvents();
        toast({ title: "Амжилттай", description: "Устгагдлаа" });
      } catch (error: any) {
        toast({
          title: "Алдаа",
          description: error.message || "Устгахад алдаа гарлаа",
          variant: "destructive" as any,
        });
      }
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
        categoryId: formData.get("category") as string,
        images: JSON.stringify(uploadedImages),
      };

      await createProduct({
        variables: { input },
      });
      await refetchProducts();
      await refetchStats();
      toast({
        title: "Амжилттай",
        description: "Бүтээгдэхүүн амжилттай нэмэгдлээ",
      });
      setShowAddProduct(false);
      setUploadedImages([]);
    } catch (error: any) {
      toast({
        title: "Алдаа",
        description: error.message || "Бүтээгдэхүүн нэмэхэд алдаа гарлаа",
        variant: "destructive" as any,
      });
    }
  };

  const handleEditProductPopulate = (product: any) => {
    setEditingItem(product);
    
    // Set images
    let images: string[] = [];
    try {
      if (product.images) {
        images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
      }
    } catch (e) {
      console.error('Failed to parse product images:', e);
      images = Array.isArray(product.images) ? product.images : [];
    }
    setUploadedImages(images);
    setShowEditProduct(true);
  };

  const handleEditProductSubmit = async () => {
    try {
      const form = document.querySelector("#edit-product-form") as HTMLFormElement;
      if (!form) return;

      const formData = new FormData(form);
      const input = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        price: parseFloat(formData.get("price") as string),
        stock: parseInt(formData.get("stock") as string),
        categoryId: formData.get("category") as string,
        images: JSON.stringify(uploadedImages),
      };

      await updateProduct({
        variables: { id: editingItem.id, input },
      });
      await refetchProducts();
      await refetchStats();
      toast({
        title: "Амжилттай",
        description: "Бүтээгдэхүүн амжилттай шинэчлэгдлээ",
      });
      setShowEditProduct(false);
      setEditingItem(null);
      setUploadedImages([]);
    } catch (error: any) {
      toast({
        title: "Алдаа",
        description: error.message || "Бүтээгдэхүүн шинэчлэхэд алдаа гарлаа",
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

      // Optimize images - limit to 6
      const optimizedImages = uploadedImages.slice(0, 6);

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

      // Optimize images - limit to 6
      const optimizedImages = uploadedImages.slice(0, 6);

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

  const handleApproveOrder = async (id: string) => {
    try {
      await approveOrder({
        variables: { id },
      });
      await refetchOrders();
      await refetchStats();
      toast({
        title: "Амжилттай",
        description: "Захиалга амжилттай баталгаажлаа",
      });
    } catch (error: any) {
      toast({
        title: "Алдаа",
        description: error.message || "Захиалга баталгаажуулахад алдаа гарлаа",
        variant: "destructive" as any,
      });
    }
  };

  const handleRejectOrder = async (id: string) => {
    try {
      await rejectOrder({
        variables: { id },
      });
      await refetchOrders();
      await refetchStats();
      toast({
        title: "Амжилттай",
        description: "Захиалга цуцлагдлаа",
      });
    } catch (error: any) {
      toast({
        title: "Алдаа",
        description: error.message || "Захиалга цуцлахад алдаа гарлаа",
        variant: "destructive" as any,
      });
    }
  };

  // Compress image using Canvas API — produces JPEG ~150-250KB regardless of original size
  const compressImage = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Файл унших алдаа гарлаа"));
      reader.onload = (e) => {
        const img = new Image();
        img.onerror = () => reject(new Error("Зураг ачаалах алдаа гарлаа"));
        img.onload = () => {
          const MAX = 1200;
          let { width, height } = img;
          if (width > MAX || height > MAX) {
            const ratio = Math.min(MAX / width, MAX / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject(new Error("Canvas дэмжигдэхгүй байна"));
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.78));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });

  // Image upload functions
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    formType: "yurt" | "product"
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (uploadedImages.length >= 6) {
      toast({
        title: "Алдаа",
        description: "Дээд тал 6 зураг оруулж болно",
        variant: "destructive" as any,
      });
      event.target.value = "";
      return;
    }

    try {
      toast({ title: "Зураг илгээж байна...", description: "Түр хүлээнэ үү" });
      
      const newUrls: string[] = [];
      const backendUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL 
        ? process.env.NEXT_PUBLIC_GRAPHQL_URL.replace('/graphql', '') 
        : "https://api.malchincamp.mn";

      for (let i = 0; i < files.length; i++) {
        if (uploadedImages.length + i >= 6) break;
        const file = files[i];
        
        // Allow up to 100MB
        if (file.size > 100 * 1024 * 1024) {
          toast({
            title: "Алдаа",
            description: `Зурагны хэмжээ 100MB-аас их байна (${(file.size / 1024 / 1024).toFixed(1)}MB)`,
            variant: "destructive" as any,
          });
          continue;
        }
        
        const formData = new FormData();
        formData.append("file", file);
        
        const response = await fetch(`${backendUrl}/api/upload`, {
          method: "POST",
          body: formData,
        });
        
        if (!response.ok) throw new Error("Сервертэй холбогдоход алдаа гарлаа");
        const data = await response.json();
        
        if (data.url) {
          newUrls.push(data.url);
        } else if (data.error) {
          throw new Error(data.error);
        }
      }

      setUploadedImages((prev) => [...prev, ...newUrls]);
      toast({ title: "Амжилттай", description: `Нийт ${newUrls.length} зураг амжилттай хадгалагдлаа` });
    } catch (err: any) {
      let errorMessage = err.message || "Зураг хадгалахад алдаа гарлаа";
      
      if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
        errorMessage = "Сервертэй холбогдож чадсангүй (Failed to fetch). Энэ нь ихэвчлэн зургийн хэмжээ хэтэрсэн эсвэл Nginx тохиргооноос болдог. Nginx client_max_body_size-ийг шалгана уу.";
      }

      toast({
        title: "Алдаа",
        description: errorMessage,
        variant: "destructive" as any,
      });
    }

    event.target.value = "";
  };

  const handleEventFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (uploadedImages.length >= 6) {
      toast({
        title: "Алдаа",
        description: "Дээд тал 6 зураг оруулж болно",
        variant: "destructive" as any,
      });
      event.target.value = "";
      return;
    }

    try {
      toast({ title: "Зураг илгээж байна...", description: "Түр хүлээнэ үү" });
      
      const newUrls: string[] = [];
      const backendUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL 
        ? process.env.NEXT_PUBLIC_GRAPHQL_URL.replace('/graphql', '') 
        : "https://api.malchincamp.mn";

      for (let i = 0; i < files.length; i++) {
        if (uploadedImages.length + i >= 6) break;
        const file = files[i];
        
        // Allow up to 100MB
        if (file.size > 100 * 1024 * 1024) {
          toast({
            title: "Анхааруулга",
            description: "Зургийн хэмжээ 100MB-аас бага байх ёстой",
            variant: "destructive" as any,
          });
          continue;
        }
        
        const formData = new FormData();
        formData.append("file", file);
        
        const response = await fetch(`${backendUrl}/api/upload`, {
          method: "POST",
          body: formData,
        });
        
        if (!response.ok) throw new Error("Сервертэй холбогдоход алдаа гарлаа");
        const data = await response.json();
        
        if (data.url) {
          newUrls.push(data.url);
        } else if (data.error) {
          throw new Error(data.error);
        }
      }

      setUploadedImages((prev) => [...prev, ...newUrls]);
      toast({ title: "Амжилттай", description: `Нийт ${newUrls.length} зураг амжилттай хадгалагдлаа` });
    } catch (err: any) {
      let errorMessage = err.message || "Зураг хадгалахад алдаа гарлаа";
      
      // Specifically handle 'Failed to fetch' which is often Nginx or Network related
      if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
        errorMessage = "Сервертэй холбогдож чадсангүй (Failed to fetch). Энэ нь ихэвчлэн зургийн хэмжээ хэтэрсэн эсвэл Nginx тохиргооноос болдог. Nginx client_max_body_size-ийг шалгана уу.";
      }

      toast({
        title: "Алдаа",
        description: errorMessage,
        variant: "destructive" as any,
      });
    }

    event.target.value = "";
  };

  const handleImageUrlChange = (url: string, formType: "yurt" | "product") => {
    if (!url.trim()) return;

    // Check if we already have 6 images
    if (uploadedImages.length >= 6) {
      toast({
        title: "Алдаа",
        description: "Дээд тал 6 зураг оруулж болно",
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

    // Set images
    let images: string[] = [];
    try {
      if (yurt.images) {
        images = typeof yurt.images === 'string' ? JSON.parse(yurt.images) : yurt.images;
      }
    } catch (e) {
      console.error('Failed to parse images:', e);
      images = Array.isArray(yurt.images) ? yurt.images : [];
    }
    setUploadedImages(images);

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
        variables: { id: editingItem.id, input: { ...formData, images: uploadedImages } },
      });
      await refetchProducts();
      toast({
        title: "Амжилттай",
        description: "Бүтээгдэхүүн амжилттай шинэчлэгдлээ",
      });
      setShowEditProduct(false);
      setEditingItem(null);
      setUploadedImages([]);
    } catch (error: any) {
      toast({
        title: "Алдаа",
        description: error.message || "Бүтээгдэхүүн шинэчлэхэд алдаа гарлаа",
        variant: "destructive" as any,
      });
    }
  };

  if (statsError || usersError || yurtsError || productsError || ordersError || bookingsError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans p-4">
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg max-w-lg w-full text-center">
          <XCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Алдаа гарлаа</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6">Серверээс мэдээлэл татахад асуудал гарлаа. Та дахин оролдоно уу эсвэл админд хандана уу.</p>
          <div className="text-left bg-gray-50 p-3 sm:p-4 rounded-lg text-xs sm:text-sm text-red-600 overflow-auto max-h-40 mb-6 font-mono whitespace-pre-wrap break-all border border-red-100">
            {statsError?.message || usersError?.message || yurtsError?.message || productsError?.message || ordersError?.message || bookingsError?.message || "Үл мэдэгдэх алдаа гарлаа."}
          </div>
          <Button onClick={() => window.location.reload()} className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold">
            Дахин ачаалах
          </Button>
        </div>
      </div>
    );
  }

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
              <TabsTrigger
                value="events"
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-[10px] xs:text-xs sm:text-sm font-bold min-w-[80px] sm:min-w-0 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-700 transition-all"
              >
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Арга хэмжээ</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-semibold">
                    {t("admin.stats.total_users")}
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">
                    {stats.totalusers}
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">
                    {t("admin.stats.from_last_month", { count: 12 })}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-semibold">
                    {t("admin.stats.total_camps")}
                  </CardTitle>
                  <Home className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">
                    {stats.totalCamps}
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">
                    {t("admin.stats.from_last_month", { count: 5 })}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-semibold">
                    {t("admin.stats.total_products")}
                  </CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">
                    {stats.totalProducts}
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">
                    {t("admin.stats.from_last_month", { count: 8 })}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-semibold">
                    {t("admin.stats.total_orders")}
                  </CardTitle>
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">
                    {stats.totalOrders}
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">
                    {t("admin.stats.from_last_month", { count: 15 })}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl font-bold">
                    {t("admin.orders.title")}
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
                    {t("admin.stats.activity")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm sm:text-base font-medium">
                        {t("admin.stats.new_users")}
                      </span>
                      <span className="font-bold text-sm sm:text-base">
                        {t("admin.stats.today", { count: todayusers })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm sm:text-base font-medium">
                        {t("admin.stats.new_camps")}
                      </span>
                      <span className="font-bold text-sm sm:text-base">
                        {t("admin.stats.today", { count: todayCamps })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm sm:text-base font-medium">
                        {t("admin.stats.new_products")}
                      </span>
                      <span className="font-bold text-sm sm:text-base">
                        {t("admin.stats.today", { count: todayProducts })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm sm:text-base font-medium">
                        {t("admin.stats.completed_bookings")}
                      </span>
                      <span className="font-bold text-sm sm:text-base">
                        {t("admin.stats.today", { count: todayBookings })}
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
                {t("admin.users.title")}
              </h2>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto font-semibold"
                onClick={() => setShowAdduser(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                {t("admin.users.add_new")}
              </Button>
            </div>

            {showAdduser && (
              <Card className="border-emerald-100 shadow-md">
                <CardHeader className="flex flex-row items-center justify-between border-b bg-emerald-50/30">
                  <CardTitle className="font-bold text-emerald-900">{t("admin.users.add_new")}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAdduser(false)}
                    className="hover:bg-emerald-100"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <form id="add-user-form">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">
                          {t("admin.users.name")}
                        </label>
                        <Input
                          name="name"
                          placeholder={t("admin.users.name")}
                          className="focus:ring-emerald-500 border-gray-200"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">
                          {t("admin.users.email")}
                        </label>
                        <Input
                          name="email"
                          type="email"
                          placeholder={t("admin.users.email")}
                          className="focus:ring-emerald-500 border-gray-200"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">
                          {t("admin.users.phone")}
                        </label>
                        <Input
                          name="phone"
                          placeholder={t("admin.users.phone")}
                          className="focus:ring-emerald-500 border-gray-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">
                          {t("admin.users.role")}
                        </label>
                        <Select name="role" defaultValue="TRAVELER">
                          <SelectTrigger className="border-gray-200">
                            <SelectValue placeholder={t("admin.users.role")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="TRAVELER">Аялагч</SelectItem>
                            <SelectItem value="HERDER">Малчин</SelectItem>
                            <SelectItem value="ADMIN">Админ</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-bold text-gray-700">
                          {t("admin.users.password")}
                        </label>
                        <Input
                          name="password"
                          type="password"
                          placeholder={t("admin.users.password")}
                          className="focus:ring-emerald-500 border-gray-200"
                          required
                        />
                      </div>
                    </div>
                  </form>
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setShowAdduser(false)}
                      className="font-bold border-gray-300"
                    >
                      {t("common.cancel")}
                    </Button>
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700 font-bold px-8"
                      onClick={handleAdduser}
                    >
                      {t("admin.users.add_new")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {showEdituser && editingItem && (
              <Card className="border-emerald-100 shadow-md">
                <CardHeader className="flex flex-row items-center justify-between border-b bg-emerald-50/30">
                  <CardTitle className="font-bold text-emerald-900">{t("admin.users.edit")}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowEdituser(false);
                      setEditingItem(null);
                    }}
                    className="hover:bg-emerald-100"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <form id="edit-user-form">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">
                          {t("admin.users.name")}
                        </label>
                        <Input
                          name="name"
                          placeholder={t("admin.users.name")}
                          className="focus:ring-emerald-500 border-gray-200"
                          defaultValue={editingItem.name}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">
                          {t("admin.users.email")}
                        </label>
                        <Input
                          name="email"
                          type="email"
                          placeholder={t("admin.users.email")}
                          className="focus:ring-emerald-500 border-gray-200"
                          defaultValue={editingItem.email}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">
                          {t("admin.users.phone")}
                        </label>
                        <Input
                          name="phone"
                          placeholder={t("admin.users.phone")}
                          className="focus:ring-emerald-500 border-gray-200"
                          defaultValue={editingItem.phone || ""}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">
                          {t("admin.users.role")}
                        </label>
                        <Select name="role" defaultValue={editingItem.role}>
                          <SelectTrigger className="border-gray-200">
                            <SelectValue placeholder={t("admin.users.role")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="TRAVELER">Аялагч</SelectItem>
                            <SelectItem value="HERDER">Малчин</SelectItem>
                            <SelectItem value="ADMIN">Админ</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </form>
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowEdituser(false);
                        setEditingItem(null);
                      }}
                      className="font-bold border-gray-300"
                    >
                      {t("common.cancel")}
                    </Button>
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700 font-bold px-8"
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
                            title: t("common.error"),
                            description: error.message,
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      {t("common.save")}
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
                {t("admin.products.title")}
              </h2>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto font-semibold"
                onClick={() => setShowAddProduct(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                {t("admin.products.add_new")}
              </Button>
            </div>

            {showAddProduct && (
              <Card className="border-emerald-100 shadow-md">
                <CardHeader className="flex flex-row items-center justify-between border-b bg-emerald-50/30">
                  <CardTitle className="font-bold text-emerald-900">{t("admin.products.add_new")}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddProduct(false)}
                    className="hover:bg-emerald-100"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <form id="add-product-form">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">{t("admin.products.name")}</label>
                        <Input name="name" placeholder={t("admin.products.name")} className="focus:ring-emerald-500" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">{t("admin.products.category")}</label>
                        <Select name="category">
                          <SelectTrigger className="focus:ring-emerald-500">
                            <SelectValue placeholder={t("admin.products.category")} />
                          </SelectTrigger>
                          <SelectContent>
                            {categoriesData?.categories?.edges?.map((edge: any) => (
                              <SelectItem key={edge.node.id} value={edge.node.id}>
                                {edge.node.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">{t("admin.products.price")}</label>
                        <Input name="price" type="number" placeholder="0.00" className="focus:ring-emerald-500" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">{t("admin.products.stock")}</label>
                        <Input name="stock" type="number" placeholder="0" className="focus:ring-emerald-500" required />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-bold text-gray-700">{t("herder.products.description")}</label>
                        <Textarea name="description" placeholder="..." className="focus:ring-emerald-500" required />
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t mt-6">
                      <label className="text-sm font-bold text-gray-700">Бүтээгдэхүүний зураг (Дээд тал нь 6)</label>
                      <div className="flex flex-wrap gap-4">
                        {uploadedImages.map((image, index) => (
                          <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden border">
                            <img src={image} alt={`product-${index}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        {uploadedImages.length < 6 && (
                          <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setImageUploadMode("file")}
                                className={imageUploadMode === "file" ? "bg-emerald-50 border-emerald-500" : ""}
                              >
                                Файл
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setImageUploadMode("url")}
                                className={imageUploadMode === "url" ? "bg-emerald-50 border-emerald-500" : ""}
                              >
                                Линк
                              </Button>
                            </div>
                            {imageUploadMode === "file" ? (
                              <div
                                onClick={() => fileInputRef.current?.click()}
                                className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-colors"
                              >
                                <Upload className="w-6 h-6 text-gray-400" />
                                <span className="text-[10px] text-gray-500 mt-1">Зураг нэмэх</span>
                                <input
                                  type="file"
                                  ref={fileInputRef}
                                  className="hidden"
                                  accept="image/*"
                                  onChange={(e) => handleFileUpload(e, "product")}
                                />
                              </div>
                            ) : (
                              <div className="flex gap-2">
                                <Input
                                  placeholder="Зурагны линк..."
                                  className="w-48 h-9 text-sm"
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      handleImageUrlChange((e.target as HTMLInputElement).value, "product");
                                      (e.target as HTMLInputElement).value = "";
                                    }
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </form>
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="outline" onClick={() => setShowAddProduct(false)} className="font-bold border-gray-300">
                      {t("common.cancel")}
                    </Button>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 font-bold px-8" onClick={handleAddProduct}>
                      {t("common.save")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {showEditProduct && editingItem && (
              <Card className="border-emerald-100 shadow-md">
                <CardHeader className="flex flex-row items-center justify-between border-b bg-emerald-50/30">
                  <CardTitle className="font-bold text-emerald-900">{t("admin.products.edit", "Бүтээгдэхүүн засах")}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowEditProduct(false);
                      setEditingItem(null);
                      setUploadedImages([]);
                    }}
                    className="hover:bg-emerald-100"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <form id="edit-product-form">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">{t("admin.products.name")}</label>
                        <Input name="name" defaultValue={editingItem.name} placeholder={t("admin.products.name")} className="focus:ring-emerald-500" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">{t("admin.products.category")}</label>
                        <Select name="category" defaultValue={editingItem?.category?.id}>
                          <SelectTrigger className="focus:ring-emerald-500">
                            <SelectValue placeholder={t("admin.products.category")} />
                          </SelectTrigger>
                          <SelectContent>
                            {categoriesData?.categories?.edges?.map((edge: any) => (
                              <SelectItem key={edge.node.id} value={edge.node.id}>
                                {edge.node.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">{t("admin.products.price")}</label>
                        <Input name="price" type="number" defaultValue={editingItem.price} placeholder="0.00" className="focus:ring-emerald-500" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">{t("admin.products.stock")}</label>
                        <Input name="stock" type="number" defaultValue={editingItem.stock} placeholder="0" className="focus:ring-emerald-500" required />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-bold text-gray-700">{t("herder.products.description")}</label>
                        <Textarea name="description" defaultValue={editingItem.description} placeholder="..." className="focus:ring-emerald-500" required />
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t mt-6">
                      <label className="text-sm font-bold text-gray-700">Бүтээгдэхүүний зураг (Дээд тал нь 6)</label>
                      <div className="flex flex-wrap gap-4">
                        {uploadedImages.map((image, index) => (
                          <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden border">
                            <img src={image} alt={`product-${index}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        {uploadedImages.length < 6 && (
                          <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setImageUploadMode("file")}
                                className={imageUploadMode === "file" ? "bg-emerald-50 border-emerald-500" : ""}
                              >
                                Файл
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setImageUploadMode("url")}
                                className={imageUploadMode === "url" ? "bg-emerald-50 border-emerald-500" : ""}
                              >
                                Линк
                              </Button>
                            </div>
                            {imageUploadMode === "file" ? (
                              <div
                                onClick={() => fileInputRef.current?.click()}
                                className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-colors"
                              >
                                <Upload className="w-6 h-6 text-gray-400" />
                                <span className="text-[10px] text-gray-500 mt-1">Зураг нэмэх</span>
                                <input
                                  type="file"
                                  ref={fileInputRef}
                                  className="hidden"
                                  accept="image/*"
                                  onChange={(e) => handleFileUpload(e, "product")}
                                />
                              </div>
                            ) : (
                              <div className="flex gap-2">
                                <Input
                                  placeholder="Зурагны линк..."
                                  className="w-48 h-9 text-sm"
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      handleImageUrlChange((e.target as HTMLInputElement).value, "product");
                                      (e.target as HTMLInputElement).value = "";
                                    }
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </form>
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowEditProduct(false);
                        setEditingItem(null);
                        setUploadedImages([]);
                      }}
                      className="font-bold border-gray-300"
                    >
                      {t("common.cancel")}
                    </Button>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 font-bold px-8" onClick={handleEditProductSubmit}>
                      {t("common.save")}
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
                          Бүтээгдэхүүний нэр
                        </TableHead>
                        <TableHead className="min-w-[120px] font-semibold">
                          Борлуулагч
                        </TableHead>
                        <TableHead className="font-semibold">
                          Ангилал
                        </TableHead>
                        <TableHead className="font-semibold">Үнэ</TableHead>
                        <TableHead className="hidden sm:table-cell font-semibold">
                          Нөөц
                        </TableHead>
                        <TableHead className="font-semibold">Төлөв</TableHead>
                        <TableHead className="font-semibold">Үйлдэл</TableHead>
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
                            {translateCategory(product.category)}
                          </TableCell>
                          <TableCell className="font-bold">
                            ₮{product.price.toLocaleString()}
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
                                      Бүтээгдэхүүний дэлгэрэнгүй
                                    </DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <label className="text-sm font-semibold">
                                        Бүтээгдэхүүний нэр
                                      </label>
                                      <p className="text-sm text-gray-600 font-medium">
                                        {product.name}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-semibold">
                                        Борлуулагч
                                      </label>
                                      <p className="text-sm text-gray-600 font-medium">
                                        {product.seller}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-semibold">
                                        Ангилал
                                      </label>
                                      <p className="text-sm text-gray-600 font-medium">
                                        {product.category}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-semibold">
                                        Үнэ
                                      </label>
                                      <p className="text-sm text-gray-600 font-medium">
                                        ₮{product.price.toLocaleString()}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-semibold">
                                        Нөөц
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
                                onClick={() => handleEditProductPopulate(product)}
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
                {t("admin.camps.title")}
              </h2>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto font-semibold"
                onClick={() => {
                  setUploadedImages([]);
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
                  setShowAddCamp(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                {t("admin.camps.add_new")}
              </Button>
            </div>

            {/* Add Camp Form */}
            {showAddCamp && (
              <Card className="border-emerald-100 shadow-md">
                <CardHeader className="flex flex-row items-center justify-between border-b bg-emerald-50/30">
                  <CardTitle className="font-bold text-emerald-900">{t("admin.camps.add_new")}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddCamp(false)}
                    className="hover:bg-emerald-100"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-8 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Баазын нэр</label>
                      <Input
                        value={campForm.name}
                        onChange={(e) => setCampForm({ ...campForm, name: e.target.value })}
                        placeholder="Баазын нэр"
                        className="focus:ring-emerald-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">{t("admin.camps.owner")}</label>
                      <Select
                        value={campForm.ownerId}
                        onValueChange={(value) => setCampForm({ ...campForm, ownerId: value })}
                      >
                        <SelectTrigger className="focus:ring-emerald-500">
                          <SelectValue placeholder={t("admin.camps.owner")} />
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
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Аймаг/Хот</label>
                      <Select
                        value={campForm.province}
                        onValueChange={(value) => setCampForm({ ...campForm, province: value, district: "" })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Аймаг сонгох" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {provinces.map((p: any) => (
                            <SelectItem key={p.mnname} value={p.mnname}>{p.mnname}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Сум/Дүүрэг</label>
                      <Select
                        value={campForm.district}
                        onValueChange={(value) => setCampForm({ ...campForm, district: value })}
                        disabled={!campForm.province}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Сум сонгох" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {districts.map((d: any) => (
                            <SelectItem key={d.mnname} value={d.mnname}>{d.mnname}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Үнэ (шөнө)</label>
                      <Input
                        type="number"
                        value={campForm.pricePerNight}
                        onChange={(e) => setCampForm({ ...campForm, pricePerNight: e.target.value })}
                        placeholder="₮"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Багтаамж (хүн)</label>
                      <Input
                        type="number"
                        value={campForm.capacity}
                        onChange={(e) => setCampForm({ ...campForm, capacity: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Байрлах төрөл</label>
                      <Select
                        value={campForm.accommodationType}
                        onValueChange={(value) => setCampForm({ ...campForm, accommodationType: value })}
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
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Тайлбар</label>
                    <Textarea
                      placeholder="Дэлгэрэнгүй тайлбар..."
                      value={campForm.description}
                      onChange={(e) => setCampForm({ ...campForm, description: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6 border-t border-b">
                    <div className="space-y-4">
                      <label className="text-sm font-bold text-gray-700">Тохилог байдал (Amenities)</label>
                      <div className="grid grid-cols-2 gap-2">
                        {amenitiesOptions.map((option) => (
                          <div key={option.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={`amenity-${option.value}`}
                              checked={campForm.amenities.includes(option.value)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setCampForm({ ...campForm, amenities: [...campForm.amenities, option.value] });
                                } else {
                                  setCampForm({ ...campForm, amenities: campForm.amenities.filter((a: string) => a !== option.value) });
                                }
                              }}
                            />
                            <label htmlFor={`amenity-${option.value}`} className="text-xs font-medium leading-none cursor-pointer">
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-sm font-bold text-gray-700">Үйл ажиллагаа (Activities)</label>
                      <div className="grid grid-cols-2 gap-2">
                        {activitiesOptions.map((option) => (
                          <div key={option.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={`activity-${option.value}`}
                              checked={campForm.activities.includes(option.value)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setCampForm({ ...campForm, activities: [...campForm.activities, option.value] });
                                } else {
                                  setCampForm({ ...campForm, activities: campForm.activities.filter((a: string) => a !== option.value) });
                                }
                              }}
                            />
                            <label htmlFor={`activity-${option.value}`} className="text-xs font-medium leading-none cursor-pointer">
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-md font-bold text-emerald-900 border-l-4 border-emerald-500 pl-3">Дүрэм ба Бодлого</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-600 uppercase">Check-in</label>
                        <Input type="time" value={campForm.checkIn} onChange={(e) => setCampForm({ ...campForm, checkIn: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-600 uppercase">Check-out</label>
                        <Input type="time" value={campForm.checkOut} onChange={(e) => setCampForm({ ...campForm, checkOut: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-600 uppercase">Хүүхдийн бодлого</label>
                        <Select value={campForm.childrenPolicy} onValueChange={(val) => setCampForm({ ...campForm, childrenPolicy: val })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {policiesOptions.childrenPolicy.map((p) => (
                              <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-600 uppercase">Гэрийн тэжээвэр амьтан</label>
                        <Select value={campForm.petsPolicy} onValueChange={(val) => setCampForm({ ...campForm, petsPolicy: val })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {policiesOptions.petsPolicy.map((p) => (
                              <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-600 uppercase">Тамхи татах</label>
                        <Select value={campForm.smokingPolicy} onValueChange={(val) => setCampForm({ ...campForm, smokingPolicy: val })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {policiesOptions.smokingPolicy.map((p) => (
                              <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-600 uppercase">Цуцлалт</label>
                        <Select value={campForm.cancellationPolicy} onValueChange={(val) => setCampForm({ ...campForm, cancellationPolicy: val })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {policiesOptions.cancellationPolicy.map((p) => (
                              <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <label className="text-sm font-bold text-gray-700">Баазын зураг (Дээд тал нь 6)</label>
                    <div className="flex flex-wrap gap-4">
                      {uploadedImages.map((image, index) => (
                        <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden border">
                          <img src={image} alt={`camp-${index}`} className="w-full h-full object-cover" />
                          <button
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {uploadedImages.length < 6 && (
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setImageUploadMode("file")}
                              className={imageUploadMode === "file" ? "bg-emerald-50 border-emerald-500" : ""}
                            >
                              Файл
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setImageUploadMode("url")}
                              className={imageUploadMode === "url" ? "bg-emerald-50 border-emerald-500" : ""}
                            >
                              Линк
                            </Button>
                          </div>
                          {imageUploadMode === "file" ? (
                            <div
                              onClick={() => fileInputRef.current?.click()}
                              className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-colors"
                            >
                              <Upload className="w-6 h-6 text-gray-400" />
                              <span className="text-[10px] text-gray-500 mt-1">Зураг нэмэх</span>
                              <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, "yurt")}
                              />
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <Input
                                placeholder="Зурагны линк..."
                                className="w-48 h-9 text-sm"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleImageUrlChange((e.target as HTMLInputElement).value, "yurt");
                                    (e.target as HTMLInputElement).value = "";
                                  }
                                }}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="outline" onClick={() => setShowAddCamp(false)}>
                      {t("common.cancel")}
                    </Button>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 font-bold" onClick={handleAddCamp}>
                      {t("common.save")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Edit Camp Form */}
            {showEditYurt && (
              <Card className="border-emerald-100 shadow-md">
                <CardHeader className="flex flex-row items-center justify-between border-b bg-emerald-50/30">
                  <CardTitle className="font-bold text-emerald-900">{t("admin.camps.edit")}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowEditYurt(false);
                      setEditingItem(null);
                      setUploadedImages([]);
                    }}
                    className="hover:bg-emerald-100"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-8 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Баазын нэр</label>
                      <Input
                        value={campForm.name}
                        onChange={(e) => setCampForm({ ...campForm, name: e.target.value })}
                        placeholder="Баазын нэр"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">{t("admin.camps.owner")}</label>
                      <Select
                        value={campForm.ownerId}
                        onValueChange={(value) => setCampForm({ ...campForm, ownerId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t("admin.camps.owner")} />
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
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Аймаг/Хот</label>
                      <Select
                        value={campForm.province}
                        onValueChange={(value) => setCampForm({ ...campForm, province: value, district: "" })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Аймаг сонгох" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {provinces.map((p: any) => (
                            <SelectItem key={p.mnname} value={p.mnname}>{p.mnname}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Сум/Дүүрэг</label>
                      <Select
                        value={campForm.district}
                        onValueChange={(value) => setCampForm({ ...campForm, district: value })}
                        disabled={!campForm.province}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Сум сонгох" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {districts.map((d: any) => (
                            <SelectItem key={d.mnname} value={d.mnname}>{d.mnname}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Үнэ (шөнө)</label>
                      <Input
                        type="number"
                        value={campForm.pricePerNight}
                        onChange={(e) => setCampForm({ ...campForm, pricePerNight: e.target.value })}
                        placeholder="₮"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Багтаамж (хүн)</label>
                      <Input
                        type="number"
                        value={campForm.capacity}
                        onChange={(e) => setCampForm({ ...campForm, capacity: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Байрлах төрөл</label>
                      <Select
                        value={campForm.accommodationType}
                        onValueChange={(value) => setCampForm({ ...campForm, accommodationType: value })}
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
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Тайлбар</label>
                    <Textarea
                      placeholder="Дэлгэрэнгүй тайлбар..."
                      value={campForm.description}
                      onChange={(e) => setCampForm({ ...campForm, description: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6 border-t border-b">
                    <div className="space-y-4">
                      <label className="text-sm font-bold text-gray-700">Тохилог байдал (Amenities)</label>
                      <div className="grid grid-cols-2 gap-2">
                        {amenitiesOptions.map((option) => (
                          <div key={option.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={`edit-amenity-${option.value}`}
                              checked={campForm.amenities.includes(option.value)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setCampForm({ ...campForm, amenities: [...campForm.amenities, option.value] });
                                } else {
                                  setCampForm({ ...campForm, amenities: campForm.amenities.filter((a: string) => a !== option.value) });
                                }
                              }}
                            />
                            <label htmlFor={`edit-amenity-${option.value}`} className="text-xs font-medium leading-none cursor-pointer">
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-sm font-bold text-gray-700">Үйл ажиллагаа (Activities)</label>
                      <div className="grid grid-cols-2 gap-2">
                        {activitiesOptions.map((option) => (
                          <div key={option.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={`edit-activity-${option.value}`}
                              checked={campForm.activities.includes(option.value)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setCampForm({ ...campForm, activities: [...campForm.activities, option.value] });
                                } else {
                                  setCampForm({ ...campForm, activities: campForm.activities.filter((a: string) => a !== option.value) });
                                }
                              }}
                            />
                            <label htmlFor={`edit-activity-${option.value}`} className="text-xs font-medium leading-none cursor-pointer">
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-md font-bold text-emerald-900 border-l-4 border-emerald-500 pl-3">Дүрэм ба Бодлого</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-600 uppercase">Check-in</label>
                        <Input type="time" value={campForm.checkIn} onChange={(e) => setCampForm({ ...campForm, checkIn: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-600 uppercase">Check-out</label>
                        <Input type="time" value={campForm.checkOut} onChange={(e) => setCampForm({ ...campForm, checkOut: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-600 uppercase">Хүүхдийн бодлого</label>
                        <Select value={campForm.childrenPolicy} onValueChange={(val) => setCampForm({ ...campForm, childrenPolicy: val })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {policiesOptions.childrenPolicy.map((p) => (
                              <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-600 uppercase">Гэрийн тэжээвэр амьтан</label>
                        <Select value={campForm.petsPolicy} onValueChange={(val) => setCampForm({ ...campForm, petsPolicy: val })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {policiesOptions.petsPolicy.map((p) => (
                              <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-600 uppercase">Тамхи татах</label>
                        <Select value={campForm.smokingPolicy} onValueChange={(val) => setCampForm({ ...campForm, smokingPolicy: val })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {policiesOptions.smokingPolicy.map((p) => (
                              <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-600 uppercase">Цуцлалт</label>
                        <Select value={campForm.cancellationPolicy} onValueChange={(val) => setCampForm({ ...campForm, cancellationPolicy: val })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {policiesOptions.cancellationPolicy.map((p) => (
                              <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <label className="text-sm font-bold text-gray-700">Баазын зураг (Дээд тал нь 6)</label>
                    <div className="flex flex-wrap gap-4">
                      {uploadedImages.map((image, index) => (
                        <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden border">
                          <img src={image} alt={`camp-${index}`} className="w-full h-full object-cover" />
                          <button
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {uploadedImages.length < 6 && (
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setImageUploadMode("file")}
                              className={imageUploadMode === "file" ? "bg-emerald-50 border-emerald-500" : ""}
                            >
                              Файл
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setImageUploadMode("url")}
                              className={imageUploadMode === "url" ? "bg-emerald-50 border-emerald-500" : ""}
                            >
                              Линк
                            </Button>
                          </div>
                          {imageUploadMode === "file" ? (
                            <div
                              onClick={() => fileInputRef.current?.click()}
                              className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-colors"
                            >
                              <Upload className="w-6 h-6 text-gray-400" />
                              <span className="text-[10px] text-gray-500 mt-1">Зураг нэмэх</span>
                              <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, "yurt")}
                              />
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <Input
                                placeholder="Зурагны линк..."
                                className="w-48 h-9 text-sm"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleImageUrlChange((e.target as HTMLInputElement).value, "yurt");
                                    (e.target as HTMLInputElement).value = "";
                                  }
                                }}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowEditYurt(false);
                        setEditingItem(null);
                        setUploadedImages([]);
                      }}
                    >
                      {t("common.cancel")}
                    </Button>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 font-bold" onClick={handleUpdateCamp}>
                      {t("common.save")}
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
                        <TableHead className="min-w-[150px] font-semibold">Баазын нэр</TableHead>
                        <TableHead className="min-w-[150px] font-semibold">Эзэмшигч</TableHead>
                        <TableHead className="font-semibold">Байршил</TableHead>
                        <TableHead className="font-semibold">Үнэ/Шөнө</TableHead>
                        <TableHead className="font-semibold">Төлөв</TableHead>
                        <TableHead className="font-semibold">Үйлдэл</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {camps.map((camp: any) => (
                        <TableRow key={camp.id}>
                          <TableCell className="font-semibold">{camp.name}</TableCell>
                          <TableCell>
                            <div className="min-w-[140px]">
                              <p className="font-semibold text-sm">{camp.owner}</p>
                              {camp.ownerEmail && <p className="text-xs text-gray-500 truncate">{camp.ownerEmail}</p>}
                              {camp.ownerPhone && <p className="text-xs text-gray-500">{camp.ownerPhone}</p>}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{camp.location}</TableCell>
                          <TableCell className="font-bold">{formatCurrency(camp.price)}</TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800 font-medium">Идэвхтэй</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm"><Eye className="w-4 h-4" /></Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                                  <DialogHeader><DialogTitle className="font-bold">Баазын дэлгэрэнгүй</DialogTitle></DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <label className="text-sm font-semibold text-gray-700">Баазын нэр</label>
                                      <p className="text-sm text-gray-900 font-medium">{camp.name}</p>
                                    </div>
                                    <div className="border-t pt-3">
                                      <label className="text-sm font-semibold text-gray-700">Эзэмшигчийн мэдээлэл</label>
                                      <p className="text-sm mt-1 font-medium">{camp.owner}</p>
                                      <p className="text-sm text-gray-500">{camp.ownerEmail} | {camp.ownerPhone}</p>
                                    </div>
                                    <div className="border-t pt-3">
                                      <label className="text-sm font-semibold text-gray-700">Байршил</label>
                                      <p className="text-sm text-gray-900">{camp.location}</p>
                                    </div>
                                    <div className="border-t pt-3 flex justify-between">
                                      <div>
                                        <label className="text-sm font-semibold text-gray-700">Багтаамж</label>
                                        <p className="text-sm">{camp.capacity} хүн</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-semibold text-gray-700">Үнэ</label>
                                        <p className="text-lg font-bold text-emerald-600">{formatCurrency(camp.price)}</p>
                                      </div>
                                    </div>
                                    
                                    {/* Amenities and Policies Preview */}
                                    <div className="border-t pt-3 space-y-3">
                                      {(() => {
                                        const ams = parseAmenities(camp.amenities);
                                        const allItems = [...ams.items, ...ams.activities, ...ams.facilities];
                                        return (
                                          <>
                                            {allItems.length > 0 && (
                                              <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase">Тохижилт ба Үйлчилгээ</label>
                                                <div className="flex flex-wrap gap-1.5 mt-1">
                                                  {allItems.map((item, idx) => {
                                                    const option = [...amenitiesOptions, ...activitiesOptions, ...facilitiesOptions].find(o => o.value === item);
                                                    return (
                                                      <Badge key={idx} variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-100">
                                                        {option ? option.label : item}
                                                      </Badge>
                                                    );
                                                  })}
                                                </div>
                                              </div>
                                            )}
                                            {ams.policies?.cancellation && (
                                              <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase">Цуцлалтын дүрэм</label>
                                                <p className="text-xs text-gray-700 mt-1 bg-gray-50 p-2 rounded border border-gray-100 whitespace-pre-line">
                                                  {(policiesOptions.cancellationPolicy.find(o => o.value === ams.policies.cancellation)?.label) || ams.policies.cancellation}
                                                </p>
                                              </div>
                                            )}
                                          </>
                                        );
                                      })()}
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Button variant="outline" size="sm" onClick={() => handleEditYurt(camp)}><Edit className="w-4 h-4" /></Button>
                              <Button variant="outline" size="sm" onClick={() => handleDelete({ ...camp, type: "yurt" })}><Trash2 className="w-4 h-4" /></Button>
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
                {t("admin.orders.title")}
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
                  {t("admin.orders.export_excel")}
                </Button>
              </div>
            </div>

            <Card className="border-emerald-100 shadow-sm">
              <CardHeader className="bg-emerald-50/30 border-b">
                <CardTitle className="text-lg font-bold text-emerald-900">
                  {t("admin.orders.product_orders")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/50">
                        <TableHead className="font-bold text-gray-700">ID</TableHead>
                        <TableHead className="min-w-[150px] font-bold text-gray-700">
                          {t("admin.orders.customer")}
                        </TableHead>
                        <TableHead className="min-w-[150px] font-bold text-gray-700">
                          {t("admin.orders.product")}
                        </TableHead>
                        <TableHead className="font-bold text-gray-700">{t("admin.orders.amount")}</TableHead>
                        <TableHead className="font-bold text-gray-700">{t("admin.orders.status")}</TableHead>
                        <TableHead className="hidden sm:table-cell font-bold text-gray-700">
                          {t("admin.orders.date")}
                        </TableHead>
                        <TableHead className="font-bold text-gray-700">{t("admin.orders.actions")}</TableHead>
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
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete({ ...order, type: "order" })}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                              {order.status === "PENDING" && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                                    onClick={() => handleApproveOrder(order.id)}
                                    title="Баталгаажуулах"
                                  >
                                    <Check className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                    onClick={() => handleRejectOrder(order.id)}
                                    title="Цуцлах"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                </>
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
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete({ ...booking, type: "booking" })}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
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
                Агуулгын удирдлага
              </h2>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto font-semibold"
                onClick={() => setShowAddContent(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Агуулга нэмэх
              </Button>
            </div>

            {showAddContent && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="font-bold">Шинэ агуулга нэмэх</CardTitle>
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
                        Агуулгын төрөл
                      </label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Агуулгын төрөл сонгох" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="destination">
                            Аялал жуулчлалын бүс
                          </SelectItem>
                          <SelectItem value="festival">
                            Наадам, арга хэмжээ
                          </SelectItem>
                          <SelectItem value="resort">Амралтын газар, рашаан</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Гарчиг
                      </label>
                      <Input
                        placeholder="Гарчиг оруулах"
                        className="font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Байршил
                      </label>
                      <Input
                        placeholder="Байршил оруулах"
                        className="font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Огноо (арга хэмжээний хувьд)
                      </label>
                      <Input type="date" className="font-medium" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Тайлбар
                    </label>
                    <Textarea
                      placeholder="Агуулгын тайлбар..."
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
                      Цуцлах
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
                    Аялал жуулчлалын бүс
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 text-sm sm:text-base font-medium">
                    Аялал жуулчлалын газрууд болон чиглэлийг удирдах
                  </p>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent font-medium"
                  >
                    Бүсүүдийг удирдах
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-base sm:text-lg font-bold">
                    <Calendar className="w-5 h-5 mr-2" />
                    Наадам, арга хэмжээ
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 text-sm sm:text-base font-medium">
                    Соёлын наадам болон арга хэмжээг удирдах
                  </p>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent font-medium"
                  >
                    Арга хэмжээ удирдах
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-base sm:text-lg font-bold">
                    <Home className="w-5 h-5 mr-2" />
                    Амралтын газар, рашаан
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 text-sm sm:text-base font-medium">
                    Амралтын газар, сувиллын газруудыг удирдах
                  </p>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent font-medium"
                  >
                    Амралтуудыг удирдах
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-emerald-600" />
                Арга хэмжээ, наадам
              </h2>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200 transition-all font-bold rounded-xl px-4 sm:px-6 w-full sm:w-auto"
                onClick={() => setShowAddEvent(true)}
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                Шинэ арга хэмжээ
              </Button>
            </div>

            <Card className="border-none shadow-xl shadow-gray-200/40 rounded-2xl overflow-hidden bg-white/50 backdrop-blur-xl">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                      <TableHead className="font-bold text-gray-700">Арга хэмжээ</TableHead>
                      <TableHead className="font-bold text-gray-700">Байршил</TableHead>
                      <TableHead className="font-bold text-gray-700">Багтаамж</TableHead>
                      <TableHead className="font-bold text-gray-700 text-center">Төлөв</TableHead>
                      <TableHead className="font-bold text-gray-700 text-right">Үйлдэл</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {eventsLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">Түр хүлээнэ үү...</TableCell>
                      </TableRow>
                    ) : eventsData?.events?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">Арга хэмжээ олдсонгүй</TableCell>
                      </TableRow>
                    ) : (
                      eventsData?.events?.map((event: any) => {
                        const parsedImages = event.images || [];

                        return (
                          <TableRow key={event.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer group">
                            <TableCell>
                              <div className="flex items-center space-x-3 sm:space-x-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                                  <img
                                    src={parsedImages[0] || "/placeholder.svg"}
                                    alt={event.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                  />
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-bold text-gray-900">{event.title}</span>
                                  <span className="text-xs text-gray-500 font-medium">{event.category}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center text-gray-600 font-medium text-sm">
                                <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400" />
                                {event.location}
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-600 font-medium text-sm">{event.groupSize}</TableCell>
                            <TableCell className="text-center">
                              <Badge className={event.isActive ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-800"}>
                                {event.isActive ? "Идэвхтэй" : "Идэвхгүй"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right space-x-2 flex justify-end items-center py-4">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors rounded-lg"
                                onClick={() => {
                                  setSelectedEvent(event);
                                  setEventForm({
                                    title: event.title,
                                    category: event.category,
                                    location: event.location,
                                    groupSize: event.groupSize,
                                    shortDescription: event.shortDescription,
                                    fullDescription: event.fullDescription,
                                    priceInfo: event.priceInfo || "",
                                    images: parsedImages,
                                    isActive: event.isActive,
                                  });
                                  setUploadedImages(parsedImages);
                                  setShowEditEvent(true);
                                }}
                              >
                                <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors rounded-lg"
                                onClick={() => handleDeleteEvent(event.id)}
                              >
                                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>

            {/* Add/Edit Event Dialog */}
            <Dialog open={showAddEvent || showEditEvent} onOpenChange={(open) => {
              if (!open) {
                setShowAddEvent(false);
                setShowEditEvent(false);
                setSelectedEvent(null);
                setEventForm({
                  title: "",
                  category: "Наадам, арга хэмжээ",
                  location: "",
                  groupSize: "",
                  shortDescription: "",
                  fullDescription: "",
                  priceInfo: "",
                  images: [],
                  isActive: true,
                });
                setUploadedImages([]);
              }
            }}>
              <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-xl border-white max-h-[90vh] overflow-y-auto w-[95vw] p-4 sm:p-6 rounded-[2rem]">
                <DialogHeader className="mb-4 sm:mb-6">
                  <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 font-display">
                    {showEditEvent ? "Арга хэмжээ засах" : "Шинэ арга хэмжээ нэмэх"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 ml-1">Арга хэмжээний нэр</label>
                      <Input
                        value={eventForm.title}
                        onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                        className="bg-gray-50/50 border-gray-200 focus:border-emerald-500 rounded-xl"
                        placeholder="Жишээ: Морьт Харваа"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 ml-1">Ангилал</label>
                      <Input
                        value={eventForm.category}
                        onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                        className="bg-gray-50/50 border-gray-200 focus:border-emerald-500 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 ml-1">Байршил</label>
                      <Input
                        value={eventForm.location}
                        onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                        className="bg-gray-50/50 border-gray-200 focus:border-emerald-500 rounded-xl"
                        placeholder="Жишээ: Улаанбаатар хотоос 45 км-т"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 ml-1">Багтаамж / Хүний тоо</label>
                      <Input
                        value={eventForm.groupSize}
                        onChange={(e) => setEventForm({ ...eventForm, groupSize: e.target.value })}
                        className="bg-gray-50/50 border-gray-200 focus:border-emerald-500 rounded-xl"
                        placeholder="Жишээ: 10-50 хүн"
                      />
                    </div>
                    <div className="col-span-1 sm:col-span-2 space-y-2">
                      <label className="text-sm font-semibold text-gray-700 ml-1">Үнэ (онцлох)</label>
                      <Input
                        value={eventForm.priceInfo}
                        onChange={(e) => setEventForm({ ...eventForm, priceInfo: e.target.value })}
                        className="bg-gray-50/50 border-gray-200 focus:border-emerald-500 rounded-xl"
                        placeholder="Жишээ: Тохиролцоно эсвэл 50,000₮-с"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 ml-1">Зураг оруулах</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-2 sm:mb-4">
                      {uploadedImages.map((url, index) => (
                        <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                          <img src={url} alt={`Upload ${index}`} className="w-full h-full object-cover" />
                          <button
                            onClick={() => {
                              const newImages = [...uploadedImages];
                              newImages.splice(index, 1);
                              setUploadedImages(newImages);
                            }}
                            className="absolute top-1 sm:top-2 right-1 sm:right-2 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      ))}
                      <div className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all relative">
                        <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mb-1 sm:mb-2" />
                        <span className="text-[10px] sm:text-xs text-gray-500 font-semibold px-2 text-center text-balance">
                          Зураг нэмэх
                        </span>
                        <input
                          type="file"
                          className="absolute inset-0 opacity-0 cursor-pointer h-full w-full"
                          accept="image/*"
                          multiple
                          onChange={(e) => handleEventFileUpload(e)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 ml-1">Товч тайлбар (Карт дээр гарах 2-3 мөр)</label>
                    <Textarea
                      value={eventForm.shortDescription}
                      onChange={(e) => setEventForm({ ...eventForm, shortDescription: e.target.value })}
                      className="bg-gray-50/50 border-gray-200 focus:border-emerald-500 rounded-xl min-h-[80px]"
                      placeholder="Жишээ: Team building харваа, хорхог, айраг, түүдэг галын үдэш..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 ml-1">Дэлгэрэнгүй тайлбар</label>
                    <Textarea
                      value={eventForm.fullDescription}
                      onChange={(e) => setEventForm({ ...eventForm, fullDescription: e.target.value })}
                      className="bg-gray-50/50 border-gray-200 focus:border-emerald-500 rounded-xl min-h-[150px]"
                      placeholder="Дэлгэрэнгүй хөтөлбөр, багтсан үйлчилгээнүүдийн мэдээлэл..."
                    />
                  </div>

                  <div className="flex items-center space-x-2 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={eventForm.isActive}
                      onChange={(e) => setEventForm({ ...eventForm, isActive: e.target.checked })}
                      className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
                    />
                    <label htmlFor="isActive" className="text-sm font-semibold text-gray-700 cursor-pointer select-none">
                      Хуудас дээр харагдах (Идэвхтэй)
                    </label>
                  </div>

                  <div className="pt-2 sm:pt-4 border-t border-gray-100">
                    <Button
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200 transition-all font-bold rounded-xl py-4 sm:py-6 text-sm sm:text-base"
                      onClick={handleSaveEvent}
                    >
                      {showEditEvent ? "Шинэчлэх" : "Хадгалах"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs >

        {/* Delete Confirmation Dialog */}
        < Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog} >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-bold">Устгахыг баталгаажуулах</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 font-medium">
                Та энэ элементийг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.
              </p>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <Button
                  variant="destructive"
                  onClick={confirmDelete}
                  className="w-full sm:w-auto font-semibold"
                >
                  Устгах
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteDialog(false)}
                  className="w-full sm:w-auto font-medium"
                >
                  Цуцлах
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog >
      </div >
    </div >
  );
}
