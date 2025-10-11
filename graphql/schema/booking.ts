import { gql } from 'apollo-server-express';

export default gql`
  enum BookingStatus {
    PENDING
    CONFIRMED
    CANCELLED
    COMPLETED
  }

  type Booking {
    id: ID!
    user: User!
    yurt: Yurt!
    startDate: String!
    endDate: String!
    totalPrice: Float!
    status: BookingStatus!
    createdAt: String!
    updatedAt: String!
  }

  type TravelBooking {
    id: ID!
    user: User!
    travel: Travel!
    startDate: String!
    numberOfPeople: Int!
    totalPrice: Float!
    status: BookingStatus!
    createdAt: String!
    updatedAt: String!
  }

  extend type Query {
    bookings(
      first: Int
      after: String
      last: Int
      before: String
      filter: String
      orderBy: String
      userId: ID
    ): BookingConnection!
    booking(id: ID!): Booking
    travelBookings(
      first: Int
      after: String
      last: Int
      before: String
      filter: String
      orderBy: String
      userId: ID
    ): TravelBookingConnection!
    travelBooking(id: ID!): TravelBooking
    availableYurts(startDate: String!, endDate: String!, capacity: Int): [Yurt!]!
  }

  type BookingConnection {
    edges: [BookingEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type BookingEdge {
    node: Booking!
    cursor: String!
  }

  type TravelBookingConnection {
    edges: [TravelBookingEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type TravelBookingEdge {
    node: TravelBooking!
    cursor: String!
  }

  input CreateBookingInput {
    yurtId: ID!
    startDate: String!
    endDate: String!
  }

  input CreateTravelBookingInput {
    travelId: ID!
    startDate: String!
    numberOfPeople: Int!
  }

  extend type Mutation {
    createBooking(input: CreateBookingInput!): Booking!
    updateBooking(id: ID!, input: UpdateBookingInput!): Booking!
    cancelBooking(id: ID!): Booking!
    deleteBooking(id: ID!): Boolean!
    createTravelBooking(input: CreateTravelBookingInput!): TravelBooking!
    updateTravelBooking(id: ID!, input: UpdateTravelBookingInput!): TravelBooking!
    cancelTravelBooking(id: ID!): TravelBooking!
    deleteTravelBooking(id: ID!): Boolean!
  }

  input UpdateBookingInput {
    startDate: String
    endDate: String
    status: BookingStatus
  }

  input UpdateTravelBookingInput {
    startDate: String
    numberOfPeople: Int
    status: BookingStatus
  }
`;