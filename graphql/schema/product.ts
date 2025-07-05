import { gql } from 'apollo-server-express';

export default gql`
  type Product {
    id: ID!
    name: String!
    description: String!
    price: Float!
    stock: Int!
    images: String!
    categoryId: ID!
    category: Category!
    createdAt: String!
    updatedAt: String!
    orderItems: [OrderItem!]
  }

  extend type Query {
    products(
      first: Int
      after: String
      last: Int
      before: String
      filter: String
      orderBy: String
      categoryId: ID
    ): ProductConnection!
    product(id: ID!): Product
  }

  type ProductConnection {
    edges: [ProductEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type ProductEdge {
    node: Product!
    cursor: String!
  }

  input CreateProductInput {
    name: String!
    description: String!
    price: Float!
    stock: Int!
    images: String!
    categoryId: ID!
  }

  input UpdateProductInput {
    name: String
    description: String
    price: Float
    stock: Int
    images: String
    categoryId: ID
  }

  extend type Mutation {
    createProduct(input: CreateProductInput!): Product!
    updateProduct(id: ID!, input: UpdateProductInput!): Product!
    deleteProduct(id: ID!): Boolean!
    updateProductStock(id: ID!, quantity: Int!): Product!
  }
`;