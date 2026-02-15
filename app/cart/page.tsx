"use client";

import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  ChevronRight,
  ArrowLeft,
  ShieldCheck,
  Truck
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { gql, useMutation } from "@apollo/client";

// Mutation for creating a product order
const CREATE_ORDER = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      id
      status
    }
  }
`;

// Mutation for creating a camp booking
const CREATE_BOOKING = gql`
  mutation CreateBooking($input: CreateBookingInput!) {
    createBooking(input: $input) {
      id
      status
    }
  }
`;

export default function CartPage() {
  const { cartItems, bookingCart, updateQuantity, removeFromCart, removeFromBookingCart, clearCart, totalPrice } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const [createOrder] = useMutation(CREATE_ORDER);
  const [createBooking] = useMutation(CREATE_BOOKING);

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/cart");
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Process Order (Products)
      if (cartItems.length > 0) {
        const items = cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity
        }));

        await createOrder({
          variables: {
            input: {
              shippingAddress: "Улаанбаатар хот",
              paymentInfo: "CASH",
              items
            }
          }
        });
      }

      // 2. Process Bookings (Camps)
      for (const booking of bookingCart) {
        await createBooking({
          variables: {
            input: {
              yurtId: booking.id,
              startDate: booking.startDate,
              endDate: booking.endDate
            }
          }
        });
      }

      toast({
        title: "Амжилттай",
        description: "Таны захиалга бүртгэгдлээ. Бид удахгүй холбогдох болно.",
      });

      // Clear relevant local storage
      clearCart();
      localStorage.removeItem("bookingCart");
      localStorage.removeItem("selectedItems");

      router.push("/user-dashboard");
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Алдаа",
        description: "Захиалга хийхэд алдаа гарлаа. Дахин оролдоно уу.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const hasItems = cartItems.length > 0 || bookingCart.length > 0;

  if (!hasItems) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm mb-6">
          <ShoppingBag className="w-10 h-10 text-gray-300" />
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">Таны сагс хоосон байна</h1>
        <p className="text-gray-500 mb-8 max-w-xs text-center font-medium">
          Та манай бүтээгдэхүүн болон амралтын баазуудаас сонголтоо хийн сагсандаа нэмээрэй.
        </p>
        <Link href="/listings">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl px-8 h-12 font-black shadow-lg shadow-emerald-100 transition-all active:scale-95">
            Шоппинг хийх
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-2 text-gray-400 mb-8">
          <Link href="/" className="hover:text-emerald-600 transition-colors text-xs font-black uppercase tracking-widest">Нүүр</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 text-xs font-black uppercase tracking-widest">Сагс</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-10 tracking-tight">Миний сагс</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Items List */}
          <div className="lg:col-span-8 space-y-6">
            {/* Products Section */}
            {cartItems.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h2 className="text-sm font-black uppercase tracking-widest text-gray-400">Бүтээгдэхүүн ({cartItems.length})</h2>
                </div>
                {cartItems.map((item) => (
                  <Card key={item.id} className="border-none shadow-[0_2px_15px_rgba(0,0,0,0.03)] rounded-3xl overflow-hidden bg-white group transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center space-x-4 sm:space-x-6">
                        <div className="w-20 h-20 sm:w-28 sm:h-28 flex-shrink-0 bg-gray-50 rounded-2xl overflow-hidden relative">
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h3 className="text-base sm:text-lg font-black text-gray-900 truncate pr-4">{item.name}</h3>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-gray-300 hover:text-red-500 transition-colors p-1"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                          <div className="flex items-center space-x-3 mt-2 text-xs font-bold text-gray-500">
                            <span className="bg-gray-100 px-2 py-1 rounded-md">Бараа</span>
                            <span className="text-emerald-600">Нөөцөд байгаа</span>
                          </div>
                          <div className="flex items-center justify-between mt-4 sm:mt-6">
                            <div className="flex items-center border border-gray-100 rounded-xl p-1 bg-gray-50">
                              <button
                                onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-all text-gray-600"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-10 text-center text-sm font-black text-gray-900">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-all text-gray-600"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="text-right">
                              <p className="text-lg sm:text-xl font-black text-gray-900">₮{(item.price * item.quantity).toLocaleString()}</p>
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">₮{item.price.toLocaleString()} / нэгж</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Bookings Section */}
            {bookingCart.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2 pt-4">
                  <h2 className="text-sm font-black uppercase tracking-widest text-gray-400">Амралт бааз ({bookingCart.length})</h2>
                </div>
                {bookingCart.map((item) => (
                  <Card key={item.id} className="border-none shadow-[0_2px_15px_rgba(0,0,0,0.03)] rounded-3xl overflow-hidden bg-white group transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center space-x-4 sm:space-x-6">
                        <div className="w-20 h-20 sm:w-28 sm:h-28 flex-shrink-0 bg-gray-50 rounded-2xl overflow-hidden relative">
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h3 className="text-base sm:text-lg font-black text-gray-900 truncate pr-4">{item.name}</h3>
                            <button
                              onClick={() => removeFromBookingCart(item.id)}
                              className="text-gray-300 hover:text-red-500 transition-colors p-1"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 mb-4">
                            <div className="flex items-center text-xs font-bold text-gray-500">
                              <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md mr-2 uppercase tracking-tighter">Байрлах</span>
                              <span>{item.startDate} - {item.endDate}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Нийт үнэ</p>
                            <div className="text-right">
                              <p className="text-lg sm:text-xl font-black text-gray-900">₮{item.totalPrice.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <Link href="/listings" className="inline-flex items-center text-sm font-black text-emerald-600 hover:text-emerald-700 transition-colors px-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              ДАХИН СОНГОЛТ ХИЙХ
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4 sticky top-24">
            <Card className="border-none shadow-[0_4px_30px_rgba(0,0,0,0.05)] rounded-[2.5rem] bg-white overflow-hidden">
              <CardContent className="p-8">
                <h2 className="text-xl font-black text-gray-900 mb-8 border-b border-gray-50 pb-6">Захиалгын дүн</h2>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-sm font-bold text-gray-500">
                    <span>Нийт бараа</span>
                    <span className="text-gray-900">₮{totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-gray-500">
                    <span>Хүргэлт</span>
                    <span className="text-emerald-600">Үнэгүй</span>
                  </div>
                  <div className="h-px bg-gray-50 my-6"></div>
                  <div className="flex justify-between items-end">
                    <span className="text-base font-black text-gray-900 uppercase tracking-widest">Нийт дүн</span>
                    <span className="text-3xl font-black text-gray-900 tracking-tighter">₮{totalPrice.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center space-x-3 text-[11px] text-gray-400 font-bold uppercase">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Баталгаат төлбөр тооцоо</span>
                  </div>
                  <div className="flex items-center space-x-3 text-[11px] text-gray-400 font-bold uppercase">
                    <Truck className="w-4 h-4 text-emerald-500" />
                    <span>Шуурхай хүргэлтийн үйлчилгээ</span>
                  </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-14 font-black text-lg transition-all active:scale-95 shadow-xl shadow-emerald-100 disabled:opacity-50"
                >
                  {isProcessing ? "Уншиж байна..." : "Захиалах"}
                </Button>

                <p className="text-[10px] text-gray-400 text-center mt-6 font-bold uppercase leading-relaxed px-4">
                  Төлбөр төлөх товчийг дарснаар та манай үйлчилгээний нөхцлийг зөвшөөрч буйгаа баталгаажуулна.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
