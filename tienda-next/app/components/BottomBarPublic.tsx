"use client";
import React from "react";

const publicItems = [
  { name: "Inicio", path: "/", icon: "home" },
  { name: "Productos", path: "/products-by-category", icon: "store" },
  { name: "Carrito", path: "/cart", icon: "shopping_bag" },
  { name: "Buscar", path: "/search-results", icon: "search" },
];

export default function BottomBarPublic() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-black border-t border-slate-200 dark:border-slate-700 flex overflow-x-auto z-50">
      <ul className="flex w-full justify-between items-center">
        {publicItems.map((item) => (
          <li key={item.path} className="flex-1">
            <a href={item.path} className="flex flex-col items-center py-3 px-2 text-[#3a1859] dark:text-white hover:bg-slate-100 dark:hover:bg-white/10">
              <span className="material-icons-round text-xl">{item.icon}</span>
              <span className="text-xs font-medium">{item.name}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
