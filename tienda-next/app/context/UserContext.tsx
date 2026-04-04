"use client";
import { createContext, useContext, useState, useEffect, useRef } from "react";
import { getInitialFavorites, getInitialCart, saveFavorites, saveCart, mergeGuestCartIntoUser } from "./userLocalStorage";
import { auth } from "../lib/firebase";
import { onIdTokenChanged, getIdToken, getIdTokenResult } from "firebase/auth";
import { Loading3DIcon } from "../components/Loading3DIcon";


// Contexto de usuario global
const UserContext = createContext({
  isLogged: false,
  isCliente: false,
  isAdmin: false,
  user: null,
  setUser: () => {},
  favoritos: [],
  addFavorito: (p) => {},
  removeFavorito: (id) => {},
  carrito: [],
  addCarrito: (p) => {},
  removeCarrito: (id) => {},
});

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [favoritos, setFavoritos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [loading, setLoading] = useState(true);
  // Controla si el carrito ya fue cargado desde localStorage (evita sobreescribir en la carga inicial)
  const cartLoadedRef = useRef(false);
  // Guarda el uid anterior para detectar transición de invitado → logueado
  const prevUidRef = useRef<string | null>(null);

  // Escuchar cambios en el token (incluye inicio de sesión y refresh de claims)
  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (realUser) => {
      if (!realUser) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        // Forzar refresh del token para obtener claims actualizados
        await getIdToken(realUser, true);
        const idToken = await getIdToken(realUser);
        // Intentar obtener rol desde backend si existe endpoint
        try {
          const res = await fetch("/api/auth/me", { headers: { Authorization: `Bearer ${idToken}` } });
          if (res.ok) {
            const data = await res.json();
            setUser({ ...(realUser as any), role: data.role });
            setLoading(false);
            return;
          }
        } catch (e) {
          // ignore and fallback to token claims
        }
        // Fallback: leer claims desde el token
        try {
          const tokenResult = await getIdTokenResult(realUser);
          setUser({ ...(realUser as any), role: (tokenResult?.claims as any)?.role });
        } catch (e) {
          setUser(realUser);
        }
      } catch (err) {
        setUser(realUser);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Inicializar favoritos desde localStorage (una sola vez)
  useEffect(() => {
    setFavoritos(getInitialFavorites());
  }, []);

  // Cuando el usuario se resuelve, cargar el carrito correspondiente
  // (invitado => 'carrito_guest', logueado => 'carrito_<uid>')
  // Si el usuario acaba de autenticarse, fusionar el carrito guest en el suyo
  useEffect(() => {
    if (loading) return;
    const uid = (user as any)?.uid || null;
    cartLoadedRef.current = false;

    if (uid && prevUidRef.current === null) {
      // Transición: invitado → logueado → fusionar carrito guest
      const merged = mergeGuestCartIntoUser(uid);
      setCarrito(merged);
    } else {
      setCarrito(getInitialCart(uid));
    }
    prevUidRef.current = uid;
  }, [user, loading]);

  // Guardar favoritos en localStorage cuando cambian
  useEffect(() => { saveFavorites(favoritos); }, [favoritos]);

  // Guardar carrito en localStorage, pero NO durante la carga inicial
  useEffect(() => {
    if (!cartLoadedRef.current) {
      // Primera ejecución tras cargar: marcar como listo y no guardar
      cartLoadedRef.current = true;
      return;
    }
    const uid = (user as any)?.uid || null;
    saveCart(carrito, uid);
  }, [carrito]); // eslint-disable-line react-hooks/exhaustive-deps

  // Métodos para favoritos
  const addFavorito = (producto) => {
    setFavoritos((prev) => {
      if (prev.find((p) => p.id === producto.id)) return prev;
      return [...prev, producto];
    });
  };
  const removeFavorito = (id) => {
    setFavoritos((prev) => prev.filter((p) => p.id !== id));
  };

  // Métodos para carrito
  const addCarrito = (producto) => {
    setCarrito((prev) => {
      // Si ya existe, reemplaza la cantidad
      if (prev.find((p) => p.id === producto.id)) {
        return prev.map((p) =>
          p.id === producto.id ? { ...p, cantidad: producto.cantidad || 1 } : p
        );
      }
      return [...prev, { ...producto, cantidad: producto.cantidad || 1 }];
    });
  };
  const removeCarrito = (id) => {
    setCarrito((prev) => prev.filter((p) => p.id !== id));
  };

  const isLogged = !!user;
  const isCliente = user?.role === "client" || user?.role === "cliente";
  const isAdmin = user?.role === "admin";


  if (loading) {
    return (
      <div style={{width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Loading3DIcon />
      </div>
    );
  }

  return (
    <UserContext.Provider value={{
      isLogged,
      isCliente,
      isAdmin,
      user,
      setUser,
      favoritos,
      addFavorito,
      removeFavorito,
      carrito,
      addCarrito,
      removeCarrito,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
