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
  CheckCircle,
  Navigation2,
  Map as MapIcon,
  Share2,
  MessageSquare,
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
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { getPrimaryImage, getFirstImage } from "@/lib/imageUtils";
import { ProfileSettings } from "@/components/profile-settings";
import { getLocalizedField } from "@/lib/localization";
import { useTranslatedValue, useTranslatedPrice } from "@/hooks/use-translation";
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
    startDate: string;
    endDate: string;
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

// --- Sub-components for Hook Compliance in Loops ---

interface BookingItemProps {
  booking: Booking;
  confirmedLabel: string;
  pendingLabel: string;
  activeLabel: string;
  approvedLabel: string;
  declinedLabel: string;
  cancelledLabel: string;
  completedLabel: string;
}

function BookingItem({ booking, ...statusLabels }: BookingItemProps) {
  const price = useTranslatedPrice(`booking[${booking.id}].amount`, booking.amount, "MNT");
  
  const getStatusDisplay = () => {
    switch (booking.status) {
      case "confirmed": return statusLabels.confirmedLabel;
      case "pending": return statusLabels.pendingLabel;
      case "active": return statusLabels.activeLabel;
      case "approved": return statusLabels.approvedLabel;
      case "declined": return statusLabels.declinedLabel;
      case "cancelled": return statusLabels.cancelledLabel;
      case "completed": return statusLabels.completedLabel;
      default: return booking.status;
    }
  };

  return (
    <div className="flex items-center space-x-2 sm:space-x-4">
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
          {price}
        </p>
        <Badge
          variant={booking.status === "confirmed" ? "default" : "secondary"}
          className={`text-[10px] xs:text-xs font-medium mt-1 ${booking.status === "confirmed" ? "bg-green-100 text-green-800" : ""}`}
        >
          {getStatusDisplay()}
        </Badge>
      </div>
    </div>
  );
}

interface OrderListItemProps {
  order: Order;
  statusLabels: Record<string, string>;
}

function OrderListItem({ order, statusLabels }: OrderListItemProps) {
  const price = useTranslatedPrice(`order[${order.id}].amount`, order.amount, "MNT");

  const getStatusDisplay = () => {
    switch (order.status.toLowerCase()) {
      case "delivered": return statusLabels.delivered;
      case "shipped": return statusLabels.shipped;
      case "paid": return statusLabels.paid;
      case "pending": return statusLabels.pending;
      case "approved": return statusLabels.approved;
      case "confirmed": return statusLabels.confirmed;
      case "cancelled": return statusLabels.cancelled;
      case "rejected": return statusLabels.rejected;
      default: return order.status;
    }
  };

  return (
    <div className="flex items-center space-x-2 sm:space-x-4">
      <img
        src={order.image || "/placeholder.svg"}
        alt={order.product}
        className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover flex-shrink-0"
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
        <p className="text-[10px] xs:text-xs text-gray-500 font-medium hidden xs:block">
          {order.date}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="font-bold text-xs sm:text-sm md:text-base whitespace-nowrap">
          {price}
        </p>
        <Badge
          variant={order.status === "delivered" ? "default" : "secondary"}
          className={`text-[10px] xs:text-xs font-medium mt-1 ${order.status === "delivered" ? "bg-green-100 text-green-800" : ""}`}
        >
          {getStatusDisplay()}
        </Badge>
      </div>
    </div>
  );
}

