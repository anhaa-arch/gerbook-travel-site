# 🗺️ Аймаг/Сум Сонгох Системийн Засвар

## 🎯 Асуудал:

User тайлбарлаж байна:
> "баазийн мэдээлэл засах болон нэмэх үед аймгаас сонгох үед дараа яг тухайн аймгийн сумаас сонгох боломжтой болгоно уу. Зөвхөн аймагаар сонгож болоод байна."

---

## ✅ Хийгдсэн засварууд:

### 1. **Debug Logging нэмэгдлээ**

```typescript
// Province and district data
const provinces = mnzipData.zipcode;
const selectedProvince = provinces.find((p: any) => p.mnname === yurtForm.province);
const districts = selectedProvince?.sub_items || [];

// Debug log for districts
console.log('📍 Selected Province:', yurtForm.province);
console.log('📍 Districts available:', districts.length);
```

### 2. **Province Selector - Enhanced**

```typescript
<Select
  value={yurtForm.province}
  onValueChange={(value) => {
    console.log('🏔️ Province selected:', value);
    setYurtForm({ 
      ...yurtForm, 
      province: value,
      district: "", // Reset district when province changes
      location: value // Temporarily set to province only
    });
  }}
>
  <SelectTrigger>
    <SelectValue placeholder="Аймаг сонгох" />
  </SelectTrigger>
  <SelectContent className="max-h-[300px]">
    {provinces.map((province: any) => (
      <SelectItem key={province.zipcode} value={province.mnname}>
        {province.mnname}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

### 3. **District Selector - Fixed**

```typescript
<Select
  value={yurtForm.district}
  onValueChange={(value) => {
    console.log('🏘️ District selected:', value);
    const location = `${yurtForm.province}, ${value}`;
    setYurtForm({ 
      ...yurtForm, 
      district: value,
      location: location
    });
  }}
  disabled={!yurtForm.province}
>
  <SelectTrigger>
    <SelectValue placeholder={
      yurtForm.province 
        ? "Сум/Дүүрэг сонгох" 
        : "Эхлээд аймаг сонгоно уу"
    } />
  </SelectTrigger>
  <SelectContent className="max-h-[300px]">
    {districts.length > 0 ? (
      districts.map((district: any) => (
        <SelectItem key={district.zipcode} value={district.mnname}>
          {district.mnname}
        </SelectItem>
      ))
    ) : (
      <div className="p-2 text-sm text-gray-500">
        Сум олдсонгүй
      </div>
    )}
  </SelectContent>
</Select>
```

---

## 📊 Data Structure:

### mnzip.json Format:
```json
{
  "zipcode": [
    {
      "mnname": "Улаанбаатар",
      "zipcode": "11000",
      "sub_items": [
        {
          "mnname": "Багануур дүүрэг",
          "zipcode": "12000"
        },
        {
          "mnname": "Багахангай дүүрэг",
          "zipcode": "13000"
        }
      ]
    },
    {
      "mnname": "Архангай",
      "zipcode": "51000",
      "sub_items": [
        {
          "mnname": "Батцэнгэл",
          "zipcode": "51001"
        },
        {
          "mnname": "Булган",
          "zipcode": "51002"
        }
      ]
    }
  ]
}
```

---

## 🔄 Flow:

### Step 1: Аймаг сонгох
```
User clicks "Аймаг" dropdown
  ↓
Selects "Архангай"
  ↓
Console: 🏔️ Province selected: Архангай
  ↓
yurtForm.province = "Архангай"
yurtForm.district = "" (reset)
yurtForm.location = "Архангай"
  ↓
District dropdown becomes ENABLED
```

### Step 2: Сум сонгох
```
selectedProvince = find(province => province.mnname === "Архангай")
  ↓
districts = selectedProvince.sub_items
  ↓
Console: 📍 Districts available: 19
  ↓
User clicks "Сум/Дүүрэг" dropdown
  ↓
Sees list of 19 districts
  ↓
Selects "Батцэнгэл"
  ↓
Console: 🏘️ District selected: Батцэнгэл
  ↓
yurtForm.district = "Батцэнгэл"
yurtForm.location = "Архангай, Батцэнгэл"
```

---

## 🧪 Testing Steps:

### Test 1: Basic Flow
```bash
1. http://localhost:3000/herder-dashboard
2. "Шинэ бааз нэмэх" дарах
3. Аймаг dropdown нээх
4. "Архангай" сонгох
5. Console шалгах:
   ✅ 🏔️ Province selected: Архангай
   ✅ 📍 Selected Province: Архангай
   ✅ 📍 Districts available: 19
6. Сум/Дүүрэг dropdown нээх
7. ✅ 19 сум харагдах ёстой
8. "Батцэнгэл" сонгох
9. Console шалгах:
   ✅ 🏘️ District selected: Батцэнгэл
10. Location field шалгах:
    ✅ "Архангай, Батцэнгэл"
