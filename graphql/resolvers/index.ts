import userResolvers from './user';
import yurtResolvers from './yurt';
import travelResolvers from './travel';
import productResolvers from './product';
import bookingResolvers from './booking';
import orderResolvers from './order';
import categoryResolvers from './category';

// Combine all resolvers
export default [
  userResolvers,
  yurtResolvers,
  travelResolvers,
  productResolvers,
  bookingResolvers,
  orderResolvers,
  categoryResolvers
];