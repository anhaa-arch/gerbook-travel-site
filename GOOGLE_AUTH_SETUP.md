# Google Auth & Gmail SMTP Setup Guide (Production)

malchincamp.mn дээр Google нэвтрэлт болон Real Gmail ашиглах заавар.

## 1. Gmail SMTP тохируулах (Transactional Emails)
Имэйлээр 6 оронтой код илгээхийн тулд дараах алхмуудыг хийнэ:

1.  **Google Account**-ынхоо тохиргоо руу орно.
2.  **Security** хэсэг рүү орж **2-Step Verification**-г идэвхжүүлнэ.
3.  Хайлт хэсэгт нь **"App Passwords"** гэж бичиж ороод шинэ нууц үг үүсгэнэ (Жишээ нь: "Malchin Camp Web").
4.  Гарч ирсэн 16 оронтой нууц үгийг хуулж авна.
5.  Backend-ын `.env.production` файл дээр дараах утгуудыг тохируулна:
    ```env
    EMAIL_USER=таны-имэйл@gmail.com
    EMAIL_PASS=таны-сая-авсан-16-оронтой-код
    SMTP_HOST=smtp.gmail.com
    SMTP_PORT=587
    SMTP_SECURE=false
    ```

## 2. Google Cloud Console тохируулах (Google Login)
Google-ээр нэвтэрдэг болохын тулд "Google Client ID" хэрэгтэй:

1.  [Google Cloud Console](https://console.cloud.google.com/) руу орно.
2.  Шинэ проект үүсгэнэ.
3.  **APIs & Services > OAuth consent screen** рүү орж "External" сонгоод шаардлагатай мэдээллүүдийг бөглөнө.
4.  **Credentials** хэсэг рүү орж **Create Credentials > OAuth client ID** сонгоно.
5.  Application type-ыг **Web application** болгоно.
6.  **Authorized JavaScript origins** хэсэгт дараах хаягуудыг нэмнэ:
    *   `https://malchincamp.mn`
    *   `https://www.malchincamp.mn`
    *   `http://localhost:3000` (Тестийн зориулалтаар)
7.  **Authorized redirect URIs** хэсэгт (Хэрэв redirect ашиглах бол):
    *   `https://malchincamp.mn/auth/google/callback`
8.  Гарч ирсэн **Client ID** болон **Client Secret**-ийг хадгалж авна.

## 3. Вэбсайт дээр тохируулах (Environment Variables)

### Backend (`tusul_back/.env.production`)
```env
GOOGLE_CLIENT_ID=таны-client-id.apps.googleusercontent.com
```

### Frontend (`.env.local` эсвэл production-д)
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=таны-client-id.apps.googleusercontent.com
```

## 4. Кодны өөрчлөлт (Хийгдсэн)
Би дараах өөрчлөлтүүдийг аль хэдийн оруулсан:
- `hooks/use-auth.tsx`: `googleLogin` функц болон мутацийг нэмсэн.
- `tusul_back/graphql/resolvers/user.ts`: Google token шалгах логик бэлэн байгаа.
- `tusul_back/.env.production`: Placeholder утгуудыг нэмсэн.

## 5. Дараагийн алхам
Google-ээр нэвтрэх товчлуур дээр дарахад ID Token авч backend рүү явуулдаг болгохын тулд `@react-oauth/google` санг суулгахыг зөвлөж байна.
```bash
npm install @react-oauth/google
```
Үүний дараа `login/page.tsx` дээр Google login товчийг жинхэнэ утгаар нь ажиллуулах боломжтой болно.
