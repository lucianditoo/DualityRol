"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { prisma, Prisma, AdminRole, StockReservationStatus } from "@duality/database";
import {
  ProductSchema,
  ProductVariantSchema,
  type ProductInput,
  type ProductVariantInput,
} from "@duality/config-contracts";
import { validateCurrentSession, getClientIp } from "./auth";

export interface ActionResponse<T = unknown> {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  data?: T;
}

/**
 * Traducir errores de concurrencia o restricciones de base de datos (Prisma P2002 / P2003)
 * en mensajes amigables sin exponer trazas internas de SQL.
 */
function formatDatabaseError(err: unknown, fallbackMessage: string): string {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const target = (err.meta?.target as string[] | undefined) || [];
      if (target.includes("slug")) {
        return "Conflicto de concurrencia: El slug indicado ya fue registrado por otro producto.";
      }
      if (target.includes("sku")) {
        return "Conflicto de concurrencia: Uno de los SKUs indicados ya fue registrado en otra variante.";
      }
      return "Ya existe un registro con ese identificador único (slug o SKU duplicado).";
    }
    if (err.code === "P2003") {
      return "Operación bloqueada por integridad referencial: existen registros vinculados en la base de datos.";
    }
  }
  if (err instanceof Error) {
    return err.message;
  }
  return fallbackMessage;
}

/**
 * Validar Origin frente a Host para mitigar solicitudes Cross-Origin (CSRF)
 * en operaciones administrativas mutables invocadas de forma programática.
 */
async function assertSameOrigin(): Promise<void> {
  const headerStore = await headers();
  const origin = headerStore.get("origin");
  const host = headerStore.get("host");

  if (origin && host) {
    let originHost = "";
    try {
      originHost = new URL(origin).host;
    } catch {
      throw new Error("Cabecera Origin malformada.");
    }
    if (originHost !== host) {
      throw new Error("Operación rechazada por política de origen cruzado (CSRF Protection).");
    }
  }
}

/**
 * Helper de autorización en servidor: verifica que exista sesión válida y
 * que el rol del usuario esté dentro de los roles permitidos.
 */
export async function requireAdminRole(
  allowedRoles: AdminRole[] = [AdminRole.SUPERADMIN, AdminRole.OPERATOR]
) {
  await assertSameOrigin();
  const session = await validateCurrentSession();

  if (!session.valid || !session.user) {
    throw new Error("UNAUTHORIZED: Debés iniciar sesión para realizar esta operación.");
  }

  if (!allowedRoles.includes(session.user.role)) {
    throw new Error(
      `FORBIDDEN: Tu rol (${session.user.role}) no tiene permisos para ejecutar esta acción.`
    );
  }

  return session.user;
}

/**
 * 1. CREAR PRODUCTO Y VARIANTES INICIALES (Transacción Atómica)
 */
export async function createProductAction(
  rawInput: ProductInput
): Promise<ActionResponse<{ productId: string }>> {
  try {
    const adminUser = await requireAdminRole([AdminRole.SUPERADMIN, AdminRole.OPERATOR]);
    const ipAddress = await getClientIp();

    const parsed = ProductSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Datos de validación incorrectos.",
      };
    }

    const data = parsed.data;

    // Comprobar que la categoría exista
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });
    if (!category) {
      return {
        success: false,
        error: "La categoría seleccionada no existe en la base de datos.",
      };
    }

    // Comprobar unicidad de slug previa
    const existingSlug = await prisma.product.findUnique({
      where: { slug: data.slug },
    });
    if (existingSlug) {
      return {
        success: false,
        error: `El slug "${data.slug}" ya está en uso por otro producto.`,
      };
    }

    // Comprobar unicidad de SKUs en toda la base de datos
    const requestedSkus = data.variants.map((v) => v.sku);
    const existingVariants = await prisma.productVariant.findMany({
      where: { sku: { in: requestedSkus } },
      select: { sku: true },
    });
    if (existingVariants.length > 0) {
      const dupList = existingVariants.map((v) => v.sku).join(", ");
      return {
        success: false,
        error: `El/los siguiente(s) SKU ya existen en el catálogo: ${dupList}`,
      };
    }

    // Crear producto, variantes y registros de auditoría en una única transacción
    const createdProduct = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          basePriceArs: data.basePriceArs,
          isSelfMade: data.isSelfMade,
          isDualityCreation: data.isDualityCreation,
          isActive: data.isActive,
          categoryId: data.categoryId,
        },
      });

      await tx.auditLog.create({
        data: {
          adminUserId: adminUser.id,
          action: "PRODUCT_CREATED",
          entity: "Product",
          entityId: product.id,
          ipAddress,
          details: {
            name: product.name,
            slug: product.slug,
            basePriceArs: Number(product.basePriceArs),
            categoryId: product.categoryId,
            isSelfMade: product.isSelfMade,
            isDualityCreation: product.isDualityCreation,
            isActive: product.isActive,
          },
        },
      });

      for (const variantData of data.variants) {
        const createdVariant = await tx.productVariant.create({
          data: {
            productId: product.id,
            name: variantData.name,
            sku: variantData.sku,
            priceAdjustmentArs: variantData.priceAdjustmentArs,
            stock: variantData.stock,
            isActive: variantData.isActive,
          },
        });

        await tx.auditLog.create({
          data: {
            adminUserId: adminUser.id,
            action: "VARIANT_CREATED",
            entity: "ProductVariant",
            entityId: createdVariant.id,
            ipAddress,
            details: {
              productId: product.id,
              sku: createdVariant.sku,
              name: createdVariant.name,
              priceAdjustmentArs: Number(createdVariant.priceAdjustmentArs),
              stock: createdVariant.stock,
            },
          },
        });
      }

      return product;
    });

    revalidatePath("/products");
    revalidatePath("/");

    return {
      success: true,
      data: { productId: createdProduct.id },
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: formatDatabaseError(err, "Error inesperado al crear el producto."),
    };
  }
}

