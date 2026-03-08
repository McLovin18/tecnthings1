export type LandingSectionStyles = {
  backgroundColor?: string;
  textColor?: string;
  paddingTop?: string;
  paddingBottom?: string;
  textAlign?: "left" | "center" | "right";
  containerWidth?: "full" | "container" | "narrow";
  borderRadius?: string;
};

export type LandingFieldStyle = {
  color?: string;
  fontWeight?: "normal" | "bold";
  fontStyle?: "normal" | "italic";
  textDecoration?: "none" | "underline";
  fontSize?: string;
  backgroundColor?: string;
  borderRadius?: string;
  paddingInline?: string;
  paddingBlock?: string;
};

export type LandingSection = {
  id: string;
  type: string; // p.ej. "hero", "banner", "gallery", etc.
  props: Record<string, any>;
  styles?: LandingSectionStyles;
  fieldStyles?: Record<string, LandingFieldStyle>;
  order: number;
  hidden?: boolean;
};

export type SectionFieldType =
  | "text"
  | "textarea"
  | "image"
  | "color"
  | "select"
  | "number"
  | "boolean";

export type SectionFieldSchema = {
  name: string;
  type: SectionFieldType;
  label: string;
  placeholder?: string;
  options?: { label: string; value: string }[];
  group?: "content" | "styles" | "advanced";
  stylable?: boolean;
};

export type SectionSchema = {
  type: string;
  label: string;
  icon?: string;
  fields: SectionFieldSchema[];
};
