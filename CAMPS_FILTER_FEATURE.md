# 🗺️ Camps Page - Location Filter Feature

## 🎯 Feature: Аймаг/Сум-аар шүүх

**Хэрэглэгч:** Camps хуудсанд аймаг, сум сонгож тухайн байршилтай тохирох yurt-уудыг харуулах

---

## ✅ Засварууд:

### 1. **Province (Аймаг) & District (Сум) Filter**

**Өмнө:**
- `mongoliaData` (хязгаарлагдмал дататай) ашиглаж байсан
- Province/District ID-аар шүүх (database location-той тохирохгүй)

**Одоо:**
- `mnzip.json` (бүх аймаг/сум бүрэн) ашиглана
- **Province name** болон **District name**-аар шүүнэ
- Database-ийн `location` field-тэй шууд тохирно

---

## 📊 Filter Logic:

### Location Format:
```
Database: "Сүхбаатар, Уулбаян"
          └── Аймаг  └── Сум
```

### Filter Algorithm:
```typescript
// Camp location: "Сүхбаатар, Уулбаян"

// 1. Province selected: "Сүхбаатар"
if (selectedProvince) {
  if (!location.includes("Сүхбаатар")) return false ❌
}

// 2. District selected: "Уулбаян"
if (selectedDistrict) {
  if (!location.includes("Уулбаян")) return false ❌
}

return true ✅
```

---

## 🖥️ UI Changes:

### Province Dropdown:
```typescript
<Select value={selectedProvince} onValueChange={handleProvinceChange}>
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

**Features:**
- ✅ All 21 Mongolian provinces
- ✅ Scrollable dropdown (max 300px)
- ✅ Placeholder: "Аймаг сонгох"

---

### District Dropdown:
```typescript
<Select 
  value={selectedDistrict} 
  onValueChange={handleDistrictChange} 
  disabled={!selectedProvince}
