"use client"
import { useTranslation } from "react-i18next"
import Image from "next/image"
import Link from "next/link"
import { Search, MapPin, Star, Users, Route, Compass } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import '../lib/i18n'
import { gql, useQuery } from "@apollo/client"

const GET_PRODUCTS = gql`
  query GetProducts($first: Int) {
    products(first: $first) {
      edges {
        node {
          id
          name
          price
        }
      }
    }
  }
`

export default function HomePage() {
  const { t, i18n } = useTranslation()
  const { data, loading, error } = useQuery(GET_PRODUCTS, { 
    variables: { first: 10 },
    fetchPolicy: "cache-first"
  })

  // console.log(data)

  const featuredCamps = [
    {
      id: 1,
      name: "Naiman Nuur Eco Ger Camp",
      location: "Arkhangai Province",
      price: 120,
      rating: 4.8,
      image: "/placeholder.svg?height=200&width=300&text=Traditional+Ger+Camp",
      guests: 4,
      featured: true,
    },
    {
      id: 2,
      name: "Khuvsgul Lake Luxury Camp",
      location: "Khövsgöl Province",
      price: 250,
      rating: 4.9,
      image: "/placeholder.svg?height=200&width=300&text=Lake+Ger+Camp",
      guests: 6,
      featured: true,
    },
    {
      id: 3,
      name: "Gobi Desert Adventure Camp",
      location: "Ömnögovi Province",
      price: 180,
      rating: 4.7,
      image: "/placeholder.svg?height=200&width=300&text=Desert+Camp",
      guests: 4,
      featured: true,
    },
    {
      id: 4,
      name: "Altai Mountains Ger Camp",
      location: "Bayan-Ölgii Province",
      price: 160,
      rating: 4.6,
      image: "/placeholder.svg?height=200&width=300&text=Mountain+Camp",
      guests: 5,
      featured: true,
    },
    {
      id: 5,
      name: "Orkhon Valley Traditional Camp",
      location: "Övörkhangai Province",
      price: 140,
      rating: 4.5,
      image: "/placeholder.svg?height=200&width=300&text=Valley+Camp",
      guests: 4,
      featured: false,
    },
    {
      id: 6,
      name: "Terelj National Park Camp",
      location: "Töv Province",
      price: 110,
      rating: 4.4,
      image: "/placeholder.svg?height=200&width=300&text=Park+Camp",
      guests: 3,
      featured: false,
    },
    {
      id: 7,
      name: "Khar Us Lake Eco Camp",
      location: "Khovd Province",
      price: 130,
      rating: 4.3,
      image: "/placeholder.svg?height=200&width=300&text=Eco+Camp",
      guests: 4,
      featured: false,
    },
    {
      id: 8,
      name: "Hustai National Park Camp",
      location: "Töv Province",
      price: 125,
      rating: 4.2,
      image: "/placeholder.svg?height=200&width=300&text=Wildlife+Camp",
      guests: 4,
      featured: false,
    },
  ]

  const featuredProducts = [
    {
      id: 1,
      name: { en: "Traditional Airag", mn: "Айраг" },
      category: { en: "Dairy", mn: "Сүү, сүүн бүтээгдэхүүн" },
      price: 25,
      image: "/placeholder.svg?height=200&width=200&text=Airag",
      seller: { en: "Batbayar Family", mn: "Батбаярын гэр бүл" },
    },
    {
      id: 2,
      name: { en: "Handwoven Carpet", mn: "Гар нэхмэл хивс" },
      category: { en: "Handicrafts", mn: "Гар урлал" },
      price: 150,
      image: "/placeholder.svg?height=200&width=200&text=Carpet",
      seller: { en: "Oyunaa Crafts", mn: "Оюунаагийн урлал" },
    },
    {
      id: 3,
      name: { en: "Dried Mutton", mn: "Хатаасан мах" },
      category: { en: "Meat", mn: "Мах" },
      price: 45,
      image: "/placeholder.svg?height=200&width=200&text=Dried+Meat",
      seller: { en: "Nomad Foods", mn: "Нүүдэлчдийн хүнс" },
    },
  ]

  // Separate featured and regular camps
  const topFeaturedCamps = featuredCamps.filter((camp) => camp.featured).slice(0, 4)
  const regularCamps = featuredCamps.filter((camp) => !camp.featured).slice(0, 4)

  // // Handle GraphQL loading and error states
  // if (loading) {
  //   console.log("Loading GraphQL data...")
  // }
  
  // if (error) {
  //   console.error("GraphQL Error:", error)
  // }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-emerald-600 to-blue-600 text-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold font-display mb-6 tracking-tight">
            {t("home.title")}
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl mb-8 max-w-3xl mx-auto font-medium">{t("home.subtitle")}</p>
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Input
                type="text"
                placeholder={t("home.search_placeholder")}
                className="pl-12 pr-4 py-3 text-gray-900 font-medium"
              />
              <Search className="absolute left-4 top-3 h-5 w-5 text-gray-400" />
            </div>
            <Button className="w-full mt-4 bg-white text-emerald-600 hover:bg-gray-100 font-semibold">
              {t("common.search")}
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Camps Section */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <h2 className="text-2xl md:text-3xl font-bold font-display text-gray-900">{t("home.featured_camps")}</h2>
            <Link href="/camps">
              <Button variant="outline" className="font-semibold bg-transparent">
                {t("common.details")}
              </Button>
            </Link>
          </div>

          {/* Featured Camps - Responsive grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
            {topFeaturedCamps.map((camp) => (
              <Card key={camp.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <Image
                    src={camp.image || "/placeholder.svg"}
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
                  <h3 className="font-semibold text-base md:text-lg mb-2 truncate">{camp.name}</h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span className="text-sm truncate font-medium">{camp.location}</span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="text-sm font-semibold">{camp.rating}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users className="w-4 h-4 mr-1" />
                      <span className="text-sm font-medium">
                        {camp.guests} {t("camps.guests")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg md:text-xl font-bold">{camp.price}₮</span>
                      <span className="text-gray-600 ml-1 text-sm font-medium">хоног</span>
                    </div>
                    <Link href={`/camps/${camp.id}`}>
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 font-semibold">
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
            {regularCamps.map((camp) => (
              <Card key={camp.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <Image
                    src={camp.image || "/placeholder.svg"}
                    alt={camp.name}
                    width={300}
                    height={200}
                    className="w-full h-40 md:h-48 object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-base md:text-lg mb-2 truncate">{camp.name}</h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span className="text-sm truncate font-medium">{camp.location}</span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="text-sm font-semibold">{camp.rating}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users className="w-4 h-4 mr-1" />
                      <span className="text-sm font-medium">
                        {camp.guests} {t("camps.guests")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg md:text-xl font-bold">{camp.price}₮</span>
                      <span className="text-gray-600 ml-1 text-sm font-medium">хоног</span>
                    </div>
                    <Link href={`/camps/${camp.id}`}>
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 font-semibold">
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
      <section className="py-12 md:py-16 bg-white">
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
              <h3 className="text-xl md:text-2xl font-bold font-display mb-4">{t("travel.personalized")}</h3>
              <p className="text-gray-600 mb-6 font-medium">Таны сонирхол, аяллын хугацаанд тохирсон хувийн маршрут үүсгээрэй.</p>
              <Link href="/travel-routes">
                <Button className="bg-emerald-600 hover:bg-emerald-700 font-semibold">
                  {t("travel.generate_route")}
                </Button>
              </Link>
            </Card>

            <Card className="p-6 md:p-8 text-center">
              <Compass className="w-12 h-12 md:w-16 md:h-16 text-emerald-600 mx-auto mb-4" />
              <h3 className="text-xl md:text-2xl font-bold font-display mb-4">Интерактив газрын зураг</h3>
              <p className="text-gray-600 mb-6 font-medium">Бааз, наадам, үзвэрүүдийг газрын зураг дээрээс судлаарай.</p>
              <Link href="/map">
                <Button className="bg-emerald-600 hover:bg-emerald-700 font-semibold">{t('map.explore_map')}</Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <h2 className="text-2xl md:text-3xl font-bold font-display text-gray-900">{t("products.title")}</h2>
            <Link href="/products">
              <Button variant="outline" className="font-semibold bg-transparent">
                {t("common.details")}
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name[i18n.language as 'en' | 'mn']}
                    width={200}
                    height={200}
                    className="w-full h-40 md:h-48 object-cover"
                  />
                </div>
                <CardContent className="p-4 md:p-6">
                  <h3 className="font-semibold text-base md:text-lg mb-2">{product.name[i18n.language as 'en' | 'mn']}</h3>
                  <p className="text-gray-600 text-sm mb-2 font-medium">{product.category[i18n.language as 'en' | 'mn']}</p>
                  <p className="text-gray-600 text-sm mb-4 font-medium">
                    {t("products.seller")}: {product.seller[i18n.language as 'en' | 'mn']}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl md:text-2xl font-bold">{product.price}₮</span>
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 font-semibold">
                      {t("common.add_to_cart")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                  <div className="w-5 h-5 bg-white rounded-full"></div>
                </div>
                <span className="text-xl font-semibold font-display">Malchin Camp</span>
              </div>
              <p className="text-gray-400 font-medium">{t("home.subtitle")}</p>
            </div>
            <div>
              <h3 className="font-semibold font-display mb-4">Explore</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/camps" className="hover:text-white font-medium transition-colors">
                    {t("nav.camps")}
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="hover:text-white font-medium transition-colors">
                    {t("nav.products")}
                  </Link>
                </li>
                <li>
                  <Link href="/travel-routes" className="hover:text-white font-medium transition-colors">
                    {t("nav.travel_routes")}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold font-display mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white font-medium transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white font-medium transition-colors">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold font-display mb-4">Language</h3>
              <p className="text-gray-400 text-sm font-medium">
                Current: {i18n.language === "mn" ? "Монгол" : "English"}
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 md:mt-8 pt-6 md:pt-8 text-center text-gray-400">
            <p className="font-medium">&copy; 2025 Malchin Camp. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}