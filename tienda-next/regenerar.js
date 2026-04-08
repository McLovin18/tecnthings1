// regenerar.js
import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccount = JSON.parse(
  fs.readFileSync(path.join(__dirname, "firebase-adminsdk.json"), "utf-8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "tecnothingsdb-17c48.firebasestorage.app"
});

const bucket = admin.storage().bucket();
const db = admin.firestore();

// =============================================
// EXTRAE PATH CORRECTAMENTE (clave del fix)
// Usa la URL completa para extraer el path real
// sin confundir %2F (barra en nombre) con / real
// =============================================
function extraerPath(url) {
  try {
    // Tomamos todo entre /o/ y ?alt=media
    const match = url.match(/\/o\/(.+?)(?:\?|$)/);
    if (!match) return null;

    // Solo decodificamos UNA vez — así %2F se convierte en /
    // pero solo dentro del nombre del archivo (correcto)
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}

function reemplazarUrl(url, urlMap) {
  if (!url || typeof url !== "string") return url;
  const filePath = extraerPath(url);
  if (!filePath) return url;
  const nueva = urlMap[filePath];
  if (nueva) {
    console.log(`    🔁 ${filePath}`);
    return nueva;
  }
  // Debug: mostrar cuando no se encuentra el path en el mapa
  console.log(`    ⚠️  Sin match: "${filePath}"`);
  return url;
}

async function regenerarToken(file) {
  const nuevoToken = randomUUID();
  await file.setMetadata({
    metadata: { 
      firebaseStorageDownloadTokens: nuevoToken 
    },
    // Esto obliga al navegador a revalidar y evita el error 412
    cacheControl: 'no-cache, no-store, must-revalidate', 
    contentType: 'image/webp' // Asegúrate de que sea el correcto
  });
  
  const encodedPath = encodeURIComponent(file.name);
  return `https://firebasestorage.googleapis.com/v0/b/${file.bucket.name}/o/${encodedPath}?alt=media&token=${nuevoToken}`;
}




async function construirUrlMap(prefix) {
  const [files] = await bucket.getFiles({ prefix });
  const archivos = files.filter(f => !f.name.endsWith("/"));
  const urlMap = {};

  console.log(`  🔄 Regenerando tokens (${archivos.length} archivos)...`);
  for (const file of archivos) {
    try {
      urlMap[file.name] = await regenerarToken(file);
      console.log(`    ✅ ${file.name}`);
    } catch (err) {
      console.error(`    ❌ ${file.name}:`, err.message);
    }
  }
  return urlMap;
}

// =============================================
// ACTUALIZADORES POR COLECCIÓN
// =============================================
async function actualizarProductos(urlMap) {
  const snap = await db.collection("productos").get();
  let actualizados = 0;

  for (const doc of snap.docs) {
    const imagenes = doc.data().imagenes || [];
    const nuevas = imagenes.map(url => reemplazarUrl(url, urlMap));
    const cambio = nuevas.some((u, i) => u !== imagenes[i]);
    if (cambio) {
      await doc.ref.update({ imagenes: nuevas });
      actualizados++;
      console.log(`  ✅ Doc actualizado: ${doc.id}`);
    }
  }
  return actualizados;
}

async function actualizarBlogs(urlMap) {
  const snap = await db.collection("blogs").get();
  let actualizados = 0;

  for (const doc of snap.docs) {
    const data = doc.data();
    // Busca el campo imagen en varias variantes posibles
    const campos = ["imagen", "imagenUrl", "image", "imageUrl", "portada", "foto"];
    let update = {};
    let huboCambio = false;

    for (const campo of campos) {
      if (data[campo] && typeof data[campo] === "string") {
        const nueva = reemplazarUrl(data[campo], urlMap);
        if (nueva !== data[campo]) {
          update[campo] = nueva;
          huboCambio = true;
        }
      }
    }

    if (huboCambio) {
      await doc.ref.update(update);
      actualizados++;
      console.log(`  ✅ Blog actualizado: ${doc.id}`);
    }
  }
  return actualizados;
}

async function actualizarLandingPage(urlMap) {
  // Busca en todas las colecciones posibles
  const nombresColeccion = ["landingpage", "landing_page", "landing", "LandingPage"];
  let snap = null;
  let coleccionUsada = null;

  for (const nombre of nombresColeccion) {
    const s = await db.collection(nombre).get();
    if (!s.empty) {
      snap = s;
      coleccionUsada = nombre;
      break;
    }
  }

  if (!snap) {
    console.log("  ⚠️  No se encontró la colección landingpage");
    return 0;
  }

  console.log(`  📦 Colección encontrada: "${coleccionUsada}"`);
  let actualizados = 0;

  for (const doc of snap.docs) {
    const data = doc.data();
    let huboCambio = false;
    const update = {};

    // sections[].props.image
    if (Array.isArray(data.sections)) {
      const sections = data.sections.map(section => {
        if (!section.props?.image) return section;
        const nueva = reemplazarUrl(section.props.image, urlMap);
        if (nueva === section.props.image) return section;
        huboCambio = true;
        return { ...section, props: { ...section.props, image: nueva } };
      });
      if (huboCambio) update.sections = sections;
    }

    // dynamicSections[].images[]
    if (Array.isArray(data.dynamicSections)) {
      let cambioDynamic = false;
      const dynamicSections = data.dynamicSections.map(section => {
        if (!Array.isArray(section.images)) return section;
        const nuevasImgs = section.images.map(url => reemplazarUrl(url, urlMap));
        const cambioImg = nuevasImgs.some((u, i) => u !== section.images[i]);
        if (!cambioImg) return section;
        cambioDynamic = true;
        return { ...section, images: nuevasImgs };
      });
      if (cambioDynamic) {
        huboCambio = true;
        update.dynamicSections = dynamicSections;
      }
    }

    // hero.image / heroPublished.image
    for (const campo of ["hero", "heroPublished"]) {
      if (data[campo]?.image) {
        const nueva = reemplazarUrl(data[campo].image, urlMap);
        if (nueva !== data[campo].image) {
          huboCambio = true;
          update[campo] = { ...data[campo], image: nueva };
        }
      }
    }

    if (huboCambio) {
      await doc.ref.update(update);
      actualizados++;
      console.log(`  ✅ LandingPage actualizado: ${doc.id}`);
    }
  }
  return actualizados;
}

// =============================================
// PROCESO PRINCIPAL
// =============================================
async function regenerarYActualizar() {
  const tareas = [
    { label: "productos",    prefix: "productos/",    fn: actualizarProductos },
    { label: "blogs",        prefix: "blogs/",        fn: actualizarBlogs },
    { label: "landingpage",  prefix: "landing_page/", fn: actualizarLandingPage }
  ];

  for (const tarea of tareas) {
    console.log(`\n${"=".repeat(55)}`);
    console.log(`📁 Storage: ${tarea.prefix}  →  📦 Firestore: ${tarea.label}`);
    console.log("=".repeat(55));

    const urlMap = await construirUrlMap(tarea.prefix);
    console.log(`\n  📝 Actualizando Firestore...`);
    const n = await tarea.fn(urlMap);
    console.log(`  📊 ${n} documento(s) actualizado(s)`);
  }

  console.log(`\n${"=".repeat(55)}`);
  console.log("✅ Todo completado.");
  console.log("=".repeat(55) + "\n");
}

regenerarYActualizar().catch(err => {
  console.error("❌ Error fatal:", err);
  process.exit(1);
});