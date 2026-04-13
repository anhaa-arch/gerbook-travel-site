"use client";

import { use, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { gql, useQuery, useMutation } from "@apollo/client";
import { parseImagePaths, getPrimaryImage } from "@/lib/imageUtils";
import { getLocalizedField } from "@/lib/localization";
import {
  amenitiesOptions,
  activitiesOptions,
  accommodationTypes,
  facilitiesOptions,
  policiesOptions,
} from "@/data/camp-options";
import {
  ArrowLeft,
  Star,
  MapPin,
  Users,
  Wifi,
  Car,
  Utensils,
  Shield,
  Calendar,
  Heart,
  Share2,
  MessageCircle,
  Camera,
  Check,
  X,
  ShoppingBag,
  Home,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import "../../../lib/i18n";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useSaved } from "@/hooks/use-saved";
import {
  CREATE_BOOKING,
  GET_user_BOOKINGS,
} from "@/app/user-dashboard/queries";
import { DatePickerModal } from "@/components/search/date-picker-modal";
import { PaymentModal } from "@/components/payment-modal";
import { CommentSection } from "@/components/comment-section";

const GET_YURT = gql`
  query GetYurt($id: ID!) {
    yurt(id: $id) {
      id
      name
      name_en
      name_ko
      description
      description_en
      description_ko
      location
      location_en
      location_ko
      pricePerNight
      capacity
      amenities
      amenities_en
      amenities_ko
      images
      isFeatured
      ownerId
      owner {
        id
        name
        role
        hostBio
        hostExperience
        hostLanguages
      }
      ownerPhone
      ownerEmail
      createdAt
      updatedAt
      bookings {
        id
        startDate
        endDate
        status
        totalPrice
        user {
          id
          name
        }
      }
    }
  }
`;

interface CampDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function CampDetailPage({ params }: CampDetailPageProps) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { isSaved: checkIsSaved, toggleSave } = useSaved();
  const router = useRouter();
  const searchParams = useSearchParams();
  const resolvedParams = use(params);
  const campId = resolvedParams.id;

  const isSaved = checkIsSaved(campId, "camp");

  const { data, loading, error } = useQuery(GET_YURT, {
    variables: { id: campId },
    skip: !campId,
    errorPolicy: "all",
    fetchPolicy: "cache-and-network", // Always fetch fresh data
    nextFetchPolicy: "cache-first",
  });

  // Use state for checkIn, checkOut, and guests
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);

  // Auto-prefill from URL search params
  useEffect(() => {
    const checkInParam = searchParams.get("checkIn");
    const checkOutParam = searchParams.get("checkOut");
    const guestsParam = searchParams.get("guests");

    if (checkInParam) setCheckIn(checkInParam);
    if (checkOutParam) setCheckOut(checkOutParam);
    if (guestsParam) {
      const g = parseInt(guestsParam);
      if (!isNaN(g)) setGuests(g);
    }
    
    console.log('✅ Prefilled from search params:', { checkInParam, checkOutParam, guestsParam });
  }, [searchParams]);

  const [createBooking, { loading: bookingLoading, error: bookingError }] =
    useMutation(CREATE_BOOKING, {
      refetchQueries: [
        {
          query: GET_user_BOOKINGS,
          variables: { userId: user?.id },
        },
        {
          query: GET_YURT,
          variables: { id: campId },
        },
      ],
      awaitRefetchQueries: true,
      onCompleted: (data) => {
        // Store booking in localStorage
        const userBookings = JSON.parse(
          localStorage.getItem("userBookings") || "[]"
        );
        userBookings.push({
          id: data.createBooking.id,
          yurtId: data.createBooking.yurt.id,
          yurtName: data.createBooking.yurt.name,
          location: data.createBooking.yurt.location,
          startDate: data.createBooking.startDate,
          endDate: data.createBooking.endDate,
          totalPrice: data.createBooking.totalPrice,
          status: data.createBooking.status,
          createdAt: data.createBooking.createdAt,
          userId: user?.id,
        });
        localStorage.setItem("userBookings", JSON.stringify(userBookings));

        toast({
          title: "✅ Захиалга амжилттай",
          description: "Төлбөр хийхэд бэлэн боллоо.",
        });

        // Store the booking ID and open payment modal
        setCurrentBookingId(data.createBooking.id);
        setShowPaymentModal(true);
      },
      onError: (error) => {
        console.error('❌ Booking error:', error);

        let errorMessage = "Захиалга үүсгэхэд алдаа гарлаа.";

        if (error.message.includes("not available")) {
          errorMessage = "Таны сонгосон огноо захиалагдсан байна. Өөр огноо сонгоно уу.";
        } else if (error.message.includes("End date must be after start date")) {
          errorMessage = "Гарах өдөр ирэх өдрөөс хойш байх ёстой.";
        } else if (error.message.includes("Not authorized")) {
          errorMessage = "Та захиалга хийх эрхгүй байна.";
        } else if (error.message.includes("Yurt not found")) {
          errorMessage = "Camp олдсонгүй. Дахин оролдоно уу.";
        } else {
          errorMessage = error.message || errorMessage;
        }

        toast({
          title: "❌ Захиалга амжилтгүй",
          description: errorMessage,
          variant: "destructive",
        });
      },
    });

  const camp = data?.yurt;

  const [selectedImage, setSelectedImage] = useState(0);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState<string | null>(null);

  // Calculate disabled dates from bookings
  const getDisabledDates = (): Date[] => {
    if (!camp?.bookings) {
      console.log('⚠️ No camp bookings data');
      return [];
    }

    console.log('📋 All bookings:', camp.bookings);

    const disabledDates: Date[] = [];
    const activeBookings = camp.bookings.filter(
      (booking: any) => booking.status === 'PENDING' || booking.status === 'CONFIRMED'
    );

    console.log('🔍 Active bookings (PENDING/CONFIRMED):', activeBookings.length);
    console.log('🔍 Active bookings details:', activeBookings.map((b: any) => ({
      id: b.id,
      status: b.status,
      startDate: b.startDate,
      endDate: b.endDate
    })));

    activeBookings.forEach((booking: any) => {
      try {
        // Validate booking data
        if (!booking.startDate || !booking.endDate) {
          console.warn('⚠️ Booking missing dates:', booking);
          return;
        }

        // Handle both timestamp strings and ISO date strings
        let start: Date;
        let end: Date;

        // Check if it's a timestamp string (all digits)
        if (typeof booking.startDate === 'string' && /^\d+$/.test(booking.startDate)) {
          start = new Date(parseInt(booking.startDate));
          end = new Date(parseInt(booking.endDate));
        } else {
          start = new Date(booking.startDate);
          end = new Date(booking.endDate);
        }

        // Check if dates are valid
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          console.warn('⚠️ Invalid date format after parsing:', {
            startDate: booking.startDate,
            endDate: booking.endDate,
            parsedStart: start,
            parsedEnd: end
          });
          return;
        }

        console.log(`📅 Processing booking: ${start.toISOString()} to ${end.toISOString()}`);

        // Normalize to midnight UTC to avoid timezone issues
        start.setUTCHours(0, 0, 0, 0);
        end.setUTCHours(0, 0, 0, 0);

        // User requirement: Booked 4/1-4/3 means nights 1-2. Available to check-out on 4/3.
        // Back-to-back bookings allowed (Strict logic: current < end)
        const current = new Date(start);
        while (current < end) {
          const dateToDisable = new Date(current);
          disabledDates.push(dateToDisable);
          console.log(`  🚫 Disabling night: ${dateToDisable.toISOString().split('T')[0]}`);
          current.setDate(current.getDate() + 1);
        }
      } catch (error) {
        console.error('❌ Error processing booking:', booking, error);
      }
    });

    console.log('🚫 Total disabled dates:', disabledDates.length);
    console.log('🚫 Disabled date list:', disabledDates.map(d => d.toISOString().split('T')[0]));

    return disabledDates;
  };

  const disabledDates = getDisabledDates();

  console.log('🎯 Passing disabled dates to modal:', disabledDates.length);

  // Handle save/unsave camp
  const handleSaveCamp = () => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Нэвтрэх шаардлагатай",
        description: "Амралт хадгалахын тулд нэвтрэх шаардлагатай.",
        variant: "destructive",
      });
      return;
    }

    const campData = data?.yurt;
    if (!campData) return;

    toggleSave({
      id: campData.id,
      type: "camp",
      data: {
        name: campData.name,
        location: campData.location,
        pricePerNight: campData.pricePerNight,
        image: getPrimaryImage(campData.images),
      }
    });

    toast({
      title: isSaved ? "Хадгалсан амралт" : "Амжилттай хадгалагдлаа",
      description: isSaved ? "Амралт хадгалсан жагсаалтаас хасагдлаа." : "Амралт хадгалсан жагсаалтад нэмэгдлээ.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Баазын мэдээллийг уншиж байна...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Баазын мэдээллийг уншихад алдаа гарлаа
            </h1>
            <p className="text-gray-600 mb-8 font-medium">{error.message}</p>
            <Link href="/camps">
              <Button className="bg-emerald-600 hover:bg-emerald-700 font-semibold">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Camps
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!camp) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Camp Not Found
            </h1>
            <p className="text-gray-600 mb-8 font-medium">
              The camp you're looking for doesn't exist.
            </p>
            <Link href="/camps">
              <Button className="bg-emerald-600 hover:bg-emerald-700 font-semibold">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Camps
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Parse JSON amenities from backend
  const parseAmenitiesJSON = (amenitiesStr: string) => {
    try {
      const parsed = JSON.parse(amenitiesStr);
      return {
        items: parsed.items || [],
        activities: parsed.activities || [],
        accommodationType: parsed.accommodationType || "",
        facilities: parsed.facilities || [],
        policies: parsed.policies || {},
      };
    } catch (error) {
      console.log("⚠️ Failed to parse amenities JSON, trying comma-separated:", amenitiesStr);
      // Fallback to old comma-separated format
      if (amenitiesStr && typeof amenitiesStr === 'string') {
        return {
          items: amenitiesStr.split(",").map((a: string) => a.trim()),
          activities: [],
          accommodationType: "",
          facilities: [],
          policies: {},
        };
      }
      return {
        items: [],
        activities: [],
        accommodationType: "",
        facilities: [],
        policies: {},
      };
    }
  };

  const parsedAmenities = parseAmenitiesJSON(camp.amenities || "");

  console.log("🏕️ Parsed amenities:", parsedAmenities);

  // Get labels from camp-options
  const getLabel = (value: string, optionsArray: any[]) => {
    const found = optionsArray.find((opt) => opt.value === value);
    return found ? found.label : value;
  };

  // Transform backend data to match frontend expectations
  const campData = {
    id: camp.id,
    name: getLocalizedField(camp, "name", currentLang),
    location: getLocalizedField(camp, "location", currentLang),
    price: camp.pricePerNight,
    rating: 4.5, // Default rating since not in backend
    reviewCount: 0, // Default since not in backend
    images: parseImagePaths(camp.images).length > 0 ? parseImagePaths(camp.images) : [getPrimaryImage(camp.images)],
    description: getLocalizedField(camp, "description", currentLang),
    longDescription: getLocalizedField(camp, "description", currentLang),
    amenities: parseAmenitiesJSON(getLocalizedField(camp, "amenities", currentLang)).items.map((amenity: string) => ({
      icon: Wifi, // Default icon
      name: getLabel(amenity, amenitiesOptions),
      available: true,
    })),
    activities: parsedAmenities.activities.map((activity: string) =>
      getLabel(activity, activitiesOptions)
    ),
    accommodation: {
      type: getLabel(parsedAmenities.accommodationType, accommodationTypes) || "Уламжлалт гэр",
      capacity: `${camp.capacity} хүн`,
      totalGers: 1,
      facilities: parsedAmenities.facilities.map((facility: string) =>
        getLabel(facility, facilitiesOptions)
      ),
    },
    host: {
      name: camp.owner?.name || "Эзэн",
      avatar: "/placeholder-user.jpg",
      experience: camp.owner?.hostExperience || "5+ жил",
      languages: camp.owner?.hostLanguages ? camp.owner.hostLanguages.split(',').map((l: string) => l.trim()) : ["Монгол", "Англи"],
      rating: 4.5,
      description: camp.owner?.hostBio || "Монголын уламжлалт зочломтгой байдлыг санал болгож байна.",
      email: camp.ownerEmail || "",
      phone: camp.ownerPhone || "",
      id: camp.owner?.id || "",
    },
    reviews: [], // Not in backend schema
    policies: {
      checkIn: parsedAmenities.policies?.checkIn || "14:00",
      checkOut: parsedAmenities.policies?.checkOut || "11:00",
      cancellation: getLabel(
        parsedAmenities.policies?.cancellation || "free_48h",
        policiesOptions.cancellationPolicy
      ),
      children: getLabel(
        parsedAmenities.policies?.children || "all_ages",
        policiesOptions.childrenPolicy
      ),
      pets: getLabel(
        parsedAmenities.policies?.pets || "not_allowed",
        policiesOptions.petsPolicy
      ),
      smoking: getLabel(
        parsedAmenities.policies?.smoking || "no_smoking",
        policiesOptions.smokingPolicy
      ),
    },
    location_details: {
      nearbyAttractions: [],
      transportation: "Дөрвөн дугуйт машин зөвлөмжтэй. Тээврийн үйлчилгээний талаар эзэнтэй холбогдоно уу.",
    },
  };

  const calculateTotal = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    return nights > 0 ? nights * campData.price : 0;
  };

  const handleBooking = () => {
    console.log('🚀 handleBooking called', { checkIn, checkOut, user });
    if (!checkIn || !checkOut) {
      toast({
        title: "Огноо сонгоно уу",
        description: "Ирэх болон гарах огноо сонгоно уу.",
        variant: "destructive",
      });
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      toast({
        title: "Нэвтрэх шаардлагатай",
        description: "Захиалга хийхийн тулд нэвтэрнэ үү.",
        variant: "destructive",
      });
      // Redirect to login page
      window.location.href = `/login?redirect=${encodeURIComponent(
        window.location.pathname
      )}`;
      return;
    }

    // RBAC: Block admins and herders
    const userRole = (user.role || "").toString().toUpperCase();
    console.log('👤 User role check:', { originalRole: user.role, normalizedRole: userRole });

    // Accept TRAVELER, CUSTOMER, USER (case-insensitive)
    const allowedRoles = ["TRAVELER", "CUSTOMER", "USER"];
    if (!allowedRoles.includes(userRole)) {
      console.log('❌ Invalid role:', userRole, '- Allowed roles:', allowedRoles);
      toast({
        title: "Зөвшөөрөлгүй",
        description: `Зөвхөн аялагч (TRAVELER) захиалга үүсгэж болно. Таны role: ${user.role}`,
        variant: "destructive",
      });
      return;
    }
    console.log('✅ Role check passed');

    // Validate dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkOutDate <= checkInDate) {
      toast({
        title: "Огноо буруу байна",
        description: "Гарах өдөр ирэх өдрөөс хойш байх ёстой.",
        variant: "destructive",
      });
      return;
    }

    // Check if dates overlap with any booked dates
    // Use the same logic as backend checkYurtAvailability
    const activeBookings = camp.bookings?.filter(
      (booking: any) => booking.status === 'PENDING' || booking.status === 'CONFIRMED'
    ) || [];

    console.log('📅 Selected range:', checkInDate.toISOString(), '-', checkOutDate.toISOString());
    console.log('🔍 Checking against bookings:', activeBookings);

    const hasOverlap = activeBookings.some((booking: any) => {
      // Handle timestamp strings
      let bookingStart: Date;
      let bookingEnd: Date;

      if (typeof booking.startDate === 'string' && /^\d+$/.test(booking.startDate)) {
        bookingStart = new Date(parseInt(booking.startDate));
        bookingEnd = new Date(parseInt(booking.endDate));
      } else {
        bookingStart = new Date(booking.startDate);
        bookingEnd = new Date(booking.endDate);
      }

      // Strict logic: ExistingStart < ReqEnd AND ExistingEnd > ReqStart
      // Availability: prevent overlapping bookings
      const overlap = (
        bookingStart < checkOutDate &&
        bookingEnd > checkInDate
      );

      if (overlap) {
        console.log('❌ Overlap detected with booking:', {
          id: booking.id,
          start: bookingStart.toISOString(),
          end: bookingEnd.toISOString()
        });
      }

      return overlap;
    });

    if (hasOverlap) {
      toast({
        title: "Огноо захиалагдсан байна",
        description: "Сонгосон огноо аль хэдийн захиалагдсан байна.",
        variant: "destructive",
      });
      return;
    }

    console.log('✅ No overlap detected, creating booking');

    // Create the booking first (PENDING status), then show payment modal
    const startDate = new Date(checkIn).toISOString();
    const endDate = new Date(checkOut).toISOString();

    createBooking({
      variables: {
        input: {
          yurtId: campId,
          startDate,
          endDate,
        },
      },
    });
  };

  const handlePaymentComplete = (paymentMethod: string) => {
    console.log('💳 Payment completed with method:', paymentMethod);

    // Close payment modal
    setShowPaymentModal(false);
    setCurrentBookingId(null);
    setCheckIn("");
    setCheckOut("");
    setGuests(2);

    toast({
      title: "✅ Захиалга баталгаажлаа",
      description: "Таны camp захиалга баталгаажлаа! Dashboard дээр харагдана.",
    });

    // Redirect to dashboard
    router.push("/user-dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-8">
        {/* Back Button */}
        <div className="mb-3 sm:mb-4 md:mb-6">
          <Link href="/camps">
            <Button
              variant="ghost"
              className="p-0 h-auto font-medium text-gray-600 hover:text-gray-900 text-xs sm:text-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Буцах
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8">
            {/* Image Gallery */}
            <div className="space-y-2 sm:space-y-3 md:space-y-4">
              <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                <img
                  src={campData.images[selectedImage] || getPrimaryImage(camp.images) || "/placeholder.svg"}
                  alt={campData.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-5 xs:grid-cols-5 sm:grid-cols-5 gap-1.5 sm:gap-2">
                {campData.images
                  .map((image: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-video bg-gray-200 rounded-md sm:rounded-lg overflow-hidden border-2 transition-colors ${selectedImage === index
                        ? "border-emerald-500"
                        : "border-transparent"
                        }`}
                    >
                      <img
                        src={image || getPrimaryImage(camp.images) || "/placeholder.svg"}
                        alt={`${campData.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
              </div>
            </div>

            {/* Camp Info */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-5 md:mb-6">
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl xs:text-2xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 font-display">
                    {campData.name}
                  </h1>
                  <div className="flex items-center text-gray-600 mb-1.5 sm:mb-2">
                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                    <span className="font-medium text-xs sm:text-sm truncate">{campData.location}</span>
                  </div>
                  {camp.isFeatured && (
                    <div className="flex items-center gap-2 mb-4">
                      <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-yellow-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl backdrop-blur-md border border-white/30 ring-1 ring-black/5">
                        <Star className="w-3.5 h-3.5 fill-white" />
                        Онцгой хамтрагч
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex items-center">
                      <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="font-semibold text-xs sm:text-sm">{campData.rating}</span>
                      <span className="text-gray-600 ml-1 font-medium text-xs sm:text-sm">
                        ({campData.reviewCount} сэтгэгдэл)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`font-medium bg-white text-xs sm:text-sm h-8 sm:h-9 px-2.5 sm:px-3 shadow-sm transition-all hover:bg-gray-50 ${isSaved ? "text-red-500 border-red-200 bg-red-50" : "text-gray-600 border-gray-200"
                      }`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleSaveCamp();
                    }}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2 transition-colors ${isSaved ? "fill-red-500 text-red-500" : "text-gray-400"
                        }`}
                    />
                    <span className="hidden xs:inline">{isSaved ? "Хадгалсан" : "Хадгалах"}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="font-medium bg-transparent text-xs sm:text-sm h-8 sm:h-9 px-2.5 sm:px-3"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: campData.name,
                          text: campData.description,
                          url: window.location.href,
                        }).catch((error) => console.log('Error sharing:', error));
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        toast({
                          title: "Холбоос хуулагдлаа",
                          description: "Холбоос амжилттай хуулагдлаа.",
                        });
                      }
                    }}
                  >
                    <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden xs:inline">Хуваалцах</span>
                  </Button>
                </div>
              </div>

              <p className="text-gray-700 mb-3 sm:mb-4 md:mb-6 font-medium text-sm sm:text-base leading-relaxed">
                {campData.description}
              </p>
            </div>

            {/* Amenities */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Тав тухтай байдал
              </h2>
              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 gap-y-3 gap-x-2">
                {campData.amenities.map((amenity: any, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <amenity.icon
                      className={`w-4 h-4 flex-shrink-0 ${amenity.available ? "text-emerald-600" : "text-gray-400"
                        }`}
                    />
                    <span
                      className={`text-xs xs:text-sm font-medium leading-tight ${amenity.available
                        ? "text-gray-900"
                        : "text-gray-400 line-through"
                        }`}
                    >
                      {amenity.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Activities */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Үйл ажиллагаа ба туршлага
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {campData.activities.map((activity: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 bg-white rounded-lg border"
                  >
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-gray-700 font-medium">
                      {activity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Accommodation Details - Redesigned for Mobile */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Байршуулалт
              </h2>
              <Card className="overflow-hidden border-emerald-100 shadow-sm">
                <CardContent className="p-4 sm:p-5 md:p-6">
                  <div className="flex flex-col space-y-6">
                    {/* Accommodation Type & Capacity */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                          <Home className="w-4 h-4 text-emerald-600" />
                        </div>
                        <h3 className="font-bold text-gray-900 text-base sm:text-lg">
                          {campData.accommodation.type}
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                        <div className="flex flex-col bg-gray-50/80 p-3 rounded-lg border border-gray-100">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-tight mb-1">Багтаамж</span>
                          <span className="text-base font-bold text-emerald-700">
                            {campData.accommodation.capacity}
                          </span>
                        </div>
                        <div className="flex flex-col bg-gray-50/80 p-3 rounded-lg border border-gray-100">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-tight mb-1">Нийт гэр</span>
                          <span className="text-base font-bold text-emerald-700">
                            {campData.accommodation.totalGers} ш
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Host Information */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Эзэнтэй танилцах
              </h2>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <img
                      src={campData.host.avatar || "/placeholder-user.jpg"}
                      alt={campData.host.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg truncate">
                          {campData.host.name}
                        </h3>
                        <div className="flex items-center flex-shrink-0">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                          <span className="text-sm font-semibold">
                            {campData.host.rating}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                        <span className="font-medium whitespace-nowrap">
                          {campData.host.experience} туршлагатай
                        </span>
                        <span className="font-medium">
                          Хэл: {campData.host.languages.join(", ")}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm font-medium mb-3 break-words">
                        {campData.host.description}
                      </p>
                      <div className="flex flex-col gap-2 text-sm">
                        {campData.host.phone && (
                          <div className="flex items-center text-gray-600">
                            <span className="font-medium whitespace-nowrap">Утас: </span>
                            <span className="ml-2">{campData.host.phone}</span>
                          </div>
                        )}
                        {campData.host.email && (
                          <div className="flex items-start text-gray-600">
                            <span className="font-medium whitespace-nowrap mt-0.5">Имэйл: </span>
                            <span className="ml-2 break-all">{campData.host.email}</span>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4 font-medium w-full sm:w-auto"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();

                          if (campData.host.phone) {
                            window.location.href = `tel:${campData.host.phone}`;
                          } else if (campData.host.email) {
                            window.location.href = `mailto:${campData.host.email}`;
                          } else {
                            toast({
                              title: "Холбогдох мэдээлэл хаалттай",
                              description: isAuthenticated
                                ? "Та энэ баазад баталгаажсан захиалгатай болсон үед эзний утас харагдана."
                                : "Эзний холбоо барих мэдээллийг харахын тулд нэвтэрч, захиалга хийнэ үү.",
                              variant: "destructive",
                            });
                          }
                        }}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Эзэнтэй холбогдох
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Comments Section */}
            <CommentSection yurtId={campId} />


            {/* Policies */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Дүрэм журам</h2>
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-4">
                        <span className="text-gray-600 font-medium text-sm sm:text-base">
                          Байрлах цаг
                        </span>
                        <span className="font-semibold text-sm sm:text-base text-right">
                          {campData.policies.checkIn}
                        </span>
                      </div>
                      <div className="flex justify-between items-start gap-4">
                        <span className="text-gray-600 font-medium text-sm sm:text-base">
                          Гарах цаг:
                        </span>
                        <span className="font-semibold text-sm sm:text-base text-right">
                          {campData.policies.checkOut}
                        </span>
                      </div>

                      <div className="flex justify-between items-start gap-4">
                        <span className="text-gray-600 font-medium text-sm sm:text-base">Тэжээвэр амьтан:</span>
                        <span className="font-semibold text-sm sm:text-base text-right">
                          {campData.policies.pets}
                        </span>
                      </div>
                      <div className="flex justify-between items-start gap-4">
                        <span className="text-gray-600 font-medium text-sm sm:text-base">
                          Тамхи татах:
                        </span>
                        <span className="font-semibold text-sm sm:text-base text-right">
                          {campData.policies.smoking}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 lg:top-8">
              <Card>
                <CardHeader className="p-3 xs:p-4 sm:p-5 lg:p-6">
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg xs:text-xl lg:text-2xl font-bold">
                      ₮{campData.price.toLocaleString()}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-600 font-medium">
                      шөнө
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 xs:p-4 sm:p-5 lg:p-6 space-y-3 sm:space-y-4">
                  <div className="col-span-2">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      Хугацаа сонгох
                    </label>
                    <div
                      className="flex items-center justify-between border rounded-md px-3 py-2 cursor-pointer hover:border-emerald-600 transition-all font-medium bg-gray-50/50"
                      onClick={() => setShowDatePicker(true)}
                    >
                      <div className="flex items-center min-w-0 flex-1">
                        <Calendar className="w-4 h-4 mr-2 text-emerald-600 flex-shrink-0" />
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          <span className={`text-xs sm:text-sm truncate ${checkIn ? "text-gray-900 font-bold" : "text-gray-400"}`}>
                            {checkIn ? new Date(checkIn).toLocaleDateString('mn-MN') : "Ирэх"}
                          </span>
                          <ArrowRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                          <span className={`text-xs sm:text-sm truncate ${checkOut ? "text-gray-900 font-bold" : "text-gray-400"}`}>
                            {checkOut ? new Date(checkOut).toLocaleDateString('mn-MN') : "Гарах"}
                          </span>
                        </div>
                      </div>
                      {checkIn && checkOut && (
                        <div className="ml-2 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold">
                          {Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))} шөнө
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      Зочдын тоо
                    </label>
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                        onClick={() => setGuests(Math.max(1, guests - 1))}
                        disabled={guests <= 1}
                      >
                        -
                      </Button>
                      <span className="font-semibold text-sm sm:text-base min-w-[60px] xs:min-w-[70px] text-center">{guests} хүн</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                        onClick={() => setGuests(Math.min(camp.capacity || 6, guests + 1))}
                        disabled={guests >= (camp.capacity || 6)}
                      >
                        +
                      </Button>
                    </div>
                    {guests >= (camp.capacity || 6) && (
                      <p className="text-[10px] xs:text-xs text-orange-600 mt-1 font-medium">
                        ⚠️ Багтаамж: {camp.capacity} хүн
                      </p>
                    )}
                  </div>

                  {checkIn && checkOut && (
                    <div className="space-y-2 pt-4 border-t">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">
                          ₮{campData.price.toLocaleString()} ×{" "}
                          {Math.ceil(
                            (new Date(checkOut).getTime() -
                              new Date(checkIn).getTime()) /
                            (1000 * 60 * 60 * 24)
                          )}{" "}
                          шөнө
                        </span>
                        <span className="font-semibold">
                          ₮{calculateTotal().toLocaleString()}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold">
                        <span>Нийт</span>
                        <span>
                          ₮{calculateTotal().toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <Button
                      className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold text-sm h-11 shadow-md active:scale-[0.98] transition-all"
                      disabled={bookingLoading}
                      onClick={() => {
                        if (!checkIn || !checkOut) {
                          setShowDatePicker(true);
                        } else {
                          handleBooking();
                        }
                      }}
                    >
                      {bookingLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Уншиж байна...
                        </div>
                      ) : (
                        !checkIn || !checkOut ? "Амрах өдрөө сонгох" : "Шууд захиалах"
                      )}
                    </Button>
                  </div>



                  <Separator />

                  <div className="space-y-2 sm:space-y-3">
                    <Button
                      variant="outline"
                      className="w-full bg-transparent font-medium text-xs sm:text-sm h-9 sm:h-10"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        if (campData.host.phone) {
                          window.location.href = `tel:${campData.host.phone}`;
                        } else if (campData.host.email) {
                          window.location.href = `mailto:${campData.host.email}`;
                        } else {
                          toast({
                            title: "Холбогдох мэдээлэл хаалттай",
                            description: isAuthenticated
                              ? "Та энэ баазад баталгаажсан захиалгатай болсон үед эзний утас харагдана."
                              : "Эзний холбоо барих мэдээллийг харахын тулд нэвтэрч, захиалга хийнэ үү.",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                      Эзэнтэй холбогдох
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Date Picker Modal (Range mode) */}
      <DatePickerModal
        isOpen={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSelect={(start, end) => {
          if (start && end) {
            // Fix timezone issue: use local date string
            const formatDate = (date: Date) => {
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const day = String(date.getDate()).padStart(2, '0');
              return `${year}-${month}-${day}`;
            };

            const startStr = formatDate(start);
            const endStr = formatDate(end);

            console.log('✅ Range selected:', { startStr, endStr });
            setCheckIn(startStr);
            setCheckOut(endStr);
          }
        }}
        disabledDates={disabledDates}
        title="Амрах хугацаагаа сонгоно уу"
      />

      {/* Payment Modal */}
      {checkIn && checkOut && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onComplete={handlePaymentComplete}
          amount={calculateTotal()}
          bookingId={currentBookingId || undefined}
          bookingDetails={{
            campName: campData.name,
            location: campData.location,
            checkIn: checkIn,
            checkOut: checkOut,
            guests: guests,
            nights: Math.ceil(
              (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
              (1000 * 60 * 60 * 24)
            ),
            pricePerNight: campData.price,
            serviceFee: 0,
            total: calculateTotal(),
            image: campData.images[0] || getPrimaryImage(camp.images),
          }}
        />
      )}
    </div>
  );
}
