"use client";
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { loginUser, registerUser, getCurrentUser } from "../lib/firebase-auth";
import { themeManager } from "../components/themeManager";
import CategoriesBar from "../components/CategoriesBar";

type TabType = "login" | "register";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tab, setTab] = useState<TabType>(
    searchParams.get("tab") === "register" ? "register" : "login"
  );

  const [loading, setLoading] = useState(false);

  const [alert, setAlert] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [showLoginPass, setShowLoginPass] = useState(false);

  const [showRegisterPass, setShowRegisterPass] = useState(false);

  // LOGIN STATE

  const [loginEmail, setLoginEmail] = useState("");

  const [loginPassword, setLoginPassword] = useState("");


  // REGISTER
  const [name, setName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerPasswordConfirm, setRegisterPasswordConfirm] = useState("");

  // ALERT AUTO REMOVE

  useEffect(() => {
    if (!alert) return;

    const t = setTimeout(() => {
      setAlert(null);
    }, 4000);

    return () => clearTimeout(t);
  }, [alert]);

  // LOGIN

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    if (!loginEmail || !loginPassword) {
      setAlert({
        message: "Completa los campos",

        type: "error",
      });

      return;
    }

    try {
      setLoading(true);
      const result = await loginUser(loginEmail, loginPassword);
      if (result.success) {
        setAlert({
          message: `Bienvenido ${result.user.email}`,
          type: "success",
        });
        // Crear cookie de sesión + obtener rol real desde el backend
        const idToken = result.idToken;
        let role = "client";
        try {
          const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ idToken }),
          });
          if (!res.ok) {
            throw new Error("No se pudo crear la sesión");
          }
          const data = await res.json();
          if (data.role) {
            role = data.role;
          }
        } catch (err: any) {
          setAlert({
            message: err?.message || "Error al crear la sesión",
            type: "error",
          });
          return;
        }
        // Reclamar órdenes de invitado con este correo
        try {
          await fetch("/api/auth/claim-guest-orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
          });
        } catch (e) {
          console.warn("No se pudieron reclamar órdenes de invitado:", e);
        }
        setTimeout(() => {
          if (role === "admin") {
            router.push("/admin");
          } else {
            router.push("/home");
          }
        }, 1200);
      }
    } catch (error: any) {
      setAlert({
        message: error.message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    if (registerPassword.length < 6) {
      setAlert({
        message: "Min 6 caracteres",
        type: "error",
      });
      return;
    }
    if (registerPassword !== registerPasswordConfirm) {
      setAlert({
        message: "Las contraseñas no coinciden",
        type: "error",
      });
      return;
    }

    try {
      setLoading(true);
      const result = await registerUser(
        registerEmail,
        registerPassword,
        { name },
      );
      if (result.success) {
        setAlert({
          message: "Cuenta creada",
          type: "success",
        });
        // Crear cookie de sesión inmediatamente después de registrar
        try {
          const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ idToken: result.idToken }),
          });
          if (!res.ok) {
            throw new Error("No se pudo crear la sesión");
          }
        } catch (err: any) {
          setAlert({
            message: err?.message || "Error al crear la sesión",
            type: "error",
          });
          return;
        }

        // Reclamar órdenes de invitado hechas con el mismo correo
        try {
          await fetch("/api/auth/claim-guest-orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken: result.idToken }),
          });
        } catch (e) {
          // No es crítico, continuar sin bloquear el registro
          console.warn("No se pudieron reclamar órdenes de invitado:", e);
        }

        setTimeout(() => {
          router.push("/home");
        }, 1200);
      }
    } catch (error: any) {
      setAlert({
        message: error.message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        background: 'var(--bg)',
        color: 'var(--text)'
      }}
      className="bg-white mt-2 dark:bg-slate-950 text-slate-900 dark:text-white min-h-screen flex flex-col"
    >
      <CategoriesBar />
      <div className="w-full text-centew-full max-w-md mx-auto mt-0 mb-5 text-center ">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-2" style={{ color: 'var(--text)' }}>¡Bienvenido a Tecno Things!</h2>
        <p className="text-base md:text-lg mb-4" style={{ color: 'var(--textSecondary)' }}>Inicia sesión o crea una cuenta para acceder a tu panel y disfrutar de la mejor tecnología.</p>
      </div>
      <div className="w-full max-w-md bg-white/90 dark:bg-slate-800/90 rounded-2xl shadow-xl p-6 md:p-10 mx-auto border border-slate-200 dark:border-slate-700">
        {/* ALERT */}
        {alert && (
          <div
            className={`mb-6 p-3 rounded-lg text-sm font-medium
${
  alert.type === "success"
    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
    : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"
}
`}
          >
            {alert.message}
          </div>
        )}
        {/* TABS */}
        <div className={"flex border-b border-slate-200 dark:border-slate-700 mb-8"}>
          <button
            onClick={() => setTab("login")}
            className={`flex-1 pb-3 font-semibold transition-colors duration-200
${tab === "login" ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-200" : "text-gray-400 dark:text-white/70"}
`}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => setTab("register")}
            className={`flex-1 pb-3 font-semibold transition-colors duration-200
${tab === "register" ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-200" : "text-gray-400 dark:text-white/70"}
`}
          >
            Registrarse
          </button>
        </div>
        {/* LOGIN */}
        {tab === "login" && (
          <form onSubmit={handleLogin} className="space-y-5">
            <input
              placeholder="Correo electrónico"
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-slate-400 dark:placeholder:text-white/70"
            />
            <div className="relative">
              <input
                placeholder="Contraseña"
                type={showLoginPass ? "text" : "password"}
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-slate-400 dark:placeholder:text-white/70"
              />
              <button
                type="button"
                onClick={() => setShowLoginPass(!showLoginPass)}
                className="absolute right-3 top-4 text-slate-400 dark:text-white"
                tabIndex={-1}
              >
                👁
              </button>
            </div>
            <button
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-xl transition-colors duration-200 shadow-md disabled:opacity-60"
            >
              {loading ? "Cargando..." : "Iniciar Sesión"}
            </button>
          </form>
        )}
        {/* REGISTER */}
        {tab === "register" && (
          <form onSubmit={handleRegister} className="space-y-5">
            <input
              placeholder="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-slate-400 dark:placeholder:text-white/70"
            />
            <input
              type="email"
              placeholder="Correo electrónico"
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
              className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-slate-400 dark:placeholder:text-white/70"
            />
            <div className="relative">
              <input
                type={showRegisterPass ? "text" : "password"}
                placeholder="Contraseña"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-slate-400 dark:placeholder:text-white/70"
              />
              <button
                type="button"
                onClick={() => setShowRegisterPass(!showRegisterPass)}
                className="absolute right-3 top-4 text-slate-400 dark:text-white"
                tabIndex={-1}
              >
                👁
              </button>
            </div>
            <input
              type={showRegisterPass ? "text" : "password"}
              placeholder="Confirmar contraseña"
              value={registerPasswordConfirm}
              onChange={(e) => setRegisterPasswordConfirm(e.target.value)}
              className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-slate-400 dark:placeholder:text-white/70"
            />
            <button
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-xl transition-colors duration-200 shadow-md disabled:opacity-60"
            >
              {loading ? "Creando..." : "Crear Cuenta"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
