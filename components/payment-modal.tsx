"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
  ShoppingBag,
  RefreshCw
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { gql, useMutation } from "@apollo/client";
import QRCode from "react-qr-code";

const CREATE_BOOKING_PAYMENT = gql`
  mutation CreateBookingPayment($bookingId: String!) {
  createBookingPayment(bookingId: $bookingId) {
    invoiceId
    qrText
      urls {
      name
      link
    }
  }
}
`;

const CREATE_ORDER_PAYMENT = gql`
  mutation CreateOrderPayment($orderId: String!) {
  createOrderPayment(orderId: $orderId) {
    invoiceId
    qrText
      urls {
      name
      link
    }
  }
}
`;

const CHECK_QPAY_ORDER = gql`
  mutation CheckQPayOrder($orderId: String!) {
    checkQPayPaymentAndConfirmOrder(orderId: $orderId) {
      id
      status
    }
  }
`;

const CHECK_QPAY_BOOKING = gql`
  mutation CheckQPayBooking($bookingId: String!) {
    checkQPayPaymentAndConfirmBooking(bookingId: $bookingId) {
      id
      status
    }
  }
`;

const CHECK_QPAY_EVENT_BOOKING = gql`
  mutation CheckQPayEventBooking($bookingId: String!) {
    checkQPayEventPaymentAndConfirm(bookingId: $bookingId) {
      id
      status
    }
  }
`;

const CREATE_EVENT_BOOKING_PAYMENT = gql`
  mutation CreateEventBookingPayment($bookingId: ID!) {
    createEventBookingPayment(bookingId: $bookingId) {
      invoiceId
      qrText
      qrImage
      urls {
        name
        link
      }
    }
  }
`;

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
  eventDetails?: {
    title: string;
    location: string;
    startDate: string;
    endDate: string;
    peopleCount: number;
    total: number;
    image?: string;
  };
  bookingId?: string;
  eventBookingId?: string;
  orderId?: string;
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
    description: "QPay-ээр төлөх (Уншиж байна...)",
    icon: "🇲🇳",
    color: "bg-blue-600",
    available: true,
  },
  {
    id: "bank_transfer",
    name: "Нэхэмжлэхээр төлөх",
    description: "Дансаар шилжүүлж баталгаажуулах.",
    icon: "🏦",
    color: "bg-emerald-600",
    available: true,
  },
];

