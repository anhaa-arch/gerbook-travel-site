# Admin Dashboard Camp Form Improvement - Status

## ✅ Completed:

### 1. Database - Phone Numbers
- ✅ Phone field schema байна (Prisma, GraphQL)
- ✅ Phone numbers database дээр нэмэгдлээ (6/6 users)
- ✅ GraphQL queries phone field агуулна
- ✅ Frontend queries phone field fetch хийнэ

### 2. Backend Logic
- ✅ `handleAddCamp` function шинэчлэгдсэн
- ✅ campForm state нэмэгдсэн
- ✅ Amenities, activities, policies JSON format болгох
- ✅ Province + District = location string
- ✅ Imports нэмэгдсэн (camp-options, mnzip, Checkbox)

## 🔄 In Progress:

### 3. Frontend Form UI
**Хийх зүйлс:**
- Province/District selection (mnzipData ашиглах)
- Amenities checkboxes section
- Activities checkboxes section
- Accommodation type select
- Facilities checkboxes section
- Policies section (check-in/out times, children, pets, smoking, cancellation)

**Одоогийн form structure:**
```
- Camp Name input
- Location input (text) ← Энийг Province/District болгох
- Price per Night input
- Guest Capacity input
- Description textarea
- Amenities textarea ← Энийг checkboxes болгох
- Image upload
```

**Шинэ form structure (Herder dashboard шиг):**
```
- Camp Name input
- Province select (mnzipData)
- District select (depends on province)
- Price per Night input
- Guest Capacity input
- Description textarea
- Accommodation Type select
- Amenities section (checkboxes)
- Activities section (checkboxes)
- Facilities section (checkboxes)
- Policies section (selects for time, etc.)
- Image upload
```

## 🎯 Next Step:

Одоо "Add Camp" form-ийн HTML/JSX-ийг солих хэрэгтэй. Энэ маш урт код учир:

**Option A:** Герder dashboard-ын form-ийг copy хийж Admin dashboard дээр paste хийх
**Option B:** Хэсэг хэсгээр нэг нэгээр солих

**Зөвлөмж:** Option A хурдан байна. Герder dashboard-ын "Add Yurt/Camp" form-ийн бүх JSX-ийг авч Admin dashboard дээр тавих.

## 📝 Summary:

- ✅ Phone numbers fixed (database updated)
- ✅ Backend logic ready (handleAddCamp uses campForm state)
- 🔄 Need to replace old form JSX with new checkbox/select-based form
- ⏱️ ETA: ~30 минут (урт JSX блок солих)

**user тэвчээртэй байх хэрэгтэй:** Form шинэчлэх нь 1600-2000 мөр код солих гэсэн үг.

Хэрхэн үргэлжлүүлэх вэ?

