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
    language: "Монгол"
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
    userDashboard: "Хэрэглэгчийн самбар"
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
    mainTitle: "Тасалж болохгүй талын соёл",
    subTitle: "Нүүдэлчин ахуй соёл Монголын баялаг",
    feature1: "Гэр амралт",
    feature2: "Байгалийн сайхан",
    feature3: "Малчны амьдрал"
  }
};
