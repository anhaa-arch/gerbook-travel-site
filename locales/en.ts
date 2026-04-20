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
    language: "English",
    back_to_camps: "Back to Camps",
    back_to_home: "Back to Home",
    reviews: "reviews",
    saved: "Saved",
    night: "night",
    check_in: "Check-in",
    check_out: "Check-out",
    total: "Total",
    guests_unit: "guests",
    add_to_cart: "Add to Cart",
    added_to_cart: "Added to Cart",
    book_now: "Book Now",
    guests: "guests",
    safe: "Safe",
    date: "Date",
    select_dates: "Select Dates",
    select_period: "Select Period",
    filter: "Filter",
    search_results: "search results",
    login_required: "Login Required",
    success: "Success",
    capacity: "Capacity",
    total_gers: "Total Gers",
    facilities: "Facilities",
    phone: "Phone",
    email: "Email",
    share: "Share",
    number_of_guests: "Number of Guests"
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
    userDashboard: "User Dashboard",
    settings: "Settings",
    language_currency: "Language & Currency"
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
    partner: "Official Partner",
    partner_label: "Official Partner",
    book_now: "Book Now",
    amenities_label: "Amenities",
    activities_label: "Activities & Experience",
    accommodation_label: "Accommodation",
    host_label: "Meet the Host",
    rules_label: "Rules & Policies",
    loading_info: "Loading camp information...",
    error_title: "Error loading camp information",
    not_found: "Camp Not Found",
    not_found_desc: "The camp you're looking for doesn't exist.",
    save_login_desc: "You need to log in to save a camp.",
    unsaved_title: "Removed from Saved",
    saved_title: "Successfully Saved",
    unsaved_desc: "The camp has been removed from your saved list.",
    saved_desc: "The camp has been added to your saved list.",
    select_dates: "Select Stay Dates",
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
  booking: {
    check_in: "Check-in",
    check_out: "Check-out",
    night: "night",
    success: "✅ Booking successful",
    payment_ready: "Payment is ready.",
    error_generic: "An error occurred while creating the booking.",
    error_dates_taken: "Selected dates are unavailable. Please select other dates.",
    error_invalid_dates: "Check-out date must be after check-in date.",
    error_not_authorized: "You are not authorized to make a booking.",
    error_not_found: "Camp not found. Please try again.",
    error_title: "❌ Booking Failed"
  },
  review: {
    count_zero: "0 reviews",
    count_plural: "({{count}} reviews)"
  },
  listings: {
    title: "All Listings",
    select_province: "Select Province",
    select_district: "Select District",
    camps_tab: "Ger Camps",
    products_tab: "Products",
    camps_found: "camps found",
    no_camps: "No ger camps found.",
    products_found: "products found"
  },
  home: {
    featured_camps: "Featured Ger Camps",
    featured_products: "Featured Products"
  },
  events: {
    upcoming_badge: "Upcoming Events",
    hero: {
      part1: "Mongolian",
      part2: "Heritage",
      part3: "& Travel",
      desc: "Find and book special programs exploring nomadic lifestyle, national festivals, and beautiful nature.",
      button: "Choose Tour"
    },
    list: {
      title: {
        part1: "All",
        part2: "Events"
      },
      desc: "Cultural and adventure events organized across Mongolia.",
      count_total: "Total",
      count_label: "events"
    },
    empty: {
      title: "No active events currently",
      desc: "New events will be added soon."
    },
    cta: {
      title: {
        part1: "Start",
        part2: "Your Adventure",
        part3: "Today"
      },
      desc: "We offer the most unforgettable tours and events to experience true Mongolian culture."
    }
  },
  products: {
    title: "Featured Products",
    filter_category: "Category",
    all_categories: "All Categories",
    filter_price: "Price",
    all_prices: "All Prices",
    sort_by: "Sort By",
    popularity: "Popularity",
    price_low: "Price: Low to High",
    price_high: "Price: High to Low",
    rating: "Rating",
    more_filters: "More Filters",
    items_found: "products found",
    out_of_stock: "Out of Stock",
    add_to_cart: "Add to Cart"
  },
  host: {
    contact_button: "Contact Host",
    experience_suffix: "experienced",
    languages_label: "Languages"
  },
  landing: {
    stats: {
      activeUsers: "Active",
      herders: "Herders",
      verified: "Verified",
      secure: "Secure"
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
  },
  footer: {
    copyright: "All rights reserved."
  },
  cat: {
    Handicrafts: "Handicrafts",
    Food: "Food",
    Souvenirs: "Souvenirs",
    Clothing: "Clothing",
    Equipment: "Equipment"
  }
};
