"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { requestPasswordResetCode } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!email) {
      toast({
        title: "Алдаа",
        description: "И-мэйл хаягаа оруулна уу",
        variant: "destructive" as any,
      });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Алдаа",
        description: "И-мэйл хаягийн формат буруу байна",
        variant: "destructive" as any,
      });
      return;
    }

    setLoading(true);
    try {
      const res = await requestPasswordResetCode(email);
      if (res.success) {
        toast({
          title: "Амжилттай",
          description: res.message,
        });
        // Redirect to reset password page where user enters email, code and new password
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      } else {
        throw new Error(res.message);
      }
    } catch (e: any) {
      toast({
        title: "Амжилтгүй",
        description: e?.message || "Сэргээх хүсэлт амжилтгүй боллоо",
        variant: "destructive" as any,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfdf9]">
      <Header />
      <div className="flex-1 flex flex-col lg:flex-row">
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

              <h2 className="text-3xl font-black text-gray-900 mb-2">Нууц үг сэргээх</h2>
              <p className="text-gray-500 font-medium">
                Бүртгэлтэй и-мэйл хаягаа оруулж нууц үг сэргээх холбоос аваарай.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email" className="text-gray-700">
                  И-мэйл хаяг
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-2 bg-gray-50/50 border-gray-200 rounded-2xl h-12 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#1b7c53] hover:bg-[#156040] text-white py-6 rounded-2xl font-bold shadow-lg shadow-[#1b7c53]/20 transition-all active:scale-[0.98] mt-4"
                disabled={loading}
              >
                {loading ? "Илгээж байна..." : "Холбоос илгээх"}
              </Button>

              <div className="text-center">
                <Link
                  href="/login"
                  className="text-[#1b7c53] hover:text-[#156040] font-bold underline"
                >
                  Нэвтрэх хэсэг рүү буцах
                </Link>
              </div>
            </form>

            <div className="text-center text-xs text-gray-500 mt-8">
              Developed by Malchin Camp
            </div>
          </div>
        </div>

        {/* Sidebar for larger screens */}
        <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-green-600 to-green-800 items-center justify-center p-8">
          <div className="text-center text-white max-w-md">
            <h2 className="text-4xl font-black mb-6 drop-shadow-md">ТАСАЛЖ БОЛОХГҮЙ ТАЛЫН СОЁЛ</h2>
            <p className="text-xl mb-10 opacity-90 font-bold tracking-wide">
              НҮҮДЭЛЧИН АХУЙ СОЁЛ МОНГОЛЫН БАЯЛАГ
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
      <Footer />
    </div>
  );
}
