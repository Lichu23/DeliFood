import { categoriesService } from './categories.service';
import prisma from '../../lib/prisma';
import { NotFoundError } from '../../utils/errors';

// Mock prisma
jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    category: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('CategoriesService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should return list of active categories by default', async () => {
      const mockCategories = [
        {
          id: 'cat-1',
          name: 'Category 1',
          description: 'Description 1',
          image: 'https://example.com/cat1.png',
          sortOrder: 1,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: { products: 5 },
        },
        {
          id: 'cat-2',
          name: 'Category 2',
          description: null,
          image: null,
          sortOrder: 2,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: { products: 0 },
        },
      ];

      (mockPrisma.category.findMany as jest.Mock).mockResolvedValue(mockCategories);

      const result = await categoriesService.list('store-123');

      expect(mockPrisma.category.findMany).toHaveBeenCalledWith({
        where: { storeId: 'store-123', isActive: true },
        include: { _count: { select: { products: true } } },
        orderBy: { sortOrder: 'asc' },
      });

      expect(result).toHaveLength(2);
      expect(result[0].productCount).toBe(5);
      expect(result[1].productCount).toBe(0);
    });

    it('should include inactive categories when specified', async () => {
      (mockPrisma.category.findMany as jest.Mock).mockResolvedValue([]);

      await categoriesService.list('store-123', true);

      expect(mockPrisma.category.findMany).toHaveBeenCalledWith({
        where: { storeId: 'store-123' },
        include: { _count: { select: { products: true } } },
        orderBy: { sortOrder: 'asc' },
      });
    });

    it('should return empty array when no categories found', async () => {
      (mockPrisma.category.findMany as jest.Mock).mockResolvedValue([]);

      const result = await categoriesService.list('store-123');

      expect(result).toEqual([]);
    });
  });

  describe('getById', () => {
    it('should return category when found', async () => {
      const mockCategory = {
        id: 'cat-1',
        name: 'Category 1',
        description: 'Description 1',
        image: 'https://example.com/cat1.png',
        sortOrder: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { products: 5 },
      };

      (mockPrisma.category.findFirst as jest.Mock).mockResolvedValue(mockCategory);

      const result = await categoriesService.getById('store-123', 'cat-1');

      expect(mockPrisma.category.findFirst).toHaveBeenCalledWith({
        where: { id: 'cat-1', storeId: 'store-123' },
        include: { _count: { select: { products: true } } },
      });

      expect(result.id).toBe('cat-1');
      expect(result.productCount).toBe(5);
    });

    it('should throw NotFoundError when category not found', async () => {
      (mockPrisma.category.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(categoriesService.getById('store-123', 'cat-999'))
        .rejects.toThrow(NotFoundError);
      await expect(categoriesService.getById('store-123', 'cat-999'))
        .rejects.toThrow('Category not found');
    });
  });

  describe('create', () => {
    it('should create category with specified sortOrder', async () => {
      const mockCategory = {
        id: 'cat-new',
        name: 'New Category',
        description: 'New description',
        image: null,
        sortOrder: 5,
        isActive: true,
        storeId: 'store-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPrisma.category.create as jest.Mock).mockResolvedValue(mockCategory);

      const result = await categoriesService.create('store-123', {
        name: 'New Category',
        description: 'New description',
        sortOrder: 5,
      });

      expect(mockPrisma.category.create).toHaveBeenCalledWith({
        data: {
          storeId: 'store-123',
          name: 'New Category',
          description: 'New description',
          image: undefined,
          sortOrder: 5,
        },
      });

      expect(result).toEqual(mockCategory);
    });

    it('should auto-increment sortOrder when not specified', async () => {
      const existingCategory = {
        id: 'cat-existing',
        sortOrder: 3,
      };

      (mockPrisma.category.findFirst as jest.Mock).mockResolvedValue(existingCategory);
      (mockPrisma.category.create as jest.Mock).mockResolvedValue({
        id: 'cat-new',
        name: 'New Category',
        sortOrder: 4,
      });

      await categoriesService.create('store-123', {
        name: 'New Category',
      });

      expect(mockPrisma.category.findFirst).toHaveBeenCalledWith({
        where: { storeId: 'store-123' },
        orderBy: { sortOrder: 'desc' },
      });

      expect(mockPrisma.category.create).toHaveBeenCalledWith({
        data: {
          storeId: 'store-123',
          name: 'New Category',
          description: undefined,
          image: undefined,
          sortOrder: 4,
        },
      });
    });

    it('should set sortOrder to 0 for first category', async () => {
      (mockPrisma.category.findFirst as jest.Mock).mockResolvedValue(null);
      (mockPrisma.category.create as jest.Mock).mockResolvedValue({
        id: 'cat-new',
        name: 'First Category',
        sortOrder: 0,
      });

      await categoriesService.create('store-123', {
        name: 'First Category',
      });

      expect(mockPrisma.category.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ sortOrder: 0 }),
      });
    });
  });

  describe('update', () => {
    it('should update category when found', async () => {
      const existingCategory = {
        id: 'cat-1',
        storeId: 'store-123',
        name: 'Old Name',
      };

      const updatedCategory = {
        id: 'cat-1',
        storeId: 'store-123',
        name: 'New Name',
        description: 'New description',
      };

      (mockPrisma.category.findFirst as jest.Mock).mockResolvedValue(existingCategory);
      (mockPrisma.category.update as jest.Mock).mockResolvedValue(updatedCategory);

      const result = await categoriesService.update('store-123', 'cat-1', {
        name: 'New Name',
        description: 'New description',
      });

      expect(mockPrisma.category.update).toHaveBeenCalledWith({
        where: { id: 'cat-1' },
        data: { name: 'New Name', description: 'New description' },
      });

      expect(result).toEqual(updatedCategory);
    });

    it('should throw NotFoundError when category not found', async () => {
      (mockPrisma.category.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(categoriesService.update('store-123', 'cat-999', { name: 'New' }))
        .rejects.toThrow(NotFoundError);
    });

    it('should allow updating isActive status', async () => {
      const existingCategory = { id: 'cat-1', storeId: 'store-123', isActive: true };

      (mockPrisma.category.findFirst as jest.Mock).mockResolvedValue(existingCategory);
      (mockPrisma.category.update as jest.Mock).mockResolvedValue({
        ...existingCategory,
        isActive: false,
      });

      await categoriesService.update('store-123', 'cat-1', { isActive: false });

      expect(mockPrisma.category.update).toHaveBeenCalledWith({
        where: { id: 'cat-1' },
        data: { isActive: false },
      });
    });
  });

  describe('delete', () => {
    it('should delete category and return affected products count', async () => {
      const existingCategory = {
        id: 'cat-1',
        storeId: 'store-123',
        _count: { products: 3 },
      };

      (mockPrisma.category.findFirst as jest.Mock).mockResolvedValue(existingCategory);
      (mockPrisma.category.delete as jest.Mock).mockResolvedValue({});

      const result = await categoriesService.delete('store-123', 'cat-1');

      expect(mockPrisma.category.delete).toHaveBeenCalledWith({
        where: { id: 'cat-1' },
      });

      expect(result).toEqual({
        success: true,
        productsAffected: 3,
      });
    });

    it('should throw NotFoundError when category not found', async () => {
      (mockPrisma.category.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(categoriesService.delete('store-123', 'cat-999'))
        .rejects.toThrow(NotFoundError);
    });

    it('should return 0 productsAffected when category has no products', async () => {
      const existingCategory = {
        id: 'cat-1',
        storeId: 'store-123',
        _count: { products: 0 },
      };

      (mockPrisma.category.findFirst as jest.Mock).mockResolvedValue(existingCategory);
      (mockPrisma.category.delete as jest.Mock).mockResolvedValue({});

      const result = await categoriesService.delete('store-123', 'cat-1');

      expect(result.productsAffected).toBe(0);
    });
  });
});
