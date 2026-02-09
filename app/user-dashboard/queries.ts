import { gql } from '@apollo/client'

export const GET_user_STATS = gql`
  query GetuserStats {
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

export const GET_user_BOOKINGS = gql`
  query GetuserBookings($userId: ID!) {
    bookings(userId: $userId) {
      edges {
        node {
          id
          yurt {
            id
            name
            location
            images
            owner {
              id
              name
              email
              phone
            }
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

export const GET_user_ORDERS = gql`
  query GetuserOrders($userId: ID!) {
    orders(userId: $userId) {
      edges {
        node {
          id
          orderitem {
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

export const GET_user_TRAVEL_BOOKINGS = gql`
  query GetuserTravelBookings($userId: ID!) {
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

// Mutations for user dashboard
export const CREATE_BOOKING = gql`
  mutation CreateBooking($input: CreateBookingInput!) {
    createBooking(input: $input) {
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
`

export const CREATE_ORDER = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      id
      orderitem {
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
`

export const CREATE_TRAVEL_BOOKING = gql`
  mutation CreateTravelBooking($input: CreateTravelBookingInput!) {
    createTravelBooking(input: $input) {
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
`

export const CANCEL_BOOKING = gql`
  mutation CancelBooking($id: ID!) {
    cancelBooking(id: $id) {
      id
      status
    }
  }
`

export const CANCEL_ORDER = gql`
  mutation CancelOrder($id: ID!) {
    cancelOrder(id: $id) {
      id
      status
    }
  }
`