>
  <SelectTrigger>
    <SelectValue placeholder={selectedProvince ? "Сум сонгох" : "Эхлээд аймаг сонгоно уу"} />
  </SelectTrigger>
  <SelectContent className="max-h-[300px]">
    {availableDistricts.map((district: any) => (
      <SelectItem key={district.zipcode} value={district.mnname}>
        {district.mnname}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

**Features:**
- ✅ Disabled until province selected
- ✅ Dynamically loads districts for selected province
- ✅ Placeholder changes based on state
- ✅ Scrollable dropdown (max 300px)

---

### Clear Filter Button:
```typescript
<Button 
  variant="outline" 
  onClick={handleClearFilters}
  disabled={!selectedProvince && !selectedDistrict}
>
  <X className="w-4 h-4 mr-2" />
  Цэвэрлэх
</Button>
```

**Features:**
- ✅ Clear both province and district
- ✅ Disabled when no filters active
- ✅ Icon: X

---

### Results Summary:
```typescript
<p className="text-gray-600 font-medium">
  {filteredCamps.length} бааз олдлоо
  {selectedProvince && (
    <span className="ml-2 text-emerald-600">
      {selectedProvince}
      {selectedDistrict && `, ${selectedDistrict}`}
    </span>
  )}
</p>
```

**Example Output:**
```
15 бааз олдлоо Сүхбаатар
8 бааз олдлоо Сүхбаатар, Уулбаян
```

**Second Clear Button (Results area):**
```typescript
{(selectedProvince || selectedDistrict) && (
  <Button variant="ghost" size="sm" onClick={handleClearFilters}>
    <X className="w-4 h-4 mr-1" />
    Шүүлтүүр цэвэрлэх
  </Button>
)}
```

---

## 🔄 State Management:

### State Variables:
```typescript
const [selectedProvince, setSelectedProvince] = useState("")
const [selectedDistrict, setSelectedDistrict] = useState("")
```

### Handlers:
```typescript
// 1. Province change → reset district
const handleProvinceChange = (provinceName: string) => {
  console.log("🏔️ Province selected:", provinceName)
  setSelectedProvince(provinceName)
  setSelectedDistrict("")  // Reset district!
}

// 2. District change
const handleDistrictChange = (districtName: string) => {
  console.log("🏘️ District selected:", districtName)
  setSelectedDistrict(districtName)
}

// 3. Clear all filters
const handleClearFilters = () => {
  setSelectedProvince("")
  setSelectedDistrict("")
}
```

---

## 📁 Files Changed:

### 1. **app/camps/page.tsx**
```diff
- import { mongoliaData } from "@/lib/data"
+ import mnzipData from "@/data/mnzip.json"

- const selectedProvinceData = mongoliaData.provinces.find(...)
+ const selectedProvinceData = provinces.find((p: any) => p.mnname === selectedProvince)

+ const filteredCamps = yurts.filter((camp: any) => {
+   const location = camp.location || ""
+   if (selectedProvince && !location.includes(selectedProvince)) return false
+   if (selectedDistrict && !location.includes(selectedDistrict)) return false
+   return true
+ })
```

**Key Changes:**
- ✅ Switched from `mongoliaData` to `mnzip.json`
- ✅ Filter by province/district name (not ID)
- ✅ `includes()` check for substring match
- ✅ Added debug console logs
- ✅ Added clear filters button
- ✅ Added results summary with active filters
- ✅ Changed `fetchPolicy` to `"cache-and-network"` for fresh data

---

## 🧪 Testing Steps:

### Test 1: Province Filter
1. Visit http://localhost:3000/camps
2. Click "Аймаг сонгох" dropdown
3. Select "Сүхбаатар"
4. ✅ Only yurts with location containing "Сүхбаатар" should display
5. ✅ Results: "X бааз олдлоо Сүхбаатар"

### Test 2: District Filter
1. Province already selected: "Сүхбаатар"
2. Click "Сум сонгох" dropdown (should be enabled)
3. Select "Уулбаян"
4. ✅ Only yurts with location "Сүхбаатар, Уулбаян" should display
5. ✅ Results: "X бааз олдлоо Сүхбаатар, Уулбаян"

### Test 3: Clear Filters
1. Filters active: "Сүхбаатар, Уулбаян"
2. Click "Цэвэрлэх" button
3. ✅ Both dropdowns reset
4. ✅ All camps displayed
5. ✅ Results: "X бааз олдлоо"

### Test 4: Province Change
1. Select "Сүхбаатар" → Select district "Уулбаян"
2. Change province to "Төв"
3. ✅ District dropdown should reset
4. ✅ Placeholder: "Сум сонгох"
5. ✅ New districts loaded for "Төв"

### Test 5: No Camps Found
1. Select province with no camps
2. ✅ "0 бааз олдлоо [Province name]"
3. ✅ Empty grid displayed

---

## 🎯 Expected Console Logs:

### Province Selected:
```
🏔️ Province selected: Сүхбаатар
```

### District Selected:
```
🏘️ District selected: Уулбаян
```

### Filter Results:
```
📊 Filtered camps: 8
Original camps: 15
```

---

## 📋 Location Format Examples:

### Database Format:
```
✅ "Сүхбаатар, Уулбаян"
✅ "Төв, Улаанбаатар"
✅ "Архангай, Цэцэрлэг"
✅ "Хөвсгөл"  (Only province)
```

### Filter Matches:
```typescript
// Province: "Сүхбаатар"
"Сүхбаатар, Уулбаян"  ✅ Match
"Сүхбаатар, Баруун-Урт"  ✅ Match
"Төв, Улаанбаатар"  ❌ No match

// Province: "Сүхбаатар", District: "Уулбаян"
"Сүхбаатар, Уулбаян"  ✅ Match
"Сүхбаатар, Баруун-Урт"  ❌ No match
```

---

## 🔧 Data Source:

### mnzip.json Structure:
```json
{
  "zipcode": [
    {
      "zipcode": "210646",
      "mnname": "Сүхбаатар",
      "enname": "Sukhbaatar",
      "sub_items": [
        {
          "zipcode": "210646",
          "mnname": "Уулбаян",
          "enname": "Uulbayan"
        }
      ]
    }
  ]
}
```

---

## ✅ Summary:

### Features Implemented:
- ✅ Province dropdown (21 provinces)
- ✅ District dropdown (cascading, province-dependent)
- ✅ Filter yurts by location
- ✅ Clear filters button (2 locations)
- ✅ Results summary with active filters
- ✅ Disabled state for district dropdown
- ✅ Debug console logs
- ✅ Responsive design

### Benefits:
- 🎯 **Accurate filtering**: Uses actual province/district names
- 🗺️ **Complete data**: All 21 provinces + districts
- 🚀 **Fast**: Client-side filtering
- 💡 **user-friendly**: Clear placeholders and disabled states
- 🧹 **Easy to clear**: Multiple clear buttons

---

## 🚨 Important Notes:

1. **Location Format**: Ensure all yurts in database have `location` in format:
   ```
   "{Province}, {District}"
   or
   "{Province}"
   ```

2. **Case Sensitivity**: Filter uses `.includes()` which is case-sensitive. Mongolian names should match exactly.

3. **GraphQL Fetch**: Changed to `cache-and-network` to ensure fresh data on page load.

4. **Performance**: Client-side filtering is fast for < 1000 camps. For larger datasets, consider server-side filtering.

---

Амжилт хүсье! 🗺️🏕️

