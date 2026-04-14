"use client";

import React from "react";
import Link from "next/link";
import { useUser } from "../context/UserContext";
import { usePathname } from "next/navigation";
import WhatsAppFloatingButton from "./WhatsAppFloatingButton";

const IconInstagram = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const IconFacebook = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const IconTikTok = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
);

const IconYouTube = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const IconLinkedIn = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const socialLinks = [
  { href: "https://www.instagram.com/tecnothings_ec/?hl=es", label: "Instagram", Icon: IconInstagram },
  { href: "https://www.facebook.com/TecnothingsEc/", label: "Facebook", Icon: IconFacebook },
  { href: "https://www.tiktok.com/@tecnothings_ec", label: "TikTok", Icon: IconTikTok },

];

const Footer: React.FC = () => {
  const { isCliente, isLogged } = useUser();
  const pathname = usePathname();

  const showWhatsAppFloating =
    pathname && !pathname.startsWith("/home") && !pathname.startsWith("/admin");

  // Si el usuario está logueado, no mostrar el footer
  if (isLogged) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        #pdx-footer {
          font-family: 'DM Sans', sans-serif;
          background: #100820;
          color: #e8dff5;
          position: relative;
          overflow: hidden;
        }

        #pdx-footer .ft-glow-left {
          position: absolute;
          top: -80px;
          left: -120px;
          width: 420px;
          height: 420px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(120,60,200,0.18) 0%, transparent 70%);
          pointer-events: none;
        }

        #pdx-footer .ft-glow-right {
          position: absolute;
          bottom: -60px;
          right: -80px;
          width: 320px;
          height: 320px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(80,30,160,0.14) 0%, transparent 70%);
          pointer-events: none;
        }

        #pdx-footer .ft-main {
          position: relative;
          z-index: 1;
          max-width: 1100px;
          margin: 0 auto;
          padding: 52px 32px 36px;
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr 1.2fr;
          gap: 40px;
        }

        #pdx-footer .ft-main-logged {
          grid-template-columns: 1.4fr 1fr 1.6fr;
        }

        @media (max-width: 900px) {
          #pdx-footer .ft-main { grid-template-columns: 1fr 1fr; gap: 28px; padding: 36px 20px 24px; }
          #pdx-footer .ft-main-logged { grid-template-columns: 1fr 1fr; }
        }

        @media (max-width: 560px) {
          #pdx-footer .ft-main { grid-template-columns: 1fr; gap: 24px; padding: 28px 18px 20px; }
          #pdx-footer .ft-main-logged { grid-template-columns: 1fr; }

        }

        #pdx-footer .ft-brand-img {
          height: 36px;
          width: auto;
          margin-bottom: 14px;
          filter: brightness(0) invert(1);
          opacity: 0.92;
          display: block;
        }

        #pdx-footer .ft-brand-desc {
          font-size: 13px;
          line-height: 1.75;
          color: #a898c0;
          max-width: 210px;
          font-weight: 300;
          margin: 0;
        }

        #pdx-footer .ft-col-label {
          font-family: 'Syne', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #7c5fa0;
          margin-bottom: 18px;
          display: block;
        }

        #pdx-footer .ft-links {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 11px;
        }

        #pdx-footer .ft-links a {
          font-size: 13.5px;
          color: #c4b4da;
          text-decoration: none;
          font-weight: 300;
          transition: color 0.18s;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        #pdx-footer .ft-links a:hover { color: #ffffff; }

        #pdx-footer .ft-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #6b3fa0;
          flex-shrink: 0;
          transition: background 0.18s;
        }

        #pdx-footer .ft-links a:hover .ft-dot { background: #b47aff; }

        #pdx-footer .ft-contact-item {
          display: flex;
          flex-direction: column;
          gap: 3px;
          margin-bottom: 14px;
        }

        #pdx-footer .ft-contact-label {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #7c5fa0;
        }

        #pdx-footer .ft-contact-val {
          font-size: 13.5px;
          color: #c4b4da;
          font-weight: 300;
          text-decoration: none;
          transition: color 0.18s;
        }

        #pdx-footer a.ft-contact-val:hover { color: #fff; }

        #pdx-footer .ft-map-wrap {
          margin-top: 4px;
          border-radius: 4px;
          overflow: hidden;
          border: 1px solid rgba(180,100,255,0.15);
          height: 160px;
        }

        #pdx-footer .ft-map-wrap iframe {
          width: 100%;
          height: 100%;
          border: 0;
        }

        #pdx-footer .ft-map-inline-wrap {
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(180,100,255,0.15);
          height: 160px;
          margin-top: 16px;
        }

        #pdx-footer .ft-map-inline-wrap iframe {
          width: 100%;
          height: 100%;
          border: 0;
          filter: saturate(0.2) brightness(0.7) hue-rotate(200deg);
        }

        #pdx-footer .ft-divider {
          position: relative;
          z-index: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(140,80,220,0.3) 30%, rgba(140,80,220,0.3) 70%, transparent);
          margin: 0 32px;
        }

        #pdx-footer .ft-bottom {
          position: relative;
          z-index: 1;
          max-width: 1100px;
          margin: 0 auto;
          padding: 20px 32px 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }

        #pdx-footer .ft-copy-row {
          position: relative;
          z-index: 1;
          max-width: 1100px;
          margin-top: 10px;
          margin-bottom: 10px;
          padding: 14px 32px 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
          border-top: 1px solid rgba(120,60,180,0.12);
        }

        @media (max-width: 560px) {
          #pdx-footer .ft-bottom { flex-direction: column; align-items: flex-start; padding: 18px 18px 0; }
          #pdx-footer .ft-divider { margin: 0 18px; }
          #pdx-footer .ft-copy-row { padding: 14px 18px 20px; flex-direction: column; align-items: flex-start; margin-top: 60px; margin-bottom: 70px; }
        }

        #pdx-footer .ft-socials {
          display: flex;
          gap: 4px;
          list-style: none;
          padding: 0;
          margin: 0;
        }

        #pdx-footer .ft-socials a {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          border: 1px solid rgba(180,100,255,0.15);
          color: #9070b8;
          text-decoration: none;
          transition: all 0.18s;
        }

        #pdx-footer .ft-socials a:hover {
          border-color: rgba(180,100,255,0.45);
          color: #d0aaff;
          background: rgba(140,60,220,0.12);
        }

        #pdx-footer .ft-payments-img {
          height: 22px;
          width: auto;
          opacity: 0.5;
          filter: brightness(0) invert(1);
        }

        #pdx-footer .ft-copy-text {
          font-size: 11.5px;
          color: #5a4472;
          margin: 0;
        }

        #pdx-footer .ft-copy-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        #pdx-footer .ft-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(140,60,220,0.1);
          border: 1px solid rgba(140,60,220,0.2);
          border-radius: 20px;
          padding: 2px 10px;
          font-size: 10.5px;
          color: #9070b8;
        }

        #pdx-footer .ft-badge-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #7c3fb0;
          flex-shrink: 0;
        }

        #pdx-footer .ft-dev-link {
          font-size: 11.5px;
          color: #7a5a9a;
          text-decoration: none;
          transition: color 0.18s;
        }

        #pdx-footer .ft-dev-link:hover { color: #c4b4da; }

        #pdx-footer .ft-contact-logged {
          display: flex;
          flex-direction: row;
          gap: 32px;
          flex-wrap: wrap;
        }

        @media (max-width: 560px) {
          #pdx-footer .ft-contact-logged { flex-direction: column; gap: 0; }
        }
      `}</style>

      <footer id="pdx-footer">
        <div className="ft-glow-left" />
        <div className="ft-glow-right" />

        {/* Main grid */}
        <div className={`ft-main${isLogged ? " ft-main-logged" : ""}`}>

          {/* Brand */}
          <div>
            <img
              className="ft-brand-img"
              src="https://imagedelivery.net/0tt38OLkrSmHRt7hdItWEA/b85e233d-e857-410c-a566-8affd2d44f00/public"
              alt="Tecnothings S.A.S"
              loading="lazy"
            />
            <p className="ft-brand-desc">
              ¡Lleva tu talento al siguiente nivel! Tecnología que potencia a gamers,
              streamers y creadores de contenido.
            </p>
          </div>

          {/* Políticas — solo cuando NO está logueado */}
          {!isLogged && (
            <div>
              <span className="ft-col-label">Servicio al cliente</span>
              <ul className="ft-links">
                <li>
                  <Link href="/politicas/terminos-y-condiciones">
                    <span className="ft-dot" />
                    Términos y condiciones
                  </Link>
                </li>
                <li>
                  <Link href="/politicas/privacidad">
                    <span className="ft-dot" />
                    Políticas de privacidad
                  </Link>
                </li>

              </ul>
            </div>
          )}

          {/* Contacto */}
          <div>
            <span className="ft-col-label">Contacto</span>

            {isLogged ? (
              /* Cuando está logueado: info + mapa inline en la misma columna */
              <>
                <div className="ft-contact-logged">
                  <div>
                    <div className="ft-contact-item">
                      <span className="ft-contact-label">Dirección</span>
                      <span className="ft-contact-val">Centro Comercial San Felipe</span>
                    </div>
                    <div className="ft-contact-item">
                      <span className="ft-contact-label">Teléfono</span>
                      <a href="tel:+593962873167" className="ft-contact-val">
                        +593 96 287 3167
                      </a>
                    </div>
                    <div className="ft-contact-item">
                      <span className="ft-contact-label">Correo</span>
                      <a href="mailto:Tecnothings.sas@gmail.com" className="ft-contact-val">
                        Tecnothings.sas@gmail.com
                      </a>
                    </div>
                  </div>
                </div>
                <div className="ft-map-inline-wrap">
                  <iframe
                    title="Ubicación Tecno Things GYE"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.0631435887085!2d-79.9309434253004!3d-2.1294173978516073!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x902d733792952ed1%3A0x2fda88783fa806f2!2sTECNOTHINGS%20GYE!5e0!3m2!1ses-419!2sec!4v1772574979027!5m2!1ses-419!2sec"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                </div>
              </>
            ) : (
              <div>
                <div className="ft-contact-item">
                  <span className="ft-contact-label">Dirección</span>
                  <span className="ft-contact-val">Centro Comercial San Felipe</span>
                </div>
                <div className="ft-contact-item">
                  <span className="ft-contact-label">Teléfono</span>
                  <a href="tel:+593962873167" className="ft-contact-val">
                    +593 96 287 3167
                  </a>
                </div>
                <div className="ft-contact-item">
                  <span className="ft-contact-label">Correo</span>
                  <a href="mailto:Tecnothings.sas@gmail.com" className="ft-contact-val">
                    Tecnothings.sas@gmail.com
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Mapa — solo cuando NO está logueado (columna aparte) */}
          {!isLogged && (
            <div>
              <span className="ft-col-label">Encuéntranos</span>
              <div className="ft-map-wrap">
                <iframe
                  title="Ubicación Tecno Things GYE"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.0631435887085!2d-79.9309434253004!3d-2.1294173978516073!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x902d733792952ed1%3A0x2fda88783fa806f2!2sTECNOTHINGS%20GYE!5e0!3m2!1ses-419!2sec!4v1772574979027!5m2!1ses-419!2sec"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="ft-divider" />

        {/* Bottom bar: redes + pagos */}
        <div className="ft-bottom">
          <ul className="ft-socials">
            {socialLinks.map(({ href, label, Icon }) => (
              <li key={label}>
                <a href={href} target="_blank" rel="noreferrer" title={label}>
                  <Icon />
                </a>
              </li>
            ))}
          </ul>

          <img

          />
        </div>

        {/* Copyright row */}
        <div className="ft-copy-row ">
          <p className="ft-copy-text">
            © {new Date().getFullYear()} Tecnothings S.A.S. Todos los derechos reservados.
          </p>
          <div className="ft-copy-right">
            <div className="ft-badge">
              <div className="ft-badge-dot" />
              Hecho en Ecuador
            </div>
            <a
              href="https://www.instagram.com/hector.cobena/"
              target="_blank"
              rel="noreferrer"
              className="ft-dev-link"
            >
              Desarrollado por Héctor Cobeña
            </a>
          </div>
        </div>

        {showWhatsAppFloating && <WhatsAppFloatingButton />}
      </footer>
    </>
  );
};

export default Footer;