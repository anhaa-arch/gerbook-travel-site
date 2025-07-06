import client from "../lib/apolloClient";
import { DocumentNode, OperationVariables, TypedDocumentNode } from "@apollo/client";
import { ApolloError } from "@apollo/client/errors";

/**
 * Fetch GraphQL data with Apollo Client in a reusable, typed way.
 * This is useful for server-side data fetching or when you need to fetch data outside of React components.
 * 
 * @param query GraphQL document (gql``)
 * @param variables Query variables (optional)
 * @returns { data, error }
 */
export async function graphqlFetch<TData = any, TVariables extends OperationVariables = Record<string, any>>(
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  variables?: TVariables
): Promise<{ data: TData | null; error: ApolloError | null }> {
  try {
    const { data } = await client.query<TData, TVariables>({
      query,
      variables,
      fetchPolicy: "no-cache", // Use "cache-first" for better performance if caching is desired
    });
    return { data, error: null };
  } catch (error) {
    console.error("GraphQL Fetch Error:", error);
    return { data: null, error: error as ApolloError };
  }
}