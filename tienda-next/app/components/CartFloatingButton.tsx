"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useUser } from "../context/UserContext";

const CartFloatingButton: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isCliente, isAdmin, carrito } = useUser();

  if (!user) return null;

  const cartPath = pathname.startsWith("/admin")
    ? "/admin/cart"
    : pathname.startsWith("/home")
      ? "/home/cart"
      : isAdmin
        ? "/admin/cart"
        : isCliente
          ? "/home/cart"
          : "/cart";
  const cartCount = carrito?.length ?? 0;

  return (
    <>
      <style>{`
        .cart-float {
          position: fixed;
          right: 1.25rem;
          bottom: calc(5.25rem + env(safe-area-inset-bottom, 0px));
          z-index: 55;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        @media (min-width: 768px) {
          .cart-float {
            display: none;
          }
        }

        .cart-wrap {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .cart-btn {
          position: relative;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 0;
          background: linear-gradient(135deg, #7c3aed 0%, #a855f7 52%, #f43f5e 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 14px 30px rgba(124, 58, 237, 0.34);
          transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.22s ease;
          overflow: visible;
        }

        .cart-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 18px 36px rgba(124, 58, 237, 0.42);
        }

        .cart-btn:active {
          transform: scale(0.96);
        }

        .cart-btn svg {
          width: 21px;
          height: 21px;
          fill: currentColor;
        }

        .cart-ring {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 2px solid rgba(168, 85, 247, 0.55);
          opacity: 0;
          animation: cart-pulse 2.2s ease-out infinite;
          pointer-events: none;
        }

        .cart-ring-2 {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 2px solid rgba(244, 63, 94, 0.42);
          opacity: 0;
          animation: cart-pulse 2.2s ease-out infinite 0.75s;
          pointer-events: none;
        }

        @keyframes cart-pulse {
          0%   { inset: -3px; opacity: 0.55; }
          100% { inset: -20px; opacity: 0; }
        }

        .cart-badge {
          position: absolute;
          top: -7px;
          right: -7px;
          min-width: 22px;
          height: 22px;
          padding: 0 6px;
          border-radius: 999px;
          background: #ef4444;
          color: #fff;
          font-size: 12px;
          font-weight: 800;
          line-height: 22px;
          text-align: center;
          border: 2px solid rgba(255, 255, 255, 0.95);
          box-shadow: 0 6px 16px rgba(239, 68, 68, 0.35);
        }
      `}</style>

      <button
        type="button"
        className="cart-float"
        aria-label="Ir al carrito"
        onClick={() => router.push(cartPath)}
      >
        <span className="cart-wrap">
          {cartCount > 0 && <span className="cart-badge">{cartCount > 99 ? "99+" : cartCount}</span>}
          <span className="cart-btn" data-onboarding="carrito-flotante">
            <span className="cart-ring" />
            <span className="cart-ring-2" />
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2Zm10 0c-1.1 0-1.99.9-1.99 2S15.9 22 17 22s2-.9 2-2-.9-2-2-2ZM7.17 14h9.52c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0 0 21.17 5H6.21L5.27 2.98A1 1 0 0 0 4.34 2H2a1 1 0 1 0 0 2h1.64l3.1 6.59-1.16 2.1C4.78 14.8 5.48 16 6.61 16H19a1 1 0 1 0 0-2H7.17Zm-.64-2 1.1-2h10.64l-1.1 2H6.53Z" />
            </svg>
          </span>
        </span>
      </button>
    </>
  );
};

export default CartFloatingButton;