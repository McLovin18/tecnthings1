// Script para debuggear el filtro de precios
// Simula los precios reales y verifica qué debería mostrarse

const PRODUCTOS = [
  { nombre: "PC BASE SPEEDMIND AMD RYZEN 5 5600GT", precio: "500", descuento: "15" },
  { nombre: "COMPUTADOR SPEEDMIND AMD RYZEN 5 8500G", precio: "720", descuento: "15" },
  { nombre: "COMPUTADOR SPEEDMIND INTEL CORE i5-12400", precio: "750", descuento: "15" },
  { nombre: "COMPUTADOR SPEEDMIND AMD RYZEN 7 5700G", precio: "650", descuento: "15" },
  { nombre: "COMBO AMD RYZEN 5 7500X3D", precio: "700", descuento: "15" },
];

const FILTROS = [
  { nombre: "Budget", min: 100, max: 450 },
  { nombre: "Office", min: 350, max: 650 },
  { nombre: "Workstation", min: 500, max: 1000 },
  { nombre: "Gamer", min: 600, max: 1000 },
];

console.log("=== ANÁLISIS DE FILTROS DE PRECIOS ===\n");

FILTROS.forEach((filtro) => {
  console.log(`\n📍 FILTRO: ${filtro.nombre} ($${filtro.min} - $${filtro.max})`);
  console.log("─".repeat(60));

  const resultados = PRODUCTOS.filter((p) => {
    const base = Number(p.precio);
    const disc = Number(p.descuento);
    const finalPrice = disc > 0 && disc < 100 ? base * (1 - disc / 100) : base;

    const matchMin = finalPrice >= filtro.min;
    const matchMax = finalPrice <= filtro.max;
    const matches = matchMin && matchMax;

    console.log(
      `  ${matches ? "✅" : "❌"} ${p.nombre.substring(0, 40).padEnd(40)} | Base: $${base} | Desc: ${disc}% | Final: $${finalPrice.toFixed(2)} | Cumple: min=${matchMin}, max=${matchMax}`
    );

    return matches;
  });

  console.log(`\n  📊 RESULTADOS: ${resultados.length} producto(s)`);
});

console.log("\n" + "=".repeat(60));
console.log("✨ VERIFICACIÓN: El filtro Budget ($100-$450) debe mostrar SOLO 1 producto");
console.log("   Si ves más, el filtro NO está funcionando correctamente.");
