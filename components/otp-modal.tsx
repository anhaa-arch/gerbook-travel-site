"use client"

import React, { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
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

  useEffect(() => {
    if (open) {
      // start cooldown when modal opens
      setSecondsLeft(cooldownSeconds)
      // reset resend attempts when modal opens
      setResendAttempts(0)
    } else {
      setOtp("")
    }
  }, [open, cooldownSeconds])

  useEffect(() => {
    if (secondsLeft <= 0) return
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearInterval(t)
  }, [secondsLeft])

  const handleResend = async () => {
    if (resendAttempts >= maxResendAttempts) {
      return toast({ title: 'Дахин илгээх хязгаар хүрлээ', description: 'Та дахин илгээх боломжгүй.' })
    }
    try {
      setResendLoading(true)
      await onResend()
      setSecondsLeft(cooldownSeconds)
      setResendAttempts((s) => s + 1)
      toast({ title: "OTP илгээгдлээ", description: `Код ${phone} руу илгээв` })
    } catch (err: any) {
      toast({ title: "OTP илгээхэд алдаа", description: err?.message || String(err), variant: "destructive" as any })
    } finally {
      setResendLoading(false)
    }
  }

  const handleVerify = async () => {
    if (!otp) return toast({ title: "OTP шаардлагатай" })
    // enforce 6-digit numeric OTP
    const otpDigits = otp.replace(/\D/g, "")
    if (otpDigits.length !== 6) return toast({ title: "OTP 6 оронтой байх ёстой" })
    try {
      setLoading(true)
      await onVerify(otpDigits)
      onOpenChange(false)
    } catch (err: any) {
      toast({ title: "OTP шалгалт амжилтгүй", description: err?.message || String(err), variant: "destructive" as any })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>OTP код оруулах</DialogTitle>
          <DialogDescription>
            Бид {phone} руу 6 оронтой код илгээсэн. Кодыг доор бичиж баталгаажуулна уу.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-3">
          <div>
            <Input
              aria-label="otp-input"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="000000"
              inputMode="numeric"
              maxLength={6}
              className="text-lg text-center tracking-widest"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">Баталгаажуулах код: {phone}</div>
            <div className="text-sm text-gray-600">{secondsLeft > 0 ? `Дахин илгээх ${secondsLeft}s` : `Дахин: ${resendAttempts}/${maxResendAttempts}`}</div>
          </div>

          <DialogFooter>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => onOpenChange(false)}>
                  Болих
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleResend}
                  disabled={secondsLeft > 0 || resendLoading || resendAttempts >= maxResendAttempts}
                >
                  {secondsLeft > 0 ? `Дахин илгээх (${secondsLeft}s)` : "Дахин илгээх"}
                </Button>
                <Button onClick={handleVerify} disabled={loading}>
                  Баталгаажуул
                </Button>
              </div>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
