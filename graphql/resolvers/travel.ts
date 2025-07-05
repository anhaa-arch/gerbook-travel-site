import { ForbiddenError } from 'apollo-server-express';
import { Travel, TravelBooking } from '@prisma/client';
import { getUserId, isAdmin } from '../../utils/auth/jwt';
import { validateInput, travelSchemas, travelBookingSchemas } from '../../utils/validation';

interface Context {
  prisma: any;
  req: any;
}

const travelResolvers = {
  Query: {
    // Get a list of travels with pagination, filtering, and sorting
    travels: async (_: any, args: any, context: Context) => {
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
      const totalCount = await context.prisma.travel.count({ where });

      // Get travels with pagination
      const travels = await context.prisma.travel.findMany({
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
      const edges = travels.map(travel => ({
        node: travel,
        cursor: travel.id
      }));

      const pageInfo = {
        hasNextPage: travels.length === first,
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

    // Get a travel by ID
    travel: async (_: any, { id }: { id: string }, context: Context) => {
      return context.prisma.travel.findUnique({
        where: { id },
        include: {
          bookings: true
        }
      });
    },

    // Get a list of travel bookings with pagination, filtering, and sorting
    travelBookings: async (_: any, args: any, context: Context) => {
      const userId = getUserId(context);
      const isUserAdmin = isAdmin(context);
      
      const { userId: queryUserId, travelId, status, first = 10, after, last, before } = args;
      
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
      if (travelId) {
        where.travelId = travelId;
      }
      
      if (status) {
        where.status = status;
      }

      // Get total count
      const totalCount = await context.prisma.travelBooking.count({ where });

      // Get travel bookings with pagination
      const travelBookings = await context.prisma.travelBooking.findMany({
        where,
        take: first,
        skip: after ? 1 : 0,
        cursor: after ? { id: after } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          user: true,
          travel: true
        }
      });

      // Create edges and pageInfo
      const edges = travelBookings.map(booking => ({
        node: booking,
        cursor: booking.id
      }));

      const pageInfo = {
        hasNextPage: travelBookings.length === first,
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

    // Get a travel booking by ID
    travelBooking: async (_: any, { id }: { id: string }, context: Context) => {
      const userId = getUserId(context);
      const isUserAdmin = isAdmin(context);
      
      const booking = await context.prisma.travelBooking.findUnique({
        where: { id },
        include: {
          user: true,
          travel: true
        }
      });
      
      // Check if booking exists
      if (!booking) {
        throw new Error('Travel booking not found');
      }
      
      // Check if user is authorized to view this booking
      if (!isUserAdmin && booking.userId !== userId) {
        throw new ForbiddenError('Not authorized to view this travel booking');
      }
      
      return booking;
    }
  },

  Mutation: {
    // Create a new travel (admin only)
    createTravel: async (_: any, { input }: { input: any }, context: Context): Promise<Travel> => {
      if (!isAdmin(context)) {
        throw new ForbiddenError('Not authorized to create travels');
      }

      // Validate input
      const validatedInput = validateInput(input, travelSchemas.create);

      // Create travel
      return context.prisma.travel.create({
        data: validatedInput
      });
    },

    // Update a travel (admin only)
    updateTravel: async (_: any, { id, input }: { id: string; input: any }, context: Context): Promise<Travel> => {
      if (!isAdmin(context)) {
        throw new ForbiddenError('Not authorized to update travels');
      }

      // Validate input
      const validatedInput = validateInput(input, travelSchemas.update);

      // Update travel
      return context.prisma.travel.update({
        where: { id },
        data: validatedInput
      });
    },

    // Delete a travel (admin only)
    deleteTravel: async (_: any, { id }: { id: string }, context: Context): Promise<boolean> => {
      if (!isAdmin(context)) {
        throw new ForbiddenError('Not authorized to delete travels');
      }

      // Check if travel has any bookings
      const bookings = await context.prisma.travelBooking.findMany({
        where: {
          travelId: id,
          status: { in: ['PENDING', 'CONFIRMED'] }
        }
      });

      if (bookings.length > 0) {
        throw new Error('Cannot delete travel with active bookings');
      }

      // Delete travel
      await context.prisma.travel.delete({
        where: { id }
      });

      return true;
    },

    // Create a new travel booking
    createTravelBooking: async (_: any, { input }: { input: any }, context: Context): Promise<TravelBooking> => {
      const userId = getUserId(context);
      
      // Validate input
      const validatedInput = validateInput(input, travelBookingSchemas.create);
      const { travelId, startDate, numberOfPeople } = validatedInput;
      
      const start = new Date(startDate);
      
      // Check if travel exists
      const travel = await context.prisma.travel.findUnique({
        where: { id: travelId }
      });
      
      if (!travel) {
        throw new Error('Travel not found');
      }
      
      // Calculate total price based on number of people and base price
      const totalPrice = numberOfPeople * travel.basePrice;
      
      // Create travel booking
      return context.prisma.travelBooking.create({
        data: {
          userId,
          travelId,
          startDate: start,
          numberOfPeople,
          totalPrice,
          status: 'PENDING'
        }
      });
    },

    // Update a travel booking
    updateTravelBooking: async (_: any, { id, input }: { id: string; input: any }, context: Context): Promise<TravelBooking> => {
      const userId = getUserId(context);
      const isUserAdmin = isAdmin(context);
      
      // Validate input
      const validatedInput = validateInput(input, travelBookingSchemas.update);
      
      // Get the booking
      const booking = await context.prisma.travelBooking.findUnique({
        where: { id },
        include: { travel: true }
      });
      
      // Check if booking exists
      if (!booking) {
        throw new Error('Travel booking not found');
      }
      
      // Check if user is authorized to update this booking
      if (!isUserAdmin && booking.userId !== userId) {
        throw new ForbiddenError('Not authorized to update this travel booking');
      }
      
      // Check if booking can be updated (not CANCELLED or COMPLETED)
      if (booking.status === 'CANCELLED' || booking.status === 'COMPLETED') {
        throw new Error(`Cannot update a ${booking.status.toLowerCase()} travel booking`);
      }
      
      const updateData: any = { ...validatedInput };
      
      // If number of people is being updated, recalculate total price
      if (updateData.numberOfPeople) {
        updateData.totalPrice = updateData.numberOfPeople * booking.travel.basePrice;
      }
      
      // Update booking
      return context.prisma.travelBooking.update({
        where: { id },
        data: updateData
      });
    },

    // Cancel a travel booking
    cancelTravelBooking: async (_: any, { id }: { id: string }, context: Context): Promise<TravelBooking> => {
      const userId = getUserId(context);
      const isUserAdmin = isAdmin(context);
      
      // Get the booking
      const booking = await context.prisma.travelBooking.findUnique({
        where: { id }
      });
      
      // Check if booking exists
      if (!booking) {
        throw new Error('Travel booking not found');
      }
      
      // Check if user is authorized to cancel this booking
      if (!isUserAdmin && booking.userId !== userId) {
        throw new ForbiddenError('Not authorized to cancel this travel booking');
      }
      
      // Check if booking can be cancelled (not already CANCELLED or COMPLETED)
      if (booking.status === 'CANCELLED' || booking.status === 'COMPLETED') {
        throw new Error(`Cannot cancel a ${booking.status.toLowerCase()} travel booking`);
      }
      
      // Cancel booking
      return context.prisma.travelBooking.update({
        where: { id },
        data: { status: 'CANCELLED' }
      });
    }
  },

  // Resolve the bookings field for Travel type
  Travel: {
    bookings: async (parent: any, _: any, context: Context) => {
      // If bookings are already loaded, return them
      if (parent.bookings) {
        return parent.bookings;
      }
      
      // Otherwise, fetch bookings for this travel
      return context.prisma.travelBooking.findMany({
        where: { travelId: parent.id }
      });
    }
  },

  // Resolve the user field for TravelBooking type
  TravelBooking: {
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
    
    // Resolve the travel field for TravelBooking type
    travel: async (parent: any, _: any, context: Context) => {
      // If travel is already loaded, return it
      if (parent.travel) {
        return parent.travel;
      }
      
      // Otherwise, fetch travel for this booking
      return context.prisma.travel.findUnique({
        where: { id: parent.travelId }
      });
    }
  }
};

export default travelResolvers;