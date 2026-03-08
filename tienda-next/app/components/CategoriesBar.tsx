"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "../lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { useUser } from "../context/UserContext";

const CategoriesBar = () => {
  const { isCliente, isAdmin, user } = useUser();

  // Esperar a que cargue el usuario
  if (typeof user === "undefined") return null;

  let basePath = "/products-by-category";
  if (isCliente) basePath = "/home/products-by-category";
  else if (isAdmin) basePath = "/admin/products-by-category";

  const [categorias, setCategorias] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "categorias"), (snap) => {
      setCategorias(
        snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    });

    return () => unsub();
  }, []);

  return (
    <div
      className="hidden lg:block sticky top-0 z-30 border-b px-6 py-0"
      style={{
        background: "var(--navBg)",
        color: "var(--text)",
        borderColor: "var(--border)",
      }}
    >
      <div className="flex items-center justify-center gap-8 max-w-full overflow-visible no-scrollbar">
        {categorias.map((category) => (
          <div key={category.id} className="relative group">
            {category.subcategorias && category.subcategorias.length > 0 ? (
              <>
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors shadow-sm border"
                  style={{
                    background: "var(--cardBg)",
                    color: "var(--text)",
                    borderColor: "var(--border)",
                  }}
                >
                  {category.icono && (
                    <span className="material-icons-round text-lg">{category.icono}</span>
                  )}
                  {category.nombre}
                  <span className="material-icons-round text-base">
                    expand_more
                  </span>
                </button>

                {/* Dropdown Subcategorías */}
                <div className="absolute left-0 top-full mt-0 min-w-[220px] bg-white dark:bg-slate-900 rounded-b-xl rounded-t-none shadow-lg border border-slate-200 dark:border-slate-700 z-40 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all">
                  <div className="py-2">
                    {category.subcategorias.map((sub: any) => (
                      <div
                        key={sub.id}
                        className="relative group/submenu px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center gap-2"
                      >
                        <span className="material-icons-round text-base">
                          category
                        </span>
                        {sub.nombre}

                        {/* Subsubcategorías */}
                        {sub.subcategorias &&
                          sub.subcategorias.length > 0 && (
                            <div className="absolute left-full top-0 min-w-[180px] bg-white dark:bg-slate-900 rounded-r-xl rounded-l-none shadow-lg border border-slate-200 dark:border-slate-700 z-50 opacity-0 group-hover/submenu:opacity-100 pointer-events-none group-hover/submenu:pointer-events-auto transition-all">
                              {sub.subcategorias.map((subsub: any) => (
                                <Link
                                  key={subsub.id}
                                  href={`${basePath}?cat=${category.id}&sub=${sub.id}&subsub=${subsub.id}`}
                                  className="block px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm"
                                >
                                  {subsub.nombre}
                                </Link>
                              ))}
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <Link
                href={`${basePath}?cat=${category.id}`}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors shadow-sm border"
                style={{
                  background: "var(--cardBg)",
                  color: "var(--text)",
                  borderColor: "var(--border)",
                }}
              >
                {category.icono && (
                  <span className="material-icons-round text-lg">{category.icono}</span>
                )}
                {category.nombre}
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoriesBar;