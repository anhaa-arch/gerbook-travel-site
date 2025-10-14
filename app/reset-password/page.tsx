"use client";

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/use-auth'

export default function ResetPasswordPage() {
  const params = useSearchParams()
  const token = params.get('token') || ''
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { resetPassword } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    if (!token) return toast({ title: 'Алдаа', description: 'Token олдсонгүй', variant: 'destructive' as any })
    if (newPassword.length < 8) return toast({ title: 'Алдаа', description: 'Шинэ нууц үг дор хаяж 8 тэмдэгттэй байх ёстой', variant: 'destructive' as any })

    setLoading(true)
    try {
      await resetPassword(token, newPassword)
      toast({ title: 'Амжилттай', description: 'Нууц үг амжилттай шинэчлэгдлээ' })
      router.push('/login')
    } catch (err: any) {
      toast({ title: 'Алдаа', description: err?.message || 'Нууц үг сэргээхэд алдаа гарлаа', variant: 'destructive' as any })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Нууц үг шинэчлэх</h2>
          <p className="mt-2 text-sm text-gray-600">Таны имэйлээр ирсэн холбоосын дагуу шинэ нууц үгээ оруулна уу</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="newPassword" className="text-gray-700">Шинэ нууц үг</Label>
            <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Шинэ нууц үгээ оруулна уу" required className="mt-1 bg-white" />
          </div>

          <Button type="submit" className="w-full bg-green-700 hover:bg-green-800 text-white py-2" disabled={loading}>
            {loading ? 'Түр хүлээнэ үү...' : 'Нууц үг шинэчлэх'}
          </Button>
        </form>
      </div>
    </div>
  )
}
