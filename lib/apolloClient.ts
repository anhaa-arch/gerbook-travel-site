import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const client = new ApolloClient({
  link: new HttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:8000/graphql",
    // Add headers if needed for authentication
    // headers: { 
    //   Authorization: `Bearer ${token}` 
    // }
  }),
  cache: new InMemoryCache(),
  // Add default options if needed
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});

export default client;