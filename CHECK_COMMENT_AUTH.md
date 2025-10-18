# 🔐 Comment Authentication Debug - Quick Fix

## ❌ **Таны асуудал:**
Frontend app (`http://localhost:3000/camp/[id]`) дээр comment бичихэд "Нэвтрэх шаардлагатай" алдаа гарч байна.

---

## ✅ **ШУУРХАЙ ШАЛГАЛТ:**

### **1. Browser Console (F12) дээр ажиллуулах:**

```javascript
// === TOKEN ШАЛГАЛТ ===
const token = localStorage.getItem('token');
console.log('🔑 Token:', token ? 'EXISTS ✅' : 'MISSING ❌');
console.log('Token preview:', token ? token.substring(0, 50) + '...' : 'none');

// === USER ШАЛГАЛТ ===
const user = JSON.parse(localStorage.getItem('user') || 'null');
console.log('👤 User:', user ? `${user.name} (${user.email})` : 'MISSING ❌');
console.log('User role:', user?.role || 'none');

// === AUTHENTICATION STATUS ===
const isAuth = !!token && !!user;
console.log('✅ isAuthenticated:', isAuth);

if (!isAuth) {
  console.log('❌ YOU NEED TO LOGIN!');
  console.log('Go to: http://localhost:3000/login');
}
```

---

## 🔧 **ШИЙДЭЛ:**

### **Хэрэв token БАЙХГҮЙ бол:**

```
ШАЛГУУР:
Token: MISSING ❌
User: MISSING ❌
isAuthenticated: false

➡️ ШИЙДЭЛ: ДАХИН LOGIN ХИЙХ!

1. Navigate: http://localhost:3000/login
2. Login хийх (customer account)
3. http://localhost:3000/camp/[yurt-id] руу буцах
4. Comment дахин оролдох
```

---

### **Хэрэв token БАЙГАА боловч ажиллахгүй бол:**

Token expired болсон байж магадгүй:

```javascript
// Browser Console дээр:

// Token decode хийх (expired эсэхийг шалгах):
const token = localStorage.getItem('token');
if (token) {
  const parts = token.split('.');
  const payload = JSON.parse(atob(parts[1]));
  console.log('Token payload:', payload);
  console.log('Expires at:', new Date(payload.exp * 1000));
  console.log('Is expired:', Date.now() > payload.exp * 1000);
}
```

**Хэрэв expired бол:**
```
➡️ ШИЙДЭЛ: LOGOUT ХИЙГЭЭД ДАХИН LOGIN ХИЙХ!

1. Navigate: http://localhost:3000/user-dashboard
2. Logout button дарах
3. Login дахин хийх
4. Comment дахин оролдох
```

---

## 🐛 **BACKEND DEBUG ШАЛГАЛТ:**

Backend terminal дээр (tusul_back folder) энэ log харагдах ёстой:

```bash
🔐 CreateComment Auth Debug: {
  hasToken: true,
  tokenPreview: 'Bearer eyJhbGciOiJI...',
  user: { id: '...', email: '...', role: '...' }
}
```

**Хэрэв backend дээр юу ч log харагдахгүй бол:**
- Backend ажиллаж байгаа эсэхийг шалгах
- `cd tusul_back && npm run dev` ажиллуулах

**Хэрэв `user: null` гэж харагдвал:**
- Token буруу эсвэл expired
- Дахин login хийх

---

## 📋 **STEP-BY-STEP FIX:**

### **Step 1: Current User Check**
```javascript
// Browser Console:
const user = JSON.parse(localStorage.getItem('user') || 'null');
console.log(user);
```

**Expected:** `{ id: "...", name: "...", email: "...", role: "user" }`  
**If null:** Go to Step 2

---

### **Step 2: Logout & Login Again**
```
1. Navigate: http://localhost:3000/login
2. Enter credentials:
   - Email: customer@example.com
   - Password: password123
3. Click "Нэвтрэх"
4. Wait for redirect to dashboard
```

---

### **Step 3: Verify Authentication**
```javascript
// Browser Console:
localStorage.getItem('token')  // Should show token
localStorage.getItem('user')   // Should show user info
```

---

### **Step 4: Navigate to Camp Page**
```
http://localhost:3000/camp/3157a539-dcbf-4bb3-98cb-077ada574dd5
```

---

### **Step 5: Try Comment Again**
```
1. Scroll down to comment section
2. Click stars (1-5)
3. Type comment: "Сайхан газар!"
4. Click "Сэтгэгдэл үлдээх"
5. ✅ Should work!
```

---

## 🚨 **COMMON ПРИЧИНА:**

| Issue | Check | Solution |
|-------|-------|----------|
| Token expired | Decode token, check `exp` | Logout → Login again |
| Never logged in | `localStorage.getItem('user')` is null | Login first |
| Wrong credentials | Can't login | Use correct email/password |
| Backend not running | No backend logs | Start backend server |

---

## 🎯 **QUICK TEST CUSTOMER ACCOUNT:**

```
Email: customer@example.com
Password: password123
```

OR

```
Email: aylagch@gmail.com
Password: password123
```

---

## 📞 **Next Action:**

```
1. Open Browser Console (F12)
2. Run the TOKEN ШАЛГАЛТ script above
3. Share the results (screenshot)
4. If token is MISSING → LOGIN AGAIN
5. If token exists but error persists → Share backend terminal logs
```

---

**⚠️ АНХААРУУЛГА:** GraphQL Explorer (`http://localhost:8000/graphql`) дээр **БИШL** frontend app (`http://localhost:3000`) дээр test хийж байгаа эсэхээ баталгаажуулаарай!

**🎯 90% нь: Token expired эсвэл нэвтрээгүй байна. Дахин login хийвэл ажиллана!** 🚀

