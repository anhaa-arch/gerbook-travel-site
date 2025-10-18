# 🔍 Search & Filter систем - Бүрэн заавар

## ✅ Юу хийгдсэн:

Home page-ийн Search хэсгээс хайлт хийж `/camps` page руу шилжиж, filter-үүдийг автоматаар идэвхжүүлнэ.

### Features:

1. **"Хаана" (Аймаг)** → Province filter
2. **"Хэдэн" (Зочин тоо)** → Capacity filter (4 хүн гэвэл 4+ capacity)
3. **URL Query Parameters** → Filter state-ийг URL-д хадгална

## 🚀 Тест хийх:

### 1️⃣ Home Page → Search хэсэг

```
http://localhost:3000
```

Home page дээр Search хэсэг харагдана:

```
┌────────────────────────────────────────────────┐
│ Хаана          Хэзээ            Хэдэн    [Хайх]│
│ Газар хайх     Огноо сонгох     Зочин нэмэх    │
└────────────────────────────────────────────────┘
```

### 2️⃣ "Хаана" - Аймаг сонгох

1. **"Хаана"** input дээр дарна
2. Dropdown нээгдэнэ
3. **Аймаг сонгох** (жишээ: Төв, Архангай, Хөвсгөл гэх мэт)
4. Сонгосон аймаг харагдана

### 3️⃣ "Хэдэн" - Зочин тоо оруулах

1. **"Хэдэн"** input дээр дарна
2. Selector нээгдэнэ
3. **Зочин тоо сонгох** (жишээ: 4 хүн)
4. "4 зочин" гэж харагдана

### 4️⃣ "Хайх" button дарах

**"Хайх"** button дарвал автоматаар `/camps` page руу шилжинэ:

```
http://localhost:3000/camps?province=Төв&guests=4
```

### 5️⃣ Filter-үүдийг харах

`/camps` page дээр:

```
┌─────────────────────────────────────┐
│ 12 бааз олдлоо  Төв • 4+ зочин     │
└─────────────────────────────────────┘
```

**Үр дүн:**
- Зөвхөн **Төв** аймагт байгаа yurt-ууд
- **4+ багтаамжтай** yurt-ууд л харагдана

## 📋 Filter Логик:

### Province Filter:
```typescript
if (selectedProvince) {
  if (!location.includes(selectedProvince)) {
    return false
  }
}
```

### Capacity Filter:
```typescript
if (minCapacity > 0) {
  const campCapacity = parseInt(camp.capacity, 10) || 0
  if (campCapacity < minCapacity) {
    return false  // 4 хүн хайвал 3 хүнтэй yurt харагдахгүй
  }
}
```

**Жишээ:**
- **4 зочин** хайвал → 4, 5, 6, 10 хүнтэй yurt-ууд харагдана
- **2 зочин** хайвал → 2, 3, 4, 5... бүх yurt-ууд харагдана

## 🎯 Цэвэрлэх функц:

**"Цэвэрлэх"** button:
- Province filter арилна
- District filter арилна
- Capacity filter арилна (minCapacity = 0)

Button disabled байна:
- Province, District, Capacity бүгд хоосон үед

## 🔗 URL Query Parameters:

### Хайлтын жишээнүүд:

```
# Аймгаар л хайх
/camps?province=Төв

# Зочин тоогоор л хайх
/camps?guests=4

# Хоёуланг нь хайх
/camps?province=Архангай&guests=6

# Сум оруулах (manual)
/camps?province=Төв&district=Баянгол
```

## 📱 Responsive Design:

### Desktop:
```
[Хаана: Төв ×]  [Хэзээ: 2025/01/20 ×]  [Хэдэн: 4 зочин ×]  [🔍 Хайх]
```

### Mobile:
```
Хаана
[Төв                              ×]

Хэзээ
[2025/01/20                       ×]

Хэдэн
[4 зочин                          ×]

[🔍 Хайх]
```

## 🎨 UI Элементүүд:

### Active Filters Display:
```
12 бааз олдлоо  Төв, Баянгол • 4+ зочин
                 ↑              ↑
              Province      Capacity
```

### Clear Buttons:
- **× icon** - Тус бүрийн filter-д
- **Цэвэрлэх button** - Бүх filter-ийг цэвэрлэх

## 🧪 Тест Scenarios:

### Scenario 1: Province only
```
Home → Хаана: "Төв" → Хайх
Result: Зөвхөн Төв аймагт байгаа бүх yurt-ууд
```

### Scenario 2: Capacity only
```
Home → Хэдэн: "4 зочин" → Хайх
Result: 4+ багтаамжтай бүх yurt-ууд (бүх аймагт)
```

### Scenario 3: Province + Capacity
```
Home → Хаана: "Архангай" → Хэдэн: "6 зочин" → Хайх
Result: Архангай аймагт, 6+ багтаамжтай yurt-ууд
```

### Scenario 4: Clear filters
```
/camps?province=Төв&guests=4 → "Цэвэрлэх" дарах
Result: Бүх filter арилж, бүх yurt-ууд харагдана
```

### Scenario 5: Manual filter on /camps
```
/camps page дээр province/district select-ээс шууд сонгох
Result: URL update хийгдэхгүй, гэхдээ filter ажиллана
```

## 🔍 Debug:

Browser console дээр:
```javascript
🔍 Searching: { location: "Төв", guests: 4, url: "/camps?province=Төв&guests=4" }
🏔️ Province from URL: Төв
👥 Min capacity from URL: 4
```

## ✨ Бэлэн боллоо!

Одоо хэрэглэгчид Home page-ээс хайлт хийж, `/camps` page дээр шүүгдсэн үр дүн харах боломжтой боллоо! 🎉

## 📝 Нэмэлт Тайлбар:

### Capacity Filter-ийн давуу тал:
- **4 хүн** хайвал → 4, 5, 6, 10 хүнтэй бүх yurt харагдана
- **Хамгийн багадаа** 4 хүн багтах yurt-ууд л харагдана
- Том yurt-ууд бага зочинд ч тохиромжтой гэж үзэж байна

### Province + District logic:
- Province сонговол → Province дотрох бүх district
- District нэмвэл → Province, District хоёуланд тохирсон

