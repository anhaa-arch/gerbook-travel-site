import { gql } from '@apollo/client'

export const GET_USER_STATS = gql`
  query GetUserStats {
    me {
      id
      name
      email
    }
    bookings(userId: $userId) {
      totalCount
    }
    orders(userId: $userId) {
      totalCount
    }
  }
`

export const GET_USER_BOOKINGS = gql`
  query GetUserBookings($userId: ID!) {
    bookings(userId: $userId) {
      edges {
        node {
          id
          yurt {
            id
            name
            location
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

export const GET_USER_ORDERS = gql`
  query GetUserOrders($userId: ID!) {
    orders(userId: $userId) {
      edges {
        node {
          id
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

export const GET_USER_TRAVEL_BOOKINGS = gql`
  query GetUserTravelBookings($userId: ID!) {
    travelBookings(userId: $userId) {
      edges {
        node {
          id
          travel {
            id
            name
            location
            images
          }
          startDate
          numberOfPeople
          totalPrice
          status
          createdAt
        }
      }
    }
  }
`

export const GET_AVAILABLE_YURTS = gql`
  query GetAvailableYurts {
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
        }
      }
    }
  }
`

export const GET_AVAILABLE_PRODUCTS = gql`
  query GetAvailableProducts {
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
        }
      }
    }
  }
`

export const GET_AVAILABLE_TRAVELS = gql`
  query GetAvailableTravels {
    travels {
      edges {
        node {
          id
          name
          description
          duration
          basePrice
          location
          images
        }
      }
    }
  }
`