export function PaymentModal({
  isOpen,
  onClose,
  onComplete,
  amount,
  bookingDetails,
  bookingId,
  eventBookingId,
  eventDetails,
  orderId,
}: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<string | null>("qpay");
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVV, setCardCVV] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [qpayData, setQpayData] = useState<any>(null);

  const [createBookingPayment, { error: qpayBookingMutationError }] = useMutation(CREATE_BOOKING_PAYMENT);
  const [createOrderPayment, { error: qpayOrderMutationError }] = useMutation(CREATE_ORDER_PAYMENT);
  const [createEventPayment, { error: qpayEventMutationError }] = useMutation(CREATE_EVENT_BOOKING_PAYMENT);
  const [checkBookingPayment, { loading: isCheckingBooking }] = useMutation(CHECK_QPAY_BOOKING);
  const [checkOrderPayment, { loading: isCheckingOrder }] = useMutation(CHECK_QPAY_ORDER);
  const [checkEventPayment, { loading: isCheckingEvent }] = useMutation(CHECK_QPAY_EVENT_BOOKING);

  const isChecking = isCheckingBooking || isCheckingOrder || isCheckingEvent;

  // Log GraphQL errors for debugging
  useEffect(() => {
    if (qpayBookingMutationError) {
      console.error('CreateBookingPayment GraphQL error:', qpayBookingMutationError.graphQLErrors, qpayBookingMutationError.networkError);
    }
    if (qpayOrderMutationError) {
      console.error('CreateOrderPayment GraphQL error:', qpayOrderMutationError.graphQLErrors, qpayOrderMutationError.networkError);
    }
  }, [qpayBookingMutationError, qpayOrderMutationError]);

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

    if (selectedMethod === "qpay") {
      if (!bookingId && !orderId) {
        console.error('QPay Error: Missing bookingId and orderId — cannot call QPay mutations with empty variables');
        alert("Захиалгын ID олдсонгүй. Дахин оролдоно уу.");
        setIsProcessing(false);
        return;
      }

      try {
        let qpayResponseData = null;

        // If it's a product order, prioritize order payment
        if (orderId) {
          console.log('CreateOrderPayment vars:', { orderId });
          const { data } = await createOrderPayment({
            variables: { orderId: orderId },
          });
          qpayResponseData = data?.createOrderPayment;
        }
        // If it's an event booking
        else if (eventBookingId) {
          console.log('CreateEventBookingPayment vars:', { bookingId: eventBookingId });
          const { data } = await createEventPayment({
            variables: { bookingId: eventBookingId },
          });
          qpayResponseData = data?.createEventBookingPayment;
        }
        // Otherwise it's a camp booking payment
        else if (bookingId) {
          console.log('CreateBookingPayment vars:', { bookingId });
          const { data } = await createBookingPayment({
            variables: { bookingId: bookingId },
          });
          qpayResponseData = data?.createBookingPayment;
        }

        if (qpayResponseData) {
          setQpayData(qpayResponseData);
        }
      } catch (err: any) {
        console.error("QPay Error:", err);
        if (err.graphQLErrors) console.error("GraphQL errors:", err.graphQLErrors);
        if (err.networkError) console.error("Network error:", err.networkError);
        alert("QPay нэхэмжлэл үүсгэхэд алдаа гарлаа: " + (err.message || "Unknown error"));
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      alert("Төлбөр амжилттай төлөгдлөө!");
      onComplete(selectedMethod);
    }, 2000);
  };

  const handleCheckPayment = async () => {
    try {
      if (orderId) {
        const { data } = await checkOrderPayment({ variables: { orderId } });
        if (data?.checkQPayPaymentAndConfirmOrder?.status === "CONFIRMED") {
          alert("Төлбөр амжилттай төлөгдлөө!");
          onComplete("qpay");
        } else {
          alert("Төлбөр хараахан төлөгдөөгүй байна.");
        }
      } else if (bookingId) {
        const { data } = await checkBookingPayment({ variables: { bookingId } });
        if (data?.checkQPayPaymentAndConfirmBooking?.status === "CONFIRMED") {
          alert("Төлбөр амжилттай төлөгдлөө!");
          onComplete("qpay");
        } else {
          alert("Төлбөр хараахан төлөгдөөгүй байна.");
        }
      }
    } catch (err: any) {
      console.error("Check payment error:", err);
      alert("Төлбөр шалгахад алдаа гарлаа: " + (err.message || "Unknown error"));
    }
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
          <DialogDescription className="text-sm text-gray-500">
            Төлбөрөө QPay болон банкны апп-аар төлнө үү.
          </DialogDescription>
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
                          <p className="font-medium">Гарах цаг: {formatDate(bookingDetails.checkOut)}</p>
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
                   ) : eventDetails ? (
                  <>
                    {eventDetails.image && (
                      <img
                        src={eventDetails.image}
                        alt={eventDetails.title}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    )}
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <ShoppingBag className="w-4 h-4 mt-1 text-gray-500" />
                        <div>
                          <p className="font-semibold text-sm">{eventDetails.title}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 mt-1 text-gray-500" />
                        <p className="text-sm text-gray-600">{eventDetails.location}</p>
                      </div>
                      <Separator />
                      <div className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 mt-1 text-gray-500" />
                        <div className="text-sm">
                          <p className="font-medium">Огноо: {eventDetails.startDate} - {eventDetails.endDate}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Users className="w-4 h-4 mt-1 text-gray-500" />
                        <p className="text-sm">{eventDetails.peopleCount} хүн</p>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-base font-bold">
                        <span>Нийт дүн</span>
                        <span className="text-emerald-600">₮{eventDetails.total.toLocaleString()}</span>
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
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
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
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
  selectedMethod === method.id
  ? "border-emerald-500 bg-emerald-50"
  : "border-gray-200 hover:border-gray-300"
} ${
  !method.available
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
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
  selectedBank === bank.id
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

              {/* QPay Details */}
              {selectedMethod === "qpay" && qpayData && (
                <div className="space-y-4 p-6 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex flex-col items-center gap-4 text-center">
                    <h4 className="font-bold text-lg">QPay-ээр төлөх</h4>

                    <div className="bg-white p-4 rounded-xl shadow-sm">
                      {qpayData.qrImage ? (
                        <img 
                          src={`data:image/png;base64,${qpayData.qrImage}`} 
                          alt="QPay QR Code" 
                          className="w-48 h-48 mx-auto"
                        />
                      ) : (
                        <QRCode value={qpayData.qrText} size={200} />
                      )}
                    </div>

                    <p className="text-sm text-gray-600 px-4">
                      Та өөрийн банкны аппликейшныг ашиглан дээрх QR кодыг уншуулж төлбөрөө төлнө үү.
                    </p>

                    <div className="w-full space-y-2 mt-2">
                      <p className="text-xs font-bold text-gray-500 uppercase text-left">Wallet / Апп-аар төлөх:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {qpayData.urls.map((url: any) => (
                          <a
                            key={url.name}
                            href={url.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center p-2 bg-white border rounded text-xs font-semibold hover:bg-gray-50 transition-colors"
                          >
                            {url.name}
                          </a>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={handleCheckPayment}
                      disabled={isChecking}
                      className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                    >
                      {isChecking ? (
                        <span className="flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Шалгаж байна...
                        </span>
                      ) : (
                        "Төлбөр шалгах"
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Warning if QPay selected but booking/order not yet created */}
              {selectedMethod === "qpay" && !bookingId && !orderId && !eventBookingId && (
                <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3 mt-2">
                  ⚠️ Захиалгын ID үүсгэгдээгүй байна. Хэрэв "Захиалах" товч дарж захиалга үүсгэсний дараа л QPay-ийн нэхэмжлэл гарна.
                </div>
              )}

              {/* Payment Button */}
              <div className="space-y-3 mt-6">
                <Button
                  onClick={handlePayment}
                  disabled={!selectedMethod || isProcessing || (selectedMethod === 'qpay' && !!qpayData)}
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
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
