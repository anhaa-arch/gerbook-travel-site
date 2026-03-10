import { ApolloClient, InMemoryCache, HttpLink, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      // Handle UNAUTHENTICATED or 401 errors
      if (err.extensions?.code === 'UNAUTHENTICATED' || err.message.includes('Not authenticated')) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          // Force page reload to clear all state and redirect to login
          window.location.href = "/login?redirect=" + encodeURIComponent(window.location.pathname);
        }
      }
    }

    if (process.env.NODE_ENV === "development") {
      graphQLErrors.forEach(({ message, locations, path }) => {
        const loc = Array.isArray(locations)
          ? locations.map(l => `${l.line}:${l.column}`).join(",")
          : String(locations);
        console.log(`[GraphQL error]: Message: ${message}, Location: ${loc}, Path: ${path}`);
      });
    }
  }

  if (networkError && process.env.NODE_ENV === "development") {
    console.log(`[Network error]: ${networkError}`);
    if ((networkError as any).statusCode === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
  }
});

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || "https://api.malchincamp.mn/graphql",
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