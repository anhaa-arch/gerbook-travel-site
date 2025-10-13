"use client";

import { use, useState } from "react";
import { useTranslation } from "react-i18next";
import { gql, useQuery, useMutation } from "@apollo/client";
import { parseImagePaths } from "@/lib/imageUtils";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import "../../../lib/i18n";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/use-auth";
import {
  CREATE_BOOKING,
  GET_USER_BOOKINGS,
} from "@/app/user-dashboard/queries";

const GET_YURT = gql`
  query GetYurt($id: ID!) {
    yurt(id: $id) {
      id
      name
      description
      location
      pricePerNight
      capacity
      amenities
      images
      createdAt
      updatedAt
    }
  }
`;

interface CampDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function CampDetailPage({ params }: CampDetailPageProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const resolvedParams = use(params);
  const campId = resolvedParams.id;

  const { data, loading, error } = useQuery(GET_YURT, {
    variables: { id: campId },
    skip: !campId,
    errorPolicy: "all",
  });

  const [createBooking, { loading: bookingLoading, error: bookingError }] =
    useMutation(CREATE_BOOKING, {
      refetchQueries: [
        {
          query: GET_USER_BOOKINGS,
          variables: { userId: user?.id },
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
          title: "Захиалга амжилттай",
          description: "Таны camp захиалга баталгаажлаа!",
        });
        setCheckIn("");
        setCheckOut("");
        setGuests(2);

        // Redirect to the traveler dashboard so the new booking is visible
        router.push("/user-dashboard");
      },
      onError: (error) => {
        toast({
          title: "Захиалга амжилтгүй",
          description:
            error.message ||
            "Захиалга үүсгэхэд алдаа гарлаа. Дахин оролдоно уу.",
          variant: "destructive",
        });
      },
    });

  const camp = data?.yurt;

  const [selectedImage, setSelectedImage] = useState(0);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [showAllReviews, setShowAllReviews] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading camp details...</p>
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
              Error loading camp
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

  // Transform backend data to match frontend expectations
  const campData = {
    id: camp.id,
    name: camp.name,
    location: camp.location,
    price: camp.pricePerNight,
    rating: 4.5, // Default rating since not in backend
    reviewCount: 0, // Default since not in backend
    images: parseImagePaths(camp.images),
    description: camp.description,
    longDescription: camp.description, // Use description as long description
    amenities: camp.amenities
      ? camp.amenities.split(",").map((amenity: string) => ({
          icon: Wifi, // Default icon
          name: amenity.trim(),
          available: true,
        }))
      : [],
    activities: [], // Not in backend schema
    accommodation: {
      type: "Traditional Mongolian Ger",
      capacity: `${camp.capacity} people`,
      totalGers: 1,
      facilities: ["Traditional furnishing", "Heating", "Basic amenities"],
    },
    host: {
      name: "Local Host",
      avatar: "/placeholder.svg?height=60&width=60&text=Host",
      experience: "5+ years",
      languages: ["Mongolian", "English"],
      rating: 4.5,
      description:
        "Experienced local host providing authentic Mongolian hospitality.",
    },
    reviews: [], // Not in backend schema
    policies: {
      checkIn: "14:00",
      checkOut: "11:00",
      cancellation: "Free cancellation up to 48 hours before arrival",
      children: "Children of all ages welcome",
      pets: "Pets not allowed",
      smoking: "No smoking inside gers",
    },
    location_details: {
      nearbyAttractions: [],
      transportation:
        "4WD vehicle recommended. Contact host for transfer arrangements.",
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
    if (!checkIn || !checkOut) {
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

    // RBAC: Only CUSTOMER can create bookings; block admins and herders
    // Note: Frontend normalizes CUSTOMER to "user", so we accept both
    const userRole = (user.role || "").toString().toUpperCase();

    if (userRole !== "CUSTOMER" && userRole !== "USER") {
      toast({
        title: "Зөвшөөрөлгүй",
        description: "Зөвхөн CUSTOMER хэрэглэгчид захиалга үүсгэж болно.",
        variant: "destructive",
      });
      return;
    }

    // Calculate dates
    const startDate = new Date(checkIn).toISOString();
    const endDate = new Date(checkOut).toISOString();

    // Call the createBooking mutation
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

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/camps">
            <Button
              variant="ghost"
              className="p-0 h-auto font-medium text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Camps
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                <img
                  src={campData.images[selectedImage] || "/placeholder.svg"}
                  alt={campData.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {campData.images
                  .slice(0, 4)
                  .map((image: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-video bg-gray-200 rounded-lg overflow-hidden border-2 ${
                        selectedImage === index
                          ? "border-emerald-500"
                          : "border-transparent"
                      }`}
                    >
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`${campData.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
              </div>
            </div>

            {/* Camp Info */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 font-display">
                    {campData.name}
                  </h1>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="font-medium">{campData.location}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="font-semibold">{campData.rating}</span>
                      <span className="text-gray-600 ml-1 font-medium">
                        ({campData.reviewCount} reviews)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="font-medium bg-transparent"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="font-medium bg-transparent"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>

              <p className="text-gray-700 mb-6 font-medium">
                {campData.description}
              </p>
              <p className="text-gray-600 text-sm leading-relaxed font-medium">
                {campData.longDescription}
              </p>
            </div>

            {/* Amenities */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Amenities
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {campData.amenities.map((amenity: any, index: number) => (
                  <div key={index} className="flex items-center space-x-3">
                    <amenity.icon
                      className={`w-5 h-5 ${
                        amenity.available ? "text-emerald-600" : "text-gray-400"
                      }`}
                    />
                    <span
                      className={`font-medium ${
                        amenity.available
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
                Activities & Experiences
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

            {/* Accommodation Details */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Accommodation
              </h2>
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">
                        {campData.accommodation.type}
                      </h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span className="font-medium">Capacity:</span>
                          <span className="font-semibold">
                            {campData.accommodation.capacity}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Total Units:</span>
                          <span className="font-semibold">
                            {campData.accommodation.totalGers}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">
                        Facilities
                      </h3>
                      <ul className="space-y-1 text-sm text-gray-600">
                        {campData.accommodation.facilities.map(
                          (facility: string, index: number) => (
                            <li key={index} className="flex items-center">
                              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></div>
                              <span className="font-medium">{facility}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Host Information */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Meet Your Host
              </h2>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <img
                      src={campData.host.avatar || "/placeholder.svg"}
                      alt={campData.host.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg">
                          {campData.host.name}
                        </h3>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                          <span className="text-sm font-semibold">
                            {campData.host.rating}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                        <span className="font-medium">
                          {campData.host.experience} hosting experience
                        </span>
                        <span className="font-medium">
                          Languages: {campData.host.languages.join(", ")}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm font-medium">
                        {campData.host.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Reviews */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Reviews ({campData.reviewCount})
                </h2>
                <div className="flex items-center">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 mr-1" />
                  <span className="font-bold text-lg">{campData.rating}</span>
                </div>
              </div>

              <div className="space-y-6">
                {campData.reviews
                  .slice(0, showAllReviews ? campData.reviews.length : 3)
                  .map((review: any) => (
                    <div
                      key={review.id}
                      className="border-b border-gray-200 pb-6 last:border-b-0"
                    >
                      <div className="flex items-start space-x-4">
                        <img
                          src={review.avatar || "/placeholder.svg"}
                          alt={review.author}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {review.author}
                              </h4>
                              <div className="flex items-center gap-2">
                                <div className="flex">
                                  {[...Array(review.rating)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-gray-600 font-medium">
                                  {review.date}
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-700 mb-2 font-medium">
                            {review.comment}
                          </p>
                          <button className="text-sm text-gray-500 hover:text-gray-700 font-medium">
                            Helpful ({review.helpful})
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {campData.reviews.length > 3 && (
                <Button
                  variant="outline"
                  onClick={() => setShowAllReviews(!showAllReviews)}
                  className="mt-4 font-medium"
                >
                  {showAllReviews
                    ? "Show Less"
                    : `Show All ${campData.reviewCount} Reviews`}
                </Button>
              )}
            </div>

            {/* Location & Transportation */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Location & Getting There
              </h2>
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-bold text-gray-900 mb-3">
                        Nearby Attractions
                      </h3>
                      <div className="space-y-2">
                        {campData.location_details.nearbyAttractions.map(
                          (attraction: any, index: number) => (
                            <div
                              key={index}
                              className="flex justify-between text-sm"
                            >
                              <span className="text-gray-700 font-medium">
                                {attraction.name}
                              </span>
                              <span className="text-gray-600 font-medium">
                                {attraction.distance}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-3">
                        Transportation
                      </h3>
                      <p className="text-sm text-gray-700 font-medium">
                        {campData.location_details.transportation}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Policies */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Policies</h2>
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">
                          Check-in:
                        </span>
                        <span className="font-semibold">
                          {campData.policies.checkIn}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">
                          Check-out:
                        </span>
                        <span className="font-semibold">
                          {campData.policies.checkOut}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">
                          Children:
                        </span>
                        <span className="font-semibold">
                          {campData.policies.children}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">Pets:</span>
                        <span className="font-semibold">
                          {campData.policies.pets}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">
                          Smoking:
                        </span>
                        <span className="font-semibold">
                          {campData.policies.smoking}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Cancellation Policy
                    </h4>
                    <p className="text-sm text-gray-700 font-medium">
                      {campData.policies.cancellation}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      ${campData.price}
                    </span>
                    <span className="text-sm text-gray-600 font-medium">
                      per night
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Check-in
                      </label>
                      <Input
                        type="date"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        className="font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Check-out
                      </label>
                      <Input
                        type="date"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        min={checkIn || new Date().toISOString().split("T")[0]}
                        className="font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Guests
                    </label>
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setGuests(Math.max(1, guests - 1))}
                        disabled={guests <= 1}
                      >
                        -
                      </Button>
                      <span className="font-semibold">{guests}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setGuests(Math.min(6, guests + 1))}
                        disabled={guests >= 6}
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  {checkIn && checkOut && (
                    <div className="space-y-2 pt-4 border-t">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">
                          ${campData.price} ×{" "}
                          {Math.ceil(
                            (new Date(checkOut).getTime() -
                              new Date(checkIn).getTime()) /
                              (1000 * 60 * 60 * 24)
                          )}{" "}
                          nights
                        </span>
                        <span className="font-semibold">
                          ${calculateTotal()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Service fee</span>
                        <span className="font-semibold">
                          ${Math.round(calculateTotal() * 0.1)}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>
                          $
                          {calculateTotal() +
                            Math.round(calculateTotal() * 0.1)}
                        </span>
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700 font-semibold"
                    disabled={!checkIn || !checkOut}
                    onClick={handleBooking}
                  >
                    {!checkIn || !checkOut ? "Огноо сонгоно уу" : "Захиалах"}
                  </Button>

                  <div className="text-center">
                    <p className="text-sm text-gray-600 font-medium">
                      Та одоохондоо төлбөр төлөхгүй
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full bg-transparent font-medium"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Эзэнтэй холбогдох
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full bg-transparent font-medium"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Боломжит огноо шалгах
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
