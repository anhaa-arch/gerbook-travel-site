"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Calendar, Users, ShieldCheck, CreditCard, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { gql, useMutation } from "@apollo/client"
import '../../lib/i18n'
import { useCart } from "@/hooks/use-cart"
import { useToast } from "@/components/ui/use-toast"
import { PaymentModal } from "@/components/payment-modal"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

const CREATE_ORDER = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      id
      status
      totalPrice
      createdAt
    }
  }
`;

const CREATE_BOOKING = gql`
  mutation CreateBooking($input: CreateBookingInput!) {
    createBooking(input: $input) {
      id
      status
      startDate
      endDate
      totalPrice
      yurt {
        id
        name
      }
    }
  }
`;

export default function CartPage() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const { cartItems, removeFromCart, updateQuantity, subtotal, itemCount, clearCart } = useCart()
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const [createOrder] = useMutation(CREATE_ORDER);
  const [createBooking] = useMutation(CREATE_BOOKING);

  // Helper to format identifiers for display
  const getClientId = (item: any) => {
    if (item.type === "CAMP" || item.type === "TRAVEL") {
      return `${item.id}-${item.startDate}-${item.endDate}`;
    }
    return item.id;
  };

  const shipping = subtotal > 100000 ? 0 : 5000
  const tax = subtotal * 0.1 // 10% VAT
  const total = subtotal + shipping + tax

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast({
        title: "Нэвтрэх шаардлагатай",
        description: "Захиалга хийхийн тулд нэвтэрнэ үү.",
        variant: "destructive",
      });
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = async (method: string) => {
    setIsProcessing(true);
    setShowPaymentModal(false);

    try {
      // Split items into products and bookings
      const productItems = cartItems.filter(item => item.type === "PRODUCT");
      const bookingItems = cartItems.filter(item => item.type === "CAMP" || item.type === "TRAVEL");

      // 1. Process Order (Products)
      if (productItems.length > 0) {
        const orderItems = productItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        }));

        await createOrder({
          variables: {
            input: {
              shippingAddress: "Улаанбаатар хот (Хэрэглэгчийн хаяг)",
              paymentInfo: method,
              orderItems
            }
          }
        });
      }

      // 2. Process Bookings (Camps/Travels)
      for (const item of bookingItems) {
        if (item.startDate && item.endDate) {
          await createBooking({
            variables: {
              input: {
                yurtId: item.id,
                startDate: new Date(item.startDate).toISOString(),
                endDate: new Date(item.endDate).toISOString()
              }
            }
          });
        }
      }

      // Success Logic
      toast({
        title: "Захиалга амжилттай",
        description: "Таны захиалга баталгаажлаа. Сагсны мэдээлэл цэвэрлэгдлээ.",
      });

      // Clear Cart state and localStorage
      clearCart();
      localStorage.removeItem("malchin_cart");
      localStorage.removeItem("bookingCart");
      localStorage.removeItem("selectedItems");

      // Redirect
      router.push("/user-dashboard");
    } catch (error: any) {
      console.error("Payment complete error:", error);
      toast({
        title: "Алдаа гарлаа",
        description: error.message || "Захиалга үүсгэхэд алдаа гарлаа. Дахин оролдоно уу.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white font-sans flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-2">
            <ShoppingBag className="w-10 h-10 text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 leading-tight">Сагс хоосон байна</h2>
          <p className="text-gray-500 font-medium">Танд одоогоор сонгосон бараа байхгүй байна. Манай дэлгүүрээс өөрт хэрэгцээт бараагаа сонгоорой.</p>
          <div className="flex flex-col gap-3 pt-4">
            <Link href="/listings" className="w-full">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 rounded-xl font-bold shadow-sm">
                Амралт бааз үзэх
              </Button>
            </Link>
            <Link href="/products" className="w-full">
              <Button variant="ghost" className="w-full h-12 rounded-xl font-bold text-gray-600">
                Бараа бүтээгдэхүүн үзэх
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans pb-20">
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Таны сагс</h1>
            <p className="text-gray-500 font-medium mt-1">Нийт {itemCount} нэр төрлийн бараа сонгогдлоо</p>
          </div>
          <Link href="/products">
            <Button variant="outline" className="rounded-xl border-gray-200 bg-white hover:bg-gray-50 font-bold text-gray-600 h-10 px-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Дэлгүүр рүү буцах
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            <div className="space-y-3">
              {cartItems.map((item) => {
                const clientId = getClientId(item);
                return (
                  <Card key={clientId} className="border-none shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden group">
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex gap-4 sm:gap-6">
                        {/* Image */}
                        <div className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 flex flex-col justify-between min-w-0">
                          <div>
                            <div className="flex justify-between items-start">
                              <h3 className="font-bold text-gray-900 text-base sm:text-lg truncate pr-4 group-hover:text-emerald-700 transition-colors">
                                {item.name}
                              </h3>
                              <button
                                onClick={() => removeFromCart(clientId)}
                                className="text-gray-300 hover:text-red-500 transition-colors p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                              {item.category || (item.type === "CAMP" ? "Амралт бааз" : "Бүтээгдэхүүн")}
                            </p>

                            {item.type === "CAMP" && (
                              <div className="flex flex-wrap gap-3 mt-3">
                                <div className="flex items-center text-[11px] font-bold text-gray-600 bg-gray-100/50 px-2 py-1 rounded-md">
                                  <Calendar className="w-3 h-3 mr-1.5 text-emerald-500" />
                                  {item.startDate} - {item.endDate}
                                </div>
                                <div className="flex items-center text-[11px] font-bold text-gray-600 bg-gray-100/50 px-2 py-1 rounded-md">
                                  <Users className="w-3 h-3 mr-1.5 text-emerald-500" />
                                  {item.guests} зочин
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center bg-gray-100/50 rounded-lg p-1">
                              <button
                                onClick={() => updateQuantity(clientId, item.quantity - 1)}
                                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm transition-all disabled:opacity-30"
                                disabled={item.type === "CAMP"}
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-8 text-center text-sm font-black text-gray-900">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(clientId, item.quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm transition-all disabled:opacity-30"
                                disabled={item.type === "CAMP"}
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Дүн</p>
                              <p className="font-black text-lg text-gray-900">₮{(item.price * item.quantity).toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4 lg:sticky lg:top-24">
            <Card className="border-none shadow-xl bg-white overflow-hidden rounded-3xl">
              <div className="p-8 space-y-8">
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Нийт дүн</h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-bold text-sm">Бараанууд ({itemCount})</span>
                    <span className="text-gray-900 font-black">₮{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-bold text-sm">Хүргэлтийн хураамж</span>
                    <span className={shipping === 0 ? "text-emerald-600 font-black text-xs uppercase" : "text-gray-900 font-black"}>
                      {shipping === 0 ? "Үнэгүй" : `₮${shipping.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-bold text-sm">НӨАТ (10%)</span>
                    <span className="text-gray-900 font-black">₮{tax.toLocaleString()}</span>
                  </div>

                  <Separator className="bg-gray-100 h-0.5 mt-6" />

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-black text-gray-900">Төлөх дүн</span>
                    <span className="text-3xl font-black text-emerald-600 tracking-tighter">₮{total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <Button
                    onClick={handleCheckout}
                    disabled={isProcessing}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all font-black text-base py-7 rounded-2xl shadow-lg shadow-emerald-200 uppercase tracking-widest text-white"
                  >
                    {isProcessing ? "Уншиж байна..." : "Төлбөр төлөх"}
                    {!isProcessing && <ChevronRight className="ml-2 w-5 h-5" />}
                  </Button>

                  <div className="flex items-center justify-center gap-3 py-2">
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-black uppercase tracking-widest">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span>Аюулгүй төлбөр</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 group hover:border-emerald-200 transition-colors">
                      <CreditCard className="w-5 h-5 text-gray-300 group-hover:text-emerald-500 transition-colors" />
                    </div>
                    <div className="h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 group hover:border-emerald-200 transition-colors">
                      <div className="font-black text-[10px] text-gray-300 group-hover:text-emerald-500">QR</div>
                    </div>
                    <div className="h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 group hover:border-emerald-200 transition-colors">
                      <div className="font-black text-[10px] text-gray-300 group-hover:text-emerald-500">BANK</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <div className="mt-8 p-6 bg-emerald-50 rounded-3xl border border-emerald-100/50">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-900 text-sm">Баталгаатай худалдан авалт</h4>
                  <p className="text-xs text-emerald-700/80 font-medium mt-1 leading-relaxed">
                    Манай систем таны мэдээллийг нууцалж, аюулгүй байдлыг 100% хангана.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onComplete={handlePaymentComplete}
        amount={total}
      />
    </div>
  )
}
