import { gql } from 'apollo-server-express';

export default gql`
  type Travel {
    id: ID!
    name: String!
    description: String!
    duration: Int!
    basePrice: Float!
    location: String!
    itinerary: String!
    images: String!
    createdAt: String!
    updatedAt: String!
    bookings: [TravelBooking!]
  }

  type TravelBooking {
    id: ID!
    userId: ID!
    user: User!
    travelId: ID!
    travel: Travel!
    startDate: String!
    numberOfPeople: Int!
    totalPrice: Float!
    status: BookingStatus!
    createdAt: String!
    updatedAt: String!
  }

  enum BookingStatus {
    PENDING
    CONFIRMED
    CANCELLED
    COMPLETED
  }

  extend type Query {
    travels(
      first: Int
      after: String
      last: Int
      before: String
      filter: String
      orderBy: String
    ): TravelConnection!
    travel(id: ID!): Travel
    travelBookings(
      userId: ID
      travelId: ID
      status: BookingStatus
      first: Int
      after: String
      last: Int
      before: String
    ): TravelBookingConnection!
    travelBooking(id: ID!): TravelBooking
  }

  type TravelConnection {
    edges: [TravelEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type TravelEdge {
    node: Travel!
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

  input CreateTravelInput {
    name: String!
    description: String!
    duration: Int!
    basePrice: Float!
    location: String!
    itinerary: String!
    images: String!
  }

  input UpdateTravelInput {
    name: String
    description: String
    duration: Int
    basePrice: Float
    location: String
    itinerary: String
    images: String
  }

  input CreateTravelBookingInput {
    travelId: ID!
    startDate: String!
    numberOfPeople: Int!
  }

  input UpdateTravelBookingInput {
    startDate: String
    numberOfPeople: Int
    status: BookingStatus
  }

  extend type Mutation {
    createTravel(input: CreateTravelInput!): Travel!
    updateTravel(id: ID!, input: UpdateTravelInput!): Travel!
    deleteTravel(id: ID!): Boolean!
    
    createTravelBooking(input: CreateTravelBookingInput!): TravelBooking!
    updateTravelBooking(id: ID!, input: UpdateTravelBookingInput!): TravelBooking!
    cancelTravelBooking(id: ID!): TravelBooking!
  }
`;