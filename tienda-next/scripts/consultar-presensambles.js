// Script para consultar productos pre-ensambles de Firestore
import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar credenciales desde el archivo JSON
const serviceAccountPath = path.join(__dirname, '../firebase-adminsdk.json');
const serviceAccountRaw = fs.readFileSync(serviceAccountPath, 'utf-8');
const serviceAccount = JSON.parse(serviceAccountRaw);

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id,
});

const db = admin.firestore();

async function consultarPresensambles() {
  try {
    console.log('\n📊 Consultando productos PRE-ENSAMBLES en Firestore...\n');
    
    const categoria = '1775935501638';
    const subcategoria = '1775935523162';
    
    console.log(`Criterios de búsqueda:`);
    console.log(`  • Categoría: ${categoria}`);
    console.log(`  • Subcategoría: ${subcategoria}\n`);
    
    // Hacer la consulta a Firestore
    const query = db.collection('productos')
      .where('categoria', '==', categoria)
      .where('subcategoria', '==', subcategoria)
      .limit(10);  // Obtener hasta 10 documentos
    
    const snapshot = await query.get();
    
    console.log(`✅ Se encontraron ${snapshot.size} productos\n`);
    
    if (snapshot.empty) {
      console.log('❌ No se encontraron productos con esos criterios.');
      return;
    }
    
    // Procesar los documentos
    const productos = [];
    const precios = [];
    
    snapshot.forEach((doc, index) => {
      const data = doc.data();
      const producto = {
        id: doc.id,
        nombre: data.nombre || 'N/A',
        precio: data.precio,
        descuento: data.descuento,
        precioFinal: data.descuento ? data.precio * (1 - data.descuento / 100) : data.precio,
        stock: data.stock,
        marca: data.marca || 'N/A',
        descripcion: data.descripcion || '',
        categoria: data.categoria,
        subcategoria: data.subcategoria,
        subsubcategoria: data.subsubcategoria || 'N/A',
        createdAt: data.createdAt,
        // Todos los campos para análisis tipo de dato
        allFields: data
      };
      
      productos.push(producto);
      if (typeof producto.precio === 'number') {
        precios.push(producto.precio);
      }
    });
    
    // Mostrar ejemplos de productos
    console.log('═'.repeat(80));
    console.log('📦 EJEMPLOS DE PRODUCTOS PRE-ENSAMBLES');
    console.log('═'.repeat(80));
    
    productos.slice(0, 5).forEach((prod, index) => {
      console.log(`\n[${index + 1}] ${prod.nombre}`);
      console.log(`   ID: ${prod.id}`);
      console.log(`   Precio: ${prod.precio} (tipo: ${typeof prod.precio})`);
      if (prod.descuento) {
        console.log(`   Descuento: ${prod.descuento}%`);
        console.log(`   Precio Final: ${prod.precioFinal}`);
      }
      console.log(`   Stock: ${prod.stock}`);
      console.log(`   Marca: ${prod.marca}`);
      console.log(`   Subsubcategoría: ${prod.subsubcategoria}`);
    });
    
    // Análisis de precios
    console.log('\n' + '═'.repeat(80));
    console.log('💰 ANÁLISIS DE PRECIOS');
    console.log('═'.repeat(80));
    
    console.log(`\nTotal de productos: ${productos.length}`);
    const preciosConTipo = productos.map(p => ({
      nombre: p.nombre.substring(0, 50),
      precio: p.precio,
      tipo: typeof p.precio,
      esNumero: typeof p.precio === 'number',
      esString: typeof p.precio === 'string'
    }));
    
    preciosConTipo.forEach((p, i) => {
      console.log(`  [${i + 1}] ${p.nombre}... => $${p.precio} (${p.tipo})`);
    });
    
    // Obtener solo precios numéricos
    const preciosNumericos = productos
      .filter(p => typeof p.precio === 'number')
      .map(p => p.precio);
    
    // Si los precios son strings, convertirlos
    const preciosConvertidos = productos
      .map(p => typeof p.precio === 'string' ? parseFloat(p.precio) : p.precio)
      .filter(p => !isNaN(p));
    
    console.log(`\n✓ Precios como NUMBER: ${preciosNumericos.length}`);
    console.log(`✓ Precios como STRING: ${productos.filter(p => typeof p.precio === 'string').length}`);
    console.log(`✓ Precios convertibles a número: ${preciosConvertidos.length}`);
    
    if (preciosConvertidos.length > 0) {
      const minPrecio = Math.min(...preciosConvertidos);
      const maxPrecio = Math.max(...preciosConvertidos);
      const promedioPrecio = preciosConvertidos.reduce((a, b) => a + b, 0) / preciosConvertidos.length;
      
      console.log(`\n✓ Rango de precios: $${minPrecio} - $${maxPrecio}`);
      console.log(`✓ Promedio: $${promedioPrecio.toFixed(2)}`);
      
      console.log(`\nDesglose de precios (ordenados):`);
      preciosConvertidos.sort((a, b) => a - b).forEach((p, i) => {
        console.log(`  ${i + 1}. $${p}`);
      });
    }
    
    // Análisis de tipo de datos
    console.log('\n' + '═'.repeat(80));
    console.log('🔍 ANÁLISIS DE TIPO DE DATO "PRECIO"');
    console.log('═'.repeat(80));
    
    const primerProducto = productos[0];
    if (primerProducto) {
      console.log(`\nPrimer producto (${primerProducto.nombre}):`);
      console.log(`  • Precio: ${primerProducto.precio}`);
      console.log(`  • Tipo de dato: ${typeof primerProducto.precio}`);
      console.log(`  • Valor exacto: ${JSON.stringify(primerProducto.precio)}`);
      
      // Verificar si tiene decimales
      const tieneDecimales = primerProducto.precio % 1 !== 0;
      console.log(`  • ¿Tiene decimales? ${tieneDecimales ? 'Sí' : 'No'}`);
    }
    
    // Resumen de campos de todos los productos
    console.log('\n' + '═'.repeat(80));
    console.log('📋 ESTRUCTURA DE DATOS ENCONTRADA');
    console.log('═'.repeat(80));
    
    if (productos.length > 0) {
      const sampleProduct = productos[0].allFields;
      console.log('\nCampos disponibles en los productos:');
      Object.entries(sampleProduct).forEach(([key, value]) => {
        console.log(`  • ${key}: ${typeof value}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error al consultar Firestore:', error.message);
  } finally {
    await admin.app().delete();
    process.exit(0);
  }
}

// Ejecutar la consulta
consultarPresensambles();
