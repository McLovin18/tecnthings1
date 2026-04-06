import Sidebar from "../components/Sidebar";
import CategoriesBar from "../components/CategoriesBar";
import BottomBarPublic from "../components/BottomBarPublic";
import WhatsAppFloatingButton from "../components/WhatsAppFloatingButton";
import { useUser } from "../context/UserContext";

import { ReactNode } from "react";

interface HomeLayoutProps {
  children: ReactNode;
}

export default function HomeLayout({ children }: HomeLayoutProps) {
  const { isLogged } = useUser();
  // Este layout debe ser solo un fragmento o un <div>, nunca <html> ni <body>
  return (
    <>
      <WhatsAppFloatingButton />
      <div className="flex">
        <Sidebar />
        <main className="flex-1">
          <CategoriesBar />
          {children}
        </main>
        {/* Solo mostrar BottomBarPublic si NO está autenticado */}
        {!isLogged && <BottomBarPublic />}
      </div>
    </>
  );
}
