"use client"

import type React from "react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import '../../lib/i18n'
import { mongoliaData } from "@/lib/data"
import { gql, useMutation } from "@apollo/client"

const REGISTER_MUTATION = gql`
  mutation register($input: CreateUserInput!) {
    register(input: $input) {
      token
      user {
        id
        email
        name
        role
      }
    }
  }
`

export default function RegisterPage() {
  const { t } = useTranslation()
  const { saveUserData } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  
  const [userRegister] = useMutation(REGISTER_MUTATION)
  
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    
    if (formData.password !== formData.confirmPassword) {
      setError("Нууц үг таарахгүй байна!")
      return
    }
    if (emailError || phoneError) {
      setError("И-мэйл болон утасны дугаараа зөв оруулна уу.")
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
    
    setIsLoading(true)
    
    try {
      const input = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        role: "CUSTOMER" // Backend only supports CUSTOMER and ADMIN
      }
      
      console.log("Registration attempt:", input)
      
      const response = await userRegister({
        variables: { input }
      })
      
      console.log("Registration successful:", response.data)
      
      // Save user data and redirect
      const user = response.data.register.user;
      saveUserData(user);
      
      // Store herder flag in localStorage if user selected herder role
      if (formData.role === 'herder') {
        localStorage.setItem('isHerder', 'true');
      } else {
        localStorage.setItem('isHerder', 'false');
      }
      
      // Determine redirect based on role and selected type
      let redirectPath = "/";
      let successMessage = "Амжилттай бүртгүүллээ!";
      
      if (user.role === 'ADMIN') {
        redirectPath = "/admin-dashboard";
        successMessage = "Амжилттай бүртгүүллээ! Таныг админ хянах самбар руу шилжүүлж байна...";
      } else if (user.role === 'CUSTOMER') {
        if (formData.role === 'herder') {
          redirectPath = "/herder-dashboard";
          successMessage = "Амжилттай бүртгүүллээ! Таныг малчин хянах самбар руу шилжүүлж байна...";
        } else {
          redirectPath = "/user-dashboard";
          successMessage = "Амжилттай бүртгүүллээ! Таныг хэрэглэгчийн хянах самбар руу шилжүүлж байна...";
        }
      }
      
      setSuccess(successMessage);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push(redirectPath);
      }, 2000)
      
    } catch (err) {
      console.error("Registration error:", err)
      setError(err instanceof Error ? err.message : "Бүртгэл амжилтгүй боллоо")
    } finally {
      setIsLoading(false)
    }
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
            {error && (
              <Alert className="mb-4" variant="destructive">
                <AlertDescription className="font-medium">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="mb-4" variant="default">
                <AlertDescription className="font-medium text-green-600">
                  {success}
                </AlertDescription>
              </Alert>
            )}
            
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

x              <Button 
                type="submit" 
                className="w-full bg-emerald-600 hover:bg-emerald-700 font-semibold"
                disabled={isLoading}
              >
                {isLoading ? "Бүртгүүлж байна..." : "Бүртгүүлэх"}
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
