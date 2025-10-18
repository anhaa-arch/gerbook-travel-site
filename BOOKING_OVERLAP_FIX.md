# 🔧 Захиалгын давхардал алдаа засах

## ❌ Асуудал:
Ногоон өнгөөр харуулж байгаа өдрүүдийг сонгосон ч backend алдаа өгч байна:
```
"Yurt is not available for the selected dates"
```

## 🎯 Шалтгаан:

### 1. Date Range Logic өөр өөр байна

**Standard hotel logic:**
- Check-in: 2025-10-17 (Хүн 17-нд ирнэ)
- Check-out: 2025-10-20 (Хүн 20-нд явна)
- **Захиалагдсан өдрүүд:** 17, 18, 19 (20 биш!)
- **20-нд шинэ хүн check-in хийж болно** ✅

### 2. Өөр захиалга байж болох

Хэрэв database дээр дараах захиалга байвал:
```json
{
  "yurtId": "6f74c9a7-f197-45dd-a19f-a16b5a46813f",
  "startDate": "2025-10-18T00:00:00.000Z",
  "endDate": "2025-10-20T00:00:00.000Z",
  "status": "PENDING"
}
```

Та 2025-10-17 - 2025-10-24 сонгох үед:
- Frontend: 17 ногоон (бусад захиалгад ороогүй)
- Backend: **18, 19 давхардаж байна** ❌

## ✅ Шийдэл:

### Алхам 1: Browser Console шалгах

1. F12 дарж DevTools нээнэ
2. Console tab сонгоно
3. Camp detail page дээр очоход:

```javascript
🔍 Active bookings for this yurt: [
  {
    id: "...",
    status: "PENDING",
    startDate: "2025-10-18T00:00:00.000Z",
    endDate: "2025-10-20T00:00:00.000Z"
  }
]
🚫 Total disabled dates: 2
🚫 Disabled date ranges: ["2025-10-18", "2025-10-19"]
```

### Алхам 2: Огноо сонгох

1. Ирэх өдөр: 2025-10-17 (ногоон) ✅
2. Гарах өдөр: 2025-10-24 (ногоон) ✅
3. "Захиалах" товчлуур дарна

Console дээр:
```javascript
📅 Selected range: 2025-10-17 - 2025-10-24
🔍 Checking against bookings: [...]
❌ Overlap detected with booking: {
  id: "...",
  start: "2025-10-18T00:00:00.000Z",
  end: "2025-10-20T00:00:00.000Z"
}
```

**Тайлбар:** Таны range (17-24) нь одоо байгаа захиалга (18-20)-тай давхарч байна!

### Алхам 3: Зөв огноо сонгох

Хоёр сонголт байна:

#### Сонголт A: Өмнө нь
- Ирэх өдөр: 2025-10-15
- Гарах өдөр: 2025-10-18 (эсвэл түүнээс өмнө)
- ✅ Давхардахгүй

#### Сонголт B: Дараа нь  
- Ирэх өдөр: 2025-10-20 (эсвэл түүнээс хойш)
- Гарах өдөр: 2025-10-25
- ✅ Давхардахгүй

## 🔍 Database шалгах

### Prisma Studio ашиглах:

```bash
cd tusul_back
npx prisma studio
```

1. "Booking" table сонгоно
2. Filter: `yurtId = 6f74c9a7-f197-45dd-a19f-a16b5a46813f`
3. Filter: `status = PENDING` эсвэл `CONFIRMED`
4. startDate, endDate шалгана

### GraphQL ашиглах:

```bash
# Apollo Studio: http://localhost:8000/graphql
```

```graphql
query GetYurtBookings {
  yurt(id: "6f74c9a7-f197-45dd-a19f-a16b5a46813f") {
    id
    name
    bookings {
      id
      startDate
      endDate
      status
    }
  }
}
```

## 📊 Давхардлын логик тайлбар

### Backend overlap check:

```typescript
OR: [
  {
    // Одоо байгаа захиалга таны хугацаанд эхэлж байна
    startDate: { gte: start, lt: end }
    // Жишээ: Одоо байгаа 18 >= таны 17 AND 18 < таны 24 ✅
  },
  {
    // Одоо байгаа захиалга таны хугацаанд дуусч байна
    endDate: { gt: start, lte: end }
    // Жишээ: Одоо байгаа 20 > таны 17 AND 20 <= таны 24 ✅
  },
  {
    // Одоо байгаа захиалга таны хугацааг бүхэлд нь багтааж байна
    AND: [
      { startDate: { lte: start } },
      { endDate: { gte: end } }
    ]
  }
]
```

### Жишээ:

| Таны range | Одоо байгаа захиалга | Давхардах эсэх | Шалтгаан |
|-----------|---------------------|---------------|----------|
| 17 - 24 | 18 - 20 | ✅ ДАВХАРДАНА | 18, 19 давхардаж байна |
| 17 - 18 | 18 - 20 | ❌ ДАВХАРДАХГҮЙ | 18 нь end point (check-out өдөр) |
| 20 - 24 | 18 - 20 | ❌ ДАВХАРДАХГҮЙ | 20 нь start point (check-in өдөр) |
| 15 - 17 | 18 - 20 | ❌ ДАВХАРДАХГҮЙ | Бүр өмнө |
| 21 - 25 | 18 - 20 | ❌ ДАВХАРДАХГҮЙ | Бүр дараа |

## 🎨 UI сайжруулалт

Frontend одоо **яг backend логиктой ижил** overlap checking хийж байна:

```typescript
const hasOverlap = activeBookings.some((booking: any) => {
  const bookingStart = new Date(booking.startDate);
  const bookingEnd = new Date(booking.endDate);
  
  return (
    (bookingStart >= checkInDate && bookingStart < checkOutDate) ||
    (bookingEnd > checkInDate && bookingEnd <= checkOutDate) ||
    (bookingStart <= checkInDate && bookingEnd >= checkOutDate)
  );
});
```

Энэ нь backend-ийн GraphQL query-тай **100% ижил** юм!

## 🚀 Туршилт:

1. ✅ Browser console-ийг нээж, logs харах
2. ✅ Захиалагдсан өдрүүдийг тэмдэглэх
3. ✅ Давхардахгүй огноо range сонгох
4. ✅ Console дээр "✅ No overlap detected" гэсэн мэдээлэл харагдах ёстой
5. ✅ Захиалга амжилттай үүсэх ёстой

## ⚠️ Анхааруулга:

Хэрэв та ногоон өнгөөр харагдаж байгаа өдрийг сонгож байгаа бол **туршиж үзээрэй!** 

Frontend одоо:
1. Disabled dates-ийг зөв тооцоолж байна (check-in - check-out хооронд)
2. Overlap-ийг backend логиктой ижлээр шалгаж байна
3. Дэлгэрэнгүй console logs харуулж байна

Хэрэв асуудал үргэлжилвэл:
- Console logs хуулаад надад илгээнэ үү
- Database дээрх захиалгуудын мэдээлэл хуулаад илгээнэ үү

---

Амжилт хүсье! 🎉

