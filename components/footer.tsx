import { Phone, Mail, Facebook, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-[100%] bg-white text-gray-600 border border-t-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1 */}
          <div>
            <h3 className="font-normal text-sm mb-3">Malchin Camp-ийн тухай</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-green-200">
                  Malchin Camp.com хэрхэн ажилладаг вэ?
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-200">
                  Түгээмэл асуулт
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <h3 className="font-normal text-sm mb-3">Үйлчилгээний нөхцөл</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-green-200">
                  Захиалга цуцлах бодлого
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-200">
                  Нууцлалын бодлого
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h3 className="font-normal text-sm mb-3">Монгол гэр</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-green-200">
                  Аялах бус нутгууд
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-200">
                  Туслалжийн мэдээлэл
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
      </div>
      <div className="bg-green-600 mt-8 flex flex-col py-4 w-full rounded-t-full">
        <div className=" flex flex-col md:flex-row justify-evenly">
          <div className="flex items-center space-x-6 mb-3 md:mb-0">
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-8 text-white" />
              <span className="text-lg text-white">72008822</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Mail className="w-4 h-8 text-white" />
            <span className="text-lg text-white">support@Malchin Camp.com</span>
          </div>
          <div className="flex items-center space-x-4">
            <Facebook className="w-5 h-5 text-white cursor-pointer" />
            <div className="w-5 h-5 bg-white rounded text-white cursor-pointer flex items-center justify-center">
              <span className="text-green-700 text-md font-bold">G</span>
            </div>
            <Instagram className="w-5 h-5 text-white cursor-pointer" />
          </div>
        </div>
      </div>
    </footer>
  );
}
