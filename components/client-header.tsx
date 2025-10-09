"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/header";

export function ClientHeader() {
  const pathname = usePathname();
  if (pathname === "/login" || pathname === "/register") return null;
  return <Header />;
}
