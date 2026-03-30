# MalchinCamp SEO Setup — Google Search Console Guide

## 🔍 Goal: Make "malchincamp" brand searches show https://www.malchincamp.mn at the top

---

## ✅ Changes Already Made (Code)

| Area | What was done |
|------|------|
| **Title** | Brand-first: `MalchinCamp – Малчин Кэмп \| Гэр бааз, аялал, бүтээгдэхүүн` |
| **Meta Description** | Includes brand name (Latin + Cyrillic), services, and domain |
| **H1** | `Малчин Кэмп – Малчны амьдралыг аяллаар мэдэрье` |
| **Open Graph** | Full OG tags with og:title, og:description, og:url, og:site_name, og:image |
| **Twitter Card** | summary_large_image card with brand info |
| **Canonical URL** | `<link rel="canonical" href="https://www.malchincamp.mn/" />` |
| **JSON-LD** | Organization + WebSite structured data with SearchAction |
| **robots.txt** | Allows crawling, points to sitemap |
| **sitemap.xml** | Auto-generated at `/sitemap.xml` with all public pages |
| **Language** | `<html lang="mn">` for Mongolian content |
| **Keywords** | Both Latin and Cyrillic brand names + service keywords |

---

## 📋 Steps for Google Search Console

### 1. Add Property

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Click **"Add property"**
3. Choose **"URL prefix"** and enter: `https://www.malchincamp.mn`
4. Verify ownership using one of these methods:
   - **DNS verification** (recommended): Add a TXT record to your `.mn` domain DNS
   - **HTML file**: Download and place in `public/` folder
   - **HTML tag**: Add `<meta name="google-site-verification" content="YOUR_CODE" />` — uncomment and fill in the `verification` section in `app/layout.tsx`

### 2. Submit Sitemap

1. In Search Console, go to **"Sitemaps"** in the left menu
2. Enter: `https://www.malchincamp.mn/sitemap.xml`
3. Click **"Submit"**
4. Wait for Google to process (may take a few hours to days)

### 3. Request Indexing

1. In Search Console, go to **"URL Inspection"**
2. Enter: `https://www.malchincamp.mn`
3. Click **"Request Indexing"**
4. Repeat for key pages:
   - `https://www.malchincamp.mn/camps`
   - `https://www.malchincamp.mn/products`
   - `https://www.malchincamp.mn/events`
   - `https://www.malchincamp.mn/listings`

### 4. Monitor

1. Check **"Performance"** tab after 1-2 weeks
2. Search for "malchincamp" queries to see impressions and clicks
3. Check **"Coverage"** to ensure no indexing errors

---

## 🔗 Additional Tips for Ranking

- **Google My Business**: If MalchinCamp has a physical location, create a Google Business Profile
- **Social Media**: Link malchincamp.mn from social profiles (Facebook, Instagram). Add those URLs to the `sameAs` array in the Organization JSON-LD in `app/page.tsx`
- **Backlinks**: Get linked from Mongolian tourism directories, travel blogs, etc.
- **Consistent NAP**: Name, Address, Phone should be consistent across all platforms
- **HTTPS**: Ensure SSL certificate is valid on www.malchincamp.mn
- **www redirect**: Make sure both `malchincamp.mn` and `www.malchincamp.mn` work (with one redirecting to the other)

---

## 📁 Files Modified

| File | Changes |
|------|---------|
| `app/layout.tsx` | Metadata, OG, canonical, robots, Twitter card, lang="mn" |
| `app/page.tsx` | JSON-LD Organization + WebSite structured data |
| `components/search/SearchSection.tsx` | Brand H1 + description paragraph |
| `public/robots.txt` | New — crawling rules + sitemap pointer |
| `app/sitemap.ts` | New — auto-generates `/sitemap.xml` |
