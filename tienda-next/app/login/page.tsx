"use client";
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
const PopToolOnboarding = dynamic(() => import("../components/PopToolOnboarding"), { ssr: false });
import { useRouter, useSearchParams } from "next/navigation";
import BottomBarPublic from "../components/BottomBarPublic";
import { loginUser, registerUser, getCurrentUser } from "../lib/firebase-auth";
import { themeManager } from "../components/themeManager";
import { Loading3DIcon } from "../components/Loading3DIcon";

type TabType = "login" | "register";

export default function LoginPage() {
    // Controla si se muestra el onboarding de bienvenida tras login
    const [showWelcome, setShowWelcome] = useState(false);
    const [pendingRedirect, setPendingRedirect] = useState<null | (() => void)>(null);
    // Loader para evitar salto visual
    const [showLoader, setShowLoader] = useState(false);
    const [readyToShowWelcome, setReadyToShowWelcome] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  const [tab, setTab] = useState<TabType>(
    searchParams && searchParams.get("tab") === "register" ? "register" : "login"
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
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerId, setRegisterId] = useState("");

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
      // Si loginUser lanza error, no llega aquí
      if (result.success) {
        setAlert({
          message: `Bienvenido ${result.user.email}`,
          type: "success",
        });
        // Solo aquí se crea la cookie de sesión
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
        // Detectar si es desktop o móvil
        const isDesktopNow = typeof window !== "undefined" ? window.innerWidth >= 768 : true;
        if (!isDesktopNow) {
          // En móvil, redirigir directamente
          if (role === "admin") {
            router.push("/admin");
          } else {
            router.push("/home");
          }
        } else {
          // Desktop: mostrar loader y modal como antes
          setShowLoader(true);
          setTimeout(() => {
            if (role === "admin") {
              router.push("/admin");
            } else {
              setShowWelcome(true);
              setPendingRedirect(() => () => router.push("/home"));
            }
          }, 1200);
        }
      }
    } catch (error: any) {
      setAlert({
        message: error.message,
        type: "error",
      });
      // Si el error es de verificación, asegúrate de que no quede sesión local
      try { await import("../lib/firebase-auth").then(m => m.logoutUser()); } catch {}
    } finally {
      setLoading(false);
    }
  }

  // Solo mostrar mensaje de verificación si el usuario acaba de registrarse en esta sesión
  const [registerSuccess, setRegisterSuccess] = useState(false);
  // Guardar en localStorage que el usuario fue creado en esta sesión
  useEffect(() => {
    if (registerSuccess && registerEmail) {
      localStorage.setItem("justRegisteredEmail", registerEmail);
    }
  }, [registerSuccess, registerEmail]);
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
    // Validación de número de teléfono (Ecuador: 10 dígitos)
    if (!/^\d{10}$/.test(registerPhone)) {
      setAlert({
        message: "Número de teléfono inválido (10 dígitos)",
        type: "error",
      });
      return;
    }

    try {
      setLoading(true);
      const result = await registerUser(
        registerEmail,
        registerPassword,
        {
          name
        },
      );
      if (result.success) {
        setRegisterSuccess(true);
        setAlert({
          message: "Cuenta creada. Se ha enviado un correo de verificación. Por favor revisa tu email y verifica tu cuenta antes de iniciar sesión.",
          type: "success",
        });
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

  // Solo renderizar el PopToolOnboarding si es desktop
  const [isDesktop, setIsDesktop] = useState(true);
  useEffect(() => {
    function check() {
      setIsDesktop(window.innerWidth >= 768);
    }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <>
      {showWelcome && (
        <>
          <div className="fixed inset-0 min-h-screen min-w-screen bg-[#1e1b2e] dark:bg-black flex items-center justify-center z-99998">
            {isDesktop && (
              <PopToolOnboarding
                mode="welcome"
                onReady={() => {
                  setShowLoader(false);
                  setReadyToShowWelcome(true);
                }}
                onFinish={() => {
                  setShowWelcome(false);
                  setReadyToShowWelcome(false);
                  setShowLoader(false);
                  if (pendingRedirect) pendingRedirect();
                }}
              />
            )}
          </div>
          {showLoader && isDesktop && (
            <div className="fixed inset-0 min-h-screen min-w-screen bg-[#1e1b2e] dark:bg-black flex items-center justify-center z-99999">
              <Loading3DIcon />
            </div>
          )}
        </>
      )}
      {!showWelcome && (
        <div
          style={{
            background: 'var(--bg)',
            color: 'var(--text)'
          }}
          className="bg-white mt-2 dark:bg-black text-slate-900 dark:text-white min-h-screen flex flex-col"
        >
          <BottomBarPublic/>
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
              <>
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
                    {loading ? <><Loading3DIcon /><span className="ml-2">Cargando...</span></> : "Iniciar Sesión"}
                  </button>
                </form>
                <div className="mt-4 text-center">
                  <a href="/recuperar-password" className="text-blue-500 hover:underline text-sm">¿Olvidaste tu contraseña?</a>
                </div>
              </>
            )}
            {/* REGISTER */}
            {tab === "register" && (
              (registerSuccess && localStorage.getItem("justRegisteredEmail") === registerEmail) ? (
                <div className="text-center py-8">
                  <div className="text-green-600 text-lg font-semibold mb-2">¡Cuenta creada!</div>
                  <div className="mb-4">Se ha enviado un correo de verificación a <span className="font-bold">{registerEmail}</span>.<br />Por favor revisa tu email y verifica tu cuenta antes de iniciar sesión.</div>
                  <div className="text-sm text-slate-500 dark:text-slate-300">Si no ves el correo, revisa la carpeta de spam o promociones.</div>
                </div>
              ) : (
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
                  <input
                    type="text"
                    placeholder="Número de teléfono"
                    value={registerPhone}
                    onChange={(e) => setRegisterPhone(e.target.value)}
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
                    {loading ? <><Loading3DIcon /><span className="ml-2">Creando...</span></> : "Crear Cuenta"}
                  </button>
                </form>
              )
            )}
          </div>
        </div>
      )}
    </>
  );
}
