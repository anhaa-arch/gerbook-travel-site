# 🛠️ Admin Dashboard - Сайжруулалтын төлөвлөгөө

## 📋 Асуудлууд:

### 1. **Хэл (Language)**
- ❌ Англи хэл дээр байна
- ✅ Монгол хэл рүү бүрэн орчуулах

### 2. **Захиалгын дэлгэрэнгүй (Booking Details)**
- ❌ Email, phone, dates харагдахгүй
- ❌ Yurt owner мэдээлэл харагдахгүй
- ✅ Phone, email, owner info нэмэх

### 3. **Хэрэглэгчийн засварлах/устгах (user Edit/Delete)**
- ❌ Ажиллахгүй байна
- ✅ Mutation-ууд зөв ажиллуулах

### 4. **Статистик (Platform Statistics)**
- ❌ "0 өнөөдөр" гэж харагдана
- ❌ Бодит өгөгдөл харагдахгүй
- ✅ Real-time data харуулах

### 5. **Export функц (Export to PDF/Excel)**
- ❌ Байхгүй
- ✅ Export button нэмэх

### 6. **Admin user creation**
- ❌ Байхгүй
- ✅ "Хэрэглэгч нэмэх" button нэмэх

### 7. **Camp creation UX**
- ❌ Муу байдалтай
- ✅ Herder dashboard шиг хялбар болгох

### 8. **Analytics**
- ❌ Байхгүй
- ✅ Charts, graphs нэмэх

## 🚀 Шинэчилсэн Queries (Completed):

```graphql
# ✅ Yurt owner info нэмэгдлээ
yurts {
  owner {
    id
    name
    email
    phone
    role
  }
}

# ✅ Booking user phone нэмэгдлээ
bookings {
  user {
    phone  # ← NEW
  }
  yurt {
    owner {  # ← NEW
      name
      email
      phone
    }
  }
}

# ✅ Order user phone нэмэгдлээ
orders {
  user {
    phone  # ← NEW
  }
  shippingAddress  # ← NEW
}
```

## 📝 Хийх ажлууд:

### Шат 1: Монгол хэл орчуулга

**Sections:**
- Overview → Тойм
- users → Хэрэглэгчид
- Camps → Гэр амралт
- Products → Бүтээгдэхүүн
- Orders → Захиалга
- Bookings → Баазын захиалга
- Analytics → Статистик
- Profile → Профайл

**Actions:**
- Edit → Засах
- Delete → Устгах
- Add New → Шинэ нэмэх
- View → Харах
- Export → Экспорт

**Stats:**
- Total users → Нийт хэрэглэгч
- Total Camps → Нийт бааз
- Total Products → Нийт бүтээгдэхүүн
- Total Orders → Нийт захиалга
- Total Revenue → Нийт орлого

### Шат 2: Booking details дэлгэрэнгүй

**Одоо:**
```tsx
<TableCell>{booking.user?.name}</TableCell>
```

**Шинэ:**
```tsx
<TableCell>
  <div>{booking.user?.name}</div>
  <div className="text-sm text-gray-500">
    {booking.user?.email}
  </div>
  <div className="text-sm text-gray-500">
    {booking.user?.phone}
  </div>
</TableCell>

<TableCell>
  <div>{booking.yurt?.name}</div>
  <div className="text-sm text-gray-500">
    Эзэн: {booking.yurt?.owner?.name}
  </div>
  <div className="text-sm text-gray-500">
    Утас: {booking.yurt?.owner?.phone}
  </div>
</TableCell>

<TableCell>
  <div>Эхлэх: {formatDate(booking.startDate)}</div>
  <div>Дуусах: {formatDate(booking.endDate)}</div>
</TableCell>
```

### Шат 3: Yurt owner info

**Camps tab дээр:**
```tsx
<TableCell>
  <div className="font-medium">{yurt.name}</div>
  <div className="text-sm text-gray-500">
    {yurt.location}
  </div>
  <div className="text-sm text-emerald-600">
    Эзэн: {yurt.owner?.name}
  </div>
  <div className="text-sm text-gray-500">
    {yurt.owner?.phone} • {yurt.owner?.email}
  </div>
</TableCell>
```

### Шат 4: user edit/delete функц

