"use client";

import React from "react";
import Link from "next/link";
import { useUser } from "../context/UserContext";
import { usePathname } from "next/navigation";
import WhatsAppFloatingButton from "./WhatsAppFloatingButton";

const Footer: React.FC = () => {
  const { isCliente, isLogged } = useUser();

  const pathname = usePathname();
  const showWhatsAppFloating =
    pathname && !pathname.startsWith("/home") && !pathname.startsWith("/admin");
  const base = isCliente ? "/home" : "";
  const homeHref = isCliente ? "/home" : "/";
  const blogsHref = `${base}/blogs`;

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer id="pdx-footer" className=" text-white">
      {/* Franja superior */}
      <div className="pt-6 pb-5 bg-[#3a1859] dark:bg-black">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-slate-100">
            {/* Brand */}
            <div className="px-0 md:px-4 lg:px-5 flex flex-col items-center md:items-center lg:items-start">
              <div className="w-full flex justify-center md:justify-center lg:justify-start mb-4">
                <img
                  src="https://imagedelivery.net/0tt38OLkrSmHRt7hdItWEA/b85e233d-e857-410c-a566-8affd2d44f00/public"
                  alt="Tecnothings S.A.S"
                  loading="lazy"
                  className="w-40 max-w-[150px] h-auto"
                />
              </div>
              <p className="text-center md:text-center lg:text-left text-sm text-slate-200">
                ¡Lleva tu talento al siguiente nivel! Explora la tecnología que
                potencia a los verdaderos profesionales. Ya seas gamer, streamer
                o creador de contenido, tenemos el equipo perfecto para que
                brilles.
              </p>
            </div>

            {/* Servicio al cliente (solo para usuarios no autenticados) */}
            {!isLogged && (
              <div className="pt-3 lg:pt-0 text-center md:text-start">
                <p className="text-base font-normal mb-4">Servicio al cliente</p>
                <ul className="space-y-3 text-sm">
                  <li>
                    <Link
                      href="/politicas/terminos-y-condiciones"
                      className="text-slate-200 hover:text-white transition-colors"
                    >
                      Términos y condiciones
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/politicas/privacidad"
                      className="text-slate-200 hover:text-white transition-colors"
                    >
                      Políticas de privacidad
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/politicas/devolucion"
                      className="text-slate-200 hover:text-white transition-colors"
                    >
                      Políticas de devolución
                    </Link>
                  </li>
                </ul>
              </div>
            )}

            {/* Categorías */}
            <div className="pt-3 lg:pt-0 text-center md:text-start">
              <p className="text-base font-normal mb-4">Categorías</p>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    href={`${base}/products-by-category`}
                    className="text-slate-200 hover:text-white transition-colors"
                  >
                    Productos
                  </Link>
                </li>
                <li>
                  <Link
                    href={`${base}/products-by-category`}
                    className="text-slate-200 hover:text-white transition-colors"
                  >
                    Monitores
                  </Link>
                </li>
                <li>
                  <Link
                    href={`${base}/products-by-category`}
                    className="text-slate-200 hover:text-white transition-colors"
                  >
                    Hardware
                  </Link>
                </li>
                <li>
                  <Link
                    href={`${base}/products-by-category`}
                    className="text-slate-200 hover:text-white transition-colors"
                  >
                    Laptops
                  </Link>
                </li>
                <li>
                  <a
                    href="https://www.google.com/maps/place/TECNOTHINGS+GYE/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-200 hover:text-white transition-colors"
                  >
                    Contacto
                  </a>
                </li>
              </ul>
            </div>

            {/* Datos de contacto + mapa */}
            <div
              className={`pt-3 lg:pt-0 text-center md:text-start ${
                isLogged ? "lg:col-span-2" : ""
              }`}
            >
              <p className="text-base font-normal mb-4">Datos de contacto</p>

              {isLogged ? (
                <div className="flex flex-col md:flex-row gap-4 items-stretch">
                  <ul className="space-y-4 text-sm flex-1">
                    <li>
                      <strong className="flex justify-center md:justify-start gap-2 text-slate-200 mb-1">
                        <span className="material-icons-round text-sm">location_on</span>
                        Dirección:
                      </strong>
                      <span className="text-slate-200">Centro Comercial San Felipe</span>
                    </li>
                    <li>
                      <strong className="flex justify-center md:justify-start gap-2 text-slate-200 mb-1">
                        <span className="material-icons-round text-sm">phone</span>
                        Teléfonos:
                      </strong>
                      <a
                        href="tel:+593962873167"
                        className="text-slate-200 hover:text-white transition-colors"
                      >
                        +593 96 287 3167
                      </a>
                    </li>
                    <li>
                      <strong className="flex justify-center md:justify-start gap-2 text-slate-200 mb-1">
                        <span className="material-icons-round text-sm">mail</span>
                        Correo electrónico:
                      </strong>
                      <a
                        href="mailto:Tecnothings.sas@gmail.com"
                        className="text-slate-200 hover:text-white transition-colors"
                      >
                        Tecnothings.sas@gmail.com
                      </a>
                    </li>
                  </ul>

                  <div className="mt-4 md:mt-0 h-40 md:h-60 flex-1 rounded-xl overflow-hidden border border-slate-800">
                    <iframe
                      title="Ubicación Tecno Things GYE"
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.0631435887085!2d-79.9309434253004!3d-2.1294173978516073!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x902d733792952ed1%3A0x2fda88783fa806f2!2sTECNOTHINGS%20GYE!5e0!3m2!1ses-419!2sec!4v1772574979027!5m2!1ses-419!2sec"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <ul className="space-y-4 text-sm">
                    <li>
                      <strong className="flex justify-center md:justify-start gap-2 text-slate-200 mb-1">
                        <span className="material-icons-round text-sm">location_on</span>
                        Dirección:
                      </strong>
                      <span className="text-slate-200">Centro Comercial San Felipe</span>
                    </li>
                    <li>
                      <strong className="flex justify-center md:justify-start gap-2 text-slate-200 mb-1">
                        <span className="material-icons-round text-sm">phone</span>
                        Teléfonos:
                      </strong>
                      <a
                        href="tel:+593962873167"
                        className="text-slate-200 hover:text-white transition-colors"
                      >
                        +593 96 287 3167
                      </a>
                    </li>
                    <li>
                      <strong className="flex justify-center md:justify-start gap-2 text-slate-200 mb-1">
                        <span className="material-icons-round text-sm">mail</span>
                        Correo electrónico:
                      </strong>
                      <a
                        href="mailto:Tecnothings.sas@gmail.com"
                        className="text-slate-200 hover:text-white transition-colors"
                      >
                        Tecnothings.sas@gmail.com
                      </a>
                    </li>
                  </ul>

                  <div className="mt-4 h-40 md:h-60 rounded-xl overflow-hidden border border-slate-800">
                    <iframe
                      title="Ubicación Tecno Things GYE"
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.0631435887085!2d-79.9309434253004!3d-2.1294173978516073!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x902d733792952ed1%3A0x2fda88783fa806f2!2sTECNOTHINGS%20GYE!5e0!3m2!1ses-419!2sec!4v1772574979027!5m2!1ses-419!2sec"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Franja inferior */}
      <div className="bg-slate-950 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center py-4 gap-4">
            <ul className="flex gap-4 text-slate-300">
              <li>
                <a
                  href="https://www.instagram.com/tecnothings_ec/?hl=es"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 flex items-center text-slate-300 hover:text-white transition-colors"
                  title="Instagram"
                >
                  <span className="material-icons-round text-xl">photo_camera</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.facebook.com/search/top?q=tecnothingsec"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 flex items-center text-slate-300 hover:text-white transition-colors"
                  title="Facebook"
                >
                  <span className="material-icons-round text-xl">facebook</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.tiktok.com/@tecnothings_ec"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 flex items-center text-slate-300 hover:text-white transition-colors"
                  title="Tiktok"
                >
                  <span className="material-icons-round text-xl">music_note</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.youtube.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 flex items-center text-slate-300 hover:text-white transition-colors"
                  title="Youtube"
                >
                  <span className="material-icons-round text-xl">ondemand_video</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 flex items-center text-slate-300 hover:text-white transition-colors"
                  title="Linkedin"
                >
                  <span className="material-icons-round text-xl">work</span>
                </a>
              </li>
            </ul>

            <div className="h-8">
              <img
                src="https://imagedelivery.net/0tt38OLkrSmHRt7hdItWEA/937c7b7d-3909-4df5-b0d3-4bba978d5400/public"
                alt="Medios de pago aceptados"
                loading="lazy"
                className="h-full w-auto"
              />
            </div>
          </div>
          <div className="pb-4 text-center text-xs text-slate-400">
            <a
              href="https://www.instagram.com/hector.cobena/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white hover:underline underline-offset-2"
            >
              Desarrollado por Hector
            </a>
          </div>
        </div>
        {showWhatsAppFloating && <WhatsAppFloatingButton />}
      </div>
    </footer>
  );
};

export default Footer;
