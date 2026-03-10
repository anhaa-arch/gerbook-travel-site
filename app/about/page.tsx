import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, Plane } from "lucide-react";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <Badge className="mb-4 bg-emerald-100 text-emerald-800 border-none px-4 py-1">Бидний тухай</Badge>
                    <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
                        Малчин <span className="text-emerald-600">Camp</span>
                    </h1>
                    <p className="text-xl text-gray-600 font-medium leading-relaxed">
                        Монгол орны нүүдэлчин ахуйг бодитоор мэдрүүлж, байгалийн сайханд малчин өрхийн зочломтгой занг амсуулах бидний алсын хараа.
                    </p>
                </div>

                <div className="space-y-12">
                    <Card className="border-none shadow-xl overflow-hidden bg-white/80 backdrop-blur-sm">
                        <CardHeader className="bg-emerald-600 text-white p-8">
                            <CardTitle className="text-2xl font-bold">Малчин Camp гэж юу вэ?</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            <p className="text-lg text-gray-700 leading-relaxed font-medium">
                                "Малчин Camp бол Монгол орны нүүдэлчин ахуйг бодитоор мэдэрч, байгалийн сайханд малчин өрхийн зочломтгой занг амсахыг хүссэн хэн бүхэнд зориулсан платформ юм. Бид аялагчдыг зөвхөн үзэгч бус, нүүдэлчин соёлын нэг хэсэг болох боломжийг олгож, малчин өрхүүдийн тогтвортой орлогыг дэмжих зорилготой."
                            </p>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300">
                            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 text-emerald-600">
                                <Search size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-gray-900">Хайх</h3>
                            <p className="text-gray-600 font-medium">Өөрийн очихыг хүссэн аймаг, сумаа сонгож, малчин өрхүүдийн мэдээлэлтэй танилцана.</p>
                        </div>

                        <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300">
                            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                                <Calendar size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-gray-900">Захиалах</h3>
                            <p className="text-gray-600 font-medium">Та өөрт таалагдсан гэр буудал, хоол болон нэмэлт үйлчилгээгээ сагсандаа нэмж, онлайнаар баталгаажуулна.</p>
                        </div>

                        <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300">
                            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-6 text-amber-600">
                                <Plane size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-gray-900">Аялах</h3>
                            <p className="text-gray-600 font-medium">Захиалсан хугацаандаа малчин айлдаа очиж, жинхэнэ нүүдэлчин амьдралын хэв маягийг мэдэрнэ.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
