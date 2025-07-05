import { gql } from 'apollo-server-express';
import userSchema from './user';
import yurtSchema from './yurt';
import travelSchema from './travel';
import productSchema from './product';
import bookingSchema from './booking';
import orderSchema from './order';
import categorySchema from './category';

// Base schema with Query and Mutation types
const baseSchema = gql`
  type Query {
    _: Boolean
  }

  type Mutation {
    _: Boolean
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }
`;

// Combine all schemas
export default [
  baseSchema,
  userSchema,
  yurtSchema,
  travelSchema,
  productSchema,
  bookingSchema,
  orderSchema,
  categorySchema
];