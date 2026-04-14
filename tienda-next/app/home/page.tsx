"use client";
import React, { useEffect, useState } from "react";
import ProductoCard from "../components/ProductoCard";
import { obtenerProductos } from "../lib/productos-db";
import { Loading3DIcon } from "../components/Loading3DIcon";
import { getCurrentUser } from "../lib/firebase-auth";
import dynamic from "next/dynamic";

const PopToolOnboarding = dynamic(() => import("../components/PopToolOnboarding"), { ssr: false });

export default function HomePage() {
  const [productosDestacados, setProductosDestacados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    function check() {
      setIsDesktop(window.innerWidth >= 768);
    }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Mostrar PopTool solo la primera vez
  useEffect(() => {
    if (typeof window === "undefined") return;
    const already = localStorage.getItem("poptool_onboarding_done");
    if (!already) setShowOnboarding(true);
  }, []);

  useEffect(() => {
    async function fetchUser() {
      try {
        const user = await getCurrentUser();
        if (user?.displayName) setUserName(user.displayName);
      } catch {}
    }
    fetchUser();
  }, []);

  useEffect(() => {
    async function fetchDestacados() {
      setLoading(true);
      try {
        const productos = await obtenerProductos();
        setProductosDestacados(productos.filter((p: any) => p.destacado));
      } catch {
        setProductosDestacados([]);
      } finally {
        setLoading(false);
      }
    }
    fetchDestacados();
  }, []);

  return (
    <>
      {showOnboarding && isDesktop && (
        <PopToolOnboarding onFinish={() => {
          setShowOnboarding(false);
          if (typeof window !== "undefined") {
            localStorage.setItem("poptool_onboarding_done", "1");
          }
        }} key="contextual" />
      )}

      <div className="min-h-screen flex flex-col bg-[#f3e8ff] dark:bg-[#1e1b2e] text-[#3a1859] dark:text-white transition-colors">

        {/* Hero section */}
        <div className="w-full bg-gradient-to-b from-[#7b68ee] via-[#a78bfa] to-[#f3e8ff] dark:from-[#3a1859] dark:via-[#7b68ee] dark:to-[#1e1b2e] px-4 pt-14 pb-16 text-center">
          <div className="max-w-xl mx-auto">
            <p className="text-black text-sm font-medium uppercase tracking-widest mb-3">
              Tu tienda de tecnología
            </p>
            <h1 className="text-3xl md:text-5xl font-extrabold text-[#3a1859] dark:text-white mb-4 leading-tight">
              ¡Bienvenido{userName ? `, ${userName}` : "Cliente"}! 👋
            </h1>
            <p className="text-[#5a2ca0] dark:text-[#a78bfa] text-base md:text-lg">
              Descubre los mejores productos tech al mejor precio.
            </p>
          </div>
        </div>

        {/* Wave divider */}
        <div className="w-full overflow-hidden -mt-1 leading-none">
          <svg viewBox="0 0 1440 48" xmlns="http://www.w3.org/2000/svg" className="w-full block fill-[#a78bfa] dark:fill-[#3a1859]">
            <path d="M0,48 C360,0 1080,96 1440,48 L1440,0 L0,0 Z" />
          </svg>
        </div>

        {/* Exploración CTA */}
        <div className="w-full bg-gradient-to-r from-purple-50 to-purple-100 dark:from-slate-800 dark:to-slate-900 px-4 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-3 leading-tight">
                  Encuentra todo lo que necesitas
                </h2>
                <p className="text-slate-600 dark:text-slate-300 text-lg">
                  Explora nuestras categorías o usa la búsqueda para encontrar exactamente lo que buscas
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <a
                  href="/home/products-by-category"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#7b68ee] hover:bg-[#6d28d9] text-white font-bold rounded-xl transition-colors shadow-md"
                >
                  <span className="text-sm">Categorías</span>
                </a>
                <a
                  href="/home/search-results"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-slate-700 text-[#7b68ee] dark:text-purple-300 font-bold rounded-xl transition-colors shadow-md border-2 border-[#7b68ee] dark:border-purple-400 hover:bg-slate-50 dark:hover:bg-slate-600"
                >
                  <span className="material-icons-round text-xl">search</span>
                  <span className="text-sm">Buscar</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Products section */}
        <div className="w-full max-w-6xl mx-auto px-4 py-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white text-center sm:text-left">
                Productos destacados
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 text-center sm:text-left">
                Selección especial para ti
              </p>
            </div>
            <a
              href="/home/productos"
              className="text-sm text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors whitespace-nowrap text-center sm:text-right"
            >
              Ver todos →
            </a>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <Loading3DIcon />
              <p className="text-slate-400 dark:text-slate-500 text-sm">Cargando productos...</p>
            </div>
          ) : productosDestacados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium">No hay productos destacados</p>
              <a href="/productos" className="text-sm text-blue-500  hover:underline">
                Ver todos los productos
              </a>
            </div>
          ) : (
            <div className="grid pb-10 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {productosDestacados.map((p) => (
                <ProductoCard key={p.id} producto={p} showCart={true} showEye={true} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}