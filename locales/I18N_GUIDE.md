# i18n Management Guide for MalchinCamp.mn

This document explains how to use and extend the internationalization (i18n) system.

## 1. Static UI Structure
A master file `locales/translations.json` contains all static strings in a consolidated format:
```json
"key.namespace": {
  "mn": "Монгол",
  "en": "English",
  "ko": "Korean"
}
```

## 2. Dynamic Data Pattern (Database)
For data that comes from the database (e.g., Camp Descriptions), use the **JSONB Translation Pattern**:

### Database Schema (Prisma/PostgreSQL)
```prisma
model Yurt {
  id          String @id @default(cuid())
  // Use JSONB fields for translated content
  name_i18n   Json   // Stores: { "mn": "...", "en": "...", "ko": "..." }
  desc_i18n   Json   
}
```

### Key Naming Patterns
Recommend using local IDs for specific data:
- `camp.{id}.description.short`
- `product.{id}.specs`

## 3. Korean Language Best Practices
- **Politeness**: Always use **존댓말** (Honorifics).
  - Use `하세요`, `합니다`, `하십시오` for instructions.
- **Naturalness**: Avoid literal translations.
  - "Малчин амралт" -> "유목민 민박/민속촌" (depending on the actual facility type).
  - "Захиалах" -> `예약하기` (Reservation).

## 4. Next-intl Preparation
If you decide to switch to `next-intl` (recommended for App Router SEO), use this script to split `translations.json` into separate files.

### Transformation Script (`scripts/split-translations.js`)
```javascript
const fs = require('fs');
const translations = require('../locales/translations.json');

const locales = ['mn', 'en', 'ko'];
const output = { mn: {}, en: {}, ko: {} };

function traverse(obj, path = []) {
  for (const key in obj) {
    const value = obj[key];
    if (value.mn && value.en && value.ko) {
      locales.forEach(lang => {
        let current = output[lang];
        path.forEach(p => {
          if (!current[p]) current[p] = {};
          current = current[p];
        });
        current[key] = value[lang];
      });
    } else {
      traverse(value, [...path, key]);
    }
  }
}

traverse(translations);

locales.forEach(lang => {
  fs.writeFileSync(`./locales/${lang}.json`, JSON.stringify(output[lang], null, 2));
});

console.log('Translations split successfully!');
```
