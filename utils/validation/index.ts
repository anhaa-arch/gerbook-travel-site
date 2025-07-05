import Joi from 'joi';
import { UserInputError } from 'apollo-server-express';

// Validate input against a schema and throw UserInputError if validation fails
export const validateInput = <T>(input: T, schema: Joi.ObjectSchema): T => {
  const { error, value } = schema.validate(input, { abortEarly: false });

  if (error) {
    const details = error.details.map(detail => detail.message);
    throw new UserInputError('Validation error', { details });
  }

  return value;
};

// User validation schemas
export const userSchemas = {
  register: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'Password is required'
    }),
    name: Joi.string().required().messages({
      'any.required': 'Name is required'
    }),
    role: Joi.string().valid('CUSTOMER', 'ADMIN')
  }),

  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required'
    })
  }),

  update: Joi.object({
    email: Joi.string().email().messages({
      'string.email': 'Please provide a valid email address'
    }),
    password: Joi.string().min(6).messages({
      'string.min': 'Password must be at least 6 characters long'
    }),
    name: Joi.string(),
    role: Joi.string().valid('CUSTOMER', 'ADMIN')
  })
};

// Yurt validation schemas
export const yurtSchemas = {
  create: Joi.object({
    name: Joi.string().required().messages({
      'any.required': 'Name is required'
    }),
    description: Joi.string().required().messages({
      'any.required': 'Description is required'
    }),
    location: Joi.string().required().messages({
      'any.required': 'Location is required'
    }),
    pricePerNight: Joi.number().positive().required().messages({
      'number.positive': 'Price per night must be a positive number',
      'any.required': 'Price per night is required'
    }),
    capacity: Joi.number().integer().positive().required().messages({
      'number.integer': 'Capacity must be an integer',
      'number.positive': 'Capacity must be a positive number',
      'any.required': 'Capacity is required'
    }),
    amenities: Joi.string().required().messages({
      'any.required': 'Amenities are required'
    }),
    images: Joi.string().required().messages({
      'any.required': 'Images are required'
    })
  }),

  update: Joi.object({
    name: Joi.string(),
    description: Joi.string(),
    location: Joi.string(),
    pricePerNight: Joi.number().positive().messages({
      'number.positive': 'Price per night must be a positive number'
    }),
    capacity: Joi.number().integer().positive().messages({
      'number.integer': 'Capacity must be an integer',
      'number.positive': 'Capacity must be a positive number'
    }),
    amenities: Joi.string(),
    images: Joi.string()
  })
};

// Booking validation schemas
export const bookingSchemas = {
  create: Joi.object({
    yurtId: Joi.string().required().messages({
      'any.required': 'Yurt ID is required'
    }),
    startDate: Joi.date().iso().required().messages({
      'date.base': 'Start date must be a valid date',
      'any.required': 'Start date is required'
    }),
    endDate: Joi.date().iso().greater(Joi.ref('startDate')).required().messages({
      'date.base': 'End date must be a valid date',
      'date.greater': 'End date must be after start date',
      'any.required': 'End date is required'
    })
  }),

  update: Joi.object({
    startDate: Joi.date().iso().messages({
      'date.base': 'Start date must be a valid date'
    }),
    endDate: Joi.date().iso().greater(Joi.ref('startDate')).messages({
      'date.base': 'End date must be a valid date',
      'date.greater': 'End date must be after start date'
    }),
    status: Joi.string().valid('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED')
  })
};

// Travel validation schemas
export const travelSchemas = {
  create: Joi.object({
    name: Joi.string().required().messages({
      'any.required': 'Name is required'
    }),
    description: Joi.string().required().messages({
      'any.required': 'Description is required'
    }),
    duration: Joi.number().integer().positive().required().messages({
      'number.integer': 'Duration must be an integer',
      'number.positive': 'Duration must be a positive number',
      'any.required': 'Duration is required'
    }),
    basePrice: Joi.number().positive().required().messages({
      'number.positive': 'Base price must be a positive number',
      'any.required': 'Base price is required'
    }),
    location: Joi.string().required().messages({
      'any.required': 'Location is required'
    }),
    itinerary: Joi.string().required().messages({
      'any.required': 'Itinerary is required'
    }),
    images: Joi.string().required().messages({
      'any.required': 'Images are required'
    })
  }),

  update: Joi.object({
    name: Joi.string(),
    description: Joi.string(),
    duration: Joi.number().integer().positive().messages({
      'number.integer': 'Duration must be an integer',
      'number.positive': 'Duration must be a positive number'
    }),
    basePrice: Joi.number().positive().messages({
      'number.positive': 'Base price must be a positive number'
    }),
    location: Joi.string(),
    itinerary: Joi.string(),
    images: Joi.string()
  })
};

