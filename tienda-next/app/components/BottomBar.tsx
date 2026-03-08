"use client";
import React from "react";


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
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-[#2a1040] border-t border-slate-200 dark:border-slate-700 flex overflow-x-auto z-50">
      <ul className="flex w-full justify-between items-center">
        {items.map((item) => (
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
