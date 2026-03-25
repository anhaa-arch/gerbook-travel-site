"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { gql, useMutation } from "@apollo/client";
import { useGoogleLogin } from "@react-oauth/google";

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        name
        email
        role
      }
    }
  }
`;

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, googleSignIn } = useAuth();
  const { toast } = useToast();

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const googleUser = await res.json();

        await googleSignIn({
          googleId: googleUser.sub,
          email: googleUser.email,
          name: googleUser.name,
          avatar: googleUser.picture,
        });

        toast({
          title: "Amjillttai nevterlee",
          description: "Google-eer amjillttai nevterlee.",
        });
      } catch (err: any) {
        toast({
          title: "Google nevtrelt amjilltgui",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      toast({
        title: "Google nevtrelt amjilltgui",
        description: "Google-eer nevtrehed aldaa garlaa.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!identifier || !password) {
      toast({
        title: "Алдаа",
        description: "Мэдээллээ бүрэн оруулна уу",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await login({ email: identifier, password });
      toast({ title: "Амжилттай нэвтэрлээ" });
    } catch (err: any) {
      toast({
        title: "Нэвтрэх амжилтгүй",
        description: err?.message || "Нэвтрэх мэдээлэл буруу байна",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row bg-[#fcfdf9]">
      {/* Left side - Login form */}
      <div className="flex-1 flex items-center justify-center bg-white px-4 sm:px-6 lg:px-8 py-12 lg:py-0">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Link
              href="/"
              className="inline-flex items-center space-x-3 mb-8 group transition-transform active:scale-95"
            >
              <div className="w-10 h-10 bg-[#1b7c53] rounded-xl flex items-center justify-center shadow-lg shadow-[#1b7c53]/20">
                <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center">
                  <div className="w-3 h-3 bg-[#1b7c53] rounded-full"></div>
                </div>
              </div>
              <span className="text-2xl font-black text-gray-900 tracking-tight">
                MALCHIN
              </span>
            </Link>

            <div className="flex justify-center mb-10">
              <div className="relative">
                <button
                  onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                  className="flex items-center space-x-3 bg-gray-50 hover:bg-emerald-50 border border-gray-100 px-4 py-2 rounded-2xl transition-all"
                >
                  <span className="text-xl">🇲🇳</span>
                  <span className="text-sm font-bold text-gray-700">Монгол</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {isLanguageOpen && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-48 bg-white border border-gray-100 rounded-3xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                    <div className="p-2 space-y-1">
                      {[
                        { flag: "🇲🇳", name: "Монгол", code: "mn" },
                        { flag: "🇬🇧", name: "English", code: "en" },
                        { flag: "🇰🇷", name: "한국어", code: "ko" },
                      ].map((lang, index) => (
                        <button
                          key={index}
                          className="w-full flex items-center space-x-3 p-3 hover:bg-emerald-50 rounded-2xl transition-colors text-left group"
                          onClick={() => setIsLanguageOpen(false)}
                        >
                          <span className="text-xl group-hover:scale-110 transition-transform font-bold">{lang.flag}</span>
                          <span className="text-sm font-bold text-gray-700 group-hover:text-[#1b7c53]">
                            {lang.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <h2 className="text-3xl font-black text-gray-900 mb-2">Нэвтрэх</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="identifier" className="text-gray-700">
                Нэвтрэх нэр
              </Label>
              <Input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Утасны дугаар эсвэл Имэйлээ оруулна уу"
                required
                className="mt-2 bg-gray-50/50 border-gray-200 rounded-2xl h-12 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-700">
                Нууц үг
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Нууц үгээ оруулна уу."
                  required
                  className="mt-2 bg-gray-50/50 border-gray-200 pr-10 rounded-2xl h-12 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                />
                <Label htmlFor="remember" className="text-sm text-gray-600">
                  Намайг санах
                </Label>
              </div>
              <Link href="/forgot-password" className="text-sm text-[#1b7c53] hover:underline">
                Нууц үгээ мартсан уу?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#1b7c53] hover:bg-[#156040] text-white py-6 rounded-2xl font-bold shadow-lg shadow-[#1b7c53]/20 transition-all active:scale-[0.98] mt-4"
              disabled={loading}
            >
              {loading ? "Түр хүлээнэ үү..." : "Нэвтрэх"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500 text-xs uppercase tracking-widest">Эсвэл</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center space-x-3 py-6 border-2 border-gray-100 hover:border-gray-200 bg-white rounded-2xl font-bold transition-all active:scale-[0.98]"
            onClick={() => handleGoogleLogin()}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>Google-ээр нэвтрэх</span>
          </Button>

          <div className="text-center">
            <span className="text-sm text-gray-600">
              Танд бүртгэл байхгүй бол{" "}
              <Link href="/register" className="text-[#1b7c53] font-bold hover:underline">
                Бүртгүүлэх
              </Link>
            </span>
          </div>

          <div className="text-center text-xs text-gray-400 mt-8">
            Developed by Malchin Camp
          </div>
        </div>
      </div>

      {/* Right side - Sidebar */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-green-600 to-green-800 items-center justify-center p-8">
        <div className="text-center text-white max-w-md">
          <h2 className="text-4xl font-black mb-6 drop-shadow-md uppercase">Тасалж болохгүй талын соёл</h2>
          <p className="text-xl mb-10 opacity-90 font-bold tracking-wide uppercase">
            Нүүдэлчин ахуй соёл Монголын баялаг
          </p>
          <div className="space-y-6">
            <div className="flex items-center justify-center space-x-4 group">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-2xl">🏕️</span>
              </div>
              <span className="text-xl font-bold">Гэр амралт</span>
            </div>
            <div className="flex items-center justify-center space-x-4 group">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-2xl">🌄</span>
              </div>
              <span className="text-xl font-bold">Байгалийн сайхан</span>
            </div>
            <div className="flex items-center justify-center space-x-4 group">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-2xl">🐎</span>
              </div>
              <span className="text-xl font-bold">Малчны амьдрал</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
