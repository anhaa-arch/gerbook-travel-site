export default {
  common: {
    search: "Хайх",
    details: "Дэлгэрэнгүй",
    save: "Хадгалах",
    cancel: "Цуцлах",
    close: "Хаах",
    back: "Буцах",
    loading: "Уншиж байна...",
    error: "Алдаа гарлаа. Дахин оролдоно уу.",
    noData: "Мэдээлэл олдсонгүй.",
    or: "Эсвэл",
    language: "Монгол",
    back_to_camps: "Гэр бааз руу буцах",
    back_to_home: "Нүүр хуудас руу буцах",
    reviews: "үнэлгээ",
    saved: "Хадгалсан",
    night: "шөнө",
    check_in: "Ирэх өдөр",
    check_out: "Буцах өдөр",
    total: "Нийт дүн",
    guests_unit: "хүн",
    add_to_cart: "Сагсанд нэмэх",
    added_to_cart: "Сагсанд нэмэгдлээ",
    book_now: "Захиалах",
    guests: "зочин",
    safe: "Аюулгүй",
    date: "Огноо",
    select_dates: "Огноо сонгох",
    select_period: "Хугацаа сонгох",
    filter: "Шүүх",
    search_results: "хайлтын үр дүн",
    login_required: "Нэвтрэх шаардлагатай",
    success: "Амжилттай",
    capacity: "Багтаамж",
    total_gers: "Нийт гэр",
    facilities: "Тохижилт",
    phone: "Утас",
    email: "Имэйл",
    share: "Хуваалцах",
    number_of_guests: "Зочдын тоо"
  },
  nav: {
    home: "Нүүр",
    camps: "Гэр бааз",
    products: "Бүтээгдэхүүн",
    events: "Арга хэмжээ",
    exploreMongolia: "Монгол оронтой танилцах",
    login: "Нэвтрэх",
    register: "Бүртгүүлэх",
    logout: "Гарах",
    adminDashboard: "Админы самбар",
    herderDashboard: "Малчны самбар",
    userDashboard: "Хэрэглэгчийн самбар",
    settings: "Тохиргоо",
    language_currency: "Хэл ба Валют"
  },
  auth: {
    login: {
      title: "Нэвтрэх",
      identifierLabel: "Нэвтрэх нэр",
      identifierPlaceholder: "Утасны дугаар эсвэл Имэйлээ оруулна уу",
      passwordLabel: "Нууц үг",
      passwordPlaceholder: "Нууц үгээ оруулна уу.",
      rememberMe: "Намайг санах",
      forgotPasswordLink: "Нууц үгээ мартсан уу?",
      submit: "Нэвтрэх",
      loading: "Түр хүлээнэ үү...",
      googleAuth: "Google-ээр нэвтрэх",
      noAccount: "Танд бүртгэл байхгүй бол",
      registerLink: "Бүртгүүлэх (Traveler)",
      messages: {
        success: "Амжилттай нэвтэрлээ",
        errorEmpty: "Мэдээллээ бүрэн оруулна уу",
        googleError: "Google нэвтрэлт амжилтгүй"
      }
    },
    register: {
      title: "Бүртгүүлэх",
      nameLabel: "Нэр",
      namePlaceholder: "Нэрээ оруулна уу",
      emailLabel: "Имэйл хаяг",
      emailPlaceholder: "Имэйлээ оруулна уу",
      phoneLabel: "Утасны дугаар (заавал биш)",
      phonePlaceholder: "Утасны дугаар",
      passwordLabel: "Нууц үг",
      passwordPlaceholder: "Нууц үгээ оруулна уу (багаар бодож 6 тэмдэгт)",
      roleLabel: "Хэрэглэгчийн төрөл",
      roleTraveler: "Аялагч (Traveler)",
      roleHerder: "Малчин (Herder)",
      submit: "Бүртгэл үүсгэх",
      loading: "Түр хүлээнэ үү...",
      googleAuth: "Google-ээр бүртгүүлэх",
      hasAccount: "Бүртгэлтэй юу?",
      loginLink: "Нэвтрэх",
      messages: {
        success: "Амжилттай бүртгүүллээ",
        errorPassword: "Нууц үг дор хаяж 6 тэмдэгт байх ёстой",
        errorEmpty: "Мэдээллээ бүрэн оруулна уу"
      }
    },
    forgotPassword: {
      title: "Нууц үг сэргээх",
      desc: "Бүртгэлтэй имэйл хаягаа оруулна уу",
      emailLabel: "Имэйл хаяг",
      emailPlaceholder: "example@mail.com",
      submit: "Илгээх",
      loading: "Түр хүлээнэ үү...",
      messages: {
        success: "Нууц үг сэргээх зааврыг таны имэйл рүү илгээлээ.",
        successTitle: "Имэйл илгээлээ",
        error: "Имэйл илгээхэд алдаа гарлаа."
      }
    },
    resetPassword: {
      title: "Шинэ нууц үг үүсгэх"
    },
    verifyEmail: {
      title: "Имэйл баталгаажуулах",
      success: "Таны имэйл амжилттай баталгаажлаа."
    }
  },
  dashboard: {
    admin: {
      title: "Админ самбар",
      subtitle: "Платформоо удирдаж, бүх үйл ажиллагааг хянаарай",
      tabs: {
        overview: "Тойм",
        users: "Хэрэглэгчид",
        camps: "Баазууд",
        products: "Бараа",
        orders: "Захиалга",
        content: "Агуулга",
        events: "Арга хэмжээ",
        eventBookings: "А.Х Захиалга"
      },
      stats: {
        total_users: "Нийт хэрэглэгч",
        total_camps: "Нийт бааз",
        total_products: "Нийт бараа",
        total_orders: "Нийт захиалга",
        from_last_month: "Сүүлийн сараас +{{count}}",
        activity: "Үйл ажиллагаа",
        new_users: "Шинэ хэрэглэгч",
        new_camps: "Шинэ бааз",
        new_products: "Шинэ бараа",
        completed_bookings: "Баталгаажсан захиалга",
        today: "Өнөөдөр {{count}}"
      },
      orders: {
        title: "Сүүлийн захиалгууд"
      },
      users: {
        title: "Хэрэглэгчийн жагсаалт"
      }
    },
    herder: {
      title: "Малчны самбар",
      subtitle: "Өөрийн бүтээгдэхүүн, бааз, захиалгаа удирдаарай",
      tabs: {
        overview: "Тойм",
        products: "Бүтээгдэхүүнүүд",
        camps: "Миний гэр",
        orders: "Захиалгууд",
        profile: "Профайл"
      },
      stats: {
        total_products: "Нийт бүтээгдэхүүн",
        active_camps: "Идэвхтэй баазууд",
        total_revenue: "Нийт орлого",
        average_rating: "Дундаж үнэлгээ",
        today_plus: "+{{count}} өнөөдөр",
        from_last_month_percent: "+{{percent}}% өнгөрсөн сараас",
        based_on_reviews: "{{count}} үнэлгээнд үндэслэв"
      },
      orders: {
        title: "Сүүлийн захиалгууд"
      },
      products: {
        title: "Миний бүтээгдэхүүн",
        add: "Шинэ бүтээгдэхүүн нэмэх"
      },
      camps: {
        title: "Миний гэр баазууд",
        add: "Шинэ бааз нэмэх"
      }
    },
    user: {
      title: "Хэрэглэгчийн самбар",
      myBookings: "Миний захиалгууд"
    }
  },
  cart: {
    title: "Миний сагс",
    empty: "Таны сагс хоосон байна.",
    emptyDesc: "Та манай бүтээгдэхүүн болон амралтын баазуудаас сонголтоо хийн сагсандаа нэмээрэй.",
    shopNow: "Худалдан авалт хийх",
    total: "Нийт дүн",
    checkout: "Захиалах",
    remove: "Устгах",
    shippingIncomplete: "Хүргэлтийн мэдээллийг гүйцэд бөглөнө үү.",
    checkoutError: "Захиалга үүсгэхэд алдаа гарлаа. Дахин оролдоно уу.",
    paymentSuccessTitle: "Амжилттай",
    paymentSuccessDesc: "Таны захиалга бүртгэгдлээ. Бид удахгүй холбогдох болно.",
    itemLabel: "Бараа",
    inStock: "Нөөцөд байгаа",
    stayLabel: "Байрлах",
    continueShopping: "ДАХИН СОНГОЛТ ХИЙХ",
    orderSummary: "Захиалгын дүн",
    totalItems: "Нийт бараа",
    shippingFee: "Хүргэлт",
    free: "Үнэгүй",
    shippingInfo: "Хүргэлтийн мэдээлэл",
    receiverName: "Хүлээн авах хүний нэр",
    receiverPhone: "Утасны дугаар (8 оронтой)",
    receiverAddr: "Хүргэлтийн хаяг (Дэлгэрэнгүй)",
    securePayment: "Баталгаат төлбөр тооцоо",
    expressDelivery: "Шуурхай хүргэлтийн үйлчилгээ",
    termsNotice: "Төлбөр төлөх товчийг дарснаар та манай үйлчилгээний нөхцлийг зөвшөөрч буйгаа баталгаажуулна."
  },
  camp: {
    partner: "Онцгой хамтрагч",
    partner_label: "Онцгой хамтрагч",
    book_now: "Захиалах",
    amenities_label: "Тав тухтай байдал",
    activities_label: "Үйл ажиллагаа ба туршлага",
    accommodation_label: "Байршуулалт",
    host_label: "Эзэнтэй танилцах",
    rules_label: "Дүрэм журам",
    loading_info: "Баазын мэдээллийг уншиж байна...",
    error_title: "Баазын мэдээллийг уншихад алдаа гарлаа",
    not_found: "Гэр бааз олдсонгүй",
    not_found_desc: "Таны хайсан гэр бааз байхгүй байна.",
    save_login_desc: "Амралт хадгалахын тулд нэвтрэх шаардлагатай.",
    unsaved_title: "Хадгалсан амралт",
    saved_title: "Амжилттай хадгалагдлаа",
    unsaved_desc: "Амралт хадгаалсан жагсаалтаас хасагдлаа.",
    saved_desc: "Амралт хадгаалсан жагсаалтад нэмэгдлээ.",
    select_dates: "Амрах өдрөө сонгох",
    detail: {
      capacity: "{{count}} зочин",
      pricePerNight: "₮ / шөнө",
      bookNow: "Захиалах"
    },
    list: {
      title: "Гэр баазууд",
      filter: "Шүүлтүүр"
    }
  },
  booking: {
    check_in: "Ирэх өдөр",
    check_out: "Буцах өдөр",
    night: "шөнө",
    success: "✅ Захиалга амжилттай",
    payment_ready: "Төлбөр хийхэд бэлэн боллоо.",
    error_generic: "Захиалга үүсгэхэд алдаа гарлаа.",
    error_dates_taken: "Таны сонгосон огноо захиалагдсан байна. Өөр огноо сонгоно уу.",
    error_invalid_dates: "Гарах өдөр ирэх өдрөөс хойш байх ёстой.",
    error_not_authorized: "Та захиалга хийх эрхгүй байна.",
    error_not_found: "Бааз олдсонгүй. Дахин оролдоно уу.",
    error_title: "❌ Захиалга амжилтгүй"
  },
  review: {
    count_zero: "Одоогоор үнэлгээ алга",
    count_plural: "({{count}} үнэлгээ)"
  },
  listings: {
    title: "Бүх жагсаалт",
    select_province: "Аймаг сонгох",
    select_district: "Сум сонгох",
    camps_tab: "Амралт баазууд",
    products_tab: "Бүтээгдэхүүн",
    camps_found: "бааз олдлоо",
    no_camps: "Амралт бааз олдсонгүй.",
    products_found: "бүтээгдэхүүн олдлоо"
  },
  home: {
    featured_camps: "Онцлох гэр баазууд",
    featured_products: "Шилдэг бүтээгдэхүүнүүд"
  },
  events: {
    upcoming_badge: "Удахгүй болох арга хэмжээнүүд",
    hero: {
      part1: "Монгол",
      part2: "Өв Соёл",
      part3: "ба Аялал",
      desc: "Малчин ахуй, үндэсний наадам, байгалийн үзэсгэлэнт газруудаар аялах онцгой хөтөлбөрүүдийг эндээс олж захиалаарай.",
      button: "Аяллаа сонгох"
    },
    list: {
      title: {
        part1: "Бүх",
        part2: "Арга Хэмжээ"
      },
      desc: "Монгол орны өнцөг булан бүрт зохион байгуулагдаж буй соёлын болон адал явдалт арга хэмжээнүүд.",
      count_total: "Нийт",
      count_label: "арга хэмжээ"
    },
    empty: {
      title: "Одоогоор идэвхтэй арга хэмжээ алга",
      desc: "Удахгүй шинэ арга хэмжээнүүд нэмэгдэх болно."
    },
    cta: {
      title: {
        part1: "Өөрийн",
        part2: "Адал Явдлаа",
        part3: "Өнөөдөр Эхлүүл"
      },
      desc: "Бид танд хамгийн мартагдашгүй, жинхэнэ монгол ахуйг мэдрүүлэх аялал арга хэмжээнүүдийг санал болгож байна."
    }
  },
  products: {
    title: "Шилдэг бүтээгдэхүүнүүд",
    filter_category: "Төрөл",
    all_categories: "Бүх төрөл",
    filter_price: "Үнэ",
    all_prices: "Бүх үнэ",
    sort_by: "Эрэмбэлэх",
    popularity: "Эрэлттэй",
    price_low: "Үнэ: Багаас их",
    price_high: "Үнэ: Ихээс бага",
    rating: "Үнэлгээ",
    more_filters: "Бусад шүүлтүүр",
    items_found: "бүтээгдэхүүн олдлоо",
    out_of_stock: "Дууссан",
    add_to_cart: "Сагсанд нэмэх"
  },
  host: {
    contact_button: "Эзэнтэй холбогдох",
    experience_suffix: "туршлагатай",
    languages_label: "Хэл"
  },
  landing: {
    stats: {
      activeUsers: "Идэвхтэй",
      herders: "Малчин",
      verified: "Бодит",
      secure: "Баталгаат"
    }
  },
  product: {
    title: "Бүтээгдэхүүнүүд",
    addToCart: "Сагсанд нэмэх"
  },
  infoPages: {
    about: { title: "Бидний тухай" },
    exploreMongolia: { title: "Монгол оронтой танилцах" },
    terms: { title: "Үйлчилгээний нөхцөл" },
    privacy: { title: "Нууцлалын бодлого" }
  },
  sidebarQuotes: {
    mainTitle: "ТАСАЛЖ БОЛОХГҮЙ ТАЛЫН СОЁЛ",
    subTitle: "Нүүдэлчин ахуй соёл Монголын баялаг",
    feature1: "Гэр амралт",
    feature2: "Байгалийн сайхан",
    feature3: "Малчны амьдрал"
  },
  footer: {
    copyright: "Бүх эрх хуулиар хамгаалагдсан."
  },
  cat: {
    Handicrafts: "Гар урлал",
    Food: "Хоол хүнс",
    Souvenirs: "Бэлэг дурсгал",
    Clothing: "Хувцас",
    Equipment: "Тоног төхөөрөмж"
  },
  camps: {
    title: "Амралт баазууд"
  }
};
