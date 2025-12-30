import prisma from '../../lib/prisma';
import { NotFoundError, BadRequestError } from '../../utils/errors';

export const productsService = {
  /**
   * Lista todos los productos de una tienda
   */
  async list(
    storeId: string,
    options?: {
      categoryId?: string;
      includeUnavailable?: boolean;
    }
  ) {
    const where: any = { storeId };

    if (options?.categoryId) {
      where.categoryId = options.categoryId;
    }

    if (!options?.includeUnavailable) {
      where.isAvailable = true;
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });

    return products.map((prod) => ({
      id: prod.id,
      name: prod.name,
      description: prod.description,
      price: prod.price,
      image: prod.image,
      isAvailable: prod.isAvailable,
      sortOrder: prod.sortOrder,
      category: prod.category,
      createdAt: prod.createdAt,
      updatedAt: prod.updatedAt,
    }));
  },

  /**
   * Obtiene un producto por ID
   */
  async getById(storeId: string, productId: string) {
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        storeId,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      isAvailable: product.isAvailable,
      sortOrder: product.sortOrder,
      category: product.category,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  },

  /**
   * Crea un nuevo producto
   */
  async create(
    storeId: string,
    data: {
      name: string;
      description?: string;
      price: number;
      image?: string;
      categoryId?: string;
      sortOrder?: number;
    }
  ) {
    // Verificar que la categoría existe si se especifica
    if (data.categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: data.categoryId,
          storeId,
        },
      });

      if (!category) {
        throw new BadRequestError('Category not found');
      }
    }

    // Si no se especifica sortOrder, ponerlo al final
    let sortOrder = data.sortOrder;
    if (sortOrder === undefined) {
      const lastProduct = await prisma.product.findFirst({
        where: { storeId },
        orderBy: { sortOrder: 'desc' },
      });
      sortOrder = lastProduct ? lastProduct.sortOrder + 1 : 0;
    }

    const product = await prisma.product.create({
      data: {
        storeId,
        name: data.name,
        description: data.description,
        price: data.price,
        image: data.image,
        categoryId: data.categoryId,
        sortOrder,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return product;
  },

  /**
   * Actualiza un producto
   */
  async update(
    storeId: string,
    productId: string,
    data: {
      name?: string;
      description?: string;
      price?: number;
      image?: string;
      categoryId?: string | null;
      sortOrder?: number;
      isAvailable?: boolean;
    }
  ) {
    // Verificar que existe
    const existing = await prisma.product.findFirst({
      where: {
        id: productId,
        storeId,
      },
    });

    if (!existing) {
      throw new NotFoundError('Product not found');
    }

    // Verificar que la categoría existe si se especifica
    if (data.categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: data.categoryId,
          storeId,
        },
      });

      if (!category) {
        throw new BadRequestError('Category not found');
      }
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return product;
  },

  /**
   * Elimina un producto
   */
  async delete(storeId: string, productId: string) {
    // Verificar que existe
    const existing = await prisma.product.findFirst({
      where: {
        id: productId,
        storeId,
      },
    });

    if (!existing) {
      throw new NotFoundError('Product not found');
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    return { success: true };
  },

  /**
   * Cambia la disponibilidad de un producto
   */
  async toggleAvailability(storeId: string, productId: string) {
    const existing = await prisma.product.findFirst({
      where: {
        id: productId,
        storeId,
      },
    });

    if (!existing) {
      throw new NotFoundError('Product not found');
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        isAvailable: !existing.isAvailable,
      },
    });

    return {
      id: product.id,
      isAvailable: product.isAvailable,
    };
  },
};