/**
 * 2. ACTUALIZAR PRODUCTO Y SUS VARIANTES (Transacción Atómica)
 */
export async function updateProductAction(
  productId: string,
  rawInput: ProductInput
): Promise<ActionResponse<{ productId: string }>> {
  try {
    const adminUser = await requireAdminRole([AdminRole.SUPERADMIN, AdminRole.OPERATOR]);
    const ipAddress = await getClientIp();

    if (!productId) {
      return { success: false, error: "ID de producto no proporcionado." };
    }

    const parsed = ProductSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Datos de validación incorrectos.",
      };
    }

    const data = parsed.data;

    // Verificar existencia del producto actual e incluir variantes y sus reservas activas
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        variants: {
          include: {
            stockReservations: {
              where: {
                status: StockReservationStatus.ACTIVE,
                expiresAt: { gt: new Date() },
              },
            },
          },
        },
      },
    });

    if (!existingProduct) {
      return { success: false, error: "El producto que intentás editar no existe." };
    }

    // Verificar categoría
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });
    if (!category) {
      return { success: false, error: "La categoría seleccionada no existe." };
    }

    // Verificar colisión de slug con otros productos
    const slugConflict = await prisma.product.findFirst({
      where: {
        slug: data.slug,
        id: { not: productId },
      },
    });
    if (slugConflict) {
      return {
        success: false,
        error: `El slug "${data.slug}" ya pertenece a otro producto.`,
      };
    }

    // Verificar colisión de SKUs y compatibilidad de stock con reservas activas
    const existingVariantsMap = new Map(
      existingProduct.variants.map((ev) => [ev.id, ev])
    );

    for (const v of data.variants) {
      const skuConflict = await prisma.productVariant.findFirst({
        where: {
          sku: v.sku,
          ...(v.id ? { id: { not: v.id } } : {}),
        },
      });
      if (skuConflict) {
        return {
          success: false,
          error: `El SKU "${v.sku}" ya está registrado en otra variante.`,
        };
      }

      // Compatibilidad con futuras reservas de inventario:
      // No permitir reducir el stock de una variante por debajo de la cantidad actualmente reservada
      if (v.id && existingVariantsMap.has(v.id)) {
        const currentVar = existingVariantsMap.get(v.id)!;
        const activeReservedQty = currentVar.stockReservations.reduce(
          (sum, r) => sum + r.quantity,
          0
        );
        if (v.stock < activeReservedQty) {
          return {
            success: false,
            error: `El stock de la variante "${v.name}" (${v.stock}) no puede ser menor a las reservas activas en curso (${activeReservedQty} u.).`,
          };
        }
      }
    }

    await prisma.$transaction(async (tx) => {
      const wasActive = existingProduct.isActive;
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          basePriceArs: data.basePriceArs,
          isSelfMade: data.isSelfMade,
          isDualityCreation: data.isDualityCreation,
          isActive: data.isActive,
          categoryId: data.categoryId,
        },
      });

      // Registrar actualización general
      await tx.auditLog.create({
        data: {
          adminUserId: adminUser.id,
          action: "PRODUCT_UPDATED",
          entity: "Product",
          entityId: productId,
          ipAddress,
          details: {
            name: updatedProduct.name,
            slug: updatedProduct.slug,
            basePriceArs: Number(updatedProduct.basePriceArs),
            categoryId: updatedProduct.categoryId,
            isSelfMade: updatedProduct.isSelfMade,
            isDualityCreation: updatedProduct.isDualityCreation,
            isActive: updatedProduct.isActive,
          },
        },
      });

      if (wasActive && !data.isActive) {
        await tx.auditLog.create({
          data: {
            adminUserId: adminUser.id,
            action: "PRODUCT_ARCHIVED",
            entity: "Product",
            entityId: productId,
            ipAddress,
            details: { slug: updatedProduct.slug },
          },
        });
      } else if (!wasActive && data.isActive) {
        await tx.auditLog.create({
          data: {
            adminUserId: adminUser.id,
            action: "PRODUCT_REACTIVATED",
            entity: "Product",
            entityId: productId,
            ipAddress,
            details: { slug: updatedProduct.slug },
          },
        });
      }

      for (const vData of data.variants) {
        if (vData.id && existingVariantsMap.has(vData.id)) {
          const prevVariant = existingVariantsMap.get(vData.id)!;
          const updatedVariant = await tx.productVariant.update({
            where: { id: vData.id },
            data: {
              name: vData.name,
              sku: vData.sku,
              priceAdjustmentArs: vData.priceAdjustmentArs,
              stock: vData.stock,
              isActive: vData.isActive,
            },
          });

          await tx.auditLog.create({
            data: {
              adminUserId: adminUser.id,
              action: "VARIANT_UPDATED",
              entity: "ProductVariant",
              entityId: updatedVariant.id,
              ipAddress,
              details: {
                productId,
                sku: updatedVariant.sku,
                name: updatedVariant.name,
                priceAdjustmentArs: Number(updatedVariant.priceAdjustmentArs),
                stock: updatedVariant.stock,
                previousStock: prevVariant.stock,
                isActive: updatedVariant.isActive,
              },
            },
          });

          if (prevVariant.isActive && !vData.isActive) {
            await tx.auditLog.create({
              data: {
                adminUserId: adminUser.id,
                action: "VARIANT_DEACTIVATED",
                entity: "ProductVariant",
                entityId: updatedVariant.id,
                ipAddress,
                details: { productId, sku: updatedVariant.sku },
              },
            });
          }
        } else {
          // Nueva variante agregada durante la edición
          const createdVariant = await tx.productVariant.create({
            data: {
              productId,
              name: vData.name,
              sku: vData.sku,
              priceAdjustmentArs: vData.priceAdjustmentArs,
              stock: vData.stock,
              isActive: vData.isActive,
            },
          });

          await tx.auditLog.create({
            data: {
              adminUserId: adminUser.id,
              action: "VARIANT_CREATED",
              entity: "ProductVariant",
              entityId: createdVariant.id,
              ipAddress,
              details: {
                productId,
                sku: createdVariant.sku,
                name: createdVariant.name,
                priceAdjustmentArs: Number(createdVariant.priceAdjustmentArs),
                stock: createdVariant.stock,
              },
            },
          });
        }
      }
    });

    revalidatePath("/products");
    revalidatePath(`/products/${productId}/edit`);
    revalidatePath("/");

    return {
      success: true,
      data: { productId },
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: formatDatabaseError(err, "Error inesperado al actualizar el producto."),
    };
  }
}

