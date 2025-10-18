# Dashboard Mobile Responsive - Хурдан Заавар

## 🎯 Үндсэн Зарчим

User dashboard дээр хийсэн бүх өөрчлөлтүүдийг **Herder** болон **Admin** dashboard дээр ижилхэн хэрэглэнэ.

## 📱 Mobile Responsive Template

### 1. Container Padding
```tsx
// Before
<div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-8">

// After
<div className="px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-8">
```

### 2. Title Sizes
```tsx
// Before
<h1 className="text-2xl sm:text-3xl">

// After
<h1 className="text-xl sm:text-2xl md:text-3xl">

// Section titles
<h2 className="text-lg sm:text-xl md:text-2xl">
<h3 className="text-base sm:text-lg">
```

### 3. Tabs Navigation
```tsx
<TabsList className="grid w-full grid-cols-X gap-1 sm:gap-2 h-auto p-1">
  <TabsTrigger className="text-[10px] xs:text-xs sm:text-sm px-1.5 xs:px-2 sm:px-3 py-2 sm:py-2.5 whitespace-nowrap">
    {/* Mobile дээр товчилсон нэр */}
    <span className="hidden xs:inline">Нийт текст</span>
    <span className="xs:hidden">Товч</span>
  </TabsTrigger>
</TabsList>
```

### 4. Stats Cards
```tsx
<div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
  <Card className="shadow-sm">
    <CardHeader className="pb-1.5 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
      <CardTitle className="text-[10px] xs:text-xs sm:text-sm leading-tight">
        Текст<br className="xs:hidden" /> хоёр мөр
      </CardTitle>
      <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
    </CardHeader>
    <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
      <div className="text-lg xs:text-xl sm:text-2xl font-bold">
        {value}
      </div>
      <p className="text-[10px] xs:text-xs mt-0.5">
        Дэд текст
      </p>
    </CardContent>
  </Card>
</div>
```

### 5. Tables → Mobile Cards
```tsx
{/* Mobile: Card format */}
<div className="sm:hidden space-y-3">
  {items.map((item) => (
    <Card key={item.id} className="shadow-sm">
      <CardContent className="p-3">
        {/* Mobile-friendly layout */}
      </CardContent>
    </Card>
  ))}
</div>

{/* Desktop: Table format */}
<Card className="hidden sm:block shadow-sm">
  <Table>
    <TableHead className="text-xs md:text-sm">
    <TableCell className="text-xs md:text-sm">
  </Table>
</Card>
```

### 6. Grid Layouts
```tsx
// Bookings/Items grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
  <Card className="shadow-sm">
    <CardContent className="p-3 sm:p-4">
      {/* Content */}
    </CardContent>
  </Card>
</div>
```

### 7. Buttons
```tsx
<Button className="text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-2">
  Товч
</Button>
```

### 8. Icons
```tsx
<Icon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
```

### 9. Spacing
```tsx
// Between sections
className="space-y-3 sm:space-y-4 md:space-y-6"

// Between items
className="space-x-2 sm:space-x-3 md:space-x-4"

// Margins
className="mb-3 sm:mb-4 md:mb-6"
```

### 10. Card Padding
```tsx
<CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
<CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
<Card className="p-3 sm:p-4 md:p-6">
```

## 🎨 Text Size Scale

| Element | Mobile | XS (475px) | SM (640px) | MD (768px+) |
|---------|--------|------------|------------|-------------|
| Page Title | `text-xl` | - | `text-2xl` | `text-3xl` |
| Section Title | `text-lg` | - | `text-xl` | `text-2xl` |
| Card Title | `text-base` | - | `text-lg` | `text-xl` |
| Sub Title | `text-sm` | - | `text-base` | `text-lg` |
| Body Text | `text-xs` | `text-xs` | `text-sm` | `text-base` |
| Small Text | `text-[10px]` | `text-xs` | - | - |
| Badge | `text-[10px]` | `text-xs` | - | - |

## 🔍 Find & Replace Guide

Herder болон Admin dashboard дээр эдгээр өөрчлөлтүүдийг хийнэ:

### Step 1: Container
Find: `className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8"`  
Replace: `className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-8"`

### Step 2: Main Title
Find: `className="text-2xl sm:text-3xl`  
Replace: `className="text-xl sm:text-2xl md:text-3xl`

### Step 3: Section Titles (h2)
Find: `className="text-xl sm:text-2xl`  
Replace: `className="text-lg sm:text-xl md:text-2xl`

### Step 4: Sub Titles (h3)
Find: `className="text-lg`  
Replace: `className="text-base sm:text-lg`

### Step 5: Tabs (if exists)
Find: Tabs with fixed width or min-w  
Replace: Use responsive grid with proper gaps

### Step 6: Stats Cards (2 cols → 4 cols)
Find: `grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6`  
Replace: `grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6`

### Step 7: Card Padding
Find: `<CardContent className="p-4"`  
Replace: `<CardContent className="p-3 sm:p-4"`

Find: `<CardHeader className="...pb-2"`  
Replace: Add `pb-1.5 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6`

### Step 8: Tables
Wrap tables with mobile card alternative (see template above)

### Step 9: Spacing
Find: `gap-4 sm:gap-6`  
Replace: `gap-3 sm:gap-4 md:gap-6`

Find: `space-y-6`  
Replace: `space-y-4 sm:space-y-6`

## 🧪 Testing Checklist

Дараах хэмжээнүүд дээр шалгах:
- [ ] 320px - Хамгийн бага (iPhone SE)
- [ ] 375px - Standard phone
- [ ] 475px - XS breakpoint
- [ ] 640px - SM breakpoint (Tablet portrait)
- [ ] 768px - MD breakpoint (Tablet landscape)
- [ ] 1024px+ - Desktop

## 🚀 Quick Implementation

### Herder Dashboard
File: `app/herder-dashboard/herder-dashboard-content.tsx`

Priority fixes:
1. Container padding (line ~688)
2. Title sizes (line ~690-693)
3. Stats cards grid
4. Tables → Add mobile card layout
5. Bookings cards spacing

### Admin Dashboard
File: `app/admin-dashboard/admin-dashboard-content.tsx`

Priority fixes:
1. Container padding
2. Title sizes
3. Stats cards
4. User management table → Mobile cards
5. All tables → Mobile alternatives

## 💡 Pro Tips

1. **Don't break existing desktop layout** - Only add mobile styles
2. **Test on real device** - Emulator багаар хуурамч харагдаж магадгүй
3. **Use flex-shrink-0** for images to prevent squishing
4. **Use min-w-0** for truncation to work in flex containers
5. **Use whitespace-nowrap** for prices and numbers
6. **Add shadow-sm** to cards for better separation on mobile

## 📝 Notes

- Бүх өөрчлөлт **additive** байх ёстой (одоогийн desktop layout-г эвдэхгүй)
- Tailwind `xs` breakpoint (475px) ашиглах
- Mobile-first approach: жижгээс эхлээд томруулна
- Console.log-уудыг production дээр устгах

---

**Template үүсгэсэн огноо:** 2025-01-18  
**Үндэслэсэн:** User Dashboard Mobile Responsive Fixes  
**Зориулалт:** Herder & Admin Dashboard хурдан засварлахад

