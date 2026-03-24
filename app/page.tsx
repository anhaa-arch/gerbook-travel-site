"use client";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import Link from "next/link";
import { Search, MapPin, Calendar, Users, Route, Compass, ShieldCheck, Home, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import "../lib/i18n";
import { gql, useQuery } from "@apollo/client";
import { Footer } from "@/components/footer";
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
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const GET_PRODUCTS = gql`
  query GetProducts($first: Int) {
    products(first: $first) {
      edges {
        node {
          id
          name
          price
          images
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const itemsPerPage = 10;
  const {
    data: productsData,
    loading: productsLoading,
    error: productsError,
  } = useQuery(GET_PRODUCTS, {
    variables: { first: 50 },
    fetchPolicy: "cache-first",
    errorPolicy: "all",
  });
  const {
    data: yurtsData,
    loading: yurtsLoading,
    error: yurtsError,
  } = useQuery(GET_YURTS, {
    variables: { first: 50, orderBy: "createdAt_DESC" },
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
      <div className="max-w-6xl mx-auto">
        <div className="bg-white py-4 sm:py-6 md:py-8">
          <SearchSection />
        </div>
      </div>

      {/* Trust & Features Section */}
      <div className="bg-gray-50/50 border-y border-gray-100 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                icon: <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />,
                title: "100%",
                desc: "Бодит"
              },
              {
                icon: <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />,
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
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 md:mb-8 gap-3 sm:gap-4">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-display text-gray-900">
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

          {/* Featured Camps - Responsive grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-5 lg:gap-6 mb-6">
            {yurts
              .slice((campPage - 1) * itemsPerPage, campPage * itemsPerPage)
              .map((camp: any) => (
                <Card
                  key={camp.id}
                  className="overflow-hidden hover:shadow-lg transition-all duration-200"
                >
                  <div className="relative">
                    <Image
                      src={getPrimaryImage(camp.images)}
                      alt={camp.name}
                      width={300}
                      height={200}
                      className="w-full h-36 xs:h-40 sm:h-44 md:h-48 object-cover"
                    />
                    <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 bg-emerald-600 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[8px] sm:text-[10px] font-medium">
                      Онцгой хамтрагч
                    </div>
                  </div>
                  <CardContent className="p-3 sm:p-5">
                    <div className="flex justify-between items-start mb-1 sm:mb-3">
                      <h3 className="font-bold text-sm sm:text-xl md:text-2xl text-gray-900 leading-tight truncate">
                        {camp.name}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-1 sm:gap-2 mb-3 sm:mb-4">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-emerald-600 flex-shrink-0" />
                        <span className="text-[10px] sm:text-sm font-medium truncate">
                          {camp.location}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-emerald-600 flex-shrink-0" />
                        <span className="text-[10px] sm:text-sm font-medium">
                          {camp.capacity} {t("camps.guests")}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 sm:pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-4">
                      <div className="flex flex-col">
                        <span className="hidden sm:block text-xs text-gray-500 font-medium uppercase tracking-wider mb-0.5">
                          1 хоногийн
                        </span>
                        <div className="flex items-baseline">
                          <span className="text-sm sm:text-2xl font-black text-gray-900">
                            {camp.pricePerNight?.toLocaleString()}₮
                          </span>
                          <span className="sm:hidden text-[8px] text-gray-500 ml-1 font-medium italic">/хоног</span>
                        </div>
                      </div>
                      <Link href={`/camp/${camp.id}`} className="w-full sm:w-auto">
                        <Button
                          className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold text-[10px] sm:text-sm px-2 sm:px-6 h-8 sm:h-10 shadow-sm transition-all active:scale-95"
                        >
                          {t("common.book_now")}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
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

      {/* Travel Routes Section */}
      {/* <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold font-display text-gray-900 mb-4">
              {t("home.travel_routes")}
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto font-medium">
              {t("home.discover_routes")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <Card className="p-6 md:p-8 text-center">
              <Route className="w-12 h-12 md:w-16 md:h-16 text-emerald-600 mx-auto mb-4" />
              <h3 className="text-xl md:text-2xl font-bold font-display mb-4">
                {t("travel.personalized")}
              </h3>
              <p className="text-gray-600 mb-6 font-medium">
                Таны сонирхол, аяллын хугацаанд тохирсон хувийн маршрут
                үүсгээрэй.
              </p>
              <Link href="/travel-routes">
                <Button className="bg-emerald-600 hover:bg-emerald-700 font-semibold">
                  {t("travel.generate_route")}
                </Button>
              </Link>
            </Card>

            <Card className="p-6 md:p-8 text-center">
              <Compass className="w-12 h-12 md:w-16 md:h-16 text-emerald-600 mx-auto mb-4" />
              <h3 className="text-xl md:text-2xl font-bold font-display mb-4">
                Интерактив газрын зураг
              </h3>
              <p className="text-gray-600 mb-6 font-medium">
                Бааз, наадам, үзвэрүүдийг газрын зураг дээрээс судлаарай.
              </p>
              <Link href="/map">
                <Button className="bg-emerald-600 hover:bg-emerald-700 font-semibold">
                  {t("map.explore_map")}
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section> */}

      {/* Featured Products */}
      <section className="py-6 sm:py-8 md:py-12 lg:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
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
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            {productEdges
              .slice((productPage - 1) * itemsPerPage, productPage * itemsPerPage)
              .map((edge: any) => {
                const product = edge.node;
                const imageSrc = getPrimaryImage(product.images);
                return (
                  <Card
                    key={product.id}
                    className="overflow-hidden hover:shadow-lg transition-all duration-200"
                  >
                    <div
                      className="relative cursor-pointer group"
                      onClick={() => setSelectedImage(imageSrc)}
                    >
                      <Image
                        src={imageSrc}
                        alt={product.name}
                        width={200}
                        height={200}
                        className="w-full h-36 xs:h-40 sm:h-44 md:h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-2">
                        <Maximize2 className="w-5 h-5 sm:w-6 sm:h-6" />
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-black/20 px-2 py-1 rounded-full backdrop-blur-sm">
                          Томруулах
                        </span>
                      </div>
                    </div>
                    <CardContent className="p-3 sm:p-4 md:p-6">
                      <h3 className="font-semibold text-sm xs:text-base md:text-lg mb-2 sm:mb-3 truncate">
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-lg xs:text-xl md:text-2xl font-bold">
                          {product.price?.toLocaleString()}₮
                        </span>
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 font-semibold text-[10px] xs:text-xs sm:text-sm px-2 xs:px-3 h-7 xs:h-8 sm:h-9"
                          onClick={() => {
                            try {
                              addToCart({
                                id: product.id,
                                name: product.name,
                                price: product.price,
                                quantity: 1,
                                image: imageSrc,
                                type: "PRODUCT"
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
                          {t("common.add_to_cart")}
                        </Button>
                      </div>
                    </CardContent>
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

      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-[95vw] md:max-w-[85vw] max-h-[95vh] p-0 overflow-hidden bg-transparent border-none shadow-none flex items-center justify-center">
          <DialogTitle className="sr-only">Зургийн түүвэр</DialogTitle>
          {selectedImage && (
            <div className="relative w-full h-full flex items-center justify-center p-2 sm:p-4">
              <Image
                src={selectedImage}
                alt="Preview"
                width={1200}
                height={800}
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                priority
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
