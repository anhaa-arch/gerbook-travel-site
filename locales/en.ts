export default {
  common: {
    search: "Search",
    details: "Details",
    save: "Save",
    cancel: "Cancel",
    close: "Close",
    back: "Back",
    loading: "Loading...",
    error: "An error occurred. Please try again.",
    noData: "No data found.",
    or: "Or",
    language: "English"
  },
  nav: {
    home: "Home",
    camps: "Ger Camps",
    products: "Shop",
    events: "Events",
    exploreMongolia: "Explore Mongolia",
    login: "Sign In",
    register: "Sign Up",
    logout: "Log Out",
    adminDashboard: "Admin Dashboard",
    herderDashboard: "Herder Dashboard",
    userDashboard: "User Dashboard"
  },
  auth: {
    login: {
      title: "Sign In",
      identifierLabel: "Username or Email",
      identifierPlaceholder: "Enter phone or email",
      passwordLabel: "Password",
      passwordPlaceholder: "Enter password",
      rememberMe: "Remember me",
      forgotPasswordLink: "Forgot password?",
      submit: "Sign In",
      loading: "Please wait...",
      googleAuth: "Sign In with Google",
      noAccount: "Don't have an account?",
      registerLink: "Sign Up (Traveler)",
      messages: {
        success: "Login successful",
        errorEmpty: "Please enter all fields",
        googleError: "Google sign-in failed"
      }
    },
    register: {
      title: "Sign Up",
      nameLabel: "Full Name",
      namePlaceholder: "Enter full name",
      emailLabel: "Email Address",
      emailPlaceholder: "Enter email",
      phoneLabel: "Phone Number (Optional)",
      phonePlaceholder: "Enter phone number",
      passwordLabel: "Password",
      passwordPlaceholder: "Enter password (min 6 chars)",
      roleLabel: "User Role",
      roleTraveler: "Traveler",
      roleHerder: "Herder",
      submit: "Create Account",
      loading: "Please wait...",
      googleAuth: "Sign Up with Google",
      hasAccount: "Already have an account?",
      loginLink: "Sign In",
      messages: {
        success: "Registration successful",
        errorPassword: "Password must be at least 6 characters",
        errorEmpty: "Please complete the form"
      }
    },
    forgotPassword: {
      title: "Recover Password",
      desc: "Enter your registered email address",
      emailLabel: "Email Address",
      emailPlaceholder: "example@mail.com",
      submit: "Send Link",
      loading: "Please wait...",
      messages: {
        success: "Instructions to reset your password have been sent to your email.",
        successTitle: "Email Sent",
        error: "An error occurred while sending the email."
      }
    },
    resetPassword: {
      title: "Create New Password"
    },
    verifyEmail: {
      title: "Verify Email",
      success: "Email verified successfully."
    }
  },
  dashboard: {
    admin: {
      title: "Admin Dashboard",
      subtitle: "Manage your platform and monitor all activities",
      tabs: {
        overview: "Overview",
        users: "Users",
        camps: "Camps",
        products: "Products",
        orders: "Orders",
        content: "Content",
        events: "Events",
        eventBookings: "Event Bookings"
      },
      stats: {
        total_users: "Total Users",
        total_camps: "Total Camps",
        total_products: "Total Products",
        total_orders: "Total Orders",
        from_last_month: "+{{count}} from last month",
        activity: "Activity",
        new_users: "New Users",
        new_camps: "New Camps",
        new_products: "New Products",
        completed_bookings: "Completed Bookings",
        today: "Today {{count}}"
      },
      orders: {
        title: "Recent Orders"
      },
      users: {
        title: "User List"
      }
    },
    herder: {
      title: "Herder Dashboard",
      subtitle: "Manage your products, camps, and orders",
      tabs: {
        overview: "Overview",
        products: "Products",
        camps: "My Camps",
        orders: "Orders",
        profile: "Profile"
      },
      stats: {
        total_products: "Total Products",
        active_camps: "Active Camps",
        total_revenue: "Total Revenue",
        average_rating: "Average Rating",
        today_plus: "+{{count}} today",
        from_last_month_percent: "+{{percent}}% from last month",
        based_on_reviews: "Based on {{count}} reviews"
      },
      orders: {
        title: "Recent Orders"
      },
      products: {
        title: "My Products",
        add: "Add New Product"
      },
      camps: {
        title: "My Ger Camps",
        add: "Add New Camp"
      }
    },
    user: {
      title: "User Dashboard",
      myBookings: "My Bookings"
    }
  },
  cart: {
    title: "My Cart",
    empty: "Your cart is empty.",
    emptyDesc: "Choose from our products and ger camps to add to your cart.",
    shopNow: "Shop Now",
    total: "Total",
    checkout: "Checkout",
    remove: "Remove",
    shippingIncomplete: "Please complete shipping information.",
    checkoutError: "Error creating order. Please try again.",
    paymentSuccessTitle: "Success",
    paymentSuccessDesc: "Your order has been registered. We will contact you soon.",
    itemLabel: "Item",
    inStock: "In Stock",
    stayLabel: "Stay",
    continueShopping: "CONTINUE SHOPPING",
    orderSummary: "Order Summary",
    totalItems: "Total Items",
    shippingFee: "Shipping Fee",
    free: "Free",
    shippingInfo: "Shipping Information",
    receiverName: "Receiver Name",
    receiverPhone: "Phone Number (8 digits)",
    receiverAddr: "Delivery Address (Detailed)",
    securePayment: "Secure Payment",
    expressDelivery: "Express Delivery Service",
    termsNotice: "By clicking the payment button, you confirm that you agree to our terms of service."
  },
  camp: {
    detail: {
      capacity: "{{count}} guests",
      pricePerNight: "$ / night",
      bookNow: "Book Now"
    },
    list: {
      title: "Ger Camps",
      filter: "Filter"
    }
  },
  product: {
    title: "Products",
    addToCart: "Add to Cart"
  },
  infoPages: {
    about: { title: "About Us" },
    exploreMongolia: { title: "Explore Mongolia" },
    terms: { title: "Terms of Service" },
    privacy: { title: "Privacy Policy" }
  },
  sidebarQuotes: {
    mainTitle: "The Unbroken Tradition",
    subTitle: "Nomadic culture is Mongolia's treasure",
    feature1: "Ger stay",
    feature2: "Beautiful nature",
    feature3: "Nomadic life"
  }
};
