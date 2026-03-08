
import Sidebar from "../components/Sidebar";
import BottomBar from "../components/BottomBar";
import CategoriesBar from "../components/CategoriesBar";

import { ReactNode } from "react";

interface HomeLayoutProps {
  children: ReactNode;
}

export default function HomeLayout({ children }: HomeLayoutProps) {
  // Este layout debe ser solo un fragmento o un <div>, nunca <html> ni <body>
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1">
        <CategoriesBar />
        {children}
      </main>
      <BottomBar />
    </div>
  );
}
