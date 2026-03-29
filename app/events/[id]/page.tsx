"use client";

import { useQuery, gql } from "@apollo/client";
import { ArrowLeft, MapPin, Users, CheckCircle2, Share2, Calendar } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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
      images
      createdAt
    }
  }
`;

export default function EventDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const { data, loading, error } = useQuery(GET_EVENT_BY_ID, {
    variables: { id },
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error || !data?.event) {
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

  const event = data.event;
  let parsedImages = [];
  try {
    parsedImages = JSON.parse(event.images || "[]");
  } catch (e) {
    parsedImages = [];
  }

  const primaryImage = parsedImages[0] || "/placeholder.svg";
  const galleryImages = parsedImages.slice(1);

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Header */}
      <div className="relative h-[60vh] min-h-[500px] w-full bg-gray-900">
        <Image
          src={primaryImage}
          alt={event.title}
          fill
          className="object-cover opacity-60"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
        
        {/* Top Navigation */}
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

        {/* Header Content */}
        <div className="absolute bottom-0 w-full p-4 sm:p-6 lg:p-12 z-10 max-w-7xl mx-auto right-0 left-0">
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500 text-white text-xs sm:text-sm font-bold uppercase tracking-wider mb-4 sm:mb-6">
            {event.category}
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-white mb-4 sm:mb-6 leading-tight font-display">
            {event.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 sm:gap-8 text-gray-200">
            <div className="flex items-center text-sm sm:text-base font-medium">
              <MapPin className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-emerald-400" />
              {event.location}
            </div>
            <div className="flex items-center text-sm sm:text-base font-medium">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-emerald-400" />
              {event.groupSize}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          
          {/* Left Column (Description & Gallery) */}
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
                    <div key={index} className="relative aspect-square rounded-2xl overflow-hidden shadow-sm group cursor-pointer border border-gray-100">
                      <Image
                        src={src}
                        alt={`${event.title} gallery ${index + 1}`}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column (Sidebar & Action Card) */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-gray-200 border border-gray-100">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">
                Багцын мэдээлэл
              </h3>
              
              <div className="border-b border-gray-100 pb-6 mb-6">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl sm:text-4xl font-black text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 to-emerald-500">
                    {event.priceInfo || "Тохиролцоно"}
                  </span>
                </div>
                {event.priceInfo && <p className="text-sm font-medium text-emerald-600/80">Олон хүний захиалгад хөнгөлөлттэй</p>}
              </div>

              <ul className="space-y-4 mb-8">
                {[
                  { icon: MapPin, text: event.location },
                  { icon: Users, text: event.groupSize },
                  { icon: Calendar, text: "Хүссэн өдрөө захиалах" },
                ].map((item, i) => (
                  <li key={i} className="flex items-center text-gray-700 font-medium">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mr-3 flex-shrink-0">
                      <item.icon className="w-5 h-5 text-gray-500" />
                    </div>
                    {item.text}
                  </li>
                ))}
              </ul>

              <Button className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg rounded-2xl shadow-lg shadow-emerald-200 transition-all hover:scale-[1.02] active:scale-95 mb-4">
                Мэдээлэл авах
              </Button>
              
              <p className="text-xs text-center text-gray-500 font-medium px-4">
                Захиалга өгөхийн тулд холбогдож дэлгэрэнгүй мэдээлэл авна уу
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
