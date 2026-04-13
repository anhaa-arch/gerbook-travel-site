import { gql } from '@apollo/client'

export const GET_user_STATS = gql`
  query GetuserStats {
    me {
      id
      name
      email
      role
    }
    myBookingsStats {
      totalCount
    }
    myOrdersStats {
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
            name_en
            name_ko
            location
            location_en
            location_ko
            images
            description
            description_en
            description_ko
            amenities
            amenities_en
            amenities_ko
            owner {
              id
              name
            }
          }
          ownerPhone
          ownerEmail
          startDate
          endDate
          totalPrice
          status
          qpayInvoiceId
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
              name_en
              name_ko
              images
            }
            quantity
            price
          }
          totalPrice
          status
          qpayInvoiceId
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
            name_en
            name_ko
            location
            location_en
            location_ko
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
          name_en
          name_ko
          description
          description_en
          description_ko
          location
          location_en
          location_ko
          pricePerNight
          capacity
          amenities
          amenities_en
          amenities_ko
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
          name_en
          name_ko
          description
          description_en
          description_ko
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

export const GET_SAVED_YURTS = gql`
  query GetSavedYurts {
    savedYurts {
      id
      yurt {
        id
        name
        name_en
        name_ko
        location
        location_en
        location_ko
        pricePerNight
        images
      }
      createdAt
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
          name_en
          name_ko
          description
          description_en
          description_ko
          duration
          basePrice
          location
          location_en
          location_ko
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

export const GET_user_EVENT_BOOKINGS = gql`
  query GetuserEventBookings {
    myEventBookings {
      id
      numberOfPeople
      totalPrice
      status
      qpayInvoiceId
      createdAt
      event {
        id
        title
        title_en
        title_ko
        location
        location_en
        location_ko
        startDate
        endDate
        images
      }
    }
  }
`