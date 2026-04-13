"use client";

import React from "react";
import Link from "next/link";

export type Plan = {
  id: string;
  name: string;
  description: string;
  price?: string;
  features: string[];
  categoryLink: string;
  categoryName: string;
  color?: string;
  priceRange?: { min: number; max: number };
};

export type PlansSectionProps = {
  plans?: Plan[];
  title?: string;
  subtitle?: string;
};

const DEFAULT_PLANS: Plan[] = [

  {
    id: "budget",
    name: "Plan Budget",
    description: "Accesible y funcional",
    features: [
      "Procesador económico",
      "8GB RAM DDR4",
      "SSD 256GB",
      "Ideal para básico",
    ],
    categoryLink: "/products-by-category?cat=1775935501638&sub=1775935523162&minPrice=100&maxPrice=450",
    categoryName: "PCs Económicas",
    color: "from-orange-600 to-orange-800",
    priceRange: { min: 100, max: 450 },
  },

  {
    id: "office",
    name: "Plan Office",
    description: "Para trabajo y productividad",
    features: [
      "Procesador Core i5/Ryzen 5",
      "16GB RAM DDR4",
      "SSD 512GB",
      "Gráficos integrados",
    ],
    categoryLink: "/products-by-category?cat=1775935501638&sub=1775935523162&minPrice=350&maxPrice=650",
    categoryName: "PCs Oficina",
    color: "from-green-600 to-green-800",
    priceRange: { min: 350, max: 650 },
  },

  {
    id: "workstation",
    name: "Plan Workstation",
    description: "Para diseño y edición",
    features: [
      "CPU Threadripper/Ryzen Pro",
      "64GB RAM mínimo",
      "GPU profesional",
      "Storage RAID",
    ],
    categoryLink: "/products-by-category?cat=1775935501638&sub=1775935523162&minPrice=500&maxPrice=1000",
    categoryName: "Estaciones de Trabajo",
    color: "from-blue-600 to-blue-800",
    priceRange: { min: 500, max: 1000 },
  },



  {
    id: "gamer",
    name: "Plan Gamer",
    description: "Para jugadores competitivos",
    features: [
      "Procesador de alto rendimiento",
      "Tarjeta gráfica RTX 4080+",
      "32GB RAM DDR5",
      "SSD 1TB NVMe",
    ],
    categoryLink: "/products-by-category?cat=1775935501638&sub=1775935523162&minPrice=600&maxPrice=1000",
    categoryName: "Ensambles Gaming",
    color: "from-purple-600 to-purple-800",
    priceRange: { min: 600, max: 1000 },
  },

];

export default function PlansSection({
  plans = DEFAULT_PLANS,
  title = "Elige tu Plan",
  subtitle = "Selecciona el ensamble que mejor se adapta a tus necesidades",
}: PlansSectionProps) {
  return (
    <section className="w-full px-4 py-12 md:py-16 bg-slate-50 dark:bg-slate-900 m-0">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mb-4 text-slate-900 dark:text-white">
            {title}
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, idx) => (
            <div
              key={plan.id}
              className="flex flex-col h-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-md hover:shadow-lg transition-all overflow-hidden group"
            >
              {/* Header del Plan */}
              <div
                className={`bg-linear-to-br ${
                  plan.color || "from-purple-600 to-purple-800"
                } px-6 py-8 text-white`}
              >
                <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
                <p className="text-sm opacity-90">{plan.description}</p>
                {plan.priceRange && (
                  <p className="text-xs opacity-75 mt-2">Rango: ${plan.priceRange.min} - ${plan.priceRange.max}</p>
                )}
                {plan.price && (
                  <p className="text-3xl font-extrabold mt-4">{plan.price}</p>
                )}
              </div>

              {/* Features */}
              <div className="flex-1 px-6 py-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-purple-600 dark:text-purple-400 mt-1">
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700">
                <Link
                  href={plan.categoryLink}
                  className="block w-full text-center px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold shadow-md hover:shadow-lg transition-all transform hover:scale-105 active:scale-95"
                >
                  Ver {plan.categoryName}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
