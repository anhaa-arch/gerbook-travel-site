"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import Image from "next/image"
import { Filter, ShoppingCart, Star, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { productCategories } from "@/lib/data"
import "../../lib/i18n"
import { useCart } from "@/hooks/use-cart"
import { toast } from "@/hooks/use-toast"

export default function ProductsPage() {
  const { t, i18n } = useTranslation()
  const [selectedCategory, setSelectedCategory] = useState("")
  const [priceRange, setPriceRange] = useState("")
  const { addToCart } = useCart()

  // Mock products data
  const mockProducts = [
    {
      id: 1,
      name: "Айраг",
      category: "dairy",
      price: 25,
      rating: 4.8,
      reviews: 45,
      image: "/placeholder.svg?height=200&width=200&text=Airag",
      seller: { name: "Батбаярын гэр бүл", rating: 4.9 },
      inStock: true,
    },
    {
      id: 2,
      name: "Гар нэхмэл хивс",
      category: "handicrafts",
      price: 150,
      rating: 4.9,
      reviews: 23,
      image: "/placeholder.svg?height=200&width=200&text=Carpet",
      seller: { name: "Оюунаагийн урлал", rating: 4.8 },
      inStock: true,
    },
    {
      id: 3,
      name: "Хатаасан мах",
      category: "meat",
      price: 45,
      rating: 4.7,
      reviews: 67,
      image: "/placeholder.svg?height=200&width=200&text=Dried+Meat",
      seller: { name: "Нүүдэлчдийн хүнс", rating: 4.6 },
      inStock: true,
    },
    {
      id: 4,
      name: "Ямаа бяслаг",
      category: "dairy",
      price: 35,
      rating: 4.6,
      reviews: 34,
      image: "/placeholder.svg?height=200&width=200&text=Yak+Cheese",
      seller: { name: "Уулын сүүний үйлдвэр", rating: 4.7 },
      inStock: true,
    },
    {
      id: 5,
      name: "Монгол гутал",
      category: "handicrafts",
      price: 120,
      rating: 4.8,
      reviews: 18,
      image: "/placeholder.svg?height=200&width=200&text=Boots",
      seller: { name: "Уламжлалт урлал", rating: 4.9 },
      inStock: false,
    },
    {
      id: 6,
      name: "Адуун колбас",
      category: "meat",
      price: 55,
      rating: 4.5,
      reviews: 29,
      image: "/placeholder.svg?height=200&width=200&text=Sausage",
      seller: { name: "Талын мах", rating: 4.4 },
      inStock: true,
    },
  ]

  const filteredProducts = mockProducts.filter((product) => {
    if (selectedCategory && product.category !== selectedCategory) return false
    if (priceRange) {
      const [min, max] = priceRange.split("-").map(Number)
      if (max && (product.price < min || product.price > max)) return false
      if (!max && product.price < min) return false
    }
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Page Header */}
      <section className="bg-white border-b border-gray-200 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 font-display">{t("products.title")}</h1>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t("products.filter_category")}</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="font-medium">
                  <SelectValue placeholder={t("products.all_categories")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("products.all_categories")}</SelectItem>
                  {productCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name.mn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t("products.filter_price")}</label>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="font-medium">
                  <SelectValue placeholder={t("products.all_prices")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("products.all_prices")}</SelectItem>
                  <SelectItem value="0-50">$0 - $50</SelectItem>
                  <SelectItem value="50-100">$50 - $100</SelectItem>
                  <SelectItem value="100-200">$100 - $200</SelectItem>
                  <SelectItem value="200">$200+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t("products.sort_by")}</label>
              <Select>
                <SelectTrigger className="font-medium">
                  <SelectValue placeholder={t("products.popularity")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity">{t("products.popularity")}</SelectItem>
                  <SelectItem value="price-low">{t("products.price_low")}</SelectItem>
                  <SelectItem value="price-high">{t("products.price_high")}</SelectItem>
                  <SelectItem value="rating">{t("products.rating")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" className="w-full bg-transparent font-semibold">
                <Filter className="w-4 h-4 mr-2" />
                {t("products.more_filters")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <p className="text-gray-600 font-medium">{filteredProducts.length} бүтээгдэхүүн олдлоо</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    width={200}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-bold">{t("products.out_of_stock")}</span>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-base sm:text-lg mb-2">{product.name}</h3>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="text-sm font-semibold">{product.rating}</span>
                      <span className="text-gray-600 text-sm ml-1 font-medium">({product.reviews})</span>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-medium">
                      {productCategories.find((c) => c.id === product.category)?.name.mn || product.category}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-3">
                    <User className="w-4 h-4 mr-1" />
                    <span className="text-sm font-medium">
                      {t("products.seller")}: {product.seller.name}
                    </span>
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 ml-2 mr-1" />
                    <span className="text-xs font-semibold">{product.seller.rating}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg sm:text-xl font-bold">${product.price}</span>
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 font-semibold"
                      disabled={!product.inStock}
                      onClick={() => {
                        addToCart({
                          id: product.id,
                          name: product.name,
                          seller: product.seller.name,
                          price: product.price,
                          quantity: 1,
                          image: product.image,
                          category: productCategories.find((c) => c.id === product.category)?.name.mn || product.category,
                        })
                        toast({
                          title: "Сагсанд нэмэгдлээ",
                          description: product.name,
                        })
                      }}
                    >
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      {product.inStock ? t("common.add_to_cart") : t("products.out_of_stock")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
