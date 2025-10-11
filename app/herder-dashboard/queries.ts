import { gql } from '@apollo/client'

export const GET_HERDER_STATS = gql`
  query GetHerderStats($userId: ID!) {
    products {
      totalCount
    }
    yurts {
      totalCount
    }
    orders {
      totalCount
    }
    bookings {
      totalCount
    }
  }
`

export const GET_HERDER_PRODUCTS = gql`
  query GetHerderProducts {
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

export const GET_HERDER_YURTS = gql`
  query GetHerderYurts {
    yurts {
      edges {
        node {
          id
          name
          description
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

export const GET_HERDER_ORDERS = gql`
  query GetHerderOrders {
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
              images
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

export const GET_HERDER_BOOKINGS = gql`
  query GetHerderBookings {
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
            images
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
