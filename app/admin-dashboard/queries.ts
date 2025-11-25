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
    bookings {
      totalCount
    }
  }
`

export const GET_ALL_userS = gql`
  query GetAllusers {
    users {
      edges {
        node {
          id
          name
          email
          role
          phone
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
          description
          ownerId
          owner {
            id
            name
            email
            phone
            role
          }
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
            phone
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
          shippingAddress
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
            phone
          }
          yurt {
            id
            name
            location
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

// Mutations for CRUD operations

export const CREATE_user = gql`
  mutation Createuser($input: CreateuserInput!) {
    register(input: $input) {
      token
      user {
        id
        name
        email
        role
        phone
      }
    }
  }
`

export const UPDATE_user = gql`
  mutation Updateuser($id: ID!, $input: UpdateuserInput!) {
    updateuser(id: $id, input: $input) {
      id
      name
      email
      role
      phone
    }
  }
`

export const DELETE_user = gql`
  mutation Deleteuser($id: ID!) {
    deleteuser(id: $id)
  }
`

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
    }
  }
`

export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id)
  }
`

export const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`
