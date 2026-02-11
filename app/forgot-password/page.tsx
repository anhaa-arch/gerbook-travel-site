"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

import { useAuth } from "@/hooks/use-auth";

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
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md space-y-6">
        <Link
          href="/"
          className="block text-center text-xl font-semibold text-gray-900"
        >
          Malchin Camp
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 text-center">
          Нууц үг сэргээх
        </h1>
        <p className="text-center text-gray-600 text-sm">
          И-мэйл хаягаа оруулж сэргээх холбоос аваарай
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">И-мэйл</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-green-700 hover:bg-green-800"
            disabled={loading}
          >
            {loading ? "Илгээж байна..." : "Холбоос илгээх"}
          </Button>
          <div className="text-center">
            <Link
              href="/login"
              className="text-green-600 hover:text-green-500 text-sm"
            >
              Буцах
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
