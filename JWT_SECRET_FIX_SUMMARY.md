# ✅ JWT_SECRET Асуудал Засагдсан

## 🔍 Асуудал:
```
JWT verification failed: JsonWebTokenError: invalid signature
🔐 CreateComment Auth Debug: {
  hasToken: true,
  user: 'null'  ← User verify хийгдэхгүй байсан!
}
```

## ❌ Үндсэн шалтгаан:
- **Backend** `server.ts` нь `dotenv.config()` ашиглаж `.env` файл уншиж байсан
- **Гэхдээ** `.env` файлд `JWT_SECRET` байхгүй байсан
- `JWT_SECRET` зөвхөн `config/config.env` файлд байсан
- Login хийхэд **хуучин secret**-ээр token үүсгэж байсан
- Verify хийхэд **шинэ secret**-ээр шалгаж байсан
- ➡️ **Signature тохирохгүй!**

## ✅ Шийдэл:
`.env` файлд `JWT_SECRET` нэмсэн:

```bash
DATABASE_URL="mysql://root:90560444@127.0.0.1:3306/tusul_db"
PORT=8000
JWT_SECRET=seCretKey95598999
JWT_EXPIRE=30d
```

## 🔄 Backend Status:
- ✅ `.env` файл засагдсан
- ✅ `JWT_SECRET=seCretKey95598999` нэмэгдсэн
- ✅ Backend server ажиллаж байна (nodemon)
- ⚠️ **Server автоматаар restart хийсэн**

---

## 🎯 ОДОО ЯАХ ВЭ?

### 1️⃣ LOGOUT хийх (хуучин token устгах)
```javascript
// Browser Console (F12) дээр:
localStorage.clear();
console.log('✅ Token устгагдсан');
location.reload();
```

Эсвэл: `http://localhost:3000/user-dashboard` → "Logout" button

---

### 2️⃣ ДАХИН LOGIN (шинэ token авах)
```
➡️ http://localhost:3000/login

Email: customer@example.com
Password: password123

✅ "Нэвтрэх" дарах
```

**Юу болох вэ?**
- Login resolver шинэ JWT_SECRET ашиглана ✅
- Шинэ, зөв token үүснэ ✅
- localStorage-д хадгална ✅

---

### 3️⃣ CAMP PAGE ОЧИЖ COMMENT БИЧИХ
```
➡️ http://localhost:3000/camp/3157a539-dcbf-4bb3-98cb-077ada574dd5

1. ⭐️ Rating: 5 од сонгох
2. 📝 Comment: "Сайхан газар!"
3. ✅ "Сэтгэгдэл үлдээх" дарах
```

---

## ✅ Амжилттай бол:

### Frontend:
```
✅ "Амжилттай бүртгэгдлээ!" toast
✅ Comment жагсаалтад таны сэтгэгдэл гарч ирнэ
```

### Backend Terminal:
```bash
POST:http://localhost/graphql
🔐 CreateComment Auth Debug: {
  hasToken: true,
  user: { 
    id: 'xxx-xxx-xxx',
    email: 'customer@example.com',
    role: 'CUSTOMER'
  }  ← ✅ USER ТОДОРХОЙ БАЙНА!
}
```

**"JWT verification failed" алдаа ГАРАХГҮЙ!** 🎉

---

## 📋 Техник дэлгэрэнгүй:

### Token үүсгэх (Login):
```typescript
// utils/auth/jwt.ts:11
const payload = { id: user.id, role: user.role };
jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' });
// ✅ Одоо .env-ээс JWT_SECRET уншина
```

### Token verify хийх (GraphQL request):
```typescript
// server.ts:61
const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
jwt.verify(cleanToken, jwtSecret);
// ✅ Одоо .env-ээс JWT_SECRET уншина
```

**Хоёулаа адилхан secret ашиглана = signature тохирно!** ✅

---

## 🚀 Next Steps:

1. ✅ `.env` файл зассан (DONE)
2. ✅ Backend restart хийсэн (DONE)
3. ⏳ **Logout хийх** (ТА ХИЙНЭ)
4. ⏳ **Login хийх** (ТА ХИЙНЭ)
5. ⏳ **Comment бичих** (ТА ХИЙНЭ)

---

## ⚠️ Санамж:
- Хуучин token-үүд ажиллахгүй (хуучин secret-ээр үүссэн)
- **ЗААВАЛ logout → login хийх шаардлагатай!**
- Login хийсний дараа бүх зүйл хэвийн ажиллана

---

**Файл өөрчлөгдсөн:**
- ✅ `tusul_back/.env` (JWT_SECRET нэмэгдсэн)

**Бусад өөрчлөлт хэрэггүй!**

