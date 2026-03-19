
export const sectionSchemas: { [key: string]: { type: string; label: string; icon: string; fields: any[] } } = {
  hero: {
    type: "hero",
    label: "Hero",
    icon: "image",
    fields: [
      { name: "googleMaps", type: "boolean", label: "¿Hero de Google Maps?", group: "content" },
      { name: "title", type: "text", label: "Título", group: "content", stylable: true },
      { name: "subtitle", type: "text", label: "Subtítulo", group: "content", stylable: true },
      { name: "badge", type: "text", label: "Badge", group: "content", stylable: true },
      { name: "buttonText", type: "text", label: "Texto del botón", group: "content", stylable: true },
      { name: "buttonLink", type: "text", label: "Enlace del botón", group: "content" },
      { name: "image", type: "image", label: "Imagen principal", group: "content" },
      // Campos especiales para Google Maps
      // rating y ratingCount ahora se obtienen automáticamente, solo mostrar generalMessage
      { name: "generalMessage", type: "textarea", label: "Mensaje general", group: "content", showIf: { googleMaps: true } },
      { name: "backgroundColor", type: "color", label: "Color de fondo", group: "styles" },
      { name: "textColor", type: "color", label: "Color de texto", group: "styles" },
      { name: "paddingTop", type: "text", label: "Padding superior", group: "styles" },
      { name: "paddingBottom", type: "text", label: "Padding inferior", group: "styles" },
      { name: "textAlign", type: "text", label: "Alineación texto (left/center/right)", group: "styles" },
      { name: "borderRadius", type: "text", label: "Border radius contenedor", group: "styles" },
    ],
  },
  googleComments: {
    type: "googleComments",
    label: "Comentarios Google Maps",
    icon: "comment",
    fields: [
      { name: "title", type: "text", label: "Título de sección", group: "content", stylable: true },
      { name: "comments", type: "textarea", label: "Comentarios seleccionados (JSON)", group: "content" },
      { name: "backgroundColor", type: "color", label: "Color de fondo", group: "styles" },
      { name: "textColor", type: "color", label: "Color de texto", group: "styles" },
      { name: "paddingTop", type: "text", label: "Padding superior", group: "styles" },
      { name: "paddingBottom", type: "text", label: "Padding inferior", group: "styles" },
      { name: "borderRadius", type: "text", label: "Border radius contenedor", group: "styles" },
    ],
  },
  heroGoogleReview: {
    type: "heroGoogleReview",
    label: "Hero Google Review",
    icon: "star",
    fields: [
      { name: "title", type: "text", label: "Título", group: "content", stylable: true },
      { name: "subtitle", type: "text", label: "Subtítulo", group: "content", stylable: true },
      { name: "badge", type: "text", label: "Badge", group: "content", stylable: true },
      { name: "buttonText", type: "text", label: "Texto del botón", group: "content", stylable: true },
      { name: "buttonLink", type: "text", label: "Enlace del botón", group: "content" },
      { name: "image", type: "image", label: "Imagen principal", group: "content" },
      { name: "rating", type: "number", label: "Calificación general (Google Maps)", group: "content" },
      { name: "ratingCount", type: "number", label: "Cantidad de reseñas", group: "content" },
      { name: "generalMessage", type: "textarea", label: "Mensaje general", group: "content" },
      { name: "backgroundColor", type: "color", label: "Color de fondo", group: "styles" },
      { name: "textColor", type: "color", label: "Color de texto", group: "styles" },
      { name: "paddingTop", type: "text", label: "Padding superior", group: "styles" },
      { name: "paddingBottom", type: "text", label: "Padding inferior", group: "styles" },
      { name: "textAlign", type: "text", label: "Alineación texto (left/center/right)", group: "styles" },
      { name: "borderRadius", type: "text", label: "Border radius contenedor", group: "styles" },
    ],
  },
  banner: {
    type: "banner",
    label: "Banner",
    icon: "format_color_fill",
    fields: [
      { name: "title", type: "text", label: "Título", group: "content", stylable: true },
      { name: "subtitle", type: "text", label: "Subtítulo 1", group: "content", stylable: true },
      { name: "subtitle2", type: "text", label: "Subtítulo 2 (opcional)", group: "content", stylable: true },
      { name: "subtitle3", type: "text", label: "Subtítulo 3 (opcional)", group: "content", stylable: true },
      { name: "backgroundImage", type: "image", label: "Imagen de fondo", group: "content" },
      { name: "backgroundColor", type: "color", label: "Color de fondo", group: "styles" },
      { name: "textColor", type: "color", label: "Color de texto", group: "styles" },
      { name: "paddingTop", type: "text", label: "Padding superior", group: "styles" },
      { name: "paddingBottom", type: "text", label: "Padding inferior", group: "styles" },
      { name: "borderRadius", type: "text", label: "Border radius contenedor", group: "styles" },
    ],
  },
  gallery: {
    type: "gallery",
    label: "Galería",
    icon: "collections",
    fields: [
      { name: "title", type: "text", label: "Título", group: "content" },
      { name: "paddingTop", type: "text", label: "Padding superior", group: "styles" },
      { name: "paddingBottom", type: "text", label: "Padding inferior", group: "styles" },
    ],
  },
  featuredProducts: {
    type: "featuredProducts",
    label: "Productos destacados",
    icon: "shopping_bag",
    fields: [
      { name: "title", type: "text", label: "Título", group: "content", stylable: true },
      // Los IDs de productos se gestionan desde el panel de destacados
    ],
  },
  featuredCategories: {
    type: "featuredCategories",
    label: "Categorías destacadas",
    icon: "category",
    fields: [
      { name: "title", type: "text", label: "Título", group: "content", stylable: true },
      // Las categorías individuales se gestionan desde el editor específico de la sección
    ],
  },
};