/**
 * 3. ARCHIVAR / REACTIVAR PRODUCTO (Desactivación Lógica)
 */
export async function toggleProductStatusAction(
  productId: string,
  targetIsActive: boolean
): Promise<ActionResponse> {
  try {
    const adminUser = await requireAdminRole([AdminRole.SUPERADMIN, AdminRole.OPERATOR]);
    const ipAddress = await getClientIp();

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return { success: false, error: "Producto no encontrado." };
    }

    const auditAction = targetIsActive ? "PRODUCT_REACTIVATED" : "PRODUCT_ARCHIVED";

    await prisma.$transaction([
      prisma.product.update({
        where: { id: productId },
        data: { isActive: targetIsActive },
      }),
      prisma.auditLog.create({
        data: {
          adminUserId: adminUser.id,
          action: auditAction,
          entity: "Product",
          entityId: productId,
          ipAddress,
          details: {
            name: product.name,
            slug: product.slug,
            isActive: targetIsActive,
          },
        },
      }),
    ]);

    revalidatePath("/products");
    revalidatePath(`/products/${productId}/edit`);
    revalidatePath("/");

    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: formatDatabaseError(err, "Error al cambiar el estado del producto."),
    };
  }
}

/**
 * 4. ACTIVAR / DESACTIVAR VARIANTE INDIVIDUALMENTE
 */
