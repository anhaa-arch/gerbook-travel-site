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
  { value: "traditional_ger", label: "Уламжлалт гэр" },
  { value: "modern_ger", label: "Орчин үеийн гэр" },
  { value: "luxury_ger", label: "Тансаг гэр" },
  { value: "family_ger", label: "Гэр бүлийн гэр" },
  { value: "single_ger", label: "Ганц хүний гэр" },
  { value: "couple_ger", label: "Хосын гэр" },
];

export const facilitiesOptions = [
  { value: "traditional_furnishing", label: "Уламжлалт тавилга" },
  { value: "modern_furnishing", label: "Орчин үеийн тавилга" },
  { value: "bedding", label: "Ор дэр" },
  { value: "heating_stove", label: "Зуух" },
  { value: "furniture", label: "Тавилга" },
  { value: "lighting", label: "Гэрэлтүүлэг" },
  { value: "ventilation", label: "Агааржуулалт" },
  { value: "storage", label: "Хадгалах сав" },
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
    { value: "free_48h", label: "48 цагийн өмнө үнэгүй цуцлах" },
    { value: "free_72h", label: "72 цагийн өмнө үнэгүй цуцлах" },
    { value: "free_1week", label: "1 долоо хоногийн өмнө үнэгүй цуцлах" },
    { value: "non_refundable", label: "Буцаан олголтгүй" },
    { value: "50_refund", label: "50% буцаан олголт" },
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

