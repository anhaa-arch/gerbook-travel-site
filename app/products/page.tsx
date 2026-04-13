"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, LayoutGrid, List, Search, ZoomIn, Filter, Star, User } from "lucide-react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { productCategories } from "@/lib/data"
import { gql, useQuery } from "@apollo/client"
import { getImageUrl, translateCategory } from "@/lib/admin-utils"
import { getFirstImage } from "@/lib/imageUtils"
import { useTranslatedValue, useTranslatedPrice } from "@/hooks/use-translation"
import { getLocalizedField } from "@/lib/localization"
import '../../lib/i18n'
import { useCart } from "@/hooks/use-cart"
import { toast, useToast } from "@/components/ui/use-toast"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

const GET_PRODUCTS = gql`
  query GetProducts($first: Int, $filter: String, $orderBy: String) {
    products(first: $first, filter: $filter, orderBy: $orderBy) {
      edges {
        node {
          id
          name
          name_en
          name_ko
          description
          description_en
          description_ko
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
`;

const SingleProductCard = ({ product, addToCart }: any) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;
  const { toast } = useToast();
  
  const imageSrc = getFirstImage(product.images);
  const inStock = product.stock > 0;
  const translatedName = getLocalizedField(product, "name", currentLang);
  const translatedPrice = useTranslatedPrice(`prod[${product.id}].price`, product.price || 0, "MNT");
  
  const outOfStockLabel = useTranslatedValue("products.out_of_stock", "Дууссан");
  const addToCartLabel = useTranslatedValue("products.add_to_cart", "Сагсанд нэмэх");
  const addedLabel = useTranslatedValue("common.added_to_cart", "Сагсанд нэмэгдлээ");
  const successLabel = useTranslatedValue("common.success", "Амжилттай");

  return (
    <Card
      key={product.id}
      className="relative group border border-emerald-900/10 bg-[#fdfcf0] rounded-2xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5"
    >
      <div className="flex flex-col h-full">
        <div className="relative h-40 sm:h-56 w-full overflow-hidden">
          <Dialog>
            <DialogTrigger asChild>
              <Link href={`/product/${product.id}`} className="relative h-full w-full block group">
                <Image
                  src={imageSrc}
                  alt={translatedName}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </Link>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-3xl p-0 overflow-hidden bg-transparent border-none shadow-none">
              <div className="relative aspect-video w-full h-full max-h-[85vh]">
                <Image
                  src={imageSrc}
                  alt={translatedName}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </DialogContent>
          </Dialog>
          
          {!inStock && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-10 pointer-events-none">
              <span className="text-white font-black uppercase tracking-widest text-xs px-3 py-1.5 border-2 border-white/50 rounded-lg">
                {outOfStockLabel}
              </span>
            </div>
          )}
          <div className="absolute top-2 right-2 bg-emerald-700 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider z-20 shadow-lg backdrop-blur-sm pointer-events-none">
            {useTranslatedValue(`cat.${product.category?.name}`, product.category?.name || "Бараа")}
          </div>
        </div>

        <div className="p-3 sm:p-5 flex flex-col flex-1">
          <div className="mb-2 sm:mb-4">
            <Link href={`/product/${product.id}`}>
              <h3 className="font-black text-sm sm:text-xl text-[#0F3D2E] leading-tight tracking-tight uppercase line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem] hover:text-emerald-700 transition-colors">
                {translatedName}
              </h3>
            </Link>
          </div>

          <div className="mt-auto space-y-3 sm:space-y-4">
            <div className="h-px bg-[#0F3D2E]/10 w-full" />
            <div className="flex flex-col gap-2 sm:gap-3 w-full">
              <div className="flex items-baseline">
                <span className="text-base sm:text-2xl font-black text-[#0F3D20] leading-none whitespace-nowrap">
                  {translatedPrice}
                </span>
              </div>
              <Button
                size="sm"
                className="w-full bg-[#246e50] hover:bg-[#1a5a40] text-white font-black text-[10px] sm:text-sm px-3 sm:px-6 h-9 sm:h-11 rounded-xl shadow-lg transition-all active:scale-95 disabled:grayscale disabled:opacity-50"
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
                    category: product.category?.name || "Бараа",
                    stock: product.stock
                  });
                  toast({
                    title: successLabel,
                    description: addedLabel,
                  });
                }}
              >
                {addToCartLabel}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default function ProductsPage() {
  const { t, i18n } = useTranslation()
  const [selectedCategory, setSelectedCategory] = useState("")
  const [priceRange, setPriceRange] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
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
        <div className="max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[2000px] 4k:max-w-[2800px] mx-auto px-4 sm:px-6 lg:px-8">
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
                      {translateCategory(category.name)}
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
        <div className="max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[2000px] 4k:max-w-[2800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <p className="text-gray-600 font-medium">
              {filteredProducts.length} {useTranslatedValue("products.items_found", "бүтээгдэхүүн олдлоо")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5 4k:grid-cols-6 gap-4 sm:gap-6">
            {filteredProducts
              .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
              .map((product: any) => (
                <SingleProductCard key={product.id} product={product} addToCart={addToCart} />
              ))}
          </div>

          {/* Pagination */}
          {filteredProducts.length > itemsPerPage && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {[...Array(Math.ceil(filteredProducts.length / itemsPerPage))].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      isActive={currentPage === i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className="cursor-pointer"
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredProducts.length / itemsPerPage), prev + 1))}
                    className={currentPage === Math.ceil(filteredProducts.length / itemsPerPage) ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </section>
    </div>
  )
}
