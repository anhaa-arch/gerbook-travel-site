import { getUserId, isAdmin } from '../../utils/auth/jwt';
import { ForbiddenError, UserInputError } from 'apollo-server-express';
import { validateInput } from '../../utils/validation';
import { bookingSchemas } from '../../utils/validation';

interface Context {
  prisma: any;
  req: any;
}

const bookingResolvers = {
  Query: {
    // Get bookings with pagination and filtering
    bookings: async (_: any, args: any, context: Context) => {
      const { first = 10, after, last, before, filter, orderBy, userId } = args;
      const currentUserId = getUserId(context);

      // Build the where clause for filtering
      let where: any = {};

      if (userId) {
        // Users can only see their own bookings, admins can see all
        if (userId !== currentUserId && !isAdmin(context)) {
          throw new ForbiddenError('Not authorized to access this resource');
        }
        where.userId = userId;
      } else {
        // If no userId specified, users can only see their own bookings
        if (!isAdmin(context)) {
          where.userId = currentUserId;
        }
      }

      if (filter) {
        where.OR = [
          { yurt: { name: { contains: filter } } },
          { yurt: { location: { contains: filter } } }
        ];
      }

      // Get total count
      const totalCount = await context.prisma.booking.count({ where });

      // Get bookings with pagination
      const bookings = await context.prisma.booking.findMany({
        where,
        take: first,
        skip: after ? 1 : 0,
        cursor: after ? { id: after } : undefined,
        orderBy: orderBy ? { [orderBy.split('_')[0]]: orderBy.split('_')[1].toLowerCase() } : { createdAt: 'desc' },
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
      const booking = await context.prisma.booking.findUnique({
        where: { id },
        include: {
          user: true,
          yurt: true
        }
      });

      if (!booking) {
        throw new UserInputError('Booking not found');
      }

      // Check if user is authorized to view this booking
      const currentUserId = getUserId(context);
      if (booking.userId !== currentUserId && !isAdmin(context)) {
        throw new ForbiddenError('Not authorized to access this resource');
      }

      return booking;
    },

    // Get travel bookings with pagination and filtering
    travelBookings: async (_: any, args: any, context: Context) => {
      const { first = 10, after, last, before, filter, orderBy, userId } = args;
      const currentUserId = getUserId(context);

      // Build the where clause for filtering
      let where: any = {};

      if (userId) {
        // Users can only see their own travel bookings, admins can see all
        if (userId !== currentUserId && !isAdmin(context)) {
          throw new ForbiddenError('Not authorized to access this resource');
        }
        where.userId = userId;
      } else {
        // If no userId specified, users can only see their own travel bookings
        if (!isAdmin(context)) {
          where.userId = currentUserId;
        }
      }

      if (filter) {
        where.OR = [
          { travel: { name: { contains: filter } } },
          { travel: { location: { contains: filter } } }
        ];
      }

      // Get total count
      const totalCount = await context.prisma.travelBooking.count({ where });

      // Get travel bookings with pagination
      const travelBookings = await context.prisma.travelBooking.findMany({
        where,
        take: first,
        skip: after ? 1 : 0,
        cursor: after ? { id: after } : undefined,
        orderBy: orderBy ? { [orderBy.split('_')[0]]: orderBy.split('_')[1].toLowerCase() } : { createdAt: 'desc' },
        include: {
          user: true,
          travel: true
        }
      });

      // Create edges and pageInfo
      const edges = travelBookings.map(travelBooking => ({
        node: travelBooking,
        cursor: travelBooking.id
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
      const travelBooking = await context.prisma.travelBooking.findUnique({
        where: { id },
        include: {
          user: true,
          travel: true
        }
      });

      if (!travelBooking) {
        throw new UserInputError('Travel booking not found');
      }

      // Check if user is authorized to view this travel booking
      const currentUserId = getUserId(context);
      if (travelBooking.userId !== currentUserId && !isAdmin(context)) {
        throw new ForbiddenError('Not authorized to access this resource');
      }

      return travelBooking;
    },

    // Get available yurts for a date range
    availableYurts: async (_: any, { startDate, endDate, capacity }: { startDate: string, endDate: string, capacity?: number }, context: Context) => {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start >= end) {
        throw new UserInputError('Start date must be before end date');
      }

      // Find yurts that are not booked during the specified period
      const bookedYurtIds = await context.prisma.booking.findMany({
        where: {
          AND: [
            { status: { not: 'CANCELLED' } },
            {
              OR: [
                {
                  AND: [
                    { startDate: { lte: start } },
                    { endDate: { gt: start } }
                  ]
                },
                {
                  AND: [
                    { startDate: { lt: end } },
                    { endDate: { gte: end } }
                  ]
                },
                {
                  AND: [
                    { startDate: { gte: start } },
                    { endDate: { lte: end } }
                  ]
                }
              ]
            }
          ]
        },
        select: { yurtId: true }
      });

      const bookedYurtIdList = bookedYurtIds.map(booking => booking.yurtId);

      // Build where clause for available yurts
      let where: any = {
        id: { notIn: bookedYurtIdList }
      };

      if (capacity) {
        where.capacity = { gte: capacity };
      }

      return context.prisma.yurt.findMany({
        where,
        orderBy: { createdAt: 'desc' }
      });
    }
  },

  Mutation: {
    // Create a new booking
    createBooking: async (_: any, { input }: { input: any }, context: Context) => {
      const userId = getUserId(context);

      // Validate input
      const validatedInput = validateInput(input, bookingSchemas.create);

      // Check if yurt exists
      const yurt = await context.prisma.yurt.findUnique({
        where: { id: validatedInput.yurtId }
      });

      if (!yurt) {
        throw new UserInputError('Yurt not found');
      }

      // Check if yurt is available for the specified dates
      const startDate = new Date(validatedInput.startDate);
      const endDate = new Date(validatedInput.endDate);

      if (startDate >= endDate) {
        throw new UserInputError('Start date must be before end date');
      }

      const existingBooking = await context.prisma.booking.findFirst({
        where: {
          yurtId: validatedInput.yurtId,
          status: { not: 'CANCELLED' },
          OR: [
            {
              AND: [
                { startDate: { lte: startDate } },
                { endDate: { gt: startDate } }
              ]
            },
            {
              AND: [
                { startDate: { lt: endDate } },
                { endDate: { gte: endDate } }
              ]
            },
            {
              AND: [
                { startDate: { gte: startDate } },
                { endDate: { lte: endDate } }
              ]
            }
          ]
        }
      });

      if (existingBooking) {
        throw new UserInputError('Yurt is not available for the specified dates');
      }

      // Calculate total price
      const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const totalPrice = nights * parseFloat(yurt.pricePerNight.toString());

      // Create booking
      const booking = await context.prisma.booking.create({
        data: {
          userId,
          yurtId: validatedInput.yurtId,
          startDate,
          endDate,
          totalPrice,
          status: 'PENDING'
        },
        include: {
          user: true,
          yurt: true
        }
      });

      return booking;
    },

    // Update a booking
    updateBooking: async (_: any, { id, input }: { id: string, input: any }, context: Context) => {
      const userId = getUserId(context);
      const isUserAdmin = isAdmin(context);

      // Check if booking exists
      const existingBooking = await context.prisma.booking.findUnique({
        where: { id },
        include: { user: true, yurt: true }
      });

      if (!existingBooking) {
        throw new UserInputError('Booking not found');
      }

      // Check if user is authorized to update this booking
      if (existingBooking.userId !== userId && !isUserAdmin) {
        throw new ForbiddenError('Not authorized to update this booking');
      }

      // Validate input
      const validatedInput = validateInput(input, bookingSchemas.update);

      // Update booking
      const updatedBooking = await context.prisma.booking.update({
        where: { id },
        data: validatedInput,
        include: {
          user: true,
          yurt: true
        }
      });

      return updatedBooking;
    },

    // Cancel a booking
    cancelBooking: async (_: any, { id }: { id: string }, context: Context) => {
      const userId = getUserId(context);
      const isUserAdmin = isAdmin(context);

      // Check if booking exists
      const existingBooking = await context.prisma.booking.findUnique({
        where: { id }
      });

      if (!existingBooking) {
        throw new UserInputError('Booking not found');
      }

      // Check if user is authorized to cancel this booking
      if (existingBooking.userId !== userId && !isUserAdmin) {
        throw new ForbiddenError('Not authorized to cancel this booking');
      }

      // Update booking status to cancelled
      const updatedBooking = await context.prisma.booking.update({
        where: { id },
        data: { status: 'CANCELLED' },
        include: {
          user: true,
          yurt: true
        }
      });

      return updatedBooking;
    },

    // Delete a booking (admin only)
    deleteBooking: async (_: any, { id }: { id: string }, context: Context) => {
      if (!isAdmin(context)) {
        throw new ForbiddenError('Not authorized to delete bookings');
      }

      // Check if booking exists
      const existingBooking = await context.prisma.booking.findUnique({
        where: { id }
      });

      if (!existingBooking) {
        throw new UserInputError('Booking not found');
      }

      // Delete booking
      await context.prisma.booking.delete({
        where: { id }
      });

      return true;
    },

    // Create a new travel booking
    createTravelBooking: async (_: any, { input }: { input: any }, context: Context) => {
      const userId = getUserId(context);

      // Validate input
      const validatedInput = validateInput(input, bookingSchemas.createTravel);

      // Check if travel exists
      const travel = await context.prisma.travel.findUnique({
        where: { id: validatedInput.travelId }
      });

      if (!travel) {
        throw new UserInputError('Travel not found');
      }

      // Calculate total price
      const totalPrice = parseFloat(travel.basePrice.toString()) * validatedInput.numberOfPeople;

      // Create travel booking
      const travelBooking = await context.prisma.travelBooking.create({
        data: {
          userId,
          travelId: validatedInput.travelId,
          startDate: new Date(validatedInput.startDate),
          numberOfPeople: validatedInput.numberOfPeople,
          totalPrice,
          status: 'PENDING'
        },
        include: {
          user: true,
          travel: true
        }
      });

      return travelBooking;
    },

    // Update a travel booking
    updateTravelBooking: async (_: any, { id, input }: { id: string, input: any }, context: Context) => {
      const userId = getUserId(context);
      const isUserAdmin = isAdmin(context);

      // Check if travel booking exists
      const existingTravelBooking = await context.prisma.travelBooking.findUnique({
        where: { id },
        include: { user: true, travel: true }
      });

      if (!existingTravelBooking) {
        throw new UserInputError('Travel booking not found');
      }

      // Check if user is authorized to update this travel booking
      if (existingTravelBooking.userId !== userId && !isUserAdmin) {
        throw new ForbiddenError('Not authorized to update this travel booking');
      }

      // Validate input
      const validatedInput = validateInput(input, bookingSchemas.updateTravel);

      // Update travel booking
      const updatedTravelBooking = await context.prisma.travelBooking.update({
        where: { id },
        data: validatedInput,
        include: {
          user: true,
          travel: true
        }
      });

      return updatedTravelBooking;
    },

    // Cancel a travel booking
    cancelTravelBooking: async (_: any, { id }: { id: string }, context: Context) => {
      const userId = getUserId(context);
      const isUserAdmin = isAdmin(context);

      // Check if travel booking exists
      const existingTravelBooking = await context.prisma.travelBooking.findUnique({
        where: { id }
      });

      if (!existingTravelBooking) {
        throw new UserInputError('Travel booking not found');
      }

      // Check if user is authorized to cancel this travel booking
      if (existingTravelBooking.userId !== userId && !isUserAdmin) {
        throw new ForbiddenError('Not authorized to cancel this travel booking');
      }

      // Update travel booking status to cancelled
      const updatedTravelBooking = await context.prisma.travelBooking.update({
        where: { id },
        data: { status: 'CANCELLED' },
        include: {
          user: true,
          travel: true
        }
      });

      return updatedTravelBooking;
    },

    // Delete a travel booking (admin only)
    deleteTravelBooking: async (_: any, { id }: { id: string }, context: Context) => {
      if (!isAdmin(context)) {
        throw new ForbiddenError('Not authorized to delete travel bookings');
      }

      // Check if travel booking exists
      const existingTravelBooking = await context.prisma.travelBooking.findUnique({
        where: { id }
      });

      if (!existingTravelBooking) {
        throw new UserInputError('Travel booking not found');
      }

      // Delete travel booking
      await context.prisma.travelBooking.delete({
        where: { id }
      });

      return true;
    }
  }
};

export default bookingResolvers;