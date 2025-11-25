# 🔐 Comment Authentication - Засвар

## 🐛 Асуудал:

Нэвтэрсэн хэрэглэгч сэтгэгдэл үлдээхийг оролдох үед:
```
[GraphQL]: Нэвтрэх шаардлагатай
code: "UNAUTHENTICATED"
```

**Шалтгаан:** Apollo Server-ийн context-д `user` мэдээлэл байхгүй байсан.

## ✅ Засвар:

### 1. JWT Authentication Function нэмсэн:

```typescript
// tusul_back/server.ts

const getuserFromToken = (token: string | undefined) => {
  if (!token) return null;
  
  try {
    const cleanToken = token.startsWith('Bearer ') 
      ? token.slice(7) 
      : token;
    
    const decoded = jwt.verify(cleanToken, JWT_SECRET);
    
    return {
      id: decoded.userId || decoded.id,
      email: decoded.email,
      role: decoded.role
    };
  } catch (error) {
    return null;
  }
};
```

### 2. Apollo Context шинэчилсэн:

```typescript
const apolloServer = new ApolloServer({
  schema,
  context: ({ req }): ApolloContext => {
    const token = req.headers.authorization;
    const user = getuserFromToken(token);
    
    return {
      prisma,
      req,
      user: user || undefined  // ← user мэдээлэл нэмэгдлээ
    };
  }
});
```

### 3. ApolloContext interface шинэчилсэн:

```typescript
export interface ApolloContext {
  prisma: typeof prisma;
  req: any;
  user?: {
    id: string;
    email: string;
    role: string;
  };
}
```

## 🚀 Backend Server Restart:

Backend terminal дээр:

```bash
# Ctrl+C дарж server зогсоох

# Дахин ажиллуулах
cd tusul_back
npm run dev
```

**Эсвэл** server автоматаар restart хийнэ (nodemon ашиглаж байвал).

## 🧪 Тест хийх:

### 1️⃣ Нэвтрэх:

```
http://localhost:3000/login
```

Email/утас, нууц үг оруулж нэвтрэх.

### 2️⃣ Camp detail page:

```
http://localhost:3000/camp/6f74c9a7-f197-45dd-a19f-a16b5a46813f
```

### 3️⃣ Сэтгэгдэл үлдээх:

1. Хуудасны доод тал руу scroll хийх
2. **Үнэлгээ** өгөх (1-5 од)
3. **Сэтгэгдэл** бичих
4. **"Сэтгэгдэл үлдээх"** дарах

**"✅ Амжилттай - Сэтгэгдэл амжилттай нэмэгдлээ"** гэсэн toast харагдах ёстой! 🎉

### 4️⃣ Сэтгэгдэл харах:

Таны нэмсэн сэтгэгдэл одоо харагдана:

```
┌─────────────────────────────────────┐
│ Сэтгэгдэл (1)                       │
│ ⭐ 5.0  (1 үнэлгээ)                │
├─────────────────────────────────────┤
│ 👤 Таны нэр                         │
│    ⭐⭐⭐⭐⭐                        │
│    2025 оны 1 сарын 18               │
│                                     │
│    Таны бичсэн сэтгэгдэл...         │
│                              [🗑️]  │
└─────────────────────────────────────┘
```

## 🔍 Debug:

### Browser Console (F12):

GraphQL request headers шалгах:
```javascript
// Application → Local Storage → token
localStorage.getItem('token')
```

Token байгаа эсэхийг шалгах.

### Backend Console:

Server дээр:
```
🔓 user authenticated: { id: '...', email: 'user@email.com', role: 'CUSTOMER' }
```

Эсвэл алдаа гарвал:
```
JWT verification failed: JsonWebTokenError: ...
```

## ⚠️ Анхааруулга:

### Хэрэв token байхгүй бол:

1. **Гарч, дахин нэвтрэх:**
   ```
   Logout → Login
   ```

2. **LocalStorage цэвэрлэх:**
   ```javascript
   localStorage.clear()
   location.reload()
   ```

### Хэрэв JWT_SECRET алдаатай бол:

`tusul_back/config/config.env` шалгах:
```env
JWT_SECRET=your-secret-key-here
```

## ✨ Бэлэн боллоо!

Одоо нэвтэрсэн хэрэглэгчид сэтгэгдэл үлдээх боломжтой боллоо! 🎉

## 📋 Token Flow:

```
1. Login → JWT Token үүснэ
2. localStorage-д хадгална
3. GraphQL request → Authorization header-т илгээнэ
4. Apollo Server → JWT verify хийнэ
5. Context.user → user мэдээлэл гарна
6. createComment resolver → context.user.id ашиглана
```

Token format:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

