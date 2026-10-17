/**
 * Script de migración para actualizar enlaces de categorías en Firebase
 * Convierte enlaces antiguos con query parameters (cat=...&sub=...) a slugs SEO-friendly
 * 
 * Uso: node scripts/migrate-category-links.js
 */

const { db } = require("../app/lib/firebase");
const { obtenerCategorias } = require("../app/lib/categorias-db");
const { createCategorySlug, generateCategorySlug } = require("../app/lib/slug");
const { collection, getDocs, updateDoc, doc, query, where } = require("firebase/firestore");

// Función para extraer IDs de categoría/subcategoría de un enlace antiguo
function parseOldLink(link) {
  if (!link || !link.includes("products-by-category")) return null;
  
  const catMatch = link.match(/cat=([^&]+)/);
  const subMatch = link.match(/sub=([^&]+)/);
  const subsubMatch = link.match(/subsub=([^&]+)/);
  
  if (!catMatch) return null;
  
  return {
    categoriaId: catMatch[1],
    subcategoriaId: subMatch ? subMatch[1] : null,
    subsubcategoriaId: subsubMatch ? subsubMatch[1] : null,
  };
}

// Función para encontrar una categoría por ID
function findCategoryById(categorias, id) {
  return categorias.find(cat => cat.id === id);
}

// Función para encontrar una subcategoría por ID
function findSubcategoryById(categoria, id) {
  if (!categoria || !categoria.subcategorias) return null;
  return categoria.subcategorias.find(sub => sub.id === id);
}

// Función para encontrar una subsubcategoría por ID
function findSubsubcategoryById(subcategoria, id) {
  if (!subcategoria || !subcategoria.subcategorias) return null;
  return subcategoria.subcategorias.find(subsub => subsub.id === id);
}

// Función para generar el nuevo slug SEO-friendly
function generateNewSlug(categorias, categoriaId, subcategoriaId, subsubcategoriaId) {
  const categoria = findCategoryById(categorias, categoriaId);
  if (!categoria) return null;
  
  if (subcategoriaId) {
    const subcategoria = findSubcategoryById(categoria, subcategoriaId);
    if (!subcategoria) return null;
    
    if (subsubcategoriaId) {
      const subsubcategoria = findSubsubcategoryById(subcategoria, subsubcategoriaId);
      if (!subsubcategoria) return null;
      
      return createCategorySlug(categoria.nombre, subcategoria.nombre, subsubcategoria.nombre);
    }
    
    return createCategorySlug(categoria.nombre, subcategoria.nombre);
  }
  
  return generateCategorySlug(categoria.nombre);
}

// Función para procesar un enlace individual
async function processLink(link, categorias) {
  const parsed = parseOldLink(link);
  if (!parsed) return link;
  
  const newSlug = generateNewSlug(
    categorias,
    parsed.categoriaId,
    parsed.subcategoriaId,
    parsed.subsubcategoriaId
  );
  
  if (!newSlug) {
    console.log(`  ⚠️  No se pudo generar slug para: ${link}`);
    return link;
  }
  
  // Preservar otros query parameters si existen
  const urlParts = link.split('?');
  const basePath = urlParts[0];
  const queryParts = urlParts[1] ? urlParts[1].split('&') : [];
  
  // Filtrar parámetros de categoría/subcategoría
  const otherParams = queryParts.filter(
    p => !p.startsWith('cat=') && !p.startsWith('sub=') && !p.startsWith('subsub=')
  );
  
  // Construir nuevo enlace
  let newLink = `/${newSlug}`;
  if (otherParams.length > 0) {
    newLink += `?${otherParams.join('&')}`;
  }
  
  console.log(`  ✅ ${link} -> ${newLink}`);
  return newLink;
}

// Función para procesar un item de featured category
async function processFeaturedCategoryItem(item, categorias) {
  if (!item.link) return item;
  
  const newLink = await processLink(item.link, categorias);
  if (newLink !== item.link) {
    return { ...item, link: newLink };
  }
  
  return item;
}

// Función principal de migración
async function migrateLandingPage() {
  console.log("🚀 Iniciando migración de enlaces de categorías...\n");
  
  try {
    // Obtener categorías
    console.log("📥 Cargando categorías...");
    const categorias = await obtenerCategorias();
    console.log(`   ✅ ${categorias.length} categorías cargadas\n`);
    
    // Obtener documentos de landing page
    console.log("📥 Cargando documentos de landing page...");
    const landingQuery = query(collection(db, "landing"));
    const landingSnapshot = await getDocs(landingQuery);
    
    if (landingSnapshot.empty) {
      console.log("   ℹ️  No se encontraron documentos de landing page");
      return;
    }
    
    console.log(`   ✅ ${landingSnapshot.size} documentos encontrados\n`);
    
    let totalUpdated = 0;
    let totalProcessed = 0;
    
    for (const docSnapshot of landingSnapshot.docs) {
      const docId = docSnapshot.id;
      const data = docSnapshot.data();
      
      console.log(`📄 Procesando documento: ${docId}`);
      
      let updated = false;
      const updatedData = { ...data };
      
      // Procesar secciones con items (featured categories, etc.)
      if (data.sections) {
        for (let i = 0; i < data.sections.length; i++) {
          const section = data.sections[i];
          
          if (section.items && Array.isArray(section.items)) {
            console.log(`  📦 Procesando sección ${i} (${section.type || 'unknown'}) con ${section.items.length} items`);
            
            const updatedItems = [];
            for (let j = 0; j < section.items.length; j++) {
              const item = section.items[j];
              const processedItem = await processFeaturedCategoryItem(item, categorias);
              
              if (processedItem.link !== item.link) {
                updated = true;
              }
              
              updatedItems.push(processedItem);
            }
            
            updatedData.sections[i].items = updatedItems;
          }
        }
      }
      
      // Procesar campos directos (primaryButtonLink, categoryLink, etc.)
      const directFields = ['primaryButtonLink', 'secondaryButtonLink', 'categoryLink'];
      for (const field of directFields) {
        if (data[field]) {
          const newLink = await processLink(data[field], categorias);
          if (newLink !== data[field]) {
            updatedData[field] = newLink;
            updated = true;
          }
        }
      }
      
      if (updated) {
        console.log(`  💾 Actualizando documento ${docId}...`);
        await updateDoc(doc(db, "landing", docId), updatedData);
        totalUpdated++;
        console.log(`  ✅ Documento ${docId} actualizado\n`);
      } else {
        console.log(`  ℹ️  Documento ${docId} no requiere cambios\n`);
      }
      
      totalProcessed++;
    }
    
    console.log("\n" + "=".repeat(50));
    console.log("📊 Resumen de migración:");
    console.log(`   Documentos procesados: ${totalProcessed}`);
    console.log(`   Documentos actualizados: ${totalUpdated}`);
    console.log("=".repeat(50));
    
    if (totalUpdated > 0) {
      console.log("\n✅ Migración completada exitosamente!");
    } else {
      console.log("\nℹ️  No se encontraron enlaces para migrar.");
    }
    
  } catch (error) {
    console.error("\n❌ Error durante la migración:", error);
    process.exit(1);
  }
}

// Ejecutar migración
migrateLandingPage()
  .then(() => {
    console.log("\n🎉 Script finalizado");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Error fatal:", error);
    process.exit(1);
  });
