"use client"

import type React from "react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import "../../lib/i18n"
import { mongoliaData } from "@/lib/data"

export default function RegisterPage() {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "user",
    province: "",
    district: "",
  })
  const [selectedProvince, setSelectedProvince] = useState("")
  const [selectedDistrict, setSelectedDistrict] = useState("")
  const [emailError, setEmailError] = useState("")
  const [phoneError, setPhoneError] = useState("")

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (field === "province") {
      setSelectedProvince(value)
      setSelectedDistrict("")
      setFormData((prev) => ({ ...prev, district: "" }))
    }
    if (field === "district") {
      setSelectedDistrict(value)
    }
    if (field === "email") {
      if (!/^\S+@\S+\.\S+$/.test(value)) {
        setEmailError("Зөв и-мэйл хаяг оруулна уу.")
      } else {
        setEmailError("")
      }
    }
    if (field === "phone") {
      if (!/^\d{8}$/.test(value)) {
        setPhoneError("8 оронтой утасны дугаар оруулна уу.")
      } else {
        setPhoneError("")
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      alert("Нууц үг таарахгүй байна!")
      return
    }
    if (emailError || phoneError) {
      alert("И-мэйл болон утасны дугаараа зөв оруулна уу.")
      return
    }
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      setEmailError("Зөв и-мэйл хаяг оруулна уу.")
      return
    }
    if (!/^\d{8}$/.test(formData.phone)) {
      setPhoneError("8 оронтой утасны дугаар оруулна уу.")
      return
    }
    console.log("Registration attempt:", formData)
    // Handle registration logic here
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl font-bold text-center font-display">
              Бүртгүүлэх
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                    Нэр
                  </label>
                  <Input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    required
                    className="w-full font-medium"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                    Овог
                  </label>
                  <Input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    required
                    className="w-full font-medium"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  И-мэйл
                </label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                  className="w-full font-medium"
                />
                {emailError && <div className="text-red-600 text-xs mt-1 font-medium">{emailError}</div>}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                  Утасны дугаар
                </label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  required
                  className="w-full font-medium"
                  maxLength={8}
                  pattern="\d{8}"
                />
                {phoneError && <div className="text-red-600 text-xs mt-1 font-medium">{phoneError}</div>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                    Нууц үг
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                    className="w-full font-medium"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                    Нууц үгээ давтах
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    required
                    className="w-full font-medium"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-2">
                  Хэрэглэгчийн төрөл
                </label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
                  <SelectTrigger className="font-medium">
                    <SelectValue placeholder="Төрөл сонгох" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Жуулчин/Зочин</SelectItem>
                    <SelectItem value="herder">Малчин/Бизнес эрхлэгч</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 font-semibold">
                Бүртгүүлэх
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 font-medium">
                Бүртгэлтэй юу?{' '}
                <Link href="/login" className="text-emerald-600 hover:text-emerald-500 font-semibold">
                  Нэвтрэх
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
