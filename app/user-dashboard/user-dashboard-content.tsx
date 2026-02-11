"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
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
import { useQuery } from "@apollo/client";
import "../../lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { getPrimaryImage } from "@/lib/imageUtils";
import { ProfileSettings } from "@/components/profile-settings";
import {
  GET_user_BOOKINGS,
  GET_user_ORDERS,
  GET_user_TRAVEL_BOOKINGS,
  GET_AVAILABLE_YURTS,
  GET_AVAILABLE_PRODUCTS,
  GET_AVAILABLE_TRAVELS,
  GET_SAVED_YURTS,
} from "./queries";

// Type definitions
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
  type: "camp" | "travel";
  owner?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
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

export default function UserDashboardContent() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");
  const { logout, user } = useAuth();

  // Auto-logout after 5 minutes of inactivity
  useIdleLogout({
    timeout: 5 * 60 * 1000, // 5 minutes
    onLogout: logout,
  });

  // Fetch real data from database
  const { data: bookingsData, loading: bookingsLoading, error: bookingsError } = useQuery(
    GET_user_BOOKINGS,
    {
      variables: { userId: user?.id },
      skip: !user?.id,
    }
  );

  const { data: ordersData, loading: ordersLoading, error: ordersError } = useQuery(
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
  }

  // Transform data for display
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
        image: primaryImage,
        type: "camp" as const,
        owner: yurt.owner ? {
          id: yurt.owner.id,
          name: yurt.owner.name,
          email: yurt.owner.email,
          phone: yurt.owner.phone,
        } : undefined,
      };
    }) || [];

  const orders: Order[] =
    ordersData?.orders?.edges?.map((edge: any) => {
      const firstItem = edge.node?.orderitem?.[0];
      const product = firstItem?.product || {};
      const images = product.images;
      const primaryImage = getPrimaryImage(images);

      return {
        id: edge.node.id,
        product: product.name || "Multiple items",
        seller: "Малчин",
        quantity: edge.node.orderitem?.reduce(
          (sum: number, item: any) => sum + (item.quantity || 0),
          0
        ) || 0,
        amount: parseFloat(edge.node.totalPrice) || 0,
        status: edge.node.status?.toLowerCase() || "pending",
        date: edge.node.createdAt?.split("T")[0] || edge.node.createdAt,
        image: primaryImage,
      };
    }) || [];

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

  const allBookings = [...bookings, ...travelBookings];

  // Calculate stats from real data
  const totalBookings = allBookings.length;
  const totalOrders = orders.length;
  const totalSpent =
    orders.reduce((sum: number, order: Order) => sum + order.amount, 0) +
    allBookings.reduce(
      (sum: number, booking: Booking) => sum + booking.amount,
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
      .reduce((sum: number, booking: Booking) => sum + booking.amount, 0);

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
      duration: `${edge.node.duration} days`,
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
                    ${totalSpent.toFixed(0)}
                  </div>
                  <p className="text-[10px] xs:text-xs text-muted-foreground font-medium mt-0.5">
                    Энэ сард +${monthlySpent.toFixed(0)}
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
                                  ${booking.amount}
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
                                ${order.amount}
                              </p>
                              <Badge
                                variant={
                                  order.status === "delivered"
                                    ? "default"
                                    : "secondary"
                                }
                                className="text-[10px] xs:text-xs font-medium mt-1"
                              >
                                {order.status}
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
              {user?.role === "user" && (
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
                            <div className="bg-gray-50 rounded-md p-2 sm:p-3 mb-3 space-y-1">
                              <p className="text-xs font-semibold text-gray-700">
                                Малчин: {booking.owner.name}
                              </p>
                              {booking.owner.phone && (
                                <p className="text-xs text-gray-600 font-medium">
                                  📞 {booking.owner.phone}
                                </p>
                              )}
                              {booking.owner.email && (
                                <p className="text-xs text-gray-600 truncate font-medium">
                                  ✉️ {booking.owner.email}
                                </p>
                              )}
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-base sm:text-lg md:text-xl font-bold">
                                ${booking.amount}
                              </span>
                              <span className="text-gray-600 ml-1 text-[10px] xs:text-xs sm:text-sm font-medium">
                                total
                              </span>
                            </div>
                            <span className="text-xs sm:text-sm text-gray-600 font-medium">
                              {booking.guests} guests
                            </span>
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
                              <p className="font-bold text-sm">${order.amount}</p>
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
                            </div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-600 mt-2 pt-2 border-t">
                            <span>Тоо: {order.quantity}</span>
                            <span>{order.date}</span>
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
                                  ${order.amount}
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
                                </TableCell>
                                <TableCell className="hidden md:table-cell font-medium text-xs md:text-sm">
                                  {order.date}
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
                bookings.length === 0 &&
                travelBookings.length === 0 &&
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
                          {item.type}
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
                          by {item.seller}
                        </p>
                      )}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                          <span className="text-sm font-semibold">
                            {item.rating}
                          </span>
                        </div>
                        <span className="text-xl font-bold">${item.price}</span>
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
                                {route.difficulty}
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
                                    {route.weatherSeason}
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
                                    Transportation:
                                  </span>
                                  <span className="text-right font-semibold">
                                    {route.transportation}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-gray-700 mb-2">
                                Accommodations
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
                              Attractions & Activities
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
                                          more
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
                                    Your Review
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
                              Created: {route.createdDate}
                            </span>
                            {route.completedDate && (
                              <span className="font-medium">
                                Completed: {route.completedDate}
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
                    Completed Routes
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
                    Planning
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
                    Total Days Planned
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    $
                    {travelRoutes.reduce(
                      (total: number, route: TravelRoute) =>
                        total + route.estimatedCost,
                      0
                    )}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    Total Investment
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
                          ${totalSpent.toFixed(0)}
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
    </div>
  );
}
