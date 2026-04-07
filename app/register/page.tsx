"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, Eye, EyeOff, Check, User, Mail, Phone, Lock } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import OtpModal from "@/components/otp-modal";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { useGoogleLogin } from "@react-oauth/google";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("traveler");
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { requestRegistrationCode, register, googleSignIn } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

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
          title: "Амжилттай нэвтэрлээ",
          description: "Google-ээр амжилттай нэвтэрлээ.",
        });
      } catch (err: any) {
        toast({
          title: "Google нэвтрэлт амжилтгүй",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      toast({
        title: "Google нэвтрэлт амжилтгүй",
        description: "Google-ээр нэвтрэхэд алдаа гарлаа.",
        variant: "destructive",
      });
    },
  });

  const handleVerifyOtp = async (code: string) => {
    try {
      let role = "TRAVELER";
      if (activeTab === "herder") {
        role = "HERDER";
      } else if (activeTab === "admin") {
        role = "ADMIN";
      } else {
        role = "TRAVELER";
      }

      const input = {
        email: formData.identifier,
        password: formData.password,
        name: formData.identifier.split("@")[0] || "user",
        role,
      };

      await register(input, code);
      toast({
        title: "Бүртгэл амжилттай",
        description: "Таны бүртгэл амжилттай хийгдлээ.",
      });
      router.push("/");
    } catch (err: any) {
      toast({
        title: "Алдаа",
        description: err.message || "Баталгаажуулах код буруу байна",
        variant: "destructive",
      });
      throw err;
    }
  };

  const handleResendOtp = async () => {
    let role = "TRAVELER";
    if (activeTab === "herder") {
      role = "HERDER";
    } else if (activeTab === "admin") {
      role = "ADMIN";
    } else {
      role = "TRAVELER";
    }

    await requestRegistrationCode({
      email: formData.identifier,
      password: formData.password,
      name: formData.identifier.split("@")[0] || "user",
      role,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Алдаа",
        description: "Нууц үгүүд таарахгүй байна",
        variant: "destructive",
      });
      return;
    }

    if (!formData.acceptTerms) {
      toast({
        title: "Алдаа",
        description: "Та үйлчилгээний нөхцөлийг зөвшөөрөх ёстой",
        variant: "destructive",
      });
      return;
    }

    setPendingEmail(formData.identifier);
    setShowOtpModal(true);

    let role = "TRAVELER";
    if (activeTab === "herder") {
      role = "HERDER";
    } else if (activeTab === "admin") {
      role = "ADMIN";
    } else {
      role = "TRAVELER";
    }

    const input = {
      email: formData.identifier,
      password: formData.password,
      name: formData.identifier.split("@")[0] || "user",
      role,
    };
    await requestRegistrationCode(input);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row bg-[#fcfdf9]">
      <OtpModal
        open={showOtpModal}
        onOpenChange={setShowOtpModal}
        phone={pendingEmail}
        onVerify={handleVerifyOtp}
        onResend={handleResendOtp}
      />
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left side - Registration form */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white py-12 lg:py-0">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <Link
                href="/"
                className="inline-flex items-center space-x-3 mb-6 group transition-transform active:scale-95"
              >
                <div className="relative h-20 w-56">
                  <Image
                    src="/header.png"
                    alt="Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
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

              <h2 className="text-3xl font-black text-gray-900 mb-2">Бүртгүүлэх</h2>
              <p className="text-gray-500 font-medium">Шинэ бүртгэл үүсгэх</p>
            </div>

            <div className="flex bg-gray-50/50 p-1.5 rounded-2xl border border-gray-100 shadow-inner">
              <button
                type="button"
                className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeTab === "traveler"
                    ? "bg-white text-[#1b7c53] shadow-md"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("traveler")}
              >
                <User className="w-4 h-4" />
                <span>Хэрэглэгч</span>
              </button>
              <button
                type="button"
                className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeTab === "herder"
                    ? "bg-white text-[#1b7c53] shadow-md"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("herder")}
              >
                <div className="w-4 h-4">🏕️</div>
                <span>Малчин</span>
              </button>
              <button
                type="button"
                className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeTab === "admin"
                    ? "bg-white text-[#1b7c53] shadow-md"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("admin")}
              >
                <Lock className="w-4 h-4" />
                <span>Admin</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="identifier" className="text-gray-700 font-semibold text-sm ml-1">
                  Имэйл хаяг
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="identifier"
                    type="email"
                    value={formData.identifier}
                    onChange={handleInputChange}
                    placeholder="example@mail.com"
                    required
                    className="pl-11 bg-gray-50/50 border-gray-200 rounded-2xl h-12 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-gray-700 font-semibold text-sm ml-1">
                  Нууц үг
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    required
                    className="pl-11 pr-11 bg-gray-50/50 border-gray-200 rounded-2xl h-12 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1b7c53] transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-gray-700 font-semibold text-sm ml-1">
                  Нууц үг давтах
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    required
                    className="pl-11 pr-11 bg-gray-50/50 border-gray-200 rounded-2xl h-12 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1b7c53] transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-start space-x-2 pt-2">
                <Checkbox
                  id="acceptTerms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, acceptTerms: checked === true }))
                  }
                  className="mt-1 border-gray-300 data-[state=checked]:bg-[#1b7c53] data-[state=checked]:border-[#1b7c53]"
                />
                <Label htmlFor="acceptTerms" className="text-xs text-gray-500 leading-relaxed cursor-pointer">
                  Би{" "}
                  <Link href="/terms" className="text-[#1b7c53] font-bold hover:underline">
                    Үйлчилгээний нөхцөл
                  </Link>{" "}
                  болон{" "}
                  <Link href="/privacy" className="text-[#1b7c53] font-bold hover:underline">
                    Нууцлалын бодлогыг
                  </Link>{" "}
                  зөвшөөрч байна.
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#1b7c53] hover:bg-[#156040] text-white py-6 rounded-2xl font-bold shadow-lg shadow-[#1b7c53]/20 transition-all active:scale-[0.98] mt-6"
                disabled={loading}
              >
                {loading ? "Түр хүлээнэ үү..." : "Бүртгүүлэх"}
              </Button>
            </form>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest text-gray-400">
                <span className="px-3 bg-white">Эсвэл Google-ийг ашиглах</span>
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
              <span className="text-sm text-gray-500">
                Танд бүртгэл байгаа бол{" "}
                <Link href="/login" className="text-[#1b7c53] font-bold hover:underline">
                  Нэвтрэх
                </Link>
              </span>
            </div>


          </div>
        </div>

        {/* Sidebar for larger screens */}
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
    </div>
  );
}
