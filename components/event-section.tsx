"use client";

import { useQuery, gql } from "@apollo/client";
import { useTranslation } from "react-i18next";
import { EventCard } from "./event-card";

const GET_ACTIVE_EVENTS = gql`
  query GetActiveEvents {
    events(activeOnly: true) {
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
    }
  }
`;

export const EventSection = () => {
  const { t } = useTranslation();
  const { data, loading, error } = useQuery(GET_ACTIVE_EVENTS);

  // If no events exist, don't show the section at all
  if (loading || error || !data?.events?.length) {
    return null;
  }

  return (
    <section className="py-20 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-100/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 space-y-4">
          <span className="text-emerald-600 font-bold tracking-wider text-sm sm:text-base uppercase bg-emerald-100/50 px-4 py-1.5 rounded-full inline-block backdrop-blur-sm">
            {t("events.tag", "Онцгой Хөтөлбөрүүд")}
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 font-display">
            Наадам, <span className="text-emerald-600">Арга Хэмжээ</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg sm:text-xl font-medium pt-2">
            Соёлын наадам, багийн эв нэгдлийг нэмэх тусгай хөтөлбөрүүдийг нэг дороос.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {data.events.map((event: any) => {
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
      </div>
    </section>
  );
};
