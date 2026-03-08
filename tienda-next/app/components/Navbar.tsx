"use client";

import React, { useEffect, useRef, useState } from "react";
import { themeManager } from "./themeManager";
import ThemeToggle from "./ThemeToggle";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { obtenerProductos } from "../lib/productos-db";
// Componente acordeón de categorías dinámicas para móvil/tablet
function MobileCategoriesAccordion({ basePath }: { basePath: string }) {
  const [categorias, setCategorias] = React.useState<any[]>([]);
  const [openCat, setOpenCat] = React.useState<string | null>(null);
  const [openSub, setOpenSub] = React.useState<string | null>(null);
  React.useEffect(() => {
    const unsub = onSnapshot(collection(db, "categorias"), (snap) => {
      setCategorias(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);
  return (
    <div className="flex flex-col gap-2 my-2">
      {categorias.map((cat) => (
        <div key={cat.id} className="relative">
          <button
            className="w-full flex items-center justify-between px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-sm font-medium"
            type="button"
            onClick={() => setOpenCat(openCat === cat.id ? null : cat.id)}
          >
            <span className="flex items-center gap-2">
              {cat.icono && (
                <span className="material-icons-round text-base">{cat.icono}</span>
              )}
              <span>{cat.nombre}</span>
            </span>
            <span className="material-icons-round text-base">
              {openCat === cat.id ? "expand_less" : "expand_more"}
            </span>
          </button>
          {cat.subcategorias && cat.subcategorias.length > 0 && openCat === cat.id && (
            <div className="ml-4 space-y-1 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2 my-1">
              {cat.subcategorias.map((sub: any) => (
                <div key={sub.id} className="relative">
                  <button
                    className="w-full flex items-center justify-between px-3 py-2 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-xs"
                    type="button"
                    onClick={() => setOpenSub(openSub === sub.id ? null : sub.id)}
                  >
                    <span>{sub.nombre}</span>
                    {sub.subcategorias && sub.subcategorias.length > 0 && (
                      <span className="material-icons-round text-base">
                        {openSub === sub.id ? "expand_less" : "expand_more"}
                      </span>
                    )}
                  </button>
                  {sub.subcategorias && sub.subcategorias.length > 0 && openSub === sub.id && (
                    <div className="ml-4 space-y-1">
                      {sub.subcategorias.map((subsub: any) => (
                        <a
                          key={subsub.id}
                          href={`${basePath}?cat=${cat.id}&sub=${sub.id}&subsub=${subsub.id}`}
                          className="block px-3 py-2 rounded text-xs hover:bg-slate-200 dark:hover:bg-slate-700"
                        >
                          {subsub.nombre}
                        </a>
                      ))}
                    </div>
                  )}
                  {(!sub.subcategorias || sub.subcategorias.length === 0) && (
                    <a
                      href={`${basePath}?cat=${cat.id}&sub=${sub.id}`}
                      className="block px-3 py-2 rounded text-xs hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                      {sub.nombre}
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
          {(!cat.subcategorias || cat.subcategorias.length === 0) && openCat === cat.id && (
            <a
              href={`${basePath}?cat=${cat.id}`}
              className="block px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-sm font-medium"
            >
              {cat.nombre}
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
import { getCurrentUser } from "../lib/firebase-auth";

export const Navbar = () => {
  // Hooks deben ir siempre al inicio y en el mismo orden
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState("light");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [windowWidth, setWindowWidth] = useState<number | null>(null);

  // Search bar state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    getCurrentUser().then((u) => {
      setUser(u);
      setLoading(false);
      console.log("[Navbar] Usuario detectado:", u);
    });
  }, []);

  // Fetch all products once for suggestions (could be optimized for large catalogs)
  useEffect(() => {
    obtenerProductos().then((prods) => setAllProducts(prods));
  }, []);
  useEffect(() => {
    themeManager.applyTheme(
      themeManager.getStoredTheme() || themeManager.getSystemTheme(),
    );
    setTheme(themeManager.getTheme());
    const handler = (e: any) => setTheme(e.detail.theme);
    window.addEventListener("theme-changed", handler);
    return () => window.removeEventListener("theme-changed", handler);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth);
      const handleResize = () => setWindowWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Handle search input focus when opening
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Update suggestions as user types
  useEffect(() => {
    if (!searchOpen || !searchValue.trim()) {
      setSuggestions([]);
      return;
    }
    setSearchLoading(true);
    const texto = searchValue.trim().toLowerCase();
    // Filter products by name, description, brand, category, subcategory, subsubcategoria
    const filtered = allProducts.filter((p) => {
      const nombre = p.nombre?.toLowerCase() || "";
      const desc = p.descripcion?.toLowerCase() || "";
      const marcaProd = p.marca?.toLowerCase() || "";
      const categoria = p.categoria?.toLowerCase() || "";
      const subcategoria = p.subcategoria?.toLowerCase() || "";
      const subsubcategoria = p.subsubcategoria?.toLowerCase() || "";
      return (
        nombre.includes(texto) ||
        desc.includes(texto) ||
        marcaProd.includes(texto) ||
        categoria.includes(texto) ||
        subcategoria.includes(texto) ||
        subsubcategoria.includes(texto)
      );
    });
    setSuggestions(filtered.slice(0, 6)); // Show up to 6 suggestions
    setSearchLoading(false);
  }, [searchValue, searchOpen, allProducts]);

  const isMobileOrTablet = windowWidth !== null && windowWidth < 1024;
  const showFloatingCart = isMobileOrTablet;

  if (!mounted || loading) return null;

  const isClient = user?.role === "client";
  const isAdmin = user?.role === "admin";

  // Links según rol
  const links = user ? [
    { href: isClient ? "/home" : "/admin", label: "Inicio" },
    { href: isClient ? "/home/blogs" : "/admin/blogs", label: "Blogs" },
  ] : [
    { href: "/", label: "Inicio" },
    { href: "/blogs", label: "Blogs" },
  ];

  const handleToggleTheme = () => {
    themeManager.toggleTheme();
    setTheme(themeManager.getTheme());
  };

  return (
    <>
      {/* ================= NAVBAR SUPERIOR ================= */}
      <nav
        className="sticky top-0 z-40 px-4 py-3 lg:px-6 lg:py-4 backdrop-blur-md border-b shadow-lg"
        style={{ background: "var(--navBg)", color: "var(--text)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center justify-between max-w-full mx-auto">
          {/* LEFT */}
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-(--hover) transition"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menú"
            >
              <span className="material-icons-round text-2xl">menu</span>
            </button>
            <a href={user ? (isClient ? "/home" : "/admin") : "/"} className="flex flex-col">
              <span className="text-[10px] font-bold uppercase" style={{ color: "var(--textSecondary)" }}>
                Tienda Autorizada
              </span>
              <h1 className="text-xl font-extrabold flex items-center gap-2" style={{ color: "var(--text)" }}>
                <span className="material-icons-round text-2xl text-purple-600">storefront</span>
                TECNO THINGS
              </h1>
            </a>
            {/* Interactive Search Bar */}
            <div className="hidden lg:flex items-center relative ml-2">
              {/* Collapsed search icon */}
              {!searchOpen && (
                <button
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  aria-label="Buscar"
                  onClick={() => setSearchOpen(true)}
                >
                  <span className="material-icons-round">search</span>
                </button>
              )}
              {/* Expanded search input */}
              {searchOpen && (
                <form
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg"
                  style={{ background: "var(--hover)", minWidth: 220, position: 'relative' }}
                  onSubmit={e => {
                    e.preventDefault();
                    if (searchValue.trim()) {
                      let target = `/search-results?query=${encodeURIComponent(searchValue.trim())}`;
                      if (user?.role === "client") target = `/home/search-results?query=${encodeURIComponent(searchValue.trim())}`;
                      if (user?.role === "admin") target = `/admin/search-results?query=${encodeURIComponent(searchValue.trim())}`;
                      window.location.href = target;
                      setSearchOpen(false);
                      setSearchValue("");
                      setSuggestions([]);
                    }
                  }}
                >
                  <input
                    ref={searchInputRef}
                    name="navbar-search"
                    type="text"
                    placeholder="Buscar productos..."
                    className="bg-transparent outline-none px-2 py-1 text-sm flex-1"
                    style={{ minWidth: 120 }}
                    autoComplete="off"
                    value={searchValue}
                    onChange={e => setSearchValue(e.target.value)}
                    onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
                  />
                  <button
                    type="button"
                    className="p-1"
                    aria-label="Buscar"
                    onClick={() => {
                      if (searchValue.trim()) {
                        let target = `/search-results?query=${encodeURIComponent(searchValue.trim())}`;
                        if (user?.role === "client") target = `/home/search-results?query=${encodeURIComponent(searchValue.trim())}`;
                        if (user?.role === "admin") target = `/admin/search-results?query=${encodeURIComponent(searchValue.trim())}`;
                        window.location.href = target;
                        setSearchOpen(false);
                        setSearchValue("");
                        setSuggestions([]);
                      }
                    }}
                  >
                    <span className="material-icons-round">search</span>
                  </button>
                  {/* Close button */}
                  <button
                    type="button"
                    className="p-1 ml-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                    aria-label="Cerrar búsqueda"
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchValue("");
                      setSuggestions([]);
                    }}
                  >
                    <span className="material-icons-round">close</span>
                  </button>
                  {/* Suggestions dropdown */}
                  {searchOpen && searchValue.trim() && (
                    <div className="absolute left-0 top-full mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
                      {searchLoading ? (
                        <div className="p-4 text-center text-slate-500 text-sm">Buscando...</div>
                      ) : suggestions.length > 0 ? (
                        suggestions.map((prod) => {
                          let detailHref = `/product-detail?id=${prod.id}`;
                          if (user?.role === "client") detailHref = `/home/product-detail?id=${prod.id}`;
                          if (user?.role === "admin") detailHref = `/admin/product-detail?id=${prod.id}`;
                          return (
                            <a
                              key={prod.id}
                              href={detailHref}
                              className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-sm"
                              onMouseDown={e => e.preventDefault()}
                            >
                              {prod.imagen && (
                                <img src={prod.imagen} alt={prod.nombre} className="w-8 h-8 object-cover rounded" />
                              )}
                              <span className="truncate flex-1">{prod.nombre}</span>
                              {prod.marca && <span className="ml-2 text-xs text-slate-400">{prod.marca}</span>}
                            </a>
                          );
                        })
                      ) : (
                        <div className="p-4 text-center text-slate-500 text-sm">No hay resultados</div>
                      )}
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>
          {/* CENTER */}
          <div className="hidden lg:flex items-center gap-6">
            {links.map((link) => (
              <a key={link.href} href={link.href} className="hover:text-purple-600 transition">{link.label}</a>
            ))}
          </div>
          {/* RIGHT */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Carrito en navbar para todos, excepto en móvil/tablet */}
            {(!isMobileOrTablet) && (
              <a href={user ? (isClient ? "/home/cart" : "/admin/cart") : "/cart"} className="relative p-2 hover:bg-(--hover) rounded-full transition" aria-label="Carrito">
                <span className="material-icons-round text-2xl">shopping_bag</span>
              </a>
            )}
            {user ? (
              <div className="relative">
                <button
                  className="p-2 rounded-full hover:bg-(--hover) transition"
                  onClick={() => setUserMenu(!userMenu)}
                  title="Opciones de usuario"
                >
                  {user && user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Foto de perfil"
                      className="w-11 h-11 rounded-full object-cover border-2 border-[#3a1859] dark:border-white"
                    />
                  ) : (
                    <span className="material-icons-round text-2xl">account_circle</span>
                  )}
                </button>
                {userMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 flex flex-col">
                    <a href={isClient ? "/home/perfil" : "/admin/perfil"} className="px-4 py-3 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-900 dark:text-white">Perfil</a>
                    <a href={isClient ? "/home/config" : "/admin/config"} className="px-4 py-3 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="material-icons-round text-xl">settings</span>
                      Configuración
                    </a>
                    <button
                      className="px-4 py-3 text-left hover:bg-slate-100 dark:hover:bg-white/10 text-red-600 font-semibold"
                      onClick={async () => {
                        const { logoutUser } = await import("../lib/firebase-auth");
                        await logoutUser();
                        try {
                          await fetch("/api/auth/logout", { method: "POST" });
                        } catch (e) {}
                        window.location.href = "/";
                      }}
                    >
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <a href="/login" className="p-2 hover:bg-(--hover) rounded-full transition" aria-label="Cuenta">
                  <span className="material-icons-round text-2xl">account_circle</span>
                </a>
                <ThemeToggle />
              </>
            )}
          </div>
          {/* MOBILE RIGHT */}
          <div className="lg:hidden flex gap-2">
            {/* Carrito en navbar solo si no es móvil/tablet */}
            {!isMobileOrTablet && (
              <a href={user ? (isClient ? "/home/cart" : "/admin/cart") : "/cart"} aria-label="Carrito">
                <span className="material-icons-round">shopping_bag</span>
              </a>
            )}
          </div>
        </div>
      </nav>
      {/* ================= CATEGORIES DESKTOP ================= */}
      {/* Categorías eliminadas del Navbar para evitar doble barra, ahora se renderizan en el layout correspondiente */}
      {/* ================= MOBILE DRAWER ================= */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setMobileOpen(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute left-0 top-0 w-full bg-white text-slate-900 dark:bg-[#2a1040] dark:text-white max-h-[85vh] overflow-y-auto rounded-b-2xl shadow-xl p-6"
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="mb-6 text-xl font-bold text-slate-900 dark:text-white hover:text-red-500 dark:hover:text-red-400 transition"
              aria-label="Cerrar menú"
            >
              ✕
            </button>
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block mb-4 font-bold text-slate-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-300 transition"
              >
                {link.label}
              </a>
            ))}
            {/* Categorías dinámicas tipo acordeón */}
            <MobileCategoriesAccordion basePath={isClient ? "/home/products-by-category" : "/products-by-category"} />
            {user ? (
              <>
                <a
                  href={isClient ? "/home/perfil" : "/admin/perfil"}
                  className="block mb-3 text-slate-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-300"
                >
                  Perfil
                </a>
                <button
                  className="mt-1 text-left text-red-600 dark:text-red-400 hover:underline"
                  onClick={async () => {
                    const { logoutUser } = await import("../lib/firebase-auth");
                    await logoutUser();
                    try {
                      await fetch("/api/auth/logout", { method: "POST" });
                    } catch (e) {}
                    window.location.href = "/";
                  }}
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <a
                href="/login"
                className="text-slate-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-300 transition"
              >
                Iniciar sesión
              </a>
            )}
          </div>
        </div>
      )}
      {/* Carrito flotante móvil/tablet para todos los usuarios */}
      {showFloatingCart && (
        <a
          href={user ? (isClient ? "/home/cart" : "/admin/cart") : "/cart"}
          className="fixed bottom-28 right-4 z-50 bg-purple-600 text-white rounded-full shadow-lg p-4 flex items-center justify-center lg:hidden animate-bounce hover:bg-purple-700 transition"
          style={{ boxShadow: '0 4px 24px 0 rgba(80,0,120,0.15)' }}
          aria-label="Carrito flotante"
        >
          <span className="material-icons-round text-3xl">shopping_bag</span>
        </a>
      )}
    </>
  );
};

function CategoryDesktop({ category }: any) {
  const [activeSub, setActiveSub] = useState<string | null>(null);
  return (
    <div className="relative group flex">
      <button
        className="flex gap-2 px-4 py-2 rounded-lg border"
        style={{
          background: "var(--cardBg)",

          borderColor: "var(--border)",
        }}
      >
        <span className="material-icons-round">{category.icon}</span>
        {category.name}
      </button>
      {category.subcategories && (
        <div
          className="absolute top-full left-0 hidden group-hover:block w-64 border rounded-xl shadow-xl bg-(--dropdownBg)"
          style={{ borderColor: "var(--border)" }}
        >
          {Object.values(category.subcategories).map((sub: any) => (
            <div key={sub.id} className="relative">
              {/* Si tiene subsubcategorías, muestra panel derecho, si no, es clickeable */}
              {sub.subsubcategories ? (
                <button
                  className="block w-full text-left px-4 py-3 hover:bg-purple-100 dark:hover:bg-purple-900"
                  onMouseEnter={() => setActiveSub(sub.id)}
                  onMouseLeave={() => setActiveSub(null)}
                  onClick={() => setActiveSub(sub.id)}
                >
                  {sub.name}
                </button>
              ) : (
                <a
                  href={`/products-by-category?category=${category.id}&subcategory=${sub.id}`}
                  className="block px-4 py-3 hover:bg-purple-100 dark:hover:bg-purple-900"
                >
                  {sub.name}
                </a>
              )}
              {/* Subsubcategorías en panel derecho */}
              {activeSub === sub.id && sub.subsubcategories && (
                <div
                  className="absolute top-0 left-full w-56 border rounded-xl shadow-xl bg-(--dropdownBg) z-10"
                  style={{ borderColor: "var(--border)" }}
                  onMouseEnter={() => setActiveSub(sub.id)}
                  onMouseLeave={() => setActiveSub(null)}
                >
                  {Object.values(sub.subsubcategories).map((subsub: any) => (
                    <a
                      key={subsub.id}
                      href={`/products-by-category?category=${category.id}&subcategory=${sub.id}&subsubcategory=${subsub.id}`}
                      className="block px-4 py-2 text-sm hover:bg-purple-50 dark:hover:bg-purple-900"
                    >
                      {subsub.name}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MobileCategory({ category }: any) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between py-3 font-semibold"
      >
        {category.name}

        <span>{open ? "-" : "+"}</span>
      </button>

      {open && category.subcategories && (
        <div className="pl-4">
          {Object.values(category.subcategories).map((sub: any) => (
            <div key={sub.id}>
              <a
                href={`/products-by-category?category=${category.id}&subcategory=${sub.id}`}
                className="block py-2"
              >
                {sub.name}
              </a>
              {/* Subsubcategorías */}
              {sub.subsubcategories && (
                <div className="pl-6">
                  {Object.values(sub.subsubcategories).map((subsub: any) => (
                    <a
                      key={subsub.id}
                      href={`/products-by-category?category=${category.id}&subcategory=${sub.id}&subsubcategory=${subsub.id}`}
                      className="block py-1 text-sm text-gray-500 dark:text-gray-300"
                    >
                      {subsub.name}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Navbar;
