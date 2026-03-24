import { Phone, Mail, Facebook, Instagram } from "lucide-react";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="w-full relative flex flex-col font-sans border-t border-gray-100">
      
      {/* Top Banner Graphic (Uncropped) */}
      <div className="w-full relative z-0">
        <Image
          src="/footer-bg.png"
          alt="Mountain Pattern"
          width={1920}
          height={300}
          className="w-full h-auto object-contain pointer-events-none"
          priority
          unoptimized
        />
      </div>
      
      {/* Solid Dark Green Content Block */}
      {/* Ensures there's no gap between the image and the solid color block by applying a slight negative margin */}
      <div className="w-full bg-[#0F3D2E] relative z-10 -mt-[1px] pt-8 pb-12 text-white">
        
        {/* Content Container */}
        <div className="max-w-4xl mx-auto px-6 flex flex-col items-center justify-center space-y-6 sm:space-y-8">
          
          {/* Row 1: Phone and Email */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm sm:text-base md:text-lg font-medium tracking-wide">
            <a href="tel:85868721" className="flex items-center gap-2.5 hover:text-green-300 transition-colors">
              <Phone className="w-5 h-5 opacity-90" />
              <span>85868721</span>
            </a>
            
            <span className="hidden sm:block opacity-40 select-none">|</span>
            
            <a href="mailto:support@malchincamp.mn" className="flex items-center gap-2.5 hover:text-green-300 transition-colors">
              <Mail className="w-5 h-5 opacity-90" />
              <span>support@malchincamp.mn</span>
            </a>
          </div>

          {/* Row 2: Social Media Icons */}
          <div className="flex items-center justify-center gap-6 sm:gap-8">
            <a
              href="https://www.facebook.com/share/14XZc4zyjaG/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="p-2 hover:bg-white/10 rounded-full transition-all duration-300 transform hover:scale-110"
            >
              <Facebook className="w-6 h-6 sm:w-7 sm:h-7 opacity-90" />
            </a>
            <a
              href="https://www.instagram.com/malchincamp"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="p-2 hover:bg-white/10 rounded-full transition-all duration-300 transform hover:scale-110"
            >
              <Instagram className="w-6 h-6 sm:w-7 sm:h-7 opacity-90" />
            </a>
            <a
              href="#"
              aria-label="Website"
              className="p-2 hover:bg-white/10 rounded-full transition-all duration-300 transform hover:scale-110 flex items-center justify-center"
            >
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white/90 rounded-md flex items-center justify-center shadow-sm">
                <span className="text-[#0F3D2E] text-xs sm:text-sm font-bold tracking-tighter">M</span>
              </div>
            </a>
          </div>

          {/* Divider Line */}
          <div className="w-full max-w-[200px] sm:max-w-xs border-t border-white/20 rounded-full my-2"></div>

          {/* Copyright and URL */}
          <div className="flex flex-col items-center justify-center space-y-1.5 text-center">
            <p className="text-xs sm:text-sm text-white/80 font-light tracking-wide">
              © {new Date().getFullYear()} Malchin Camp. Бүх эрх хуулиар хамгаалагдсан.
            </p>
            <a 
              href="https://malchincamp.mn" 
              className="text-sm sm:text-base font-medium opacity-90 hover:opacity-100 hover:text-green-300 transition-colors"
            >
              malchincamp.mn
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
}

