// Utilidad para agregar una categoría anidada en el path correcto
function addNestedCategoria(categorias, path, nueva) {
  if (path.length === 0) return categorias;
  const [idx, ...rest] = path;
  const copy = categorias.map(cat => ({ ...cat, subcategorias: cat.subcategorias ? [...cat.subcategorias] : [] }));
  if (rest.length === 0) {
    // Agregar en este nivel
    copy[idx].subcategorias = [...(copy[idx].subcategorias || []), nueva];
  } else {
    copy[idx].subcategorias = addNestedCategoria(copy[idx].subcategorias || [], rest, nueva);
  }
  return copy;
}

import { useEffect, useState } from "react";
import { obtenerCategorias, guardarCategoria, eliminarCategoria } from "../../lib/categorias-db";

export type Categoria = {
  id: string;
  nombre: string;
  icono?: string;
  subcategorias?: Categoria[];
};

export default function CategoriasAdminPanel({ onCategoriasChange }: { onCategoriasChange?: (cats: Categoria[]) => void }) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [nuevoIcono, setNuevoIcono] = useState("");
  const [loading, setLoading] = useState(false);
  // Estados de expansión para acordeón
  const [expanded, setExpanded] = useState<{[key: string]: boolean}>({});


  // Cargar categorías desde Firestore
  useEffect(() => {
    obtenerCategorias().then(cats => setCategorias(cats || []));
  }, []);

  // Notificar cambios
  useEffect(() => {
    if (onCategoriasChange) onCategoriasChange(categorias);
  }, [categorias, onCategoriasChange]);

  const agregarCategoria = async () => {
    if (!nuevaCategoria.trim()) return;
    const nueva = { id: Date.now().toString(), nombre: nuevaCategoria, icono: nuevoIcono.trim() || undefined, subcategorias: [] };
    await guardarCategoria(nueva);
    setCategorias(prev => [...prev, nueva]);
    setNuevaCategoria("");
    setNuevoIcono("");
  };

  // Eliminar categoría recursivamente
  const handleEliminarCategoria = async (cat: Categoria, nivel: number, parentPath: number[] = []) => {
    if (nivel === 1) {
      // Eliminar categoría de primer nivel y todas sus subcategorías
      await eliminarCategoria(cat.id);
      setCategorias(prev => prev.filter(c => c.id !== cat.id));
    } else {
      // Eliminar subcategoría o subsubcategoría
      setCategorias(prev => {
        const copy = JSON.parse(JSON.stringify(prev));
        let pointer = copy;
        for (let i = 0; i < parentPath.length - 1; i++) {
          pointer = pointer[parentPath[i]].subcategorias;
        }
        pointer.splice(parentPath[parentPath.length - 1], 1);
        // Actualizar en Firestore la raíz
        guardarCategoria(copy[parentPath[0]]);
        return copy;
      });
    }
  };

  // Renderizar categorías y subcategorías
  const renderCategorias = (cats: Categoria[], nivel = 1, parentPath: number[] = []) => (
    <ul className={nivel === 1 ? "mb-4" : `ml-${nivel * 4} mt-2`}>
      {cats.map((cat, idx) => {
        const path = [...parentPath, idx];
        const key = path.join("-");
        const isOpen = !!expanded[key];
        return (
          <li key={cat.id} className="mb-2">
            <div className={`flex items-center gap-2 pl-${nivel * 2} py-1 rounded transition-colors ${isOpen ? 'bg-blue-50' : ''}`}
                 style={{ cursor: cat.subcategorias && cat.subcategorias.length > 0 ? 'pointer' : 'default' }}>
              {cat.subcategorias && cat.subcategorias.length > 0 && (
                <button
                  className="mr-1 text-blue-700 focus:outline-none"
                  onClick={() => setExpanded(exp => ({ ...exp, [key]: !exp[key] }))}
                  aria-label={isOpen ? "Colapsar" : "Expandir"}
                  type="button"
                >
                  <span className="material-icons-round text-base align-middle">
                    {isOpen ? "expand_more" : "chevron_right"}
                  </span>
                </button>
              )}
              <span className="font-semibold text-purple-700">{cat.nombre}</span>
              {/* Botón eliminar */}
              <button
                className="ml-1 text-red-500 hover:text-red-700 text-base font-bold px-1"
                title="Eliminar categoría"
                onClick={() => handleEliminarCategoria(cat, nivel, path)}
                type="button"
              >
                ×
              </button>
              {nivel < 3 && (
                <button
                  className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 ml-2"
                  onClick={async () => {
                    const nombre = prompt(`Nombre de la ${nivel === 1 ? "subcategoría" : "subsubcategoría"} para ${cat.nombre}`);
                    if (nombre && nombre.trim()) {
                      setCategorias(prev => addNestedCategoria(prev, path, { id: Date.now().toString(), nombre, subcategorias: nivel === 2 ? undefined : [] }));
                      const newCategorias = addNestedCategoria(categorias, path, { id: Date.now().toString(), nombre, subcategorias: nivel === 2 ? undefined : [] });
                      await guardarCategoria(newCategorias[path[0]]);
                    }
                  }}
                >
                  + {nivel === 1 ? "Subcategoría" : "Subsubcategoría"}
                </button>
              )}
            </div>
            {cat.subcategorias && cat.subcategorias.length > 0 && isOpen && (
              renderCategorias(cat.subcategorias, nivel + 1, [...path])
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold mb-4 text-blue-700">Gestión de Categorías</h2>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          className="flex-1 border rounded px-3 py-2"
          placeholder="Nueva categoría..."
          value={nuevaCategoria}
          onChange={e => setNuevaCategoria(e.target.value)}
        />
        <input
          type="text"
          className="w-32 border rounded px-3 py-2"
          placeholder="Icono (opcional)"
          value={nuevoIcono}
          onChange={e => setNuevoIcono(e.target.value)}
          maxLength={30}
          title="Nombre del icono de Material Icons (ej: computer, phone, headphones)"
        />
        <button
          className="bg-blue-700 text-white px-4 py-2 rounded font-bold"
          onClick={agregarCategoria}
        >
          Agregar categoría
        </button>
      </div>
      {renderCategorias(categorias)}
    </div>
  );
}
