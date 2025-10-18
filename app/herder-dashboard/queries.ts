import { gql } from '@apollo/client'

export const GET_HERDER_STATS = gql`
  query GetHerderStats {
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
  query GetHerderYurts($userId: ID!) {
    yurts(userId: $userId) {
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
            phone
          }
          yurt {
            id
            name
            images
            location
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

// Mutations for herder dashboard
export const CREATE_YURT = gql`
  mutation CreateYurt($input: CreateYurtInput!) {
    createYurt(input: $input) {
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
`

export const UPDATE_YURT = gql`
  mutation UpdateYurt($id: ID!, $input: UpdateYurtInput!) {
    updateYurt(id: $id, input: $input) {
      id
      name
      description
      location
      pricePerNight
      capacity
      amenities
      images
      updatedAt
    }
  }
`

export const DELETE_YURT = gql`
  mutation DeleteYurt($id: ID!) {
    deleteYurt(id: $id)
  }
`

export const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(input: $input) {
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
`

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: ID!, $input: UpdateProductInput!) {
    updateProduct(id: $id, input: $input) {
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
      updatedAt
    }
  }
`

export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id)
  }
`

export const UPDATE_BOOKING_STATUS = gql`
  mutation UpdateBooking($id: ID!, $input: UpdateBookingInput!) {
    updateBooking(id: $id, input: $input) {
      id
      status
      updatedAt
    }
  }
`