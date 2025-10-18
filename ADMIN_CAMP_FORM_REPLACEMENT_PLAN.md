# Admin Dashboard - Camp Form Replacement Plan

## Current Problem
Admin Dashboard дээр "Add Camp" болон "Edit Camp" form-ууд муу харагдаж байна:
- ❌ Text input for amenities (checkbox биш)
- ❌ Text input for location (Province/District селект биш)
- ❌ JSON format for amenities/activities (user-friendly биш)
- ❌ No policies section
- ❌ Poor mobile responsive

## Solution
Herder Dashboard-ийн form-ийг хуулж Admin Dashboard руу тавих.

## Steps

### 1. Replace Add Camp Form (Lines 1812-2023)
**Old:**
```tsx
<form id="add-camp-form">
  <Input name="name" />
  <Input name="location" /> {/* Plain text */}
  <Input name="pricePerNight" />
  <Input name="capacity" />
  <Textarea name="description" />
  <Input name="amenities" /> {/* Plain text */}
  <Input name="images" />
</form>
```

**New (Herder Style):**
```tsx
<div className="space-y-6">
  {/* Name Input */}
  <Input value={campForm.name} onChange={(e) => setCampForm({...campForm, name: e.target.value})} />
  
  {/* Province Select */}
  <Select value={campForm.province} onValueChange={...}>
    {provinces.map(...)}
  </Select>
  
  {/* District Select */}
  <Select value={campForm.district} disabled={!campForm.province}>
    {districts.map(...)}
  </Select>
  
  {/* Amenities Checkboxes */}
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
    {amenitiesOptions.map((amenity) => (
      <Checkbox checked={campForm.amenities.includes(amenity.value)} />
    ))}
  </div>
  
  {/* Activities Checkboxes */}
  {/* Accommodation Type Select */}
  {/* Facilities Checkboxes */}
  {/* Policies Section */}
  {/* Image Upload */}
</div>
```

### 2. Variable Mapping
- `yurtForm` → `campForm`
- `setYurtForm` → `setCampForm`
- `fileInputRef` → already exists
- `uploadedImages` → already exists
- `provinces` → already calculated
- `districts` → already calculated

### 3. Sections to Copy from Herder Dashboard

#### Line Numbers in Herder Dashboard:
- **Basic Info (Name, Province, District, Price, Capacity):** 1370-1476
- **Description:** 1477-1492
- **Amenities Checkboxes:** 1493-1526
- **Activities Checkboxes:** 1528-1561
- **Accommodation Type Select:** 1563-1585
- **Facilities Checkboxes:** 1587-1620
- **Policies Section:** 1622-1771
- **Image Upload:** 1772-1900

#### Total Lines: ~530 lines of JSX

### 4. Edit Camp Form
Same logic but populate with `editingItem` data.

## Implementation

### Phase 1: Add Camp Form ✅ (Backend Ready)
- State: `campForm` ✅
- Logic: `handleAddCamp()` ✅
- Data: provinces/districts ✅
- UI: 🔄 Need to replace

### Phase 2: Edit Camp Form
- Similar to Add Camp
- Populate from `editingItem`

## Expected Outcome

**Before:**
```
Camp Name: [_________]
Location: [Ulaanbaatar, District 1]
Amenities: [wifi, hot_water, heating]
```

**After:**
```
Нэр: [_________]
Аймаг: [▼ Улаанбаатар]
Сум/Дүүрэг: [▼ Баянзүрх]

Тасалбар:
☑ WiFi
☑ Халуун ус
☑ Халаалт
☐ Душ

Үйл ажиллагаа:
☑ Морь унах
☐ Уулын алхалт
```

## Estimated Time
- Replace Add Camp form UI: 15-20 minutes
- Test Add Camp: 5 minutes
- Replace Edit Camp form UI: 10 minutes
- Test Edit Camp: 5 minutes
- **Total: ~40 minutes**

## Current Status
✅ Backend logic ready
✅ State management ready
✅ Province/District data ready
🔄 **Next: Replace form JSX (lines 1812-2023)**

