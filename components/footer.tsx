import { Phone, Mail, Facebook, Instagram } from "lucide-react";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="w-full relative flex flex-col font-sans">
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9] lg:aspect-[2.5/1] xl:aspect-[3/1] 2xl:aspect-[4/1] 2xl:max-h-[600px] min-h-[350px] sm:min-h-[400px] flex flex-col justify-end pb-8 sm:pb-12 text-[#0F3D2E]">
        
        {/* Actual Image Background */}
        <Image
          src="/footer-bg.png"
          alt="Mountain Pattern Footer"
          fill
          className="object-cover object-bottom pointer-events-none z-0"
          quality={100}
          priority
        />
        
        {/* Subtle bottom light gradient overlay to ensure dark text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-white/10 to-transparent z-0 pointer-events-none"></div>

        {/* Content Container */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 flex flex-col items-center justify-center space-y-6 sm:space-y-8 mt-auto pt-32">
          
          {/* Row 1: Phone and Email */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm sm:text-base md:text-lg font-bold tracking-wide">
            <a href="tel:85868721" className="flex items-center gap-2.5 hover:text-emerald-700 transition-colors">
              <Phone className="w-5 h-5 opacity-90" />
              <span>85868721</span>
            </a>
            
            {/* Dot separator visible only on breakpoints larger than sm */}
            <span className="hidden sm:block opacity-40 select-none">|</span>
            
            <a href="mailto:support@malchincamp.com" className="flex items-center gap-2.5 hover:text-emerald-700 transition-colors">
              <Mail className="w-5 h-5 opacity-90" />
              <span>support@malchincamp.com</span>
            </a>
          </div>

          {/* Row 2: Social Media Icons */}
          <div className="flex items-center justify-center gap-6 sm:gap-8">
            <a
              href="https://www.facebook.com/share/14XZc4zyjaG/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="p-2 hover:bg-[#0F3D2E]/10 rounded-full transition-all duration-300 transform hover:scale-110"
            >
              <Facebook className="w-6 h-6 sm:w-7 sm:h-7 opacity-90" />
            </a>
            <a
              href="https://www.instagram.com/malchincamp?igsh=MWo3MDlxOTdwdzBndA%3D%3D&utm_source=qr"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="p-2 hover:bg-[#0F3D2E]/10 rounded-full transition-all duration-300 transform hover:scale-110"
            >
              <Instagram className="w-6 h-6 sm:w-7 sm:h-7 opacity-90" />
            </a>
            <a
              href="#"
              aria-label="Website"
              className="p-2 hover:bg-[#0F3D2E]/10 rounded-full transition-all duration-300 transform hover:scale-110 flex items-center justify-center"
            >
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[#0F3D2E] rounded-md flex items-center justify-center shadow-sm">
                <span className="text-white text-xs sm:text-sm font-bold tracking-tighter">M</span>
              </div>
            </a>
          </div>

          {/* Divider Line */}
          <div className="w-full max-w-[200px] sm:max-w-xs border-t border-[#0F3D2E]/20 rounded-full my-2"></div>

          {/* Copyright and URL */}
          <div className="flex flex-col items-center justify-center space-y-1.5 text-center">
            <p className="text-xs sm:text-sm text-[#0F3D2E]/80 font-medium tracking-wide">
              © {new Date().getFullYear()} Malchin Camp. Бүх эрх хуулиар хамгаалагдсан.
            </p>
            <a 
              href="https://malchincamp.mn" 
              className="text-sm sm:text-base font-bold opacity-90 hover:opacity-100 hover:text-emerald-700 transition-colors"
            >
              malchincamp.mn
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
}

