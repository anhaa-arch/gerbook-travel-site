/**
 * Helper to get property value based on locale.
 * If specific locale value (e.g. name_en) is missing, falls back to default (e.g. name).
 * @param item - The data object (yurt, product, etc.)
 * @param field - The base field name (e.g. 'name', 'description')
 * @param locale - Current language code ('mn', 'en', 'ko')
 */
export function getLocalizedField(item: any, field: string, locale: string): string {
  if (!item) return "";

  // 1. Try specifically for the requested locale
  const localizedKey = `${field}_${locale}`;
  if (item[localizedKey] && item[localizedKey]?.trim() !== "") {
    return item[localizedKey];
  }

  // 2. Try the base field (standard for many models like Yurt.name)
  if (item[field] && item[field]?.trim() !== "") {
    return item[field];
  }

  // 3. Try the _mn suffix (standard for SiteText.value_mn)
  const mnKey = `${field}_mn`;
  if (item[mnKey] && item[mnKey]?.trim() !== "") {
    return item[mnKey];
  }

  return "";
}
