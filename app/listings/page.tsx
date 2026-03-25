"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Star, Users, Filter, Package, Home, X, Calendar, ShoppingCart, ZoomIn } from "lucide-react";
import { DatePickerModal } from "@/components/search/date-picker-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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
  const [selectedDistrict, setSelectedDistrict] = useState("Цэнхэр");
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeTab, setActiveTab] = useState("camps");
  const [campPage, setCampPage] = useState(1);
  const [productPage, setProductPage] = useState(1);
  const itemsPerPage = 10;

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
    const tabParam = searchParams.get("tab");

    if (provinceParam) setSelectedProvince(provinceParam);
    if (districtParam) setSelectedDistrict(districtParam);
    if (checkInParam) setCheckIn(new Date(checkInParam));
    if (checkOutParam) setCheckOut(new Date(checkOutParam));
    if (tabParam && (tabParam === "camps" || tabParam === "products")) {
      setActiveTab(tabParam);
    }
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
    // Mandatory filter for Arkhangai, Tsenkher
    const provinceFilter = "Архангай";
    const districtFilter = "Цэнхэр";

    const campLocation = camp.location || "";
    if (!campLocation.includes(provinceFilter) || !campLocation.includes(districtFilter)) {
      return false;
    }

    // Secondary filter by UI selection
    if (selectedProvince && !campLocation.toLowerCase().includes(selectedProvince.toLowerCase())) {
      return false;
    }
    if (selectedDistrict && selectedDistrict !== "all_districts" && !campLocation.toLowerCase().includes(selectedDistrict.toLowerCase())) {
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

  const availableDistricts = selectedProvince === "Архангай"
    ? [
      { id: "Цэнхэр", name: "Цэнхэр" }
    ]
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

              {/* Paginated Camps Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCamps.length > 0 ? (
                  filteredCamps
                    .slice((campPage - 1) * itemsPerPage, campPage * itemsPerPage)
                    .map((camp: any) => {
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
                          className="relative group border border-emerald-900/10 bg-[#fdfcf0] rounded-2xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5"
                        >
                          <div className="flex flex-col h-full">
                            <div className="relative h-48 w-full overflow-hidden">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <div className="relative h-full w-full cursor-zoom-in group/img">
                                    <Image
                                      src={imageSrc}
                                      alt={camp.name}
                                      fill
                                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-colors flex items-center justify-center">
                                      <ZoomIn className="text-white opacity-0 group-hover/img:opacity-100 transition-opacity w-8 h-8" />
                                    </div>
                                  </div>
                                </DialogTrigger>
                                <DialogContent className="max-w-[95vw] sm:max-w-3xl p-0 overflow-hidden bg-transparent border-none shadow-none">
                                  <div className="relative aspect-video w-full h-full max-h-[85vh]">
                                    <Image
                                      src={imageSrc}
                                      alt={camp.name}
                                      fill
                                      className="object-contain"
                                      priority
                                    />
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <div className="absolute top-2 right-2 bg-emerald-700 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider z-20 shadow-lg backdrop-blur-sm pointer-events-none">
                                {camp.location.split(',')[0]}
                              </div>
                            </div>

                            <div className="p-4 sm:p-5 flex flex-col flex-1">
                              <div className="mb-3 sm:mb-4">
                                <h3 className="font-black text-base sm:text-lg text-[#0F3D2E] leading-tight tracking-tight uppercase line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem]">
                                  {camp.name}
                                </h3>
                              </div>

                              <div className="space-y-1.5 mb-5 sm:mb-6 text-[#0F3D2E]/80 font-bold">
                                <div className="flex items-center text-xs sm:text-sm">
                                  <MapPin className="w-3.5 h-3.5 mr-2 text-emerald-600 flex-shrink-0" />
                                  <span className="truncate">{camp.location}</span>
                                </div>
                                <div className="flex items-center text-xs sm:text-sm">
                                  <Users className="w-3.5 h-3.5 mr-2 text-emerald-600 flex-shrink-0" />
                                  <span>{camp.capacity} зочин</span>
                                </div>
                              </div>

                              <div className="mt-auto space-y-3 sm:space-y-4">
                                <div className="h-px bg-[#0F3D2E]/10 w-full" />
                                <div className="flex flex-col lg:flex-row xl:flex-col 2xl:flex-row lg:items-center xl:items-stretch 2xl:items-center justify-between gap-3 sm:gap-4 w-full">
                                  <div className="flex items-baseline min-w-0">
                                    <span className="text-xl sm:text-2xl font-black text-[#0F3D20] leading-none whitespace-nowrap">
                                      {camp.pricePerNight?.toLocaleString()}
                                    </span>
                                    <span className="text-[#0F3D20] ml-1 font-bold text-sm sm:text-base">₮</span>
                                  </div>
                                  <Link href={`/camp/${camp.id}`} className="w-full lg:w-auto xl:w-full 2xl:w-auto">
                                    <Button
                                      size="sm"
                                      className="w-full bg-[#246e50] hover:bg-[#1a5a40] text-white font-black text-xs sm:text-sm px-4 sm:px-6 h-10 rounded-xl shadow-lg transition-all active:scale-95"
                                    >
                                      Захиалах
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })
                ) : (
                  <p className="text-gray-500 text-center py-10">Амралт бааз олдсонгүй.</p>
                )}
              </div>

              {/* Camp Pagination */}
              {filteredCamps.length > itemsPerPage && (
                <Pagination className="mt-8">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCampPage(prev => Math.max(1, prev - 1))}
                        className={campPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    {[...Array(Math.ceil(filteredCamps.length / itemsPerPage))].map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink
                          isActive={campPage === i + 1}
                          onClick={() => setCampPage(i + 1)}
                          className="cursor-pointer"
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCampPage(prev => Math.min(Math.ceil(filteredCamps.length / itemsPerPage), prev + 1))}
                        className={campPage === Math.ceil(filteredCamps.length / itemsPerPage) ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </TabsContent>

            {/* Products Tab */}
            <TabsContent value="products" className="space-y-6">
              <div className="mb-6">
                <p className="text-gray-600 font-medium">
                  {products.length} бүтээгдэхүүн олдлоо
                </p>
              </div>

              {/* Paginated Products Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {products
                  .slice((productPage - 1) * itemsPerPage, productPage * itemsPerPage)
                  .map((product: any) => {
                    const imageSrc = getFirstImage(product.images);
                    return (
                      <Card
                        key={product.id}
                        className="relative group border border-emerald-900/10 bg-[#fdfcf0] rounded-2xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5"
                      >
                        <div className="flex flex-col h-full">
                          <div className="relative h-40 sm:h-56 w-full overflow-hidden">
                            <Dialog>
                              <DialogTrigger asChild>
                                <div className="relative h-full w-full cursor-zoom-in group/img">
                                  <Image
                                    src={imageSrc}
                                    alt={product.name}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-colors flex items-center justify-center">
                                    <ZoomIn className="text-white opacity-0 group-hover/img:opacity-100 transition-opacity w-8 h-8" />
                                  </div>
                                </div>
                              </DialogTrigger>
                              <DialogContent className="max-w-[95vw] sm:max-w-3xl p-0 overflow-hidden bg-transparent border-none shadow-none">
                                <div className="relative aspect-video w-full h-full max-h-[85vh]">
                                  <Image
                                    src={imageSrc}
                                    alt={product.name}
                                    fill
                                    className="object-contain"
                                    priority
                                  />
                                </div>
                              </DialogContent>
                            </Dialog>
                            <div className="absolute top-2 right-2 bg-emerald-700 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider z-20 shadow-lg backdrop-blur-sm pointer-events-none">
                              {product.category?.name || "Бараа"}
                            </div>
                          </div>

                          <div className="p-3 sm:p-5 flex flex-col flex-1">
                            <div className="mb-2 sm:mb-4">
                              <h3 className="font-black text-sm sm:text-xl text-[#0F3D2E] leading-tight tracking-tight uppercase line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem]">
                                {product.name}
                              </h3>
                            </div>

                            <div className="mt-auto space-y-3 sm:space-y-4">
                              <div className="h-px bg-[#0F3D2E]/10 w-full" />
                              <div className="flex flex-col gap-2 sm:gap-3 w-full">
                                <div className="flex items-baseline">
                                  <span className="text-base sm:text-2xl font-black text-[#0F3D20] leading-none whitespace-nowrap">
                                    {product.price?.toLocaleString()}
                                  </span>
                                  <span className="text-[#0F3D20] ml-0.5 font-bold text-xs sm:text-base">₮</span>
                                </div>
                                <Button
                                  size="sm"
                                  className="w-full bg-[#246e50] hover:bg-[#1a5a40] text-white font-black text-[10px] sm:text-sm px-3 sm:px-6 h-9 sm:h-11 rounded-xl shadow-lg transition-all active:scale-95 disabled:grayscale disabled:opacity-50"
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
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
              </div>

              {/* Product Pagination */}
              {products.length > itemsPerPage && (
                <Pagination className="mt-8">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setProductPage(prev => Math.max(1, prev - 1))}
                        className={productPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    {[...Array(Math.ceil(products.length / itemsPerPage))].map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink
                          isActive={productPage === i + 1}
                          onClick={() => setProductPage(i + 1)}
                          className="cursor-pointer"
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setProductPage(prev => Math.min(Math.ceil(products.length / itemsPerPage), prev + 1))}
                        className={productPage === Math.ceil(products.length / itemsPerPage) ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
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
    </div >
  );
}
