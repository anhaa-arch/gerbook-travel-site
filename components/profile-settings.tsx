"use client";

import { useState } from "react";
import { useMutation, gql } from "@apollo/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { User, Mail, Lock, Save, Eye, EyeOff, UserCircle } from "lucide-react";

const UPDATE_user = gql`
  mutation Updateuser($id: ID!, $input: UpdateuserInput!) {
    updateuser(id: $id, input: $input) {
      id
      name
      email
      phone
      role
      hostBio
      hostExperience
      hostLanguages
    }
  }
`;

interface ProfileSettingsProps {
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
    hostBio?: string;
    hostExperience?: string;
    hostLanguages?: string;
  };
  onUpdate?: () => void;
}

export function ProfileSettings({ user, onUpdate }: ProfileSettingsProps) {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    hostBio: user.hostBio || "",
    hostExperience: user.hostExperience || "",
    hostLanguages: user.hostLanguages || "",
  });

  const [updateuser, { loading }] = useMutation(UPDATE_user, {
    onCompleted: (data) => {
      toast({
        title: "✅ Амжилттай",
        description: "Таны мэдээлэл шинэчлэгдлээ.",
      });

      // Update localStorage with new user data
      if (data?.updateuser) {
        const storeduser = localStorage.getItem("user");
        if (storeduser) {
          const parseduser = JSON.parse(storeduser);
          const updateduser = {
            ...parseduser,
            name: data.updateuser.name,
            email: data.updateuser.email,
            phone: data.updateuser.phone,
            hostBio: data.updateuser.hostBio,
            hostExperience: data.updateuser.hostExperience,
            hostLanguages: data.updateuser.hostLanguages,
          };
          localStorage.setItem("user", JSON.stringify(updateduser));
        }
      }

      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));

      if (onUpdate) onUpdate();
    },
    onError: (error) => {
      let errorMessage = "Мэдээлэл шинэчлэхэд алдаа гарлаа.";

      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        errorMessage = error.graphQLErrors[0].message;
      } else if (error.networkError && (error.networkError as any).result?.errors) {
        errorMessage = (error.networkError as any).result.errors[0].message;
      } else if (error.message && !error.message.includes("status code 400")) {
        errorMessage = error.message;
      }

      toast({
        title: "❌ Алдаа гарлаа",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate phone (Required and 8 digits)
    if (!formData.phone) {
      toast({
        title: "❌ Алдаа",
        description: "Утасны дугаар шаардлагатай.",
        variant: "destructive",
      });
      return;
    }

    if (!/^\d{8}$/.test(formData.phone)) {
      toast({
        title: "❌ Алдаа",
        description: "Утасны дугаар буруу байна (8 оронтой тоо байх ёстой).",
        variant: "destructive",
      });
      return;
    }

    // Validate password if changing
    if (formData.newPassword) {
      if (formData.newPassword.length < 6) {
        toast({
          title: "❌ Алдаа",
          description: "Нууц үг хамгийн багадаа 6 тэмдэгттэй байх ёстой.",
          variant: "destructive",
        });
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        toast({
          title: "❌ Алдаа",
          description: "Нууц үг таарахгүй байна.",
          variant: "destructive",
        });
        return;
      }
    }

    // Prepare update data
    const updateData: any = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
    };

    // Only include password if user wants to change it
    if (formData.newPassword) {
      updateData.password = formData.newPassword;
    }

    // Include host bio fields if user is a herder
    const userRole = (user.role || "").toString().toLowerCase();
    if (userRole === "herder") {
      updateData.hostBio = formData.hostBio;
      updateData.hostExperience = formData.hostExperience;
      updateData.hostLanguages = formData.hostLanguages;
    }

    updateuser({
      variables: {
        id: user.id,
        input: updateData,
      },
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
          <User className="w-5 h-5 md:w-6 md:h-6" />
          <span>Хувийн мэдээлэл</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm md:text-base">
              Нэр
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="pl-10"
                placeholder="Таны нэр"
                required
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm md:text-base">
              Имэйл
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="pl-10"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm md:text-base">
              Утасны дугаар
            </Label>
            <Input
              id="phone"
              name="phone"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={8}
              value={formData.phone}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 8);
                setFormData({ ...formData, phone: value });
              }}
              placeholder="8 оронтой дугаар оруулна уу"
              required
            />
          </div>

          {/* Host Bio Section (only for HERDER role) */}
          {((user.role || "").toString().toLowerCase() === "herder") && (
            <div className="border-t pt-4 md:pt-6 space-y-4">
              <h3 className="text-base md:text-lg font-semibold flex items-center gap-2">
                <UserCircle className="w-5 h-5" />
                Эзэнтэй танилцах
              </h3>
              <p className="text-xs md:text-sm text-gray-500">
                Таны бааз буудлын хуудсанд хэрэглэгчдэд харагдах мэдээлэл
              </p>

              {/* Host Experience */}
              <div className="space-y-2">
                <Label htmlFor="hostExperience" className="text-sm md:text-base">
                  Туршлага
                </Label>
                <Select
                  value={formData.hostExperience}
                  onValueChange={(value) =>
                    setFormData({ ...formData, hostExperience: value })
                  }
                >
                  <SelectTrigger id="hostExperience">
                    <SelectValue placeholder="Туршлага сонгох" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-2 жил туршлагатай">1-2 жил туршлагатай</SelectItem>
                    <SelectItem value="3-5 жил туршлагатай">3-5 жил туршлагатай</SelectItem>
                    <SelectItem value="5-10 жил туршлагатай">5-10 жил туршлагатай</SelectItem>
                    <SelectItem value="10+ жил туршлагатай">10+ жил туршлагатай</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Host Languages */}
              <div className="space-y-2">
                <Label className="text-sm md:text-base">
                  Хэл
                </Label>
                <div className="space-y-2">
                  {[
                    { value: "Монгол", label: "Монгол" },
                    { value: "Англи", label: "Англи" },
                    { value: "Орос", label: "Орос" },
                    { value: "Хятад", label: "Хятад" },
                    { value: "Япон", label: "Япон" },
                    { value: "Солонгос", label: "Солонгос" },
                  ].map((lang) => {
                    const selectedLanguages = formData.hostLanguages
                      ? formData.hostLanguages.split(",").map(l => l.trim())
                      : [];
                    const isChecked = selectedLanguages.includes(lang.value);

                    return (
                      <div key={lang.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`lang-${lang.value}`}
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            let updatedLanguages = [...selectedLanguages];
                            if (checked) {
                              if (!updatedLanguages.includes(lang.value)) {
                                updatedLanguages.push(lang.value);
                              }
                            } else {
                              updatedLanguages = updatedLanguages.filter(
                                (l) => l !== lang.value
                              );
                            }
                            setFormData({
                              ...formData,
                              hostLanguages: updatedLanguages.join(", "),
                            });
                          }}
                        />
                        <Label
                          htmlFor={`lang-${lang.value}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {lang.label}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Host Bio */}
              <div className="space-y-2">
                <Label htmlFor="hostBio" className="text-sm md:text-base">
                  Танилцуулга
                </Label>
                <Textarea
                  id="hostBio"
                  value={formData.hostBio}
                  onChange={(e) =>
                    setFormData({ ...formData, hostBio: e.target.value })
                  }
                  placeholder="Өөрийгөө болон таны үзүүлж буй үйлчилгээний талаар товч танилцуулна уу..."
                  rows={4}
                  className="resize-none"
                />
              </div>
            </div>
          )}

          {/* Password Change Section */}
          <div className="border-t pt-4 md:pt-6 space-y-4">
            <h3 className="text-base md:text-lg font-semibold">
              Нууц үг солих
            </h3>
            <p className="text-xs md:text-sm text-gray-500">
              Нууц үг солихгүй бол хоосон орхино уу
            </p>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-sm md:text-base">
                Шинэ нууц үг
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, newPassword: e.target.value })
                  }
                  className="pl-10 pr-10"
                  placeholder="••••••••"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm md:text-base">
                Нууц үг баталгаажуулах
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="pl-10 pr-10"
                  placeholder="••••••••"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            disabled={loading}
          >
            {loading ? (
              <span>Хадгалж байна...</span>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                <span>Хадгалах</span>
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

