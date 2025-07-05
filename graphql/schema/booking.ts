import { gql } from 'apollo-server-express';

export default gql`
  type Booking {
    id: ID!
    userId: ID!
    user: User!
    yurtId: ID!
    yurt: Yurt!
    startDate: String!
    endDate: String!
    totalPrice: Float!
    status: BookingStatus!
    createdAt: String!
    updatedAt: String!
  }

  extend type Query {
    bookings(
      userId: ID
      yurtId: ID
      status: BookingStatus
      first: Int
      after: String
      last: Int
      before: String
    ): BookingConnection!
    booking(id: ID!): Booking
    checkYurtAvailability(yurtId: ID!, startDate: String!, endDate: String!): Boolean!
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

  input CreateBookingInput {
    yurtId: ID!
    startDate: String!
    endDate: String!
  }

  input UpdateBookingInput {
    startDate: String
    endDate: String
    status: BookingStatus
  }

  extend type Mutation {
    createBooking(input: CreateBookingInput!): Booking!
    updateBooking(id: ID!, input: UpdateBookingInput!): Booking!
    cancelBooking(id: ID!): Booking!
  }
`;