import { gql } from 'apollo-server-express';

export default gql`
  enum Role {
    USER
    CUSTOMER
    HERDER
    ADMIN
  }

  type User {
    id: ID!
    email: String!
    name: String!
    phone: String
    role: Role!
    createdAt: String!
    updatedAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  extend type Query {
    me: User
    users(
      first: Int
      after: String
      last: Int
      before: String
      filter: String
      orderBy: String
    ): UserConnection!
    user(id: ID!): User
    allUsers: [User!]!
  }

  type UserConnection {
    edges: [UserEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type UserEdge {
    node: User!
    cursor: String!
  }

  input CreateUserInput {
    email: String!
    password: String!
    name: String!
    phone: String
    role: Role
  }

  input UpdateUserInput {
    email: String
    password: String
    name: String
    phone: String
    role: Role
  }

  extend type Mutation {
    register(input: CreateUserInput!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    forgotPassword(email: String!): ForgotPasswordResponse!
    resetPassword(token: String!, newPassword: String!): AuthPayload!
    sendOtp(phone: String!): ForgotPasswordResponse!
    verifyOtp(phone: String!, otp: String!): AuthPayload!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    deleteUser(id: ID!): Boolean!
  }

  type ForgotPasswordResponse {
    message: String!
  }
`;
