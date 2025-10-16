"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Globe, ChevronDown, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { gql, useMutation } from "@apollo/client";

const REGISTER_MUTATION = gql`
  mutation Register($input: CreateUserInput!) {
    register(input: $input) {
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

export default function RegisterPage() {
  const [activeTab, setActiveTab] = useState<"customer" | "herder" | "admin">(
    "customer"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [registerMutation] = useMutation(REGISTER_MUTATION);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Алдаа",
        description: "Нууц үг таарахгүй байна",
        variant: "destructive" as any,
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Алдаа",
        description: "Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой",
        variant: "destructive" as any,
      });
      return;
    }

    if (!formData.identifier) {
      toast({
        title: "Алдаа",
        description: "Утас эсвэл и-мэйл хаягаа оруулна уу",
        variant: "destructive" as any,
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const digits = formData.identifier.replace(/\D/g, "");
    const isEmailInput = emailRegex.test(formData.identifier);
    const isPhoneInput = /^\d{8,}$/.test(digits);

    if (!isEmailInput && !isPhoneInput) {
      toast({
        title: "Алдаа",
        description: "И-мэйл эсвэл утасны дугаарын формат буруу байна",
        variant: "destructive" as any,
      });
      return;
    }

    setLoading(true);
    try {
      // Build CreateUserInput as required by backend schema
      const generatedName = isEmailInput
        ? String(formData.identifier).split("@")[0]
        : `User_${digits}`;

      // Determine if current user is admin
      const isCurrentUserAdmin =
        user && (user as any).role?.toUpperCase() === "ADMIN";

      // Allow admin registration for testing purposes
      // TODO: Remove this in production - only admins should create ADMIN users
      // if (activeTab === "admin" && !isCurrentUserAdmin) {
      //   toast({
      //     title: "Зөвшөөрөлгүй үйлдэл",
      //     description: "Зөвхөн админ хэрэглэгчид шинэ админ бүртгэж болно",
      //     variant: "destructive" as any,
      //   });
      //   setLoading(false);
      //   return;
      // }

      // Determine role based on activeTab
      let role: string;
      if (activeTab === "herder") {
        role = "HERDER";
      } else if (activeTab === "admin") {
        role = "ADMIN";
      } else {
        role = "CUSTOMER";
      }

      const input: any = {
        email: isEmailInput ? formData.identifier : `${digits}@phone.local`,
        password: formData.password,
        name: generatedName || "User",
        ...(isPhoneInput ? { phone: digits } : {}),
        role,
      };

      const { data } = await registerMutation({
        variables: {
          input,
        },
      });

      const payload = data?.register;
      if (!payload?.token || !payload?.user)
        throw new Error("Invalid register response");
      localStorage.setItem("token", payload.token);
      toast({
        title: "Бүртгэл амжилттай",
        description: payload.user.email || "Бүртгэл амжилттай",
      });

      // Route based on user role if provided, otherwise default to user dashboard
      const dashboardRoutes: Record<string, string> = {
        ADMIN: "/admin-dashboard",
        HERDER: "/herder-dashboard",
        CUSTOMER: "/user-dashboard",
      };
      const normalizedRole = (payload.user.role || "CUSTOMER")
        .toString()
        .toUpperCase();
      router.push(dashboardRoutes[normalizedRole] || "/user-dashboard");
    } catch (err: any) {
      const gmsg = err?.graphQLErrors?.[0]?.message;
      const nmsg = err?.networkError?.message;
      toast({
        title: "Бүртгэл амжилтгүй",
        description: gmsg || nmsg || err?.message || "Дахин оролдоно уу",
        variant: "destructive" as any,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Registration form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white py-8 lg:py-0">
        <div className="max-w-md w-full space-y-6">
          {/* Logo */}
          <div className="text-center">
            <Link
              href="/"
              className="flex items-center justify-center space-x-2 mb-8"
            >
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                </div>
              </div>
              <span className="text-xl font-semibold text-gray-900">
                Malchin Camp
              </span>
            </Link>

            <div className="flex justify-center mb-6">
              <div className="relative">
                <button
                  onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                  className="flex items-center space-x-2 hover:bg-gray-50 p-2 rounded-lg"
                >
                  <img
                    src="/mng-flag.jpg"
                    alt="Монгол туг"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                </button>

                {isLanguageOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-3 border-b border-gray-100">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Globe className="w-4 h-4" />
                        <span>Бүх хэлийг харуулах</span>
                      </div>
                    </div>
                    <div className="p-2">
                      {[
                        { flag: "🇲🇳", name: "Монгол" },
                        { flag: "🇬🇧", name: "Англи" },
                        { flag: "🇨🇳", name: "Хятад" },
                        { flag: "🇯🇵", name: "Япон" },
                        { flag: "🇰🇷", name: "Солонгос" },
                        { flag: "🇷🇺", name: "Орос" },
                        { flag: "🇩🇪", name: "Герман" },
                      ].map((lang, index) => (
                        <button
                          key={index}
                          className="w-full flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md text-left"
                          onClick={() => setIsLanguageOpen(false)}
                        >
                          <span className="text-lg">{lang.flag}</span>
                          <span className="text-sm text-gray-700">
                            {lang.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Бүртгүүлэх
            </h2>
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => {
                setActiveTab("customer");
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "customer"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Аялагч
            </button>
            <button
              onClick={() => {
                setActiveTab("herder");
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "herder"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Малчин
            </button>
            <button
              onClick={() => {
                setActiveTab("admin");
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "admin"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              title="Админ хэрэглэгч бүртгүүлэх"
            >
              Админ
            </button>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label
                htmlFor="identifier"
                className="text-sm font-medium text-gray-700"
              >
                Нэвтрэх нэр
              </Label>
              <Input
                id="identifier"
                name="identifier"
                type="text"
                value={formData.identifier}
                onChange={handleChange}
                placeholder="Утасны дугаар эсвэл Имэйлээ оруулна уу"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <Label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Нууц үг
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Нууц үгээ оруулна уу."
                  required
                  className="mt-1 block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                  title="Toggle password visibility"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <Label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-gray-700"
              >
                Нууц үг баталгаажуулах
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Нууц үгээ дахин оруулна уу"
                  required
                  className="mt-1 block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label="Toggle confirm password visibility"
                  title="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Role selection removed - now using tabs for role selection */}

            <Button
              type="submit"
              className="w-full bg-green-700 hover:bg-green-800 text-white py-2 px-4 rounded-md font-medium"
              disabled={loading}
            >
              {loading ? "Түр хүлээнэ үү..." : "Үргэлжлүүлэх"}
            </Button>
          </form>
          {/* Login link */}
          <div className="text-center">
            <span className="text-sm text-gray-600">
              Бүртгэлтэй хэрэглэгч үү?{" "}
              <Link
                href="/login"
                className="font-medium text-green-600 hover:text-green-500"
              >
                Нэвтрэх
              </Link>
            </span>
          </div>

          {/* Social login */}
          <div className="space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Эсвэл</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center space-x-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              onClick={() => {
                // Google OAuth 2.0 (registration)
                const googleAuthUrl =
                  "https://accounts.google.com/o/oauth2/v2/auth";
                const redirectUri =
                  window.location.origin + "/auth/google/callback"; // client route
                const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
                if (!clientId) {
                  toast({
                    title: "Тохиргоо дутуу",
                    description:
                      "Google Client ID тохируулаагүй байна (NEXT_PUBLIC_GOOGLE_CLIENT_ID)",
                    variant: "destructive" as any,
                  });
                  return;
                }
                const params = new URLSearchParams({
                  client_id: clientId,
                  redirect_uri: redirectUri,
                  response_type: "code",
                  scope: "email profile",
                  prompt: "select_account",
                  access_type: "offline",
                  state: "register",
                });
                // Redirect to Google
                window.location.href = `${googleAuthUrl}?${params.toString()}`;
              }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Sign in with Google</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center space-x-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-black text-white hover:bg-gray-800"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              <span>Sign in with Apple</span>
            </Button>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 mt-8">
            Developed by Malchin Camp
          </div>
        </div>
      </div>

      {/* Right side - Sidebar for larger screens */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-green-600 to-green-800 items-center justify-center p-8">
        <div className="text-center text-white max-w-md">
          <h2 className="text-3xl font-bold mb-4">Монголын байгалийн сайхан</h2>
          <p className="text-lg mb-6 opacity-90">
            Гэр амралт, байгалийн сайхан, малчны амьдралыг мэдрэх боломж
          </p>
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-lg">🏕️</span>
              </div>
              <span className="text-lg">Гэр амралт</span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-lg">🌄</span>
              </div>
              <span className="text-lg">Байгалийн сайхан</span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-lg">🐎</span>
              </div>
              <span className="text-lg">Малчны амьдрал</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
