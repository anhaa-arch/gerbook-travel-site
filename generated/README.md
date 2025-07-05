# GraphQL Type Generation

This directory contains automatically generated TypeScript types from the GraphQL schema.

## Generated Files

- `graphql.ts`: Contains TypeScript types for the GraphQL schema, operations, and resolvers.

## How to Generate Types

Run the following command to generate the TypeScript types:

```bash
npm run generate
```

This will:
1. Read the GraphQL schema from the `graphql/schema` directory
2. Generate TypeScript types for the schema, operations, and resolvers
3. Output the generated types to `generated/graphql.ts`
4. Generate a GraphQL schema JSON file for introspection at `graphql.schema.json`

## Using the Generated Types in Client Applications

The generated types can be used in client applications to provide type safety when working with GraphQL operations.

### Example Usage in a React Component with Apollo Client

```typescript
import { useQuery } from '@apollo/client';
import { GetUserQuery, GetUserQueryVariables } from 'path/to/generated/graphql';

const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
      email
    }
  }
`;

function UserProfile({ userId }: { userId: string }) {
  const { loading, error, data } = useQuery<GetUserQuery, GetUserQueryVariables>(
    GET_USER,
    {
      variables: { id: userId },
    }
  );

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h1>{data?.user?.name}</h1>
      <p>{data?.user?.email}</p>
    </div>
  );
}
```

## Benefits of Using Generated Types

- **Type Safety**: Catch errors at compile time rather than runtime
- **Autocompletion**: Get autocompletion for GraphQL operations in your IDE
- **Refactoring Support**: Easily refactor GraphQL operations with confidence
- **Documentation**: Generated types serve as documentation for your GraphQL API