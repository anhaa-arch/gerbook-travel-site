# ✅ User Dashboard - Owner Contact Info Fix

## 🔧 **Асуудал:**

User Dashboard дээр захиалгуудыг харахад малчинтай (yurt owner) холбогдох email болон утасны дугаар харагдахгүй байсан.

---

## ✅ **Шийдэл:**

### **1. GraphQL Query Update**

`app/user-dashboard/queries.ts` дээр `GET_USER_BOOKINGS` query-д owner мэдээлэл нэмсэн:

**Өмнө:**
```graphql
yurt {
  id
  name
  location
  images
}
```

**Одоо:**
```graphql
yurt {
  id
  name
  location
  images
  owner {
    id
    name
    email
    phone
  }
}
```

---

### **2. Interface Update**

`Booking` interface-д owner field нэмсэн:

```typescript
interface Booking {
  id: string;
  camp: string;
  location: string;
  // ... other fields
  owner?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
}
```

---

### **3. Data Mapping**

Booking data map хийхдээ owner мэдээллийг populate хийсэн:

```typescript
return {
  id: edge.node.id,
  camp: yurt.name || "Unknown Camp",
  // ... other fields
  owner: yurt.owner ? {
    id: yurt.owner.id,
    name: yurt.owner.name,
    email: yurt.owner.email,
    phone: yurt.owner.phone,
  } : undefined,
};
```

---

### **4. UI Display**

Booking card дээр owner contact info харуулах section нэмсэн:

```tsx
{/* Owner Contact Info */}
{booking.owner && (
  <div className="bg-gray-50 rounded-md p-2 sm:p-3 mb-3 space-y-1">
    <p className="text-xs font-semibold text-gray-700">
      Малчин: {booking.owner.name}
    </p>
    {booking.owner.phone && (
      <p className="text-xs text-gray-600 font-medium">
        📞 {booking.owner.phone}
      </p>
    )}
    {booking.owner.email && (
      <p className="text-xs text-gray-600 truncate font-medium">
        ✉️ {booking.owner.email}
      </p>
    )}
  </div>
)}
```

---

## 🎯 **Одоо харагдах байдал:**

```
┌────────────────────────────────┐
│ [Image]                        │
├────────────────────────────────┤
│ Баазын нэр     [Баталгаажсан] │
│ 📍 Улаанбаатар, Баянзүрх       │
│ 📅 2025/01/15 - 2025/01/20     │
│                                │
│ ┌──────────────────────────┐  │
│ │ Малчин: Хандаа           │  │
│ │ 📞 988314470             │  │
│ │ ✉️ emalchin@gmail.com    │  │
│ └──────────────────────────┘  │
│                                │
│ $150  total       2 guests     │
└────────────────────────────────┘
```

---

## 📋 **Features:**

1. ✅ **Owner Name**: Малчны нэр харагдана
2. ✅ **Phone Number**: Утасны дугаар (📞 icon-тай)
3. ✅ **Email**: Email хаяг (✉️ icon-тай)
4. ✅ **Responsive**: Mobile дээр мөн сайн харагдана
5. ✅ **Conditional Display**: Owner мэдээлэл байвал л харагдана
6. ✅ **Styled Box**: Gray background-тай box дотор харагдана

---

## 🧪 **Test:**

```
http://localhost:3000/user-dashboard
```

**Test Case:**
1. User Dashboard → "Миний захиалгууд" tab
2. Захиалга card дээр:
   - ✅ "Малчин: [name]" харагдана
   - ✅ "📞 [phone]" харагдана (байвал)
   - ✅ "✉️ [email]" харагдана (байвал)
3. Mobile device дээр test хийх:
   - ✅ Contact info responsive харагдана
   - ✅ Email truncate болно (урт бол)

---

## 🔗 **Files Changed:**

1. `app/user-dashboard/queries.ts`
   - ✅ Added `owner { id, name, email, phone }` to GET_USER_BOOKINGS

2. `app/user-dashboard/user-dashboard-content.tsx`
   - ✅ Updated `Booking` interface
   - ✅ Added owner mapping in bookings data
   - ✅ Added owner contact UI section

---

**Бүгд ажиллана!** 🚀 Одоо захиалга дээр малчинтай холбогдох мэдээлэл харагдана!

