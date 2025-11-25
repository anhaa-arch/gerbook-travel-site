# 🔐 Comment Authentication Troubleshooting Guide

## ❌ **Асуудал:**

```graphql
[GraphQL]: Нэвтрэх шаардлагатай
code: "UNAUTHENTICATED"
```

user нэвтэрсэн боловч comment бичиж чадахгүй байна.

---

## ✅ **Шалгах:**

### **1. Browser Console дээр token шалгах:**

```javascript
// Browser Console (F12) дээр энэ command ажиллуулна:
localStorage.getItem('token')

// Хэрэв null буюу expired token бол:
// → Login дахин хийх хэрэгтэй!
```

**Хүлээгдэж буй үр дүн:**
```
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."  ← Token байх ёстой
```

**Хэрэв null бол:**
```
null  ← Token байхгүй! Дахин нэвтрэх!
```

---

### **2. GraphQL Explorer vs Frontend App:**

#### ❌ **GraphQL Explorer (http://"http://152.42.163.155:8000/graphql")**
- Manual authorization header нэмэх хэрэгтэй
- HTTP Headers section дээр:
  ```json
  {
    "Authorization": "Bearer YOUR_TOKEN_HERE"
  }
  ```

#### ✅ **Frontend App (http://localhost:3000)**
- Автоматаар authorization header нэмэгдэнэ
- Apollo Client `authLink` token илгээнэ
- **Зөвлөмж:** Frontend дээр test хийнэ!

---

### **3. user нэвтэрсэн эсэхийг шалгах:**

```javascript
// Browser Console:
localStorage.getItem('user')

// Хүлээгдэж буй:
{
  "id": "...",
  "email": "customer@example.com",
  "name": "Customer",
  "role": "user"  // эсвэл "herder", "admin"
}
```

---

## 🔧 **Шийдэл:**

### **Option 1: Дахин Login хийх**

1. Navigate: `http://localhost:3000/login`
2. Email/Password оруулж нэвтрэх
3. Success → Token автоматаар хадгалагдана
4. Comment дахин оролдох

### **Option 2: Frontend дээр test хийх**

1. Navigate: `http://localhost:3000/camp/[yurt-id]`
2. Page scroll down → Comment section
3. Rating сонгох (⭐️ 1-5)
4. Comment бичих
5. "Сэтгэгдэл үлдээх" button дарах
6. ✅ Амжилттай!

### **Option 3: GraphQL Explorer дээр manual header нэмэх**

GraphQL Explorer ашиглах бол:

1. Login хийж token авах:
   ```graphql
   mutation Login {
     login(email: "customer@example.com", password: "password123") {
       token
       user { id name email role }
     }
   }
   ```

2. Token copy хийх

3. HTTP Headers section дээр:
   ```json
   {
     "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   }
   ```

4. CreateComment дахин ажиллуулах

---

## 🐛 **Debug Steps:**

### **Backend Debug Log:**

Server дээр `server.ts` файлд debug log нэмсэн:

```typescript
if (req.body?.operationName === 'CreateComment') {
  console.log('🔐 CreateComment Auth Debug:', {
    hasToken: !!token,
    tokenPreview: token ? `${token.substring(0, 20)}...` : 'none',
    user: user ? { id: user.id, email: user.email, role: user.role } : 'null'
  });
}
```

**Backend terminal дээр харах:**
```bash
# Backend server running дээр:
🔐 CreateComment Auth Debug: {
  hasToken: true,
  tokenPreview: 'Bearer eyJhbGciOiJI...',
  user: { id: '...', email: 'customer@example.com', role: 'CUSTOMER' }
}
```

**Хэрэв `hasToken: false` бол:** Frontend token илгээгээгүй  
**Хэрэв `user: null` бол:** Token буруу эсвэл expired

---

## 📋 **System Flow:**

```
Frontend (CommentSection)
  ↓
useAuth hook
  ↓ (localStorage.getItem('token'))
Apollo Client (authLink)
  ↓ (Authorization: Bearer ...)
Backend (server.ts context)
  ↓ (getuserFromToken)
Comment Resolver
  ↓ (context.user?.id check)
Success / Error
```

---

## ✅ **Expected Behavior:**

### **Successful Comment Creation:**

**Frontend:**
```
1. user нэвтэрсэн (isAuthenticated: true)
2. Comment бичих
3. "Сэтгэгдэл үлдээх" дарах
4. Toast: "✅ Амжилттай - Сэтгэгдэл амжилттай нэмэгдлээ"
5. Comment list дээр шинэ comment харагдана
```

**Backend:**
```
🔐 CreateComment Auth Debug: {
  hasToken: true,
  tokenPreview: 'Bearer eyJhbGciOiJI...',
  user: { id: 'abc123', email: 'customer@example.com', role: 'CUSTOMER' }
}
✅ Comment created successfully
```

---

## 🚨 **Common Issues:**

| Issue | Cause | Solution |
|-------|-------|----------|
| "Нэвтрэх шаардлагатай" | Token байхгүй | Дахин login хийх |
| "Нэвтрэх шаардлагатай" | Token expired | Дахин login хийх |
| "Нэвтрэх шаардлагатай" | GraphQL Explorer ашиглаж байна | Manual header нэмэх |
| Comment form disabled | `isAuthenticated: false` | Login шалгах |

---

## 🧪 **Test Script:**

```javascript
// Browser Console (F12):

// 1. Check token
const token = localStorage.getItem('token');
console.log('Token:', token ? 'EXISTS ✅' : 'MISSING ❌');

// 2. Check user
const user = JSON.parse(localStorage.getItem('user') || 'null');
console.log('user:', user ? `${user.name} (${user.role}) ✅` : 'MISSING ❌');

// 3. Check authentication
console.log('isAuthenticated:', !!token && !!user ? 'YES ✅' : 'NO ❌');

// If all ✅ → Comment should work!
// If any ❌ → Need to login again
```

---

## 📞 **Next Steps:**

1. ✅ Browser console дээр token шалгах
2. ✅ Frontend app (`/camp/[id]`) дээр test хийх
3. ✅ Backend debug log шалгах
4. ✅ Хэрэв асуудал үргэлжилвэл screenshot илгээх

**Магадгүй token expired болсон байна. Дахин login хийгээд дахин оролдоорой!** 🚀

