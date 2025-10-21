import { Phone, Mail, Facebook, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-white text-gray-600 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pt-6 sm:pt-8 md:pt-12 pb-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Column 1 */}
          <div>
            <h3 className="font-semibold text-xs sm:text-sm md:text-base mb-2 sm:mb-3">
              Malchin Camp-ийн тухай
            </h3>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <li>
                <a 
                  href="#" 
                  className="hover:text-green-600 transition-colors inline-block"
                >
                  Малчин Camp хэрхэн ажилладаг вэ?
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="hover:text-green-600 transition-colors inline-block"
                >
                  Түгээмэл асуулт
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <h3 className="font-semibold text-xs sm:text-sm md:text-base mb-2 sm:mb-3">
              Үйлчилгээний нөхцөл
            </h3>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <li>
                <a 
                  href="#" 
                  className="hover:text-green-600 transition-colors inline-block"
                >
                  Захиалга цуцлах бодлого
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="hover:text-green-600 transition-colors inline-block"
                >
                  Нууцлалын бодлого
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3 */}
          <div className="sm:col-span-2 md:col-span-1">
            <h3 className="font-semibold text-xs sm:text-sm md:text-base mb-2 sm:mb-3">
              Монгол гэр
            </h3>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <li>
                <a 
                  href="#" 
                  className="hover:text-green-600 transition-colors inline-block"
                >
                  Аялах бус нутгууд
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="hover:text-green-600 transition-colors inline-block"
                >
                  Туслах мэдээлэл
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Contact Section */}
      <div className="bg-green-600 mt-6 sm:mt-8 py-4 sm:py-5 md:py-6 w-full rounded-t-2xl sm:rounded-t-3xl md:rounded-t-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-evenly gap-3 sm:gap-4 md:gap-6">
            {/* Phone */}
            <div className="flex items-center justify-center space-x-1.5 sm:space-x-2">
              <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-white flex-shrink-0" />
              <a 
                href="tel:72008822" 
                className="text-sm sm:text-base md:text-lg text-white font-medium hover:underline"
              >
                72008822
              </a>
            </div>

            {/* Email */}
            <div className="flex items-center justify-center space-x-1.5 sm:space-x-2">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-white flex-shrink-0" />
              <a 
                href="mailto:support@malchincamp.com" 
                className="text-xs sm:text-sm md:text-base lg:text-lg text-white font-medium hover:underline truncate max-w-[200px] sm:max-w-none"
              >
                support@malchincamp.com
              </a>
            </div>

            {/* Social Media */}
            <div className="flex items-center justify-center space-x-3 sm:space-x-4">
              <a 
                href="#" 
                aria-label="Facebook" 
                className="hover:scale-110 transition-transform"
              >
                <Facebook className="w-5 h-5 sm:w-6 sm:h-6 text-white cursor-pointer" />
              </a>
              <a 
                href="#" 
                aria-label="Google" 
                className="hover:scale-110 transition-transform"
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full text-white cursor-pointer flex items-center justify-center">
                  <span className="text-green-700 text-xs sm:text-sm font-bold">G</span>
                </div>
              </a>
              <a 
                href="#" 
                aria-label="Instagram" 
                className="hover:scale-110 transition-transform"
              >
                <Instagram className="w-5 h-5 sm:w-6 sm:h-6 text-white cursor-pointer" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="bg-green-700 py-2 sm:py-3">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <p className="text-center text-[10px] sm:text-xs text-white">
            © {new Date().getFullYear()} Malchin Camp. Бүх эрх хуулиар хамгаалагдсан.
          </p>
        </div>
      </div>
    </footer>
  );
}
