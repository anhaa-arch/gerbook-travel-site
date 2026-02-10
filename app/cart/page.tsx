"use client"

import { useTranslation } from "react-i18next"
import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Calendar, Users, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import '../../lib/i18n'
import { useCart } from "@/hooks/use-cart"
import { toast } from "@/hooks/use-toast"

export default function CartPage() {
  const { t } = useTranslation()
  const { cartItems, removeFromCart, updateQuantity, subtotal, itemCount } = useCart()

  // Helper to format identifiers for display
  const getClientId = (item: any) => {
    if (item.type === "CAMP" || item.type === "TRAVEL") {
      return `${item.id}-${item.startDate}-${item.endDate}`;
    }
    return item.id;
  };

  const shipping = subtotal > 100000 ? 0 : 5000
  const tax = subtotal * 0.1 // 10% VAT in Mongolia
  const total = subtotal + shipping + tax

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border">
            <ShoppingBag className="w-24 h-24 text-gray-200 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Таны сагс хоосон байна</h2>
            <p className="text-gray-500 mb-8 font-medium">Монголын уламжлалт бүтээгдэхүүн болон амралтын баазуудыг сагсандаа нэмээрэй</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/products">
                <Button className="bg-emerald-600 hover:bg-emerald-700 font-semibold w-full sm:w-auto">Бүтээгдэхүүн үзэх</Button>
              </Link>
              <Link href="/camps">
                <Button variant="outline" className="font-semibold w-full sm:w-auto">Гэр бааз захиалах</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back to Products */}
        <div className="mb-6">
          <Link href="/products" className="inline-block">
            <Button variant="ghost" className="p-0 h-auto font-bold text-gray-500 hover:text-emerald-700 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Худалдан авалт үргэлжлүүлэх
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader className="bg-white border-b px-6 py-4">
                <CardTitle className="text-lg font-bold flex items-center justify-between">
                  <span>Сагсны мэдээлэл</span>
                  <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">{itemCount} сонголт</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {cartItems.map((item) => {
                    const clientId = getClientId(item);
                    return (
                      <div
                        key={clientId}
                        className="flex flex-col sm:flex-row gap-4 p-6 bg-white hover:bg-gray-50/50 transition-colors"
                      >
                        {/* Image */}
                        <div className="flex-shrink-0 relative group">
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            width={120}
                            height={120}
                            className="rounded-xl object-cover w-24 h-24 sm:w-28 sm:h-28 shadow-sm"
                          />
                          <div className="absolute top-2 left-2 px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded-md text-[10px] font-bold shadow-sm uppercase tracking-wider">
                            {item.type === "CAMP" ? "Амралт" : "Бараа"}
                          </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                          <div className="space-y-1">
                            <div className="flex justify-between items-start gap-2">
                              <h3 className="font-bold text-gray-900 text-base sm:text-lg group-hover:text-emerald-700 transition-colors truncate">
                                {item.name}
                              </h3>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  removeFromCart(clientId);
                                  toast({
                                    title: "Устгагдлаа",
                                    description: item.name,
                                  });
                                }}
                                className="text-gray-400 hover:text-red-500 hover:bg-red-50 -mt-2 -mr-2"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>

                            {item.type === "CAMP" ? (
                              <div className="space-y-1.5 mt-1">
                                <div className="flex items-center text-xs sm:text-sm text-gray-600 font-medium">
                                  <Calendar className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
                                  <span>{item.startDate} - {item.endDate}</span>
                                </div>
                                <div className="flex items-center text-xs sm:text-sm text-gray-600 font-medium">
                                  <Users className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
                                  <span>{item.guests} зочин</span>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-1 mt-1">
                                <p className="text-xs text-gray-500 font-bold truncate">by {item.seller || "Малчин"}</p>
                                <p className="text-[11px] text-emerald-600 bg-emerald-50 inline-block px-2 py-0.5 rounded font-bold uppercase tracking-wide">
                                  {item.category}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="flex items-end justify-between mt-4">
                            <div className="flex items-center border-2 border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm">
                              <button
                                onClick={() => updateQuantity(clientId, item.quantity - 1)}
                                className="h-8 w-8 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600 disabled:opacity-30"
                                disabled={item.quantity <= 1 && item.type === "CAMP"} // Camps usually qty 1
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="font-bold w-10 text-center text-sm">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(clientId, item.quantity + 1)}
                                className="h-8 w-8 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600 disabled:opacity-30"
                                disabled={item.type === "CAMP"} // Usually 1 booking
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-400 font-bold line-through">
                                {item.type === "CAMP" ? "" : `₮${(item.price * item.quantity * 1.1).toLocaleString()}`}
                              </p>
                              <p className="font-black text-lg sm:text-xl text-emerald-600 tracking-tight">
                                ₮{(item.price * item.quantity).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 border-none shadow-lg overflow-hidden rounded-2xl">
              <CardHeader className="bg-emerald-600 text-white px-6 py-5">
                <CardTitle className="text-lg font-bold">Төлбөрийн мэдээлэл</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-gray-600 font-medium">
                    <span>Бараанууд</span>
                    <span className="text-gray-900 font-bold">₮{subtotal.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center text-gray-600 font-medium">
                    <span>Хүргэлт / Хураамж</span>
                    <span className={shipping === 0 ? "text-emerald-600 font-black uppercase text-xs" : "text-gray-900 font-bold"}>
                      {shipping === 0 ? "Үнэгүй" : `₮${shipping.toLocaleString()}`}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-gray-600 font-medium">
                    <span>НӨАТ (10%)</span>
                    <span className="text-gray-900 font-bold">₮{tax.toLocaleString()}</span>
                  </div>

                  <Separator className="bg-gray-100" />

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-bold text-gray-900">Нийт төлөх</span>
                    <span className="text-2xl font-black text-emerald-600 tracking-tighter">₮{total.toLocaleString()}</span>
                  </div>
                </div>

                {subtotal < 100000 && (
                  <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl animate-pulse">
                    <p className="text-xs text-amber-800 font-semibold flex items-center">
                      <span className="mr-2">🚛</span> ₮{(100000 - subtotal).toLocaleString()} нэмээд үнэгүй хүргүүлээрэй!
                    </p>
                  </div>
                )}

                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] transition-all font-black text-base py-6 rounded-xl shadow-md hover:shadow-lg">
                  ЗАХИАЛГА БАТАЛГААЖУУЛАХ
                </Button>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-400 font-bold uppercase tracking-widest">
                    <div className="w-4 h-[1px] bg-gray-200"></div>
                    <span>Аюулгүй төлбөр</span>
                    <div className="w-4 h-[1px] bg-gray-200"></div>
                  </div>
                  <div className="flex justify-center gap-4 grayscale opacity-50">
                    <div className="w-8 h-5 bg-blue-800 rounded"></div>
                    <div className="w-8 h-5 bg-red-600 rounded"></div>
                    <div className="w-8 h-5 bg-orange-500 rounded"></div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">Нөхцөлүүд</h4>
                  <ul className="text-[11px] text-gray-500 space-y-2 font-bold leading-tight">
                    <li className="flex items-start">
                      <span className="text-emerald-500 mr-2">✓</span> {shipping === 0 ? "Одоо таны хүргэлт ҮНЭГҮЙ байна." : "100к-с дээш захиалга хүргэлтгүй."}
                    </li>
                    <li className="flex items-start">
                      <span className="text-emerald-500 mr-2">✓</span> Барааг 5-7 ажлын өдөрт хүргэнэ.
                    </li>
                    <li className="flex items-start">
                      <span className="text-emerald-500 mr-2">✓</span> Амралтын баазын захиалга шууд баталгаажна.
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
