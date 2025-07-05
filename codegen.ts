import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: "./graphql/schema/**/*.ts",
  generates: {
    "generated/graphql.ts": {
      plugins: [
        "typescript",
        "typescript-resolvers",
        "typescript-operations"
      ],
      config: {
        contextType: "./server#ApolloContext",
        useIndexSignature: true,
        // This will make the generated types compatible with Apollo Client
        withHooks: true,
        withHOC: false,
        withComponent: false,
      },
    },
    "./graphql.schema.json": {
      plugins: ["introspection"]
    }
  }
};

export default config;