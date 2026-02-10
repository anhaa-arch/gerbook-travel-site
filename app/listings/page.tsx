"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Star, Users, Filter, Package, Home, X, Calendar } from "lucide-react";
import { DatePickerModal } from "@/components/search/date-picker-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mongoliaData } from "@/lib/data";
import mnData from "@/data";
import { gql, useQuery } from "@apollo/client";
import { getFirstImage } from "@/lib/imageUtils";
import { amenitiesOptions } from "@/data/camp-options";
import "../../lib/i18n";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/components/ui/use-toast";

const GET_YURTS = gql`
  query GetYurts($first: Int, $filter: String, $orderBy: String) {
    yurts(first: $first, filter: $filter, orderBy: $orderBy) {
      edges {
        node {
          id
          name
          location
          pricePerNight
          capacity
          images
          amenities
        }
      }
      totalCount
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;

const GET_PRODUCTS = gql`
  query GetProducts($first: Int, $filter: String, $orderBy: String) {
    products(first: $first, filter: $filter, orderBy: $orderBy) {
      edges {
        node {
          id
          name
          description
          price
          stock
          images
          category {
            id
            name
          }
        }
      }
      totalCount
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;

export default function ListingsPage() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const [selectedProvince, setSelectedProvince] = useState("Архангай");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeTab, setActiveTab] = useState("camps");

  // Get location data from search section
  const locationData = mnData();

  const {
    data: yurtsData,
    loading: yurtsLoading,
    error: yurtsError,
  } = useQuery(GET_YURTS, {
    variables: { first: 50, orderBy: "createdAt_DESC" },
    fetchPolicy: "cache-first",
    errorPolicy: "all",
  });

  const {
    data: productsData,
    loading: productsLoading,
    error: productsError,
  } = useQuery(GET_PRODUCTS, {
    variables: { first: 50, orderBy: "createdAt_DESC" },
    fetchPolicy: "cache-first",
    errorPolicy: "all",
  });

  const searchParams = useSearchParams();

  useEffect(() => {
    const provinceParam = searchParams.get("province");
    const districtParam = searchParams.get("district");
    const checkInParam = searchParams.get("checkIn");
    const checkOutParam = searchParams.get("checkOut");

    if (provinceParam) setSelectedProvince(provinceParam);
    if (districtParam) setSelectedDistrict(districtParam);
    if (checkInParam) setCheckIn(new Date(checkInParam));
    if (checkOutParam) setCheckOut(new Date(checkOutParam));
  }, [searchParams]);

  // Handle GraphQL loading and error states
  if (yurtsLoading || productsLoading) {
    console.log("Loading GraphQL data...");
  }
  if (yurtsError) {
    console.error("GraphQL Yurts Error:", yurtsError);
  }
  if (productsError) {
    console.error("GraphQL Products Error:", productsError);
  }

  const yurts = (yurtsData?.yurts?.edges ?? []).map((e: any) => e.node);
  const products = (productsData?.products?.edges ?? []).map(
    (e: any) => e.node
  );

  const filteredCamps = yurts.filter((camp: any) => {
    // Filter by location
    if (selectedProvince && !camp.location.toLowerCase().includes(selectedProvince.toLowerCase())) {
      return false;
    }
    if (selectedDistrict && selectedDistrict !== "all_districts" && !camp.location.toLowerCase().includes(selectedDistrict.toLowerCase())) {
      return false;
    }

    // Filter by date availability
    if (checkIn && checkOut && camp.bookings) {
      const activeBookings = camp.bookings.filter((b: any) => b.status === 'PENDING' || b.status === 'CONFIRMED');
      const hasOverlap = activeBookings.some((booking: any) => {
        const bStart = new Date(booking.startDate);
        const bEnd = new Date(booking.endDate);
        // Strict overlap logic (same as backend)
        const overlap = bStart < checkOut && bEnd > checkIn;
        if (overlap) {
          console.log(`[Filter] Camp ${camp.name} excluded. Overlap with booking ${booking.id}: ${bStart.toISOString()} - ${bEnd.toISOString()}`);
        }
        return overlap;
      });
      if (hasOverlap) return false;
    }

    return true;
  });

  console.log(`[Filter] Results: ${filteredCamps.length}/${yurts.length} camps`, {
    selectedProvince,
    selectedDistrict,
    checkIn: checkIn?.toISOString(),
    checkOut: checkOut?.toISOString()
  });

  // Get provinces and districts from search section data
  // Requirement: Show only Arkhangai
  const provinces = locationData.zipcode
    .filter(p => p.mnname === "Архангай")
    .map((province) => ({
      id: province.mnname,
      name: province.mnname,
      zipcode: province.zipcode,
    }));

  const selectedProvinceData = provinces.find((p) => p.id === selectedProvince);

  const availableDistricts = selectedProvinceData
    ? locationData.zipcode
      .find((p) => p.mnname === selectedProvince)
      ?.sub_items.map((district) => ({
        id: district.mnname,
        name: district.mnname,
      })) || []
    : [];

  const handleProvinceChange = (provinceId: string) => {
    setSelectedProvince(provinceId);
    setSelectedDistrict("");
    // Automatically search when province is selected
    console.log("Searching by province:", provinceId);
  };

  const handleDistrictChange = (districtId: string) => {
    setSelectedDistrict(districtId);
    // Automatically search when district is selected
    console.log("Searching by district:", districtId);
  };

  const handleSearch = () => {
    // Manual search trigger
    console.log("Manual search for:", { selectedProvince, selectedDistrict });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Page Header */}
      <section className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 font-display">
            Бүх жагсаалт
          </h1>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Аймаг сонгох
              </label>
              <Select
                value={selectedProvince}
                onValueChange={handleProvinceChange}
              >
                <SelectTrigger className="bg-white border-gray-200">
                  <SelectValue placeholder="Аймаг сонгох" />
                </SelectTrigger>
                <SelectContent>
                  {provinces.map((province) => (
                    <SelectItem key={province.id} value={province.id}>
                      {province.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Сум сонгох
              </label>
              <Select
                value={selectedDistrict}
                onValueChange={handleDistrictChange}
                disabled={!selectedProvince}
              >
                <SelectTrigger className="bg-white border-gray-200">
                  <SelectValue placeholder="Сум сонгох" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_districts">Бүх сумд</SelectItem>
                  {availableDistricts.map((district) => (
                    <SelectItem key={district.id} value={district.id}>
                      {district.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Огноо
              </label>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal bg-white border-gray-200 h-10"
                onClick={() => setShowDatePicker(true)}
              >
                <Calendar className="mr-2 h-4 w-4 text-emerald-500" />
                {checkIn && checkOut ? (
                  <span className="text-gray-900 font-medium">
                    {checkIn.toLocaleDateString('mn-MN', { month: 'numeric', day: 'numeric' })} - {checkOut.toLocaleDateString('mn-MN', { month: 'numeric', day: 'numeric' })}
                  </span>
                ) : (
                  <span className="text-gray-400">Огноо сонгох</span>
                )}
              </Button>
            </div>

            <div className="flex items-end">
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 shadow-sm"
                onClick={handleSearch}
              >
                <Filter className="w-4 h-4 mr-2" />
                Шүүх
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="camps" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Амралт баазууд
              </TabsTrigger>
              <TabsTrigger value="products" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Бүтээгдэхүүн
              </TabsTrigger>
            </TabsList>

            {/* Camps Tab */}
            <TabsContent value="camps" className="space-y-6">
              <div className="mb-6">
                <p className="text-gray-600 font-medium">
                  {filteredCamps.length} бааз олдлоо
                  {selectedProvince && (
                    <span className="ml-2 text-emerald-600">
                      "{selectedProvince}"
                    </span>
                  )}
                  {selectedDistrict && (
                    <span className="ml-2 text-emerald-600">
                      "{selectedDistrict}"
                    </span>
                  )}
                  {selectedProvince || selectedDistrict ? (
                    <span className="ml-2 text-gray-500">- хайлтын үр дүн</span>
                  ) : null}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCamps.length > 0 ? (
                  filteredCamps.map((camp: any) => {
                    const imageSrc = getFirstImage(camp.images);

                    // Parse amenities JSON
                    let amenitiesList: string[] = [];
                    try {
                      if (camp.amenities) {
                        const parsed = typeof camp.amenities === 'string' ? JSON.parse(camp.amenities) : camp.amenities;
                        const items = parsed.items || [];
                        // Map to Mongolian labels
                        amenitiesList = items
                          .map((value: string) => {
                            const option = amenitiesOptions.find(a => a.value === value);
                            return option ? option.label : value;
                          })
                          .filter(Boolean);
                      }
                    } catch (e) {
                      // Fallback to old format (comma-separated)
                      amenitiesList = camp.amenities ? camp.amenities.split(",") : [];
                    }

                    return (
                      <Card
                        key={camp.id}
                        className="overflow-hidden hover:shadow-lg transition-shadow"
                      >
                        <div className="relative">
                          <Image
                            src={imageSrc}
                            alt={camp.name}
                            width={300}
                            height={200}
                            className="w-full h-48 object-cover"
                          />
                          <div className="absolute top-2 right-2 bg-white rounded-full p-1">
                            <MapPin className="w-4 h-4 text-emerald-600" />
                          </div>
                        </div>
                        <CardContent className="p-6">
                          <h3 className="font-bold text-lg mb-2">
                            {camp.name}
                          </h3>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center text-gray-600">
                              <MapPin className="w-4 h-4 mr-1" />
                              <span className="text-sm font-medium">
                                {camp.location}
                              </span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Users className="w-4 h-4 mr-1" />
                              <span className="text-sm font-medium">
                                {camp.capacity} зочин
                              </span>
                            </div>
                          </div>
                          <div className="mb-4">
                            <div className="flex flex-wrap gap-1">
                              {amenitiesList
                                .slice(0, 3)
                                .map((amenity: string, index: number) => (
                                  <span
                                    key={index}
                                    className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-medium"
                                  >
                                    {amenity}
                                  </span>
                                ))}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-2xl font-bold">
                                {camp.pricePerNight}₮
                              </span>
                              <span className="text-gray-600 ml-1 font-medium">
                                хоног
                              </span>
                            </div>
                            <Link href={`/camp/${camp.id}`}>
                              <Button
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700 font-semibold"
                              >
                                Дэлгэрэнгүй
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  <div className="col-span-full text-center py-12">
                    <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      Хайлтын үр дүн олдсонгүй
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {selectedProvince || selectedDistrict
                        ? `"${selectedProvince}${selectedDistrict ? " - " + selectedDistrict : ""
                        }" газарт бааз олдсонгүй.`
                        : "Одоогоор ямар ч бааз олдсонгүй."}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedProvince("");
                        setSelectedDistrict("");
                      }}
                      className="bg-transparent font-semibold"
                    >
                      Шүүлт цэвэрлэх
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Products Tab */}
            <TabsContent value="products" className="space-y-6">
              <div className="mb-6">
                <p className="text-gray-600 font-medium">
                  {products.length} бүтээгдэхүүн олдлоо
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product: any) => {
                  const imageSrc = getFirstImage(product.images);
                  return (
                    <Card
                      key={product.id}
                      className="overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="relative">
                        <Image
                          src={imageSrc}
                          alt={product.name}
                          width={300}
                          height={200}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute top-2 right-2 bg-white rounded-full p-1">
                          <Package className="w-4 h-4 text-emerald-600" />
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <h3 className="font-bold text-lg mb-2">
                          {product.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="mb-4">
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-medium">
                            {product.category?.name || "Ангилал"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-2xl font-bold">
                              {product.price}₮
                            </span>
                            <span className="text-gray-600 ml-1 font-medium">
                              {product.stock} ширхэг
                            </span>
                          </div>
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 font-semibold"
                            onClick={() => {
                              addToCart({
                                id: product.id,
                                type: "PRODUCT",
                                name: product.name,
                                seller: "Малчин",
                                price: product.price,
                                quantity: 1,
                                image: imageSrc,
                                category: product.category?.name || "Бараа",
                              });
                              toast({
                                title: "Сагсанд нэмэгдлээ",
                                description: `${product.name} амжилттай нэмэгдлээ.`,
                              });
                            }}
                          >
                            Сагсанд нэмэх
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <DatePickerModal
        isOpen={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSelect={(start, end) => {
          setCheckIn(start);
          setCheckOut(end);
        }}
      />
    </div>
  );
}