export async function toggleVariantStatusAction(
  variantId: string,
  targetIsActive: boolean
): Promise<ActionResponse> {
  try {
    const adminUser = await requireAdminRole([AdminRole.SUPERADMIN, AdminRole.OPERATOR]);
    const ipAddress = await getClientIp();

    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
    });

    if (!variant) {
      return { success: false, error: "Variante no encontrada." };
    }

    const auditAction = targetIsActive ? "VARIANT_UPDATED" : "VARIANT_DEACTIVATED";

    await prisma.$transaction([
      prisma.productVariant.update({
        where: { id: variantId },
        data: { isActive: targetIsActive },
      }),
      prisma.auditLog.create({
        data: {
          adminUserId: adminUser.id,
          action: auditAction,
          entity: "ProductVariant",
          entityId: variantId,
          ipAddress,
          details: {
            productId: variant.productId,
            sku: variant.sku,
            isActive: targetIsActive,
          },
        },
      }),
    ]);

    revalidatePath("/products");
    revalidatePath(`/products/${variant.productId}/edit`);

    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: formatDatabaseError(err, "Error al cambiar estado de la variante."),
    };
  }
}

/**
 * 5. ACTUALIZACIÓN RÁPIDA DE VARIANTE (Stock / Ajuste de precio / Nombre / SKU)
 */
export async function updateSingleVariantAction(
  variantId: string,
  rawVariant: ProductVariantInput
): Promise<ActionResponse> {
  try {
    const adminUser = await requireAdminRole([AdminRole.SUPERADMIN, AdminRole.OPERATOR]);
    const ipAddress = await getClientIp();

    const parsed = ProductVariantSchema.safeParse(rawVariant);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Datos de variante inválidos.",
      };
    }

    const vData = parsed.data;

    const existingVariant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: {
        product: true,
        stockReservations: {
          where: {
            status: StockReservationStatus.ACTIVE,
            expiresAt: { gt: new Date() },
          },
        },
      },
    });

    if (!existingVariant) {
      return { success: false, error: "La variante no existe." };
    }

    // Validar que el precio final (basePriceArs + priceAdjustmentArs) sea > 0
    const basePrice = Number(existingVariant.product.basePriceArs);
    const finalPrice = basePrice + vData.priceAdjustmentArs;
    if (finalPrice <= 0) {
      return {
        success: false,
        error: `El precio final resultante ($${finalPrice} ARS) no puede ser cero ni negativo.`,
      };
    }

    // Compatibilidad con futuras reservas de inventario:
    const activeReservedQty = existingVariant.stockReservations.reduce(
      (sum, r) => sum + r.quantity,
      0
    );
    if (vData.stock < activeReservedQty) {
      return {
        success: false,
        error: `El stock (${vData.stock}) no puede ser inferior a las unidades con reserva activa (${activeReservedQty} u.).`,
      };
    }

    // Validar unicidad de SKU
    const skuCollision = await prisma.productVariant.findFirst({
      where: {
        sku: vData.sku,
        id: { not: variantId },
      },
    });
    if (skuCollision) {
      return {
        success: false,
        error: `El SKU "${vData.sku}" ya está siendo utilizado por otra variante.`,
      };
    }

    const wasActive = existingVariant.isActive;

    await prisma.$transaction(async (tx) => {
      await tx.productVariant.update({
        where: { id: variantId },
        data: {
          name: vData.name,
          sku: vData.sku,
          priceAdjustmentArs: vData.priceAdjustmentArs,
          stock: vData.stock,
          isActive: vData.isActive,
        },
      });

      await tx.auditLog.create({
        data: {
          adminUserId: adminUser.id,
          action: "VARIANT_UPDATED",
          entity: "ProductVariant",
          entityId: variantId,
          ipAddress,
          details: {
            productId: existingVariant.productId,
            sku: vData.sku,
            name: vData.name,
            priceAdjustmentArs: vData.priceAdjustmentArs,
            stock: vData.stock,
            previousStock: existingVariant.stock,
            isActive: vData.isActive,
          },
        },
      });

      if (wasActive && !vData.isActive) {
        await tx.auditLog.create({
          data: {
            adminUserId: adminUser.id,
            action: "VARIANT_DEACTIVATED",
            entity: "ProductVariant",
            entityId: variantId,
            ipAddress,
            details: { productId: existingVariant.productId, sku: vData.sku },
          },
        });
      }
    });

    revalidatePath("/products");
    revalidatePath(`/products/${existingVariant.productId}/edit`);

    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: formatDatabaseError(err, "Error al actualizar la variante."),
    };
  }
}

