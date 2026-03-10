import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <Badge className="mb-4 bg-blue-100 text-blue-800 border-none px-4 py-1">Журам</Badge>
                    <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
                        Үйлчилгээний <span className="text-emerald-600">Нөхцөл</span>
                    </h1>
                    <p className="text-lg text-gray-600 font-medium leading-relaxed max-w-2xl mx-auto">
                        Малчин Camp платформыг ашиглан захиалга хийхэд баримтлах журам болон цуцлалтын нөхцөлүүд.
                    </p>
                </div>

                <div className="space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold mb-6 text-gray-900">Цуцлалтын дүрэм</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="border-l-4 border-l-green-500 shadow-sm">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center space-x-2 text-green-600 mb-1">
                                        <CheckCircle2 size={20} />
                                        <span className="font-bold text-sm uppercase tracking-wider">100% Буцаалттай</span>
                                    </div>
                                    <CardTitle className="text-lg">7+ хоног</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-600 text-sm font-medium">Захиалсан хугацаанаас 7 хоногийн өмнө цуцалсан тохиолдолд төлбөрийг 100% буцаан олгоно.</p>
                                </CardContent>
                            </Card>

                            <Card className="border-l-4 border-l-red-500 shadow-sm">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center space-x-2 text-red-600 mb-1">
                                        <XCircle size={20} />
                                        <span className="font-bold text-sm uppercase tracking-wider">Буцаалт хийгдэхгүй</span>
                                    </div>
                                    <CardTitle className="text-lg">0-7 хоног</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-600 text-sm font-medium">Захиалсан өдрөөс хойш 7 хоногийн дотор цуцлах хүсэлт гаргасан тохиолдолд төлбөрийн буцаалт хийгдэхгүй.</p>
                                </CardContent>
                            </Card>
                        </div>
                        <p className="text-sm text-gray-500 mt-6 italic">
                            (Захиалга баталгаажсан хугацаанаас хамаарна)
                        </p>
                    </section>

                    <Separator className="bg-gray-200" />

                    <section>
                        <Card className="border-none shadow-xl bg-emerald-900 text-white overflow-hidden">
                            <CardHeader className="p-8">
                                <CardTitle className="text-2xl font-bold">Нууцлалын бодлого</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 pt-0">
                                <p className="text-lg leading-relaxed text-emerald-50/90 font-medium">
                                    "Малчин Camp нь таны хувийн мэдээлэл болон төлбөрийн мэдээллийг чандлан нууцалж, зөвхөн захиалгыг баталгаажуулах зорилгоор ашиглана. Таны мэдээллийг гуравдагч талд дамжуулахгүй."
                                </p>
                            </CardContent>
                        </Card>
                    </section>
                </div>
            </div>
        </div>
    );
}

function Separator({ className }: { className?: string }) {
    return <div className={`h-px w-full my-8 ${className}`} />;
}
