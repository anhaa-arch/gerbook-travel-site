import { gql } from 'apollo-server-express';

export default gql`
  extend type Mutation {
    seedMockData: Boolean!
    clearMockData: Boolean!
  }
`;


