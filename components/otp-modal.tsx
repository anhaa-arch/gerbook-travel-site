"use client"

import React, { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface OtpModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  phone: string
  onVerify: (otp: string) => Promise<void>
  onResend: () => Promise<void>
  cooldownSeconds?: number
}

export default function OtpModal({
  open,
  onOpenChange,
  phone,
  onVerify,
  onResend,
  cooldownSeconds = 60,
}: OtpModalProps) {
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [resendAttempts, setResendAttempts] = useState(0)
  const maxResendAttempts = 3
  const { toast } = useToast()

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setOtp("")
      setSecondsLeft(cooldownSeconds)
      // Only reset attempts if it's a fresh open, but logic here means it resets every time
      // Ideally should be managed by parent or persistent state, but for now reset is okay-ish or we keep it.
      // Let's NOT reset attempts on re-open to prevent abuse if they just close/open.
      // But we DO need to reset them if it's a new "session". 
      // For simplicity, let's keep attempts state in this component instance.
    }
  }, [open, cooldownSeconds])

  useEffect(() => {
    if (secondsLeft <= 0) return
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearInterval(t)
  }, [secondsLeft])

  const handleResend = async () => {
    if (resendAttempts >= maxResendAttempts) {
      toast({
        title: 'Дахин илгээх хязгаар хүрлээ',
        description: 'Та хэт олон удаа дахин илгээх хүсэлт явуулсан байна. Түр хүлээнэ үү.',
        variant: "destructive"
      })
      return
    }

    try {
      setResendLoading(true)
      await onResend()
      setSecondsLeft(cooldownSeconds)
      setResendAttempts((s) => s + 1)
      toast({ title: "Амжилттай", description: `Баталгаажуулах код ${phone} руу дахин илгээгдлээ.` })
    } catch (err: any) {
      toast({
        title: "Алдаа",
        description: err?.message || "Код дахин илгээхэд алдаа гарлаа",
        variant: "destructive"
      })
    } finally {
      setResendLoading(false)
    }
  }

  const handleVerify = async () => {
    if (!otp) {
      toast({ title: "Алдаа", description: "Баталгаажуулах кодоо оруулна уу", variant: "destructive" })
      return
    }

    // enforce 6-digit numeric OTP
    const otpDigits = otp.replace(/\D/g, "")
    if (otpDigits.length !== 6) {
      toast({ title: "Алдаа", description: "Код 6 оронтой тоо байх ёстой", variant: "destructive" })
      return
    }

    try {
      setLoading(true)
      await onVerify(otpDigits)
      // Only close if verify didn't throw (success)
      onOpenChange(false)
    } catch (err: any) {
      // Error is handled by parent or caught here.
      // If parent throws, we catch it here to show toast and keep modal open
      toast({
        title: "Баталгаажуулалт амжилтгүй",
        description: err?.message || "Код буруу байна",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Баталгаажуулах</DialogTitle>
          <DialogDescription className="text-center">
            Бид <strong>{phone}</strong> хаяг руу 6 оронтой баталгаажуулах код илгээлээ.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col space-y-4 py-4">
          <Input
            value={otp}
            onChange={(e) => {
              // Allow only numbers
              const val = e.target.value.replace(/\D/g, '').slice(0, 6)
              setOtp(val)
            }}
            placeholder="000000"
            inputMode="numeric"
            maxLength={6}
            className="text-center text-2xl tracking-[0.5em] font-mono h-14"
            autoFocus
          />

          <div className="flex justify-between text-sm text-gray-500 px-1">
            <span>Код ирэхгүй байна уу?</span>
            {secondsLeft > 0 ? (
              <span>Дахин илгээх: {secondsLeft} сек</span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading || resendAttempts >= maxResendAttempts}
                className="text-green-600 hover:text-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Код дахин авах
              </button>
            )}
          </div>
        </div>

        <DialogFooter className="sm:justify-between flex-col space-y-2 sm:space-y-0">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Болих
          </Button>
          <Button
            type="button"
            onClick={handleVerify}
            disabled={loading || otp.length !== 6}
            className="w-full sm:w-auto bg-green-700 hover:bg-green-800"
          >
            {loading ? "Баталгаажуулж байна..." : "Баталгаажуулах"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
