"use client";

import { useEffect, useState, ChangeEvent, useRef } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";

import {
  getLandingDraft,
  updateHero,
  updateFeaturedProducts,
  updateSection,
  deleteSection,
  saveLandingSections,
  uploadLandingImage,
  publishLanding,
} from "../../lib/landing-db";
import { LandingSection } from "../../lib/landing-types";
import { sectionSchemas } from "../../landing/sectionSchemas";
import { SectionRenderer } from "../../landing/sectionRegistry";

import { obtenerProductos } from "../../lib/productos-db";
import ProductoCard from "../../components/ProductoCard";

/* ============================
   TIPOS
============================ */

// Usamos el nuevo modelo JSON-driven para las secciones
type SectionType = string;
type Section = LandingSection;

/* ============================
   CONSTANTES
============================ */


function getDefaultSection(type: SectionType): Section {

  
    // De momento derivamos las opciones del schema registry

  const SECTION_TYPES = Object.values(sectionSchemas).map((schema: any) => ({
    type: schema.type as SectionType,
    icon: schema.icon || "view_compact",
    label: schema.label,
  }));
  const id = `section-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const schema = (sectionSchemas as any)[type] ?? (sectionSchemas as any).hero;

  const defaultProps: Record<string, any> = {};
  schema.fields.forEach((field: any) => {
    if (field.type === "text" || field.type === "textarea") {
      defaultProps[field.name] = "";
    }
    if (field.type === "boolean") {
      defaultProps[field.name] = false;
    }
  });

  return {
    id,
    type,
    props: defaultProps,
    styles: {},
    order: 0,
  };
}

/* ============================
   COMPONENTE PRINCIPAL
============================ */

export default function LandingEditor() {
    // Estado para error de comentarios de Google Maps
    const [googleCommentsError, setGoogleCommentsError] = useState("");
  const [loading, setLoading] = useState<boolean>(true);
  const [productos, setProductos] = useState<any[]>([]);
  const [hero, setHero] = useState<any>(null);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [addAfterIndex, setAddAfterIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [allProductos, setAllProductos] = useState<any[]>([]);
  const [activeTabs, setActiveTabs] = useState<
    Record<string, "content" | "styles" | "advanced">
  >({});
  const [activeFieldStyles, setActiveFieldStyles] = useState<
    Record<string, string | null>
  >({});
  const [activeHeroItemFieldStyles, setActiveHeroItemFieldStyles] = useState<
    Record<string, { index: number; fieldName: string } | null>
  >({});
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">(
    "desktop"
  );
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showFullPreview, setShowFullPreview] = useState<boolean>(false);
  const featuredScrollRef = useRef<HTMLDivElement | null>(null);

  // ============================
  // GOOGLE MAPS REVIEWS (Hero y comentarios seleccionados)
  // ============================
  const [googleReviewSummary, setGoogleReviewSummary] = useState<any>(null);
  const [googleComments, setGoogleComments] = useState<any[]>([]);
  const [selectedGoogleComments, setSelectedGoogleComments] = useState<any[]>([]);
  const [showGoogleCommentsModal, setShowGoogleCommentsModal] = useState(false);
  const [googleCommentsLoading, setGoogleCommentsLoading] = useState(false);

  // Cargar resumen y comentarios de Google Maps
  useEffect(() => {
    async function fetchGoogleReviews() {
      try {
        const placeId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_PLACE_ID || "";
        const res = await fetch(`/api/google-maps?place_id=${placeId}`);
        const data = await res.json();
        setGoogleReviewSummary(data);
      } catch (err) {
        setGoogleReviewSummary(null);
      }
    }
    fetchGoogleReviews();
    // Fetch Google Maps comments for modal
    async function fetchGoogleComments() {
      setGoogleCommentsLoading(true);
      try {
        const placeId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_PLACE_ID || "";
        const res = await fetch(`/api/google-scrape-reviews?place_id=${placeId}`);
        const data = await res.json();
        console.log("[Admin] fetchGoogleComments data:", data);
        setGoogleComments(data.reviews || []);
        if (data.error) {
          setGoogleCommentsError(data.error);
        } else {
          setGoogleCommentsError("");
        }
      } catch (err) {
        setGoogleComments([]);
        setGoogleCommentsError("No se pudieron cargar los comentarios de Google Maps.");
      }
      setGoogleCommentsLoading(false);
    }
    fetchGoogleComments();
  }, []);

  // Guardar comentarios seleccionados
  const saveSelectedGoogleComments = async () => {
    setSaving(true);
    // Log selección antes de guardar
    console.log("[Admin] selectedGoogleComments:", selectedGoogleComments);
    // Mapear los comentarios al formato esperado por GoogleCommentsSection
    const mappedComments = selectedGoogleComments.map((c: any) => ({
      author_name: c.author || c.author_name || "",
      rating: typeof c.rating === "string" ? parseFloat(c.rating) : c.rating || 0,
      text: c.text || "",
      time: c.date || c.time || "",
      profile_photo_url: c.photo || c.profile_photo_url || "",
    }));
    // Save as JSON string in googleComments section
    const section = sections.find(s => s.type === "googleComments");
    if (section) {
      const updatedSections = sections.map(s =>
        s.id === section.id
          ? {
              ...s,
              props: {
                ...s.props,
                comments: JSON.stringify(mappedComments),
              },
            }
          : s
      );
      await saveLandingSections(updatedSections);
      setSections(updatedSections);
      // Also update selectedGoogleComments from saved section
      try {
        const parsed = JSON.parse(updatedSections.find(s => s.type === "googleComments")?.props?.comments || "[]");
        setSelectedGoogleComments(parsed);
      } catch {
        setSelectedGoogleComments([]);
      }
      console.log("[Admin] updatedSections googleComments:", updatedSections.find(s => s.type === "googleComments"));
    }
    setSaving(false);
    setShowGoogleCommentsModal(false);
    alert("Comentarios de Google guardados");
    console.log("[Admin] mappedComments:", mappedComments);
    // ...existing code...
    setSaving(false);
    setShowGoogleCommentsModal(false);
    alert("Comentarios de Google guardados");
  };

  // Abrir/cerrar modal de selección
  const openGoogleCommentsModal = () => setShowGoogleCommentsModal(true);
  const closeGoogleCommentsModal = () => setShowGoogleCommentsModal(false);

  // Seleccionar/deseleccionar comentarios
  const toggleGoogleComment = (comment: any) => {
    // Log antes y después de seleccionar/deseleccionar
    console.log("[Admin] toggleGoogleComment BEFORE:", selectedGoogleComments);
    // Usar el texto como clave única
    if (selectedGoogleComments.some((c) => c.text === comment.text)) {
      setSelectedGoogleComments(selectedGoogleComments.filter((c) => c.text !== comment.text));
      console.log("[Admin] toggleGoogleComment REMOVED:", comment);
    } else {
      if (selectedGoogleComments.length < 8) {
        setSelectedGoogleComments([...selectedGoogleComments, comment]);
        console.log("[Admin] toggleGoogleComment ADDED:", comment);
      } else {
        alert("Solo puedes seleccionar hasta 8 comentarios.");
      }
    }
    setTimeout(() => {
      console.log("[Admin] toggleGoogleComment AFTER:", selectedGoogleComments);
    }, 100);
  };
  // Abrir modal y cargar comentarios
  // (removed duplicate definition)
  // Cargar comentarios seleccionados desde sección al abrir modal
  useEffect(() => {
    if (showGoogleCommentsModal) {
      const section = sections.find(s => s.type === "googleComments");
      if (section && section.props && section.props.comments) {
        try {
          const parsed = JSON.parse(section.props.comments);
          // Unify photo property for modal display
          setSelectedGoogleComments(parsed.map((c: any) => ({
            ...c,
            photo: c.profile_photo_url || c.photo || "",
          })));
        } catch {
          setSelectedGoogleComments([]);
        }
      }
      // Log los comentarios cargados para seleccionar
      console.log("[Admin] googleComments for modal:", googleComments);
    }
  }, [showGoogleCommentsModal, sections]);

  /* ============================
     CARGA INICIAL
  ============================ */

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [landingData, prods] = await Promise.all([
        getLandingDraft(),
        obtenerProductos(),
      ]);

      setHero(landingData?.hero ?? null);

      // Guardamos todos los productos disponibles (inventario)
      setProductos(prods ?? []);
      setAllProductos(prods ?? []);

      // Resolver productos destacados del borrador (IDs -> objetos)
      const allProds = prods ?? [];
      const featuredIds: string[] = landingData?.featuredProducts || [];

      // 1) Tomamos los productos configurados explícitamente en la landing
      const explicitFeatured: any[] = featuredIds
        .map((id) => allProds.find((p) => p.id === id))
        .filter(Boolean);

      // 2) Sumamos cualquier producto marcado como destacado en el inventario
      //    que aún no esté en la lista explícita (unión inventario + landing).
      const explicitIds = new Set(explicitFeatured.map((p: any) => p.id));
      const fromInventory = allProds.filter(
        (p: any) => p.destacado && !explicitIds.has(p.id)
      );

      const initialFeatured: any[] = [...explicitFeatured, ...fromInventory];
      setFeaturedProducts(initialFeatured);

      // Migramos secciones antiguas (no JSON) al nuevo formato en memoria
      const rawSections: any[] = landingData?.sections ?? [];
      const migrated: Section[] = rawSections.map((s: any, index: number) => {
        if (s && s.props) return s as Section;

        const inferredType: SectionType = (s && s.type) || "banner";
        return {
          id: s.id || `section-${index}`,
          type: inferredType,
          props: {
            title: s.title,
            subtitle: s.subtitle,
            content: s.content,
            image: s.image || s.imageUrl || null,
          },
          styles: {},
          order: s.order ?? index + 1,
        };
      });
      setSections(migrated);

      setLoading(false);
    }

    fetchData();
  }, []);

  /* ============================
     HERO
  ============================ */

  const handleHeroChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!hero) return;
    setHero({ ...hero, [e.target.name]: e.target.value });
  };

  const handleHeroImage = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadLandingImage(file, "hero");
    setHero({ ...hero, image: url });
  };

  const saveHero = async () => {
    if (!hero) return;
    setSaving(true);
    await updateHero(hero);
    setSaving(false);
    alert("Hero actualizado");
  };

  // Productos destacados seleccionables y reordenables
  const destacadosDisponibles = allProductos.filter((p) => p.destacado);
    // Drag & drop para destacados
    const onDragEndFeatured = (result: DropResult) => {
      if (!result.destination) return;
      const updated = Array.from(featuredProducts);
      const [removed] = updated.splice(result.source.index, 1);
      updated.splice(result.destination.index, 0, removed);
      setFeaturedProducts(updated);
    };

    // Quitar producto de destacados
    const quitarDestacado = (id: string) => {
      setFeaturedProducts(featuredProducts.filter((p) => (p.id || p) !== id));
    };
  // Agregar producto a destacados
  const agregarDestacado = (prod: any) => {
    if (!featuredProducts.some((p) => (p.id || p) === (prod.id || prod))) {
      setFeaturedProducts([...featuredProducts, prod]);
    }
  };


  const handleSectionPropChange = async (
    idx: number,
    field: string,
    value: any
  ) => {
    const updated = [...sections];
    const current = updated[idx];
    const baseProps = {
      ...(current.props || {}),
      [field]: value,
    };

    // Si la sección es de tipo hero y ya tiene un array de items,
    // sincronizamos el primer item con los campos base para que
    // el "primer hero" y los heros agregados compartan estructura
    // y estilos.
    if (current.type === "hero" && Array.isArray(current.props?.items)) {
      const items = (current.props?.items as any[]) || [];
      const first = items[0] || {};
      const updatedFirst = {
        ...first,
        [field]: value,
      };
      baseProps.items = [updatedFirst, ...items.slice(1)];
    }

    updated[idx] = {
      ...current,
      props: baseProps,
    };
    setSections(updated);
    setSaving(true);
    await saveLandingSections(updated);
    setSaving(false);
  };

  const toggleSectionHidden = async (id: string) => {
    const updated = sections.map((s) =>
      s.id === id ? { ...s, hidden: !s.hidden } : s
    );
    setSections(updated);
    setSaving(true);
    await saveLandingSections(updated);
    setSaving(false);
  };

  const duplicateSection = async (idx: number) => {
    const original = sections[idx];
    if (!original) return;
    const clone: Section = {
      ...original,
      id: `section-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };
    const updated = [...sections];
    updated.splice(idx + 1, 0, clone);
    updated.forEach((s, i) => (s.order = i + 1));
    setSections(updated);
    setSaving(true);
    await saveLandingSections(updated);
    setSaving(false);
  };

  const handleSectionStyleChange = async (
    idx: number,
    field: string,
    value: any
  ) => {
    const updated = [...sections];
    const current = updated[idx];
    updated[idx] = {
      ...current,
      styles: {
        ...(current.styles || {}),
        [field]: value,
      },
    };
    setSections(updated);
    setSaving(true);
    await saveLandingSections(updated);
    setSaving(false);
  };
  const handleFieldStyleChange = async (
    idx: number,
    fieldName: string,
    styleKey: keyof import("../../lib/landing-types").LandingFieldStyle,
    value: any
  ) => {
    const updated = [...sections];
    const current = updated[idx];
    const currentFieldStyles = current.fieldStyles || {};
    const currentStyle = currentFieldStyles[fieldName] || {};
    updated[idx] = {
      ...current,
      fieldStyles: {
        ...currentFieldStyles,
        [fieldName]: {
          ...currentStyle,
          [styleKey]: value,
        },
      },
    };
    setSections(updated);
    setSaving(true);
    await saveLandingSections(updated);
    setSaving(false);
  };

  const updateHeroItems = async (
    sectionIndex: number,
    updater: (
      items: {
        title?: string;
        subtitle?: string;
        badge?: string;
        buttonText?: string;
        buttonLink?: string;
        image?: string | null;
        fieldStyles?: Record<
          string,
          import("../../lib/landing-types").LandingFieldStyle
        >;
      }[]
    ) => {
      title?: string;
      subtitle?: string;
      badge?: string;
      buttonText?: string;
      buttonLink?: string;
      image?: string | null;
      fieldStyles?: Record<
        string,
        import("../../lib/landing-types").LandingFieldStyle
      >;
    }[]
  ) => {
    const updated = [...sections];
    const current = updated[sectionIndex];
    if (!current) return;

    const currentItems = ((current.props?.items as any[]) || []) as {
      title?: string;
      subtitle?: string;
      badge?: string;
      buttonText?: string;
      buttonLink?: string;
      image?: string | null;
      fieldStyles?: Record<
        string,
        import("../../lib/landing-types").LandingFieldStyle
      >;
    }[];

    const newItems = updater(currentItems);

    updated[sectionIndex] = {
      ...current,
      props: {
        ...(current.props || {}),
        items: newItems,
      },
    };

    setSections(updated);
    setSaving(true);
    await saveLandingSections(updated);
    setSaving(false);
  };

  const handleAddHeroItem = async (sectionIndex: number) => {
    await updateHeroItems(sectionIndex, (items) => [
      ...items,
      {
        title: "",
        subtitle: "",
        badge: "",
        buttonText: "",
        buttonLink: "",
        image: null,
        fieldStyles: {},
      },
    ]);
  };

  const handleHeroItemFieldChange = async (
    sectionIndex: number,
    itemIndex: number,
    field: "title" | "subtitle" | "badge" | "buttonText" | "buttonLink",
    value: string
  ) => {
    await updateHeroItems(sectionIndex, (items) => {
      const copy = [...items];
      const current = copy[itemIndex] || {};
      copy[itemIndex] = { ...current, [field]: value };
      return copy;
    });
  };

  const handleHeroItemFieldStyleChange = async (
    sectionIndex: number,
    itemIndex: number,
    fieldName: string,
    styleKey: keyof import("../../lib/landing-types").LandingFieldStyle,
    value: any
  ) => {
    await updateHeroItems(sectionIndex, (items) => {
      const copy = [...items];
      const current = copy[itemIndex] || {};
      const currentFieldStyles = (current as any).fieldStyles || {};
      const currentStyle = currentFieldStyles[fieldName] || {};

      copy[itemIndex] = {
        ...current,
        fieldStyles: {
          ...currentFieldStyles,
          [fieldName]: {
            ...currentStyle,
            [styleKey]: value,
          },
        },
      } as any;

      return copy;
    });
  };

  const handleHeroItemImage = async (
    e: ChangeEvent<HTMLInputElement>,
    sectionIndex: number,
    itemIndex: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadLandingImage(
      file,
      `hero-${sectionIndex}-${itemIndex}`
    );

    await updateHeroItems(sectionIndex, (items) => {
      const copy = [...items];
      const current = copy[itemIndex] || {};
      copy[itemIndex] = { ...current, image: url };
      return copy;
    });
  };

  const handleRemoveHeroItem = async (
    sectionIndex: number,
    itemIndex: number
  ) => {
    await updateHeroItems(sectionIndex, (items) =>
      items.filter((_, idx) => idx !== itemIndex)
    );
  };

  const updateGalleryItems = async (
    sectionIndex: number,
    updater: (items: { title?: string; image?: string }[]) => {
      title?: string;
      image?: string;
    }[]
  ) => {
    const updated = [...sections];
    const current = updated[sectionIndex];
    if (!current) return;

    const currentItems = ((current.props?.items as any[]) || []) as {
      title?: string;
      image?: string;
    }[];

    const newItems = updater(currentItems);

    updated[sectionIndex] = {
      ...current,
      props: {
        ...(current.props || {}),
        items: newItems,
      },
    };

    setSections(updated);
    setSaving(true);
    await saveLandingSections(updated);
    setSaving(false);
  };

  const handleAddGalleryItem = async (sectionIndex: number) => {
    await updateGalleryItems(sectionIndex, (items) => [
      ...items,
      { title: "", image: "" },
    ]);
  };

  const handleGalleryItemTitleChange = async (
    sectionIndex: number,
    itemIndex: number,
    title: string
  ) => {
    await updateGalleryItems(sectionIndex, (items) => {
      const copy = [...items];
      const current = copy[itemIndex] || {};
      copy[itemIndex] = { ...current, title };
      return copy;
    });
  };

  const handleGalleryItemImage = async (
    e: ChangeEvent<HTMLInputElement>,
    sectionIndex: number,
    itemIndex: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadLandingImage(file, `gallery-${sectionIndex}-${itemIndex}`);

    await updateGalleryItems(sectionIndex, (items) => {
      const copy = [...items];
      const current = copy[itemIndex] || {};
      copy[itemIndex] = { ...current, image: url };
      return copy;
    });
  };

  const handleRemoveGalleryItem = async (
    sectionIndex: number,
    itemIndex: number
  ) => {
    await updateGalleryItems(sectionIndex, (items) =>
      items.filter((_, idx) => idx !== itemIndex)
    );
  };

  const scrollFeaturedList = (direction: "left" | "right") => {
    const container = featuredScrollRef.current;
    if (!container) return;
    const delta = direction === "left" ? -240 : 240;
    container.scrollBy({ left: delta, behavior: "smooth" });
  };
        {/* ADMIN DESTACADOS */}
        <div className="mb-10">
          <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
            <span className="material-icons-round text-purple-600">star</span>
            Productos destacados en landing
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-2 text-sm">Selecciona, reordena y publica los productos destacados que verán los clientes en la landing principal.</p>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Lista de seleccionables */}
            <div className="flex-1">
              <h3 className="font-semibold mb-2 text-sm">Seleccionar productos destacados</h3>
              <div className="grid grid-cols-2 gap-2">
                {destacadosDisponibles.map((prod) => (
                  <div key={prod.id} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-2">
                    <ProductoCard producto={prod} showCart={false} showEye={false} onClick={() => {}} onAddCart={() => {}} onEye={() => {}} />
                    <button
                      className="ml-2 px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
                      onClick={() => agregarDestacado(prod)}
                      disabled={featuredProducts.some((p) => (p.id || p) === prod.id)}
                    >
                      Agregar
                    </button>
                  </div>
                ))}
              </div>
            </div>
            {/* Lista de destacados actuales (drag & drop) */}
            <div className="flex-1">
              <h3 className="font-semibold mb-2 text-sm">Orden y publicación</h3>
              <DragDropContext onDragEnd={onDragEndFeatured}>
                <div className="relative">
                  {featuredProducts.length > 3 && (
                    <>
                      <button
                        type="button"
                        className="hidden md:flex items-center justify-center h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow absolute -left-3 top-1/2 -translate-y-1/2 hover:bg-slate-200 dark:hover:bg-slate-700"
                        onClick={() => scrollFeaturedList("left")}
                      >
                        <span className="material-icons-round text-sm">chevron_left</span>
                      </button>
                      <button
                        type="button"
                        className="hidden md:flex items-center justify-center h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow absolute -right-3 top-1/2 -translate-y-1/2 hover:bg-slate-200 dark:hover:bg-slate-700"
                        onClick={() => scrollFeaturedList("right")}
                      >
                        <span className="material-icons-round text-sm">chevron_right</span>
                      </button>
                    </>
                  )}

                  <Droppable droppableId="featured-droppable" direction="horizontal">
                    {(provided: import('react-beautiful-dnd').DroppableProvided) => (
                      <div
                        ref={(el) => {
                          featuredScrollRef.current = el;
                          provided.innerRef(el);
                        }}
                        {...provided.droppableProps}
                        className="flex items-stretch gap-3 overflow-x-auto pb-2 min-h-30"
                      >
                        {featuredProducts.map((prod, idx) => (
                          <Draggable
                            key={prod.id || prod}
                            draggableId={String(prod.id || prod)}
                            index={idx}
                          >
                            {(
                              provided: import("react-beautiful-dnd").DraggableProvided,
                              snapshot: import("react-beautiful-dnd").DraggableStateSnapshot
                            ) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`shrink-0 w-40 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-2 flex flex-col ${snapshot.isDragging ? "ring-2 ring-purple-400" : ""}`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span
                                    {...provided.dragHandleProps}
                                    className="material-icons-round cursor-move select-none text-slate-400 text-sm"
                                  >
                                    drag_indicator
                                  </span>
                                  <button
                                    className="text-xs px-2 py-0.5 bg-red-600 text-white rounded hover:bg-red-700"
                                    onClick={() => quitarDestacado(prod.id || prod)}
                                  >
                                    Quitar
                                  </button>
                                </div>
                                <div className="transform scale-90 origin-top">
                                  <ProductoCard
                                    producto={prod}
                                    showCart={false}
                                    showEye={false}
                                    onClick={() => {}}
                                    onAddCart={() => {}}
                                    onEye={() => {}}
                                  />
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              </DragDropContext>
              <button
                className="mt-4 px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-800 font-bold"
                disabled={saving}
                onClick={async () => {
                  setSaving(true);
                  // Guardar solo los IDs de los productos destacados (borrador)
                  await updateFeaturedProducts(
                    featuredProducts.map((p) => p.id || p)
                  );
                  setSaving(false);
                  alert("Productos destacados guardados en borrador");
                }}
              >
                Guardar destacados (borrador)
              </button>
            </div>
          </div>
        </div>

  const handleSectionImage = async (
    e: ChangeEvent<HTMLInputElement>,
    idx: number,
    fieldName: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadLandingImage(file, `section-${idx}`);

    const updated = [...sections];
    const current = updated[idx];
    updated[idx] = {
      ...current,
      props: {
        ...(current.props || {}),
        [fieldName]: url,
      },
    };

    setSections(updated);
    setSaving(true);
    await saveLandingSections(updated);
    setSaving(false);
  };

  const updateFeaturedCategoryItems = async (
    sectionIndex: number,
    updater: (
      items: {
        title?: string;
        image?: string | null;
        link?: string;
      }[]
    ) => {
      title?: string;
      image?: string | null;
      link?: string;
    }[]
  ) => {
    const updated = [...sections];
    const current = updated[sectionIndex];
    if (!current) return;

    const currentItems = ((current.props?.items as any[]) || []) as {
      title?: string;
      image?: string | null;
      link?: string;
    }[];

    const newItems = updater(currentItems);

    updated[sectionIndex] = {
      ...current,
      props: {
        ...(current.props || {}),
        items: newItems,
      },
    };

    setSections(updated);
    setSaving(true);
    await saveLandingSections(updated);
    setSaving(false);
  };

  const handleAddFeaturedCategoryItem = async (sectionIndex: number) => {
    await updateFeaturedCategoryItems(sectionIndex, (items) => [
      ...items,
      {
        title: "",
        image: null,
        link: "",
      },
    ]);
  };

  const handleFeaturedCategoryFieldChange = async (
    sectionIndex: number,
    itemIndex: number,
    field: "title" | "link",
    value: string
  ) => {
    await updateFeaturedCategoryItems(sectionIndex, (items) => {
      const copy = [...items];
      const current = copy[itemIndex] || {};
      copy[itemIndex] = { ...current, [field]: value };
      return copy;
    });
  };

  const handleFeaturedCategoryImage = async (
    e: ChangeEvent<HTMLInputElement>,
    sectionIndex: number,
    itemIndex: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadLandingImage(file, `featured-category-${sectionIndex}-${itemIndex}`);

    await updateFeaturedCategoryItems(sectionIndex, (items) => {
      const copy = [...items];
      const current = copy[itemIndex] || {};
      copy[itemIndex] = { ...current, image: url };
      return copy;
    });
  };

  const handleRemoveFeaturedCategoryItem = async (
    sectionIndex: number,
    itemIndex: number
  ) => {
    await updateFeaturedCategoryItems(sectionIndex, (items) =>
      items.filter((_, idx) => idx !== itemIndex)
    );
  };

  const removeSection = async (id: string) => {
    setSaving(true);
    await deleteSection(id);
    setSections((prev) => prev.filter((s) => s.id !== id));
    setSaving(false);
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const updated = Array.from(sections);
    const [removed] = updated.splice(result.source.index, 1);
    updated.splice(result.destination.index, 0, removed);

    updated.forEach((s, i) => (s.order = i + 1));

    setSections(updated);
    setSaving(true);
    await saveLandingSections(updated);
    setSaving(false);
  };

  const moveSection = async (idx: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? idx - 1 : idx + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const updated = [...sections];
    const [moved] = updated.splice(idx, 1);
    updated.splice(targetIndex, 0, moved);
    updated.forEach((s, i) => (s.order = i + 1));

    setSections(updated);
    setSaving(true);
    await saveLandingSections(updated);
    setSaving(false);
  };

  const openAddModal = (afterIdx: number | null = null) => {
    setAddAfterIndex(afterIdx);
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setAddAfterIndex(null);
  };

  const handleAddSectionType = (type: SectionType) => {
    const newSection = getDefaultSection(type);
    const updated = [...sections];

    if (addAfterIndex === null) {
      updated.push(newSection);
    } else {
      updated.splice(addAfterIndex + 1, 0, newSection);
    }

    updated.forEach((s, i) => (s.order = i + 1));
    setSections(updated);

    closeAddModal();
  };

  /* ============================
     RENDER
  ============================ */

  if (loading)
    return <div className="p-8 text-center">Cargando landing...</div>;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white p-6">
      <h1 className="text-2xl font-bold mb-6">Editor de Landing</h1>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        {/* Columna izquierda: editor */}
        <div>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable
              droppableId="sections"
              isDropDisabled={false}
              isCombineEnabled={false}
              ignoreContainerClipping={false}
            >
              {(provided: import("react-beautiful-dnd").DroppableProvided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {sections.map((section, idx) => {
                    const currentTab =
                      activeTabs[section.id] || ("content" as const);
                    return (
                    <Draggable key={section.id} draggableId={section.id} index={idx}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-4 mb-4 rounded shadow border border-slate-200 dark:border-slate-700"
                        >
                          <div className="flex items-start justify-between mb-3 gap-3">
                            <div>
                              <h3 className="font-bold text-sm mb-1">
                                {section.type
                                  ? String(section.type).toUpperCase()
                                  : "(Sin tipo)"}
                              </h3>
                              {section.hidden && (
                                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                  <span className="material-icons-round text-[14px]">
                                    visibility_off
                                  </span>
                                  Oculta en landing
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px]">
                              <button
                                type="button"
                                className="px-2 py-1 rounded border border-slate-200 hover:bg-slate-50 flex items-center gap-1"
                                onClick={() => toggleSectionHidden(section.id)}
                              >
                                <span className="material-icons-round text-[14px]">
                                  {section.hidden ? "visibility" : "visibility_off"}
                                </span>
                                {section.hidden ? "Mostrar" : "Ocultar"}
                              </button>
                              <button
                                type="button"
                                className="px-2 py-1 rounded border border-slate-200 hover:bg-slate-50 flex items-center gap-1"
                                onClick={() => duplicateSection(idx)}
                              >
                                <span className="material-icons-round text-[14px]">
                                  content_copy
                                </span>
                                Duplicar
                              </button>
                              <button
                                type="button"
                                className="px-1.5 py-1 rounded border border-slate-200 hover:bg-slate-50 flex items-center gap-1 disabled:opacity-40"
                                onClick={() => moveSection(idx, "up")}
                                disabled={idx === 0}
                                title="Mover sección hacia arriba"
                              >
                                <span className="material-icons-round text-[16px]">
                                  arrow_upward
                                </span>
                              </button>
                              <button
                                type="button"
                                className="px-1.5 py-1 rounded border border-slate-200 hover:bg-slate-50 flex items-center gap-1 disabled:opacity-40"
                                onClick={() => moveSection(idx, "down")}
                                disabled={idx === sections.length - 1}
                                title="Mover sección hacia abajo"
                              >
                                <span className="material-icons-round text-[16px]">
                                  arrow_downward
                                </span>
                              </button>
                            </div>
                          </div>

                          {/* Tabs Contenido / Estilos / Avanzado */}
                          <div className="flex gap-2 mb-3 text-[11px]">
                            {[
                              { id: "content", label: "Contenido" },
                              { id: "styles", label: "Estilos" },
                              { id: "advanced", label: "Avanzado" },
                            ].map((tab) => (
                              <button
                                key={tab.id}
                                type="button"
                                onClick={() =>
                                  setActiveTabs((prev) => ({
                                    ...prev,
                                    [section.id]:
                                      tab.id as
                                        | "content"
                                        | "styles"
                                        | "advanced",
                                  }))
                                }
                                className={`px-2 py-1 rounded-full border text-xs ${
                                  currentTab === tab.id
                                    ? "bg-purple-600 text-white border-purple-600"
                                    : "bg-slate-50 text-slate-600 border-slate-200"
                                }`}
                              >
                                {tab.label}
                              </button>
                            ))}
                          </div>

                          {/* Form builder dinámico basado en sectionSchemas */}
                          {(() => {
                            const schema = sectionSchemas[section.type];
                            if (!schema) return null;
                            const props = section.props || {};
                            const styles = section.styles || {};
                            const fieldStyles = section.fieldStyles || {};

                            const contentFields = schema.fields.filter(
                              (f: any) => !f.group || f.group === "content"
                            );
                            const styleFields = schema.fields.filter(
                              (f: any) => f.group === "styles"
                            );

                            return (
                              <div className="space-y-4">
                                {/* Contenido */}
                                {contentFields.length > 0 &&
                                  currentTab === "content" && (
                                  <div className="space-y-2">
                                    <h4 className="text-xs font-semibold uppercase text-slate-500">
                                      Contenido
                                    </h4>
                                    {contentFields.map((field: any) => {
                                      const value = props[field.name] ?? "";
                                      const isStylable = field.stylable;
                                      const isActiveField = activeFieldStyles[section.id] === field.name;
                                      const currentFieldStyle = fieldStyles[field.name] || {};

                                      // Checkbox Google Maps
                                      if (field.type === "boolean" && field.name === "googleMaps") {
                                        return (
                                          <div key={field.name} className="flex items-center gap-2 mb-2">
                                            <input
                                              type="checkbox"
                                              checked={!!props[field.name]}
                                              onChange={(e) =>
                                                handleSectionPropChange(
                                                  idx,
                                                  field.name,
                                                  e.target.checked
                                                )
                                              }
                                            />
                                            <label className="text-sm font-medium">{field.label}</label>
                                          </div>
                                        );
                                      }

                                      // Campos especiales Google Maps solo si el checkbox está activo
                                      if (field.showIf && field.showIf.googleMaps && !props.googleMaps) {
                                        return null;
                                      }

                                      if (field.type === "text" || field.type === "number") {
                                        return (
                                          <div key={field.name} className="space-y-1">
                                            <div className="flex items-center justify-between gap-2">
                                              <input
                                                className="flex-1 border p-2 text-sm rounded"
                                                placeholder={field.label}
                                                value={value}
                                                onChange={(e) =>
                                                  handleSectionPropChange(
                                                    idx,
                                                    field.name,
                                                    e.target.value
                                                  )
                                                }
                                              />
                                              {isStylable && (
                                                <button
                                                  type="button"
                                                  className={`ml-2 px-2 py-1 rounded border text-[11px] flex items-center gap-1 ${
                                                    isActiveField
                                                      ? "bg-purple-600 text-white border-purple-600"
                                                      : "bg-slate-50 text-slate-600 border-slate-200"
                                                  }`}
                                                  onClick={() =>
                                                    setActiveFieldStyles(
                                                      (prev) => ({
                                                        ...prev,
                                                        [section.id]: prev[section.id] ===
                                                          field.name
                                                            ? null
                                                            : field.name,
                                                      })
                                                    )
                                                  }
                                                >
                                                  <span className="material-icons-round text-[14px]">format_paint</span>
                                                  Estilos
                                                </button>
                                              )}
                                            </div>
                                            {isStylable && isActiveField && (
                                              <div className="mt-2 p-2 rounded border border-slate-200 bg-slate-50 flex flex-wrap items-center gap-2 text-[11px]">
                                                <div className="flex items-center gap-1">
                                                  <span className="text-slate-600">Color</span>
                                                  <input
                                                    type="color"
                                                    className="h-6 w-8 border rounded"
                                                    value={currentFieldStyle.color || "#000000"}
                                                    onChange={(e) =>
                                                      handleFieldStyleChange(
                                                        idx,
                                                        field.name,
                                                        "color",
                                                        e.target.value
                                                      )
                                                    }
                                                  />
                                                </div>
                                                <button
                                                  type="button"
                                                  className={`px-2 py-1 rounded border flex items-center gap-1 ${
                                                    currentFieldStyle.fontWeight ===
                                                    "bold"
                                                      ? "bg-slate-800 text-white border-slate-800"
                                                      : "bg-white text-slate-700 border-slate-300"
                                                  }`}
                                                  onClick={() =>
                                                    handleFieldStyleChange(
                                                      idx,
                                                      field.name,
                                                      "fontWeight",
                                                      currentFieldStyle.fontWeight ===
                                                        "bold"
                                                        ? "normal"
                                                        : "bold"
                                                    )
                                                  }
                                                >
                                                  <span className="material-icons-round text-[14px]">format_bold</span>
                                                </button>
                                                <button
                                                  type="button"
                                                  className={`px-2 py-1 rounded border flex items-center gap-1 ${
                                                    currentFieldStyle.fontStyle ===
                                                    "italic"
                                                      ? "bg-slate-800 text-white border-slate-800"
                                                      : "bg-white text-slate-700 border-slate-300"
                                                  }`}
                                                  onClick={() =>
                                                    handleFieldStyleChange(
                                                      idx,
                                                      field.name,
                                                      "fontStyle",
                                                      currentFieldStyle.fontStyle ===
                                                        "italic"
                                                        ? "normal"
                                                        : "italic"
                                                    )
                                                  }
                                                >
                                                  <span className="material-icons-round text-[14px]">format_italic</span>
                                                </button>
                                                <button
                                                  type="button"
                                                  className={`px-2 py-1 rounded border flex items-center gap-1 ${
                                                    currentFieldStyle.textDecoration ===
                                                    "underline"
                                                      ? "bg-slate-800 text-white border-slate-800"
                                                      : "bg-white text-slate-700 border-slate-300"
                                                  }`}
                                                  onClick={() =>
                                                    handleFieldStyleChange(
                                                      idx,
                                                      field.name,
                                                      "textDecoration",
                                                      currentFieldStyle.textDecoration ===
                                                        "underline"
                                                        ? "none"
                                                        : "underline"
                                                    )
                                                  }
                                                >
                                                  <span className="material-icons-round text-[14px]">format_underlined</span>
                                                </button>
                                                <div className="flex items-center gap-1">
                                                  <span className="text-slate-600">Tamaño</span>
                                                  <input
                                                    type="text"
                                                    className="w-16 border rounded px-1 py-0.5 text-[11px]"
                                                    placeholder="16px"
                                                    value={currentFieldStyle.fontSize || ""}
                                                    onChange={(e) =>
                                                      handleFieldStyleChange(
                                                        idx,
                                                        field.name,
                                                        "fontSize",
                                                        e.target.value
                                                      )
                                                    }
                                                  />
                                                </div>
                                                {(field.name === "badge" ||
                                                  field.name ===
                                                    "buttonText") && (
                                                  <>
                                                    <div className="flex items-center gap-1">
                                                      <span className="text-slate-600">Fondo contenedor</span>
                                                      <input
                                                        type="color"
                                                        className="h-6 w-8 border rounded"
                                                        value={currentFieldStyle.backgroundColor || "#000000"}
                                                        onChange={(e) =>
                                                          handleFieldStyleChange(
                                                            idx,
                                                            field.name,
                                                            "backgroundColor",
                                                            e.target.value
                                                          )
                                                        }
                                                      />
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                      <span className="text-slate-600">Border radius</span>
                                                      <input
                                                        type="text"
                                                        className="w-20 border rounded px-1 py-0.5 text-[11px]"
                                                        placeholder="9999px"
                                                        value={currentFieldStyle.borderRadius || ""}
                                                        onChange={(e) =>
                                                          handleFieldStyleChange(
                                                            idx,
                                                            field.name,
                                                            "borderRadius",
                                                            e.target.value
                                                          )
                                                        }
                                                      />
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                      <span className="text-slate-600">Padding X</span>
                                                      <input
                                                        type="text"
                                                        className="w-16 border rounded px-1 py-0.5 text-[11px]"
                                                        placeholder="12px"
                                                        value={currentFieldStyle.paddingInline || ""}
                                                        onChange={(e) =>
                                                          handleFieldStyleChange(
                                                            idx,
                                                            field.name,
                                                            "paddingInline",
                                                            e.target.value
                                                          )
                                                        }
                                                      />
                                                      <span className="text-slate-600">Y</span>
                                                      <input
                                                        type="text"
                                                        className="w-16 border rounded px-1 py-0.5 text-[11px]"
                                                        placeholder="6px"
                                                        value={currentFieldStyle.paddingBlock || ""}
                                                        onChange={(e) =>
                                                          handleFieldStyleChange(
                                                            idx,
                                                            field.name,
                                                            "paddingBlock",
                                                            e.target.value
                                                          )
                                                        }
                                                      />
                                                    </div>
                                                  </>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      }

                                      if (field.type === "textarea") {
                                        return (
                                          <div key={field.name} className="space-y-1">
                                            <div className="flex items-center justify-between gap-2">
                                              <textarea
                                                className="flex-1 border p-2 text-sm rounded"
                                                placeholder={field.label}
                                                value={value}
                                                onChange={(e) =>
                                                  handleSectionPropChange(
                                                    idx,
                                                    field.name,
                                                    e.target.value
                                                  )
                                                }
                                              />
                                              {isStylable && (
                                                <button
                                                  type="button"
                                                  className={`ml-2 px-2 py-1 rounded border text-[11px] flex items-center gap-1 ${
                                                    isActiveField
                                                      ? "bg-purple-600 text-white border-purple-600"
                                                      : "bg-slate-50 text-slate-600 border-slate-200"
                                                  }`}
                                                  onClick={() =>
                                                    setActiveFieldStyles(
                                                      (prev) => ({
                                                        ...prev,
                                                        [section.id]: prev[section.id] ===
                                                          field.name
                                                            ? null
                                                            : field.name,
                                                      })
                                                    )
                                                  }
                                                >
                                                  <span className="material-icons-round text-[14px]">format_paint</span>
                                                  Estilos
                                                </button>
                                              )}
                                            </div>
                                            {/* Botón para abrir modal de selección de comentarios Google Maps */}
                                            <div className="mt-2">
                                              <button
                                                className="bg-blue-600 text-white px-4 py-2 rounded"
                                                type="button"
                                                onClick={openGoogleCommentsModal}
                                              >
                                                Seleccionar comentarios de Google Maps
                                              </button>
                                            </div>
                                            {/* Google Comments Modal Fragment */}
                                            {showGoogleCommentsModal && (
                                              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                                                <div className="bg-white dark:bg-slate-900 p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                                                  <div className="flex justify-between items-center mb-4">
                                                    <h2 className="font-bold text-lg">Selecciona hasta 6 comentarios de Google Maps</h2>
                                                    <button className="text-slate-500 hover:text-slate-800" onClick={closeGoogleCommentsModal}>
                                                      <span className="material-icons-round">close</span>
                                                    </button>
                                                  </div>
                                                  {googleCommentsLoading ? (
                                                    <div className="text-center text-slate-500 py-8">Cargando comentarios...</div>
                                                  ) : (
                                                    <div className="grid gap-4 md:grid-cols-2">
                                                      {googleComments.slice(0, 5).map((c, idx) => {
                                                        const selected = selectedGoogleComments.some((sc) => sc.text === c.text);
                                                        const canSelect = selectedGoogleComments.length < 6 || selected;
                                                        return (
                                                          <div
                                                            key={c.text || idx}
                                                            className={`bg-white dark:bg-slate-900 rounded-xl p-4 shadow border border-slate-200 dark:border-slate-700 flex flex-col relative ${selected ? 'ring-2 ring-purple-500' : ''} ${!canSelect ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                            onClick={() => canSelect && toggleGoogleComment(c)}
                                                            style={{ cursor: canSelect ? 'pointer' : 'not-allowed' }}
                                                          >
                                                            <div className="flex items-center mb-2">
                                                              {c.photo ? (
                                                                <img src={c.photo} alt={c.author} className="w-10 h-10 rounded-full mr-3 border border-slate-300" />
                                                              ) : (
                                                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 border border-slate-300">
                                                                  <span className="material-icons-round">person</span>
                                                                </div>
                                                              )}
                                                              <div className="flex flex-col">
                                                                <span className="font-semibold text-base">{c.author}</span>
                                                                <span className="text-xs text-slate-500">{c.date || ''}</span>
                                                              </div>
                                                              <div className="ml-auto flex items-center gap-1">
                                                                {[1,2,3,4,5].map(i => (
                                                                  <span key={i} className={i <= parseInt(c.rating) ? "text-yellow-400" : "text-slate-300"}>
                                                                    <span className="material-icons-round">star</span>
                                                                  </span>
                                                                ))}
                                                              </div>
                                                            </div>
                                                            <div className="text-sm text-slate-700 dark:text-slate-200 mb-2 mt-2">
                                                              {c.text}
                                                            </div>
                                                            <input
                                                              type="checkbox"
                                                              checked={selected}
                                                              readOnly
                                                              className="absolute top-2 right-2"
                                                              style={{ pointerEvents: 'none' }}
                                                            />
                                                          </div>
                                                        );
                                                      })}
                                                    </div>
                                                  )}
                                                  <div className="mt-4 flex justify-end gap-2">
                                                    <button className="bg-slate-200 px-4 py-2 rounded" onClick={closeGoogleCommentsModal}>Cancelar</button>
                                                    <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={saveSelectedGoogleComments}>Guardar selección</button>
                                                  </div>
                                                  <div className="mt-2 text-xs text-slate-500">Puedes seleccionar hasta 6 comentarios para mostrar en la landing page.</div>
                                                </div>
                                              </div>
                                            )}
                                            {isStylable && isActiveField && (
                                              <div className="mt-2 p-2 rounded border border-slate-200 bg-slate-50 flex flex-wrap items-center gap-2 text-[11px]">
                                                <div className="flex items-center gap-1">
                                                  <span className="text-slate-600">Color</span>
                                                  <input
                                                    type="color"
                                                    className="h-6 w-8 border rounded"
                                                    value={currentFieldStyle.color || "#000000"}
                                                    onChange={(e) =>
                                                      handleFieldStyleChange(
                                                        idx,
                                                        field.name,
                                                        "color",
                                                        e.target.value
                                                      )
                                                    }
                                                  />
                                                </div>
                                                <button
                                                  type="button"
                                                  className={`px-2 py-1 rounded border flex items-center gap-1 ${
                                                    currentFieldStyle.fontWeight ===
                                                    "bold"
                                                      ? "bg-slate-800 text-white border-slate-800"
                                                      : "bg-white text-slate-700 border-slate-300"
                                                  }`}
                                                  onClick={() =>
                                                    handleFieldStyleChange(
                                                      idx,
                                                      field.name,
                                                      "fontWeight",
                                                      currentFieldStyle.fontWeight ===
                                                        "bold"
                                                        ? "normal"
                                                        : "bold"
                                                    )
                                                  }
                                                >
                                                  <span className="material-icons-round text-[14px]">format_bold</span>
                                                </button>
                                                <button
                                                  type="button"
                                                  className={`px-2 py-1 rounded border flex items-center gap-1 ${
                                                    currentFieldStyle.fontStyle ===
                                                    "italic"
                                                      ? "bg-slate-800 text-white border-slate-800"
                                                      : "bg-white text-slate-700 border-slate-300"
                                                  }`}
                                                  onClick={() =>
                                                    handleFieldStyleChange(
                                                      idx,
                                                      field.name,
                                                      "fontStyle",
                                                      currentFieldStyle.fontStyle ===
                                                        "italic"
                                                        ? "normal"
                                                        : "italic"
                                                    )
                                                  }
                                                >
                                                  <span className="material-icons-round text-[14px]">format_italic</span>
                                                </button>
                                                <button
                                                  type="button"
                                                  className={`px-2 py-1 rounded border flex items-center gap-1 ${
                                                    currentFieldStyle.textDecoration ===
                                                    "underline"
                                                      ? "bg-slate-800 text-white border-slate-800"
                                                      : "bg-white text-slate-700 border-slate-300"
                                                  }`}
                                                  onClick={() =>
                                                    handleFieldStyleChange(
                                                      idx,
                                                      field.name,
                                                      "textDecoration",
                                                      currentFieldStyle.textDecoration ===
                                                        "underline"
                                                        ? "none"
                                                        : "underline"
                                                    )
                                                  }
                                                >
                                                  <span className="material-icons-round text-[14px]">format_underlined</span>
                                                </button>
                                                <div className="flex items-center gap-1">
                                                  <span className="text-slate-600">Tamaño</span>
                                                  <input
                                                    type="text"
                                                    className="w-16 border rounded px-1 py-0.5 text-[11px]"
                                                    placeholder="16px"
                                                    value={currentFieldStyle.fontSize || ""}
                                                    onChange={(e) =>
                                                      handleFieldStyleChange(
                                                        idx,
                                                        field.name,
                                                        "fontSize",
                                                        e.target.value
                                                      )
                                                    }
                                                  />
                                                  
                                                </div>
                                                {(field.name === "badge" ||
                                                  field.name ===
                                                    "buttonText") && (
                                                  <>
                                                    <div className="flex items-center gap-1">
                                                      <span className="text-slate-600">Fondo contenedor</span>
                                                      <input
                                                        type="color"
                                                        className="h-6 w-8 border rounded"
                                                        value={currentFieldStyle.backgroundColor || "#000000"}
                                                        onChange={(e) =>
                                                          handleFieldStyleChange(
                                                            idx,
                                                            field.name,
                                                            "backgroundColor",
                                                            e.target.value
                                                          )
                                                        }
                                                      />
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                      <span className="text-slate-600">Border radius</span>
                                                      <input
                                                        type="text"
                                                        className="w-20 border rounded px-1 py-0.5 text-[11px]"
                                                        placeholder="9999px"
                                                        value={currentFieldStyle.borderRadius || ""}
                                                        onChange={(e) =>
                                                          handleFieldStyleChange(
                                                            idx,
                                                            field.name,
                                                            "borderRadius",
                                                            e.target.value
                                                          )
                                                        }
                                                      />
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                      <span className="text-slate-600">Padding X</span>
                                                      <input
                                                        type="text"
                                                        className="w-16 border rounded px-1 py-0.5 text-[11px]"
                                                        placeholder="12px"
                                                        value={currentFieldStyle.paddingInline || ""}
                                                        onChange={(e) =>
                                                          handleFieldStyleChange(
                                                            idx,
                                                            field.name,
                                                            "paddingInline",
                                                            e.target.value
                                                          )
                                                        }
                                                      />
                                                      <span className="text-slate-600">Y</span>
                                                      <input
                                                        type="text"
                                                        className="w-16 border rounded px-1 py-0.5 text-[11px]"
                                                        placeholder="6px"
                                                        value={currentFieldStyle.paddingBlock || ""}
                                                        onChange={(e) =>
                                                          handleFieldStyleChange(
                                                            idx,
                                                            field.name,
                                                            "paddingBlock",
                                                            e.target.value
                                                          )
                                                        }
                                                      />
                                                    </div>
                                                  </>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      }

                                      if (field.type === "image") {
                                        return (
                                          <div key={field.name} className="space-y-1">
                                            <label className="block text-xs text-slate-500">
                                              {field.label}
                                            </label>
                                            <input
                                              type="file"
                                              onChange={(e) =>
                                                handleSectionImage(
                                                  e,
                                                  idx,
                                                  field.name
                                                )
                                              }
                                            />
                                          </div>
                                        );
                                      }
                                      return null;
                                    })}
                                  </div>
                                )}

                                {/* Vista rápida de productos destacados para esta sección */}
                                {section.type === "featuredProducts" &&
                                  currentTab === "content" && (
                                    <div className="mt-3 border border-dashed border-slate-200 rounded-md p-3 bg-slate-50 dark:bg-slate-900">
                                      <h4 className="text-xs font-semibold uppercase text-slate-500 mb-2 flex items-center gap-1">
                                        <span className="material-icons-round text-[14px] text-purple-500">
                                          star
                                        </span>
                                        Productos destacados vinculados
                                      </h4>
                                      {featuredProducts.length === 0 ? (
                                        <p className="text-[11px] text-slate-500">
                                          No hay productos destacados configurados aún.
                                          Marca productos como destacados en el inventario
                                          y/o usa el panel "Productos destacados en landing"
                                          de más arriba para seleccionarlos.
                                        </p>
                                      ) : (
                                        <div className="flex items-stretch gap-3 overflow-x-auto pb-1">
                                          {featuredProducts.map((prod: any) => (
                                            <div
                                              key={prod.id || String(prod)}
                                              className="relative group shrink-0 w-40"
                                            >
                                              <div className="transform scale-90 origin-top">
                                                <ProductoCard
                                                  producto={prod}
                                                  showCart={false}
                                                  showEye={false}
                                                  onClick={() => {}}
                                                  onAddCart={() => {}}
                                                  onEye={() => {}}
                                                />
                                              </div>
                                              <button
                                                type="button"
                                                className="absolute top-1 right-1 px-1.5 py-0.5 rounded-full text-[10px] bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() =>
                                                  quitarDestacado(
                                                    prod.id || (prod as any)
                                                  )
                                                }
                                              >
                                                Quitar
                                              </button>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}

                                {/* Editor de items para secciones de galería */}
                                {section.type === "gallery" &&
                                  currentTab === "content" && (
                                    <div className="mt-3 border border-dashed border-slate-200 rounded-md p-3 bg-slate-50 dark:bg-slate-900">
                                      <h4 className="text-xs font-semibold uppercase text-slate-500 mb-2 flex items-center gap-1">
                                        <span className="material-icons-round text-[14px] text-purple-500">
                                          collections
                                        </span>
                                        Items de galería (título + logo)
                                      </h4>
                                      {(() => {
                                        const galleryItems = ((section.props?.items as any[]) || []) as {
                                          title?: string;
                                          image?: string;
                                        }[];

                                        if (!galleryItems.length) {
                                          return (
                                            <div className="space-y-2">
                                              <p className="text-[11px] text-slate-500">
                                                No hay items aún. Agrega logos de distribuidores u otras imágenes
                                                usando el botón de abajo.
                                              </p>
                                              <button
                                                type="button"
                                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-purple-600 text-white text-xs hover:bg-purple-700"
                                                onClick={() => handleAddGalleryItem(idx)}
                                              >
                                                <span className="material-icons-round text-[14px]">
                                                  add
                                                </span>
                                                Agregar item
                                              </button>
                                            </div>
                                          );
                                        }

                                        return (
                                          <>
                                            <div className="flex items-stretch gap-3 overflow-x-auto pb-2">
                                              {galleryItems.map((item, itemIndex) => (
                                                <div
                                                  key={itemIndex}
                                                  className="shrink-0 w-56 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-2 flex flex-col gap-2"
                                                >
                                                  <div className="flex items-center justify-between gap-2">
                                                    <span className="text-[11px] font-semibold text-slate-500">
                                                      Item {itemIndex + 1}
                                                    </span>
                                                    <button
                                                      type="button"
                                                      className="text-[10px] px-2 py-0.5 rounded bg-red-600 text-white hover:bg-red-700"
                                                      onClick={() => handleRemoveGalleryItem(idx, itemIndex)}
                                                    >
                                                      Quitar
                                                    </button>
                                                  </div>
                                                  <input
                                                    type="text"
                                                    className="border rounded px-2 py-1 text-xs"
                                                    placeholder="Título (opcional)"
                                                    value={item.title || ""}
                                                    onChange={(e) =>
                                                      handleGalleryItemTitleChange(
                                                        idx,
                                                        itemIndex,
                                                        e.target.value
                                                      )
                                                    }
                                                  />
                                                  <div className="space-y-1">
                                                    {item.image && (
                                                      <div className="aspect-video rounded-md overflow-hidden bg-slate-100 dark:bg-slate-800">
                                                        <img
                                                          src={item.image}
                                                          alt={item.title || "Logo"}
                                                          className="w-full h-full object-contain p-2"
                                                        />
                                                      </div>
                                                    )}
                                                    <input
                                                      type="file"
                                                      accept="image/*"
                                                      className="text-[11px]"
                                                      onChange={(e) =>
                                                        handleGalleryItemImage(
                                                          e,
                                                          idx,
                                                          itemIndex
                                                        )
                                                      }
                                                    />
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                            <button
                                              type="button"
                                              className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 rounded bg-purple-600 text-white text-xs hover:bg-purple-700"
                                              onClick={() => handleAddGalleryItem(idx)}
                                            >
                                              <span className="material-icons-round text-[14px]">
                                                add
                                              </span>
                                              Agregar otro item
                                            </button>
                                            <div className="mt-3 p-2 rounded border border-slate-200 bg-slate-50 text-[11px] space-y-2">
                                              <div className="flex items-center gap-1">
                                                <span className="material-icons-round text-[14px] text-purple-500">
                                                  format_paint
                                                </span>
                                                <span className="font-semibold text-slate-600">
                                                  Estilos de títulos de items
                                                </span>
                                              </div>
                                              {(() => {
                                                const currentFieldStyle =
                                                  (section.fieldStyles &&
                                                    (section.fieldStyles as any)
                                                      .itemTitle) || {};
                                                return (
                                                  <div className="flex flex-wrap items-center gap-2">
                                                    <div className="flex items-center gap-1">
                                                      <span className="text-slate-600">
                                                        Color
                                                      </span>
                                                      <input
                                                        type="color"
                                                        className="h-6 w-8 border rounded"
                                                        value={
                                                          currentFieldStyle.color ||
                                                          "#000000"
                                                        }
                                                        onChange={(e) =>
                                                          handleFieldStyleChange(
                                                            idx,
                                                            "itemTitle",
                                                            "color",
                                                            e.target.value
                                                          )
                                                        }
                                                      />
                                                    </div>
                                                    <button
                                                      type="button"
                                                      className={`px-2 py-1 rounded border flex items-center gap-1 ${
                                                        currentFieldStyle.fontWeight ===
                                                        "bold"
                                                          ? "bg-slate-800 text-white border-slate-800"
                                                          : "bg-white text-slate-700 border-slate-300"
                                                      }`}
                                                      onClick={() =>
                                                        handleFieldStyleChange(
                                                          idx,
                                                          "itemTitle",
                                                          "fontWeight",
                                                          currentFieldStyle.fontWeight ===
                                                            "bold"
                                                            ? "normal"
                                                            : "bold"
                                                        )
                                                      }
                                                    >
                                                      <span className="material-icons-round text-[14px]">
                                                        format_bold
                                                      </span>
                                                    </button>
                                                    <button
                                                      type="button"
                                                      className={`px-2 py-1 rounded border flex items-center gap-1 ${
                                                        currentFieldStyle.fontStyle ===
                                                        "italic"
                                                          ? "bg-slate-800 text-white border-slate-800"
                                                          : "bg-white text-slate-700 border-slate-300"
                                                      }`}
                                                      onClick={() =>
                                                        handleFieldStyleChange(
                                                          idx,
                                                          "itemTitle",
                                                          "fontStyle",
                                                          currentFieldStyle.fontStyle ===
                                                            "italic"
                                                            ? "normal"
                                                            : "italic"
                                                        )
                                                      }
                                                    >
                                                      <span className="material-icons-round text-[14px]">
                                                        format_italic
                                                      </span>
                                                    </button>
                                                    <button
                                                      type="button"
                                                      className={`px-2 py-1 rounded border flex items-center gap-1 ${
                                                        currentFieldStyle.textDecoration ===
                                                        "underline"
                                                          ? "bg-slate-800 text-white border-slate-800"
                                                          : "bg-white text-slate-700 border-slate-300"
                                                      }`}
                                                      onClick={() =>
                                                        handleFieldStyleChange(
                                                          idx,
                                                          "itemTitle",
                                                          "textDecoration",
                                                          currentFieldStyle.textDecoration ===
                                                            "underline"
                                                            ? "none"
                                                            : "underline"
                                                        )
                                                      }
                                                    >
                                                      <span className="material-icons-round text-[14px]">
                                                        format_underlined
                                                      </span>
                                                    </button>
                                                    <div className="flex items-center gap-1">
                                                      <span className="text-slate-600">
                                                        Tamaño
                                                      </span>
                                                      <input
                                                        type="text"
                                                        className="w-16 border rounded px-1 py-0.5 text-[11px]"
                                                        placeholder="16px"
                                                        value={
                                                          currentFieldStyle
                                                            .fontSize || ""
                                                        }
                                                        onChange={(e) =>
                                                          handleFieldStyleChange(
                                                            idx,
                                                            "itemTitle",
                                                            "fontSize",
                                                            e.target.value
                                                          )
                                                        }
                                                      />
                                                    </div>
                                                  </div>
                                                );
                                              })()}
                                            </div>
                                          </>
                                        );
                                      })()}
                                    </div>
                                  )}

                                {/* Editor de categorías destacadas */}
                                {section.type === "featuredCategories" &&
                                  currentTab === "content" && (
                                    <div className="mt-3 border border-dashed border-slate-200 rounded-md p-3 bg-slate-50 dark:bg-slate-900">
                                      <h4 className="text-xs font-semibold uppercase text-slate-500 mb-2 flex items-center gap-1">
                                        <span className="material-icons-round text-[14px] text-purple-500">
                                          category
                                        </span>
                                        Categorías destacadas
                                      </h4>
                                      {(() => {
                                        const items = ((section.props?.items as any[]) || []) as {
                                          title?: string;
                                          image?: string | null;
                                          link?: string;
                                        }[];

                                        if (!items.length) {
                                          return (
                                            <div className="space-y-2">
                                              <p className="text-[11px] text-slate-500">
                                                No hay categorías aún. Crea la primera categoría destacada con título, imagen y enlace.
                                              </p>
                                              <button
                                                type="button"
                                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-purple-600 text-white text-xs hover:bg-purple-700"
                                                onClick={() => handleAddFeaturedCategoryItem(idx)}
                                              >
                                                <span className="material-icons-round text-[14px]">
                                                  add
                                                </span>
                                                Agregar categoría
                                              </button>
                                            </div>
                                          );
                                        }

                                        return (
                                          <>
                                            <div className="flex items-stretch gap-3 overflow-x-auto pb-2">
                                              {items.map((item, itemIndex) => (
                                                <div
                                                  key={itemIndex}
                                                  className="shrink-0 w-64 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-3 flex flex-col gap-2"
                                                >
                                                  <div className="flex items-center justify-between gap-2 mb-1">
                                                    <span className="text-[11px] font-semibold text-slate-500">
                                                      Categoría {itemIndex + 1}
                                                    </span>
                                                    <button
                                                      type="button"
                                                      className="text-[10px] px-2 py-0.5 rounded bg-red-600 text-white hover:bg-red-700"
                                                      onClick={() =>
                                                        handleRemoveFeaturedCategoryItem(
                                                          idx,
                                                          itemIndex
                                                        )
                                                      }
                                                    >
                                                      Quitar
                                                    </button>
                                                  </div>
                                                  <input
                                                    type="text"
                                                    className="border rounded px-2 py-1 text-xs"
                                                    placeholder="Título de la categoría"
                                                    value={item.title || ""}
                                                    onChange={(e) =>
                                                      handleFeaturedCategoryFieldChange(
                                                        idx,
                                                        itemIndex,
                                                        "title",
                                                        e.target.value
                                                      )
                                                    }
                                                  />
                                                  <input
                                                    type="text"
                                                    className="border rounded px-2 py-1 text-xs"
                                                    placeholder="Enlace (ruta interna, ej: /products-by-category)"
                                                    value={item.link || ""}
                                                    onChange={(e) =>
                                                      handleFeaturedCategoryFieldChange(
                                                        idx,
                                                        itemIndex,
                                                        "link",
                                                        e.target.value
                                                      )
                                                    }
                                                  />
                                                  <div className="space-y-1 mt-1">
                                                    {item.image && (
                                                      <div className="aspect-video rounded-md overflow-hidden bg-slate-100 dark:bg-slate-800">
                                                        <img
                                                          src={item.image}
                                                          alt={item.title || "Categoría"}
                                                          className="w-full h-full object-cover"
                                                        />
                                                      </div>
                                                    )}
                                                    <input
                                                      type="file"
                                                      accept="image/*"
                                                      className="text-[11px]"
                                                      onChange={(e) =>
                                                        handleFeaturedCategoryImage(
                                                          e,
                                                          idx,
                                                          itemIndex
                                                        )
                                                      }
                                                    />
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                            <button
                                              type="button"
                                              className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 rounded bg-purple-600 text-white text-xs hover:bg-purple-700"
                                              onClick={() => handleAddFeaturedCategoryItem(idx)}
                                            >
                                              <span className="material-icons-round text-[14px]">
                                                add
                                              </span>
                                              Agregar otra categoría
                                            </button>
                                          </>
                                        );
                                      })()}
                                    </div>
                                  )}

                                {/* Editor de variantes para secciones Hero */}
                                {section.type === "hero" &&
                                  currentTab === "content" && (
                                    <div className="mt-3 border border-dashed border-slate-200 rounded-md p-3 bg-slate-50 dark:bg-slate-900">
                                      <h4 className="text-xs font-semibold uppercase text-slate-500 mb-2 flex items-center gap-1">
                                        <span className="material-icons-round text-[14px] text-purple-500">
                                          slideshow
                                        </span>
                                        Variantes de hero (carrusel)
                                      </h4>
                                      {(() => {
                                        const heroItems = ((section.props?.items as any[]) || []) as {
                                          title?: string;
                                          subtitle?: string;
                                          badge?: string;
                                          buttonText?: string;
                                          buttonLink?: string;
                                          image?: string | null;
                                          fieldStyles?: Record<
                                            string,
                                            import("../../lib/landing-types").LandingFieldStyle
                                          >;
                                        }[];

                                        if (!heroItems.length) {
                                          return (
                                            <div className="space-y-2">
                                              <p className="text-[11px] text-slate-500">
                                                No hay variantes aún. Puedes crear varios heros (título, subtítulo,
                                                badge, botón e imagen) que se mostrarán uno a la vez cada 5 segundos
                                                en la landing.
                                              </p>
                                              <button
                                                type="button"
                                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-purple-600 text-white text-xs hover:bg-purple-700"
                                                onClick={() => handleAddHeroItem(idx)}
                                              >
                                                <span className="material-icons-round text-[14px]">
                                                  add
                                                </span>
                                                Agregar hero
                                              </button>
                                            </div>
                                          );
                                        }

                                        return (
                                          <>
                                            <div className="flex items-stretch gap-3 overflow-x-auto pb-2">
                                              {heroItems.map((item, itemIndex) => (
                                                <div
                                                  key={itemIndex}
                                                  className="shrink-0 w-72 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-3 flex flex-col gap-2"
                                                >
                                                  {(() => {
                                                    const active =
                                                      activeHeroItemFieldStyles[section.id];
                                                    const isActive =
                                                      !!active &&
                                                      active.index === itemIndex;
                                                    const itemFieldStyles =
                                                      (item.fieldStyles || {}) as Record<
                                                        string,
                                                        import("../../lib/landing-types").LandingFieldStyle
                                                      >;

                                                    const renderFieldWithStyles = (
                                                      fieldLabel: string,
                                                      fieldName: string,
                                                      control: React.ReactNode
                                                    ) => {
                                                      const isThisFieldActive =
                                                        isActive &&
                                                        active?.fieldName === fieldName;
                                                      const currentFieldStyle =
                                                        itemFieldStyles[fieldName] || {};

                                                      return (
                                                        <div className="space-y-1">
                                                          <div className="flex items-center justify-between gap-2">
                                                            <div className="flex-1 flex flex-col gap-1">
                                                              {control}
                                                            </div>
                                                            <button
                                                              type="button"
                                                              className={`ml-2 px-2 py-1 rounded border text-[11px] flex items-center gap-1 ${
                                                                isThisFieldActive
                                                                  ? "bg-purple-600 text-white border-purple-600"
                                                                  : "bg-slate-50 text-slate-600 border-slate-200"
                                                              }`}
                                                              onClick={() =>
                                                                setActiveHeroItemFieldStyles(
                                                                  (prev) => ({
                                                                    ...prev,
                                                                    [section.id]:
                                                                      prev[section.id] &&
                                                                      prev[section.id]?.index ===
                                                                        itemIndex &&
                                                                      prev[section.id]?.fieldName ===
                                                                        fieldName
                                                                        ? null
                                                                        : {
                                                                            index: itemIndex,
                                                                            fieldName,
                                                                          },
                                                                  })
                                                                )
                                                              }
                                                            >
                                                              <span className="material-icons-round text-[14px]">
                                                                format_paint
                                                              </span>
                                                              Estilos
                                                            </button>
                                                          </div>
                                                          {isThisFieldActive && (
                                                            <div className="mt-1 p-2 rounded border border-slate-200 bg-slate-50 flex flex-wrap items-center gap-2 text-[11px]">
                                                              <div className="flex items-center gap-1">
                                                                <span className="text-slate-600">
                                                                  Color
                                                                </span>
                                                                <input
                                                                  type="color"
                                                                  className="h-6 w-8 border rounded"
                                                                  value={
                                                                    currentFieldStyle.color ||
                                                                    "#000000"
                                                                  }
                                                                  onChange={(e) =>
                                                                    handleHeroItemFieldStyleChange(
                                                                      idx,
                                                                      itemIndex,
                                                                      fieldName,
                                                                      "color",
                                                                      e.target.value
                                                                    )
                                                                  }
                                                                />
                                                              </div>
                                                              <button
                                                                type="button"
                                                                className={`px-2 py-1 rounded border flex items-center gap-1 ${
                                                                  currentFieldStyle.fontWeight ===
                                                                  "bold"
                                                                    ? "bg-slate-800 text-white border-slate-800"
                                                                    : "bg-white text-slate-700 border-slate-300"
                                                                }`}
                                                                onClick={() =>
                                                                  handleHeroItemFieldStyleChange(
                                                                    idx,
                                                                    itemIndex,
                                                                    fieldName,
                                                                    "fontWeight",
                                                                    currentFieldStyle.fontWeight ===
                                                                      "bold"
                                                                      ? "normal"
                                                                      : "bold"
                                                                  )
                                                                }
                                                              >
                                                                <span className="material-icons-round text-[14px]">
                                                                  format_bold
                                                                </span>
                                                              </button>
                                                              <button
                                                                type="button"
                                                                className={`px-2 py-1 rounded border flex items-center gap-1 ${
                                                                  currentFieldStyle.fontStyle ===
                                                                  "italic"
                                                                    ? "bg-slate-800 text-white border-slate-800"
                                                                    : "bg-white text-slate-700 border-slate-300"
                                                                }`}
                                                                onClick={() =>
                                                                  handleHeroItemFieldStyleChange(
                                                                    idx,
                                                                    itemIndex,
                                                                    fieldName,
                                                                    "fontStyle",
                                                                    currentFieldStyle.fontStyle ===
                                                                      "italic"
                                                                      ? "normal"
                                                                      : "italic"
                                                                  )
                                                                }
                                                              >
                                                                <span className="material-icons-round text-[14px]">
                                                                  format_italic
                                                                </span>
                                                              </button>
                                                              <button
                                                                type="button"
                                                                className={`px-2 py-1 rounded border flex items-center gap-1 ${
                                                                  currentFieldStyle.textDecoration ===
                                                                  "underline"
                                                                    ? "bg-slate-800 text-white border-slate-800"
                                                                    : "bg-white text-slate-700 border-slate-300"
                                                                }`}
                                                                onClick={() =>
                                                                  handleHeroItemFieldStyleChange(
                                                                    idx,
                                                                    itemIndex,
                                                                    fieldName,
                                                                    "textDecoration",
                                                                    currentFieldStyle.textDecoration ===
                                                                      "underline"
                                                                      ? "none"
                                                                      : "underline"
                                                                  )
                                                                }
                                                              >
                                                                <span className="material-icons-round text-[14px]">
                                                                  format_underlined
                                                                </span>
                                                              </button>
                                                              <div className="flex items-center gap-1">
                                                                <span className="text-slate-600">
                                                                  Tamaño
                                                                </span>
                                                                <input
                                                                  type="text"
                                                                  className="w-16 border rounded px-1 py-0.5 text-[11px]"
                                                                  placeholder="16px"
                                                                  value={
                                                                    currentFieldStyle.fontSize ||
                                                                    ""
                                                                  }
                                                                  onChange={(e) =>
                                                                    handleHeroItemFieldStyleChange(
                                                                      idx,
                                                                      itemIndex,
                                                                      fieldName,
                                                                      "fontSize",
                                                                      e.target.value
                                                                    )
                                                                  }
                                                                />
                                                              </div>
                                                              {(fieldName === "badge" ||
                                                                fieldName ===
                                                                  "buttonText") && (
                                                                <>
                                                                  <div className="flex items-center gap-1">
                                                                    <span className="text-slate-600">Fondo contenedor</span>
                                                                    <input
                                                                      type="color"
                                                                      className="h-6 w-8 border rounded"
                                                                      value={
                                                                        currentFieldStyle.backgroundColor ||
                                                                        "#000000"
                                                                      }
                                                                      onChange={(e) =>
                                                                        handleHeroItemFieldStyleChange(
                                                                          idx,
                                                                          itemIndex,
                                                                          fieldName,
                                                                          "backgroundColor",
                                                                          e.target.value
                                                                        )
                                                                      }
                                                                    />
                                                                  </div>
                                                                  <div className="flex items-center gap-1">
                                                                    <span className="text-slate-600">Border radius</span>
                                                                    <input
                                                                      type="text"
                                                                      className="w-20 border rounded px-1 py-0.5 text-[11px]"
                                                                      placeholder="9999px"
                                                                      value={
                                                                        currentFieldStyle.borderRadius ||
                                                                        ""
                                                                      }
                                                                      onChange={(e) =>
                                                                        handleHeroItemFieldStyleChange(
                                                                          idx,
                                                                          itemIndex,
                                                                          fieldName,
                                                                          "borderRadius",
                                                                          e.target.value
                                                                        )
                                                                      }
                                                                    />
                                                                  </div>
                                                                  <div className="flex items-center gap-1">
                                                                    <span className="text-slate-600">Padding X</span>
                                                                    <input
                                                                      type="text"
                                                                      className="w-16 border rounded px-1 py-0.5 text-[11px]"
                                                                      placeholder="12px"
                                                                      value={
                                                                        currentFieldStyle.paddingInline ||
                                                                        ""
                                                                      }
                                                                      onChange={(e) =>
                                                                        handleHeroItemFieldStyleChange(
                                                                          idx,
                                                                          itemIndex,
                                                                          fieldName,
                                                                          "paddingInline",
                                                                          e.target.value
                                                                        )
                                                                      }
                                                                    />
                                                                    <span className="text-slate-600">Y</span>
                                                                    <input
                                                                      type="text"
                                                                      className="w-16 border rounded px-1 py-0.5 text-[11px]"
                                                                      placeholder="6px"
                                                                      value={
                                                                        currentFieldStyle.paddingBlock ||
                                                                        ""
                                                                      }
                                                                      onChange={(e) =>
                                                                        handleHeroItemFieldStyleChange(
                                                                          idx,
                                                                          itemIndex,
                                                                          fieldName,
                                                                          "paddingBlock",
                                                                          e.target.value
                                                                        )
                                                                      }
                                                                    />
                                                                  </div>
                                                                </>
                                                              )}
                                                            </div>
                                                          )}
                                                        </div>
                                                      );
                                                    };

                                                    return (
                                                      <>
                                                        <div className="flex items-center justify-between gap-2 mb-1">
                                                          <span className="text-[11px] font-semibold text-slate-500">
                                                            Hero {itemIndex + 1}
                                                          </span>
                                                          <button
                                                            type="button"
                                                            className="text-[10px] px-2 py-0.5 rounded bg-red-600 text-white hover:bg-red-700"
                                                            onClick={() =>
                                                              handleRemoveHeroItem(
                                                                idx,
                                                                itemIndex
                                                              )
                                                            }
                                                          >
                                                            Quitar
                                                          </button>
                                                        </div>
                                                        {renderFieldWithStyles(
                                                          "Título",
                                                          "title",
                                                          <input
                                                            type="text"
                                                            className="border rounded px-2 py-1 text-xs"
                                                            placeholder="Título"
                                                            value={item.title || ""}
                                                            onChange={(e) =>
                                                              handleHeroItemFieldChange(
                                                                idx,
                                                                itemIndex,
                                                                "title",
                                                                e.target.value
                                                              )
                                                            }
                                                          />
                                                        )}
                                                        {renderFieldWithStyles(
                                                          "Subtítulo",
                                                          "subtitle",
                                                          <textarea
                                                            className="border rounded px-2 py-1 text-xs resize-none h-16"
                                                            placeholder="Subtítulo"
                                                            value={item.subtitle || ""}
                                                            onChange={(e) =>
                                                              handleHeroItemFieldChange(
                                                                idx,
                                                                itemIndex,
                                                                "subtitle",
                                                                e.target.value
                                                              )
                                                            }
                                                          />
                                                        )}
                                                        {renderFieldWithStyles(
                                                          "Badge",
                                                          "badge",
                                                          <input
                                                            type="text"
                                                            className="border rounded px-2 py-1 text-xs"
                                                            placeholder="Badge (opcional)"
                                                            value={item.badge || ""}
                                                            onChange={(e) =>
                                                              handleHeroItemFieldChange(
                                                                idx,
                                                                itemIndex,
                                                                "badge",
                                                                e.target.value
                                                              )
                                                            }
                                                          />
                                                        )}
                                                        {renderFieldWithStyles(
                                                          "Texto del botón",
                                                          "buttonText",
                                                          <div className="flex gap-2">
                                                            <input
                                                              type="text"
                                                              className="flex-1 border rounded px-2 py-1 text-xs"
                                                              placeholder="Texto del botón"
                                                              value={item.buttonText || ""}
                                                              onChange={(e) =>
                                                                handleHeroItemFieldChange(
                                                                  idx,
                                                                  itemIndex,
                                                                  "buttonText",
                                                                  e.target.value
                                                                )
                                                              }
                                                            />
                                                            <input
                                                              type="text"
                                                              className="flex-1 border rounded px-2 py-1 text-xs"
                                                              placeholder="Enlace del botón"
                                                              value={item.buttonLink || ""}
                                                              onChange={(e) =>
                                                                handleHeroItemFieldChange(
                                                                  idx,
                                                                  itemIndex,
                                                                  "buttonLink",
                                                                  e.target.value
                                                                )
                                                              }
                                                            />
                                                          </div>
                                                        )}
                                                      </>
                                                    );
                                                  })()}
                                                  <div className="space-y-1 mt-1">
                                                    {item.image && (
                                                      <div className="aspect-video rounded-md overflow-hidden bg-slate-100 dark:bg-slate-800">
                                                        <img
                                                          src={item.image}
                                                          alt={item.title || "Hero"}
                                                          className="w-full h-full object-cover"
                                                        />
                                                      </div>
                                                    )}
                                                    <input
                                                      type="file"
                                                      accept="image/*"
                                                      className="text-[11px]"
                                                      onChange={(e) =>
                                                        handleHeroItemImage(
                                                          e,
                                                          idx,
                                                          itemIndex
                                                        )
                                                      }
                                                    />
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                            <button
                                              type="button"
                                              className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 rounded bg-purple-600 text-white text-xs hover:bg-purple-700"
                                              onClick={() => handleAddHeroItem(idx)}
                                            >
                                              <span className="material-icons-round text-[14px]">
                                                add
                                              </span>
                                              Agregar otro hero
                                            </button>
                                          </>
                                        );
                                      })()}
                                    </div>
                                  )}

                                {/* Estilos */}
                                {styleFields.length > 0 &&
                                  currentTab === "styles" && (
                                  <div className="space-y-2 border-t border-slate-200 pt-3 mt-2">
                                    <h4 className="text-xs font-semibold uppercase text-slate-500 flex items-center gap-1">
                                      <span className="material-icons-round text-[14px] text-purple-500">
                                        tune
                                      </span>
                                      Estilos
                                    </h4>
                                    {styleFields.map((field: any) => {
                                      const value = (styles as any)[field.name] ?? "";
                                      if (field.type === "color") {
                                        return (
                                          <div
                                            key={field.name}
                                            className="flex items-center gap-2"
                                          >
                                            <label className="text-xs text-slate-600 w-32">
                                              {field.label}
                                            </label>
                                            <input
                                              type="color"
                                              className="h-8 w-10 border rounded"
                                              value={value || "#000000"}
                                              onChange={(e) =>
                                                handleSectionStyleChange(
                                                  idx,
                                                  field.name,
                                                  e.target.value
                                                )
                                              }
                                            />
                                          </div>
                                        );
                                      }
                                      if (
                                        field.type === "text" ||
                                        field.type === "number"
                                      ) {
                                        return (
                                          <div
                                            key={field.name}
                                            className="flex items-center gap-2"
                                          >
                                            <label className="text-xs text-slate-600 w-32">
                                              {field.label}
                                            </label>
                                            <input
                                              className="flex-1 border p-2 text-sm rounded"
                                              placeholder={field.label}
                                              value={value}
                                              onChange={(e) =>
                                                handleSectionStyleChange(
                                                  idx,
                                                  field.name,
                                                  e.target.value
                                                )
                                              }
                                            />
                                          </div>
                                        );
                                      }
                                      return null;
                                    })}
                                  </div>
                                )}

                                {/* Avanzado (placeholder por ahora) */}
                                {currentTab === "advanced" && (
                                  <div className="pt-2 border-t border-dashed border-slate-200 text-[11px] text-slate-500">
                                    Próximamente: reglas de visibilidad por
                                    dispositivo, animaciones, etc.
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                          {/* Remove button always shown */}
                          <button
                            onClick={() => removeSection(section.id)}
                            className="mt-2 text-red-600"
                          >
                            Eliminar
                          </button>
                        </div>
                      )}
                    </Draggable>
                  );
                  })}

                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          <div className="flex gap-4 mt-6">
            <button
              onClick={() => openAddModal(null)}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Agregar sección
            </button>
            <button
              onClick={async () => {
                setSaving(true);
                // Guardar secciones (borrador)
                await saveLandingSections(sections);
                // Guardar también la configuración actual de productos destacados
                await updateFeaturedProducts(
                  featuredProducts.map((p) => p.id || p)
                );
                setSaving(false);
                alert("Secciones y productos destacados guardados como borrador");
              }}
              className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2 disabled:opacity-60"
              disabled={saving}
            >
              {saving ? (
                <span className="animate-spin material-icons-round">
                  autorenew
                </span>
              ) : (
                <span className="material-icons-round">save</span>
              )}
              Guardar
            </button>
            <button
              onClick={async () => {
                setSaving(true);
                // Aseguramos que la configuración actual de destacados
                // se copie primero a draft y luego a published
                await updateFeaturedProducts(
                  featuredProducts.map((p) => p.id || p)
                );
                await publishLanding();
                setSaving(false);
                alert("Landing publicada (hero, destacados y secciones)");
              }}
              className="bg-purple-700 text-white px-4 py-2 rounded flex items-center gap-2 disabled:opacity-60"
              disabled={saving}
            >
              <span className="material-icons-round">rocket_launch</span>
              Publicar landing
            </button>
          </div>
        </div>

        {/* Columna derecha: vista previa en vivo */}
        <div className="bg-white dark:bg-slate-950 rounded-lg shadow p-4 border border-slate-200 dark:border-slate-800 overflow-auto max-h-[calc(100vh-8rem)]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <button
                type="button"
                className="flex items-center justify-center h-8 w-8 rounded-full bg-purple-100 text-purple-700 hover:bg-purple-200 transition"
                onClick={() => setShowPreviewModal(true)}
                title="Abrir vista previa en ventana grande"
              >
                <span className="material-icons-round text-[18px]">
                  visibility
                </span>
              </button>
              Vista previa en vivo
            </h2>
            <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-1 py-0.5 text-xs">
              <button
                type="button"
                className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                  previewDevice === "desktop"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500"
                }`}
                onClick={() => setPreviewDevice("desktop")}
              >
                <span className="material-icons-round text-[16px]">
                  laptop_windows
                </span>
                Laptop
              </button>
              <button
                type="button"
                className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                  previewDevice === "mobile"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500"
                }`}
                onClick={() => setPreviewDevice("mobile")}
              >
                <span className="material-icons-round text-[16px]">
                  smartphone
                </span>
                Móvil
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Usa los controles de arriba para previsualizar la landing en un
            marco similar a laptop o a un teléfono móvil. El layout real
            depende del ancho de la ventana del navegador.
          </p>
          <div className="flex justify-center">
            <div
              className={
                previewDevice === "mobile"
                  ? "w-[390px] max-w-full border border-slate-300 dark:border-slate-700 rounded-[2.5rem] p-4 bg-slate-100 dark:bg-slate-900 shadow-inner"
                  : "w-full max-w-5xl border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-100 dark:bg-slate-900 shadow-inner"
              }
            >
              <div className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white min-h-full flex flex-col mt-2">
                <main className="flex-1 pb-24 lg:pb-0">
                  {hero && (
                    <SectionRenderer
                      section={{
                        id: "hero-preview",
                        type: "hero",
                        props: {
                          title: hero.title,
                          subtitle: hero.subtitle,
                          badge: (hero as any).badge,
                          buttonText: hero.buttonText,
                          buttonLink: hero.buttonLink,
                          image: hero.image,
                        },
                        styles: {},
                        order: 0,
                        hidden: false,
                      }}
                    />
                  )}

                  {sections
                    .slice()
                    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                    .map((section) => (
                      <SectionRenderer
                        key={section.id}
                        section={{
                          ...section,
                          // Secciones con datos dinámicos
                          props:
                            section.type === "featuredProducts"
                              ? {
                                  ...(section.props || {}),
                                  products: featuredProducts,
                                  device: previewDevice,
                                }
                              : section.type === "featuredCategories"
                              ? {
                                  ...(section.props || {}),
                                  device: previewDevice,
                                }
                              : section.props,
                        }}
                      />
                    ))}
                      {/* Botón para abrir modal de selección de comentarios Google Maps */}
                      <div className="my-6">
                        <button
                          className="bg-blue-600 text-white px-4 py-2 rounded"
                          onClick={openGoogleCommentsModal}
                        >
                          Seleccionar comentarios de Google Maps
                        </button>
                      </div>
                </main>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 dark:text-white p-6 rounded w-96">
            <h2 className="font-bold mb-4">Selecciona tipo de sección</h2>
            {Object.values(sectionSchemas).map((schema) => (
              <button
                key={schema.type}
                onClick={() => handleAddSectionType(schema.type)}
                className="block w-full text-left p-2 border mb-2"
              >
                {schema.label}
              </button>
            ))}
            <button
              onClick={closeAddModal}
              className="mt-4 w-full border p-2"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-2">
          <div className="relative max-h-[95vh] w-full flex items-center justify-center">
            <button
              type="button"
              className="absolute top-3 right-3 z-10 h-9 w-9 rounded-full bg-white/90 text-slate-800 shadow hover:bg-white"
              onClick={() => setShowPreviewModal(false)}
              aria-label="Cerrar vista previa"
            >
              <span className="material-icons-round">close</span>
            </button>

            <div
              className={
                previewDevice === "mobile"
                  ? "w-103.5 max-w-full max-h-[85vh] overflow-y-auto rounded-4xl border border-slate-300 bg-slate-100 dark:bg-slate-900 shadow-xl"
                  : "w-full max-w-6xl max-h-[85vh] overflow-y-auto rounded-xl border border-slate-300 bg-slate-50 dark:bg-slate-900 shadow-xl"
              }
            >
              <div className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white min-h-full">
                  <main className="flex-1 pb-24 lg:pb-0 mt-2">
                    {hero && (
                      <SectionRenderer
                        section={{
                          id: "hero-preview-modal",
                          type: "hero",
                          props: {
                            title: hero.title,
                            subtitle: hero.subtitle,
                            badge: (hero as any).badge,
                            buttonText: hero.buttonText,
                            buttonLink: hero.buttonLink,
                            image: hero.image,
                          },
                          styles: {},
                          order: 0,
                          hidden: false,
                        }}
                      />
                    )}

                    {sections
                      .slice()
                      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                      .map((section) => (
                        <SectionRenderer
                          key={section.id}
                          section={{
                            ...section,
                            props:
                              section.type === "featuredProducts"
                                ? {
                                    ...(section.props || {}),
                                    products: featuredProducts,
                                    device: previewDevice,
                                  }
                                : section.type === "featuredCategories"
                                ? {
                                    ...(section.props || {}),
                                    device: previewDevice,
                                  }
                                : section.props,
                          }}
                        />
                      ))}
                  </main>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}