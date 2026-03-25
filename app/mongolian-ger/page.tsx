import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Info, Heart, Mountain } from "lucide-react";

export default function MongolianGerPage() {
    return (
        <div className="min-h-screen pt-20 pb-12">
            <div className="max-w-4xl 2xl:max-w-6xl 3xl:max-w-7xl 4k:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <Badge className="mb-4 bg-amber-100 text-amber-800 border-none px-4 py-1">Монгол ахуй</Badge>
                    <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
                        Монгол <span className="text-emerald-600">Гэр</span>
                    </h1>
                    <p className="text-lg text-gray-600 font-medium leading-relaxed max-w-2xl mx-auto">
                        Нүүдэлчин соёл, байгалийн сайхныг мэдрэх аялагчийн санамж болон бүс нутгийн мэдээлэл.
                    </p>
                </div>

                <div className="space-y-12">
                    <section>
                        <div className="flex items-center space-x-2 mb-6">
                            <MapPin className="text-emerald-600" />
                            <h2 className="text-2xl font-bold text-gray-900">Аялах бүс нутгууд</h2>
                        </div>
                        <Card className="border-none shadow-lg bg-white overflow-hidden">
                            <div className="bg-emerald-600 p-8 text-white relative overflow-hidden">
                                <Mountain className="absolute -right-10 -bottom-10 w-48 h-48 opacity-10" />
                                <p className="text-xl font-bold relative z-10 leading-relaxed">
                                    "Одоогоор бид Архангай аймгийн Цэнхэр сум болон Өвөрхангай аймгийн Хужирт сумын хамгийн шилдэг 100 гаруй малчин өрхтэй хамтран ажиллаж байна. Тун удахгүй бусад аймгуудын малчин өрхүүд нэмэгдэх болно."
                                </p>
                            </div>
                        </Card>
                    </section>

                    <section>
                        <div className="flex items-center space-x-2 mb-6">
                            <Info className="text-emerald-600" />
                            <h2 className="text-2xl font-bold text-gray-900">Туслах мэдээлэл (Аялагчийн санамж)</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="shadow-sm border-gray-100">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center">
                                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-3 text-emerald-600">
                                            <Badge variant="outline" className="p-0 border-none bg-transparent">1</Badge>
                                        </div>
                                        Бэлтгэл
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-600 font-medium">Хөдөө орон нутагт дулаан хувцас, хувийн ариун цэврийн хэрэглэлээ авч явахыг зөвлөж байна.</p>
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm border-gray-100">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center">
                                        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center mr-3 text-amber-600">
                                            <Badge variant="outline" className="p-0">2</Badge>
                                        </div>
                                        Ёс заншил
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-600 font-medium">Малчин айлд зочлохдоо Монгол ёс заншлыг хүндэтгэх (босгон дээр гишгэхгүй байх гэх мэт).</p>
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm border-gray-100 md:col-span-2">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center text-emerald-700">
                                        <Heart size={20} className="mr-3 fill-emerald-600" />
                                        Байгаль орчин
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-600 font-medium italic text-lg text-center">
                                        "Хог хаягдлаа зориулалтын газар хаяж, байгаль эхээ хайрлая."
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
