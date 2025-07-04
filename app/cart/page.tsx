"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import '../../lib/i18n'

interface CartItem {
  id: number
  name: string
  seller: string
  price: number
  quantity: number
  image: string
  category: string
}

export default function CartPage() {
  const { t } = useTranslation()

  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      name: "Айраг",
      seller: "Батбаярын гэр бүл",
      price: 25,
      quantity: 2,
      image: "/placeholder.svg?height=80&width=80&text=Airag",
      category: "Сүүн бүтээгдэхүүн"
    },
    {
      id: 2,
      name: "Гар нэхмэл хивс",
      seller: "Оюунаагийн урлал",
      price: 150,
      quantity: 1,
      image: "/placeholder.svg?height=80&width=80&text=Carpet",
      category: "Гар урлал"
    },
    {
      id: 3,
      name: "Ямаа бяслаг",
      seller: "Уулын малчид",
      price: 35,
      quantity: 3,
      image: "/placeholder.svg?height=80&width=80&text=Cheese",
      category: "Сүүн бүтээгдэхүүн"
    }
  ])

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity === 0) {
      removeItem(id)
      return
    }

    setCartItems((items) => items.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)))
  }

  const removeItem = (id: number) => {
    setCartItems((items) => items.filter((item) => item.id !== id))
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 100 ? 0 : 15
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <ShoppingBag className="w-24 h-24 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Таны сагс хоосон байна</h2>
            <p className="text-gray-600 mb-8 font-medium">Монголын уламжлалт бүтээгдэхүүнүүдийг сагсандаа нэмээрэй</p>
            <Link href="/products">
              <Button className="bg-emerald-600 hover:bg-emerald-700 font-semibold">{t('cart.browse_products')}</Button>
            </Link>
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
          <Link href="/products">
            <Button variant="ghost" className="p-0 h-auto font-medium text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Дэлгүүр үргэлжлүүлэх
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold">Сагсны мэдээлэл ({cartItems.length} бүтээгдэхүүн)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border rounded-lg bg-white shadow-sm"
                  >
                    <div className="flex-shrink-0 flex justify-center items-center">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="rounded-lg object-cover w-20 h-20"
                      />
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      <h3 className="font-bold text-gray-900 truncate text-base sm:text-lg">{item.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 font-semibold truncate">by {item.seller}</p>
                      <p className="text-xs text-gray-500 font-medium truncate">{item.category}</p>
                      <p className="text-base sm:text-lg font-bold text-emerald-600 mt-1">${item.price}</p>
                    </div>

                    <div className="flex flex-row sm:flex-col items-center gap-2 sm:gap-3 mt-2 sm:mt-0">
                      <div className="flex items-center border rounded-lg overflow-hidden bg-gray-50">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="h-9 w-9 p-0 text-lg"
                          aria-label="Багасгах"
                        >
                          <Minus className="w-5 h-5" />
                        </Button>
                        <span className="font-semibold w-8 text-center text-base">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="h-9 w-9 p-0 text-lg"
                          aria-label="Нэмэх"
                        >
                          <Plus className="w-5 h-5" />
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 h-9 w-9"
                        aria-label="Устгах"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>

                    <div className="text-right min-w-[80px] mt-2 sm:mt-0">
                      <p className="font-bold text-base sm:text-lg">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 w-full max-w-full">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Захиалгын хураангуй</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between font-semibold text-base">
                    <span>Нийт дүн</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between font-semibold text-base">
                    <span>Хүргэлт</span>
                    <span>{shipping === 0 ? "Үнэгүй" : `$${shipping.toFixed(2)}`}</span>
                  </div>

                  <div className="flex justify-between font-semibold text-base">
                    <span>НӨАТ</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Төлөх дүн</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {shipping > 0 && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-700 font-semibold">
                      Үнэгүй хүргэлт авахын тулд ${(100 - subtotal).toFixed(2)}₮ нэмээрэй!
                    </p>
                  </div>
                )}

                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold text-base py-3 rounded-lg">
                  {t('cart.proceed_to_checkout')}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-600 font-medium">SSL шифрлэлтийн аюулгүй төлбөр</p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-bold text-gray-900">Хүргэлтийн мэдээлэл</h4>
                  <ul className="text-sm text-gray-600 space-y-1 font-medium">
                    <li>• 100,000₮-с дээш захиалгад үнэгүй хүргэлт</li>
                    <li>• Стандарт хүргэлт: 5-7 ажлын өдөр</li>
                    <li>• Яаралтай хүргэлт боломжтой</li>
                    <li>• Олон улсын хүргэлт боломжтой</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-gray-900">Буцаалтын нөхцөл</h4>
                  <p className="text-sm text-gray-600 font-medium">
                    Бүх бүтээгдэхүүнд 30 хоногийн буцаалт. Бараа эх хувиараа байх ёстой.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
