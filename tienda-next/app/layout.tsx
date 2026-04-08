import "./globals.css";

import Footer from "./components/Footer";
import CategoriesBar from "./components/CategoriesBar";
import CategoriesBarMobile from "./components/CategoriesBarMobile";
import { cookies } from "next/headers";
import Navbar from "./components/Navbar";
import { UserProvider } from "./context/UserContext";
import { OnboardingProvider } from "./context/OnboardingContext";
import LayoutContentClient from "./components/LayoutContentClient";

export const metadata = {
  title: "TechnoThings",
  description: "Tienda online"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet" />
      </head>
      <body className="relative">
        <OnboardingProvider>
          <LayoutContentClient>{children}</LayoutContentClient>
        </OnboardingProvider>
      </body>
    </html>
  );
}
