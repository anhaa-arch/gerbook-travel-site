import { gql } from '@apollo/client'

export const GET_ADMIN_STATS = gql`
  query GetAdminStats {
    users {
      totalCount
    }
    yurts {
      totalCount
    }
    products {
      totalCount
    }
    orders {
      totalCount
    }
  }
`

export const GET_ALL_USERS = gql`
  query GetAllUsers {
    users {
      edges {
        node {
          id
          name
          email
          role
          createdAt
        }
      }
    }
  }
`

export const GET_ALL_YURTS = gql`
  query GetAllYurts {
    yurts {
      edges {
        node {
          id
          name
          location
          pricePerNight
          capacity
          amenities
          images
          createdAt
        }
      }
    }
  }
`

export const GET_ALL_PRODUCTS = gql`
  query GetAllProducts {
    products {
      edges {
        node {
          id
          name
          description
          price
          stock
          images
          category {
            id
            name
          }
          createdAt
        }
      }
    }
  }
`

export const GET_ALL_ORDERS = gql`
  query GetAllOrders {
    orders {
      edges {
        node {
          id
          user {
            id
            name
            email
          }
          items {
            id
            product {
              id
              name
            }
            quantity
            price
          }
          totalPrice
          status
          createdAt
        }
      }
    }
  }
`

export const GET_ALL_BOOKINGS = gql`
  query GetAllBookings {
    bookings {
      edges {
        node {
          id
          user {
            id
            name
            email
          }
          yurt {
            id
            name
          }
          startDate
          endDate
          totalPrice
          status
          createdAt
        }
      }
    }
  }
`
