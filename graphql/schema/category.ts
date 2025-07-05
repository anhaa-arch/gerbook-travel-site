import { gql } from 'apollo-server-express';

export default gql`
  type Category {
    id: ID!
    name: String!
    photo: String
    createdAt: String!
    products: [Product!]
  }

  extend type Query {
    categories(
      first: Int
      after: String
      last: Int
      before: String
      filter: String
      orderBy: String
    ): CategoryConnection!
    category(id: ID!): Category
  }

  type CategoryConnection {
    edges: [CategoryEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type CategoryEdge {
    node: Category!
    cursor: String!
  }

  input CreateCategoryInput {
    name: String!
    photo: String
  }

  input UpdateCategoryInput {
    name: String
    photo: String
  }

  extend type Mutation {
    createCategory(input: CreateCategoryInput!): Category!
    updateCategory(id: ID!, input: UpdateCategoryInput!): Category!
    deleteCategory(id: ID!): Boolean!
  }
`;