// Гэр баазын сонголтууд - Монгол хэл

export const amenitiesOptions = [
  { value: "wifi", label: "WiFi" },
  { value: "heating", label: "Халаалт" },
  { value: "breakfast", label: "Өглөөний цай" },
  { value: "parking", label: "Зогсоол" },
  { value: "shower", label: "Душ" },
  { value: "toilet", label: "Ариун цэврийн өрөө" },
  { value: "electricity", label: "Цахилгаан" },
  { value: "hot_water", label: "Халуун ус" },
  { value: "kitchen", label: "Гал тогоо" },
  { value: "restaurant", label: "Ресторан" },
];

export const activitiesOptions = [
  { value: "horseback_riding", label: "Морь унах" },
  { value: "hiking", label: "Явган аялал" },
  { value: "fishing", label: "Загас агнуур" },
  { value: "bird_watching", label: "Шувуу ажиглалт" },
  { value: "stargazing", label: "Од үзэх" },
  { value: "photography", label: "Гэрэл зураг авалт" },
  { value: "nomadic_experience", label: "Нүүдэлчдийн амьдрал" },
  { value: "traditional_food", label: "Уламжлалт хоол" },
  { value: "cultural_show", label: "Соёлын тоглолт" },
  { value: "camping", label: "Кэмпинг" },
];

export const accommodationTypes = [
  { value: "traditional_ger", label: "Уламжлалт гэр (Standard Mongolian Ger)" },
  { value: "modern_ger", label: "Орчин үеийн гэр (Modern/Standard Ger - дотроо ариун цэврийн өрөөгүй ч тохижилт сайтай)" },
  { value: "luxury_ger", label: "Тансаг гэр / Лодж гэр (Luxury/En-suite Ger - дотроо ариун цэврийн өрөөтэй)" },
  { value: "family_ger", label: "Гэр бүлийн гэр (Family Ger - олон ортой эсвэл том)" },
  { value: "couple_ger", label: "Хосын гэр (Couple Ger - 1 том ортой)" },
  { value: "house", label: "Байшин" },
];

export const facilitiesOptions = [
  { value: "traditional_furniture", label: "Уламжлалт тавилга" },
  { value: "modern_furniture", label: "Орчин үеийн тавилга" },
  { value: "bedding_linen", label: "Ор дэрний хэрэглэл" },
  { value: "wardrobe_hanger", label: "Хувцасны шүүгээ / Өлгүүр" },
  { value: "desk_chair", label: "Ширээ, сандал" },
  { value: "luggage_storage", label: "Ачаа тээш хадгалах хэсэг" },
  { value: "stove_heater", label: "Зуух / Галлах хэрэгсэл" },
  { value: "electric_heater", label: "Цахилгаан халаагуур" },
  { value: "gas_heater", label: "Газ халаагуур" },
  { value: "lighting", label: "Гэрэлтүүлэг" },
  { value: "electrical_outlet", label: "Цахилгаан залгуур" },
];

export const policiesOptions = {
  checkInTimes: [
    { value: "10:00", label: "10:00" },
    { value: "11:00", label: "11:00" },
    { value: "12:00", label: "12:00" },
    { value: "13:00", label: "13:00" },
    { value: "14:00", label: "14:00" },
    { value: "15:00", label: "15:00" },
    { value: "16:00", label: "16:00" },
  ],
  checkOutTimes: [
    { value: "09:00", label: "09:00" },
    { value: "10:00", label: "10:00" },
    { value: "11:00", label: "11:00" },
    { value: "12:00", label: "12:00" },
    { value: "13:00", label: "13:00" },
  ],
  childrenPolicy: [
    { value: "all_ages", label: "Бүх насны хүүхэд" },
    { value: "above_5", label: "5-аас дээш нас" },
    { value: "above_10", label: "10-аас дээш нас" },
    { value: "no_children", label: "Хүүхэдгүй" },
  ],
  petsPolicy: [
    { value: "allowed", label: "Гэрийн тэжээвэр амьтан зөвшөөрөгдөнө" },
    { value: "not_allowed", label: "Гэрийн тэжээвэр амьтан зөвшөөрөгдөхгүй" },
    { value: "small_pets", label: "Зөвхөн жижиг амьтад" },
  ],
  smokingPolicy: [
    { value: "no_smoking", label: "Тамхи татахыг хориглоно" },
    { value: "outdoor_only", label: "Зөвхөн гадаа татаж болно" },
    { value: "allowed", label: "Тамхи татахыг зөвшөөрнө" },
  ],
  cancellationPolicy: [
    { value: "refund_100_7days", label: "7 хоногийн өмнө цуцалбал 100% буцаалттай" },
    { value: "no_refund_within_7days", label: "7 хоног дотор цуцлах боломжгүй" },
  ],
};

export const hostLanguages = [
  { value: "mongolian", label: "Монгол" },
  { value: "english", label: "Англи" },
  { value: "russian", label: "Орос" },
  { value: "chinese", label: "Хятад" },
  { value: "korean", label: "Солонгос" },
  { value: "japanese", label: "Япон" },
];

export const transportationOptions = [
  { value: "4wd_recommended", label: "Дөрвөн дугуйт машин зөвлөмжтэй" },
  { value: "public_transport", label: "Нийтийн тээвэр ашиглаж болно" },
  { value: "private_car", label: "Хувийн машинаар ирж болно" },
  { value: "transfer_available", label: "Тээврийн үйлчилгээтэй" },
  { value: "difficult_access", label: "Хүрэхэд хэцүү" },
];

