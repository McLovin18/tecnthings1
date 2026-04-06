"use client";
import React from "react";
import { useUser } from "../context/UserContext";


const clientItems = [
  { name: "Inicio", path: "/home", icon: "home" },
  { name: "Productos", path: "/home/productos", icon: "store" },
  { name: "Favoritos", path: "/home/favoritos", icon: "favorite" },
  { name: "Ordenes", path: "/home/ordenes", icon: "assignment" },
  { name: "Configuración", path: "/home/config", icon: "settings" },
];
const adminItems = [
  { name: "Dashboard", path: "/admin", icon: "dashboard" },
  { name: "Inventario", path: "/admin/inventario", icon: "inventory" },
  { name: "Pedidos", path: "/admin/pedidos", icon: "assignment" },
  { name: "Clientes", path: "/admin/clientes", icon: "people" },
  { name: "Landing", path: "/admin/edit-landing", icon: "edit" },
  { name: "Blogs", path: "/admin/edit-blogs", icon: "library_books" },
  { name: "Perfil", path: "/admin/perfil", icon: "person" },
  { name: "Config", path: "/admin/config", icon: "settings" },
];


export default function BottomBar({ role = "client" }) {
  // Si hay más de 4 opciones, scroll horizontal
  const items = role === "admin" ? adminItems : clientItems;
  const { carrito } = useUser();
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-black border-t border-slate-200 dark:border-slate-700 flex overflow-x-auto z-50">
      <ul className="flex w-full justify-between items-center">
        {items.map((item) => (
          <li key={item.path} className="flex-1">
            <a href={item.path} className="flex flex-col items-center py-3 px-2 text-[#3a1859] dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 relative">
              <span className="material-icons-round text-xl">{item.icon}</span>
              {/* Badge solo para carrito */}
              {item.icon === "assignment" || item.icon === "shopping_bag" || item.icon === "shopping_cart" ? (
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
