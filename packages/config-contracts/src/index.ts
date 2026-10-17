import { z } from "zod";

// ============================================================================
// CONSTANTES Y CONFIGURACIÓN COMERCIAL
// ============================================================================

export const APP_CONSTANTS = {
  CURRENCY: "ARS",
  LOCALE: "es-AR",
  MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024, // 5 MB
  ALLOWED_IMAGE_MIME_TYPES: [
    "image/webp",
    "image/jpeg",
    "image/png",
  ] as const,
  STOCK_RESERVATION_TTL_MINUTES: 15,
  ORDER_NUMBER_PREFIX: "DR-",
} as const;

// ============================================================================
// ENUMS DE NEGOCIO
// ============================================================================

export const OrderStatusEnum = z.enum([
  "PENDING_PAYMENT",
  "PAID",
  "PREPARING",
  "READY_FOR_PICKUP",
  "COMPLETED",
  "CANCELLED",
  "REFUNDED",
]);
export type OrderStatus = z.infer<typeof OrderStatusEnum>;

export const PaymentStatusEnum = z.enum([
  "pending",
  "approved",
  "in_process",
  "rejected",
  "cancelled",
  "refunded",
  "charged_back",
]);
export type PaymentStatus = z.infer<typeof PaymentStatusEnum>;

export const StockReservationStatusEnum = z.enum([
  "ACTIVE",
  "CONSUMED",
  "RELEASED",
  "EXPIRED",
]);
export type StockReservationStatus = z.infer<typeof StockReservationStatusEnum>;

export const AdminRoleEnum = z.enum(["SUPERADMIN", "OPERATOR"]);
export type AdminRole = z.infer<typeof AdminRoleEnum>;

// ============================================================================
// ESQUEMAS: CATEGORÍAS
// ============================================================================

export const CategorySchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(80),
  slug: z
    .string()
    .min(2)
    .max(90)
    .regex(/^[a-z0-9-]+$/, "El slug solo debe contener minúsculas, números y guiones"),
  description: z.string().max(500).optional().nullable(),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
  parentId: z.string().cuid().optional().nullable(),
});
export type CategoryInput = z.infer<typeof CategorySchema>;

// ============================================================================
// ESQUEMAS: PRODUCTOS Y VARIANTES
// ============================================================================

export const ProductVariantSchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string().min(1, "El nombre de la variante es obligatorio").max(100).trim(),
  sku: z
    .string()
    .min(3, "El SKU debe tener al menos 3 caracteres")
    .max(50, "El SKU no puede superar los 50 caracteres")
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9_-]+$/, "El SKU solo admite letras mayúsculas, números, guiones y guiones bajos"),
  priceAdjustmentArs: z.number().default(0),
  stock: z.number().int("El stock debe ser un número entero").min(0, "El stock no puede ser negativo").default(0),
  isActive: z.boolean().default(true),
});
export type ProductVariantInput = z.infer<typeof ProductVariantSchema>;

export const ProductImageSchema = z.object({
  id: z.string().cuid().optional(),
  url: z.string().url("URL de imagen no válida"),
  altText: z.string().max(150).optional().nullable(),
  displayOrder: z.number().int().default(0),
  isThumbnail: z.boolean().default(false),
  fileSize: z.number().int().max(APP_CONSTANTS.MAX_FILE_SIZE_BYTES),
  mimeType: z.enum(APP_CONSTANTS.ALLOWED_IMAGE_MIME_TYPES),
});
export type ProductImageInput = z.infer<typeof ProductImageSchema>;

export const ProductSchema = z
  .object({
    id: z.string().cuid().optional(),
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(120).trim(),
    slug: z
      .string()
      .min(2, "El slug debe tener al menos 2 caracteres")
      .max(130)
      .trim()
      .toLowerCase()
      .regex(/^[a-z0-9-]+$/, "El slug solo debe contener minúsculas, números y guiones"),
    description: z.string().min(5, "La descripción debe tener al menos 5 caracteres").trim(),
    basePriceArs: z.number().min(1, "El precio base debe ser mayor a 0"),
    isSelfMade: z.boolean().default(false), // true: Impresión 3D propia, false: Reventa
    isDualityCreation: z.boolean().default(false), // Insignia visual destacada «Creación Duality»
    isActive: z.boolean().default(true),
    categoryId: z.string().cuid("Debés seleccionar una categoría válida"),
    variants: z.array(ProductVariantSchema).min(1, "El producto debe tener al menos una variante"),
  })
  .superRefine((data, ctx) => {
    const skus = new Set<string>();
    data.variants.forEach((v, idx) => {
      const finalPrice = data.basePriceArs + v.priceAdjustmentArs;
      if (finalPrice <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `El precio final de la variante "${v.name}" ($${finalPrice}) debe ser mayor a $0 ARS`,
          path: ["variants", idx, "priceAdjustmentArs"],
        });
      }
      if (skus.has(v.sku)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `El SKU "${v.sku}" está repetido dentro del mismo producto`,
          path: ["variants", idx, "sku"],
        });
      }
      skus.add(v.sku);
    });
  });
export type ProductInput = z.infer<typeof ProductSchema>;

// ============================================================================
// ESQUEMAS: CARRITO Y CHECKOUT COMO INVITADO
// ============================================================================

export const CartItemInputSchema = z.object({
  productId: z.string().cuid(),
  variantId: z.string().cuid(),
  quantity: z.number().int().min(1, "La cantidad mínima es 1").max(20),
});
export type CartItemInput = z.infer<typeof CartItemInputSchema>;

export const GuestCheckoutSchema = z.object({
  customerName: z
    .string()
    .min(3, "Ingresá tu nombre completo")
    .max(100)
    .trim(),
  customerEmail: z
    .string()
    .email("Ingresá un correo electrónico válido")
    .max(120)
    .trim()
    .toLowerCase(),
  customerPhone: z
    .string()
    .min(8, "Ingresá un número de contacto válido para WhatsApp")
    .max(25)
    .regex(/^[0-9+\s()-]+$/, "El teléfono contiene caracteres inválidos")
    .trim(),
  notes: z
    .string()
    .max(400, "Las notas no pueden superar 400 caracteres")
    .optional()
    .nullable(),
  items: z.array(CartItemInputSchema).min(1, "El carrito no puede estar vacío"),
});
export type GuestCheckoutInput = z.infer<typeof GuestCheckoutSchema>;

// ============================================================================
// ESQUEMAS: VALIDACIÓN DE SUBIDA DE IMÁGENES
// ============================================================================

export const ImageUploadMetaSchema = z.object({
  filename: z.string().min(1).max(255),
  size: z.number().max(APP_CONSTANTS.MAX_FILE_SIZE_BYTES, "El archivo supera los 5 MB"),
  mimetype: z.enum(APP_CONSTANTS.ALLOWED_IMAGE_MIME_TYPES, {
    errorMap: () => ({ message: "Formato de imagen no permitido (solo WebP, JPEG o PNG)" }),
  }),
});
export type ImageUploadMeta = z.infer<typeof ImageUploadMetaSchema>;

// ============================================================================
// ESQUEMAS: ADMINISTRACIÓN Y AUTENTICACIÓN
// ============================================================================

export const AdminLoginSchema = z.object({
  email: z.string().email("Correo no válido").toLowerCase().trim(),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});
export type AdminLoginInput = z.infer<typeof AdminLoginSchema>;
