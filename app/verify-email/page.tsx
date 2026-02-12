"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";

// Component that uses useSearchParams inside Suspense
function VerifyEmailForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialEmail = searchParams.get("email") || "";

    const [email, setEmail] = useState(initialEmail);
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const { verifyRegistration, resendVerificationCode } = useAuth();
    const { toast } = useToast();

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || code.length !== 6) {
            toast({
                title: "Алдаа",
                description: "Имэйл болон 6 оронтой кодоо оруулна уу",
                variant: "destructive" as any,
            });
            return;
        }

        setLoading(true);
        try {
            await verifyRegistration(email, code);
            toast({
                title: "Амжилттай",
                description: "Таны имэйл баталгаажлаа",
            });

            // Redirect based on role not readily available here without decoding token, 
            // but verifyRegistration updates auth state. 
            // Let's rely on stored user or default to user-dashboard.
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                const u = JSON.parse(storedUser);
                const r = u.role?.toUpperCase();
                if (r === 'ADMIN') router.push('/admin-dashboard');
                else if (r === 'HERDER') router.push('/herder-dashboard');
                else router.push('/user-dashboard');
            } else {
                router.push("/user-dashboard");
            }
        } catch (err: any) {
            toast({
                title: "Амжилтгүй",
                description: err.message || "Баталгаажуулалт амжилтгүй боллоо",
                variant: "destructive" as any,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!email) {
            toast({
                title: "Алдаа",
                description: "Имэйл хаягаа оруулна уу",
                variant: "destructive" as any,
            });
            return;
        }

        try {
            // Use the newly added resendVerificationCode
            await resendVerificationCode(email);
            toast({
                title: "Амжилттай",
                description: "Баталгаажуулах код дахин илгээгдлээ",
            });
        } catch (err: any) {
            toast({
                title: "Амжилтгүй",
                description: err.message || "Код илгээхэд алдаа гарлаа",
                variant: "destructive" as any,
            });
        }
    };

    return (
        <div className="w-full max-w-md space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">
                    Имэйл баталгаажуулах
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                    {email
                        ? `Бид ${email} хаяг руу баталгаажуулах код илгээлээ.`
                        : "Бүртгүүлсэн имэйл хаяг болон кодоо оруулна уу."}
                </p>
            </div>

            <form onSubmit={handleVerify} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="email">Имэйл хаяг</Label>
                    <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={!!initialEmail} // Disable if passed from query
                        required
                    />
                </div>

                <div className="space-y-2 flex flex-col items-center">
                    <Label htmlFor="otp">Баталгаажуулах код</Label>
                    <InputOTP
                        maxLength={6}
                        value={code}
                        onChange={(val) => setCode(val)}
                    >
                        <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                        </InputOTPGroup>
                    </InputOTP>
                </div>

                <Button
                    type="submit"
                    className="w-full bg-green-700 hover:bg-green-800"
                    disabled={loading || code.length !== 6}
                >
                    {loading ? "Баталгаажуулж байна..." : "Баталгаажуулах"}
                </Button>
            </form>

            <div className="text-center">
                <button
                    type="button"
                    onClick={handleResend}
                    className="text-sm text-green-600 hover:text-green-500 underline"
                >
                    Код дахин илгээх
                </button>
            </div>

            <div className="text-center mt-4">
                <Link href="/register" className="text-sm text-gray-500 hover:text-gray-900">
                    Буцах
                </Link>
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <Suspense fallback={<div>Loading...</div>}>
                <VerifyEmailForm />
            </Suspense>
        </div>
    );
}