function FavoriteItem({ 
  item, 
  sellerLabel, 
  detailsLabel, 
  addToCartLabel, 
  campLabel, 
  productLabel 
}: { 
  item: Favorite; 
  sellerLabel: string; 
  detailsLabel: string; 
  addToCartLabel: string; 
  campLabel: string; 
  productLabel: string 
}) {
  const price = useTranslatedPrice(`favorite[${item.id}].price`, item.price, "MNT");
  
  return (
    <Card key={item.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
      <div className="relative aspect-[16/10] sm:aspect-video overflow-hidden">
        <img
          src={item.image || "/placeholder.svg"}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder.svg";
          }}
        />
        <div className="absolute top-2 right-2">
          <Badge className="bg-white/90 text-emerald-700 hover:bg-white border-none shadow-sm backdrop-blur-sm font-bold">
            {item.rating} <Star className="w-3 h-3 ml-1 fill-emerald-700" />
          </Badge>
        </div>
        <div className="absolute top-2 left-2">
          <Badge className="bg-emerald-600/90 text-white border-none shadow-sm backdrop-blur-sm font-bold">
            {item.type === "camp" ? campLabel : productLabel}
          </Badge>
        </div>
      </div>
      <CardContent className="p-3 sm:p-4">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-bold text-sm sm:text-base text-gray-900 truncate pr-2">
            {item.name}
          </h4>
          <span className="text-emerald-700 font-bold text-sm sm:text-base whitespace-nowrap">
            {price}
          </span>
        </div>
        <div className="flex items-center text-gray-500 text-[10px] xs:text-xs mb-3 font-medium">
          <MapPin className="w-3 h-3 mr-1" />
          <span className="truncate">{item.location}</span>
          <Separator orientation="vertical" className="h-2 mx-2" />
          <Package className="w-3 h-3 mr-1" />
          <span className="truncate">{sellerLabel}: {item.seller}</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 text-[10px] xs:text-xs h-8 sm:h-9 font-bold">
            {detailsLabel}
          </Button>
          <Button size="sm" className="flex-1 text-[10px] xs:text-xs h-8 sm:h-9 bg-emerald-600 hover:bg-emerald-700 font-bold">
            {addToCartLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface TravelBookingItemProps {
  booking: Booking;
  statusLabels: Record<string, string>;
  totalLabel: string;
  peopleLabel: string;
}

function TravelBookingItem({ booking, statusLabels, totalLabel, peopleLabel }: TravelBookingItemProps) {
  const price = useTranslatedPrice(`travelbook[${booking.id}].total`, booking.amount, "MNT");

  return (
    <div className="flex items-start space-x-3 sm:space-x-4 p-3 bg-gray-50/50 rounded-xl border border-gray-100">
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 shadow-sm">
        <img
          src={booking.image || "/placeholder.svg"}
          alt={booking.camp}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-bold text-sm sm:text-base text-gray-900 truncate">
              {booking.camp}
            </h4>
            <div className="flex items-center text-[10px] xs:text-xs text-gray-500 mt-0.5 font-medium">
              <MapPin className="w-3 h-3 mr-1" />
              <span className="truncate">{booking.location}</span>
            </div>
          </div>
          <Badge
            variant={booking.status === "confirmed" ? "default" : "secondary"}
            className={`text-[9px] xs:text-[10px] sm:text-xs font-bold ${booking.status === "confirmed" ? "bg-green-100 text-green-800" : ""}`}
          >
            {booking.status === "confirmed" ? statusLabels.confirmed : 
             booking.status === "pending" ? statusLabels.pending_short : 
             booking.status === "completed" ? statusLabels.completed :
             booking.status === "cancelled" ? statusLabels.cancelled : booking.status}
          </Badge>
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-3">
            <p className="text-[10px] xs:text-xs text-gray-500 font-medium bg-white px-2 py-1 rounded-md border border-gray-100">
              {booking.checkIn}
            </p>
            <span className="text-[10px] xs:text-xs text-gray-500 font-bold bg-white px-2 py-1 rounded-md border border-gray-100">
              {booking.guests} {peopleLabel}
            </span>
          </div>
          <div className="text-right">
            <p className="text-[9px] xs:text-[10px] text-gray-400 font-bold uppercase tracking-wider">{totalLabel}</p>
            <p className="font-bold text-sm sm:text-base text-emerald-700">{price}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface EventBookingItemProps {
  booking: EventBooking;
  statusLabels: Record<string, string>;
  totalLabel: string;
  checkingPayment: string | null;
  checkingLabel: string;
  checkPaymentLabel: string;
  onCheckPayment: (id: string) => void;
}

function EventBookingItem({ booking, statusLabels, totalLabel, checkingPayment, checkingLabel, checkPaymentLabel, onCheckPayment }: EventBookingItemProps) {
  const price = useTranslatedPrice(`eventbook[${booking.id}].total`, booking.totalPrice, "MNT");

  return (
    <div className="flex items-start space-x-3 sm:space-x-4 p-3 bg-gray-50/50 rounded-xl border border-gray-100">
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 shadow-sm">
        <img
          src={getFirstImage(booking.event.images)}
          alt={booking.event.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-bold text-sm sm:text-base text-gray-900 truncate">
              {booking.event.title}
            </h4>
            <div className="flex items-center text-[10px] xs:text-xs text-gray-500 mt-0.5 font-medium">
              <MapIcon className="w-3 h-3 mr-1" />
              <span className="truncate">{booking.event.location}</span>
            </div>
          </div>
          <Badge
            variant={booking.status === "PAID" || booking.status === "confirmed" ? "default" : "secondary"}
            className={`text-[9px] xs:text-[10px] sm:text-xs font-bold ${booking.status === "PAID" || booking.status === "confirmed" ? "bg-green-100 text-green-800" : ""}`}
          >
            {booking.status === "confirmed" || booking.status === "PAID" ? statusLabels.confirmed : 
             booking.status === "pending" ? statusLabels.pending_short : 
             booking.status === "completed" ? statusLabels.completed :
             booking.status === "cancelled" ? statusLabels.cancelled : booking.status}
          </Badge>
        </div>
        <div className="flex items-center justify-between mt-3">
          <p className="text-[10px] xs:text-xs text-gray-500 font-medium bg-white px-2 py-1 rounded-md border border-gray-100">
            {new Date(booking.event.startDate).toLocaleDateString()}
          </p>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[9px] xs:text-[10px] text-gray-400 font-bold uppercase tracking-wider">{totalLabel}</p>
              <p className="font-bold text-sm sm:text-base text-emerald-700">{price}</p>
            </div>
            {booking.status.toUpperCase() === "PENDING" && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 sm:h-8 text-[10px] sm:text-xs px-2 sm:px-3 font-bold border-amber-200 text-amber-700 hover:bg-amber-50"
                onClick={() => onCheckPayment(booking.id)}
                disabled={checkingPayment === booking.id}
              >
                {checkingPayment === booking.id ? (
                  <>
                    <RefreshCcw className="w-3 h-3 mr-1 animate-spin" />
                    {checkingLabel}
                  </>
                ) : (
                  checkPaymentLabel
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface CampBookingCardProps {
  booking: Booking;
  statusLabels: Record<string, string>;
  ownerLabels: Record<string, string>;
  commonLabels: Record<string, string>;
  checkingPayment: string | null;
  onCheckPayment: (id: string) => void;
  onSelect: (booking: Booking) => void;
}

function CampBookingCard({ booking, statusLabels, ownerLabels, commonLabels, checkingPayment, onCheckPayment, onSelect }: CampBookingCardProps) {
  const price = useTranslatedPrice(`booking[${booking.id}].amount`, booking.amount, "MNT");
  
  const getStatusDisplay = () => {
    switch (booking.status) {
      case "confirmed": return statusLabels.confirmed;
      case "pending": return statusLabels.pending;
      case "completed": return statusLabels.completed;
      case "cancelled": return statusLabels.cancelled;
      default: return booking.status;
    }
  };

  return (
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
            variant={booking.status === "confirmed" ? "default" : "secondary"}
            className={`text-[10px] sm:text-xs font-bold shadow-sm ${booking.status === "confirmed" ? "bg-green-100 text-green-800" : ""}`}
          >
            <span className="flex items-center">
              {getStatusDisplay()}
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

        {booking.owner && (
          <div className="bg-emerald-50 rounded-lg p-3 mb-4 border border-emerald-100">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                {ownerLabels.info}
              </h4>
              <Badge variant="outline" className="text-[10px] bg-white border-emerald-200 text-emerald-700">
                {commonLabels.herder}
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
                  {commonLabels.call}
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
                  {commonLabels.emailWrite}
                </Button>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
          <div>
            <span className="text-base sm:text-lg md:text-xl font-bold text-emerald-700">
              {price}
            </span>
            <span className="text-gray-500 ml-1 text-xs font-medium">
              {commonLabels.total}
            </span>
          </div>
          <div className="flex gap-2">
            {booking.status === "pending" && booking.qpayInvoiceId && (
              <Button
                variant="outline"
                size="sm"
                className="text-emerald-700 font-bold text-xs border-emerald-200 hover:bg-emerald-50"
                disabled={checkingPayment === booking.id}
                onClick={() => onCheckPayment(booking.id)}
              >
                <RefreshCcw className={`w-3 h-3 mr-1 ${checkingPayment === booking.id ? "animate-spin" : ""}`} />
                {checkingPayment === booking.id ? commonLabels.checking : commonLabels.checkPayment}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-emerald-700 font-bold text-xs"
              onClick={() => onSelect(booking)}
            >
              {commonLabels.details}
              <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface AttractionItemProps {
  attraction: any;
  moreLabel: string;
}

function AttractionItem({ attraction, moreLabel }: AttractionItemProps) {
  return (
    <div className="border rounded-lg p-3 bg-gray-50">
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
            +{attraction.activities.length - 2} {moreLabel}
          </Badge>
        )}
      </div>
    </div>
  );
}

interface TravelRouteItemProps {
  route: TravelRoute;
  statusLabels: Record<string, string>;
  difficultyLabels: Record<string, string>;
  seasonLabels: Record<string, string>;
  commonLabels: Record<string, string>;
  dashboardLabels: Record<string, string>;
  onSelect: (route: TravelRoute) => void;
  onReorder: (route: TravelRoute) => void;
  onConfirm: (route: TravelRoute) => void;
  onUse: (route: TravelRoute) => void;
  onViewMap: (route: TravelRoute) => void;
  onShare: (route: TravelRoute) => void;
  onWriteReview: (route: TravelRoute) => void;
}

function TravelRouteItem({
  route,
  statusLabels,
  difficultyLabels,
  seasonLabels,
  commonLabels,
  dashboardLabels,
  onSelect,
  onReorder,
  onConfirm,
  onUse,
  onViewMap,
  onShare,
  onWriteReview,
}: TravelRouteItemProps) {
  const price = useTranslatedPrice(`route[${route.id}].cost`, route.estimatedCost, "MNT");

  return (
    <div key={route.id} className="bg-white border rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all group">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4 sm:mb-6">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-emerald-700 transition-colors mb-2">
            {route.title}
          </h3>
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-500">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              <span className="font-medium">{route.duration}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="font-medium">{route.totalDistance}</span>
            </div>
            <div className="flex items-center">
              <Package className="w-4 h-4 mr-1" />
              <span className="font-medium">{price}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-2">
          <Badge
            variant={route.status === "completed" ? "default" : route.status === "planning" ? "secondary" : "outline"}
            className="font-medium"
          >
            {route.status === "saved" ? statusLabels.saved : route.status}
          </Badge>
          <Badge
            variant="outline"
            className={`font-medium ${route.difficulty === "extreme" ? "border-red-500 text-red-600" :
              route.difficulty === "challenging" ? "border-orange-500 text-orange-600" : "border-green-500 text-green-600"}`}
          >
            {route.difficulty === "extreme" ? difficultyLabels.extreme :
              route.difficulty === "challenging" ? difficultyLabels.challenging :
                route.difficulty === "moderate" ? difficultyLabels.moderate : difficultyLabels.easy}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <h4 className="font-bold text-sm text-gray-700 mb-2">{dashboardLabels.route_info}</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 font-medium">{commonLabels.season}:</span>
              <span className="capitalize font-semibold">
                {route.weatherSeason === "autumn" ? seasonLabels.autumn :
                  route.weatherSeason === "spring" ? seasonLabels.spring : route.weatherSeason}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 font-medium">{commonLabels.child_friendly}:</span>
              <span className={`font-semibold ${route.childFriendly ? "text-green-600" : "text-red-600"}`}>
                {route.childFriendly ? commonLabels.yes : commonLabels.no}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 font-medium">{commonLabels.transport}:</span>
              <span className="text-right font-semibold">
                {route.transportation === "Guided tour" ? commonLabels.guidedTour : route.transportation}
              </span>
            </div>
          </div>
        </div>
        <div>
          <h4 className="font-bold text-sm text-gray-700 mb-2">{dashboardLabels.accommodation}</h4>
          <div className="flex flex-wrap gap-1">
            {route.accommodations.map((acc: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs font-medium">{acc}</Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="font-bold text-sm text-gray-700 mb-3">{dashboardLabels.attractions_activities}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {route.attractions.map((attraction: any, index: number) => (
            <AttractionItem key={index} attraction={attraction} moreLabel={commonLabels.more} />
          ))}
        </div>
      </div>

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
              <span className="ml-2 text-sm font-semibold">{dashboardLabels.my_review}</span>
            </div>
            <p className="text-sm text-gray-700 font-medium">"{route.review}"</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t">
        <div className="flex flex-wrap gap-2">
          {route.status === "completed" ? (
            <Button onClick={() => onReorder(route)} variant="outline" size="sm" className="h-9 font-bold">
              <RefreshCcw className="w-4 h-4 mr-1.5" />
              {dashboardLabels.reorder_route}
            </Button>
          ) : route.status === "planning" ? (
            <Button onClick={() => onConfirm(route)} className="bg-emerald-600 hover:bg-emerald-700 h-9 font-bold">
              <CheckCircle className="w-4 h-4 mr-1.5" />
              {dashboardLabels.confirm_booking}
            </Button>
          ) : (
            <Button onClick={() => onUse(route)} className="bg-emerald-600 hover:bg-emerald-700 h-9 font-bold">
              <Navigation2 className="w-4 h-4 mr-1.5" />
              {dashboardLabels.use_route}
            </Button>
          )}
          <Button onClick={() => onViewMap(route)} variant="ghost" size="sm" className="h-9 font-bold text-gray-600">
            <MapIcon className="w-4 h-4 mr-1.5" />
            {dashboardLabels.view_on_map}
          </Button>
          <Button onClick={() => onShare(route)} variant="ghost" size="sm" className="h-9 font-bold text-gray-600">
            <Share2 className="w-4 h-4 mr-1.5" />
            {dashboardLabels.share_route}
          </Button>
        </div>
        <div className="flex flex-col items-end text-xs text-gray-400 font-medium">
          {route.status !== "completed" ? (
            <Button onClick={() => onWriteReview(route)} variant="ghost" size="sm" className="h-9 font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
              <MessageSquare className="w-4 h-4 mr-1.5" />
              {dashboardLabels.write_review}
            </Button>
          ) : (
            <>
              <span>{commonLabels.created}: {route.createdDate}</span>
              {route.completedDate && <span>{commonLabels.completed}: {route.completedDate}</span>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface TravelBookingCardProps {
  booking: Booking;
  statusLabels: Record<string, string>;
  commonLabels: Record<string, string>;
  peopleLabel: string;
}

function TravelBookingCard({ booking, statusLabels, commonLabels, peopleLabel }: TravelBookingCardProps) {
  const price = useTranslatedPrice(`travelbook[${booking.id}].total`, booking.amount, "MNT");
  
  const getStatusDisplay = () => {
    switch (booking.status) {
      case "confirmed": return statusLabels.confirmed;
      case "pending": return statusLabels.pending;
      case "completed": return statusLabels.completed;
      case "cancelled": return statusLabels.cancelled;
      default: return booking.status;
    }
  };

  return (
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
            variant={booking.status === "completed" ? "default" : booking.status === "confirmed" ? "secondary" : "outline"}
            className={`text-xs ml-2 font-medium ${booking.status === "confirmed" ? "bg-green-100 text-green-800 border-green-300" :
              booking.status === "pending" ? "bg-yellow-100 text-yellow-800 border-yellow-300" : ""}`}
          >
            {getStatusDisplay()}
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
              {price}
            </span>
            <span className="text-gray-600 ml-1 text-sm font-medium">
              {commonLabels.total}
            </span>
          </div>
          <span className="text-sm text-gray-600 font-medium">
            {booking.guests} {peopleLabel}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

interface OrderMobileCardProps {
  order: Order;
  checkingPayment: string | null;
  statusLabels: Record<string, string>;
  commonLabels: Record<string, string>;
  onCheckPayment: (id: string) => void;
  onSelect: (order: Order) => void;
}

function OrderMobileCard({ order, checkingPayment, statusLabels, commonLabels, onCheckPayment, onSelect }: OrderMobileCardProps) {
  const price = useTranslatedPrice(`order[${order.id}].total`, order.amount, "MNT");

  const getStatusDisplay = () => {
    switch (order.status.toLowerCase()) {
      case "delivered": return statusLabels.delivered;
      case "shipped": return statusLabels.shipped;
      case "paid": return statusLabels.paid;
      case "pending": return statusLabels.pending;
      case "approved": return statusLabels.approved;
      case "confirmed": return statusLabels.confirmed;
      case "cancelled": return statusLabels.cancelled;
      case "rejected": return statusLabels.rejected;
      default: return order.status;
    }
  };

  return (
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
            <p className="font-bold text-sm">{price}</p>
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
              {getStatusDisplay()}
            </Badge>
            {order.status === "pending" && order.qpayInvoiceId && (
              <div className="mt-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-[10px] h-7 text-emerald-700 w-full border-emerald-200"
                  disabled={checkingPayment === order.id}
                  onClick={() => onCheckPayment(order.id)}
                >
                  <RefreshCcw className={`w-2.5 h-2.5 mr-1 ${checkingPayment === order.id ? "animate-spin" : ""}`} />
                  {checkingPayment === order.id ? "..." : commonLabels.checkPayment}
                </Button>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-between items-center text-xs text-gray-600 mt-2 pt-2 border-t">
          <div className="flex gap-4">
            <span>{commonLabels.quantity}: {order.quantity}</span>
            <span>{order.date}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-emerald-700 font-bold p-0"
            onClick={() => onSelect(order)}
          >
            {commonLabels.details}
            <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface OrderTableRowProps {
  order: Order;
  checkingPayment: string | null;
  statusLabels: Record<string, string>;
  commonLabels: Record<string, string>;
  onCheckPayment: (id: string) => void;
  onSelect: (order: Order) => void;
}

function OrderTableRow({ order, checkingPayment, statusLabels, commonLabels, onCheckPayment, onSelect }: OrderTableRowProps) {
  const price = useTranslatedPrice(`order[${order.id}].amount`, order.amount, "MNT");

  const getStatusDisplay = () => {
    switch (order.status.toLowerCase()) {
      case "delivered": return statusLabels.delivered;
      case "shipped": return statusLabels.shipped;
      case "paid": return statusLabels.paid;
      case "pending": return statusLabels.pending;
      case "approved": return statusLabels.approved;
      case "confirmed": return statusLabels.confirmed;
      case "cancelled": return statusLabels.cancelled;
      case "rejected": return statusLabels.rejected;
      default: return order.status;
    }
  };

  return (
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
        {price}
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
          {getStatusDisplay()}
        </Badge>
        {order.status === "pending" && order.qpayInvoiceId && (
          <div className="mt-2">
            <Button
              size="sm"
              variant="outline"
              className="text-[10px] h-6 px-2 text-emerald-700 font-medium border-emerald-200"
              disabled={checkingPayment === order.id}
              onClick={() => onCheckPayment(order.id)}
            >
              <RefreshCcw className={`w-2.5 h-2.5 mr-1 ${checkingPayment === order.id ? "animate-spin" : ""}`} />
              {checkingPayment === order.id ? commonLabels.checking : commonLabels.checkPayment}
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
          onClick={() => onSelect(order)}
        >
          {commonLabels.details}
          <ChevronRight className="w-3 h-3 ml-1" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

export default function UserDashboardContent() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  // Translation Labels
  const noOrdersYetLabel = useTranslatedValue("dashboard.no_orders_yet", "Захиалга байхгүй");
  const noOrdersYetDescLabel = useTranslatedValue("dashboard.no_orders_yet_desc", "Та одоогоор ямар ч захиалга хийгээгүй байна.");
  const startLabel = useTranslatedValue("common.start", "Эхлэх");
  const savedCampsLabel = useTranslatedValue("dashboard.saved_camps", "Хадгалсан амралтууд");
  const clearAllLabel = useTranslatedValue("common.clear_all", "Бүгдийг цэвэрлэх");
  const campLabel = useTranslatedValue("common.camp", "Бааз");
  const productLabel = useTranslatedValue("common.product", "Бараа");
  const sellerLabel = useTranslatedValue("common.seller", "Борлуулагч");
  const detailsLabel = useTranslatedValue("common.details", "Дэлгэрэнгүй");
  const addToCartLabel = useTranslatedValue("common.add_to_cart", "Сагсанд нэмэх");
  const noSavedLabel = useTranslatedValue("dashboard.no_saved", "Хадгалсан амралт байхгүй");
  const noSavedDescLabel = useTranslatedValue("dashboard.no_saved_desc", "Та одоогоор ямар ч амралт хадгалаагүй байна.");
  const searchCampsLabel = useTranslatedValue("dashboard.search_camps", "Амралт хайх");
  const myRoutesLabel = useTranslatedValue("dashboard.my_routes", "Миний аяллын маршрут");
  const routesDescLabel = useTranslatedValue("dashboard.routes_desc", "Таны сонирхолд нийцсэн хувийн маршрут");
  const createRouteLabel = useTranslatedValue("dashboard.create_route", "Шинэ маршрут үүсгэх");
  const routeInfoLabel = useTranslatedValue("dashboard.route_info", "Аяллын мэдээлэл");
  const seasonLabel = useTranslatedValue("common.season", "Улирал");
  const childFriendlyLabel = useTranslatedValue("common.child_friendly", "Хүүхдэд ээлтэй");
  const transportLabel = useTranslatedValue("common.transport", "Тээвэр");
  const accommodationLabel = useTranslatedValue("dashboard.accommodation", "Байрлах газар");
  const attractionsActivitiesLabel = useTranslatedValue("dashboard.attractions_activities", "Үзэх газрууд & Үйл ажиллагаа");
  const moreLabel = useTranslatedValue("common.more", "илүү");
  const myReviewLabel = useTranslatedValue("dashboard.my_review", "Таны сэтгэгдэл");
  const reorderRouteLabel = useTranslatedValue("dashboard.reorder_route", "Ижил аялал захиалах");
  const confirmBookingLabelTop = useTranslatedValue("dashboard.confirm_booking", "Захиалгаа баталгаажуулах");
  const useRouteLabel = useTranslatedValue("dashboard.use_route", "Энэ маршрутыг ашиглах");
  const viewOnMapLabel = useTranslatedValue("dashboard.view_on_map", "Газрын зураг дээр харах");
  const shareRouteLabel = useTranslatedValue("dashboard.share_route", "Маршрутыг хуваалцах");
  const writeReviewLabel = useTranslatedValue("dashboard.write_review", "Сэтгэгдэл бичих");
  const createdLabel = useTranslatedValue("common.created", "Үүсгэсэн");
  const completedLabel = useTranslatedValue("common.completed", "Дууссан");
  const completedRoutesLabel = useTranslatedValue("dashboard.completed_routes", "Дууссан маршрут");
  const planningRoutesLabel = useTranslatedValue("dashboard.planning_routes", "Төлөвлөж буй");
  const totalDaysLabel = useTranslatedValue("dashboard.total_days", "Нийт аялсан хоног");
  const totalBudgetLabel = useTranslatedValue("dashboard.total_budget", "Нийт төсөв");
  const profileSettingsLabel = useTranslatedValue("profile.settings", "Профайл тохиргоо");
  const accountOverviewLabel = useTranslatedValue("dashboard.account_overview", "Дансны тойм");
  const totalBookingsStatLabel = useTranslatedValue("dashboard.stats.total_bookings", "Нийт захиалга");
  const totalOrdersStatLabel = useTranslatedValue("dashboard.stats.total_orders", "Нийт барааны захиалга");
  const totalSpentStatLabel = useTranslatedValue("dashboard.stats.total_spent", "Нийт зарцуулсан");
  const bookingDetailsLabel = useTranslatedValue("dashboard.booking_details", "Захиалгын дэлгэрэнгүй");
  const checkInLabel = useTranslatedValue("common.check_in", "Ирэх өдөр");
  const checkOutLabel = useTranslatedValue("common.check_out", "Гарах өдөр");
  const descriptionLabel = useTranslatedValue("common.description", "Тайлбар");
  const cancellationPolicyLabel = useTranslatedValue("common.cancellation_policy", "Цуцлалтын бодлого");
  const amenitiesLabel = useTranslatedValue("common.amenities", "Үйлчилгээ ба тав тух");
  const noAmenitiesLabel = useTranslatedValue("common.no_amenities", "Үйлчилгээний мэдээлэл байхгүй");
  const ownerContactLabel = useTranslatedValue("owner.contact", "Эзэмшигчтэй холбогдох");
  const phoneLabel = useTranslatedValue("common.phone", "Утасны дугаар");
  const emailLabel = useTranslatedValue("common.email", "Цахим шуудан");
  const orderDetailsLabel = useTranslatedValue("dashboard.order_details", "Захиалгын дэлгэрэнгүй");
  const orderIdLabel = useTranslatedValue("order.id", "Захиалга");
  const dateLabel = useTranslatedValue("common.date", "Огноо");
  const orderedItemsLabel = useTranslatedValue("dashboard.ordered_items", "Захиалсан бараанууд");
  const quantityLabel = useTranslatedValue("common.quantity", "Тоо");
  const unitPriceLabel = useTranslatedValue("common.unit_price", "Нэгж үнэ");
  const loadingLabel = useTranslatedValue("common.loading", "Ачаалж байна...");
  const successLabel = useTranslatedValue("payment.success", "Амжилттай");
  const warningLabel = useTranslatedValue("payment.warning", "Анхааруулга");
  const errorLabel = useTranslatedValue("common.error", "Алдаа");
  const checkErrorLabel = useTranslatedValue("payment.check_error", "Төлбөр шалгахад алдаа гарлаа");
  const confirmedDescLabel = useTranslatedValue("payment.confirmed_desc", "Таны төлбөр амжилттай, захиалгын төлөв CONFIRMED боллоо.");
  const paidDescLabel = useTranslatedValue("payment.paid_desc", "Таны төлбөр амжилттай, захиалгын төлөв PAID боллоо.");
  const notPaidDescLabel = useTranslatedValue("payment.not_paid_desc", "Төлбөр төлөгдөөгүй байна.");

  // Dashboard UI labels
  const dashboardTitleLabel = useTranslatedValue("dashboard.title", "Хэрэглэгчийн хянах самбар");
  const dashboardSubtitleLabel = useTranslatedValue("dashboard.subtitle", "Захиалга, бараа болон аяллын тохиргоогоо удирдах");
  const errorOccurredLabel = useTranslatedValue("common.error_occurred", "Алдаа гарлаа. Дахин оролдоно уу.");
  const bookingsErrorLabel = useTranslatedValue("dashboard.bookings", "Захиалга");
  const productsErrorLabel = useTranslatedValue("dashboard.products", "Бараа");
  const travelErrorLabel = useTranslatedValue("dashboard.travel", "Аялал");
  const logoutLabel = useTranslatedValue("common.logout", "Гарах");
  const overviewTabLabel = useTranslatedValue("dashboard.tab.overview", "Тойм");
  const bookingsTabLabel = useTranslatedValue("dashboard.tab.bookings", "Захиалга");
  const savedTabLabel = useTranslatedValue("dashboard.tab.saved", "Хадгалсан");
  const routesTabLabel = useTranslatedValue("dashboard.tab.routes", "Маршрут");
  const profileTabLabel = useTranslatedValue("dashboard.tab.profile", "Профайл");
  const thisMonthLabel = useTranslatedValue("dashboard.stats.this_month", "Энэ сард");
  const savedLabel = useTranslatedValue("dashboard.saved", "Хадгалсан");
  const upcomingBookingsLabel = useTranslatedValue("dashboard.upcoming_bookings", "Ирэх захиалгууд");
  const noUpcomingLabel = useTranslatedValue("dashboard.no_upcoming", "Ирэх захиалга байхгүй");
  const recentOrdersLabel = useTranslatedValue("dashboard.recent_orders", "Сүүлийн захиалгууд");
  const noOrdersLabel = useTranslatedValue("dashboard.no_orders", "Захиалга байхгүй");
  const myBookingsLabel = useTranslatedValue("dashboard.my_bookings", "Миний захиалгууд");
  const newBookingLabel = useTranslatedValue("dashboard.new_booking", "Шинэ бааз захиалах");
  const campBookingsLabel = useTranslatedValue("dashboard.camp_bookings", "Кемпийн буудлын захиалгууд");
  const ownerInfoLabel = useTranslatedValue("owner.info", "Эзэмшигчийн мэдээлэл");
  const herderLabel = useTranslatedValue("common.herder", "Малчин");
  const callLabel = useTranslatedValue("common.call", "Залгах");
  const emailWriteLabel = useTranslatedValue("common.email_write", "Мейл бичих");
  const totalLabel = useTranslatedValue("common.total", "Нийт");
  const checkingLabel = useTranslatedValue("common.checking", "Шалгаж байна...");
  const checkPaymentLabel = useTranslatedValue("common.check_payment", "Төлбөр шалгах");
  const eventBookingsLabel = useTranslatedValue("dashboard.event_bookings", "Арга хэмжээний захиалгууд");
  const travelBookingsLabel = useTranslatedValue("dashboard.travel_bookings", "Аяллын захиалгууд");
  const peopleLabel = useTranslatedValue("common.people", "хүн");
  const ordersLoadingLabel = useTranslatedValue("status.loading_orders", "Захиалга ачаалж байна...");
  const productOrdersLabel = useTranslatedValue("dashboard.product_orders", "Барааны захиалга");
  const statusSavedLabel = useTranslatedValue("status.saved", "Хадгалсан");
  const seasonAutumnLabel = useTranslatedValue("season.autumn", "Намар");
  const seasonSpringLabel = useTranslatedValue("season.spring", "Хавар");
  const yesLabel = useTranslatedValue("common.yes", "Тийм");
  const noLabel = useTranslatedValue("common.no", "Үгүй");
  const guidedTourLabel = useTranslatedValue("transport.guided", "Хөтөчтэй аялал");
  const difficultyExtremeLabel = useTranslatedValue("difficulty.extreme", "Маш хүнд");
  const difficultyChallengingLabel = useTranslatedValue("difficulty.challenging", "Хүнд");
  const difficultyModerateLabel = useTranslatedValue("difficulty.moderate", "Дунд зэрэг");
  const difficultyEasyLabel = useTranslatedValue("difficulty.easy", "Хялбар");
  const priceCommonLabel = useTranslatedValue("common.price_label", "Үнэ");

  // Status Labels
  const statusConfirmedLabel = useTranslatedValue("status.confirmed", "Баталгаажсан");
  const statusPendingLabel = useTranslatedValue("status.pending", "Хүлээгдэж байна");
  const statusActiveLabel = useTranslatedValue("status.active", "Идэвхтэй");
  const statusApprovedLabel = useTranslatedValue("status.approved", "Зөвшөөрсөн");
  const statusDeclinedLabel = useTranslatedValue("status.declined", "Татгалзсан");
  const statusCancelledLabel = useTranslatedValue("status.cancelled", "Цуцлагдсан");
  const statusCompletedLabel = useTranslatedValue("status.completed", "Дууссан");
  const statusDeliveredLabel = useTranslatedValue("status.delivered", "Хүргэгдсэн");
  const statusShippedLabel = useTranslatedValue("status.shipped", "Илгээгдсэн");
  const statusPaidLabel = useTranslatedValue("status.paid", "Төлөгдсөн");
  const statusRejectedLabel = useTranslatedValue("status.rejected", "Татгалзсан");
  const statusPendingShortLabel = useTranslatedValue("status.pending_short", "Хүлээгдэж байна");

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

  // Status Labels Mapper (no hook, uses top-level hook values)
  const getStatusLabel = (status: string | undefined) => {
    if (!status) return "";
    switch (status.toLowerCase()) {
      case "confirmed": return statusConfirmedLabel;
      case "pending": return statusPendingLabel;
      case "active": return statusActiveLabel;
      case "approved": return statusApprovedLabel;
      case "declined": return statusDeclinedLabel;
      case "cancelled": return statusCancelledLabel;
      case "completed": return statusCompletedLabel;
      case "delivered": return statusDeliveredLabel;
      case "shipped": return statusShippedLabel;
      case "paid": return statusPaidLabel;
      case "rejected": return statusRejectedLabel;
      case "pending_short": return statusPendingShortLabel;
      default: return status;
    }
  };

  const formatPrice = (amount: number) => `${amount.toLocaleString()}₮`;

  const [activeTab, setActiveTab] = useState("overview");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<TravelRoute | null>(null);
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
        toast({ title: successLabel, description: confirmedDescLabel, variant: "default" });
        refetchOrders();
      } else {
        toast({ title: warningLabel, description: notPaidDescLabel, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: errorLabel, description: err.message || checkErrorLabel, variant: "destructive" });
    } finally {
      setCheckingPayment(null);
    }
  };

  const handleCheckBookingPayment = async (bookingId: string) => {
    try {
      setCheckingPayment(bookingId);
      const { data } = await checkBookingPayment({ variables: { bookingId } });
      if (data?.checkQPayPaymentAndConfirmBooking?.status === "CONFIRMED") {
        toast({ title: successLabel, description: confirmedDescLabel, variant: "default" });
        refetchBookings();
      } else {
        toast({ title: warningLabel, description: notPaidDescLabel, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: errorLabel, description: err.message || checkErrorLabel, variant: "destructive" });
    } finally {
      setCheckingPayment(null);
    }
  };

  const handleCheckEventBookingPayment = async (bookingId: string) => {
    try {
      setCheckingPayment(bookingId);
      const { data } = await checkEventBookingPayment({ variables: { bookingId } });
      if (data?.checkQPayEventPaymentAndConfirm?.status === "PAID") {
        toast({ title: successLabel, description: paidDescLabel, variant: "default" });
        refetchEventBookings();
      } else {
        toast({ title: warningLabel, description: notPaidDescLabel, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: errorLabel, description: err.message || checkErrorLabel, variant: "destructive" });
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
          if (/^\d+$/.test(dateString)) {
            const timestamp = parseInt(dateString);
            const date = new Date(timestamp);
            return date.toLocaleDateString(currentLang === 'mn' ? 'mn-MN' : 'en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
          }
          const date = new Date(dateString);
          if (!isNaN(date.getTime())) {
            return date.toLocaleDateString(currentLang === 'mn' ? 'mn-MN' : 'en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
          }
          return dateString;
        } catch {
          return dateString;
        }
      };

      const translatedName = getLocalizedField(yurt, "name", currentLang);
      const translatedLoc = getLocalizedField(yurt, "location", currentLang);
      const translatedPrice = useTranslatedPrice(`booking[${edge.node.id}].price`, parseFloat(edge.node.totalPrice) || 0, "MNT");

      return {
        id: edge.node.id,
        camp: translatedName || "Unknown Camp",
        location: translatedLoc || "Unknown Location",
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
        description: getLocalizedField(yurt, "description", currentLang),
        amenities: getLocalizedField(yurt, "amenities", currentLang),
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
        product: getLocalizedField(product, "name", currentLang) || "Multiple items",
        seller: useTranslatedValue("common.seller_name", "Монгол"),
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
          name: getLocalizedField(item.product, "name", currentLang) || "Unknown Product",
          price: item.price || 0,
          quantity: item.quantity || 0,
          image: getPrimaryImage(item.product?.images),
          category: useTranslatedValue(`cat.${item.product?.category?.name}`, item.product?.category?.name || "Бараа"),
        })),
      };
    }) || [];

  const translateCategory = (cat: string | undefined) => {
    if (!cat) return "";
    const lower = cat.toLowerCase();
    if (lower.includes("dairy")) return useTranslatedValue("cat.dairy", "Сүүн бүтээгдэхүүн");
    if (lower.includes("handicraft")) return useTranslatedValue("cat.handicraft", "Гар урлал");
    if (lower.includes("meat")) return useTranslatedValue("cat.meat", "Махан бүтээгдэхүүн");
    return useTranslatedValue(`cat.${cat}`, cat);
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
        camp: getLocalizedField(travel, "name", currentLang) || "Unknown Travel",
        location: getLocalizedField(travel, "location", currentLang) || "Unknown Location",
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
          title: getLocalizedField(event, "title", currentLang) || "Unknown Event",
          location: getLocalizedField(event, "location", currentLang) || "Unknown Location",
          startDate: formatDateLocal(event.startDate || ""),
          endDate: formatDateLocal(event.endDate || ""),
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
      checkIn: `${eb.event.startDate} - ${eb.event.endDate}`,
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
            {useTranslatedValue("dashboard.title", "Хэрэглэгчийн хянах самбар")}
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm md:text-base font-medium mt-1">
            {useTranslatedValue("dashboard.subtitle", "Захиалга, бараа болон аяллын тохиргоогоо удирдах")}
          </p>
        </div>

        {/* Show errors if any */}
        {(bookingsError || ordersError || travelBookingsError) && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">
              {useTranslatedValue("common.error_occurred", "Алдаа гарлаа. Дахин оролдоно уу.")}
            </p>
            {bookingsError && <p className="text-sm text-red-600">{useTranslatedValue("dashboard.bookings", "Захиалга")}: {bookingsError.message}</p>}
            {ordersError && <p className="text-sm text-red-600">{useTranslatedValue("dashboard.products", "Бараа")}: {ordersError.message}</p>}
            {travelBookingsError && <p className="text-sm text-red-600">{useTranslatedValue("dashboard.travel", "Аялал")}: {travelBookingsError.message}</p>}
          </div>
        )}

        <div className="flex justify-end mb-3 sm:mb-4">
          <Button
            variant="outline"
            onClick={logout}
            className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-2"
          >
            <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">{useTranslatedValue("common.logout", "Гарах")}</span>
            <span className="xs:hidden">{useTranslatedValue("common.logout", "Гарах")}</span>
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
                <span>{useTranslatedValue("dashboard.tab.overview", "Тойм")}</span>
              </TabsTrigger>
              <TabsTrigger
                value="bookings"
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-[10px] xs:text-xs sm:text-sm font-bold min-w-[70px] sm:min-w-0 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-700 transition-all"
              >
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{useTranslatedValue("dashboard.tab.bookings", "Захиалга")}</span>
              </TabsTrigger>
              <TabsTrigger
                value="favorites"
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-[10px] xs:text-xs sm:text-sm font-bold min-w-[70px] sm:min-w-0 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-700 transition-all"
              >
                <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{useTranslatedValue("dashboard.tab.saved", "Хадгалсан")}</span>
              </TabsTrigger>
              <TabsTrigger
                value="routes"
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-[10px] xs:text-xs sm:text-sm font-bold min-w-[70px] sm:min-w-0 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-700 transition-all"
              >
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{useTranslatedValue("dashboard.tab.routes", "Маршрут")}</span>
              </TabsTrigger>
              <TabsTrigger
                value="profile"
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-[10px] xs:text-xs sm:text-sm font-bold min-w-[70px] sm:min-w-0 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-700 transition-all"
              >
                <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{useTranslatedValue("dashboard.tab.profile", "Профайл")}</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                  <CardTitle className="text-[10px] xs:text-xs sm:text-sm font-semibold leading-tight">
                    {useTranslatedValue("dashboard.stats.total_bookings", "Нийт захиалга")}
                  </CardTitle>
                  <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                </CardHeader>
                <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                  <div className="text-lg xs:text-xl sm:text-2xl font-bold">
                    {totalBookings}
                  </div>
                  <p className="text-[10px] xs:text-xs text-muted-foreground font-medium mt-0.5">
                    {useTranslatedValue("dashboard.stats.this_month", "Энэ сард")} +{monthlyBookings}
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                  <CardTitle className="text-[10px] xs:text-xs sm:text-sm font-semibold leading-tight">
                    {useTranslatedValue("dashboard.stats.total_orders", "Барааны захиалга")}
                  </CardTitle>
                  <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                </CardHeader>
                <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                  <div className="text-lg xs:text-xl sm:text-2xl font-bold">
                    {totalOrders}
                  </div>
                  <p className="text-[10px] xs:text-xs text-muted-foreground font-medium mt-0.5">
                    {useTranslatedValue("dashboard.stats.this_month", "Энэ сард")} +{monthlyOrders}
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                  <CardTitle className="text-[10px] xs:text-xs sm:text-sm font-semibold leading-tight">
                    {useTranslatedValue("dashboard.stats.total_spent", "Нийт зарцуулсан")}
                  </CardTitle>
                  <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                </CardHeader>
                <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                  <div className="text-lg xs:text-xl sm:text-2xl font-bold">
                    {useTranslatedPrice("dashboard.total_spent", totalSpent, "MNT")}
                  </div>
                  <p className="text-[10px] xs:text-xs text-muted-foreground font-medium mt-0.5">
                    {useTranslatedValue("dashboard.stats.this_month", "Энэ сард")} +{useTranslatedPrice("dashboard.monthly_spent", monthlySpent, "MNT")}
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                  <CardTitle className="text-[10px] xs:text-xs sm:text-sm font-semibold leading-tight">
                    {useTranslatedValue("dashboard.saved", "Хадгалсан")}
                  </CardTitle>
                  <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                </CardHeader>
                <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                  <div className="text-lg xs:text-xl sm:text-2xl font-bold">
                    {favorites.length}
                  </div>
                  <p className="text-[10px] xs:text-xs text-muted-foreground font-medium mt-0.5">
                    {useTranslatedValue("dashboard.saved", "Хадгалсан")}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card className="shadow-sm">
                <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
                  <CardTitle className="text-base sm:text-lg md:text-xl font-bold">
                    {useTranslatedValue("dashboard.upcoming_bookings", "Ирэх захиалгууд")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                  {bookingsLoading ? (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      {useTranslatedValue("common.loading", "Уншиж байна...")}
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
                          {useTranslatedValue("dashboard.no_upcoming", "Ирэх захиалга байхгүй")}
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
                            <BookingItem
                              key={booking.id}
                              booking={booking}
                              confirmedLabel={statusConfirmedLabel}
                              pendingLabel={statusPendingLabel}
                              activeLabel={statusActiveLabel}
                              approvedLabel={statusApprovedLabel}
                              declinedLabel={statusDeclinedLabel}
                              cancelledLabel={statusCancelledLabel}
                              completedLabel={statusCompletedLabel}
                            />
                          ))
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
                  <CardTitle className="text-base sm:text-lg md:text-xl font-bold">
                    {useTranslatedValue("dashboard.recent_orders", "Сүүлийн захиалгууд")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                  {ordersLoading ? (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      {useTranslatedValue("common.loading", "Уншиж байна...")}
                    </div>
                  ) : (
                    <div className="space-y-3 sm:space-y-4">
                      {orders.length === 0 ? (
                        <p className="text-center text-gray-500 py-4 text-sm">
                          {useTranslatedValue("dashboard.no_orders", "Захиалга байхгүй")}
                        </p>
                      ) : (
                        orders.slice(0, 3).map((order: Order) => (
                          <OrderListItem
                            key={order.id}
                            order={order}
                            statusLabels={{
                              delivered: statusDeliveredLabel,
                              shipped: statusShippedLabel,
                              paid: statusPaidLabel,
                              pending: statusPendingLabel,
                              approved: statusApprovedLabel,
                              confirmed: statusConfirmedLabel,
                              cancelled: statusCancelledLabel,
                              rejected: statusRejectedLabel,
                            }}
                          />
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
                {useTranslatedValue("dashboard.my_bookings", "Миний захиалгууд")}
              </h2>
              {user?.role === "TRAVELER" && (
                <Link href="/camps" className="w-full sm:w-auto">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto font-semibold text-sm sm:text-base px-4 py-2">
                    {useTranslatedValue("dashboard.new_booking", "Шинэ бааз захиалах")}
                  </Button>
                </Link>
              )}
            </div>

            {/* All Bookings Combined */}
            <div className="space-y-4 sm:space-y-6">
              {/* Camp Bookings */}
              {bookingsLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">{useTranslatedValue("common.loading", "Захиалгуудыг уншиж байна...")}</p>
                </div>
              ) : bookings.length > 0 ? (
                <div>
                  <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">
                    {useTranslatedValue("dashboard.camp_bookings", "Амралт баазын захиалгууд")}
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
                                  ? useTranslatedValue("status.confirmed", "Баталгаажсан")
                                  : booking.status === "pending"
                                    ? useTranslatedValue("status.pending", "Хүлээгдэж буй")
                                    : booking.status === "completed"
                                      ? useTranslatedValue("status.completed", "Дууссан")
                                      : booking.status === "cancelled"
                                        ? useTranslatedValue("status.cancelled", "Цуцлагдсан")
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
                                  {useTranslatedValue("owner.info", "Эзэмшигчийн мэдээлэл")}
                                </h4>
                                <Badge variant="outline" className="text-[10px] bg-white border-emerald-200 text-emerald-700">
                                  {useTranslatedValue("common.herder", "Малчин")}
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
                                    {useTranslatedValue("common.call", "Залгах")}
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
                                    {useTranslatedValue("common.email_write", "Мэйл бичих")}
                                  </Button>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                            <div>
                              <span className="text-base sm:text-lg md:text-xl font-bold text-emerald-700">
                                {useTranslatedPrice(`booking[${booking.id}].amount`, booking.amount, "MNT")}
                              </span>
                              <span className="text-gray-500 ml-1 text-xs font-medium">
                                {useTranslatedValue("common.total", "нийт")}
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
                                  {checkingPayment === booking.id ? useTranslatedValue("common.checking", "Шалгаж байна...") : useTranslatedValue("payment.check_payment", "Төлбөр шалгах")}
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-600 hover:text-emerald-700 font-bold text-xs"
                                onClick={() => setSelectedBooking(booking)}
                              >
                                {useTranslatedValue("common.details", "Дэлгэрэнгүй")}
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
                  <p className="text-gray-500">{useTranslatedValue("common.loading", "Арга хэмжээний захиалгуудыг уншиж байна...")}</p>
                </div>
              ) : eventBookings.length > 0 ? (
                <div>
                  <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">
                    {useTranslatedValue("dashboard.event_bookings", "Арга хэмжээний захиалгууд")}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                    {eventBookings.map((booking: EventBooking) => (
                      <EventBookingItem
                        key={booking.id}
                        booking={booking}
                        statusLabels={{
                          confirmed: statusConfirmedLabel,
                          pending_short: statusPendingShortLabel,
                          completed: statusCompletedLabel,
                          cancelled: statusCancelledLabel,
                        }}
                        totalLabel={totalLabel}
                        checkingPayment={checkingPayment}
                        checkingLabel={checkingLabel}
                        checkPaymentLabel={checkPaymentLabel}
                        onCheckPayment={handleCheckEventBookingPayment}
                      />
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Travel Bookings */}
              {travelBookingsLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">{useTranslatedValue("common.loading", "Аяллын захиалгуудыг уншиж байна...")}</p>
                </div>
              ) : travelBookings.length > 0 ? (
                <div>
                  <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">{useTranslatedValue("dashboard.travel_bookings", "Аяллын захиалгууд")}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                    {travelBookings.map((booking: Booking) => (
                      <TravelBookingCard
                        key={booking.id}
                        booking={booking}
                        statusLabels={{
                          confirmed: statusConfirmedLabel,
                          pending: statusPendingLabel,
                          completed: statusCompletedLabel,
                          cancelled: statusCancelledLabel,
                        }}
                        commonLabels={{
                          total: totalLabel,
                        }}
                        peopleLabel={peopleLabel}
                      />
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Product Orders */}
              {ordersLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">{useTranslatedValue("status.loading_orders", "Барааны захиалгуудыг уншиж байна...")}</p>
                </div>
              ) : orders.length > 0 ? (
                <div>
                  <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">{useTranslatedValue("dashboard.product_orders", "Барааны захиалгууд")}</h3>

                  {/* Mobile: Card Layout */}
                  <div className="sm:hidden space-y-3">
                    {orders.map((order: Order) => (
                      <OrderMobileCard
                        key={order.id}
                        order={order}
                        checkingPayment={checkingPayment}
                        statusLabels={{
                          delivered: statusDeliveredLabel,
                          shipped: statusShippedLabel,
                          paid: statusPaidLabel,
                          pending: statusPendingLabel,
                          approved: statusApprovedLabel,
                          confirmed: statusConfirmedLabel,
                          cancelled: statusCancelledLabel,
                          rejected: statusRejectedLabel,
                        }}
                        commonLabels={{
                          checkPayment: useTranslatedValue("status.check_payment", "Төлбөр шалгах"),
                          quantity: useTranslatedValue("common.quantity", "Тоо"),
                          details: useTranslatedValue("common.details", "Дэлгэрэнгүй"),
                        }}
                        onCheckPayment={handleCheckOrderPayment}
                        onSelect={setSelectedOrder}
                      />
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
                                {useTranslatedValue("order.id", "Захиалгын №")}
                              </TableHead>
                              <TableHead className="min-w-[150px] font-semibold text-xs md:text-sm">
                                {useTranslatedValue("order.product", "Бараа")}
                              </TableHead>
                              <TableHead className="min-w-[120px] font-semibold text-xs md:text-sm">
                                {useTranslatedValue("order.seller", "Борлуулагч")}
                              </TableHead>
                              <TableHead className="font-semibold text-xs md:text-sm">
                                {useTranslatedValue("common.quantity", "Тоо")}
                              </TableHead>
                              <TableHead className="font-semibold text-xs md:text-sm">
                                {useTranslatedValue("common.amount", "Дүн")}
                              </TableHead>
                              <TableHead className="font-semibold text-xs md:text-sm">
                                {useTranslatedValue("common.status", "Төлөв")}
                              </TableHead>
                              <TableHead className="hidden md:table-cell font-semibold text-xs md:text-sm">
                                {useTranslatedValue("common.date", "Огноо")}
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {orders.map((order: Order) => (
                              <OrderTableRow
                                key={order.id}
                                order={order}
                                checkingPayment={checkingPayment}
                                statusLabels={{
                                  delivered: statusDeliveredLabel,
                                  shipped: statusShippedLabel,
                                  paid: statusPaidLabel,
                                  pending: statusPendingLabel,
                                  approved: statusApprovedLabel,
                                  confirmed: statusConfirmedLabel,
                                  cancelled: statusCancelledLabel,
                                  rejected: statusRejectedLabel,
                                }}
                                commonLabels={{
                                  checkPayment: useTranslatedValue("status.check_payment", "Төлбөр шалгах"),
                                  checking: useTranslatedValue("common.checking", "Шалгаж байна..."),
                                  details: useTranslatedValue("common.details", "Дэлгэрэнгүй"),
                                }}
                                onCheckPayment={handleCheckOrderPayment}
                                onSelect={setSelectedOrder}
                              />
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
                      {useTranslatedValue("dashboard.no_orders_yet", "Захиалга байхгүй")}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {useTranslatedValue("dashboard.no_orders_yet_desc", "Та одоогоор ямар ч захиалга хийгээгүй байна.")}
                    </p>
                    <Link href="/listings">
                      <Button className="bg-emerald-600 hover:bg-emerald-700 font-semibold">
                        {useTranslatedValue("common.start", "Эхлэх")}
                      </Button>
                    </Link>
                  </div>
                )}
            </div>
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl sm:text-2xl font-bold">
                {useTranslatedValue("dashboard.saved_camps", "Хадгалсан амралтууд")}
              </h2>
              <Button
                variant="outline"
                className="w-full sm:w-auto bg-transparent font-semibold"
                onClick={() => {
                  localStorage.removeItem("savedCamps");
                  window.location.reload();
                }}
              >
                {useTranslatedValue("common.clear_all", "Бүгдийг цэвэрлэх")}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {favorites.length > 0 ? (
                favorites.map((item: Favorite) => (
                  <FavoriteItem
                    key={item.id}
                    item={item}
                    sellerLabel={useTranslatedValue("common.seller", "Борлуулагч")}
                    detailsLabel={useTranslatedValue("common.details", "Дэлгэрэнгүй")}
                    addToCartLabel={useTranslatedValue("common.add_to_cart", "Сагсанд нэмэх")}
                    campLabel={useTranslatedValue("common.camp", "Бааз")}
                    productLabel={useTranslatedValue("common.product", "Бараа")}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    {useTranslatedValue("dashboard.no_saved", "Хадгалсан амралт байхгүй")}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {useTranslatedValue("dashboard.no_saved_desc", "Та одоогоор ямар ч амралт хадгалаагүй байна.")}
                  </p>
                  <Link href="/camps">
                    <Button className="bg-emerald-600 hover:bg-emerald-700 font-semibold">
                      {useTranslatedValue("dashboard.search_camps", "Амралт хайх")}
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
                  {useTranslatedValue("dashboard.my_routes", "Миний аяллын маршрут")}
                </h2>
                <p className="text-gray-600 text-sm font-medium">
                  {useTranslatedValue("dashboard.routes_desc", "Таны сонирхолд нийцсэн хувийн маршрут")}
                </p>
              </div>
              <Button className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto font-semibold">
                {useTranslatedValue("dashboard.create_route", "Шинэ маршрут үүсгэх")}
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {travelRoutes.map((route: TravelRoute) => (
                <TravelRouteItem
                  key={route.id}
                  route={route}
                  statusLabels={{
                    saved: statusSavedLabel,
                  }}
                  difficultyLabels={{
                    extreme: useTranslatedValue("difficulty.extreme", "Маш хүнд"),
                    challenging: useTranslatedValue("difficulty.challenging", "Хүнд"),
                    moderate: useTranslatedValue("difficulty.moderate", "Дунд зэрэг"),
                    easy: useTranslatedValue("difficulty.easy", "Хялбар"),
                  }}
                  seasonLabels={{
                    autumn: seasonAutumnLabel,
                    spring: seasonSpringLabel,
                  }}
                  commonLabels={{
                    season: useTranslatedValue("common.season", "Улирал"),
                    child_friendly: useTranslatedValue("common.child_friendly", "Хүүхдэд ээлтэй"),
                    transport: useTranslatedValue("common.transport", "Тээвэр"),
                    yes: yesLabel,
                    no: noLabel,
                    guidedTour: guidedTourLabel,
                    more: useTranslatedValue("common.more", "илүү"),
                    created: useTranslatedValue("common.created", "Үүсгэсэн"),
                    completed: useTranslatedValue("common.completed", "Дууссан"),
                  }}
                  dashboardLabels={{
                    route_info: useTranslatedValue("dashboard.route_info", "Аяллын мэдээлэл"),
                    accommodation: useTranslatedValue("dashboard.accommodation", "Байрлах газар"),
                    attractions_activities: useTranslatedValue("dashboard.attractions_activities", "Үзэх газрууд & Үйл ажиллагаа"),
                    my_review: useTranslatedValue("dashboard.my_review", "Таны сэтгэгдэл"),
                    reorder_route: useTranslatedValue("dashboard.reorder_route", "Ижил аялал захиалах"),
                    confirm_booking: useTranslatedValue("dashboard.confirm_booking", "Захиалгаа баталгаажуулах"),
                    use_route: useTranslatedValue("dashboard.use_route", "Маршрут ашиглах"),
                    view_on_map: useTranslatedValue("dashboard.view_on_map", "Газрын зураг дээр харах"),
                    share_route: useTranslatedValue("dashboard.share_route", "Маршрут хуваалцах"),
                    write_review: useTranslatedValue("dashboard.write_review", "Сэтгэгдэл бичих"),
                  }}
                  onSelect={setSelectedRoute}
                  onReorder={(r) => console.log("Reorder", r)}
                  onConfirm={(r) => console.log("Confirm", r)}
                  onUse={(r) => console.log("Use", r)}
                  onViewMap={(r) => console.log("View Map", r)}
                  onShare={(r) => console.log("Share", r)}
                  onWriteReview={(r) => console.log("Write review", r)}
                />
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
                    {useTranslatedValue("dashboard.completed_routes", "Дууссан маршрут")}
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
                    {useTranslatedValue("dashboard.planning_routes", "Төлөвлөж буй")}
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
                    {useTranslatedValue("dashboard.total_days", "Нийт аялсан хоног")}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {useTranslatedPrice("dashboard.total_budget", travelRoutes.reduce(
                      (total: number, route: TravelRoute) =>
                        total + route.estimatedCost,
                      0
                    ), "MNT")}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    {useTranslatedValue("dashboard.total_budget", "Нийт төсөв")}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold">{useTranslatedValue("profile.settings", "Профайл тохиргоо")}</h2>

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
                      <CardTitle className="font-bold">{useTranslatedValue("dashboard.account_overview", "Дансны тойм")}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 font-medium">
                          {useTranslatedValue("dashboard.stats.total_bookings", "Нийт захиалга")}
                        </span>
                        <span className="font-semibold">{totalBookings}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 font-medium">
                          {useTranslatedValue("dashboard.stats.total_orders", "Нийт барааны захиалга")}
                        </span>
                        <span className="font-semibold">{totalOrders}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 font-medium">
                          {useTranslatedValue("dashboard.stats.total_spent", "Нийт зарцуулсан")}
                        </span>
                        <span className="font-semibold">
                          {useTranslatedPrice("dashboard.total_spent_val", totalSpent, "MNT")}
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
              {useTranslatedValue("dashboard.booking_details", "Захиалгын дэлгэрэнгүй")}
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
                    {useTranslatedPrice("common.price", selectedBooking.amount, "MNT")}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 font-bold uppercase mb-1">{useTranslatedValue("common.check_in", "Ирэх өдөр")}</p>
                  <p className="font-semibold text-gray-900">{selectedBooking.checkIn}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 font-bold uppercase mb-1">{useTranslatedValue("common.check_out", "Гарах өдөр")}</p>
                  <p className="font-semibold text-gray-900">{selectedBooking.checkOut}</p>
                </div>
              </div>

              {selectedBooking.description && (
                <div className="space-y-2">
                  <h3 className="font-bold text-gray-900">{useTranslatedValue("common.description", "Тайлбар")}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed font-medium">
                    {selectedBooking.description}
                  </p>
                </div>
              )}

              {(() => {
                const ams = parseAmenities(selectedBooking.amenities);
                return ams.policies?.cancellation && (
                  <div className="space-y-2">
                    <h3 className="font-bold text-gray-900">{useTranslatedValue("common.cancellation_policy", "Цуцлалтын бодлого")}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed font-medium whitespace-pre-line bg-gray-50 p-3 rounded-lg border border-gray-100">
                      {([...(policiesOptions.cancellationPolicy || [])].find(o => o.value === ams.policies.cancellation)?.label) || ams.policies.cancellation}
                    </p>
                  </div>
                );
              })()}

              {selectedBooking.amenities && (
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900">{useTranslatedValue("common.amenities", "Үйлчилгээ ба тав тух")}</h3>
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
                        <p className="text-sm text-gray-500">{useTranslatedValue("common.no_amenities", "Үйлчилгээний мэдээлэл байхгүй")}</p>
                      );
                    })()}
                  </div>
                </div>
              )}

              {selectedBooking.owner && (
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <h3 className="font-bold text-emerald-900 mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    {useTranslatedValue("owner.contact", "Эзэмшигчтэй холбогдох")}
                  </h3>
                  <div className="flex flex-col gap-3">
                    {selectedBooking.owner.phone && (
                      <div className="flex flex-col gap-1">
                        <p className="text-xs text-emerald-800/70 font-bold uppercase ml-1">{useTranslatedValue("common.phone", "Утасны дугаар")}</p>
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
                        <p className="text-xs text-emerald-800/70 font-bold uppercase ml-1">{useTranslatedValue("common.email", "Цахим шуудан")}</p>
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
              {useTranslatedValue("dashboard.order_details", "Захиалгын дэлгэрэнгүй")}
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-gray-900">{useTranslatedValue("order.id", "Захиалга")} #{selectedOrder.id.substring(0, 8)}</h2>
                  <p className="text-sm text-gray-500 font-medium">{useTranslatedValue("common.date", "Огноо")}: {selectedOrder.date}</p>
                </div>
                <div className="text-left sm:text-right">
                  <Badge className={`px-3 py-1 font-bold ${selectedOrder.status === "paid" || selectedOrder.status === "delivered" ? "bg-green-500" : "bg-amber-500"
                    }`}>
                    {selectedOrder.status.toUpperCase()}
                  </Badge>
                  <div className="text-lg font-black text-emerald-700 mt-1">
                    {useTranslatedPrice(`order[${selectedOrder.id}].total`, selectedOrder.amount, "MNT")}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-bold text-gray-900">{useTranslatedValue("dashboard.ordered_items", "Захиалсан бараанууд")}</h3>
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
                          <span className="text-xs text-gray-500 font-medium">{useTranslatedValue("common.quantity", "Тоо")}: {item.quantity}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{useTranslatedPrice(`item[${idx}].price`, item.price, "MNT")}</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase">{useTranslatedValue("common.unit_price", "Нэгж үнэ")}</p>
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
