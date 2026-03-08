import React from "react";
import ThemeToggle from "../components/ThemeToggle";

export default function SettingsPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#3a1859]">
      <h1 className="text-3xl font-bold mb-6 text-[#3a1859] dark:text-white">Configuración</h1>
      <div className="w-full max-w-md p-6 rounded-lg shadow-lg bg-gray-100 dark:bg-[#2a1040]">
        <div className="mb-4">
          <span className="text-lg font-semibold text-[#3a1859] dark:text-white">Tema</span>
          <ThemeToggle />
        </div>
        {/* Otros ajustes aquí */}
      </div>
    </div>
  );
}
