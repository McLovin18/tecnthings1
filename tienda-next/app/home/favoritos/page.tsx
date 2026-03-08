"use client";

import React from "react";
import { useUser } from "../../context/UserContext";
import ProductoCard from "../../components/ProductoCard";

export default function FavoritosPage() {
  const { favoritos, isLogged, isCliente } = useUser();

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#3a1859] text-slate-900 dark:text-white transition-colors px-4 py-8">
      <div className="max-w-6xl mx-auto w-full">
        <h1 className="text-3xl font-bold mb-6 text-[#3a1859] dark:text-white">Mis favoritos</h1>
        {!isLogged || !isCliente ? (
          <div className="text-center mt-12 text-slate-600 dark:text-slate-200">
            Debes iniciar sesión como cliente para ver tus favoritos.
          </div>
        ) : favoritos.length === 0 ? (
          <div className="text-center mt-12">
            <span className="material-icons-round text-6xl opacity-30 text-[#3a1859] dark:text-white">favorite_border</span>
            <h2 className="text-xl font-semibold mt-4 text-[#3a1859] dark:text-white">Aún no tienes productos favoritos</h2>
            <p className="text-sm text-slate-500 dark:text-slate-200 mt-1">Toca el corazón en cualquier producto para guardarlo aquí.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {favoritos.map((p: any) => (
              <ProductoCard
                key={p.id}
                producto={p}
                showCart
                showEye
                showFav
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

