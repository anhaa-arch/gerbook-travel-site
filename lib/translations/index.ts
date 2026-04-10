export type Locale = "mn" | "en" | "ko";

export function translateWithMap(
  valueMn: string,
  locale: Locale | string,
  map: Record<string, { en: string; ko: string }>
): string {
  const item = map[valueMn];
  if (!item) return valueMn; // орчуулга олдохгүй бол Монгол утгийг нь буцаана

  if (locale === "en") return item.en;
  if (locale === "ko") return item.ko;
  return valueMn;
}
