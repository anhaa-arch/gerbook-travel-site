import { gql } from 'apollo-server-express';

export default gql`
  type Order {
    id: ID!
    userId: ID!
    user: User!
    items: [OrderItem!]!
    totalPrice: Float!
    status: OrderStatus!
    shippingAddress: String!
    paymentInfo: String
    createdAt: String!
    updatedAt: String!
  }

  type OrderItem {
    id: ID!
    orderId: ID!
    order: Order!
    productId: ID!
    product: Product!
    quantity: Int!
    price: Float!
  }

  enum OrderStatus {
    PENDING
    PAID
    SHIPPED
    DELIVERED
    CANCELLED
  }

  extend type Query {
    orders(
      userId: ID
      status: OrderStatus
      first: Int
      after: String
      last: Int
      before: String
    ): OrderConnection!
    order(id: ID!): Order
  }

  type OrderConnection {
    edges: [OrderEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type OrderEdge {
    node: Order!
    cursor: String!
  }

  input OrderItemInput {
    productId: ID!
    quantity: Int!
  }

  input CreateOrderInput {
    items: [OrderItemInput!]!
    shippingAddress: String!
    paymentInfo: String
  }

  input UpdateOrderInput {
    status: OrderStatus
    shippingAddress: String
    paymentInfo: String
  }

  extend type Mutation {
    createOrder(input: CreateOrderInput!): Order!
    updateOrder(id: ID!, input: UpdateOrderInput!): Order!
    cancelOrder(id: ID!): Order!
  }
`;