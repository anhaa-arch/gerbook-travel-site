"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import {
  CreditCard,
  Smartphone,
  Building,
  CheckCircle,
  X,
  Calendar,
  Users,
  MapPin,
  Home,
  ShoppingBag
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (paymentMethod: string) => void;
  amount?: number;
  bookingDetails?: {
    campName: string;
    location: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    nights: number;
    pricePerNight: number;
    serviceFee: number;
    total: number;
    image?: string;
  };
}

const banks = [
  { id: "khan", name: "Хаан банк", account: "5001234567", color: "bg-blue-600" },
  { id: "tdb", name: "ХХБанк", account: "4001234567", color: "bg-red-600" },
  { id: "golomt", name: "Голомт банк", account: "3001234567", color: "bg-green-600" },
  { id: "xac", name: "Хас банк", account: "2001234567", color: "bg-purple-600" },
  { id: "state", name: "Төрийн банк", account: "1001234567", color: "bg-orange-600" },
];

const paymentMethods = [
  {
    id: "qpay",
    name: "QPay",
    description: "Хурдан, шуурхай хуваан төлөх.",
    icon: "🇲🇳",
    color: "bg-blue-600",
    available: true,
  },
  {
    id: "bank_transfer",
    name: "Банкны дансаар",
    description: "Банк сонгож данс руу шилжүүлэг хийх",
    icon: "🏦",
    color: "bg-indigo-600",
    available: true,
  },
  {
    id: "card",
    name: "Банкны карт",
    description: "Visa, Mastercard, UnionPay",
    icon: "💳",
    color: "bg-gray-700",
    available: true,
  },
];

