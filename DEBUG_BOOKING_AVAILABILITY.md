# 🐛 Захиалгын давхардал алдаа шалгах

## ❌ Асуудал:
Frontend дээр ногоон өнгөөр харуулж байгаа өдрүүдийг сонгосон ч backend алдаа өгч байна:
```
"Yurt is not available for the selected dates"
```

## 🔍 Шалгах алхамууд:

### 1. Browser Console шалгах
1. Browser DevTools нээнэ (F12)
2. Console tab сонгоно
3. Camp detail page дээр орох үед дараах logs харагдах ёстой:
   ```
   🔍 Active bookings for this yurt: [...]
   🚫 Total disabled dates: X
   🚫 Disabled date ranges: [...]
   ```

### 2. Backend database шалгах

Terminal дээр (tusul_back folder дотор):
```bash
cd tusul_back
```

Дараах GraphQL query-г Apollo Studio эсвэл GraphQL Playground дээр ажиллуулна:

```graphql
query GetYurtWithBookings {
  yurt(id: "6f74c9a7-f197-45dd-a19f-a16b5a46813f") {
    id
    name
    location
    bookings {
      id
      startDate
      endDate
      status
      userId
    }
  }
}
```

**Хүлээгдэж байгаа үр дүн:**
- Бүх захиалгуудын жагсаалт харагдах ёстой
- Status, date range шалгах

### 3. Overlap checking logic шалгах

Та сонгосон огноо:
- Start: 2025-10-17
- End: 2025-10-24

Хэрэв database дээр дараах захиалгууд байвал **давхардал** гарна:

| Захиалгын Start | Захиалгын End | Давхардах эсэх | Шалтгаан |
|----------------|---------------|---------------|----------|
| 2025-10-15 | 2025-10-18 | ✅ ДАВХАРДАНА | End (18) > таны start (17) |
| 2025-10-20 | 2025-10-25 | ✅ ДАВХАРДАНА | Start (20) < таны end (24) |
| 2025-10-16 | 2025-10-26 | ✅ ДАВХАРДАНА | Таны хугацааг бүхэлд нь багтааж байна |
| 2025-10-10 | 2025-10-15 | ❌ ДАВХАРДАХГҮЙ | End (15) < таны start (17) |
| 2025-10-25 | 2025-10-30 | ❌ ДАВХАРДАХГҮЙ | Start (25) > таны end (24) |

### 4. Backend overlap logic:

```typescript
// Backend-ийн checkYurtAvailability query
OR: [
  {
    // Захиалга таны хугацаанд эхэлж байна
    startDate: { gte: start, lt: end }
  },
  {
    // Захиалга таны хугацаанд дуусч байна
    endDate: { gt: start, lte: end }
  },
  {
    // Захиалга таны хугацааг бүхэлд нь хамарч байна
    AND: [
      { startDate: { lte: start } },
      { endDate: { gte: end } }
    ]
  }
]
```

## 🛠️ Шийдэл:

### Шийдэл 1: Database үнэн зөв эсэхийг шалгах

Terminal:
```bash
cd tusul_back
npx prisma studio
```

Prisma Studio нээгдэх үед:
1. "Booking" table сонгоно
2. `yurtId = 6f74c9a7-f197-45dd-a19f-a16b5a46813f` гэсэн захиалгуудыг хайна
3. Status = "PENDING" эсвэл "CONFIRMED" захиалгуудыг харна
4. Тэдгээрийн startDate, endDate шалгана

### Шийдэл 2: Цуцлагдсан захиалгуудыг шалгах

Хэрэв CANCELLED эсвэл COMPLETED захиалгууд байгаа бол тэд **disable болохгүй** байх ёстой.

Frontend logic:
```typescript
const activeBookings = camp.bookings.filter(
  (booking: any) => booking.status === 'PENDING' || booking.status === 'CONFIRMED'
);
```

Backend logic:
```typescript
status: { in: ['PENDING', 'CONFIRMED'] }
```

**Хоёулаа ижил байх ёстой!** ✅

### Шийдэл 3: Console logs-г шалгах

Browser console дээр:
```javascript
// Frontend дээр disable хийсэн өдрүүд
🚫 Disabled date ranges: ["2025-10-18", "2025-10-19", "2025-10-20", ...]
```

Таны сонгосон огноо (2025-10-17 - 2025-10-24) энэ жагсаалттай давхарч байна уу?

### Шийдэл 4: Timezone асуудал

Магадгүй timezone өөр байна:
```typescript
// Frontend
const startDate = new Date(checkIn).toISOString(); // "2025-10-17T00:00:00.000Z"

// Backend
const start = new Date(startDate); // UTC огноо
```

**Test:** GraphQL Playground дээр дараах query ажиллуулна:
```graphql
query CheckAvailability {
  checkYurtAvailability(
    yurtId: "6f74c9a7-f197-45dd-a19f-a16b5a46813f"
    startDate: "2025-10-17T00:00:00.000Z"
    endDate: "2025-10-24T00:00:00.000Z"
  )
}
```

**Хэрэв false буцаавал:** Database дээр давхардсан захиалга байна гэсэн үг

## 📊 Дараагийн алхам:

1. ✅ Browser console logs шалгах
2. ✅ Database дээрх захиалгуудыг харах (Prisma Studio)
3. ✅ `checkYurtAvailability` query тестлэх
4. ✅ Давхардсан захиалгуудыг олох
5. ✅ Хэрэв хуучин захиалга байвал status-ийг COMPLETED эсвэл CANCELLED болгох

## 🎯 Тест хийх:

```bash
# Terminal 1: Backend ажиллуулах
cd tusul_back
npm run dev

# Terminal 2: Frontend ажиллуулах
cd ..
npm run dev

# Browser:
# 1. http://localhost:3000/camps руу орно
# 2. Camp сонгоно
# 3. F12 дарж Console нээнэ
# 4. Console logs шалгах
# 5. Огноо сонгож захиалга хийж үзнэ
```

---

Асуулт байвал надад хэлээрэй!

