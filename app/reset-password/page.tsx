"use client"
import React, { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, ArrowLeft, KeyRound } from "lucide-react";
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/use-auth'

function ResetPasswordForm() {
  const params = useSearchParams()
  const initialEmail = params.get('email') || ''

  const [email, setEmail] = useState(initialEmail)
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isLanguageOpen, setIsLanguageOpen] = useState(false)

  const { toast } = useToast()
  const { resetPasswordWithCode } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return

    if (!email) {
      toast({ title: 'Алдаа', description: 'Имэйл хаяг шаардлагатай', variant: 'destructive' as any })
      return
    }
    if (code.length !== 6) {
      toast({ title: 'Алдаа', description: '6 оронтой код оруулна уу', variant: 'destructive' as any })
      return
    }
    if (newPassword.length < 8) {
      toast({ title: 'Алдаа', description: 'Шинэ нууц үг дор хаяж 8 тэмдэгттэй байх ёстой', variant: 'destructive' as any })
      return
    }

    setLoading(true)
    try {
      // @ts-ignore
      const res = await resetPasswordWithCode(email, code, newPassword)
      if (res?.success) {
        toast({ title: 'Амжилттай', description: res.message })
        router.push('/login')
      } else {
        throw new Error(res?.message || 'Failed')
      }
    } catch (err: any) {
      console.error(err)
      toast({ title: 'Алдаа', description: err?.message || 'Нууц үг сэргээхэд алдаа гарлаа', variant: 'destructive' as any })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col lg:flex-row bg-[#fcfdf9]">
      {/* Left side - Reset Password form */}
      <div className="flex-1 flex items-center justify-center bg-white px-4 sm:px-6 lg:px-8 py-12 lg:py-0">
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

            <h2 className="text-3xl font-black text-gray-900 mb-2">Нууц үг шинэчлэх</h2>
            <p className="text-gray-500 font-medium">Кодоо ашиглан нууц үгээ шинэчлэнэ үү</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-gray-700 font-semibold text-sm ml-1">Имэйл</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Имэйл хаягаа оруулна уу" required className="bg-gray-50/50 border-gray-200 rounded-2xl h-12 focus:ring-emerald-500 focus:border-emerald-500 transition-all" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="code" className="text-gray-700 font-semibold text-sm ml-1">Баталгаажуулах код</Label>
                <Input id="code" type="text" maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} placeholder="000000" required className="bg-gray-50/50 border-gray-200 rounded-2xl h-12 text-center tracking-widest font-mono focus:ring-emerald-500 focus:border-emerald-500 transition-all" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="newPassword" className="text-gray-700 font-semibold text-sm ml-1">Шинэ нууц үг</Label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Шинэ нууц үгээ оруулна уу" required className="pl-11 bg-gray-50/50 border-gray-200 rounded-2xl h-12 focus:ring-emerald-500 focus:border-emerald-500 transition-all" />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full bg-[#1b7c53] hover:bg-[#156040] text-white py-6 rounded-2xl font-bold shadow-lg shadow-[#1b7c53]/20 transition-all active:scale-[0.98]" disabled={loading}>
              {loading ? 'Түр хүлээнэ үү...' : 'Нууц үг шинэчлэх'}
            </Button>
          </form>

          <div className="text-center mt-8">
            <Link href="/login" className="inline-flex items-center text-sm font-bold text-[#1b7c53] hover:underline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Буцах
            </Link>
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
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#fcfdf9]">Уншиж байна...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
