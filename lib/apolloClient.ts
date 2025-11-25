import { ApolloClient, InMemoryCache, HttpLink, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (process.env.NODE_ENV === "development") {
    if (graphQLErrors)
      graphQLErrors.forEach(({ message, locations, path }) => {
        const loc = Array.isArray(locations)
          ? locations.map(l => `${l.line}:${l.column}`).join(",")
          : String(locations);
        // eslint-disable-next-line no-console
        console.log(`[GraphQL error]: Message: ${message}, Location: ${loc}, Path: ${path}`);
      });
    if (networkError) {
      // eslint-disable-next-line no-console
      console.log(`[Network error]: ${networkError}`);
    }
  }
});

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://152.42.163.155:8000/graphql",
  // Add headers if needed for authentication
  // headers: { 
  //   Authorization: `Bearer ${token}` 
  // }
});

const authLink = setContext((_, { headers }) => {
  if (typeof window === "undefined") return { headers };
  const token = localStorage.getItem("token");
  return {
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
});

const client = new ApolloClient({
  link: from([errorLink, authLink.concat(httpLink)]),
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