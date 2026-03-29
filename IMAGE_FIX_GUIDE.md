# Зураг Харагдахгүй Байгаа Асуудал - Шийдэл

## 🔍 Асуудал

user dashboard дээр захиалгын зураг placeholder icon-оор харагдаж байна.

## 🎯 Шалтгаан

Database дээр зураг `/placeholder.svg` гэж хадгалагдсан байна. Энэ нь:

1. **Амралтын газар бүртгэх үед зураг оруулаагүй**
2. **Зураг upload системд алдаа гарсан**
3. **Seed data дээр placeholder ашигласан**

## ✅ Шийдэл

### 1. Одоо Байгаа Захиалгуудын Зургийг Засах

#### Option A: Herder Dashboard-аар зураг нэмэх
1. Herder эрхтэй нэвтэрнэ
2. `http://localhost:3000/herder-dashboard` руу орно
3. "Амралтын газрууд" таб дээр очно
4. Засах (Edit) товч дарна
5. Зураг оруулна (File upload эсвэл URL)
6. Хадгална

#### Option B: Admin Dashboard-аар засах
1. Admin эрхтэй нэвтэрнэ
2. Yurt management хэсэгт орно
3. Тухайн амралтын газрын мэдээллийг засна
4. Зураг оруулна

#### Option C: Database-д шууд засах

```sql
-- Жишээ зургуудтай засах
UPDATE Yurt 
SET images = '["https://malchincamp.mn/uploads/ger-camp-1.jpg"]'
WHERE name = 'aaa';

-- Эсвэл JSON array форматаар
UPDATE Yurt 
SET images = '["/images/yurt/ger-1.jpg","/images/yurt/ger-2.jpg"]'
WHERE id = 'cf0c85dc-1b13-4e31-8d68-ef319b6618f1';
```

### 2. Шинэ Амралтын Газар Бүртгэхэд Зураг Заавал Оруулах

#### Herder Dashboard дээр:

`app/herder-dashboard/herder-dashboard-content.tsx` файлд validation нэмэх:

```tsx
const handleAddYurt = async () => {
  // Validate images
  if (uploadedImages.length === 0 && !yurtForm.images) {
    toast({
      title: "Алдаа",
      description: "Зураг оруулна уу",
      variant: "destructive",
    });
    return;
  }
  
  // ... existing code
};
```

### 3. Sample Зургууд Ашиглах

Хэрэв тест хийх бол, `public/images/yurt/` folder дотор зургууд нэмж болно:

```
public/
  images/
    yurt/
      ger-1.jpg
      ger-2.jpg
      ger-3.jpg
      ger-4.jpg
      ger-5.jpg
```

Seed data засах:

```typescript
// tusul_back/prisma/seed.ts
const yurts = [
  {
    name: "Найман нуур эко гэр бааз",
    // ...
    images: JSON.stringify([
      "/images/yurt/ger-1.jpg",
      "/images/yurt/ger-2.jpg"
    ])
  },
];
```

### 4. Image Upload Системийг Шалгах

Backend дээр file upload ажиллаж байгаа эсэхийг шалгах:

```bash
# Backend logs шалгах
cd tusul_back
npm start

# Upload folder байгаа эсэхийг шалгах
ls -la public/uploads/

# Permission зөв эсэхийг шалгах
chmod 755 public/uploads/
```

### 5. Frontend Image Upload Test

Herder dashboard дээр зураг upload хийхэд:

1. File сонгох → Base64 encode хийнэ
2. Эсвэл URL оруулах
3. Backend руу илгээнэ
4. Backend `/uploads/` folder-т хадгална
5. Database-д path-ийг хадгална

## 🧪 Тест

```bash
# 1. Backend server ажиллуулах
cd tusul_back
npm start

# 2. Frontend server ажиллуулах
cd ..
npm run dev

# 3. Herder эрхтэй нэвтрэх
# Email: (herder account)
# Password: (herder password)

# 4. Шинэ амралтын газар нэмэх
# - Бүх мэдээллийг бөглөх
# - Зураг ЗААВАЛ оруулах
# - Хадгалах

# 5. user эрхтэй нэвтрэх
# 6. Тухайн газрыг захиалах
# 7. user dashboard дээр зураг харагдаж байгааг шалгах
```

## 📊 Зургийн Format

Database дээр дараах форматуудыг дэмжинэ:

```javascript
// 1. JSON array (Recommended)
'["https://malchincamp.mn/uploads/image1.jpg","https://malchincamp.mn/uploads/image2.jpg"]'

// 2. Simple path
'/images/yurt/ger-1.jpg'

// 3. Full URL
'https://malchincamp.mn/uploads/1234567890-camp.jpg'

// 4. Base64 (for small images)
'data:image/jpeg;base64,/9j/4AAQSkZJRg...'

// 5. Comma separated (legacy)
'/image1.jpg,/image2.jpg,/image3.jpg'
```

## 🎨 Placeholder Image Сайжруулах

Одоогийн placeholder-ийг илүү сайхан болгох:

```tsx
// app/user-dashboard/user-dashboard-content.tsx
<img
  src={booking.image || "/images/default-camp.jpg"} // Better placeholder
  alt={booking.camp}
  className="w-full h-full object-cover"
  onError={(e) => {
    (e.target as HTMLImageElement).src = "/images/default-camp.jpg";
  }}
/>
```

Default camp зураг нэмэх:
```bash
# Download placeholder image
# Place in: public/images/default-camp.jpg
```

## 🔧 Quick Fix Commands

```sql
-- Бүх placeholder зургуудыг олох
SELECT id, name, images 
FROM Yurt 
WHERE images LIKE '%placeholder%';

-- Бүх захиалгуудын зургийн төлөвийг шалгах
SELECT b.id, y.name, y.images, b.status
FROM Booking b
JOIN Yurt y ON b.yurtId = y.id
WHERE b.userId = 'user_ID';

-- Sample зураг оруулах
UPDATE Yurt 
SET images = '["https://malchincamp.mn/uploads/sample-ger.jpg"]'
WHERE images = '/placeholder.svg';
```

## 📝 Санамж

1. **Production дээр**: Заавал жинхэнэ зураг ашиглах
2. **Image optimization**: Зургуудыг compress хийх (< 500KB)
3. **Multiple images**: Олон зураг оруулахыг зөвлөнө
4. **Alt text**: Зургийн тайлбар оруулах
5. **Lazy loading**: Том жагсаалтад lazy load ашиглах

## 🎯 Next Steps

1. ✅ Огнооны format засварласан
2. ⚠️ Зураг байхгүй захиалгууд → Herder-д мэдэгдэх
3. 📸 Default/sample зургууд нэмэх
4. 🔍 Image upload системийг шалгах
5. ✨ Better placeholder UI

---

**Updated:** 2025-01-18  
**Issue:** Images showing as placeholder  
**Status:** Date format fixed ✅, Image upload guide provided 📚

