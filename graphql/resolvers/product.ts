import { ForbiddenError } from 'apollo-server-express';
import { Product } from '@prisma/client';
import { getUserId, isAdmin } from '../../utils/auth/jwt';
import { validateInput, productSchemas } from '../../utils/validation';

interface Context {
  prisma: any;
  req: any;
}

const productResolvers = {
  Query: {
    // Get a list of products with pagination, filtering, and sorting
    products: async (_: any, args: any, context: Context) => {
      const { first = 10, after, last, before, filter, orderBy, categoryId } = args;

      // Build the where clause for filtering
      let where: any = {};

      if (filter) {
        where.OR = [
          { name: { contains: filter } },
          { description: { contains: filter } }
        ];
      }

      if (categoryId) {
        where.categoryId = categoryId;
      }

      // Get total count
      const totalCount = await context.prisma.product.count({ where });

      // Get products with pagination
      const products = await context.prisma.product.findMany({
        where,
        take: first,
        skip: after ? 1 : 0,
        cursor: after ? { id: after } : undefined,
        orderBy: orderBy ? { [orderBy.split('_')[0]]: orderBy.split('_')[1].toLowerCase() } : { createdAt: 'desc' },
        include: {
          category: true,
          orderItems: true
        }
      });

      // Create edges and pageInfo
      const edges = products.map(product => ({
        node: product,
        cursor: product.id
      }));

      const pageInfo = {
        hasNextPage: products.length === first,
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

    // Get a product by ID
    product: async (_: any, { id }: { id: string }, context: Context) => {
      return context.prisma.product.findUnique({
        where: { id },
        include: {
          category: true,
          orderItems: true
        }
      });
    }
  },

  Mutation: {
    // Create a new product (admin only)
    createProduct: async (_: any, { input }: { input: any }, context: Context): Promise<Product> => {
      if (!isAdmin(context)) {
        throw new ForbiddenError('Not authorized to create products');
      }

      // Validate input
      const validatedInput = validateInput(input, productSchemas.create);

      // Check if category exists
      const category = await context.prisma.category.findUnique({
        where: { id: validatedInput.categoryId }
      });

      if (!category) {
        throw new Error('Category not found');
      }

      // Create product
      return context.prisma.product.create({
        data: validatedInput,
        include: {
          category: true
        }
      });
    },

    // Update a product (admin only)
    updateProduct: async (_: any, { id, input }: { id: string; input: any }, context: Context): Promise<Product> => {
      if (!isAdmin(context)) {
        throw new ForbiddenError('Not authorized to update products');
      }

      // Validate input
      const validatedInput = validateInput(input, productSchemas.update);

      // Check if product exists
      const product = await context.prisma.product.findUnique({
        where: { id }
      });

      if (!product) {
        throw new Error('Product not found');
      }

      // If categoryId is provided, check if category exists
      if (validatedInput.categoryId) {
        const category = await context.prisma.category.findUnique({
          where: { id: validatedInput.categoryId }
        });

        if (!category) {
          throw new Error('Category not found');
        }
      }

      // Update product
      return context.prisma.product.update({
        where: { id },
        data: validatedInput,
        include: {
          category: true
        }
      });
    },

    // Delete a product (admin only)
    deleteProduct: async (_: any, { id }: { id: string }, context: Context): Promise<boolean> => {
      if (!isAdmin(context)) {
        throw new ForbiddenError('Not authorized to delete products');
      }

      // Check if product exists
      const product = await context.prisma.product.findUnique({
        where: { id },
        include: {
          orderItems: {
            include: {
              order: true
            }
          }
        }
      });

      if (!product) {
        throw new Error('Product not found');
      }

      // Check if product has any active orders
      const activeOrderItems = product.orderItems.filter(item => 
        item.order.status !== 'CANCELLED' && item.order.status !== 'DELIVERED'
      );

      if (activeOrderItems.length > 0) {
        throw new Error('Cannot delete product with active orders');
      }

      // Delete product
      await context.prisma.product.delete({
        where: { id }
      });

      return true;
    },

    // Update product stock (admin only)
    updateProductStock: async (_: any, { id, quantity }: { id: string; quantity: number }, context: Context): Promise<Product> => {
      if (!isAdmin(context)) {
        throw new ForbiddenError('Not authorized to update product stock');
      }

      // Validate input
      validateInput({ quantity }, productSchemas.updateStock);

      // Check if product exists
      const product = await context.prisma.product.findUnique({
        where: { id }
      });

      if (!product) {
        throw new Error('Product not found');
      }

      // Update product stock
      return context.prisma.product.update({
        where: { id },
        data: { stock: quantity }
      });
    }
  },

  // Resolve the category field for Product type
  Product: {
    category: async (parent: any, _: any, context: Context) => {
      // If category is already loaded, return it
      if (parent.category) {
        return parent.category;
      }

      // Otherwise, fetch category for this product
      return context.prisma.category.findUnique({
        where: { id: parent.categoryId }
      });
    },

    // Resolve the orderItems field for Product type
    orderItems: async (parent: any, _: any, context: Context) => {
      // If orderItems are already loaded, return them
      if (parent.orderItems) {
        return parent.orderItems;
      }

      // Otherwise, fetch orderItems for this product
      return context.prisma.orderItem.findMany({
        where: { productId: parent.id }
      });
    }
  }
};

export default productResolvers;
