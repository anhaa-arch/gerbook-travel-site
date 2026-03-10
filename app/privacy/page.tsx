import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Eye, Lock } from "lucide-react";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <Badge className="mb-4 bg-emerald-100 text-emerald-800 border-none px-4 py-1">Аюулгүй байдал</Badge>
                    <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
                        Нууцлалын <span className="text-emerald-600">Бодлого</span>
                    </h1>
                </div>

                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        <div className="p-8 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6">
                                <Shield size={28} />
                            </div>
                            <h3 className="font-bold text-lg mb-2">Мэдээллийн Хамгаалалт</h3>
                            <p className="text-gray-500 text-sm font-medium">Бид дэлхийн жишигт нийцсэн нууцлалын стандартыг мөрддөг.</p>
                        </div>
                        <div className="p-8 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                                <Eye size={28} />
                            </div>
                            <h3 className="font-bold text-lg mb-2">Ил тод байдал</h3>
                            <p className="text-gray-500 text-sm font-medium">Мэдээллийг зөвхөн захиалга баталгаажуулахад ашиглана.</p>
                        </div>
                        <div className="p-8 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-6">
                                <Lock size={28} />
                            </div>
                            <h3 className="font-bold text-lg mb-2">3-дагч тал</h3>
                            <p className="text-gray-500 text-sm font-medium">Таны мэдээллийг хэзээ ч гуравдагч талд дамжуулахгүй.</p>
                        </div>
                    </div>

                    <Card className="border-none shadow-xl bg-white overflow-hidden">
                        <CardHeader className="p-8 border-b border-gray-50">
                            <CardTitle className="text-2xl font-bold">Хувийн мэдээллийн хамгаалалт</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 leading-relaxed text-gray-700 font-medium space-y-4">
                            <p>
                                Малчин Camp нь хэрэглэгч бүрийн хувийн мэдээлэл болон төлбөрийн аюулгүй байдлыг хамгийн түрүүнд тавьдаг. Бидний систем таны мэдээллийг олон улсын стандартын дагуу шифрлэж хамгаалдаг.
                            </p>
                            <p>
                                Бид зөвхөн таны захиалгыг баталгаажуулах, малчин өрхтэй холбох, үйлчилгээний чанарыг сайжруулах зорилгоор шаардлагатай мэдээллийг цуглуулдаг.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
