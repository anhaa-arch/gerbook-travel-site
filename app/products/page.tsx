"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import Image from "next/image"
import { Filter, ShoppingCart, Star, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { productCategories } from "@/lib/data"
import { gql, useQuery } from "@apollo/client"
import { getFirstImage } from "@/lib/imageUtils"
import '../../lib/i18n'
import { useCart } from "@/hooks/use-cart"
import { toast } from "@/hooks/use-toast"

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
      pageInfo { endCursor hasNextPage }
    }
  }
`

const GET_CATEGORIES = gql`
  query GetCategories($first: Int) {
    categories(first: $first) {
      edges {
        node {
          id
          name
        }
      }
      totalCount
    }
  }
`

export default function ProductsPage() {
  const { t, i18n } = useTranslation()
  const [selectedCategory, setSelectedCategory] = useState("")
  const [priceRange, setPriceRange] = useState("")
  const { addToCart } = useCart()

  const { data: productsData, loading: productsLoading, error: productsError } = useQuery(GET_PRODUCTS, {
    variables: { first: 50, orderBy: "createdAt_DESC" },
    fetchPolicy: "cache-first",
    errorPolicy: "all"
  })

  const { data: categoriesData, loading: categoriesLoading, error: categoriesError } = useQuery(GET_CATEGORIES, {
    variables: { first: 50 },
    fetchPolicy: "cache-first",
    errorPolicy: "all"
  })

  // Handle GraphQL loading and error states
  if (productsLoading || categoriesLoading) {
    console.log("Loading GraphQL data...")
  }
  if (productsError) {
    console.error("GraphQL Products Error:", productsError)
  }
  if (categoriesError) {
    console.error("GraphQL Categories Error:", categoriesError)
  }

  const products = (productsData?.products?.edges ?? []).map((e: any) => e.node)
  const categories = (categoriesData?.categories?.edges ?? []).map((e: any) => e.node)

  const filteredProducts = products.filter((product: any) => {
    if (selectedCategory && product.category?.id !== selectedCategory) return false
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
                  {categories.map((category: any) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
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
                  <SelectItem value="0-50">0 - 50₮</SelectItem>
                  <SelectItem value="50-100">50 - 100₮</SelectItem>
                  <SelectItem value="100-200">100 - 200₮</SelectItem>
                  <SelectItem value="200">200₮+</SelectItem>
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
            {filteredProducts.map((product: any) => {
              const imageSrc = getFirstImage(product.images)
              const inStock = product.stock > 0
              return (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <Image
                      src={imageSrc}
                      alt={product.name}
                      width={200}
                      height={200}
                      className="w-full h-48 object-cover"
                    />
                    {!inStock && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white font-bold">{t("products.out_of_stock")}</span>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-base sm:text-lg mb-2">{product.name}</h3>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-medium">
                          {product.category?.name || "Бүтээгдэхүүн"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center text-gray-600 mb-3">
                      <span className="text-sm font-medium">
                        Нөөц: {product.stock} ширхэг
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg sm:text-xl font-bold">{product.price}₮</span>
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 font-semibold"
                        disabled={!inStock}
                        onClick={() => {
                          addToCart({
                            id: product.id,
                            type: "PRODUCT",
                            name: product.name,
                            seller: "Монголын бүтээгдэхүүн",
                            price: product.price,
                            quantity: 1,
                            image: imageSrc,
                            category: product.category?.name || "Бүтээгдэхүүн",
                          })
                          toast({
                            title: "Сагсанд нэмэгдлээ",
                            description: product.name,
                          })
                        }}
                      >
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        {inStock ? t("common.add_to_cart") : t("products.out_of_stock")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