// Travel booking validation schemas
export const travelBookingSchemas = {
  create: Joi.object({
    travelId: Joi.string().required().messages({
      'any.required': 'Travel ID is required'
    }),
    startDate: Joi.date().iso().required().messages({
      'date.base': 'Start date must be a valid date',
      'any.required': 'Start date is required'
    }),
    numberOfPeople: Joi.number().integer().positive().required().messages({
      'number.integer': 'Number of people must be an integer',
      'number.positive': 'Number of people must be a positive number',
      'any.required': 'Number of people is required'
    })
  }),

  update: Joi.object({
    startDate: Joi.date().iso().messages({
      'date.base': 'Start date must be a valid date'
    }),
    numberOfPeople: Joi.number().integer().positive().messages({
      'number.integer': 'Number of people must be an integer',
      'number.positive': 'Number of people must be a positive number'
    }),
    status: Joi.string().valid('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED')
  })
};

// Product validation schemas
export const productSchemas = {
  create: Joi.object({
    name: Joi.string().required().messages({
      'any.required': 'Name is required'
    }),
    description: Joi.string().required().messages({
      'any.required': 'Description is required'
    }),
    price: Joi.number().positive().required().messages({
      'number.positive': 'Price must be a positive number',
      'any.required': 'Price is required'
    }),
    stock: Joi.number().integer().min(0).required().messages({
      'number.integer': 'Stock must be an integer',
      'number.min': 'Stock cannot be negative',
      'any.required': 'Stock is required'
    }),
    images: Joi.string().required().messages({
      'any.required': 'Images are required'
    }),
    categoryId: Joi.string().required().messages({
      'any.required': 'Category ID is required'
    })
  }),

  update: Joi.object({
    name: Joi.string(),
    description: Joi.string(),
    price: Joi.number().positive().messages({
      'number.positive': 'Price must be a positive number'
    }),
    stock: Joi.number().integer().min(0).messages({
      'number.integer': 'Stock must be an integer',
      'number.min': 'Stock cannot be negative'
    }),
    images: Joi.string(),
    categoryId: Joi.string()
  }),

  updateStock: Joi.object({
    quantity: Joi.number().integer().min(0).required().messages({
      'number.integer': 'Quantity must be an integer',
      'number.min': 'Stock quantity cannot be negative',
      'any.required': 'Quantity is required'
    })
  })
};

// Order validation schemas
export const orderSchemas = {
  create: Joi.object({
    items: Joi.array().items(
      Joi.object({
        productId: Joi.string().required().messages({
          'any.required': 'Product ID is required'
        }),
        quantity: Joi.number().integer().positive().required().messages({
          'number.integer': 'Quantity must be an integer',
          'number.positive': 'Quantity must be a positive number',
          'any.required': 'Quantity is required'
        })
      })
    ).min(1).required().messages({
      'array.min': 'At least one item is required',
      'any.required': 'Items are required'
    }),
    shippingAddress: Joi.string().required().messages({
      'any.required': 'Shipping address is required'
    }),
    paymentInfo: Joi.string()
  }),

  update: Joi.object({
    status: Joi.string().valid('PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'),
    shippingAddress: Joi.string(),
    paymentInfo: Joi.string()
  })
};

// Category validation schemas
export const categorySchemas = {
  create: Joi.object({
    name: Joi.string().required().messages({
      'any.required': 'Name is required'
    }),
    photo: Joi.string()
  }),

  update: Joi.object({
    name: Joi.string(),
    photo: Joi.string()
  })
};
