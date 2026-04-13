"use client";

import { MapPin, Users, CalendarDays, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getImageUrl } from "@/lib/admin-utils";
import Link from "next/link";
import { useTranslatedValue, useTranslatedPrice } from "@/hooks/use-translation";
import { getLocalizedField } from "@/lib/localization";
import { useTranslation } from "react-i18next";

interface EventCardProps {
  event: any;
}

export const EventCard = ({ event }: EventCardProps) => {
  const { i18n } = useTranslation();
  
  const id = event.id;
  const title = event.title;
  const category = event.category;
  const groupSize = event.groupSize;
  const location = event.location;
  const priceInfo = event.priceInfo;
  const pricePerPerson = event.pricePerPerson;
  const startDate = event.startDate;
  const endDate = event.endDate;
  const images = event.images || [];
  
  const imageUrl = getImageUrl(images?.[0]);

  const translatedTitle = getLocalizedField(event, "title", i18n.language);
  const translatedDesc = getLocalizedField(event, "shortDescription", i18n.language);
  const translatedLoc = getLocalizedField(event, "location", i18n.language);
  const defaultCat = useTranslatedValue(`event[${id}].category`, category);
  const defaultSize = useTranslatedValue(`event[${id}].size`, groupSize);
  const defaultPriceText = useTranslatedValue(`event[${id}].priceInfo`, priceInfo);
  const defaultPrice = useTranslatedPrice(`event[${id}].price`, pricePerPerson || 0, "MNT");
  const detailsMore = useTranslatedValue("common.details_more", "Дэлгэрэнгүй үзэх");
  const comingSoon = useTranslatedValue("common.coming_soon", "Тун удахгүй");

  return (
    <div className="group relative bg-white rounded-3xl overflow-hidden shadow-lg shadow-gray-200/50 hover:shadow-2xl hover:shadow-emerald-200/50 transition-all duration-500 flex flex-col h-full border border-gray-100">
      {/* Image Container with Animation */}
      <div className="relative h-64 overflow-hidden">
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 relative z-10"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-20 pointer-events-none" />
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4 z-30">
          <span className="bg-white/90 backdrop-blur-md text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
            {defaultCat}
          </span>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow relative z-30 bg-white">
        {/* Title */}
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 group-hover:text-emerald-700 transition-colors line-clamp-2">
          {translatedTitle}
        </h3>

        {/* Short Description */}
        <p className="text-gray-600 text-sm mb-6 flex-grow line-clamp-3 leading-relaxed">
          {translatedDesc}
        </p>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-6 pt-4 border-t border-gray-100">
          <div className="flex items-center text-sm font-medium text-gray-600">
            <MapPin className="w-4 h-4 mr-2 text-emerald-500 flex-shrink-0" />
            <span className="truncate">{translatedLoc}</span>
          </div>
          <div className="flex items-center text-sm font-medium text-gray-600">
            <CalendarDays className="w-4 h-4 mr-2 text-emerald-500 flex-shrink-0" />
            <span className="truncate">{startDate ? `${new Date(startDate).toLocaleDateString()} - ${endDate ? new Date(endDate).toLocaleDateString() : ''}` : comingSoon}</span>
          </div>
          <div className="flex items-center text-sm font-medium text-gray-600">
            <Users className="w-4 h-4 mr-2 text-emerald-500 flex-shrink-0" />
            <span className="truncate">{defaultSize}</span>
          </div>
          <div className="flex items-center text-sm font-bold text-emerald-700 col-span-2 mt-1 bg-emerald-50 w-full p-2.5 rounded-xl justify-center">
            {pricePerPerson ? defaultPrice : defaultPriceText}
          </div>
        </div>

        {/* Action Button */}
        <Link href={`/events/${id}`} className="block mt-auto">
          <Button className="w-full bg-gray-900 hover:bg-emerald-600 text-white font-bold py-6 rounded-2xl transition-all duration-300 group-hover:shadow-lg">
            {detailsMore}
            <ArrowRight className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

