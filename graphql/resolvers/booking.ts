import { ForbiddenError } from 'apollo-server-express';
import { Booking } from '@prisma/client';
import { getUserId, isAdmin } from '../../utils/auth/jwt';
import { validateInput, bookingSchemas } from '../../utils/validation';

interface Context {
  prisma: any;
  req: any;
}

const bookingResolvers = {
  Query: {
    // Get a list of bookings with pagination, filtering, and sorting
    bookings: async (_: any, args: any, context: Context) => {
      const userId = getUserId(context);
      const isUserAdmin = isAdmin(context);
      
      const { userId: queryUserId, yurtId, status, first = 10, after, last, before } = args;
      
      // Build the where clause for filtering
      let where: any = {};
      
      // If not admin, only show user's own bookings
      if (!isUserAdmin) {
        where.userId = userId;
      } 
      // If admin and userId is provided, filter by that userId
      else if (queryUserId) {
        where.userId = queryUserId;
      }
      
      // Add other filters
      if (yurtId) {
        where.yurtId = yurtId;
      }
      
      if (status) {
        where.status = status;
      }

      // Get total count
      const totalCount = await context.prisma.booking.count({ where });

      // Get bookings with pagination
      const bookings = await context.prisma.booking.findMany({
        where,
        take: first,
        skip: after ? 1 : 0,
        cursor: after ? { id: after } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          user: true,
          yurt: true
        }
      });

      // Create edges and pageInfo
      const edges = bookings.map(booking => ({
        node: booking,
        cursor: booking.id
      }));

      const pageInfo = {
        hasNextPage: bookings.length === first,
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

    // Get a booking by ID
    booking: async (_: any, { id }: { id: string }, context: Context) => {
      const userId = getUserId(context);
      const isUserAdmin = isAdmin(context);
      
      const booking = await context.prisma.booking.findUnique({
        where: { id },
        include: {
          user: true,
          yurt: true
        }
      });
      
      // Check if booking exists
      if (!booking) {
        throw new Error('Booking not found');
      }
      
      // Check if user is authorized to view this booking
      if (!isUserAdmin && booking.userId !== userId) {
        throw new ForbiddenError('Not authorized to view this booking');
      }
      
      return booking;
    },

    // Check if a yurt is available for a specific date range
    checkYurtAvailability: async (_: any, { yurtId, startDate, endDate }: { yurtId: string; startDate: string; endDate: string }, context: Context) => {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Validate dates
      if (start >= end) {
        throw new Error('End date must be after start date');
      }
      
      // Check if yurt exists
      const yurt = await context.prisma.yurt.findUnique({
        where: { id: yurtId }
      });
      
      if (!yurt) {
        throw new Error('Yurt not found');
      }
      
      // Check for overlapping bookings
      const overlappingBookings = await context.prisma.booking.findMany({
        where: {
          yurtId,
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
      });
      
      // Return true if no overlapping bookings found
      return overlappingBookings.length === 0;
    }
  },

  Mutation: {
    // Create a new booking
    createBooking: async (_: any, { input }: { input: any }, context: Context): Promise<Booking> => {
      const userId = getUserId(context);
      
      // Validate input
      const validatedInput = validateInput(input, bookingSchemas.create);
      const { yurtId, startDate, endDate } = validatedInput;
      
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Check if yurt exists
      const yurt = await context.prisma.yurt.findUnique({
        where: { id: yurtId }
      });
      
      if (!yurt) {
        throw new Error('Yurt not found');
      }
      
      // Check for overlapping bookings
      const isAvailable = await bookingResolvers.Query.checkYurtAvailability(
        null,
        { yurtId, startDate, endDate },
        context
      );
      
      if (!isAvailable) {
        throw new Error('Yurt is not available for the selected dates');
      }
      
      // Calculate number of nights
      const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      
      // Calculate total price
      const totalPrice = nights * yurt.pricePerNight;
      
      // Create booking
      return context.prisma.booking.create({
        data: {
          userId,
          yurtId,
          startDate: start,
          endDate: end,
          totalPrice,
          status: 'PENDING'
        }
      });
    },

    // Update a booking
    updateBooking: async (_: any, { id, input }: { id: string; input: any }, context: Context): Promise<Booking> => {
      const userId = getUserId(context);
      const isUserAdmin = isAdmin(context);
      
      // Validate input
      const validatedInput = validateInput(input, bookingSchemas.update);
      
      // Get the booking
      const booking = await context.prisma.booking.findUnique({
        where: { id },
        include: { yurt: true }
      });
      
      // Check if booking exists
      if (!booking) {
        throw new Error('Booking not found');
      }
      
      // Check if user is authorized to update this booking
      if (!isUserAdmin && booking.userId !== userId) {
        throw new ForbiddenError('Not authorized to update this booking');
      }
      
      // Check if booking can be updated (not CANCELLED or COMPLETED)
      if (booking.status === 'CANCELLED' || booking.status === 'COMPLETED') {
        throw new Error(`Cannot update a ${booking.status.toLowerCase()} booking`);
      }
      
      const updateData: any = { ...validatedInput };
      
      // If dates are being updated, recalculate total price
      if (updateData.startDate || updateData.endDate) {
        const start = new Date(updateData.startDate || booking.startDate);
        const end = new Date(updateData.endDate || booking.endDate);
        
        // Validate dates
        if (start >= end) {
          throw new Error('End date must be after start date');
        }
        
        // Check for overlapping bookings (excluding this booking)
        const overlappingBookings = await context.prisma.booking.findMany({
          where: {
            id: { not: id },
            yurtId: booking.yurtId,
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
        });
        
        if (overlappingBookings.length > 0) {
          throw new Error('Yurt is not available for the selected dates');
        }
        
        // Calculate number of nights
        const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        
        // Calculate total price
        updateData.totalPrice = nights * booking.yurt.pricePerNight;
      }
      
      // Update booking
      return context.prisma.booking.update({
        where: { id },
        data: updateData
      });
    },

    // Cancel a booking
    cancelBooking: async (_: any, { id }: { id: string }, context: Context): Promise<Booking> => {
      const userId = getUserId(context);
      const isUserAdmin = isAdmin(context);
      
      // Get the booking
      const booking = await context.prisma.booking.findUnique({
        where: { id }
      });
      
      // Check if booking exists
      if (!booking) {
        throw new Error('Booking not found');
      }
      
      // Check if user is authorized to cancel this booking
      if (!isUserAdmin && booking.userId !== userId) {
        throw new ForbiddenError('Not authorized to cancel this booking');
      }
      
      // Check if booking can be cancelled (not already CANCELLED or COMPLETED)
      if (booking.status === 'CANCELLED' || booking.status === 'COMPLETED') {
        throw new Error(`Cannot cancel a ${booking.status.toLowerCase()} booking`);
      }
      
      // Cancel booking
      return context.prisma.booking.update({
        where: { id },
        data: { status: 'CANCELLED' }
      });
    }
  },

  // Resolve the user field for Booking type
  Booking: {
    user: async (parent: any, _: any, context: Context) => {
      // If user is already loaded, return it
      if (parent.user) {
        return parent.user;
      }
      
      // Otherwise, fetch user for this booking
      return context.prisma.user.findUnique({
        where: { id: parent.userId }
      });
    },
    
    // Resolve the yurt field for Booking type
    yurt: async (parent: any, _: any, context: Context) => {
      // If yurt is already loaded, return it
      if (parent.yurt) {
        return parent.yurt;
      }
      
      // Otherwise, fetch yurt for this booking
      return context.prisma.yurt.findUnique({
        where: { id: parent.yurtId }
      });
    }
  }
};

export default bookingResolvers;