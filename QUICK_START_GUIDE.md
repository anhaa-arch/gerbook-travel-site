# 🚀 ХУРДАН ЭХЛҮҮЛЭХ ЗААВАР

## ⚡️ 1-CLICK START (Хамгийн хялбар!)

### **Windows Explorer-ээс:**

```
1. C:\gerbook-travel-site folder нээх
2. "START_SERVERS.bat" файл олох
3. Хоёр дарж ажиллуулах (Double-click)
```

**Юу болох вэ:**
- ✅ MySQL шалгагдана
- ✅ Backend server (Port 8000) шинэ цонхонд нээгдэнэ
- ✅ Frontend server (Port 3000) эхлэнэ

---

## 🛠️ ГАРААР ЭХЛҮҮЛЭХ (Manual)

### **Option 1: 2 Terminal ашиглах**

#### Terminal #1: Backend
```powershell
cd C:\gerbook-travel-site\tusul_back
npm start
```

Амжилттай эхэлсэн эсэхийг шалгах:
```
✅ Express server is running on port 8000
✅ GraphQL endpoint available at /graphql
✅ Connected to MySQL database
```

#### Terminal #2: Frontend
```powershell
cd C:\gerbook-travel-site
npm run dev
```

Амжилттай эхэлсэн эсэхийг шалгах:
```
✅ ready - started server on 0.0.0.0:3000
✅ url: http://localhost:3000
```

---

### **Option 2: Batch файлууд ашиглах**

#### Backend зөвхөн:
```
C:\gerbook-travel-site\tusul_back\START_SERVER.bat
```

#### Frontend зөвхөн:
```powershell
cd C:\gerbook-travel-site
npm run dev
```

---

## ✅ ШАЛГАХ

### Backend:
```
http://localhost:8000/graphql
```
→ Apollo GraphQL Playground харагдвал ✅

### Frontend:
```
http://localhost:3000
```
→ Home page харагдвал ✅

---

## ❌ АСУУДАЛ ГАРВАЛ

### MySQL ажиллахгүй байна:
```powershell
# Services шалгах
services.msc

# MySQL80 эсвэл MySQL service олоод "Start" дарах
```

### Port эзлэгдсэн:
```powershell
# Port 8000 шалгах
netstat -ano | findstr :8000

# Process устгах
taskkill /PID <process_id> /F
```

### Node modules алга:
```powershell
# Backend
cd tusul_back
npm install

# Frontend
cd ..
npm install
```

---

## 🎯 ЗӨВЛӨМЖ

**Хамгийн хялбар:**
```
START_SERVERS.bat хоёр дарж ажиллуулах! 🚀
```

**Хамгийн найдвартай:**
```
2 terminal нээж, Backend болон Frontend тус тусад нь ажиллуулах
```

---

## 📋 CURRENT STATUS

### Зассан зүйлс:
- ✅ JWT_SECRET .env файлд нэмэгдсэн
- ✅ MySQL service ажиллаж байна
- ✅ .env тохиргоо зөв байна

### Хийх шаардлагатай:
- ⏳ Backend server эхлүүлэх (npm start)
- ⏳ Frontend дээр шалгах (http://localhost:3000)
- ⏳ Logout → Login хийх (шинэ JWT token авах)
- ⏳ Comment бичих (test хийх)

---

## 🚀 NEXT STEPS

```
1. START_SERVERS.bat ажиллуулах
   ЭСВЭЛ
   Гараар 2 terminal нээж backend/frontend эхлүүлэх

2. http://localhost:3000 нээх

3. Logout → Login хийх
   (Email: customer@example.com, Password: password123)

4. Camp detail page очиж comment бичих
   http://localhost:3000/camp/[yurt-id]

5. ✅ АЖИЛЛАНА!
```

---

**Одоо START_SERVERS.bat ажиллуулаарай!** 💪

