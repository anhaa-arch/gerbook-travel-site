"use client";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import Link from "next/link";
import { Search, MapPin, Calendar, Users, Route, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import "../lib/i18n";
import { gql, useQuery } from "@apollo/client";
import { Footer } from "@/components/footer";
import { SearchSection } from "@/components/search/SearchSection";

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
  const {
    data: productsData,
    loading: productsLoading,
    error: productsError,
  } = useQuery(GET_PRODUCTS, {
    variables: { first: 10 },
    fetchPolicy: "cache-first",
    errorPolicy: "all",
  });
  const {
    data: yurtsData,
    loading: yurtsLoading,
    error: yurtsError,
  } = useQuery(GET_YURTS, {
    variables: { first: 8, orderBy: "createdAt_DESC" },
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
  const topFeaturedCamps = yurts.slice(0, 4);
  const regularCamps = yurts.slice(4, 8);
  const productEdges = productsData?.products?.edges ?? [];

  // Camps are derived from GraphQL

  return (
    <div className="h-full bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white py-8 ">
          <SearchSection />
        </div>
      </div>

      {/* Featured Camps Section */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <h2 className="text-2xl md:text-3xl font-bold font-display text-gray-900">
              {t("home.featured_camps")}
            </h2>
            <Link href="/camps">
              <Button
                variant="outline"
                className="font-semibold bg-transparent"
              >
                {t("common.details")}
              </Button>
            </Link>
          </div>

          {/* Featured Camps - Responsive grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
            {topFeaturedCamps.map((camp: any) => (
              <Card
                key={camp.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative">
                  <Image
                    src={camp.images?.split(",")[0] || "/placeholder.svg"}
                    alt={camp.name}
                    width={300}
                    height={200}
                    className="w-full h-40 md:h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-emerald-600 text-white px-2 py-1 rounded text-xs font-semibold">
                    Featured
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-base md:text-lg mb-2 truncate">
                    {camp.name}
                  </h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span className="text-sm truncate font-medium">
                      {camp.location}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-gray-600">
                      <Users className="w-4 h-4 mr-1" />
                      <span className="text-sm font-medium">
                        {camp.capacity} {t("camps.guests")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg md:text-xl font-bold">
                        {camp.pricePerNight}₮
                      </span>
                      <span className="text-gray-600 ml-1 text-sm font-medium">
                        хоног
                      </span>
                    </div>
                    <Link href={`/camps/${camp.id}`}>
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 font-semibold"
                      >
                        {t("common.book_now")}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Regular Camps - Second row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {regularCamps.map((camp: any) => (
              <Card
                key={camp.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative">
                  <Image
                    src={camp.images?.split(",")[0] || "/placeholder.svg"}
                    alt={camp.name}
                    width={300}
                    height={200}
                    className="w-full h-40 md:h-48 object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-base md:text-lg mb-2 truncate">
                    {camp.name}
                  </h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span className="text-sm truncate font-medium">
                      {camp.location}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-gray-600">
                      <Users className="w-4 h-4 mr-1" />
                      <span className="text-sm font-medium">
                        {camp.capacity} {t("camps.guests")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg md:text-xl font-bold">
                        {camp.pricePerNight}₮
                      </span>
                      <span className="text-gray-600 ml-1 text-sm font-medium">
                        хоног
                      </span>
                    </div>
                    <Link href={`/camps/${camp.id}`}>
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 font-semibold"
                      >
                        {t("common.book_now")}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <h2 className="text-2xl md:text-3xl font-bold font-display text-gray-900">
              {t("products.title")}
            </h2>
            <Link href="/products">
              <Button
                variant="outline"
                className="font-semibold bg-transparent"
              >
                {t("common.details")}
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {productEdges.map((edge: any) => {
              const product = edge.node;
              const imageSrc =
                product.images?.split(",")[0] || "/placeholder.svg";
              return (
                <Card
                  key={product.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative">
                    <Image
                      src={imageSrc}
                      alt={product.name}
                      width={200}
                      height={200}
                      className="w-full h-40 md:h-48 object-cover"
                    />
                  </div>
                  <CardContent className="p-4 md:p-6">
                    <h3 className="font-semibold text-base md:text-lg mb-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xl md:text-2xl font-bold">
                        {product.price}₮
                      </span>
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 font-semibold"
                      >
                        {t("common.add_to_cart")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
