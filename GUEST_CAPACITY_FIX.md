# ✅ Guest Capacity Limitation Fix

## 🔧 **Асуудал:**

Гэр амралт захиалах үед зочдын тоог багтаамжаас илүү сонгох боломжтой байсан:
- Багтаамж: **6 хүн**
- Гэхдээ **7, 8, 9...** хүн сонгож болдог байсан ❌

---

## ✅ **Шийдэл:**

### **Өмнө (буруу):**
```typescript
<Button
  onClick={() => setGuests(Math.min(6, guests + 1))}  // ❌ Hard-coded 6
  disabled={guests >= 6}
>
  +
</Button>
```

### **Одоо (зөв):**
```typescript
<Button
  onClick={() => setGuests(Math.min(camp.capacity || 6, guests + 1))}  // ✅ Dynamic
  disabled={guests >= (camp.capacity || 6)}
>
  +
</Button>

{guests >= (camp.capacity || 6) && (
  <p className="text-xs text-orange-600 mt-1 font-medium">
    ⚠️ Багтаамж: {camp.capacity} хүн
  </p>
)}
```

---

## 🎯 **Одоо:**

### **Example 1: Capacity 6 хүн**
```
Зочдын тоо:
[-] 2 хүн [+]

[+] дарах → 3, 4, 5, 6 хүн
6 хүн дээр:
  ⚠️ Багтаамж: 6 хүн  ← Warning харагдана
  [+] button disabled  ← 6-аас илүү сонгож болохгүй
```

### **Example 2: Capacity 4 хүн**
```
Зочдын тоо:
[-] 2 хүн [+]

[+] дарах → 3, 4 хүн
4 хүн дээр:
  ⚠️ Багтаамж: 4 хүн
  [+] button disabled
```

---

## 📋 **Features:**

1. ✅ **Dynamic Capacity**: Hard-coded 6-ийг `camp.capacity`-аар солисон
2. ✅ **Warning Message**: Багтаамжид хүрэхэд "⚠️ Багтаамж: X хүн" гэж харагдана
3. ✅ **Button Disabled**: Maximum хүрэхэд "+" button disabled болно
4. ✅ **Fallback**: `camp.capacity` байхгүй бол default 6 ашиглана

---

## 🧪 **Test:**

```
http://localhost:3000/camp/[any-camp-id]
```

**Test Case 1: 6 хүний багтаамжтай гэр**
1. Зочдын тоо: 2 хүн
2. [+] дарах → 3, 4, 5, 6
3. 6 хүн дээр:
   - ✅ "⚠️ Багтаамж: 6 хүн" харагдана
   - ✅ [+] button disabled
   - ✅ 7 хүн сонгож болохгүй

**Test Case 2: 4 хүний багтаамжтай гэр**
1. Зочдын тоо: 2 хүн
2. [+] дарах → 3, 4
3. 4 хүн дээр:
   - ✅ "⚠️ Багтаамж: 4 хүн" харагдана
   - ✅ [+] button disabled

---

**Бүгд ажиллана!** 🚀 Багтаамжаас илүү зочин авах боломжгүй боллоо!

