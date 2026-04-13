"use client"

import { use, useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { gql, useQuery } from "@apollo/client"
import { parseImagePaths, getPrimaryImage } from "@/lib/imageUtils"
import {
  ArrowLeft,
  ShoppingCart,
  Shield,
  Check,
  X,
  Share2,
  Heart,
  Plus,
  Minus,
  Star,
  Package,
  Truck,
  RotateCcw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import "../../../lib/i18n"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { useCart } from "@/hooks/use-cart"
import { useSaved } from "@/hooks/use-saved"
import { useTranslatedValue, useTranslatedPrice } from "@/hooks/use-translation"
import { getLocalizedField } from "@/lib/localization"
import { useAuth } from "@/hooks/use-auth"
import { translateCategory } from "@/lib/admin-utils"

const GET_PRODUCT = gql`
  query GetProduct($id: ID!) {
    product(id: $id) {
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
`

interface ProductDetailPageProps {
  params: Promise<{ id: string }>
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { t, i18n } = useTranslation()
  const { toast } = useToast()
  const { addToCart } = useCart()
  const { user, isAuthenticated } = useAuth()
  const { isSaved: checkIsSaved, toggleSave } = useSaved()
  const router = useRouter()
  const resolvedParams = use(params)
  const productId = resolvedParams.id

  const isSaved = checkIsSaved(productId, "product")

  const { data, loading, error } = useQuery(GET_PRODUCT, {
    variables: { id: productId },
    skip: !productId,
    errorPolicy: "all"
  })

  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)

  const product = data?.product
  const currentLang = i18n.language
  const translatedName = product ? getLocalizedField(product, "name", currentLang) : ""
  const translatedDesc = product ? getLocalizedField(product, "description", currentLang) : ""
  const translatedPrice = useTranslatedPrice(`prod[${productId}].price`, product?.price || 0, "MNT")
  
  const loadingLabel = useTranslatedValue("common.loading", "Ачаалж байна...")
  const notFoundLabel = useTranslatedValue("products.not_found", "Бүтээгдэхүүн олдсонгүй")
  const notFoundDesc = useTranslatedValue("products.not_found_desc", "Уучлаарай, таны хайсан бүтээгдэхүүн олдсонгүй эсвэл устгагдсан байна.")
  const backBtnLabel = useTranslatedValue("products.back_to_list", "Бүх бүтээгдэхүүн рүү буцах")
  const addToCartLabel = useTranslatedValue("products.add_to_cart", "Сагсанд нэмэх")
  const buyNowLabel = useTranslatedValue("products.buy_now", "Шууд худалдан авах")
  const outOfStockLabel = useTranslatedValue("products.out_of_stock", "Дууссан")
  const quantityLabel = useTranslatedValue("common.quantity", "Тоо ширхэг")
  const successLabel = useTranslatedValue("common.success", "Амжилттай")
  const pieceLabel = useTranslatedValue("common.piece", "ширхэг")

  // Always at 0 initially when data loads
  useEffect(() => {
    if (product?.images) {
      setSelectedImage(0)
    }
  }, [product])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-500 font-bold">{loadingLabel}</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center rounded-3xl shadow-xl border-emerald-900/10">
          <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-gray-900 mb-2 uppercase">{notFoundLabel}</h1>
          <p className="text-gray-500 font-bold mb-8">{notFoundDesc}</p>
          <Link href="/products" className="w-full">
            <Button className="w-full bg-emerald-900 hover:bg-black text-white font-black h-12 rounded-2xl">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {backBtnLabel}
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  const images = parseImagePaths(product.images).length > 0 ? parseImagePaths(product.images) : [getPrimaryImage(product.images)]
  const inStock = product.stock > 0

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      type: "PRODUCT",
      name: product.name,
      seller: "Монголын бүтээгдэхүүн",
      price: product.price,
      quantity: quantity,
      image: images[0] || "/placeholder.svg",
      category: product.category?.name || "Бараа",
      stock: product.stock
    })
    toast({
      title: successLabel,
      description: `${translatedName} ${useTranslatedValue("common.added_to_cart", "сагсанд")} ${quantity} ${pieceLabel} ${useTranslatedValue("common.added_suffix", "нэмэгдлээ")}`,
    })
  }

  const handleBuyNow = () => {
    handleAddToCart()
    router.push("/cart")
  }

  const handleSaveProduct = () => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Нэвтрэх шаардлагатай",
        description: "Бүтээгдэхүүн хадгалахын тулд нэвтрэх шаардлагатай.",
        variant: "destructive",
      })
      return
    }

    toggleSave({
      id: product.id,
      type: "product",
      data: {
        name: product.name,
        price: product.price,
        image: images[0],
      }
    })

    toast({
      title: isSaved ? "Хадгалсан бүтээгдэхүүн" : "Амжилттай хадгалагдлаа",
      description: isSaved ? "Жагсаалтаас хасагдлаа." : "Хадгалсан жагсаалтад нэмэгдлээ.",
    })
  }

  const handleShareProduct = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      }).catch((error) => console.log('Error sharing:', error))
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Холбоос хуулагдлаа",
        description: "Бүтээгдэхүүний холбоос амжилттай хуулагдлаа.",
      })
    }
  }

  return (
    <div className="min-h-screen bg-[#fdfcf0]/30 font-sans selection:bg-emerald-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        {/* Navigation / Breadcrumbs */}
        <div className="flex items-center justify-between mb-8 sm:mb-12">
          <Link href="/products">
            <Button variant="ghost" className="text-gray-500 hover:text-emerald-900 font-bold gap-2">
              <ArrowLeft className="w-4 h-4" />
              {useTranslatedValue("products.all_products", "Бүх бүтээгдэхүүн")}
            </Button>
          </Link>
          <div className="flex gap-2">
             <Button 
               variant="outline" 
               size="icon" 
               className={`rounded-full border-gray-200 transition-all ${isSaved ? "bg-red-50 border-red-200 text-red-500" : "bg-white"}`}
               onClick={handleSaveProduct}
             >
                <Heart className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
             </Button>
             <Button 
               variant="outline" 
               size="icon" 
               className="rounded-full border-gray-200 bg-white" 
               onClick={handleShareProduct}
             >
                <Share2 className="w-4 h-4" />
             </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16">
          {/* Left: Image Gallery (Lg: 7 cols) */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            <div className="relative aspect-square sm:aspect-[4/3] md:aspect-square bg-white rounded-[2.5rem] overflow-hidden border border-emerald-900/5 shadow-2xl shadow-emerald-900/5 group">
              <img
                src={images[selectedImage] || "/placeholder.svg"}
                alt={translatedName}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              {!inStock && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-10">
                  <div className="text-center transform -rotate-12 border-4 border-white px-8 py-3 rounded-2xl">
                    <span className="text-white font-black uppercase tracking-[0.2em] text-2xl sm:text-3xl">{outOfStockLabel}</span>
                  </div>
                </div>
              )}
              {/* Image Badges */}
              <div className="absolute top-6 left-6 flex flex-col gap-2">
                <span className="bg-white/90 backdrop-blur-md text-emerald-900 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ring-1 ring-black/5">
                  {useTranslatedValue(`cat.${product.category?.name}`, product.category?.name || "Бараа")}
                </span>
                {product.stock > 0 && product.stock < 5 && (
                  <span className="bg-red-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ring-2 ring-white/20 animate-pulse">
                    {useTranslatedValue("products.low_stock", "Цөөн үлдсэн")}
                  </span>
                )}
              </div>
            </div>
            
            {images.length > 1 && (
              <div className="flex flex-wrap gap-3 sm:gap-4 justify-start">
                {images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                      selectedImage === idx 
                        ? "border-emerald-700 ring-4 ring-emerald-700/10 scale-105" 
                        : "border-transparent hover:border-emerald-700/30 hover:scale-105 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt={product.name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info (Lg: 5 cols) */}
          <div className="lg:col-span-12 xl:col-span-5 lg:pl-4 xl:pl-0 flex flex-col items-start h-full">
            <div className="w-full">
              <div className="flex items-center gap-2 mb-6">
                <div className="flex text-amber-400">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">4.9 • 100+ {useTranslatedValue("products.orders", "Захиалга")}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#0F3D2E] mb-6 tracking-tighter leading-[0.9] uppercase break-words">
                {translatedName}
              </h1>
              
              <div className="flex items-baseline gap-2 mb-10 pb-10 border-b border-[#0F3D2E]/10">
                <span className="text-5xl font-black text-[#0F3D2E] tracking-tighter">{translatedPrice}</span>
              </div>

              <div className="space-y-8 mb-12">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0F3D2E]/50 mb-4">{useTranslatedValue("products.description", "Бүтээгдэхүүний тайлбар")}</h4>
                  <p className="text-gray-600 font-bold text-base sm:text-lg leading-relaxed max-w-xl">
                    {translatedDesc}
                  </p>
                </div>

                {/* Additional Info / Features */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white border border-[#0F3D2E]/5 shadow-sm">
                        <Check className="w-5 h-5 text-emerald-600 mb-2" />
                        <h5 className="text-xs font-black uppercase tracking-wider text-[#0F3D2E]">{useTranslatedValue("products.features.natural", "100% Байгалийн")}</h5>
                        <p className="text-[10px] text-gray-400 font-medium mt-1">{useTranslatedValue("products.features.natural_desc", "Цэвэр монгол бүтээгдэхүүн")}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white border border-[#0F3D2E]/5 shadow-sm">
                        <Shield className="w-5 h-5 text-emerald-600 mb-2" />
                        <h5 className="text-xs font-black uppercase tracking-wider text-[#0F3D2E]">{useTranslatedValue("products.features.quality", "Чанартай")}</h5>
                        <p className="text-[10px] text-gray-400 font-medium mt-1">{useTranslatedValue("products.features.quality_desc", "Малчдын гараар бүтсэн")}</p>
                    </div>
                </div>
              </div>
            </div>

            {/* Purchase Controls Sticking to Bottom or just below content */}
            <div className="w-full mt-auto pt-8 border-t-2 border-[#0F3D2E]/5 space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0F3D2E]/50 mb-3">{quantityLabel}</h4>
                  <div className="flex items-center border-2 border-[#0F3D2E] rounded-2xl bg-white p-1 overflow-hidden shadow-lg shadow-[#0F3D2E]/5">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      disabled={quantity <= 1 || !inStock}
                      className="p-3 hover:bg-gray-50 rounded-xl transition-all disabled:opacity-30 active:scale-90"
                    >
                      <Minus className="w-5 h-5 text-[#0F3D2E]" />
                    </button>
                    <span className="w-12 text-center font-black text-xl text-[#0F3D2E]">{quantity}</span>
                    <button
                      onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                      disabled={quantity >= product.stock || !inStock}
                      className="p-3 hover:bg-gray-50 rounded-xl transition-all disabled:opacity-30 active:scale-90"
                    >
                      <Plus className="w-5 h-5 text-[#0F3D2E]" />
                    </button>
                  </div>
                </div>
                <div className="text-right">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0F3D2E]/50 mb-3">{useTranslatedValue("products.stock_status", "Найдвартай")}</h4>
                    <span className={`text-xl font-black ${product.stock < 10 ? "text-red-500" : "text-[#0F3D2E]"}`}>
                        {product.stock} <span className="text-xs">{pieceLabel}</span>
                    </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-16 rounded-2xl border-4 border-[#0F3D2E] text-[#0F3D2E] font-black uppercase tracking-widest hover:bg-[#0F3D2E] hover:text-white transition-all active:scale-[0.98] disabled:grayscale disabled:opacity-30"
                  disabled={!inStock}
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="w-5 h-5 mr-3" />
                  {addToCartLabel}
                </Button>
                <Button
                  size="lg"
                  className="h-16 rounded-2xl bg-[#0F3D2E] hover:bg-black text-white font-black uppercase tracking-widest shadow-2xl shadow-[#0F3D2E]/40 transition-all active:scale-[0.98] disabled:grayscale disabled:opacity-30"
                  disabled={!inStock}
                  onClick={handleBuyNow}
                >
                  {buyNowLabel}
                </Button>
              </div>

              {/* Delivery info */}
              <div className="bg-white/60 p-6 rounded-3xl border border-[#0F3D2E]/5 flex items-center justify-around">
                <div className="text-center group cursor-default">
                    <Truck className="w-6 h-6 text-emerald-800 mx-auto mb-2 transition-transform group-hover:-translate-y-1" />
                    <span className="block text-[10px] font-black uppercase tracking-tighter text-[#0F3D2E]">{useTranslatedValue("products.fast_delivery", "Хурдан хүргэлт")}</span>
                </div>
                <Separator orientation="vertical" className="h-10 bg-[#0F3D2E]/10" />
                <div className="text-center group cursor-default">
                    <Shield className="w-6 h-6 text-emerald-800 mx-auto mb-2 transition-transform group-hover:-translate-y-1" />
                    <span className="block text-[10px] font-black uppercase tracking-tighter text-[#0F3D2E]">{useTranslatedValue("products.safe_shipping", "Найдвартай")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