/**
 * 6. ELIMINACIÓN FÍSICA SEGURA DE PRODUCTO (Exclusivo SUPERADMIN y sin ninguna relación dependiente)
 */
export async function deleteProductAction(productId: string): Promise<ActionResponse> {
  try {
    // Solamente SUPERADMIN tiene autorización para eliminar físicamente
    const adminUser = await requireAdminRole([AdminRole.SUPERADMIN]);
    const ipAddress = await getClientIp();

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        _count: {
          select: {
            orderItems: true,
            images: true,
          },
        },
        variants: {
          include: {
            _count: {
              select: {
                orderItems: true,
                stockReservations: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      return { success: false, error: "El producto no existe." };
    }

    // Verificar TODAS las relaciones referenciales existentes (OrderItem, StockReservation y ProductImage)
    // Evitar eliminaciones en cascada de fotografías ya asociadas o referencias históricas
    const hasOrderItems = product._count.orderItems > 0;
    const hasImages = product._count.images > 0;
    const hasVariantReferences = product.variants.some(
      (v) => v._count.orderItems > 0 || v._count.stockReservations > 0
    );

    if (hasOrderItems || hasVariantReferences || hasImages) {
      return {
        success: false,
        error:
          "No es posible eliminar físicamente un producto que posee pedidos, reservas de stock o imágenes asociadas. Utilizá la desactivación lógica (Pausar/Archivar).",
      };
    }

    await prisma.$transaction([
      prisma.product.delete({
        where: { id: productId },
      }),
      prisma.auditLog.create({
        data: {
          adminUserId: adminUser.id,
          action: "PRODUCT_DELETED",
          entity: "Product",
          entityId: productId,
          ipAddress,
          details: {
            name: product.name,
            slug: product.slug,
          },
        },
      }),
    ]);

    revalidatePath("/products");
    revalidatePath("/");

    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: formatDatabaseError(err, "Error al eliminar el producto."),
    };
  }
}

/**
 * 7. ELIMINACIÓN FÍSICA SEGURA DE VARIANTE (Exclusivo SUPERADMIN y sin referencias históricas)
 */
export async function deleteVariantAction(variantId: string): Promise<ActionResponse> {
  try {
    const adminUser = await requireAdminRole([AdminRole.SUPERADMIN]);
    const ipAddress = await getClientIp();

    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: {
        _count: {
          select: { orderItems: true, stockReservations: true },
        },
        product: {
          include: {
            _count: { select: { variants: true } },
          },
        },
      },
    });

    if (!variant) {
      return { success: false, error: "La variante no existe." };
    }

    if (variant.product._count.variants <= 1) {
      return {
        success: false,
        error: "Todo producto debe conservar al menos una variante. No podés eliminar la única variante.",
      };
    }

    if (variant._count.orderItems > 0 || variant._count.stockReservations > 0) {
      return {
        success: false,
        error:
          "No se puede eliminar físicamente una variante con pedidos o reservas asociadas. Desactivala en su lugar.",
      };
    }

    await prisma.$transaction([
      prisma.productVariant.delete({
        where: { id: variantId },
      }),
      prisma.auditLog.create({
        data: {
          adminUserId: adminUser.id,
          action: "VARIANT_DELETED",
          entity: "ProductVariant",
          entityId: variantId,
          ipAddress,
          details: {
            productId: variant.productId,
            sku: variant.sku,
            name: variant.name,
          },
        },
      }),
    ]);

    revalidatePath("/products");
    revalidatePath(`/products/${variant.productId}/edit`);

    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: formatDatabaseError(err, "Error al eliminar la variante."),
    };
  }
}
