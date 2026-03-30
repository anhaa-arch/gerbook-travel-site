"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { useIdleLogout } from "@/hooks/use-idle-logout";
import {
  Calendar,
  MapPin,
  Star,
  Package,
  Heart,
  ShoppingBag,
  Clock,
  LogOut,
  Mail,
  Phone,
  Info,
  ChevronRight,
  ExternalLink,
  RefreshCcw,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { amenitiesOptions, activitiesOptions, facilitiesOptions, policiesOptions } from "@/data/camp-options";
import { gql, useQuery, useMutation } from "@apollo/client";
import { useToast } from "@/components/ui/use-toast";
import "../../lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { getPrimaryImage } from "@/lib/imageUtils";
import { ProfileSettings } from "@/components/profile-settings";
import {
  GET_user_STATS,
  GET_user_BOOKINGS,
  GET_user_ORDERS,
  GET_user_TRAVEL_BOOKINGS,
  GET_AVAILABLE_YURTS,
  GET_AVAILABLE_PRODUCTS,
  GET_AVAILABLE_TRAVELS,
  GET_SAVED_YURTS,
  GET_user_EVENT_BOOKINGS,
} from "./queries";

// Type definitions
interface EventBooking {
  id: string;
  numberOfPeople: number;
  totalPrice: number;
  status: string;
  qpayInvoiceId?: string;
  createdAt: string;
  event: {
    id: string;
    title: string;
    location: string;
    eventDate?: string;
    images: any;
  };
}

interface Booking {
  id: string;
  camp: string;
  location: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  amount: number;
  status: string;
  image: string;
  type: "camp" | "travel" | "event";
  owner?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  description?: string;
  amenities?: string;
  campId?: string;
  qpayInvoiceId?: string;
}

interface Order {
  id: string;
  product: string;
  seller: string;
  quantity: number;
  amount: number;
  status: string;
  date: string;
  image: string;
  qpayInvoiceId?: string;
  items?: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    category?: string;
  }>;
}

interface TravelBooking {
  id: string;
  travel: string;
  location: string;
  startDate: string;
  numberOfPeople: number;
  amount: number;
  status: string;
  image: string;
}

interface Favorite {
  id: string;
  name: string;
  location?: string;
  seller?: string;
  price: number;
  rating: number;
  type: string;
  image: string;
}

interface TravelRoute {
  id: string;
  title: string;
  duration: string;
  regions: string[];
  status: string;
  createdDate: string;
  completedDate?: string;
  totalDistance: string;
  estimatedCost: number;
  difficulty: string;
  attractions: Array<{
    name: string;
    type: string;
    duration: string;
    activities: string[];
    image: string;
  }>;
  weatherSeason: string;
  childFriendly: boolean;
  transportation: string;
  accommodations: string[];
  notes: string;
  rating?: number;
  review?: string;
}

// Enable debug logging (set to false in production)
const DEBUG_MODE = process.env.NODE_ENV === 'development';

const CHECK_QPAY_ORDER = gql`
  mutation CheckQPayOrder($orderId: String!) {
    checkQPayPaymentAndConfirmOrder(orderId: $orderId) {
      id
      status
    }
  }
`;

const CHECK_QPAY_BOOKING = gql`
  mutation CheckQPayBooking($bookingId: String!) {
    checkQPayPaymentAndConfirmBooking(bookingId: $bookingId) {
      id
      status
    }
  }
`;

const CHECK_QPAY_EVENT_BOOKING = gql`
  mutation CheckQPayEventBooking($bookingId: String!) {
    checkQPayEventPaymentAndConfirm(bookingId: $bookingId) {
      id
      status
    }
  }
`;

