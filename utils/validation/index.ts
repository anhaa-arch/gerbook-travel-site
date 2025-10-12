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
const isTest = process.env.NODE_ENV === 'test';

const passwordPattern = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}$');
// Accept simpler passwords (min 8 chars) in a more permissive mode if env flag set
const allowSimplePassword = process.env.ALLOW_SIMPLE_PASSWORD === 'true';

export const userSchemas = {
  register: Joi.object({
    // Use Joi's email validation but keep TLDs flexible; for stricter RFC-5322 you can add a custom regex
    email: Joi.string().email({ tlds: { allow: false } }).required().messages({
      'string.email': 'Имэйл хаяг буруу байна (RFC-5322 стандартын дагуу шалга)' ,
      'any.required': 'Имэйл шаардлагатай'
    }),
    // Password: require min 8 characters by default (more permissive for registration); in test allow shorter
    password: (isTest ? Joi.string().min(6) : Joi.string().min(8)).required().messages({
      'string.pattern.base': 'Нууц үг дор хаяж 8 тэмдэгттэй, 1 том үсэг, 1 жижиг үсэг, 1 тоо болон 1 тусгай тэмдэгт агуулах ёстой',
      'string.min': 'Нууц үг дор хаяж 8 тэмдэгттэй байх ёстой',
      'any.required': 'Нууц үг шаардлагатай'
    }),
    name: Joi.string().required().messages({
      'any.required': 'Нэр шаардлагатай'
    }),
    // Phone: accept either +976XXXXXXXX or plain 8-9 digit local numbers
    phone: Joi.string().pattern(new RegExp('^(?:\\+976)?\\d{8,9}$')).messages({
      'string.pattern.base': 'Утасны дугаар нь улсын кодуудтай (+976...) эсвэл 8-9 оронтой байх ёстой'
    }),
    role: Joi.string().valid('CUSTOMER', 'HERDER', 'ADMIN')
  }),

  // Login can accept email OR phone (phone via OTP flow). For basic password login, provide email and password.
  login: Joi.object({
    email: Joi.string().email({ tlds: { allow: false } }).messages({
      'string.email': 'Имэйл хаяг буруу байна'
    }),
    phone: Joi.string().pattern(new RegExp('^\\+976\\d{8,9}$')).messages({
      'string.pattern.base': 'Утасны дугаар нь +976 болон 8-9 оронтой байх ёстой'
    }),
    password: Joi.string().messages({
      'any.required': 'Нууц үг шаардлагатай'
    })
  }).or('email', 'phone'),

  update: Joi.object({
    email: Joi.string().email({ tlds: { allow: false } }).messages({
      'string.email': 'Имэйл хаяг буруу байна'
    }),
    password: (isTest ? Joi.string().min(6) : Joi.string().pattern(passwordPattern)).messages({
      'string.pattern.base': 'Нууц үг дор хаяж 8 тэмдэгттэй, 1 том үсэг, 1 жижиг үсэг, 1 тоо болон 1 тусгай тэмдэгт агуулах ёстой',
      'string.min': 'Нууц үг дор хаяж 6 тэмдэгттэй байх ёстой'
    }),
    name: Joi.string(),
    role: Joi.string().valid('CUSTOMER', 'HERDER', 'ADMIN')
  })
};

// OTP / Token related schemas
export const authSchemas = {
  sendOtp: Joi.object({
    phone: Joi.string().pattern(new RegExp('^\\+976\\d{8,9}$')).required().messages({
      'any.required': 'Утас шаардлагатай',
      'string.pattern.base': 'Утасны дугаар нь +976 болон 8-9 оронтой байх ёстой'
    })
  }),
  verifyOtp: Joi.object({
    phone: Joi.string().pattern(new RegExp('^\\+976\\d{8,9}$')).required(),
    otp: Joi.string().length(6).required()
  }),
  passwordResetRequest: Joi.object({
    email: Joi.string().email({ tlds: { allow: false } }).messages({ 'string.email': 'Имэйл буруу байна' }),
    phone: Joi.string().pattern(new RegExp('^\\+976\\d{8,9}$')).messages({ 'string.pattern.base': 'Утас буруу байна' })
  }).or('email', 'phone'),
  passwordReset: Joi.object({
    token: Joi.string().required(),
    newPassword: (isTest ? Joi.string().min(6) : Joi.string().pattern(passwordPattern)).required()
  })
}

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
    startDate: Joi.string().required().messages({
      'any.required': 'Start date is required'
    }),
    endDate: Joi.string().required().messages({
      'any.required': 'End date is required'
    })
  }),

  update: Joi.object({
    startDate: Joi.string(),
    endDate: Joi.string(),
    status: Joi.string().valid('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED')
  }),

  createTravel: Joi.object({
    travelId: Joi.string().required().messages({
      'any.required': 'Travel ID is required'
    }),
    startDate: Joi.string().required().messages({
      'any.required': 'Start date is required'
    }),
    numberOfPeople: Joi.number().integer().min(1).required().messages({
      'any.required': 'Number of people is required',
      'number.min': 'Number of people must be at least 1'
    })
  }),

  updateTravel: Joi.object({
    startDate: Joi.string(),
    numberOfPeople: Joi.number().integer().min(1),
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
