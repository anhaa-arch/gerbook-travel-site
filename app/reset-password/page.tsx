import React, { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/use-auth'

function ResetPasswordForm() {
  const params = useSearchParams()
  // ... rest of logic
  const initialEmail = params.get('email') || ''

  const [email, setEmail] = useState(initialEmail)
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)

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
    <div className="max-w-md w-full space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-gray-900">Нууц үг шинэчлэх</h2>
        <p className="mt-2 text-sm text-gray-600">Таны имэйлээр ирсэн 6 оронтой кодыг ашиглан нууц үгээ шинэчлэнэ үү</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-gray-700">Имэйл</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Имэйл хаягаа оруулна уу" required className="mt-1 bg-white" />
          </div>

          <div>
            <Label htmlFor="code" className="text-gray-700">Баталгаажуулах код</Label>
            <Input id="code" type="text" maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} placeholder="000000" required className="mt-1 bg-white text-center tracking-widest font-mono" />
          </div>

          <div>
            <Label htmlFor="newPassword" className="text-gray-700">Шинэ нууц үг</Label>
            <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Шинэ нууц үгээ оруулна уу" required className="mt-1 bg-white" />
          </div>
        </div>

        <Button type="submit" className="w-full bg-green-700 hover:bg-green-800 text-white py-2" disabled={loading}>
          {loading ? 'Түр хүлээнэ үү...' : 'Нууц үг шинэчлэх'}
        </Button>
      </form>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div>Уншиж байна...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  )
}
