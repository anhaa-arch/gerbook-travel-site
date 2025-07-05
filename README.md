# Mongolian Tourism Booking System

A production-ready Node.js backend for booking yurts, multi-day countryside travels, and managing products for tourists.

## 📋 Features

- **User Management**: Customer and admin roles with JWT authentication
- **Yurt Booking**: Book yurts with date range, prevent double-booking
- **Travel Booking**: Multi-day itinerary with dynamic start dates
- **Product Orders**: Manage stock, support multiple products per order
- **GraphQL API**: Queries and mutations with pagination, sorting, filtering
- **TypeScript Code Generation**: Automatic generation of TypeScript types from GraphQL schema
- **Security**: Helmet, rate limiting, input validation with Joi
- **Database**: MySQL with Prisma ORM

## 🛠️ Tech Stack

- **Language**: TypeScript
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: MySQL
- **Auth**: JWT-based
- **Validation**: Joi
- **API**: GraphQL with Apollo Server
- **Type Generation**: GraphQL Code Generator
- **Deployment**: Docker + docker-compose

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MySQL (for local development)
- Docker and docker-compose (for deployment)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/mongolian-tourism-booking.git
   cd mongolian-tourism-booking
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file with your database credentials and JWT secret.

4. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

5. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

6. Generate TypeScript types from GraphQL schema:
   ```bash
   npm run generate
   ```

7. Start the development server:
   ```bash
   npm start
   ```

The server will be running at http://localhost:5000 with GraphQL endpoint at http://localhost:5000/graphql. Generated TypeScript types will be available in the `generated/graphql.ts` file.

## 🐳 Docker Deployment

1. Build and start the containers:
   ```bash
   docker-compose up -d
   ```

2. Run database migrations:
   ```bash
   docker-compose exec app npx prisma migrate deploy
   ```

3. Access the GraphQL API at http://localhost:5000/graphql

## 🧪 Testing

The project uses Jest for testing, with TypeScript support via ts-jest. Tests are organized into unit tests and integration tests.

### Test Structure

```
tests/
├── setup.ts                # Global test setup
├── utils/                  # Tests for utility functions
│   └── auth/               # Tests for authentication utilities
├── graphql/                # Tests for GraphQL resolvers
│   └── resolvers/          # Tests for resolvers
├── middleware/             # Tests for Express middleware
└── integration/            # Integration tests
    ├── setup.ts            # Integration test setup
    └── user.test.ts        # User API integration tests
```

### Running Tests

Run all tests:
```bash
npm test
```

Run tests in watch mode (for development):
```bash
npm run test:watch
```

Generate test coverage report:
```bash
npm run test:coverage
```

### Test Types

1. **Unit Tests**: Test individual functions and components in isolation
   - Authentication utilities (JWT, password hashing)
   - GraphQL resolvers
   - Middleware functions

2. **Integration Tests**: Test API endpoints with a test server
   - GraphQL queries and mutations
   - Authentication flows
   - Error handling

### Adding New Tests

1. Create a new test file in the appropriate directory
2. Import the module to test
3. Write test cases using Jest's `describe` and `it` functions
4. Run the tests to verify they pass

### Mocking

The tests use Jest's mocking capabilities to mock:
- Prisma client for database operations
- JWT utilities for authentication
- External services and dependencies

This allows testing components in isolation without external dependencies.

## 📝 API Documentation

The API is documented using GraphQL introspection. You can explore the API using GraphQL Playground at http://localhost:5000/graphql when the server is running.

### TypeScript Types

The project includes automatic generation of TypeScript types from the GraphQL schema. This provides type safety when working with the API in TypeScript client applications.

To generate the types:

```bash
npm run generate
```

The generated types will be available in `generated/graphql.ts`. These types can be imported and used in client applications to provide type safety when working with GraphQL operations.

For more information on how to use the generated types, see the documentation in `generated/README.md`.

### Main Entities

- **Users**: Customer and admin roles
- **Yurts**: Accommodations with location, price, capacity
- **Travels**: Multi-day trips with itinerary
- **Products**: Items for sale with stock management
- **Categories**: Product categorization
- **Bookings**: Yurt reservations with date range
- **TravelBookings**: Travel reservations with number of people
- **Orders**: Product purchases with shipping details

## 📁 Project Structure

```
├── prisma/              # Prisma schema and migrations
├── generated/           # Generated TypeScript types from GraphQL schema
│   └── graphql.ts       # Generated TypeScript types
├── src/
│   ├── graphql/         # GraphQL schema and resolvers
│   │   ├── schema/      # GraphQL type definitions
│   │   └── resolvers/   # GraphQL resolvers
│   ├── middleware/      # Express middleware
│   ├── utils/           # Utility functions
│   │   ├── auth/        # Authentication utilities
│   │   └── validation/  # Input validation
│   └── server.ts        # Express server setup
├── codegen.ts           # GraphQL Code Generator configuration
├── Dockerfile           # Docker configuration
├── docker-compose.yml   # Docker Compose configuration
└── README.md            # Project documentation
```

## 🔐 Authentication

The API uses JWT for authentication. To access protected endpoints:

1. Register a user or login to get a token
2. Include the token in the Authorization header:
   ```
   Authorization: Bearer YOUR_TOKEN_HERE
   ```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