**Edit user:**
```tsx
const handleUpdateuser = async (userId: string, data: any) => {
  try {
    await updateuser({
      variables: {
        id: userId,
        input: {
          name: data.name,
          email: data.email,
          role: data.role,
          phone: data.phone
        }
      }
    });
    
    toast({
      title: "✅ Амжилттай",
      description: "Хэрэглэгч шинэчлэгдлээ"
    });
    
    refetchusers();
  } catch (error) {
    toast({
      title: "❌ Алдаа",
      description: error.message,
      variant: "destructive"
    });
  }
};
```

**Delete user:**
```tsx
const handleDeleteuser = async (userId: string) => {
  if (!window.confirm("Хэрэглэгчийг устгах уу?")) return;
  
  try {
    await deleteuser({ variables: { id: userId } });
    toast({
      title: "✅ Устгагдлаа",
      description: "Хэрэглэгч амжилттай устгагдлаа"
    });
    refetchusers();
  } catch (error) {
    toast({
      title: "❌ Алдаа",
      description: error.message,
      variant: "destructive"
    });
  }
};
```

### Шат 5: Platform statistics (Real data)

**Өнөөдрийн statistics:**
```tsx
const getTodayCount = (items: any[]) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return items.filter(item => {
    const itemDate = new Date(parseInt(item.createdAt));
    itemDate.setHours(0, 0, 0, 0);
    return itemDate.getTime() === today.getTime();
  }).length;
};

<Card>
  <CardHeader>
    <CardTitle>Шинэ хэрэглэгч бүртгэл</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="text-3xl font-bold">
      {getTodayCount(users)}
    </div>
    <p className="text-gray-500">+{getTodayCount(users)} өнөөдөр</p>
  </CardContent>
</Card>
```

### Шат 6: Export functionality

**Export button:**
```tsx
import * as XLSX from 'xlsx';

const exportToExcel = (data: any[], filename: string) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

<Button onClick={() => exportToExcel(bookings, 'bookings')}>
  <Download className="w-4 h-4 mr-2" />
  Excel татах
</Button>
```

### Шат 7: Admin user creation

**Add user Dialog:**
```tsx
<Dialog open={showAdduser} onOpenChange={setShowAdduser}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Шинэ хэрэглэгч нэмэх</DialogTitle>
    </DialogHeader>
    <form onSubmit={handleCreateuser}>
      <Input name="name" placeholder="Нэр" required />
      <Input name="email" type="email" placeholder="Имэйл" required />
      <Input name="phone" placeholder="Утас" required />
      <Input name="password" type="password" placeholder="Нууц үг" required />
      <Select name="role">
        <SelectItem value="CUSTOMER">Хэрэглэгч</SelectItem>
        <SelectItem value="HERDER">Малчин</SelectItem>
        <SelectItem value="ADMIN">Админ</SelectItem>
      </Select>
      <Button type="submit">Нэмэх</Button>
    </form>
  </DialogContent>
</Dialog>
```

### Шат 8: Analytics module

**Charts нэмэх:**
```tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

<Card>
  <CardHeader>
    <CardTitle>Сарын статистик</CardTitle>
  </CardHeader>
  <CardContent>
    <BarChart width={600} height={300} data={monthlyData}>
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="bookings" fill="#10b981" name="Захиалга" />
      <Bar dataKey="revenue" fill="#3b82f6" name="Орлого" />
    </BarChart>
  </CardContent>
</Card>
```

## 🎯 Priority:

1. **High:** Монгол хэл орчуулга
2. **High:** Booking/Order details дэлгэрэнгүй
3. **High:** user edit/delete засах
4. **Medium:** Statistics real data
5. **Medium:** Export functionality
6. **Low:** Admin user creation
7. **Low:** Analytics charts
8. **Low:** Camp creation UX

## 📦 Dependencies:

```bash
npm install xlsx recharts
# or
pnpm add xlsx recharts
```

## ✅ Next Steps:

1. Queries шинэчилгдсэн ✅
2. Component-ийг дараалалаар шинэчлэх
3. Тест хийх
4. user feedback авах

Та эдгээр сайжруулалтуудыг хийхийг хүсч байна уу? Эсвэл зарим нэгийг л хийх үү?