export function PaymentModal({
  isOpen,
  onClose,
  onComplete,
  amount,
  bookingDetails,
}: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVV, setCardCVV] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const displayTotal = bookingDetails?.total || amount || 0;

  const handlePayment = async () => {
    if (!selectedMethod) return;

    // Validation for bank transfer
    if (selectedMethod === "bank_transfer") {
      if (!selectedBank) {
        alert("Банк сонгоно уу");
        return;
      }
      if (!phoneNumber || phoneNumber.length < 8) {
        alert("Утасны дугаар оруулна уу");
        return;
      }
    }

    // Validation for card payment
    if (selectedMethod === "card") {
      if (!cardNumber || cardNumber.length < 16) {
        alert("Картын дугаар оруулна уу");
        return;
      }
      if (!cardExpiry) {
        alert("Дуусах хугацаа оруулна уу");
        return;
      }
      if (!cardCVV || cardCVV.length < 3) {
        alert("CVV код оруулна уу");
        return;
      }
    }

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      onComplete(selectedMethod);
    }, 2000);
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('mn-MN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl font-bold">
            Төлбөр төлөх
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mt-4">
          {/* Left: Summary */}
          <div className="md:col-span-2">
            <Card>
              <CardContent className="p-4 space-y-4">
                <h3 className="font-bold text-lg">Захиалгын дэлгэрэнгүй</h3>

                {bookingDetails ? (
                  <>
                    {bookingDetails.image && (
                      <img
                        src={bookingDetails.image}
                        alt={bookingDetails.campName}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    )}

                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <Home className="w-4 h-4 mt-1 text-gray-500" />
                        <div>
                          <p className="font-semibold text-sm">
                            {bookingDetails.campName}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 mt-1 text-gray-500" />
                        <p className="text-sm text-gray-600">
                          {bookingDetails.location}
                        </p>
                      </div>

                      <Separator />

                      <div className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 mt-1 text-gray-500" />
                        <div className="text-sm">
                          <p className="font-medium">Ирэх: {formatDate(bookingDetails.checkIn)}</p>
                          <p className="font-medium">Гарах: {formatDate(bookingDetails.checkOut)}</p>
                          <p className="text-gray-600 mt-1">
                            {bookingDetails.nights} хоног
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Users className="w-4 h-4 mt-1 text-gray-500" />
                        <p className="text-sm">
                          {bookingDetails.guests} зочин
                        </p>
                      </div>

                      <Separator />

                      {/* Price Breakdown */}
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            ₮{bookingDetails.pricePerNight.toLocaleString()} × {bookingDetails.nights} хоног
                          </span>
                          <span className="font-medium">
                            ₮{(bookingDetails.pricePerNight * bookingDetails.nights).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Үйлчилгээний хураамж</span>
                          <span className="font-medium">
                            ₮{bookingDetails.serviceFee.toLocaleString()}
                          </span>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-base font-bold">
                          <span>Нийт дүн</span>
                          <span className="text-emerald-600">
                            ₮{bookingDetails.total.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                      <ShoppingBag className="w-6 h-6 text-emerald-600" />
                      <div>
                        <p className="text-xs text-gray-500 font-bold uppercase">Сагсны нийт</p>
                        <p className="text-lg font-black text-emerald-700">₮{displayTotal.toLocaleString()}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      Сагсанд байгаа бүх бараа болон үйлчилгээний нийт төлбөр.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-gray-600">
                💡 Төлбөр амжилттай төлөгдсөний дараа захиалга баталгаажна.
              </p>
            </div>
          </div>

          {/* Right: Payment Methods */}
          <div className="md:col-span-3">
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Төлбөрийн арга</h3>

              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    disabled={!method.available || isProcessing}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${selectedMethod === method.id
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200 hover:border-gray-300"
                      } ${!method.available
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 ${method.color} rounded-lg flex items-center justify-center text-2xl`}>
                          {method.icon}
                        </div>
                        <div>
                          <p className="font-semibold text-base">
                            {method.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {method.description}
                          </p>
                        </div>
                      </div>
                      {selectedMethod === method.id && (
                        <CheckCircle className="w-6 h-6 text-emerald-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <Separator className="my-6" />

              {/* Bank Transfer Details */}
              {selectedMethod === "bank_transfer" && (
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-bold text-base">Банк сонгох</h4>

                  <div className="grid grid-cols-1 gap-2">
                    {banks.map((bank) => (
                      <button
                        key={bank.id}
                        onClick={() => setSelectedBank(bank.id)}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${selectedBank === bank.id
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 ${bank.color} rounded-lg flex items-center justify-center text-white font-bold`}>
                              {bank.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold">{bank.name}</p>
                              <p className="text-xs text-gray-600">
                                Данс: {bank.account}
                              </p>
                            </div>
                          </div>
                          {selectedBank === bank.id && (
                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  {selectedBank && (
                    <div className="space-y-3 mt-4 pt-4 border-t">
                      <div className="bg-white p-3 rounded border">
                        <p className="text-xs text-gray-600 mb-1">
                          Данс эзэмшигч
                        </p>
                        <p className="font-semibold">Малчин Camp LLC</p>
                      </div>

                      <div className="bg-white p-3 rounded border">
                        <p className="text-xs text-gray-600 mb-1">Дансны дугаар</p>
                        <p className="font-semibold text-lg">
                          {banks.find(b => b.id === selectedBank)?.account}
                        </p>
                      </div>

                      <div className="bg-white p-3 rounded border">
                        <p className="text-xs text-gray-600 mb-1">Гүйлгээний утга</p>
                        <p className="font-semibold">
                          ORDER-{displayTotal.toString().substring(0, 10)}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          Таны утасны дугаар
                        </label>
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="********"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none"
                          maxLength={8}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Card Payment Form */}
              {selectedMethod === "card" && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-bold text-base flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Картын мэдээлэл
                  </h4>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Картын дугаар
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        if (value.length <= 16) {
                          setCardNumber(value);
                        }
                      }}
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none font-mono text-lg"
                      maxLength={16}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Дуусах хугацаа
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, "");
                          if (value.length >= 2) {
                            value = value.substring(0, 2) + "/" + value.substring(2, 4);
                          }
                          if (value.length <= 5) {
                            setCardExpiry(value);
                          }
                        }}
                        placeholder="MM/YY"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none font-mono"
                        maxLength={5}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        CVV
                      </label>
                      <input
                        type="password"
                        value={cardCVV}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          if (value.length <= 4) {
                            setCardCVV(value);
                          }
                        }}
                        placeholder="123"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none font-mono"
                        maxLength={4}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Button */}
              <div className="space-y-3 mt-6">
                <Button
                  onClick={handlePayment}
                  disabled={!selectedMethod || isProcessing}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 text-lg font-semibold"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin text-xl">⏳</span>
                      Боловсруулж байна...
                    </span>
                  ) : (
                    <span>Төлөх ₮{displayTotal.toLocaleString()}</span>
                  )}
                </Button>

                <Button
                  onClick={onClose}
                  disabled={isProcessing}
                  variant="outline"
                  className="w-full"
                >
                  Цуцлах
                </Button>
              </div>

              <div className="text-xs text-gray-500 text-center">
                <p>
                  🔒 Таны төлбөр аюулгүй SSL шифрлэлттэй боловсруулагдана.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
