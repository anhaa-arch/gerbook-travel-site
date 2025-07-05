import { ForbiddenError } from 'apollo-server-express';
import { Order } from '@prisma/client';
import { getUserId, isAdmin } from '../../utils/auth/jwt';
import { validateInput, orderSchemas } from '../../utils/validation';

interface Context {
  prisma: any;
  req: any;
}

const orderResolvers = {
  Query: {
    // Get a list of orders with pagination, filtering, and sorting
    orders: async (_: any, args: any, context: Context) => {
      const userId = getUserId(context);
      const isUserAdmin = isAdmin(context);
      
      const { userId: queryUserId, status, first = 10, after, last, before } = args;
      
      // Build the where clause for filtering
      let where: any = {};
      
      // If not admin, only show user's own orders
      if (!isUserAdmin) {
        where.userId = userId;
      } 
      // If admin and userId is provided, filter by that userId
      else if (queryUserId) {
        where.userId = queryUserId;
      }
      
      // Add status filter if provided
      if (status) {
        where.status = status;
      }

      // Get total count
      const totalCount = await context.prisma.order.count({ where });

      // Get orders with pagination
      const orders = await context.prisma.order.findMany({
        where,
        take: first,
        skip: after ? 1 : 0,
        cursor: after ? { id: after } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          user: true,
          items: {
            include: {
              product: true
            }
          }
        }
      });

      // Create edges and pageInfo
      const edges = orders.map(order => ({
        node: order,
        cursor: order.id
      }));

      const pageInfo = {
        hasNextPage: orders.length === first,
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

    // Get an order by ID
    order: async (_: any, { id }: { id: string }, context: Context) => {
      const userId = getUserId(context);
      const isUserAdmin = isAdmin(context);
      
      const order = await context.prisma.order.findUnique({
        where: { id },
        include: {
          user: true,
          items: {
            include: {
              product: true
            }
          }
        }
      });
      
      // Check if order exists
      if (!order) {
        throw new Error('Order not found');
      }
      
      // Check if user is authorized to view this order
      if (!isUserAdmin && order.userId !== userId) {
        throw new ForbiddenError('Not authorized to view this order');
      }
      
      return order;
    }
  },

  Mutation: {
    // Create a new order
    createOrder: async (_: any, { input }: { input: any }, context: Context): Promise<Order> => {
      const userId = getUserId(context);
      
      // Validate input
      const validatedInput = validateInput(input, orderSchemas.create);
      const { items, shippingAddress, paymentInfo } = validatedInput;
      
      // Check if all products exist and have enough stock
      const productIds = items.map(item => item.productId);
      const products = await context.prisma.product.findMany({
        where: {
          id: { in: productIds }
        }
      });
      
      // Create a map of products for easy access
      const productMap = products.reduce((map, product) => {
        map[product.id] = product;
        return map;
      }, {});
      
      // Validate products and calculate total price
      let totalPrice = 0;
      const orderItems = [];
      
      for (const item of items) {
        const product = productMap[item.productId];
        
        // Check if product exists
        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }
        
        // Check if product has enough stock
        if (product.stock < item.quantity) {
          throw new Error(`Not enough stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
        }
        
        // Calculate item price
        const itemPrice = product.price * item.quantity;
        totalPrice += itemPrice;
        
        // Add to order items
        orderItems.push({
          productId: item.productId,
          quantity: item.quantity,
          price: product.price
        });
      }
      
      // Create order with items in a transaction
      const order = await context.prisma.$transaction(async (prisma) => {
        // Create order
        const newOrder = await prisma.order.create({
          data: {
            userId,
            totalPrice,
            shippingAddress,
            paymentInfo,
            status: 'PENDING',
            items: {
              create: orderItems
            }
          },
          include: {
            items: true
          }
        });
        
        // Update product stock
        for (const item of items) {
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity
              }
            }
          });
        }
        
        return newOrder;
      });
      
      return order;
    },

    // Update an order (user can update their own orders, admin can update any order)
    updateOrder: async (_: any, { id, input }: { id: string; input: any }, context: Context): Promise<Order> => {
      const userId = getUserId(context);
      const isUserAdmin = isAdmin(context);
      
      // Validate input
      const validatedInput = validateInput(input, orderSchemas.update);
      
      // Get the order
      const order = await context.prisma.order.findUnique({
        where: { id }
      });
      
      // Check if order exists
      if (!order) {
        throw new Error('Order not found');
      }
      
      // Check if user is authorized to update this order
      if (!isUserAdmin && order.userId !== userId) {
        throw new ForbiddenError('Not authorized to update this order');
      }
      
      // Check if order can be updated (not CANCELLED)
      if (order.status === 'CANCELLED') {
        throw new Error('Cannot update a cancelled order');
      }
      
      // If status is changing to CANCELLED, restore product stock
      if (validatedInput.status === 'CANCELLED' && order.status !== 'CANCELLED') {
        return await context.prisma.$transaction(async (prisma) => {
          // Get order items
          const orderItems = await prisma.orderItem.findMany({
            where: { orderId: id },
            include: { product: true }
          });
          
          // Restore product stock
          for (const item of orderItems) {
            await prisma.product.update({
              where: { id: item.productId },
              data: {
                stock: {
                  increment: item.quantity
                }
              }
            });
          }
          
          // Update order
          return prisma.order.update({
            where: { id },
            data: validatedInput
          });
        });
      }
      
      // Update order
      return context.prisma.order.update({
        where: { id },
        data: validatedInput
      });
    },

    // Cancel an order (user can cancel their own orders, admin can cancel any order)
    cancelOrder: async (_: any, { id }: { id: string }, context: Context): Promise<Order> => {
      const userId = getUserId(context);
      const isUserAdmin = isAdmin(context);
      
      // Get the order
      const order = await context.prisma.order.findUnique({
        where: { id }
      });
      
      // Check if order exists
      if (!order) {
        throw new Error('Order not found');
      }
      
      // Check if user is authorized to cancel this order
      if (!isUserAdmin && order.userId !== userId) {
        throw new ForbiddenError('Not authorized to cancel this order');
      }
      
      // Check if order can be cancelled (not already CANCELLED or DELIVERED)
      if (order.status === 'CANCELLED' || order.status === 'DELIVERED') {
        throw new Error(`Cannot cancel a ${order.status.toLowerCase()} order`);
      }
      
      // Cancel order and restore product stock in a transaction
      return await context.prisma.$transaction(async (prisma) => {
        // Get order items
        const orderItems = await prisma.orderItem.findMany({
          where: { orderId: id },
          include: { product: true }
        });
        
        // Restore product stock
        for (const item of orderItems) {
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity
              }
            }
          });
        }
        
        // Update order status to CANCELLED
        return prisma.order.update({
          where: { id },
          data: { status: 'CANCELLED' }
        });
      });
    }
  },

  // Resolve the user field for Order type
  Order: {
    user: async (parent: any, _: any, context: Context) => {
      // If user is already loaded, return it
      if (parent.user) {
        return parent.user;
      }
      
      // Otherwise, fetch user for this order
      return context.prisma.user.findUnique({
        where: { id: parent.userId }
      });
    },
    
    // Resolve the items field for Order type
    items: async (parent: any, _: any, context: Context) => {
      // If items are already loaded, return them
      if (parent.items) {
        return parent.items;
      }
      
      // Otherwise, fetch items for this order
      return context.prisma.orderItem.findMany({
        where: { orderId: parent.id },
        include: {
          product: true
        }
      });
    }
  },

  // Resolve the product field for OrderItem type
  OrderItem: {
    product: async (parent: any, _: any, context: Context) => {
      // If product is already loaded, return it
      if (parent.product) {
        return parent.product;
      }
      
      // Otherwise, fetch product for this order item
      return context.prisma.product.findUnique({
        where: { id: parent.productId }
      });
    },
    
    // Resolve the order field for OrderItem type
    order: async (parent: any, _: any, context: Context) => {
      // If order is already loaded, return it
      if (parent.order) {
        return parent.order;
      }
      
      // Otherwise, fetch order for this order item
      return context.prisma.order.findUnique({
        where: { id: parent.orderId }
      });
    }
  }
};

export default orderResolvers;