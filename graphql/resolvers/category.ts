import { ForbiddenError } from 'apollo-server-express';
import { Category } from '@prisma/client';
import { isAdmin } from '../../utils/auth/jwt';
import { validateInput, categorySchemas } from '../../utils/validation';

interface Context {
  prisma: any;
  req: any;
}

const categoryResolvers = {
  Query: {
    // Get a list of categories with pagination, filtering, and sorting
    categories: async (_: any, args: any, context: Context) => {
      const { first = 10, after, last, before, filter, orderBy } = args;
      
      // Build the where clause for filtering
      const where = filter ? {
        name: { contains: filter }
      } : {};

      // Get total count
      const totalCount = await context.prisma.category.count({ where });

      // Get categories with pagination
      const categories = await context.prisma.category.findMany({
        where,
        take: first,
        skip: after ? 1 : 0,
        cursor: after ? { id: after } : undefined,
        orderBy: orderBy ? { [orderBy.split('_')[0]]: orderBy.split('_')[1].toLowerCase() } : { createdAt: 'desc' },
        include: {
          products: true
        }
      });

      // Create edges and pageInfo
      const edges = categories.map(category => ({
        node: category,
        cursor: category.id
      }));

      const pageInfo = {
        hasNextPage: categories.length === first,
        hasPreviousPage: !!after,
        startCursor: edges.length > 0 ? edges[0].cursor : null,
        endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null
      };

      return {
        edges,
        pageInfo,
        totalCount
      };
    },

    // Get a category by ID
    category: async (_: any, { id }: { id: string }, context: Context) => {
      return context.prisma.category.findUnique({
        where: { id },
        include: {
          products: true
        }
      });
    }
  },

  Mutation: {
    // Create a new category (admin only)
    createCategory: async (_: any, { input }: { input: any }, context: Context): Promise<Category> => {
      if (!isAdmin(context)) {
        throw new ForbiddenError('Not authorized to create categories');
      }

      // Validate input
      const validatedInput = validateInput(input, categorySchemas.create);

      // Create category
      return context.prisma.category.create({
        data: validatedInput
      });
    },

    // Update a category (admin only)
    updateCategory: async (_: any, { id, input }: { id: string; input: any }, context: Context): Promise<Category> => {
      if (!isAdmin(context)) {
        throw new ForbiddenError('Not authorized to update categories');
      }

      // Validate input
      const validatedInput = validateInput(input, categorySchemas.update);
      
      // Check if category exists
      const category = await context.prisma.category.findUnique({
        where: { id }
      });
      
      if (!category) {
        throw new Error('Category not found');
      }

      // Update category
      return context.prisma.category.update({
        where: { id },
        data: validatedInput
      });
    },

    // Delete a category (admin only)
    deleteCategory: async (_: any, { id }: { id: string }, context: Context): Promise<boolean> => {
      if (!isAdmin(context)) {
        throw new ForbiddenError('Not authorized to delete categories');
      }

      // Check if category exists
      const category = await context.prisma.category.findUnique({
        where: { id },
        include: {
          products: true
        }
      });
      
      if (!category) {
        throw new Error('Category not found');
      }
      
      // Check if category has any products
      if (category.products.length > 0) {
        throw new Error('Cannot delete category with associated products');
      }

      // Delete category
      await context.prisma.category.delete({
        where: { id }
      });

      return true;
    }
  },

  // Resolve the products field for Category type
  Category: {
    products: async (parent: any, _: any, context: Context) => {
      // If products are already loaded, return them
      if (parent.products) {
        return parent.products;
      }
      
      // Otherwise, fetch products for this category
      return context.prisma.product.findMany({
        where: { categoryId: parent.id }
      });
    }
  }
};

export default categoryResolvers;