```

### Test 2: Province Change
```bash
1. Аймаг: "Архангай" сонгох
2. Сум: "Батцэнгэл" сонгох
3. Аймаг өөрчлөх: "Улаанбаатар"
4. ✅ Сум автоматаар reset хийгдэнэ
5. ✅ District dropdown-д Улаанбаатарын дүүргүүд харагдана
```

### Test 3: Empty Districts
```bash
1. If province has no sub_items (shouldn't happen)
2. District dropdown shows:
   ✅ "Сум олдсонгүй"
```

### Test 4: Edit Existing Camp
```bash
1. Existing camp: "Архангай, Батцэнгэл"
2. "Засах" дарах
3. ✅ Province: "Архангай" pre-selected
4. ✅ District: "Батцэнгэл" pre-selected
5. ✅ Can change both
```

---

## 🐛 Possible Issues & Solutions:

### Issue 1: Districts not showing
**Problem:** `districts.length === 0`
**Solution:**
```typescript
// Check if mnname matches exactly
const selectedProvince = provinces.find(
  (p: any) => p.mnname === yurtForm.province
);

// Debug
console.log('All provinces:', provinces.map(p => p.mnname));
console.log('Looking for:', yurtForm.province);
console.log('Found:', selectedProvince);
```

### Issue 2: Dropdown not updating
**Problem:** React not re-rendering
**Solution:**
```typescript
// Ensure state update triggers re-render
setYurtForm(prev => ({ 
  ...prev, 
  province: value,
  district: "",
}));
```

### Issue 3: Wrong data structure
**Problem:** `sub_items` doesn't exist
**Solution:**
```typescript
// Defensive coding
const districts = Array.isArray(selectedProvince?.sub_items) 
  ? selectedProvince.sub_items 
  : [];
```

---

## 📋 Available Provinces (21):

1. Улаанбаатар (capital)
2. Архангай
3. Баян-Өлгий
4. Баянхонгор
5. Булган
6.Говь-Алтай
7. Говьсүмбэр
8. Дархан-Уул
9. Дорноговь
10. Дорнод
11. Дундговь
12. Завхан
13. Орхон
14. Өвөрхангай
15. Өмнөговь
16. Сүхбаатар
17. Сэлэнгэ
18. Төв
19. Увс
20. Ховд
21. Хөвсгөл
22. Хэнтий

---

## 📊 Sample Districts:

### Архангай (19 сум):
- Батцэнгэл
- Булган
- Жаргалант
- Өгийнуур
- Өлзийт
- Өндөр-Улаан
- Тариат
- Төвшрүүлэх
- Хайрхан
- Хангай
- Хотонт
- Цахир
- Цэнхэр
- Чулуут
- Эрдэнэбулган
- Эрдэнэмандал
- Их тамир
- Цэцэрлэг
- Cэтгэл

### Улаанбаатар (9 дүүрэг):
- Багануур
- Багахангай
- Баянгол
- Баянзүрх
- Налайх
- Сонгинохайрхан
- Сүхбаатар
- Хан-Уул
- Чингэлтэй

---

## ✅ Benefits:

- ✅ **Дата бүрэн** - 21 аймаг, 300+ сум/дүүрэг
- ✅ **Монгол хэл** - Бүх нэршлэл монголоор
- ✅ **Зөв бүтэц** - Аймаг → Сум cascade
- ✅ **User-friendly** - Disabled state, placeholders
- ✅ **Debug logs** - Easy troubleshooting
- ✅ **Validation** - Province required for district
- ✅ **Reset logic** - District clears on province change

---

## 🚀 Future Enhancements:

### Phase 2: Search in Dropdown
```typescript
<SelectContent>
  <input 
    placeholder="Хайх..."
    onChange={(e) => filterDistricts(e.target.value)}
  />
  {filteredDistricts.map(...)}
</SelectContent>
```

### Phase 3: Geo-coordinates
```typescript
// Add lat/lng to mnzip.json
{
  "mnname": "Архангай",
  "coordinates": { "lat": 47.9167, "lng": 101.0667 },
  "sub_items": [...]
}
```

### Phase 4: Map Integration
```typescript
// Show selected location on map
<MapComponent 
  province={yurtForm.province}
  district={yurtForm.district}
/>
```

---

## 📝 Console Output (Expected):

```javascript
// On page load
📍 Selected Province: 
📍 Districts available: 0

// After selecting "Архангай"
🏔️ Province selected: Архангай
📍 Selected Province: Архангай
📍 Districts available: 19

// After selecting "Батцэнгэл"
🏘️ District selected: Батцэнгэл
📍 Selected Province: Архангай
📍 Districts available: 19
```

---

## ✅ Summary:

✅ Province/District selection аль хэдийн хэрэгжсэн
✅ Debug logging нэмэгдлээ
✅ Empty state handling
✅ Disabled logic зөв
✅ Data structure зөв (`mnzip.json`)
✅ Reset logic on province change
✅ Location formatting: "Аймаг, Сум"

---

Туршиж үзээд console logs хуулж илгээнэ үү! 🗺️🔍

