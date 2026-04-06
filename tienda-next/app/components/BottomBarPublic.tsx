"use client";
import React from "react";
import { useUser } from "../context/UserContext";

const publicItems = [
  { name: "Inicio", path: "/", icon: "home" },
  { name: "Productos", path: "/products-by-category", icon: "store" },
  { name: "Carrito", path: "/cart", icon: "shopping_bag" },
  { name: "Buscar", path: "/search-results", icon: "search" },
];

export default function BottomBarPublic() {
  const { carrito } = useUser();
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-black border-t border-slate-200 dark:border-slate-700 flex overflow-x-auto z-50">
      <ul className="flex w-full justify-between items-center">
        {publicItems.map((item) => (
          <li key={item.path} className="flex-1">
            <a href={item.path} className="flex flex-col items-center py-3 px-2 text-[#3a1859] dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 relative">
              <span className="material-icons-round text-xl">{item.icon}</span>
              {/* Badge solo para carrito */}
              {item.icon === "shopping_bag" || item.icon === "shopping_cart" ? (
                carrito && carrito.length > 0 && (
                  <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white dark:border-black z-10">
                    {carrito.length}
                  </span>
                )
              ) : null}
              <span className="text-xs font-medium">{item.name}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
