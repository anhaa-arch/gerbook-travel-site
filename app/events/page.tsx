"use client";

import { useQuery, gql } from "@apollo/client";
import { useTranslation } from "react-i18next";
import { EventCard } from "@/components/event-card";
import { Calendar, MapPin, Users, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const GET_ALL_EVENTS = gql`
  query GetAllEvents($activeOnly: Boolean) {
    events(activeOnly: $activeOnly) {
      id
      title
      category
      location
      groupSize
      shortDescription
      priceInfo
      pricePerPerson
      startDate
      endDate
      images
      isActive
    }
  }
`;

export default function EventsPage() {
  const { t } = useTranslation();
  const { data, loading, error } = useQuery(GET_ALL_EVENTS, {
    variables: { activeOnly: true }
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-600"></div>
          <p className="text-emerald-700 font-bold animate-pulse">Арга хэмжээг ачаалж байна...</p>
        </div>
      </div>
    );
  }

  const events = data?.events || [];

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-24 sm:py-32 overflow-hidden bg-[#0A261D]">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-[#0A261D]" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-900/40 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center space-y-8">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md text-emerald-400 text-sm font-bold uppercase tracking-widest animate-fade-in">
            <Sparkles className="w-4 h-4" />
            <span>Удахгүй болох арга хэмжээнүүд</span>
          </div>
          
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-white font-display tracking-tight leading-[1.1] max-w-5xl mx-auto uppercase">
            Монгол <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-200">Өв Соёл</span> ба Аялал
          </h1>
          
          <p className="text-emerald-50/70 max-w-2xl mx-auto text-lg sm:text-xl font-medium leading-relaxed">
            Малчин ахуй, үндэсний наадам, байгалийн үзэсгэлэнт газруудаар аялах онцгой хөтөлбөрүүдийг эндээс олж захиалаарай.
          </p>

          <div className="pt-8">
            <Link href="#events-list">
              <Button className="bg-emerald-500 hover:bg-emerald-400 text-gray-900 font-black text-lg px-10 py-8 rounded-[2rem] shadow-2xl shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 group">
                Аяллаа сонгох
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Events List */}
      <section id="events-list" className="py-24 sm:py-32 bg-gray-50/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div className="space-y-4">
              <h2 className="text-4xl sm:text-5xl font-black text-gray-900 font-display uppercase tracking-tight">
                Бүх <span className="text-emerald-600">Арга Хэмжээ</span>
              </h2>
              <p className="text-gray-500 text-lg font-medium max-w-xl">
                Монгол орны өнцөг булан бүрт зохион байгуулагдаж буй соёлын болон адал явдалт арга хэмжээнүүд.
              </p>
            </div>
            
            <div className="flex items-center space-x-4 bg-white/80 backdrop-blur-sm p-2 rounded-2xl border border-gray-100 shadow-sm">
              <div className="px-6 py-3 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-sm">
                Нийт {events.length} арга хэмжээ
              </div>
            </div>
          </div>

          {events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 sm:gap-10">
              {events.map((event: any) => {
                const parsedImages = event.images || [];
                return (
                  <EventCard
                    key={event.id}
                    id={event.id}
                    title={event.title}
                    category={event.category}
                    location={event.location}
                    groupSize={event.groupSize}
                    shortDescription={event.shortDescription}
                    priceInfo={event.priceInfo}
                    pricePerPerson={event.pricePerPerson}
                    startDate={event.startDate}
                    endDate={event.endDate}
                    images={parsedImages}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-32 bg-white rounded-[3rem] border border-gray-100 shadow-sm">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Одоогоор идэвхтэй арга хэмжээ алга</h3>
              <p className="text-gray-500 font-medium">Удахгүй шинэ арга хэмжээнүүд нэмэгдэх болно.</p>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="bg-emerald-600 rounded-[3rem] p-12 sm:p-20 text-center space-y-8 relative overflow-hidden shadow-2xl shadow-emerald-200">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500 rounded-full blur-[80px] translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-400/30 rounded-full blur-[80px] -translate-x-1/2 translate-y-1/2" />
            
            <div className="relative z-10 max-w-3xl mx-auto space-y-6">
              <h2 className="text-4xl sm:text-6xl font-black text-white font-display uppercase tracking-tight">
                Өөрийн <span className="text-emerald-200">Адал Явдлаа</span> Өнөөдөр Эхлүүл
              </h2>
              <p className="text-emerald-50/80 text-xl font-medium leading-relaxed">
                Бид танд хамгийн мартагдашгүй, жинхэнэ монгол ахуйг мэдрүүлэх аялал арга хэмжээнүүдийг санал болгож байна.
              </p>
              <div className="pt-4">
                 <Link href="/">
                  <Button variant="outline" className="bg-white hover:bg-emerald-50 text-emerald-700 border-none font-black text-lg px-12 py-8 rounded-[2rem] shadow-xl transition-all hover:scale-105 active:scale-95">
                    Нүүр хуудас руу буцах
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
