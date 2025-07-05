import { gql } from 'apollo-server-express';

export default gql`
  type Yurt {
    id: ID!
    name: String!
    description: String!
    location: String!
    pricePerNight: Float!
    capacity: Int!
    amenities: String!
    images: String!
    createdAt: String!
    updatedAt: String!
    bookings: [Booking!]
  }

  extend type Query {
    yurts(
      first: Int
      after: String
      last: Int
      before: String
      filter: String
      orderBy: String
    ): YurtConnection!
    yurt(id: ID!): Yurt
    availableYurts(startDate: String!, endDate: String!, capacity: Int): [Yurt!]!
  }

  type YurtConnection {
    edges: [YurtEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type YurtEdge {
    node: Yurt!
    cursor: String!
  }

  input CreateYurtInput {
    name: String!
    description: String!
    location: String!
    pricePerNight: Float!
    capacity: Int!
    amenities: String!
    images: String!
  }

  input UpdateYurtInput {
    name: String
    description: String
    location: String
    pricePerNight: Float
    capacity: Int
    amenities: String
    images: String
  }

  extend type Mutation {
    createYurt(input: CreateYurtInput!): Yurt!
    updateYurt(id: ID!, input: UpdateYurtInput!): Yurt!
    deleteYurt(id: ID!): Boolean!
  }
`;