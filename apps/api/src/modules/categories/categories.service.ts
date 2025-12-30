import prisma from '../../lib/prisma';
import { NotFoundError } from '../../utils/errors';

export const categoriesService = {
  /**
   * Lista todas las categorías de una tienda
   */
  async list(storeId: string, includeInactive: boolean = false) {
    const where: any = { storeId };
    
    if (!includeInactive) {
      where.isActive = true;
    }

    const categories = await prisma.category.findMany({
      where,
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      image: cat.image,
      sortOrder: cat.sortOrder,
      isActive: cat.isActive,
      productCount: cat._count.products,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
    }));
  },

  /**
   * Obtiene una categoría por ID
   */
  async getById(storeId: string, categoryId: string) {
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        storeId,
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    return {
      id: category.id,
      name: category.name,
      description: category.description,
      image: category.image,
      sortOrder: category.sortOrder,
      isActive: category.isActive,
      productCount: category._count.products,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  },

  /**
   * Crea una nueva categoría
   */
  async create(
    storeId: string,
    data: {
      name: string;
      description?: string;
      image?: string;
      sortOrder?: number;
    }
  ) {
    // Si no se especifica sortOrder, ponerlo al final
    let sortOrder = data.sortOrder;
    if (sortOrder === undefined) {
      const lastCategory = await prisma.category.findFirst({
        where: { storeId },
        orderBy: { sortOrder: 'desc' },
      });
      sortOrder = lastCategory ? lastCategory.sortOrder + 1 : 0;
    }

    const category = await prisma.category.create({
      data: {
        storeId,
        name: data.name,
        description: data.description,
        image: data.image,
        sortOrder,
      },
    });

    return category;
  },

  /**
   * Actualiza una categoría
   */
  async update(
    storeId: string,
    categoryId: string,
    data: {
      name?: string;
      description?: string;
      image?: string;
      sortOrder?: number;
      isActive?: boolean;
    }
  ) {
    // Verificar que existe
    const existing = await prisma.category.findFirst({
      where: {
        id: categoryId,
        storeId,
      },
    });

    if (!existing) {
      throw new NotFoundError('Category not found');
    }

    const category = await prisma.category.update({
      where: { id: categoryId },
      data,
    });

    return category;
  },

  /**
   * Elimina una categoría
   */
  async delete(storeId: string, categoryId: string) {
    // Verificar que existe
    const existing = await prisma.category.findFirst({
      where: {
        id: categoryId,
        storeId,
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!existing) {
      throw new NotFoundError('Category not found');
    }

    // Los productos quedarán sin categoría (categoryId = null)
    await prisma.category.delete({
      where: { id: categoryId },
    });

    return { success: true, productsAffected: existing._count.products };
  },
};