"use client";
import React, { useEffect, useRef } from "react";
import Link from "next/link";

const sections = [
  {
    number: "01",
    title: "Información que Recopilamos",
    body: "Podemos recopilar información personal que nos proporciones de forma voluntaria, como tu nombre, dirección de correo electrónico, número de contacto y cualquier otro dato que decidas compartir mediante formularios en línea o comunicaciones directas.",
  },
  {
    number: "02",
    title: "Cómo Recopilamos la Información",
    body: "Utilizamos tecnologías comunes de seguimiento, como cookies y registros de servidor, para obtener datos sobre el uso que haces de nuestro sitio web. Esto nos permite optimizar tu experiencia de navegación. Puedes configurar tu navegador para aceptar o rechazar cookies según tus preferencias.",
  },
  {
    number: "03",
    title: "Uso de la Información",
    body: "La información recopilada puede ser utilizada para brindarte los productos o servicios que solicites, comunicarnos contigo, mejorar tu experiencia, enviarte información relevante y cumplir con obligaciones legales.",
  },
  {
    number: "04",
    title: "Protección de Datos",
    body: "Implementamos medidas de seguridad técnicas, administrativas y físicas razonables para proteger tu información personal. Sin embargo, ningún sistema es completamente infalible.",
  },
  {
    number: "05",
    title: "Compartición de Información",
    body: "No compartimos tu información personal con terceros, salvo cuando sea necesario por obligación legal o con tu consentimiento.",
  },
  {
    number: "06",
    title: "Derechos del Usuario",
    body: "Tienes derecho a acceder, rectificar, eliminar o solicitar la portabilidad de tus datos personales. Puedes contactarnos para ejercer estos derechos.",
  },
  {
    number: "07",
    title: "Cambios en la Política",
    body: "Podemos actualizar esta Política en cualquier momento. Te recomendamos revisarla periódicamente.",
  },
  {
    number: "08",
    title: "Contacto",
    body: null,
    isContact: true,
  },
];

const PoliticaPrivacidad: React.FC = () => {
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!lineRef.current) return;
      const el = lineRef.current;
      const rect = el.getBoundingClientRect();
      const windowH = window.innerHeight;

      const progress = Math.min(
        Math.max((windowH - rect.top) / (rect.height + windowH), 0),
        1
      );

      el.style.setProperty("--progress", String(progress));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        @keyframes tc-fade-in {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .tc-section {
          animation: tc-fade-in 0.5s ease both;
        }

        .tc-line {
          position: absolute;
          left: 47px;
          top: 72px;
          bottom: 100px;
          width: 1px;
        }

        .tc-line::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          background: linear-gradient(180deg, #7c3aed, #a855f7);
          height: calc(var(--progress, 0) * 100%);
        }

        .dark .tc-card:hover {
          background: linear-gradient(145deg,#181820,#222230) !important;
          border-color: rgba(124,58,237,0.5) !important;
          box-shadow: 
            0 0 0 1px rgba(124,58,237,0.25),
            0 20px 50px rgba(124,58,237,0.15),
            0 10px 30px rgba(0,0,0,0.8);
          transform: translateY(-2px);
        }
      `}</style>

      <div className="min-h-screen bg-white text-gray-900 dark:bg-[#0a0a0d] dark:text-[#e2ddf0]">

        {/* HERO */}
        <div className="relative overflow-hidden px-6 pt-16 pb-10 text-center">
          
          {/* Glow */}
          <div className="pointer-events-none absolute left-1/2 -top-32 -translate-x-1/2 w-[600px] h-[600px] rounded-full 
          bg-[radial-gradient(circle,rgba(124,58,237,0.15)_0%,transparent_70%)] 
          dark:bg-[radial-gradient(circle,rgba(124,58,237,0.25)_0%,transparent_70%)]" />

          <div className="relative z-10">
            <p className="uppercase tracking-[0.2em] text-sm text-violet-500 mb-4">
              Documento legal
            </p>

            <h1 className="text-3xl sm:text-5xl font-extrabold font-[Syne] mb-4">
              Política de <span className="text-violet-600">Privacidad</span>
            </h1>

            <p className="text-gray-500 dark:text-[#a8a1c4] max-w-xl mx-auto italic">
              En TECNOTHINGS S.A.S protegemos tu información. Aquí te explicamos cómo recopilamos y utilizamos tus datos.
            </p>
          </div>
        </div>

        {/* BODY */}
        <div className="relative max-w-4xl mx-auto px-6 pb-20">

          <div
            className="tc-line bg-violet-200 dark:bg-[rgba(124,58,237,0.25)]"
            ref={lineRef}
            style={{ "--progress": "0" } as React.CSSProperties}
          />

          {sections.map((s) =>
            s.isContact ? (
              <div key={s.number} className="tc-section flex gap-6 mb-12">


                <div className="flex-1 flex justify-between items-center bg-violet-50 dark:bg-[#15151a] border dark:border-[rgba(124,58,237,0.25)] rounded-xl p-6">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">
                      Contacto
                    </p>
                    <p className="text-sm text-gray-500 dark:text-[#cfc9e6] py-3">
                      Escríbenos para cualquier consulta sobre privacidad
                    </p>

                <a
                    href="mailto:tecnothings.sas@gmail.com"
                    className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    tecnothings.sas@gmail.com
                  </a>
                  </div>


                </div>
              </div>
            ) : (
              <div key={s.number} className="tc-section flex gap-6 mb-12">

                <div className="w-10 h-10 flex items-center justify-center rounded-full border text-violet-500">
                  {s.number}
                </div>

                <div className="tc-card flex-1 rounded-2xl px-7 py-6 
                  bg-gray-50 border border-gray-100 
                  dark:bg-[linear-gradient(145deg,#15151a,#1c1c24)] 
                  dark:border-[rgba(124,58,237,0.25)] 
                  dark:shadow-[0_0_0_1px_rgba(124,58,237,0.12),0_20px_40px_rgba(0,0,0,0.6)] 
                  transition-all duration-300">

                  <p className="font-bold mb-2 text-gray-900 dark:text-white">
                    {s.title}
                  </p>

                  <p className="text-sm leading-relaxed text-gray-500 dark:text-[#cfc9e6]">
                    {s.body}
                  </p>
                </div>
              </div>
            )
          )}

          {/* FOOTER */}
          <div className="text-center border-t pt-10 mt-10">
            <p className="text-sm text-gray-400 dark:text-[#7b7396] mb-4">
              Gracias por confiar en TECNOTHINGS S.A.S. Tu privacidad es importante para nosotros.
            </p>

            <Link href="/" className="text-violet-600 hover:underline">
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default PoliticaPrivacidad;