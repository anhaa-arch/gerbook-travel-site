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
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useSaved } from "@/hooks/use-saved";
import { useTranslatedValue, useTranslatedPrice } from "@/hooks/use-translation";

// Rules of Hooks: Extracting sub-components to handle translations in lists
const AmenityItem = ({ label, icon: Icon, available }: any) => {
  return (
    <div className="flex items-center space-x-2">
      <Icon className={`w-4 h-4 flex-shrink-0 ${available ? "text-emerald-600" : "text-gray-400"}`} />
      <span className={`text-xs xs:text-sm font-medium leading-tight ${available ? "text-gray-900" : "text-gray-400 line-through"}`}>
        {label}
      </span>
    </div>
  );
};

const ActivityItem = ({ label }: any) => {
  return (
    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
      <span className="text-gray-700 font-medium">{label}</span>
    </div>
  );
};

const FacilityItem = ({ label }: any) => {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
      <span className="text-xs font-medium text-gray-700">{label}</span>
    </div>
  );
};

const PolicyRow = ({ label, value }: any) => {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-gray-600 font-medium text-sm sm:text-base">{label}:</span>
      <span className="font-semibold text-sm sm:text-base text-right">{value}</span>
    </div>
  );
};
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
        hostBio_en
        hostBio_ko
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

  // MOVE HOOKS TO TOP TO COMPLY WITH RULES OF HOOKS
  // Fetch DB translated values first if available
  const translatedName = data?.yurt ? getLocalizedField(data.yurt, "name", currentLang) : "";
  const translatedLocation = data?.yurt ? getLocalizedField(data.yurt, "location", currentLang) : "";
  const translatedDesc = data?.yurt ? getLocalizedField(data.yurt, "description", currentLang) : "";
  const translatedHostBio = data?.yurt?.owner ? getLocalizedField(data.yurt.owner, "hostBio", currentLang) || "Монголын уламжлалт зочломтгой байдлыг санал болгож байна." : "Монголын уламжлалт зочломтгой байдлыг санал болгож байна.";
  
  const translatedPrice = useTranslatedPrice(`camp[${campId}].price`, data?.yurt?.pricePerNight || 0, "MNT");
  const saveLabel = useTranslatedValue("common.save", "Хадгалах");
  const shareLabel = useTranslatedValue("common.share", "Хуваалцах");
  const amenitiesTitle = useTranslatedValue("camp.amenities_label", "Тав тухтай байдал");
  const activitiesTitle = useTranslatedValue("camp.activities_label", "Үйл ажиллагаа ба туршлага");
  const accommodationTitle = useTranslatedValue("camp.accommodation_label", "Байршуулалт");
  const hostLabel = useTranslatedValue("camp.host_label", "Эзэнтэй танилцах");
  const rulesLabel = useTranslatedValue("camp.rules_label", "Дүрэм журам");
  const phoneLabel = useTranslatedValue("common.phone", "Утас");
  const emailLabel = useTranslatedValue("common.email", "Имэйл");
  const contactBtnLabel = useTranslatedValue("host.contact_button", "Эзэнтэй холбогдох");
  const guestsUnit = useTranslatedValue("common.guests_unit", "хүн");
  const experienceSuffix = useTranslatedValue("host.experience_suffix", "туршлагатай");
  const languagesLabel = useTranslatedValue("host.languages_label", "Хэл");
  const capacityLabel = useTranslatedValue("common.capacity", "Багтаамж");
  const totalGersLabel = useTranslatedValue("common.total_gers", "Нийт гэр");
  const facilitiesLabel = useTranslatedValue("common.facilities", "Тохижилт");
  const commonPhoneLabel = useTranslatedValue("common.phone", "Утас");
  const commonEmailLabel = useTranslatedValue("common.email", "Имэйл");
  
  const backLabel = useTranslatedValue("common.back_to_camps", "Back to Camps");
  const partnerLabel = useTranslatedValue("camp.partner_label", "Official Partner");
  const reviewsLabel = useTranslatedValue("common.reviews", "reviews");
  const savedLabel = useTranslatedValue("common.saved", "Saved");
  const nightLabel = useTranslatedValue("common.night", "night");
  const checkInLabel = useTranslatedValue("common.check_in", "Check-in");
  const checkOutLabel = useTranslatedValue("common.check_out", "Check-out");
  const guestsLabel = guestsUnit;
  const totalLabel = useTranslatedValue("common.total", "Total");
  const bookLabel = useTranslatedValue("camp.book_now", "Book Now");

  // Additional consolidated hooks for camp page
  const loadingInfoLabel = useTranslatedValue("camp.loading_info", "Баазын мэдээллийг уншиж байна...");
  const errorTitleLabel = useTranslatedValue("camp.error_title", "Баазын мэдээллийг уншихад алдаа гарлаа");
  const campNotFoundLabel = useTranslatedValue("camp.not_found", "Camp Not Found");
  const campNotFoundDescLabel = useTranslatedValue("camp.not_found_desc", "The camp you're looking for doesn't exist.");
  const loginRequiredLabel = useTranslatedValue("common.login_required", "Нэвтрэх шаардлагатай");
  const saveLoginDescLabel = useTranslatedValue("camp.save_login_desc", "Амралт хадгалахын тулд нэвтрэх шаардлагатай.");
  const unsavedTitleLabel = useTranslatedValue("camp.unsaved_title", "Хадгалсан амралт");
  const savedTitleLabel = useTranslatedValue("camp.saved_title", "Амжилттай хадгалагдлаа");
  const unsavedDescLabel = useTranslatedValue("camp.unsaved_desc", "Амралт хадгаалсан жагсаалтаас хасагдлаа.");
  const savedDescLabel = useTranslatedValue("camp.saved_desc", "Амралт хадгаалсан жагсаалтад нэмэгдлээ.");
  
  // Booking status / messages hooks
  const bookingSuccessLabel = useTranslatedValue("booking.success", "✅ Захиалга амжилттай");
  const bookingPaymentReadyLabel = useTranslatedValue("booking.payment_ready", "Төлбөр хийхэд бэлэн боллоо.");
  const bookingErrorGenericLabel = useTranslatedValue("booking.error_generic", "Захиалга үүсгэхэд алдаа гарлаа.");
  const bookingErrorDatesTakenLabel = useTranslatedValue("booking.error_dates_taken", "Таны сонгосон огноо захиалагдсан байна. Өөр огноо сонгоно уу.");
  const bookingErrorInvalidDatesLabel = useTranslatedValue("booking.error_invalid_dates", "Гарах өдөр ирэх өдрөөс хойш байх ёстой.");
  const bookingErrorNotAuthorizedLabel = useTranslatedValue("booking.error_not_authorized", "Та захиалга хийх эрхгүй байна.");
  const bookingErrorNotFoundLabel = useTranslatedValue("booking.error_not_found", "Camp олдсонгүй. Дахин оролдоно уу.");
  const bookingErrorTitleLabel = useTranslatedValue("booking.error_title", "❌ Захиалга амжилтгүй");
  const commonBackToCampsLabel = useTranslatedValue("common.back_to_camps", "Буцах");
  const selectPeriodLabel = useTranslatedValue("common.select_period", "Хугацаа сонгох");
  const commonNumberOfGuestsLabel = useTranslatedValue("common.number_of_guests", "Зочдын тоо");
  const commonLoadingLabel = useTranslatedValue("common.loading", "Уншиж байна...");
  const selectDatesLabel = useTranslatedValue("camp.select_dates", "Амрах өдрөө сонгох");
  const calculateTotal = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    return nights > 0 && campData ? nights * campData.price : 0;
  };

  const totalPriceFormatted = useTranslatedPrice(`camp[${campId}].total`, calculateTotal(), "MNT");
  const finalTotalPriceFormatted = useTranslatedPrice(`camp[${campId}].total_final`, calculateTotal(), "MNT");


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
          title: bookingSuccessLabel,
          description: bookingPaymentReadyLabel,
        });

        // Store the booking ID and open payment modal
        setCurrentBookingId(data.createBooking.id);
        setShowPaymentModal(true);
      },
      onError: (error) => {
        console.error('❌ Booking error:', error);

        let errorMessage = bookingErrorGenericLabel;
        if (error.message.includes("not available")) {
          errorMessage = bookingErrorDatesTakenLabel;
        } else if (error.message.includes("End date must be after start date")) {
          errorMessage = bookingErrorInvalidDatesLabel;
        } else if (error.message.includes("Not authorized")) {
          errorMessage = bookingErrorNotAuthorizedLabel;
        } else if (error.message.includes("Yurt not found")) {
          errorMessage = bookingErrorNotFoundLabel;
        } else {
          errorMessage = error.message || errorMessage;
        }

        toast({
          title: bookingErrorTitleLabel,
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
        title: loginRequiredLabel,
        description: saveLoginDescLabel,
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
      title: isSaved ? unsavedTitleLabel : savedTitleLabel,
      description: isSaved ? unsavedDescLabel : savedDescLabel,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">{loadingInfoLabel}</p>
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
              {errorTitleLabel}
            </h1>
            <p className="text-gray-600 mb-8 font-medium">{error.message}</p>
            <Link href="/camps">
              <Button className="bg-emerald-600 hover:bg-emerald-700 font-semibold">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {commonBackToCampsLabel}
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
              {campNotFoundLabel}
            </h1>
            <p className="text-gray-600 mb-8 font-medium">
              {campNotFoundDescLabel}
            </p>
            <Link href="/camps">
              <Button className="bg-emerald-600 hover:bg-emerald-700 font-semibold">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {commonBackToCampsLabel}
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

  const localizedAmenitiesStr = data?.yurt ? getLocalizedField(data.yurt, "amenities", currentLang) : "";
  const parsedAmenities = parseAmenitiesJSON(localizedAmenitiesStr || camp.amenities || "");

  console.log("🏕️ Parsed amenities:", parsedAmenities);

  // Get labels from camp-options
  const getLabel = (value: string, optionsArray: any[]) => {
    const found = optionsArray.find((opt) => opt.value === value);
    return found ? found.label : value;
  };

  // Transform backend data to match frontend expectations
  const campData = {
    id: camp.id,
    name: translatedName || camp.name,
    location: translatedLocation || camp.location,
    description: translatedDesc || camp.description,
    price: camp.pricePerNight,
    formattedPrice: translatedPrice,
    capacity: camp.capacity,
    rating: 4.5, // Default rating since not in backend
    reviewCount: 0, // Default since not in backend
    images: parseImagePaths(camp.images).length > 0 ? parseImagePaths(camp.images) : [getPrimaryImage(camp.images)],
    longDescription: translatedDesc,
    amenities: parsedAmenities.items.map((amenity: string) => ({
      icon: Wifi, // Default icon
      id: amenity,
      name: currentLang === "mn" ? getLabel(amenity, amenitiesOptions) : amenity,
      available: true,
    })),
    activities: parsedAmenities.activities.map((activity: string) => ({
      id: activity,
      name: currentLang === "mn" ? getLabel(activity, activitiesOptions) : activity,
    })),
    accommodation: {
      type: currentLang === "mn" ? (getLabel(parsedAmenities.accommodationType, accommodationTypes) || "Уламжлалт гэр") : (parsedAmenities.accommodationType || "Traditional Yurt"),
      capacity: `${camp.capacity} ${guestsUnit}`,
      totalGers: 1,
      facilities: parsedAmenities.facilities.map((facility: string) => ({
        id: facility,
        name: currentLang === "mn" ? getLabel(facility, facilitiesOptions) : facility,
      })),
    },
    host: {
      name: camp.owner?.name || "Эзэн",
      avatar: "/placeholder-user.jpg",
      experience: camp.owner?.hostExperience || "5+ жил",
      languages: camp.owner?.hostLanguages ? camp.owner.hostLanguages.split(',').map((l: string) => l.trim()) : ["Монгол", "Англи"],
      rating: 4.5,
      description: translatedHostBio,
      email: camp.ownerEmail || "",
      phone: camp.ownerPhone || "",
      id: camp.owner?.id || "",
    },
    reviews: [], // Not in backend schema
    policies: {
      checkIn: parsedAmenities.policies?.checkIn || "14:00",
      checkOut: parsedAmenities.policies?.checkOut || "11:00",
      cancellation: currentLang === "mn" 
        ? getLabel(parsedAmenities.policies?.cancellation || "free_48h", policiesOptions.cancellationPolicy)
        : (parsedAmenities.policies?.cancellation || "Free cancellation"),
      children: currentLang === "mn"
        ? getLabel(parsedAmenities.policies?.children || "all_ages", policiesOptions.childrenPolicy)
        : (parsedAmenities.policies?.children || "All ages welcome"),
      petsValue: currentLang === "mn"
        ? getLabel(parsedAmenities.policies?.pets || "not_allowed", policiesOptions.petsPolicy)
        : (parsedAmenities.policies?.pets || "Not allowed"),
      smokingValue: currentLang === "mn"
        ? getLabel(parsedAmenities.policies?.smoking || "no_smoking", policiesOptions.smokingPolicy)
        : (parsedAmenities.policies?.smoking || "No smoking"),
    },
    location_details: {
      nearbyAttractions: [],
      transportation: "Дөрвөн дугуйт машин зөвлөмжтэй. Тээврийн үйлчилгээний талаар эзэнтэй холбогдоно уу.",
    },
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
              {backLabel}
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
                        {partnerLabel}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex items-center">
                      <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="font-semibold text-xs sm:text-sm">{campData.rating}</span>
                      <span className="text-gray-600 ml-1 font-medium text-xs sm:text-sm">
                        ({campData.reviewCount} {reviewsLabel})
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
                      <span className="hidden xs:inline">{isSaved ? savedLabel : saveLabel}</span>
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
                    <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                    <span className="hidden xs:inline">{shareLabel}</span>
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
                {amenitiesTitle}
              </h2>
              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 gap-y-3 gap-x-2">
                {campData.amenities.map((amenity: any, index: number) => (
                  <AmenityItem key={index} id={amenity.id} label={amenity.name} icon={amenity.icon} available={amenity.available} />
                ))}
              </div>
            </div>

            {/* Activities */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {activitiesTitle}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {campData.activities.map((activity: any, index: number) => (
                  <ActivityItem key={index} id={activity.id} label={activity.name} />
                ))}
              </div>
            </div>

            {/* Accommodation Details - Redesigned for Mobile */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {accommodationTitle}
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
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-tight mb-1">{capacityLabel}</span>
                          <span className="text-base font-bold text-emerald-700">
                            {campData.accommodation.capacity}
                          </span>
                        </div>
                        <div className="flex flex-col bg-gray-50/80 p-3 rounded-lg border border-gray-100">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-tight mb-1">{totalGersLabel}</span>
                          <span className="text-base font-bold text-emerald-700">
                            {campData.accommodation.totalGers} ш
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Facilities if any */}
                    {campData.accommodation.facilities?.length > 0 && (
                      <div className="pt-4 border-t border-gray-100">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-tight mb-3 block">{facilitiesLabel}</span>
                        <div className="flex flex-wrap gap-2">
                          {campData.accommodation.facilities.map((facility: any, idx: number) => (
                            <FacilityItem key={idx} id={facility.id} label={facility.name} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Host Information */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {hostLabel}
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
                          {campData.host.experience} {experienceSuffix}
                        </span>
                        <span className="font-medium">
                          {languagesLabel}: {campData.host.languages.join(", ")}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm font-medium mb-3 break-words">
                        {campData.host.description}
                      </p>
                      <div className="flex flex-col gap-2 text-sm">
                        {campData.host.phone && (
                          <div className="flex items-center text-gray-600">
                            <span className="font-medium whitespace-nowrap">{commonPhoneLabel}: </span>
                            <span className="ml-2">{campData.host.phone}</span>
                          </div>
                        )}
                        {campData.host.email && (
                          <div className="flex items-start text-gray-600">
                            <span className="font-medium whitespace-nowrap mt-0.5">{commonEmailLabel}: </span>
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
                        {contactBtnLabel}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Comments Section */}
            <CommentSection yurtId={campId} />


            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">{rulesLabel}</h2>
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-3">
                      <PolicyRow id="check_in" label="Байрлах цаг" value={campData.policies.checkIn} />
                      <PolicyRow id="check_out" label="Гарах цаг" value={campData.policies.checkOut} />
                      <PolicyRow id="pets" label="Тэжээвэр амьтан" value={campData.policies.petsValue} />
                      <PolicyRow id="smoking" label="Тамхи татах" value={campData.policies.smokingValue} />
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
                      {translatedPrice}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-600 font-medium">
                      {nightLabel}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 xs:p-4 sm:p-5 lg:p-6 space-y-3 sm:space-y-4">
                  <div className="col-span-2">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      {selectPeriodLabel}
                    </label>
                    <div
                      className="flex items-center justify-between border rounded-md px-3 py-2 cursor-pointer hover:border-emerald-600 transition-all font-medium bg-gray-50/50"
                      onClick={() => setShowDatePicker(true)}
                    >
                      <div className="flex items-center min-w-0 flex-1">
                        <Calendar className="w-4 h-4 mr-2 text-emerald-600 flex-shrink-0" />
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          <span className={`text-xs sm:text-sm truncate ${checkIn ? "text-gray-900 font-bold" : "text-gray-400"}`}>
                            {checkIn ? new Date(checkIn).toLocaleDateString(currentLang === 'mn' ? 'mn-MN' : 'en-US') : checkInLabel}
                          </span>
                          <ArrowRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                          <span className={`text-xs sm:text-sm truncate ${checkOut ? "text-gray-900 font-bold" : "text-gray-400"}`}>
                            {checkOut ? new Date(checkOut).toLocaleDateString(currentLang === 'mn' ? 'mn-MN' : 'en-US') : checkOutLabel}
                          </span>
                        </div>
                      </div>
                      {checkIn && checkOut && (
                        <div className="ml-2 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold">
                          {Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))} {nightLabel}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      {commonNumberOfGuestsLabel}
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
                      <span className="font-semibold text-sm sm:text-base min-w-[60px] xs:min-w-[70px] text-center">{guests} {guestsLabel}</span>
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
                  </div>

                  {checkIn && checkOut && (
                    <div className="space-y-2 pt-4 border-t">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">
                          {translatedPrice} ×{" "}
                          {Math.ceil(
                            (new Date(checkOut).getTime() -
                              new Date(checkIn).getTime()) /
                            (1000 * 60 * 60 * 24)
                          )}{" "}
                          {nightLabel}
                        </span>
                        <span className="font-semibold">
                          {totalPriceFormatted}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold">
                        <span>{totalLabel}</span>
                        <span>
                          {finalTotalPriceFormatted}
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
                          {commonLoadingLabel}
                        </div>
                      ) : (
                        !checkIn || !checkOut ? selectDatesLabel : bookLabel
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
