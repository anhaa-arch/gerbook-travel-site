"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { gql, useMutation } from "@apollo/client";

const FORGOT_PASSWORD_MUTATION = gql`
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email) {
      message
    }
  }
`;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [recoveryMethod, setRecoveryMethod] = useState<"email" | "phone">("email");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const [forgotPasswordMutation] = useMutation(FORGOT_PASSWORD_MUTATION);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (recoveryMethod === "email") {
      // Email validation
      if (!email) {
        toast({ 
          title: "Алдаа", 
          description: "Имэйл хаяг оруулна уу", 
          variant: "destructive" as any 
        });
        return;
      }
      
      // Basic email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast({ 
          title: "Алдаа", 
          description: "Имэйл хаягийн формат буруу байна", 
          variant: "destructive" as any 
        });
        return;
      }
    } else {
      // Phone validation
      if (!phone) {
        toast({ 
          title: "Алдаа", 
          description: "Утасны дугаараа оруулна уу", 
          variant: "destructive" as any 
        });
        return;
      }
      
      // Basic phone format validation (8 digits)
      if (!/^\d{8,}$/.test(phone.replace(/\D/g, ''))) {
        toast({ 
          title: "Алдаа", 
          description: "Утасны дугаар буруу байна", 
          variant: "destructive" as any 
        });
        return;
      }
    }

    setLoading(true);
    try {
      // Use the appropriate recovery credential based on the selected method
      const recoveryCredential = recoveryMethod === "email" ? email : phone;
      
      // For now, we'll use the email field for both email and phone
      // In the future, the backend should be updated to support phone recovery
      await forgotPasswordMutation({ 
        variables: { 
          email: recoveryCredential 
        } 
      });
      
      setEmailSent(true);
      
      if (recoveryMethod === "email") {
        toast({ 
          title: "Амжилттай", 
          description: "Нууц үг сэргээх холбоос имэйлдээ илгээгдлээ" 
        });
      } else {
        toast({ 
          title: "Амжилттай", 
          description: "Нууц үг сэргээх код утсан дээр илгээгдлээ" 
        });
      }
    } catch (err: any) {
      toast({ 
        title: "Алдаа", 
        description: err?.message || "Алдаа гарлаа. Дахин оролдоно уу", 
        variant: "destructive" as any 
      });
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    const recoveryCredential = recoveryMethod === "email" ? email : phone;
    const recoveryText = recoveryMethod === "email" 
      ? `${recoveryCredential} хаягт нууц үг сэргээх холбоос илгээгдлээ. Имэйлээ шалгаж, холбоос дээр дарж нууц үгээ сэргээнэ үү.`
      : `${recoveryCredential} дугаарт нууц үг сэргээх код илгээгдлээ. Утсаа шалгаж, кодыг оруулж нууц үгээ сэргээнэ үү.`;
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              {recoveryMethod === "email" ? "Имэйл илгээгдлээ" : "Код илгээгдлээ"}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {recoveryText}
            </p>
          </div>
          <div className="space-y-4">
            <Button
              onClick={() => router.push("/login")}
              className="w-full bg-green-700 hover:bg-green-800 text-white py-2 px-4 rounded-md font-medium"
            >
              Нэвтрэх хуудас руу буцах
            </Button>
            <Button
              onClick={() => {
                setEmailSent(false);
                if (recoveryMethod === "email") {
                  setEmail("");
                } else {
                  setPhone("");
                }
              }}
              variant="outline"
              className="w-full"
            >
              Дахин оролдох
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/login" className="inline-flex items-center text-green-600 hover:text-green-500 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Буцах
          </Link>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Нууц үг сэргээх
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {recoveryMethod === "email" 
              ? "Имэйл хаягаа оруулж, нууц үг сэргээх холбоос аваарай" 
              : "Утасны дугаараа оруулж, нууц үг сэргээх код аваарай"}
          </p>
        </div>
        
        {/* Recovery Method Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button
            type="button"
            onClick={() => setRecoveryMethod("email")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              recoveryMethod === "email"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Имэйл хаягаар
          </button>
          <button
            type="button"
            onClick={() => setRecoveryMethod("phone")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              recoveryMethod === "phone"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Утасны дугаараар
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {recoveryMethod === "email" ? (
            <div>
              <Label htmlFor="email" className="text-gray-700">
                Имэйл хаяг
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Имэйл хаягаа оруулна уу"
                required
                className="mt-1 bg-gray-50 border-gray-200"
              />
            </div>
          ) : (
            <div>
              <Label htmlFor="phone" className="text-gray-700">
                Утасны дугаар
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Утасны дугаараа оруулна уу"
                required
                className="mt-1 bg-gray-50 border-gray-200"
              />
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-green-700 hover:bg-green-800 text-white py-3"
            disabled={loading}
          >
            {loading ? "Түр хүлээнэ үү..." : "Нууц үг сэргээх холбоос илгээх"}
          </Button>
        </form>

        <div className="text-center">
          <span className="text-sm text-gray-600">
            Нууц үгээ санаж байна уу?{" "}
            <Link
              href="/login"
              className="text-green-600 hover:text-green-500 underline"
            >
              Нэвтрэх
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}