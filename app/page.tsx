"use client";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Users,
  Search,
  ShoppingCart,
  Calendar,
  Check,
  ChevronRight,
  ChevronLeft,
  Filter,
  Package,
  Home,
  Star,
  ZoomIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import "../lib/i18n";
import { gql, useQuery } from "@apollo/client";

import { SearchSection } from "@/components/search/SearchSection";
import { getFirstImage, getPrimaryImage } from "@/lib/imageUtils";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";

const GET_PRODUCTS = gql`
  query GetProducts($first: Int, $orderBy: String) {
    products(first: $first, orderBy: $orderBy) {
      edges {
        node {
          id
          name
          price
          images
          stock
        }
      }
    }
  }
`;

const GET_YURTS = gql`
  query GetYurts($first: Int, $orderBy: String) {
    yurts(first: $first, orderBy: $orderBy) {
      edges {
        node {
          id
          name
          location
          pricePerNight
          capacity
          images
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

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [campPage, setCampPage] = useState(1);
  const [productPage, setProductPage] = useState(1);
  const itemsPerPage = 10;
  const {
    data: productsData,
    loading: productsLoading,
    error: productsError,
  } = useQuery(GET_PRODUCTS, {
    variables: { first: 100, orderBy: "createdAt_DESC" },
    fetchPolicy: "cache-first",
    errorPolicy: "all",
  });
  const {
    data: yurtsData,
    loading: yurtsLoading,
    error: yurtsError,
  } = useQuery(GET_YURTS, {
    variables: { first: 100, orderBy: "createdAt_DESC" },
    fetchPolicy: "cache-first",
    errorPolicy: "all",
  });

  // Handle GraphQL loading and error states
  if (productsLoading || yurtsLoading) {
    console.log("Loading GraphQL data...");
  }
  if (productsError) {
    console.error("GraphQL Products Error:", productsError);
  }
  if (yurtsError) {
    console.error("GraphQL Yurts Error:", yurtsError);
  }

  const yurts = (yurtsData?.yurts?.edges ?? []).map((e: any) => e.node);
  const productEdges = productsData?.products?.edges ?? [];

  // Camps are derived from GraphQL

  return (
    <div className="h-full bg-white">
      <div className="max-w-6xl 2xl:max-w-7xl 3xl:max-w-[1800px] 4k:max-w-[2400px] mx-auto">
        <div className="bg-white py-4 sm:py-6 md:py-8">
          <SearchSection />
        </div>
      </div>

      {/* Trust & Features Section */}
      <div className="bg-gray-50/50 border-y border-gray-100 py-3 sm:py-4">
        <div className="max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[2000px] 4k:max-w-[2800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-4 gap-2 sm:gap-6">
            {[
              {
                icon: <Users className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />,
                title: "2,000+",
                desc: "Идэвхтэй"
              },
              {
                icon: <Home className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />,
                title: "100+",
                desc: "Малчин"
              },
              {
                icon: <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />,
                title: "100%",
                desc: "Бодит"
              },
              {
                icon: <Check className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />,
                title: "Аюулгүй",
                desc: "Баталгаат"
              },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center text-center space-y-1 px-1">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-xl shadow-sm border border-emerald-50 flex items-center justify-center mb-0.5">
                  {stat.icon}
                </div>
                <h3 className="text-[10px] sm:text-base font-black text-gray-900 leading-tight">{stat.title}</h3>
                <p className="text-[8px] sm:text-[9px] font-bold text-gray-500 uppercase tracking-tighter">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Camps Section */}
      <section className="py-6 sm:py-8 md:py-12 lg:py-16">
        <div className="max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[2000px] 4k:max-w-[2800px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 md:mb-8 gap-3 sm:gap-4">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-display text-gray-900 flex items-center gap-3">
              {t("home.featured_camps")}
            </h2>
            <Link href="/camps" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="font-semibold bg-transparent w-full sm:w-auto text-sm sm:text-base"
              >
                {t("common.details")}
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 3xl:grid-cols-6 4k:grid-cols-8 gap-2 sm:gap-4 md:gap-5 lg:gap-6 mb-6">
            {yurts
              .slice((campPage - 1) * itemsPerPage, campPage * itemsPerPage)
              .map((camp: any) => {
                const imageSrc = getPrimaryImage(camp.images);
                return (
                  <Card
                    key={camp.id}
                    className="relative group border border-emerald-900/10 bg-[#fdfcf0] rounded-2xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5"
                  >
                    <div className="flex flex-col h-full">
                      <div className="relative h-40 sm:h-52 w-full overflow-hidden">
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

                      <div className="p-3 sm:p-5 flex flex-col flex-1">
                        <div className="mb-2 sm:mb-4">
                          <h3 className="font-black text-sm sm:text-lg text-[#0F3D2E] leading-tight tracking-tight uppercase line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem]">
                            {camp.name}
                          </h3>
                        </div>

                        <div className="space-y-1 sm:space-y-1.5 mb-4 sm:mb-6 text-[#0F3D2E]/80 font-bold">
                          <div className="flex items-center">
                            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-emerald-600 flex-shrink-0" />
                            <span className="text-[10px] sm:text-sm truncate">
                              {camp.location}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-emerald-600 flex-shrink-0" />
                            <span className="text-[10px] sm:text-sm">
                              {camp.capacity} зочин
                            </span>
                          </div>
                        </div>

                        <div className="mt-auto space-y-3 sm:space-y-4">
                          <div className="flex items-baseline gap-1 sm:gap-1.5 flex-wrap">
                            <span className="text-base sm:text-2xl font-black text-[#0F3D2E] leading-none whitespace-nowrap">
                              {camp.pricePerNight?.toLocaleString()}
                            </span>
                            <span className="text-[#0F3D2E] ml-1 font-bold text-xs sm:text-base">₮</span>
                            <span className="text-emerald-900/40 text-[8px] sm:text-xs font-bold whitespace-nowrap">
                              /хоног
                            </span>
                          </div>
                          
                          <Link href={`/camp/${camp.id}`} className="block">
                            <Button
                              className="w-full bg-[#246e50] hover:bg-[#1a5a40] text-white font-black text-[10px] sm:text-sm h-9 sm:h-11 rounded-xl shadow-lg transition-all active:scale-95"
                            >
                              Захиалах
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
          </div>

          {/* Camp Pagination */}
          {yurts.length > itemsPerPage && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCampPage(prev => Math.max(1, prev - 1))}
                    className={campPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {[...Array(Math.ceil(yurts.length / itemsPerPage))].map((_, i) => (
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
                    onClick={() => setCampPage(prev => Math.min(Math.ceil(yurts.length / itemsPerPage), prev + 1))}
                    className={campPage === Math.ceil(yurts.length / itemsPerPage) ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-6 sm:py-8 md:py-12 lg:py-16 bg-white">
        <div className="max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[2000px] 4k:max-w-[2800px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 md:mb-8 gap-3 sm:gap-4">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-display text-gray-900">
              {t("products.title")}
            </h2>
            <Link href="/products" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="font-semibold bg-transparent w-full sm:w-auto text-sm sm:text-base"
              >
                {t("common.details")}
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4 4k:grid-cols-6 gap-2 sm:gap-4 md:gap-6 lg:gap-8">
            {productEdges
              .slice((productPage - 1) * itemsPerPage, productPage * itemsPerPage)
              .map((edge: any) => {
                const product = edge.node;
                const imageSrc = getPrimaryImage(product.images);
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
                                <span className="text-base sm:text-2xl font-black text-[#0F3D2E] leading-none whitespace-nowrap">
                                  {product.price?.toLocaleString()}
                                </span>
                                <span className="text-[#0F3D2E] ml-0.5 font-bold text-xs sm:text-base">₮</span>
                              </div>
                            <Button
                              size="sm"
                              className="w-full bg-[#246e50] hover:bg-[#1a5a40] text-white font-black text-[10px] sm:text-sm px-3 sm:px-6 h-9 sm:h-11 rounded-xl shadow-lg transition-all active:scale-95"
                              onClick={() => {
                                try {
                                  addToCart({
                                    id: product.id,
                                    name: product.name,
                                    price: product.price,
                                    quantity: 1,
                                    image: imageSrc,
                                    type: "PRODUCT",
                                    stock: product.stock
                                  });
                                } catch (error) {
                                  toast({
                                    title: "Алдаа",
                                    description: "Сагсанд нэмэхэд алдаа гарлаа",
                                    variant: "destructive",
                                  });
                                }
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
          {productEdges.length > itemsPerPage && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setProductPage(prev => Math.max(1, prev - 1))}
                    className={productPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {[...Array(Math.ceil(productEdges.length / itemsPerPage))].map((_, i) => (
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
                    onClick={() => setProductPage(prev => Math.min(Math.ceil(productEdges.length / itemsPerPage), prev + 1))}
                    className={productPage === Math.ceil(productEdges.length / itemsPerPage) ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </section>


    </div>
  );
}
