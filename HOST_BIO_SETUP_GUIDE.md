# Эзэнтэй танилцах хэсэг идэвхжүүлэх зааварчилгаа

## ✅ Хийгдсэн өөрчлөлтүүд

### Backend
1. ✅ `tusul_back/prisma/schema.prisma` - User model-д `hostBio`, `hostExperience`, `hostLanguages` field-үүд нэмсэн
2. ✅ `tusul_back/graphql/schema/user.ts` - GraphQL schema шинэчилсэн
3. ✅ `tusul_back/utils/validation/index.ts` - Validation schema шинэчилсэн

### Frontend
1. ✅ `hooks/use-auth.tsx` - User interface болон GraphQL queries шинэчилсэн
2. ✅ `components/profile-settings.tsx` - "Эзэнтэй танилцах" хэсэг нэмсэн (Herder-үүдэд харагдана)
3. ✅ `app/herder-dashboard/herder-dashboard-content.tsx` - ProfileSettings-д host bio fields дамжуулж байна
4. ✅ `app/user-dashboard/user-dashboard-content.tsx` - ProfileSettings-д host bio fields дамжуулж байна
5. ✅ `app/camp/[id]/page.tsx` - Database-аас бодит host bio мэдээлэл татаж харуулна

## 🚀 Backend server-г restart хийх

**Windows PowerShell-д:**

```powershell
# 1. Backend folder-руу орох
cd C:\gerbook-travel-site\tusul_back

# 2. Одоо ажиллаж байгаа backend server-г зогсоох (Ctrl+C)

# 3. Prisma client-г шинэчлэх
npx prisma generate

# 4. Database-г sync хийх (migration-гүйгээр)
npx prisma db push

# 5. Backend server-г дахин ажиллуулах
npm run dev
```

**Хэрэв `npx prisma generate` ажиллахгүй бол:**
1. Backend server зогсоосон эсэхийг шалгах (Ctrl+C дарах)
2. VSCode/IDE-г хааж, file lock-г чөлөөлөх
3. Дахин оролдох

## 👤 Frontend дээр тест хийх

### 1. Хэрэглэгч гарч, дахин нэвтрэх
localStorage-д хадгалагдсан хуучин user data-г цэвэрлэх хэрэгтэй.

**Арга 1: Системээс гарах**
```
http://localhost:3000/login → "Гарах" button дарах → Дахин нэвтрэх
```

**Арга 2: Browser Console-д:**
```javascript
localStorage.clear()
location.reload()
```

### 2. Herder dashboard-руу орох

```
http://localhost:3000/herder-dashboard
```

1. **"Профайл"** tab дээр дарах
2. **"Эзэнтэй танилцах"** хэсэг харагдах ёстой:
   - **Туршлага:** `5+ жил туршлагатай` гэх мэт
   - **Хэл:** `Монгол, Англи, Орос` гэх мэт
   - **Танилцуулга:** Өргөн тайлбар бичих Textarea

3. Мэдээллээ оруулаад **"Хадгалах"** button дарах

### 3. Camp detail page-д шалгах

```
http://localhost:3000/camp/[YURT_ID]
```

**"Эзэнтэй танилцах"** хэсэгт таны оруулсан мэдээлэл харагдах ёстой:
- Нэр
- Туршлага (жишээ: "5+ жил туршлагатай")
- Хэл (жишээ: "Монгол, Англи")
- Танилцуулга

## 🔍 Асуудал шийдвэрлэлт

### "Эзэнтэй танилцах" хэсэг харагдахгүй байвал:

1. **Browser cache цэвэрлэх:**
   ```
   Ctrl + Shift + Delete → Cache цэвэрлэх
   ```

2. **localStorage цэвэрлэх:**
   ```javascript
   // Browser Console (F12)
   localStorage.clear()
   location.reload()
   ```

3. **Frontend restart:**
   ```bash
   npm run dev
   ```

4. **Role шалгах:**
   - "Эзэнтэй танилцах" хэсэг зөвхөн `HERDER` role-той хэрэглэгчдэд харагдана
   - User dashboard дээр энэ хэсэг харагдахгүй (зөвхөн admin/herder-үүд үүсгэдэг)

### Database асуудал:

Хэрэв backend дээр алдаа гарвал:

```bash
cd tusul_back
npx prisma migrate reset  # ⚠️ Анхааруулга: Бүх өгөгдөл устана!
npx prisma db push        # Schema sync (өгөгдлийг хадгална)
```

## 📝 Жишээ мэдээлэл

**Туршлага:**
```
5+ жил туршлагатай
10 жилийн туршлагатай гэр бууцын эзэн
2019 оноос хойш жуулчны үйлчилгээ үзүүлж байна
```

**Хэл:**
```
Монгол, Англи
Монгол, Англи, Орос, Герман
Mongolian, English, Chinese
```

**Танилцуулга:**
```
Сайн байна уу! Би Монголын уламжлалт гэр бууцын эзэн. 
Та бүхнийг Монголын байгальд тавтай морилъё. 
Өөрийн гэр бүлийнхээ хамт байгальд ойр амьдарч, 
жуулчдад үнэнч үйлчилгээ үзүүлэхийг зорьдог. 
Хүүхэд, ач зээ нартаа уламжлалт амьдралын хэв маягийг 
заан сургаж байна.
```

## ✅ Амжилттай!

Одоо herder-үүд өөрсдийн танилцуулгаа profile settings-аас засаж, 
camp detail page дээр хэрэглэгчдэд харуулах боломжтой боллоо! 🎉