export default function UserDashboardContent() {
  const { t } = useTranslation();

  const parseAmenities = (amenitiesStr?: string) => {
    if (!amenitiesStr) return { items: [], activities: [], facilities: [] };
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
        facilities: []
      };
    }
  };

  const [activeTab, setActiveTab] = useState("overview");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [checkingPayment, setCheckingPayment] = useState<string | null>(null);
  const { logout, user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [checkOrderPayment] = useMutation(CHECK_QPAY_ORDER);
  const [checkBookingPayment] = useMutation(CHECK_QPAY_BOOKING);
  const [checkEventBookingPayment] = useMutation(CHECK_QPAY_EVENT_BOOKING);

  // Redirect if role is not TRAVELER
  const { data: userData } = useQuery(GET_user_STATS, {
    skip: !user?.id,
  });

  useEffect(() => {
    if (userData?.me) {
      const serverRole = String(userData.me.role).toUpperCase();
      if (serverRole === "ADMIN") {
        router.replace("/admin-dashboard");
      } else if (serverRole === "HERDER") {
        router.replace("/herder-dashboard");
      }
    }
  }, [userData, router]);

  // Auto-logout after 30 minutes of inactivity
  useIdleLogout({
    timeout: 30 * 60 * 1000, // 30 minutes
    onLogout: logout,
  });

  // Fetch real data from database
  const { data: bookingsData, loading: bookingsLoading, error: bookingsError, refetch: refetchBookings } = useQuery(
    GET_user_BOOKINGS,
    {
      variables: { userId: user?.id },
      skip: !user?.id,
    }
  );

  const { data: ordersData, loading: ordersLoading, error: ordersError, refetch: refetchOrders } = useQuery(
    GET_user_ORDERS,
    {
      variables: { userId: user?.id },
      skip: !user?.id,
    }
  );

  const { data: travelBookingsData, loading: travelBookingsLoading, error: travelBookingsError } = useQuery(
    GET_user_TRAVEL_BOOKINGS,
    {
      variables: { userId: user?.id },
      skip: !user?.id,
    }
  );

  const { data: eventBookingsData, loading: eventBookingsLoading, error: eventBookingsError, refetch: refetchEventBookings } = useQuery(
    GET_user_EVENT_BOOKINGS,
    {
      skip: !user?.id,
    }
  );

  const { data: yurtsData, loading: yurtsLoading, error: yurtsError } =
    useQuery(GET_AVAILABLE_YURTS);
  const { data: productsData, loading: productsLoading, error: productsError } = useQuery(
    GET_AVAILABLE_PRODUCTS
  );
  const { data: travelsData, loading: travelsLoading, error: travelsError } = useQuery(
    GET_AVAILABLE_TRAVELS
  );

  const { data: savedYurtsData, loading: savedYurtsLoading, error: savedYurtsError } = useQuery(
    GET_SAVED_YURTS,
    {
      skip: !user?.id,
    }
  );

  // Log any errors for debugging
  if (DEBUG_MODE) {
    if (bookingsError) console.error("Bookings error:", bookingsError);
    if (ordersError) console.error("Orders error:", ordersError);
    if (travelBookingsError) console.error("Travel bookings error:", travelBookingsError);
    if (eventBookingsError) console.error("Event bookings error:", eventBookingsError);
  }

  // Transform data for display
  const handleCheckOrderPayment = async (orderId: string) => {
    try {
      setCheckingPayment(orderId);
      const { data } = await checkOrderPayment({ variables: { orderId } });
      if (data?.checkQPayPaymentAndConfirmOrder?.status === "CONFIRMED") {
        toast({ title: "Амжилттай", description: "Таны төлбөр амжилттай, захиалгын төлөв CONFIRMED боллоо.", variant: "default" });
        refetchOrders();
      } else {
        toast({ title: "Анхааруулга", description: "Төлбөр төлөгдөөгүй байна.", variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Алдаа", description: err.message || "Төлбөр шалгахад алдаа гарлаа", variant: "destructive" });
    } finally {
      setCheckingPayment(null);
    }
  };

  const handleCheckBookingPayment = async (bookingId: string) => {
    try {
      setCheckingPayment(bookingId);
      const { data } = await checkBookingPayment({ variables: { bookingId } });
      if (data?.checkQPayPaymentAndConfirmBooking?.status === "CONFIRMED") {
        toast({ title: "Амжилттай", description: "Таны төлбөр амжилттай, захиалгын төлөв CONFIRMED боллоо.", variant: "default" });
        refetchBookings();
      } else {
        toast({ title: "Анхааруулга", description: "Төлбөр төлөгдөөгүй байна.", variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Алдаа", description: err.message || "Төлбөр шалгахад алдаа гарлаа", variant: "destructive" });
    } finally {
      setCheckingPayment(null);
    }
  };

  const handleCheckEventBookingPayment = async (bookingId: string) => {
    try {
      setCheckingPayment(bookingId);
      const { data } = await checkEventBookingPayment({ variables: { bookingId } });
      if (data?.checkQPayEventPaymentAndConfirm?.status === "CONFIRMED") {
        toast({ title: "Амжилттай", description: "Таны төлбөр амжилттай, захиалгын төлөв CONFIRMED боллоо.", variant: "default" });
        refetchEventBookings();
      } else {
        toast({ title: "Анхааруулга", description: "Төлбөр төлөгдөөгүй байна.", variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Алдаа", description: err.message || "Төлбөр шалгахад алдаа гарлаа", variant: "destructive" });
    } finally {
      setCheckingPayment(null);
    }
  };

  const bookings: Booking[] =
    bookingsData?.bookings?.edges?.map((edge: any) => {
      const yurt = edge.node?.yurt || {};
      const images = yurt.images;
      const primaryImage = getPrimaryImage(images);

      if (DEBUG_MODE) {
        console.log("Booking image data:", {
          yurtId: yurt.id,
          rawImages: images,
          primaryImage
        });
      }

      // Format dates properly
      const formatDate = (dateString: string) => {
        try {
          // Check if it's a timestamp (all numbers)
          if (/^\d+$/.test(dateString)) {
            const timestamp = parseInt(dateString);
            const date = new Date(timestamp);
            return date.toLocaleDateString('mn-MN', { year: 'numeric', month: '2-digit', day: '2-digit' });
          }
          // If it's ISO date string
          const date = new Date(dateString);
          if (!isNaN(date.getTime())) {
            return date.toLocaleDateString('mn-MN', { year: 'numeric', month: '2-digit', day: '2-digit' });
          }
          return dateString;
        } catch {
          return dateString;
        }
      };

      return {
        id: edge.node.id,
        camp: yurt.name || "Unknown Camp",
        location: yurt.location || "Unknown Location",
        checkIn: formatDate(edge.node.startDate),
        checkOut: formatDate(edge.node.endDate),
        guests: 2,
        amount: parseFloat(edge.node.totalPrice) || 0,
        status: edge.node.status?.toLowerCase() || "pending",
        qpayInvoiceId: edge.node.qpayInvoiceId,
        image: primaryImage,
        type: "camp" as const,
        owner: yurt.owner ? {
          id: yurt.owner.id,
          name: yurt.owner.name,
          email: edge.node.ownerEmail,
          phone: edge.node.ownerPhone,
        } : undefined,
        description: yurt.description,
        amenities: yurt.amenities,
        campId: yurt.id,
      };
    }) || [];

  const orders: Order[] =
    ordersData?.orders?.edges?.map((edge: any) => {
      const orderNode = edge.node || {};
      const orderItems = orderNode.orderitem || [];
      const firstItem = orderItems[0];
      const product = firstItem?.product || {};
      const images = product.images;
      const primaryImage = getPrimaryImage(images);

      return {
        id: orderNode.id,
        product: product.name || "Multiple items",
        seller: "Малчин",
        quantity: orderItems.reduce(
          (sum: number, item: any) => sum + (item.quantity || 0),
          0
        ) || 0,
        amount: parseFloat(orderNode.totalPrice) || 0,
        status: orderNode.status?.toLowerCase() || "pending",
        qpayInvoiceId: orderNode.qpayInvoiceId,
        date: orderNode.createdAt?.split("T")[0] || orderNode.createdAt,
        image: primaryImage,
        items: orderItems.map((item: any) => ({
          id: item.id,
          name: item.product?.name || "Unknown Product",
          price: item.price || 0,
          quantity: item.quantity || 0,
          image: getPrimaryImage(item.product?.images),
          category: item.product?.category?.name,
        })),
      };
    }) || [];

  const translateCategory = (cat: string | undefined) => {
    if (!cat) return "";
    const lower = cat.toLowerCase();
    if (lower.includes("dairy")) return "Сүүн бүтээгдэхүүн";
    if (lower.includes("handicraft")) return "Гар урлал";
    if (lower.includes("meat")) return "Махан бүтээгдэхүүн";
    return cat;
  };

  const travelBookings: Booking[] =
    travelBookingsData?.travelBookings?.edges?.map((edge: any) => {
      const travel = edge.node?.travel || {};
      const images = travel.images;
      const primaryImage = getPrimaryImage(images);

      const formatDateLocal = (dateString: string) => {
        try {
          if (/^\d+$/.test(dateString)) {
            const date = new Date(parseInt(dateString));
            return date.toLocaleDateString('mn-MN', { year: 'numeric', month: '2-digit', day: '2-digit' });
          }
          const date = new Date(dateString);
          return !isNaN(date.getTime())
            ? date.toLocaleDateString('mn-MN', { year: 'numeric', month: '2-digit', day: '2-digit' })
            : dateString;
        } catch {
          return dateString;
        }
      };

      return {
        id: edge.node.id,
        camp: travel.name || "Unknown Travel",
        location: travel.location || "Unknown Location",
        checkIn: formatDateLocal(edge.node.startDate),
        checkOut: "N/A",
        guests: edge.node.numberOfPeople || 1,
        amount: parseFloat(edge.node.totalPrice) || 0,
        status: edge.node.status?.toLowerCase() || "pending",
        image: primaryImage,
        type: "travel" as const,
      };
    }) || [];

  const eventBookings: EventBooking[] =
    eventBookingsData?.myEventBookings?.map((booking: any) => {
      const event = booking.event || {};
      const primaryImage = getPrimaryImage(event.images);

      const formatDateLocal = (dateString: string) => {
        try {
          if (/^\d+$/.test(dateString)) {
            const date = new Date(parseInt(dateString));
            return date.toLocaleDateString('mn-MN', { year: 'numeric', month: '2-digit', day: '2-digit' });
          }
          const date = new Date(dateString);
          return !isNaN(date.getTime())
            ? date.toLocaleDateString('mn-MN', { year: 'numeric', month: '2-digit', day: '2-digit' })
            : dateString;
        } catch {
          return dateString;
        }
      };

      return {
        id: booking.id,
        numberOfPeople: booking.numberOfPeople,
        totalPrice: booking.totalPrice,
        status: booking.status?.toLowerCase() || "pending",
        qpayInvoiceId: booking.qpayInvoiceId,
        createdAt: booking.createdAt,
        event: {
          id: event.id,
          title: event.title || "Unknown Event",
          location: event.location || "Unknown Location",
          eventDate: formatDateLocal(event.eventDate || ""),
          images: primaryImage,
        }
      };
    }) || [];

  const allBookings = [
    ...bookings,
    ...travelBookings,
    ...eventBookings.map((eb) => ({
      id: eb.id,
      camp: eb.event.title,
      location: eb.event.location,
      checkIn: eb.event.eventDate || "N/A",
      checkOut: "N/A",
      guests: eb.numberOfPeople,
      amount: eb.totalPrice,
      status: eb.status,
      image: eb.event.images,
      type: "event" as const,
      qpayInvoiceId: eb.qpayInvoiceId,
    })),
  ];

  // Calculate stats from real data
  const totalBookings = (userData?.myBookingsStats?.totalCount || 0) + eventBookings.length;
  const totalOrders = userData?.myOrdersStats?.totalCount || 0;
  const totalSpent =
    orders.reduce((sum: number, order: Order) => sum + order.amount, 0) +
    allBookings.reduce(
      (sum: number, booking: Booking) => sum + booking.amount,
      0
    ) +
    eventBookings.reduce(
      (sum: number, booking: EventBooking) => sum + booking.totalPrice,
      0
    );

  // Calculate monthly stats
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyBookings = bookings.filter((booking: Booking) => {
    const bookingDate = new Date(booking.checkIn);
    return (
      bookingDate.getMonth() === currentMonth &&
      bookingDate.getFullYear() === currentYear
    );
  }).length + eventBookings.filter((booking: EventBooking) => {
    const bookingDate = new Date(booking.createdAt);
    return (
      bookingDate.getMonth() === currentMonth &&
      bookingDate.getFullYear() === currentYear
    );
  }).length;

  const monthlyOrders = orders.filter((order: Order) => {
    const orderDate = new Date(order.date);
    return (
      orderDate.getMonth() === currentMonth &&
      orderDate.getFullYear() === currentYear
    );
  }).length;

  const monthlySpent =
    orders
      .filter((order: Order) => {
        const orderDate = new Date(order.date);
        return (
          orderDate.getMonth() === currentMonth &&
          orderDate.getFullYear() === currentYear
        );
      })
      .reduce((sum: number, order: Order) => sum + order.amount, 0) +
    allBookings
      .filter((booking: Booking) => {
        const bookingDate = new Date(booking.checkIn);
        return (
          bookingDate.getMonth() === currentMonth &&
          bookingDate.getFullYear() === currentYear
        );
      })
      .reduce((sum: number, booking: Booking) => sum + booking.amount, 0) +
    eventBookings
      .filter((booking: EventBooking) => {
        const bookingDate = new Date(booking.createdAt);
        return (
          bookingDate.getMonth() === currentMonth &&
          bookingDate.getFullYear() === currentYear
        );
      })
      .reduce((sum: number, booking: EventBooking) => sum + booking.totalPrice, 0);

  // Create favorites from real database data
  const favorites: Favorite[] = savedYurtsData?.savedYurts?.map((saved: any) => {
    const yurt = saved.yurt || {};
    return {
      id: yurt.id,
      name: yurt.name,
      location: yurt.location,
      price: yurt.pricePerNight,
      rating: 4.5, // Default rating
      type: "camp",
      image: getPrimaryImage(yurt.images),
    };
  }) || [];

  // Create travel routes from available travel data
  const travelRoutes: TravelRoute[] =
    travelsData?.travels?.edges?.map((edge: any) => ({
      id: edge.node.id,
      title: edge.node.name,
      duration: `${edge.node.duration} өдөр`,
      regions: [edge.node.location],
      status: "saved",
      createdDate: edge.node.createdAt.split("T")[0],
      totalDistance: "N/A",
      estimatedCost: edge.node.basePrice,
      difficulty: "moderate",
      attractions: [
        {
          name: edge.node.name,
          type: "travel",
          duration: `${edge.node.duration} days`,
          activities: ["Travel", "Exploration"],
          image: edge.node.images || "/placeholder.svg",
        },
      ],
      weatherSeason: "summer",
      childFriendly: true,
      transportation: "Guided tour",
      accommodations: ["Ger camps"],
      notes: edge.node.description,
    })) || [];

  // Show loading state
  const isLoading = bookingsLoading || ordersLoading || travelBookingsLoading;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-8">
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 font-display">
            Хэрэглэгчийн хянах самбар
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm md:text-base font-medium mt-1">
            Захиалга, бараа болон аяллын тохиргоогоо удирдах
          </p>
        </div>

        {/* Show errors if any */}
        {(bookingsError || ordersError || travelBookingsError) && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">
              Алдаа гарлаа. Дахин оролдоно уу.
            </p>
            {bookingsError && <p className="text-sm text-red-600">Захиалга: {bookingsError.message}</p>}
            {ordersError && <p className="text-sm text-red-600">Бараа: {ordersError.message}</p>}
            {travelBookingsError && <p className="text-sm text-red-600">Аялал: {travelBookingsError.message}</p>}
          </div>
        )}

        <div className="flex justify-end mb-3 sm:mb-4">
          <Button
            variant="outline"
            onClick={logout}
            className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-2"
          >
            <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Гарах</span>
            <span className="xs:hidden">Гарах</span>
          </Button>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <div className="overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
            <TabsList className="inline-flex w-auto sm:w-full sm:grid sm:grid-cols-5 p-1 bg-gray-100/80 rounded-xl gap-1">
              <TabsTrigger
                value="overview"
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-[10px] xs:text-xs sm:text-sm font-bold min-w-[70px] sm:min-w-0 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-700 transition-all"
              >
                <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Тойм</span>
              </TabsTrigger>
              <TabsTrigger
                value="bookings"
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-[10px] xs:text-xs sm:text-sm font-bold min-w-[70px] sm:min-w-0 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-700 transition-all"
              >
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Захиалга</span>
              </TabsTrigger>
              <TabsTrigger
                value="favorites"
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-[10px] xs:text-xs sm:text-sm font-bold min-w-[70px] sm:min-w-0 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-700 transition-all"
              >
                <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Хадгалсан</span>
              </TabsTrigger>
              <TabsTrigger
                value="routes"
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-[10px] xs:text-xs sm:text-sm font-bold min-w-[70px] sm:min-w-0 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-700 transition-all"
              >
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Маршрут</span>
              </TabsTrigger>
              <TabsTrigger
                value="profile"
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-[10px] xs:text-xs sm:text-sm font-bold min-w-[70px] sm:min-w-0 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-700 transition-all"
              >
                <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Профайл</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                  <CardTitle className="text-[10px] xs:text-xs sm:text-sm font-semibold leading-tight">
                    Нийт<br className="xs:hidden" /> захиалга
                  </CardTitle>
                  <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                </CardHeader>
                <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                  <div className="text-lg xs:text-xl sm:text-2xl font-bold">
                    {totalBookings}
                  </div>
                  <p className="text-[10px] xs:text-xs text-muted-foreground font-medium mt-0.5">
                    Энэ сард +{monthlyBookings}
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                  <CardTitle className="text-[10px] xs:text-xs sm:text-sm font-semibold leading-tight">
                    Барааны<br className="xs:hidden" /> захиалга
                  </CardTitle>
                  <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                </CardHeader>
                <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                  <div className="text-lg xs:text-xl sm:text-2xl font-bold">
                    {totalOrders}
                  </div>
                  <p className="text-[10px] xs:text-xs text-muted-foreground font-medium mt-0.5">
                    Энэ сард +{monthlyOrders}
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                  <CardTitle className="text-[10px] xs:text-xs sm:text-sm font-semibold leading-tight">
                    Нийт<br className="xs:hidden" /> зарцуулсан
                  </CardTitle>
                  <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                </CardHeader>
                <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                  <div className="text-lg xs:text-xl sm:text-2xl font-bold">
                    ₮{totalSpent.toLocaleString()}
                  </div>
                  <p className="text-[10px] xs:text-xs text-muted-foreground font-medium mt-0.5">
                    Энэ сард +₮{monthlySpent.toLocaleString()}
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                  <CardTitle className="text-[10px] xs:text-xs sm:text-sm font-semibold leading-tight">
                    Хадгалсан
                  </CardTitle>
                  <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                </CardHeader>
                <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                  <div className="text-lg xs:text-xl sm:text-2xl font-bold">
                    {favorites.length}
                  </div>
                  <p className="text-[10px] xs:text-xs text-muted-foreground font-medium mt-0.5">
                    Хадгалсан
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card className="shadow-sm">
                <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
                  <CardTitle className="text-base sm:text-lg md:text-xl font-bold">
                    Ирэх захиалгууд
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                  {bookingsLoading ? (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      Уншиж байна...
                    </div>
                  ) : (
                    <div className="space-y-3 sm:space-y-4">
                      {allBookings
                        .filter(
                          (booking: Booking) =>
                            booking.status === "upcoming" ||
                            booking.status === "confirmed" ||
                            booking.status === "pending"
                        )
                        .length === 0 ? (
                        <p className="text-center text-gray-500 py-4">
                          Ирэх захиалга байхгүй
                        </p>
                      ) : (
                        allBookings
                          .filter(
                            (booking: Booking) =>
                              booking.status === "upcoming" ||
                              booking.status === "confirmed" ||
                              booking.status === "pending"
                          )
                          .map((booking: Booking) => (
                            <div
                              key={booking.id}
                              className="flex items-center space-x-2 sm:space-x-4"
                            >
                              <img
                                src={booking.image || "/placeholder.svg"}
                                alt={booking.camp}
                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover flex-shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                                }}
                              />
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-xs sm:text-sm md:text-base truncate">
                                  {booking.camp}
                                </p>
                                <p className="text-[10px] xs:text-xs sm:text-sm text-gray-600 truncate font-medium">
                                  {booking.location}
                                </p>
                                <p className="text-[10px] xs:text-xs text-gray-500 font-medium hidden xs:block">
                                  {booking.checkIn} - {booking.checkOut}
                                </p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="font-bold text-xs sm:text-sm md:text-base whitespace-nowrap">
                                  ₮{booking.amount.toLocaleString()}
                                </p>
                                <Badge
                                  variant={
                                    booking.status === "confirmed"
                                      ? "default"
                                      : "secondary"
                                  }
                                  className={`text-[10px] xs:text-xs font-medium mt-1 ${booking.status === "confirmed"
                                    ? "bg-green-100 text-green-800"
                                    : ""
                                    }`}
                                >
                                  {booking.status === "confirmed"
                                    ? "Баталгаажсан"
                                    : booking.status === "pending"
                                      ? "Хүлээгдэж байна"
                                      : booking.status === "active"
                                        ? "Идэвхтэй"
                                        : booking.status === "approved"
                                          ? "Зөвшөөрсөн"
                                          : booking.status === "declined"
                                            ? "Татгалзсан"
                                            : booking.status === "cancelled"
                                              ? "Цуцлагдсан"
                                              : booking.status === "completed"
                                                ? "Дууссан"
                                                : booking.status}
                                </Badge>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
                  <CardTitle className="text-base sm:text-lg md:text-xl font-bold">
                    Сүүлийн захиалгууд
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                  {ordersLoading ? (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      Уншиж байна...
                    </div>
                  ) : (
                    <div className="space-y-3 sm:space-y-4">
                      {orders.length === 0 ? (
                        <p className="text-center text-gray-500 py-4 text-sm">
                          Захиалга байхгүй
                        </p>
                      ) : (
                        orders.slice(0, 3).map((order: Order) => (
                          <div
                            key={order.id}
                            className="flex items-center space-x-2 sm:space-x-4"
                          >
                            <img
                              src={order.image || "/placeholder.svg"}
                              alt={order.product}
                              className="w-10 h-10 sm:w-12 sm:h-12 rounded object-cover flex-shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/placeholder.svg";
                              }}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-xs sm:text-sm md:text-base truncate">
                                {order.product}
                              </p>
                              <p className="text-[10px] xs:text-xs sm:text-sm text-gray-600 truncate font-medium">
                                {order.seller}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-bold text-xs sm:text-sm md:text-base whitespace-nowrap">
                                ₮{order.amount.toLocaleString()}
                              </p>
                              <Badge
                                variant={
                                  order.status === "delivered"
                                    ? "default"
                                    : "secondary"
                                }
                                className="text-[10px] xs:text-xs font-medium mt-1"
                              >
                                {order.status === "delivered"
                                  ? "Хүргэгдсэн"
                                  : order.status === "shipped"
                                    ? "Илгээсэн"
                                    : order.status === "paid"
                                      ? "Төлсөн"
                                      : order.status === "pending"
                                        ? "Хүлээгдэж байна"
                                        : order.status === "approved"
                                          ? "Зөвшөөрсөн"
                                          : order.status === "confirmed"
                                            ? "Баталгаажсан"
                                            : order.status === "cancelled"
                                              ? "Цуцлагдсан"
                                              : order.status === "rejected"
                                                ? "Татгалзсан"
                                                : order.status}
                              </Badge>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold">
                Миний захиалгууд
              </h2>
              {user?.role === "TRAVELER" && (
                <Link href="/camps" className="w-full sm:w-auto">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto font-semibold text-sm sm:text-base px-4 py-2">
                    Шинэ бааз захиалах
                  </Button>
                </Link>
              )}
            </div>

            {/* All Bookings Combined */}
            <div className="space-y-4 sm:space-y-6">
              {/* Camp Bookings */}
              {bookingsLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Захиалгуудыг уншиж байна...</p>
                </div>
              ) : bookings.length > 0 ? (
                <div>
                  <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">
                    Амралт баазын захиалгууд
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                    {bookings.map((booking: Booking) => (
                      <Card key={booking.id} className="overflow-hidden shadow-sm">
                        <div className="relative aspect-video bg-gray-100 overflow-hidden">
                          <img
                            src={booking.image || "/placeholder.svg"}
                            alt={booking.camp}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/placeholder.svg";
                            }}
                          />
                          <div className="absolute top-2 right-2">
                            <Badge
                              className={`px-2 py-0.5 rounded-full font-bold shadow-sm border-none ${booking.status === "confirmed"
                                ? "bg-green-500 text-white"
                                : booking.status === "pending"
                                  ? "bg-amber-500 text-white"
                                  : booking.status === "completed"
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-500 text-white"
                                }`}
                            >
                              <span className="text-[10px] uppercase tracking-wider">
                                {booking.status === "confirmed"
                                  ? "Баталгаажсан"
                                  : booking.status === "pending"
                                    ? "Хүлээгдэж буй"
                                    : booking.status === "completed"
                                      ? "Дууссан"
                                      : booking.status === "cancelled"
                                        ? "Цуцлагдсан"
                                        : booking.status}
                              </span>
                            </Badge>
                          </div>
                        </div>
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="min-w-0 flex-1">
                              <h3 className="font-bold text-base sm:text-lg truncate text-gray-900 group-hover:text-emerald-700 transition-colors">
                                {booking.camp}
                              </h3>
                              <div className="flex items-center text-gray-500 mt-1">
                                <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0 text-emerald-600" />
                                <span className="text-xs sm:text-sm truncate font-medium">
                                  {booking.location}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center text-gray-600 mb-1.5 sm:mb-2">
                            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                            <span className="text-xs sm:text-sm truncate font-medium">
                              {booking.location}
                            </span>
                          </div>
                          <div className="flex items-center text-gray-600 mb-3 sm:mb-4">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                            <span className="text-xs sm:text-sm font-medium">
                              {booking.checkIn} - {booking.checkOut}
                            </span>
                          </div>

                          {/* Owner Contact Info */}
                          {booking.owner && (
                            <div className="bg-emerald-50 rounded-lg p-3 mb-4 border border-emerald-100">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                                  Эзэмшигчийн мэдээлэл
                                </h4>
                                <Badge variant="outline" className="text-[10px] bg-white border-emerald-200 text-emerald-700">
                                  Малчин
                                </Badge>
                              </div>
                              <p className="text-sm font-bold text-gray-900 mb-2">
                                {booking.owner.name}
                              </p>
                              <div className="flex gap-2">
                                {booking.owner.phone && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 h-8 bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50 text-xs font-bold"
                                    onClick={() => window.location.href = `tel:${booking.owner?.phone}`}
                                  >
                                    <Phone className="w-3 h-3 mr-1" />
                                    Залгах
                                  </Button>
                                )}
                                {booking.owner.email && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 h-8 bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50 text-xs font-bold"
                                    onClick={() => window.location.href = `mailto:${booking.owner?.email}`}
                                  >
                                    <Mail className="w-3 h-3 mr-1" />
                                    Мэйл бичих
                                  </Button>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                            <div>
                              <span className="text-base sm:text-lg md:text-xl font-bold text-emerald-700">
                                ₮{booking.amount.toLocaleString()}
                              </span>
                              <span className="text-gray-500 ml-1 text-xs font-medium">
                                нийт
                              </span>
                            </div>
                            <div className="flex gap-2">
                              {booking.status === "pending" && booking.qpayInvoiceId && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-emerald-700 font-bold text-xs border-emerald-200 hover:bg-emerald-50"
                                  disabled={checkingPayment === booking.id}
                                  onClick={() => handleCheckBookingPayment(booking.id)}
                                >
                                  <RefreshCcw className={`w-3 h-3 mr-1 ${checkingPayment === booking.id ? "animate-spin" : ""}`} />
                                  {checkingPayment === booking.id ? "Шалгаж байна..." : "Төлбөр амжилттай эсэхийг шалгах"}
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-600 hover:text-emerald-700 font-bold text-xs"
                                onClick={() => setSelectedBooking(booking)}
                              >
                                Дэлгэрэнгүй
                                <ChevronRight className="w-3 h-3 ml-1" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Event Bookings */}
              {eventBookingsLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Арга хэмжээний захиалгуудыг уншиж байна...</p>
                </div>
              ) : eventBookings.length > 0 ? (
                <div>
                  <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">
                    Арга хэмжээний захиалгууд
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                    {eventBookings.map((booking: EventBooking) => (
                      <Card key={booking.id} className="overflow-hidden shadow-sm">
                        <div className="relative aspect-video bg-gray-100 overflow-hidden">
                          <img
                            src={booking.event.images || "/placeholder.svg"}
                            alt={booking.event.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/placeholder.svg";
                            }}
                          />
                          <div className="absolute top-2 right-2">
                            <Badge
                              className={`px-2 py-0.5 rounded-full font-bold shadow-sm border-none ${booking.status === "confirmed"
                                ? "bg-green-500 text-white"
                                : booking.status === "pending"
                                  ? "bg-amber-500 text-white"
                                  : booking.status === "completed"
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-500 text-white"
                                }`}
                            >
                              <span className="text-[10px] uppercase tracking-wider">
                                {booking.status === "confirmed"
                                  ? "Баталгаажсан"
                                  : booking.status === "pending"
                                    ? "Хүлээгдэж буй"
                                    : booking.status === "completed"
                                      ? "Дууссан"
                                      : booking.status === "cancelled"
                                        ? "Цуцлагдсан"
                                        : booking.status}
                              </span>
                            </Badge>
                          </div>
                        </div>
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="min-w-0 flex-1">
                              <h3 className="font-bold text-base sm:text-lg truncate text-gray-900 group-hover:text-emerald-700 transition-colors">
                                {booking.event.title}
                              </h3>
                              <div className="flex items-center text-gray-500 mt-1">
                                <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0 text-emerald-600" />
                                <span className="text-xs sm:text-sm truncate font-medium">
                                  {booking.event.location}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center text-gray-600 mb-3 sm:mb-4">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                            <span className="text-xs sm:text-sm font-medium">
                              {booking.event.eventDate || "Тодорхойгүй"}
                            </span>
                          </div>

                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                            <div>
                              <span className="text-base sm:text-lg md:text-xl font-bold text-emerald-700">
                                ₮{booking.totalPrice.toLocaleString()}
                              </span>
                              <span className="text-gray-500 ml-1 text-xs font-medium">
                                нийт
                              </span>
                            </div>
                            <div className="flex gap-2">
                              {booking.status === "pending" && booking.qpayInvoiceId && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-emerald-700 font-bold text-xs border-emerald-200 hover:bg-emerald-50"
                                  disabled={checkingPayment === booking.id}
                                  onClick={() => handleCheckEventBookingPayment(booking.id)}
                                >
                                  <RefreshCcw className={`w-3 h-3 mr-1 ${checkingPayment === booking.id ? "animate-spin" : ""}`} />
                                  {checkingPayment === booking.id ? "Шалгаж байна..." : "Төлбөр шалгах"}
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Travel Bookings */}
              {travelBookingsLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Аяллын захиалгуудыг уншиж байна...</p>
                </div>
              ) : travelBookings.length > 0 ? (
                <div>
                  <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Аяллын захиалгууд</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                    {travelBookings.map((booking: Booking) => (
                      <Card key={booking.id} className="overflow-hidden shadow-sm">
                        <div className="aspect-video bg-gray-100 flex items-center justify-center">
                          <img
                            src={booking.image || "/placeholder.svg"}
                            alt={booking.camp}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/placeholder.svg";
                            }}
                          />
                        </div>
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-bold text-sm sm:text-base md:text-lg truncate flex-1 pr-2">
                              {booking.camp}
                            </h3>
                            <Badge
                              variant={
                                booking.status === "completed"
                                  ? "default"
                                  : booking.status === "confirmed"
                                    ? "secondary"
                                    : "outline"
                              }
                              className={`text-xs ml-2 font-medium ${booking.status === "confirmed"
                                ? "bg-green-100 text-green-800 border-green-300"
                                : booking.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                                  : ""
                                }`}
                            >
                              {booking.status === "confirmed"
                                ? "Баталгаажсан"
                                : booking.status === "pending"
                                  ? "Хүлээгдэж байна"
                                  : booking.status === "completed"
                                    ? "Дууссан"
                                    : booking.status === "cancelled"
                                      ? "Цуцлагдсан"
                                      : booking.status}
                            </Badge>
                          </div>
                          <div className="flex items-center text-gray-600 mb-2">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span className="text-sm truncate font-medium">
                              {booking.location}
                            </span>
                          </div>
                          <div className="flex items-center text-gray-600 mb-4">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span className="text-sm font-medium">
                              {booking.checkIn}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-xl font-bold">
                                ₮{booking.amount.toLocaleString()}
                              </span>
                              <span className="text-gray-600 ml-1 text-sm font-medium">
                                нийт
                              </span>
                            </div>
                            <span className="text-sm text-gray-600 font-medium">
                              {booking.guests} хүн
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Product Orders */}
              {ordersLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Барааны захиалгуудыг уншиж байна...</p>
                </div>
              ) : orders.length > 0 ? (
                <div>
                  <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Барааны захиалгууд</h3>

                  {/* Mobile: Card Layout */}
                  <div className="sm:hidden space-y-3">
                    {orders.map((order: Order) => (
                      <Card key={order.id} className="shadow-sm">
                        <CardContent className="p-3">
                          <div className="flex items-start space-x-3 mb-2">
                            <img
                              src={order.image || "/placeholder.svg"}
                              alt={order.product}
                              className="w-12 h-12 rounded object-cover flex-shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/placeholder.svg";
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm truncate">{order.product}</p>
                              <p className="text-xs text-gray-600 truncate">{order.seller}</p>
                              <p className="text-xs text-gray-500 mt-1">#{order.id.substring(0, 8)}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-bold text-sm">₮{order.amount.toLocaleString()}</p>
                              <Badge
                                variant={order.status === "delivered" ? "default" : order.status === "shipped" ? "secondary" : "outline"}
                                className={`text-[10px] mt-1 ${order.status === "delivered"
                                  ? "bg-green-100 text-green-800"
                                  : order.status === "shipped"
                                    ? "bg-blue-100 text-blue-800"
                                    : order.status === "paid"
                                      ? "bg-purple-100 text-purple-800"
                                      : ""
                                  }`}
                              >
                                {order.status === "delivered" ? "Хүргэгдсэн" : order.status === "shipped" ? "Илгээсэн" : order.status === "paid" ? "Төлсөн" : order.status === "pending" ? "Хүлээгдэж байна" : order.status}
                              </Badge>
                              {order.status === "pending" && order.qpayInvoiceId && (
                                <div className="mt-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-[10px] h-7 text-emerald-700 w-full border-emerald-200"
                                    disabled={checkingPayment === order.id}
                                    onClick={() => handleCheckOrderPayment(order.id)}
                                  >
                                    <RefreshCcw className={`w-2.5 h-2.5 mr-1 ${checkingPayment === order.id ? "animate-spin" : ""}`} />
                                    {checkingPayment === order.id ? "..." : "Төлбөр шалгах"}
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex justify-between items-center text-xs text-gray-600 mt-2 pt-2 border-t">
                            <div className="flex gap-4">
                              <span>Тоо: {order.quantity}</span>
                              <span>{order.date}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-emerald-700 font-bold p-0"
                              onClick={() => setSelectedOrder(order)}
                            >
                              Дэлгэрэнгүй
                              <ChevronRight className="w-3 h-3 ml-1" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Desktop: Table Layout */}
                  <Card className="hidden sm:block shadow-sm">
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="font-semibold text-xs md:text-sm">
                                Захиалгын №
                              </TableHead>
                              <TableHead className="min-w-[150px] font-semibold text-xs md:text-sm">
                                Бараа
                              </TableHead>
                              <TableHead className="min-w-[120px] font-semibold text-xs md:text-sm">
                                Борлуулагч
                              </TableHead>
                              <TableHead className="font-semibold text-xs md:text-sm">
                                Тоо
                              </TableHead>
                              <TableHead className="font-semibold text-xs md:text-sm">
                                Дүн
                              </TableHead>
                              <TableHead className="font-semibold text-xs md:text-sm">
                                Төлөв
                              </TableHead>
                              <TableHead className="hidden md:table-cell font-semibold text-xs md:text-sm">
                                Огноо
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {orders.map((order: Order) => (
                              <TableRow key={order.id}>
                                <TableCell className="font-semibold text-xs md:text-sm">
                                  #{order.id.substring(0, 8)}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center space-x-2">
                                    <img
                                      src={order.image || "/placeholder.svg"}
                                      alt={order.product}
                                      className="w-8 h-8 rounded object-cover flex-shrink-0"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                                      }}
                                    />
                                    <span className="truncate max-w-[120px] font-medium text-xs md:text-sm">
                                      {order.product}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="truncate max-w-[120px] font-medium text-xs md:text-sm">
                                  {order.seller}
                                </TableCell>
                                <TableCell className="font-medium text-xs md:text-sm">
                                  {order.quantity}
                                </TableCell>
                                <TableCell className="font-bold text-xs md:text-sm">
                                  ₮{order.amount.toLocaleString()}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      order.status === "delivered"
                                        ? "default"
                                        : order.status === "shipped"
                                          ? "secondary"
                                          : "outline"
                                    }
                                    className={`font-medium text-[10px] md:text-xs ${order.status === "delivered"
                                      ? "bg-green-100 text-green-800"
                                      : order.status === "shipped"
                                        ? "bg-blue-100 text-blue-800"
                                        : order.status === "paid"
                                          ? "bg-purple-100 text-purple-800"
                                          : ""
                                      }`}
                                  >
                                    {order.status === "delivered"
                                      ? "Хүргэгдсэн"
                                      : order.status === "shipped"
                                        ? "Илгээсэн"
                                        : order.status === "paid"
                                          ? "Төлсөн"
                                          : order.status === "pending"
                                            ? "Хүлээгдэж байна"
                                            : order.status}
                                  </Badge>
                                  {order.status === "pending" && order.qpayInvoiceId && (
                                    <div className="mt-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-[10px] h-6 px-2 text-emerald-700 font-medium border-emerald-200"
                                        disabled={checkingPayment === order.id}
                                        onClick={() => handleCheckOrderPayment(order.id)}
                                      >
                                        <RefreshCcw className={`w-2.5 h-2.5 mr-1 ${checkingPayment === order.id ? "animate-spin" : ""}`} />
                                        {checkingPayment === order.id ? "Шалгаж байна..." : "Төлбөр шалгах"}
                                      </Button>
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell className="hidden md:table-cell font-medium text-xs md:text-sm">
                                  {order.date}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-600 hover:text-emerald-700 font-bold text-xs"
                                    onClick={() => setSelectedOrder(order)}
                                  >
                                    Дэлгэрэнгүй
                                    <ChevronRight className="w-3 h-3 ml-1" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : null}

              {/* No bookings message */}
              {!bookingsLoading &&
                !ordersLoading &&
                !travelBookingsLoading &&
                !eventBookingsLoading &&
                bookings.length === 0 &&
                travelBookings.length === 0 &&
                eventBookings.length === 0 &&
                orders.length === 0 && (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      Захиалга байхгүй
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Та одоогоор ямар ч захиалга хийгээгүй байна.
                    </p>
                    <Link href="/camps">
                      <Button className="bg-emerald-600 hover:bg-emerald-700 font-semibold">
                        Эхлэх
                      </Button>
                    </Link>
                  </div>
                )}
            </div>
          </TabsContent>

          {/* Orders Tab - Removed as it's now combined with Bookings */}

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl sm:text-2xl font-bold">
                Хадгалсан амралтууд
              </h2>
              <Button
                variant="outline"
                className="w-full sm:w-auto bg-transparent font-semibold"
                onClick={() => {
                  localStorage.removeItem("savedCamps");
                  window.location.reload();
                }}
              >
                Бүгдийг цэвэрлэх
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {favorites.length > 0 ? (
                favorites.map((item: Favorite) => (
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
                        <h3 className="font-bold text-base sm:text-lg truncate flex-1">
                          {item.name}
                        </h3>
                        <Badge
                          variant="outline"
                          className="text-xs ml-2 font-medium"
                        >
                          {item.type === "camp" ? "Бааз" : "Бараа"}
                        </Badge>
                      </div>
                      {item.type === "camp" ? (
                        <div className="flex items-center text-gray-600 mb-2">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span className="text-sm truncate font-medium">
                            {item.location}
                          </span>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600 mb-2 font-medium">
                          Борлуулагч: {item.seller}
                        </p>
                      )}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                          <span className="text-sm font-semibold">
                            {item.rating}
                          </span>
                        </div>
                        <span className="text-xl font-bold">₮{item.price.toLocaleString()}</span>
                      </div>
                      <div className="flex space-x-2">
                        <Link href={`/camp/${item.id}`}>
                          <Button
                            size="sm"
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 font-semibold"
                          >
                            {item.type === "camp"
                              ? "Дэлгэрэнгүй"
                              : "Сагсанд нэмэх"}
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm">
                          <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    Хадгалсан амралт байхгүй
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Та одоогоор ямар ч амралт хадгалаагүй байна.
                  </p>
                  <Link href="/camps">
                    <Button className="bg-emerald-600 hover:bg-emerald-700 font-semibold">
                      Амралт хайх
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Travel Routes Tab */}
          <TabsContent value="routes" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">
                  Миний аяллын маршрут
                </h2>
                <p className="text-gray-600 text-sm font-medium">
                  Таны сонирхолд нийцсэн хувийн маршрут
                </p>
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
                              <h3 className="font-bold text-lg sm:text-xl mb-2 font-display">
                                {route.title}
                              </h3>
                              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <Clock className="w-4 h-4 mr-1" />
                                  <span className="font-medium">
                                    {route.duration}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <MapPin className="w-4 h-4 mr-1" />
                                  <span className="font-medium">
                                    {route.totalDistance}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <Package className="w-4 h-4 mr-1" />
                                  <span className="font-medium">
                                    ₮{route.estimatedCost.toLocaleString()}
                                  </span>
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
                                {route.status === "saved" ? "Хадгалсан" : route.status}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={`font-medium ${route.difficulty === "extreme"
                                  ? "border-red-500 text-red-600"
                                  : route.difficulty === "challenging"
                                    ? "border-orange-500 text-orange-600"
                                    : "border-green-500 text-green-600"
                                  }`}
                              >
                                {route.difficulty === "extreme" ? "Маш хүнд" :
                                  route.difficulty === "challenging" ? "Хүнд" :
                                    route.difficulty === "moderate" ? "Дунд зэрэг" : "Хялбар"}
                              </Badge>
                            </div>
                          </div>

                          {/* Route Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <h4 className="font-bold text-sm text-gray-700 mb-2">
                                Аяллын мэдээлэл
                              </h4>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600 font-medium">
                                    Улирал:
                                  </span>
                                  <span className="capitalize font-semibold">
                                    {route.weatherSeason === "summer" ? "Зун" :
                                      route.weatherSeason === "winter" ? "Өвөл" :
                                        route.weatherSeason === "autumn" ? "Намар" :
                                          route.weatherSeason === "spring" ? "Хавар" : route.weatherSeason}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600 font-medium">
                                    Хүүхдэд ээлтэй:
                                  </span>
                                  <span
                                    className={`font-semibold ${route.childFriendly
                                      ? "text-green-600"
                                      : "text-red-600"
                                      }`}
                                  >
                                    {route.childFriendly ? "Тийм" : "Үгүй"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600 font-medium">
                                    Тээвэр:
                                  </span>
                                  <span className="text-right font-semibold">
                                    {route.transportation === "Guided tour" ? "Хөтөчтэй аялал" : route.transportation}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-gray-700 mb-2">
                                Байрлах газар
                              </h4>
                              <div className="flex flex-wrap gap-1">
                                {route.accommodations.map(
                                  (acc: string, index: number) => (
                                    <Badge
                                      key={index}
                                      variant="secondary"
                                      className="text-xs font-medium"
                                    >
                                      {acc}
                                    </Badge>
                                  )
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Attractions */}
                          <div className="mb-4">
                            <h4 className="font-bold text-sm text-gray-700 mb-3">
                              Үзэх газрууд & Үйл ажиллагаа
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {route.attractions.map(
                                (attraction: any, index: number) => (
                                  <div
                                    key={index}
                                    className="border rounded-lg p-3 bg-gray-50"
                                  >
                                    <div className="flex items-center space-x-3 mb-2">
                                      <img
                                        src={
                                          attraction.image || "/placeholder.svg"
                                        }
                                        alt={attraction.name}
                                        className="w-10 h-10 rounded object-cover"
                                      />
                                      <div className="flex-1 min-w-0">
                                        <h5 className="font-semibold text-sm truncate">
                                          {attraction.name}
                                        </h5>
                                        <p className="text-xs text-gray-600 capitalize font-medium">
                                          {attraction.type} •{" "}
                                          {attraction.duration}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                      {attraction.activities
                                        .slice(0, 2)
                                        .map(
                                          (
                                            activity: string,
                                            actIndex: number
                                          ) => (
                                            <Badge
                                              key={actIndex}
                                              variant="outline"
                                              className="text-xs font-medium"
                                            >
                                              {activity}
                                            </Badge>
                                          )
                                        )}
                                      {attraction.activities.length > 2 && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs font-medium"
                                        >
                                          +{attraction.activities.length - 2}{" "}
                                          илүү
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>

                          {/* Notes and Review */}
                          <div className="mb-4">
                            <p className="text-sm text-gray-700 italic font-medium">
                              {route.notes}
                            </p>
                            {route.review && (
                              <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                                <div className="flex items-center mb-1">
                                  <div className="flex">
                                    {[...Array(route.rating)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className="w-4 h-4 fill-yellow-400 text-yellow-400"
                                      />
                                    ))}
                                  </div>
                                  <span className="ml-2 text-sm font-semibold">
                                    Таны сэтгэгдэл
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700 font-medium">
                                  "{route.review}"
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 font-semibold"
                            >
                              {route.status === "completed"
                                ? "Ижил аялал захиалах"
                                : route.status === "planning"
                                  ? "Захиалгаа баталгаажуулах"
                                  : "Энэ маршрутыг ашиглах"}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="font-semibold bg-transparent"
                            >
                              Газрын зураг дээр харах
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="font-semibold bg-transparent"
                            >
                              Маршрутыг хуваалцах
                            </Button>
                            {route.status === "completed" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="font-semibold bg-transparent"
                              >
                                Сэтгэгдэл бичих
                              </Button>
                            )}
                          </div>

                          {/* Dates */}
                          <div className="flex justify-between items-center mt-4 pt-4 border-t text-xs text-gray-500">
                            <span className="font-medium">
                              Үүсгэсэн: {route.createdDate}
                            </span>
                            {route.completedDate && (
                              <span className="font-medium">
                                Дууссан: {route.completedDate}
                              </span>
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
                    {
                      travelRoutes.filter(
                        (r: TravelRoute) => r.status === "completed"
                      ).length
                    }
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    Дууссан маршрут
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {
                      travelRoutes.filter(
                        (r: TravelRoute) => r.status === "planning"
                      ).length
                    }
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    Төлөвлөж буй
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {travelRoutes.reduce(
                      (total: number, route: TravelRoute) =>
                        total + Number.parseInt(route.duration),
                      0
                    )}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    Нийт аялсан хоног
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    ₮
                    {travelRoutes.reduce(
                      (total: number, route: TravelRoute) =>
                        total + route.estimatedCost,
                      0
                    ).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    Нийт төсөв
                  </div>
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
                          Нийт захиалга
                        </span>
                        <span className="font-semibold">{totalBookings}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 font-medium">
                          Нийт барааны захиалга
                        </span>
                        <span className="font-semibold">{totalOrders}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 font-medium">
                          Нийт зарцуулсан
                        </span>
                        <span className="font-semibold">
                          ₮{totalSpent.toLocaleString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Booking Detail Modal */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-display">
              Захиалгын дэлгэрэнгүй
            </DialogTitle>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-6">
              <div className="aspect-video rounded-xl overflow-hidden bg-gray-100">
                <img
                  src={selectedBooking.image || "/placeholder.svg"}
                  alt={selectedBooking.camp}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedBooking.camp}</h2>
                  <div className="flex items-center text-gray-500 font-medium">
                    <MapPin className="w-4 h-4 mr-1 text-emerald-600" />
                    {selectedBooking.location}
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <Badge className={`px-3 py-1 font-bold ${selectedBooking.status === "confirmed" ? "bg-green-500" : "bg-amber-500"
                    }`}>
                    {selectedBooking.status.toUpperCase()}
                  </Badge>
                  <div className="text-lg font-black text-emerald-700 mt-1">
                    ₮{selectedBooking.amount.toLocaleString()}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 font-bold uppercase mb-1">Ирэх өдөр</p>
                  <p className="font-semibold text-gray-900">{selectedBooking.checkIn}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 font-bold uppercase mb-1">Гарах өдөр</p>
                  <p className="font-semibold text-gray-900">{selectedBooking.checkOut}</p>
                </div>
              </div>

              {selectedBooking.description && (
                <div className="space-y-2">
                  <h3 className="font-bold text-gray-900">Тайлбар</h3>
                  <p className="text-sm text-gray-600 leading-relaxed font-medium">
                    {selectedBooking.description}
                  </p>
                </div>
              )}

              {(() => {
                const ams = parseAmenities(selectedBooking.amenities);
                return ams.policies?.cancellation && (
                  <div className="space-y-2">
                    <h3 className="font-bold text-gray-900">Цуцлалтын бодлого</h3>
                    <p className="text-sm text-gray-600 leading-relaxed font-medium whitespace-pre-line bg-gray-50 p-3 rounded-lg border border-gray-100">
                      {([...(policiesOptions.cancellationPolicy || [])].find(o => o.value === ams.policies.cancellation)?.label) || ams.policies.cancellation}
                    </p>
                  </div>
                );
              })()}

              {selectedBooking.amenities && (
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900">Үйлчилгээ ба тав тух</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(() => {
                      const ams = parseAmenities(selectedBooking.amenities);
                      const allItems = [...ams.items, ...ams.activities, ...ams.facilities];

                      return allItems.length > 0 ? (
                        allItems.map((item, idx) => {
                          const option = [...amenitiesOptions, ...activitiesOptions, ...facilitiesOptions].find(o => o.value === item);
                          return (
                            <div key={idx} className="flex items-center gap-2 text-sm text-gray-700 font-medium p-2 bg-emerald-50/50 rounded-lg border border-emerald-100/50">
                              <Info className="w-4 h-4 text-emerald-600" />
                              {option ? option.label : item}
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-sm text-gray-500">Үйлчилгээний мэдээлэл байхгүй</p>
                      );
                    })()}
                  </div>
                </div>
              )}

              {selectedBooking.owner && (
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <h3 className="font-bold text-emerald-900 mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Эзэмшигчтэй холбогдох
                  </h3>
                  <div className="flex flex-col gap-3">
                    {selectedBooking.owner.phone && (
                      <div className="flex flex-col gap-1">
                        <p className="text-xs text-emerald-800/70 font-bold uppercase ml-1">Утасны дугаар</p>
                        <Button
                          className="w-full bg-white hover:bg-emerald-50 text-emerald-700 border-emerald-200 justify-start"
                          variant="outline"
                          onClick={() => window.location.href = `tel:${selectedBooking.owner?.phone}`}
                        >
                          <Phone className="w-4 h-4 mr-3" />
                          <span className="font-bold">{selectedBooking.owner.phone}</span>
                        </Button>
                      </div>
                    )}
                    {selectedBooking.owner.email && (
                      <div className="flex flex-col gap-1">
                        <p className="text-xs text-emerald-800/70 font-bold uppercase ml-1">Цахим шуудан</p>
                        <Button
                          className="w-full bg-white hover:bg-emerald-50 text-emerald-700 border-emerald-200 justify-start"
                          variant="outline"
                          onClick={() => window.location.href = `mailto:${selectedBooking.owner?.email}`}
                        >
                          <Mail className="w-4 h-4 mr-3" />
                          <span className="font-bold">{selectedBooking.owner.email}</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button className="flex-1 bg-gray-900 hover:bg-black text-white py-6" onClick={() => setSelectedBooking(null)}>
                  Хаах
                </Button>
                {selectedBooking.status === "pending" && selectedBooking.qpayInvoiceId && (
                  <Button
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-6 font-bold"
                    disabled={checkingPayment === selectedBooking.id}
                    onClick={() => {
                      handleCheckBookingPayment(selectedBooking.id);
                      setSelectedBooking(null);
                    }}
                  >
                    <RefreshCcw className={`w-4 h-4 mr-2 ${checkingPayment === selectedBooking.id ? "animate-spin" : ""}`} />
                    {checkingPayment === selectedBooking.id ? "Шалгаж байна..." : "Төлбөр амжилттай эсэхийг шалгах"}
                  </Button>
                )}
                {selectedBooking.type === "camp" && (
                  <Link href={`/camp/${selectedBooking.campId || selectedBooking.id.split(':').pop()}`} className="flex-1">
                    <Button variant="outline" className="w-full border-gray-200 h-full py-6">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Хуудсыг үзэх
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
 
      {/* Order Detail Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-display">
              Захиалгын дэлгэрэнгүй
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-gray-900">Захиалга #{selectedOrder.id.substring(0, 8)}</h2>
                  <p className="text-sm text-gray-500 font-medium">Огноо: {selectedOrder.date}</p>
                </div>
                <div className="text-left sm:text-right">
                  <Badge className={`px-3 py-1 font-bold ${selectedOrder.status === "paid" || selectedOrder.status === "delivered" ? "bg-green-500" : "bg-amber-500"
                    }`}>
                    {selectedOrder.status.toUpperCase()}
                  </Badge>
                  <div className="text-lg font-black text-emerald-700 mt-1">
                    ₮{selectedOrder.amount.toLocaleString()}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-bold text-gray-900">Захиалсан бараанууд</h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-16 h-16 rounded-lg object-cover bg-white"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 truncate">{item.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          {item.category && (
                            <Badge variant="outline" className="text-[10px] bg-white text-emerald-700 border-emerald-100">
                              {translateCategory(item.category)}
                            </Badge>
                          )}
                          <span className="text-xs text-gray-500 font-medium">Тоо: {item.quantity}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">₮{item.price.toLocaleString()}</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase">Нэгж үнэ</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <h3 className="font-bold text-emerald-900 mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Хүргэлтийн мэдээлэл
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-800/70 font-medium">Төлөв:</span>
                    <span className="font-bold text-emerald-900 capitalize">{selectedOrder.status}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-800/70 font-medium">Борлуулагч:</span>
                    <span className="font-bold text-emerald-900">{selectedOrder.seller}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button className="flex-1 bg-gray-900 hover:bg-black text-white py-6 font-bold" onClick={() => setSelectedOrder(null)}>
                  Хаах
                </Button>
                {selectedOrder.status === "pending" && selectedOrder.qpayInvoiceId && (
                  <Button
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-6 font-bold shadow-lg shadow-emerald-100"
                    disabled={checkingPayment === selectedOrder.id}
                    onClick={() => {
                      handleCheckOrderPayment(selectedOrder.id);
                      setSelectedOrder(null);
                    }}
                  >
                    <RefreshCcw className={`w-4 h-4 mr-2 ${checkingPayment === selectedOrder.id ? "animate-spin" : ""}`} />
                    {checkingPayment === selectedOrder.id ? "Шалгаж байна..." : "Төлбөр амжилттай эсэхийг шалгах"}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div >
  );
}
