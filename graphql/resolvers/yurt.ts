import { ForbiddenError } from 'apollo-server-express';
import { Yurt } from '@prisma/client';
import { getUserId, isAdmin } from '../../utils/auth/jwt';
import { validateInput, yurtSchemas } from '../../utils/validation';

interface Context {
  prisma: any;
  req: any;
}

const yurtResolvers = {
  Query: {
    // Get a list of yurts with pagination, filtering, and sorting
    yurts: async (_: any, args: any, context: Context) => {
      const { first = 10, after, last, before, filter, orderBy } = args;
      
      // Build the where clause for filtering
      const where = filter ? {
        OR: [
          { name: { contains: filter } },
          { description: { contains: filter } },
          { location: { contains: filter } }
        ]
      } : {};

      // Get total count
      const totalCount = await context.prisma.yurt.count({ where });

      // Get yurts with pagination
      const yurts = await context.prisma.yurt.findMany({
        where,
        take: first,
        skip: after ? 1 : 0,
        cursor: after ? { id: after } : undefined,
        orderBy: orderBy ? { [orderBy.split('_')[0]]: orderBy.split('_')[1].toLowerCase() } : { createdAt: 'desc' },
        include: {
          bookings: true
        }
      });

      // Create edges and pageInfo
      const edges = yurts.map(yurt => ({
        node: yurt,
        cursor: yurt.id
      }));

      const pageInfo = {
        hasNextPage: yurts.length === first,
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

    // Get a yurt by ID
    yurt: async (_: any, { id }: { id: string }, context: Context) => {
      return context.prisma.yurt.findUnique({
        where: { id },
        include: {
          bookings: true
        }
      });
    },

    // Check availability of yurts for a date range
    availableYurts: async (_: any, { startDate, endDate, capacity }: { startDate: string; endDate: string; capacity?: number }, context: Context) => {
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Validate dates
      if (start >= end) {
        throw new Error('End date must be after start date');
      }

      // Get all yurts
      const allYurts = await context.prisma.yurt.findMany({
        where: capacity ? { capacity: { gte: capacity } } : {},
        include: {
          bookings: {
            where: {
              status: { in: ['PENDING', 'CONFIRMED'] },
              OR: [
                {
                  // Booking starts during the requested period
                  startDate: { gte: start, lt: end }
                },
                {
                  // Booking ends during the requested period
                  endDate: { gt: start, lte: end }
                },
                {
                  // Booking spans the entire requested period
                  AND: [
                    { startDate: { lte: start } },
                    { endDate: { gte: end } }
                  ]
                }
              ]
            }
          }
        }
      });

      // Filter out yurts that have bookings in the requested period
      const availableYurts = allYurts.filter(yurt => yurt.bookings.length === 0);

      return availableYurts;
    }
  },

  Mutation: {
    // Create a new yurt (admin only)
    createYurt: async (_: any, { input }: { input: any }, context: Context): Promise<Yurt> => {
      if (!isAdmin(context)) {
        throw new ForbiddenError('Not authorized to create yurts');
      }

      // Validate input
      const validatedInput = validateInput(input, yurtSchemas.create);

      // Create yurt
      return context.prisma.yurt.create({
        data: validatedInput
      });
    },

    // Update a yurt (admin only)
    updateYurt: async (_: any, { id, input }: { id: string; input: any }, context: Context): Promise<Yurt> => {
      if (!isAdmin(context)) {
        throw new ForbiddenError('Not authorized to update yurts');
      }

      // Validate input
      const validatedInput = validateInput(input, yurtSchemas.update);

      // Update yurt
      return context.prisma.yurt.update({
        where: { id },
        data: validatedInput
      });
    },

    // Delete a yurt (admin only)
    deleteYurt: async (_: any, { id }: { id: string }, context: Context): Promise<boolean> => {
      if (!isAdmin(context)) {
        throw new ForbiddenError('Not authorized to delete yurts');
      }

      // Check if yurt has any bookings
      const bookings = await context.prisma.booking.findMany({
        where: {
          yurtId: id,
          status: { in: ['PENDING', 'CONFIRMED'] }
        }
      });

      if (bookings.length > 0) {
        throw new Error('Cannot delete yurt with active bookings');
      }

      // Delete yurt
      await context.prisma.yurt.delete({
        where: { id }
      });

      return true;
    }
  },

  // Resolve the bookings field for Yurt type
  Yurt: {
    bookings: async (parent: any, _: any, context: Context) => {
      // If bookings are already loaded, return them
      if (parent.bookings) {
        return parent.bookings;
      }

      // Otherwise, fetch bookings for this yurt
      return context.prisma.booking.findMany({
        where: { yurtId: parent.id }
      });
    }
  }
};

export default yurtResolvers;