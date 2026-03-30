"use client";

import { useQuery, useMutation, gql } from "@apollo/client";
import { ArrowLeft, MapPin, Users, CheckCircle2, Share2, Calendar, Plus, Minus, Loader2, QrCode, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

import { getImageUrl } from "@/lib/admin-utils";

const GET_EVENT_BY_ID = gql`
  query GetEventById($id: ID!) {
    event(id: $id) {
      id
      title
      category
      location
      groupSize
      shortDescription
      fullDescription
      priceInfo
      pricePerPerson
      images
      capacity
      startDate
      endDate
      bookedCount
      availableSpots
      createdAt
    }
  }
`;

const CREATE_EVENT_BOOKING = gql`
  mutation CreateEventBooking($input: CreateEventBookingInput!) {
    createEventBooking(input: $input) {
      id
      totalPrice
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

const CHECK_PAYMENT = gql`
  mutation CheckQPayEventPaymentAndConfirm($bookingId: ID!) {
    checkQPayEventPaymentAndConfirm(bookingId: $bookingId) {
      id
      status
    }
  }
`;

export default function EventDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [participantCount, setParticipantCount] = useState(1);
  const [notes, setNotes] = useState("");
  const [currentStep, setCurrentStep] = useState(1); // 1: Info, 2: Payment
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<string | null>(null);

  const { data, loading, error, refetch } = useQuery(GET_EVENT_BY_ID, {
    variables: { id },
  });

  const [createBooking, { loading: creatingBooking }] = useMutation(CREATE_EVENT_BOOKING);
  const [createPayment, { loading: creatingPayment }] = useMutation(CREATE_EVENT_BOOKING_PAYMENT);
  const [checkPaymentStatus, { loading: checkingPayment }] = useMutation(CHECK_PAYMENT);

  const event = data?.event;

  const handleBookingStart = () => {
    if (!user) {
      toast({
        title: "Нэвтрэх шаардлагатай",
        description: "Захиалга өгөхийн тулд системд нэвтэрнэ үү.",
        variant: "destructive",
      });
      router.push(`/login?redirect=/events/${id}`);
      return;
    }
    setBookingModalOpen(true);
    setCurrentStep(1);
  };

  const handleCreateBooking = async () => {
    try {
      const { data: bookingResult } = await createBooking({
        variables: {
          input: {
            eventId: id,
            numberOfPeople: participantCount,
            notes: notes
          }
        }
      });

      const bid = bookingResult.createEventBooking.id;
      setBookingId(bid);

      const { data: paymentResult } = await createPayment({
        variables: { bookingId: bid }
      });

      setPaymentData(paymentResult.createEventBookingPayment);
      setCurrentStep(2);
    } catch (err: any) {
      toast({
        title: "Алдаа гарлаа",
        description: err.message || "Захиалга үүсгэхэд алдаа гарлаа.",
        variant: "destructive"
      });
    }
  };

  const handleCheckPayment = async () => {
    if (!bookingId) return;
    try {
      const { data: checkResult } = await checkPaymentStatus({
        variables: { bookingId }
      });

      if (checkResult.checkQPayEventPaymentAndConfirm.status === 'PAID') {
        toast({
          title: "Төлбөр баталгаажлаа",
          description: "Таны захиалга амжилттай баталгаажлаа. Имэйлээ шалгана уу.",
        });
        setBookingModalOpen(false);
        refetch();
        router.push('/user-dashboard?tab=events');
      } else {
        toast({
          title: "Төлбөр хүлээгдэж байна",
          description: "Төлбөр хараахан ороогүй байна. Хэдэн хором хүлээгээд дахин оролдоно уу.",
        });
      }
    } catch (err: any) {
      toast({
        title: "Алдаа гарлаа",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Арга хэмжээ олдсонгүй</h2>
        <p className="text-gray-600 mb-6">Уучлаарай, таны хайсан арга хэмжээ олдсонгүй эсвэл устгагдсан байна.</p>
        <Button onClick={() => router.push("/")} className="bg-emerald-600 hover:bg-emerald-700">
          Нүүр хуудас руу буцах
        </Button>
      </div>
    );
  }

  const parsedImages = event.images || [];
  const primaryImage = getImageUrl(parsedImages[0]);
  const galleryImages = parsedImages.slice(1);
  
  const numericPriceInfo = event.priceInfo ? parseInt(String(event.priceInfo).replace(/[^\\d]/g, ''), 10) : 0;
  const personPrice = event.pricePerPerson || (isNaN(numericPriceInfo) ? 0 : numericPriceInfo) || 0;
  const totalPrice = participantCount * personPrice;

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Header */}
      <div className="relative h-[60vh] min-h-[500px] w-full bg-gray-900">
        <img
          src={primaryImage}
          alt={event.title}
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
        
        <div className="absolute top-0 w-full p-4 sm:p-6 lg:p-8 flex justify-between items-center z-10 max-w-7xl mx-auto right-0 left-0">
          <Link href="/">
            <Button variant="outline" className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white hover:text-gray-900 rounded-full w-12 h-12 p-0 flex items-center justify-center">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <Button variant="outline" className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white hover:text-gray-900 rounded-full w-12 h-12 p-0 flex items-center justify-center">
            <Share2 className="w-5 h-5" />
          </Button>
        </div>

        <div className="absolute bottom-0 w-full p-4 sm:p-6 lg:p-12 z-10 max-w-7xl mx-auto right-0 left-0">
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500 text-white text-xs sm:text-sm font-bold uppercase tracking-wider mb-4 sm:mb-6">
            {event.category}
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-white mb-4 sm:mb-6 leading-tight font-display">
            {event.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 sm:gap-8 text-gray-200 mt-4">
            <div className="flex items-center text-sm sm:text-base font-medium">
              <MapPin className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-emerald-400" />
              {event.location}
            </div>
            <div className="flex items-center text-sm sm:text-base font-medium">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-emerald-400" />
              {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
            </div>
            <div className="flex items-center text-sm sm:text-base font-medium">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-emerald-400" />
              Сул суудал: {event.availableSpots} / {event.capacity}
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center mr-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                </span>
                Хөтөлбөрийн талаар
              </h2>
              <div className="prose prose-emerald max-w-none text-gray-600 border border-gray-100 bg-white p-6 sm:p-8 rounded-3xl shadow-sm leading-relaxed whitespace-pre-wrap">
                {event.fullDescription}
              </div>
            </section>

            {galleryImages.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <span className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center mr-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                  </span>
                  Зургийн цомог
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {galleryImages.map((src: string, index: number) => (
                    <div 
                      key={index} 
                      className="relative aspect-square rounded-2xl overflow-hidden shadow-sm group cursor-pointer border border-gray-100"
                      onClick={() => setSelectedGalleryImage(getImageUrl(src))}
                    >
                      <img
                        src={getImageUrl(src)}
                        alt={`${event.title} gallery ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Lightbox Dialog */}
            <Dialog open={!!selectedGalleryImage} onOpenChange={(open) => !open && setSelectedGalleryImage(null)}>
              <DialogContent className="max-w-4xl p-0 overflow-hidden bg-transparent border-none shadow-none flex items-center justify-center">
                <div className="relative w-full aspect-auto max-h-[90vh]">
                  {selectedGalleryImage && (
                    <img 
                      src={selectedGalleryImage} 
                      alt="Gallery Full View" 
                      className="max-w-full max-h-[90vh] object-contain rounded-lg"
                    />
                  )}
                  <Button 
                    className="absolute top-2 right-2 rounded-full w-8 h-8 p-0 bg-black/50 hover:bg-black/70 text-white"
                    onClick={() => setSelectedGalleryImage(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-8 bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-gray-200 border border-gray-100">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">
                Захиалгын мэдээлэл
              </h3>
              
              <div className="border-b border-gray-100 pb-6 mb-6">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl sm:text-4xl font-black text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 to-emerald-500">
                    {personPrice > 0 ? `${personPrice.toLocaleString()} ₮` : (event.priceInfo || "Тохиролцоно")}
                  </span>
                  {personPrice > 0 && <span className="text-gray-500 font-medium">/ хүн</span>}
                </div>
                {personPrice > 0 && <p className="text-sm font-medium text-emerald-600/80">Олон хүний захиалгад хөнгөлөлттэй</p>}
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-gray-700 font-medium">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mr-3 flex-shrink-0">
                    <MapPin className="w-5 h-5 text-gray-500" />
                  </div>
                  {event.location}
                </li>
                <li className="flex items-center text-gray-700 font-medium">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mr-3 flex-shrink-0">
                    <Calendar className="w-5 h-5 text-gray-500" />
                  </div>
                  {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                </li>
                <li className="flex items-center text-gray-700 font-medium">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mr-3 flex-shrink-0">
                    <Users className="w-5 h-5 text-gray-500" />
                  </div>
                  {event.availableSpots > 0 ? `Сул суудал: ${event.availableSpots}` : "Суудал дүүрсэн"}
                </li>
              </ul>

              <Button 
                onClick={handleBookingStart}
                disabled={event.availableSpots <= 0}
                className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg rounded-2xl shadow-lg shadow-emerald-200 transition-all hover:scale-[1.02] active:scale-95 mb-4"
              >
                {event.availableSpots > 0 ? "Захиалга өгөх" : "Суудал дүүрсэн"}
              </Button>
              
              <p className="text-xs text-center text-gray-500 font-medium px-4">
                Захиалга баталгаажуулахын тулд төлбөрөө урьдчилан төлнө үү
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <Dialog open={bookingModalOpen} onOpenChange={setBookingModalOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-6 bg-emerald-600 text-white">
            <DialogTitle className="text-2xl font-bold flex flex-col">
              <div className="flex items-center">
                <Calendar className="mr-2 h-6 w-6" />
                Арга хэмжээний захиалга
              </div>
              <span className="text-xs font-normal mt-1 text-emerald-50">
                {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
              </span>
            </DialogTitle>
          </DialogHeader>

          {currentStep === 1 ? (
            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div>
                    <Label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Хүний тоо</Label>
                    <p className="text-gray-900 font-medium">Нийт {participantCount} хүн</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => setParticipantCount(Math.max(1, participantCount - 1))}
                      className="rounded-xl h-10 w-10"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-xl font-bold w-6 text-center">{participantCount}</span>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => setParticipantCount(Math.min(event.availableSpots, participantCount + 1))}
                      className="rounded-xl h-10 w-10"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-gray-500 uppercase tracking-wider pl-1">Нэмэлт тэмдэглэл</Label>
                  <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Жишээ: Хоолны харшилтай, эсвэл тусгай хүсэлт..."
                    className="w-full min-h-[100px] p-4 rounded-2xl bg-gray-50 border-gray-100 focus:ring-emerald-500 focus:border-emerald-500 resize-none transition-all"
                  />
                </div>
              </div>

              <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-emerald-800 font-medium">Захиалгын дүн:</span>
                  <span className="text-2xl font-black text-emerald-600">
                    {totalPrice.toLocaleString()} ₮
                  </span>
                </div>
                <p className="text-xs text-emerald-600 font-medium">1 хүн: {personPrice.toLocaleString()} ₮</p>
              </div>

              <Button 
                onClick={handleCreateBooking}
                disabled={creatingBooking || creatingPayment}
                className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg transition-all"
              >
                {(creatingBooking || creatingPayment) ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : null}
                Төлбөр төлөх рүү шилжих
              </Button>
            </div>
          ) : (
            <div className="p-8 text-center space-y-6">
              <div className="inline-flex items-center justify-center p-4 bg-emerald-100 rounded-2xl text-emerald-600 mb-2">
                <QrCode className="h-10 w-10" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">QPay төлбөр</h3>
                <p className="text-gray-500">Доорх QR кодыг уншуулж төлбөрөө хийнэ үү.</p>
              </div>

              <div className="bg-white p-4 rounded-3xl border-2 border-dashed border-gray-200 inline-block">
                {paymentData?.qrText ? (
                  <div className="p-2">
                     <img 
                      src={paymentData.qrImage ? `data:image/png;base64,${paymentData.qrImage}` : `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(paymentData.qrText)}`} 
                      alt="QPay QR Code" 
                      className="w-56 h-56 mx-auto"
                    />
                  </div>
                ) : (
                  <div className="w-56 h-56 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {paymentData?.urls?.map((url: any, idx: number) => (
                  <a key={idx} href={url.link} target="_blank" rel="noreferrer" className="flex items-center justify-center p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-tighter">{url.name}</span>
                  </a>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-100">
                <Button 
                  onClick={handleCheckPayment}
                  disabled={checkingPayment}
                  className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl"
                >
                  {checkingPayment ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                  Төлбөр шалгах
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setCurrentStep(1)}
                  className="mt-2 text-gray-500 font-bold"
                >
                  Буцах
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
