"use client";
import { useOnboarding } from "../context/OnboardingContext";
import { usePathname } from "next/navigation";
import { UserProvider } from "../context/UserContext";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function LayoutContentClient({ children }: { children: React.ReactNode }) {
  const { showWelcomeGlobal } = useOnboarding();
  const pathname = usePathname();
  // Si estamos en /login y showWelcomeGlobal, solo renderiza children (el modal)
  if (pathname === "/login" && showWelcomeGlobal) {
    return <>{children}</>;
  }
  return (
    <UserProvider>
      <Navbar />
      {children}
      <Footer />
    </UserProvider>
  );
}