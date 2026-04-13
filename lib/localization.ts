/**
 * Helper to get property value based on locale.
 * If specific locale value (e.g. name_en) is missing, falls back to default (e.g. name).
 * @param item - The data object (yurt, product, etc.)
 * @param field - The base field name (e.g. 'name', 'description')
 * @param locale - Current language code ('mn', 'en', 'ko')
 */
export function getLocalizedField(item: any, field: string, locale: string): string {
  if (!item) return "";

  // If locale is mn, use default field
  if (locale === "mn") {
    return item[field] || "";
  }

  // Check for localized field (e.g. name_en)
  const localizedKey = `${field}_${locale}`;
  if (item[localizedKey] && item[localizedKey].trim() !== "") {
    return item[localizedKey];
  }

  // Fallback to default field (mn)
  return item[field] || "";
}
