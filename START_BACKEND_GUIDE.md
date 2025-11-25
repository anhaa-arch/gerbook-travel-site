# 🚀 Backend Server Эхлүүлэх Заавар

## ❌ Асуудал:
```
ERR_CONNECTION_REFUSED
Failed to fetch
```

**Шалтгаан:** Backend server ажиллахгүй байна!

---

## ✅ ШИЙДЭЛ: Backend эхлүүлэх

### 📁 Terminal #1: Backend Server

```bash
# 1. Backend folder руу очих
cd tusul_back

# 2. Backend эхлүүлэх
npm start

# Харагдах ёстой:
# ✅ Express server is running on port 8000
# ✅ GraphQL endpoint available at /graphql
# ✅ Connected to MySQL database
```

---

### 📁 Terminal #2: Frontend Server

```bash
# 1. Project root folder руу очих (шинэ terminal)
cd C:\gerbook-travel-site

# 2. Frontend эхлүүлэх
npm run dev

# Харагдах ёстой:
# ✅ ready - started server on 0.0.0.0:3000
# ✅ url: http://localhost:3000
```

---

## 🔍 Шалгах:

### Backend шалгах:
```
http://"http://152.42.163.155:8000/graphql"

✅ Apollo GraphQL Playground гарч ирвэл зөв!
```

### Frontend шалгах:
```
http://localhost:3000

✅ Home page харагдвал зөв!
```

---

## ⚠️ ЧУХАЛ:

### 2 terminal хэрэгтэй!

```
Terminal #1: Backend (port 8000)
├── cd tusul_back
└── npm start

Terminal #2: Frontend (port 3000)
├── cd C:\gerbook-travel-site
└── npm run dev
```

---

## 🐛 Алдаа гарвал:

### Port эзлэгдсэн байвал:
```powershell
# Port 8000 эзэлж байгаа process олох
netstat -ano | findstr :8000

# Process ID-г олоод устгах
taskkill /PID <process_id> /F
```

### MySQL холбогдохгүй бол:
```bash
# MySQL service эхлүүлэх
# XAMPP эсвэл MySQL Workbench ашиглах
```

---

## ✅ Бүгд зөв бол:

1. ✅ Backend: `http://"http://152.42.163.155:8000/graphql"`
2. ✅ Frontend: `http://localhost:3000`
3. ✅ Apollo Client холбогдоно
4. ✅ GraphQL queries ажиллана

---

**Одоо backend эхлүүлээд frontend дахин шалгаарай!** 🚀

