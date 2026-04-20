export default {
  common: {
    search: "검색",
    details: "상세보기",
    save: "저장",
    cancel: "취소",
    close: "닫기",
    back: "뒤로가기",
    loading: "로딩 중...",
    error: "오류가 발생했습니다. 다시 시도해 주세요.",
    noData: "데이터가 없습니다.",
    or: "또는",
    language: "한국어",
    back_to_camps: "캠프로 돌아가기",
    back_to_home: "홈으로 돌아가기",
    reviews: "리뷰",
    saved: "저장됨",
    night: "박",
    check_in: "체크인",
    check_out: "체크아웃",
    total: "총액",
    guests_unit: "명",
    add_to_cart: "장바구니 담기",
    added_to_cart: "장바구니에 담겼습니다",
    book_now: "예약하기",
    guests: "명",
    safe: "안전",
    date: "날짜",
    select_dates: "날짜 선택",
    select_period: "기간 선택",
    filter: "필터",
    search_results: "검색 결과",
    login_required: "로그인 필요",
    success: "성공",
    capacity: "수용 인원",
    total_gers: "총 게르",
    facilities: "시설",
    phone: "전화번호",
    email: "이메일",
    share: "공유",
    number_of_guests: "인원 수"
  },
  nav: {
    home: "홈",
    camps: "게르 캠프",
    products: "쇼핑몰",
    events: "이벤트",
    exploreMongolia: "몽골 둘러보기",
    login: "로그인",
    register: "회원가입",
    logout: "로그아웃",
    adminDashboard: "관리자 대시보드",
    herderDashboard: "유목민 대시보д",
    userDashboard: "마이페이지",
    settings: "설정",
    language_currency: "언어 및 통화"
  },
  auth: {
    login: {
      title: "로그인",
      identifierLabel: "이메일 또는 전화번호",
      identifierPlaceholder: "전화번호 또는 이메일을 입력하세요",
      passwordLabel: "비밀번호",
      passwordPlaceholder: "비밀번호를 입력하세요",
      rememberMe: "로그인 유지",
      forgotPasswordLink: "비밀번호를 잊으셨나요?",
      submit: "로그인",
      loading: "잠시만 기다려주세요...",
      googleAuth: "Google로 로그인",
      noAccount: "계정이 없으신가요?",
      registerLink: "회원가입 (여행자)",
      messages: {
        success: "로그인 성공",
        errorEmpty: "모든 항목을 입력해주세요",
        googleError: "Google 로그인 실패"
      }
    },
    register: {
      title: "회원가입",
      nameLabel: "이름",
      namePlaceholder: "이름을 입력하세요",
      emailLabel: "이메일 주소",
      emailPlaceholder: "이메일을 입력하세요",
      phoneLabel: "전화번호 (선택사항)",
      phonePlaceholder: "전화번호를 입력하세요",
      passwordLabel: "비밀번호",
      passwordPlaceholder: "비밀번호를 입력하세요 (최소 6자)",
      roleLabel: "사용자 유형",
      roleTraveler: "여행자 (Traveler)",
      roleHerder: "유목민 (Herder)",
      submit: "계정 생성",
      loading: "잠시만 기다려주세요...",
      googleAuth: "Google로 회원가입",
      hasAccount: "이미 계정이 있으신가요?",
      loginLink: "로그인",
      messages: {
        success: "회원가입 성공",
        errorPassword: "비밀번호는 최소 6자 이상이어야 합니다",
        errorEmpty: "모든 항목을 입력해주세요"
      }
    },
    forgotPassword: {
      title: "비밀번호 찾기",
      desc: "등록된 이메일 주소를 입력해 주세요",
      emailLabel: "이메일 주소",
      emailPlaceholder: "example@mail.com",
      submit: "링크 전송",
      loading: "잠시만 기다려주세요...",
      messages: {
        success: "비밀번호 재설정 안내가 이메일로 발송되었습니다.",
        successTitle: "이메일 전송됨",
        error: "이메일 전송 중 오류가 발생했습니다."
      }
    },
    resetPassword: {
      title: "새 비밀번호 설정"
    },
    verifyEmail: {
      title: "이메일 인증",
      success: "이메일이 성공적으로 인증되었습니다."
    }
  },
  dashboard: {
    admin: {
      title: "관리자 대시보드",
      subtitle: "플랫폼을 관리하고 모든 활동을 모니터링하세요",
      tabs: {
        overview: "개요",
        users: "사용자",
        camps: "캠프",
        products: "상품",
        orders: "주문",
        content: "콘텐츠",
        events: "이벤트",
        eventBookings: "이벤트 예약"
      },
      stats: {
        total_users: "총 사용자",
        total_camps: "총 캠프",
        total_products: "총 상품",
        total_orders: "총 주문",
        from_last_month: "지난달 대비 +{{count}}",
        activity: "활동",
        new_users: "신규 사용자",
        new_camps: "신규 캠프",
        new_products: "신규 상품",
        completed_bookings: "완료된 예약",
        today: "오늘 {{count}}"
      },
      orders: {
        title: "최근 주문"
      },
      users: {
        title: "사용자 목록"
      }
    },
    herder: {
      title: "유목민 대시보드",
      subtitle: "상품, 캠프 및 주문을 관리하세요",
      tabs: {
        overview: "개요",
        products: "상품",
        camps: "내 캠프",
        orders: "주문",
        profile: "프로필"
      },
      stats: {
        total_products: "총 상품",
        active_camps: "활성 캠프",
        total_revenue: "총 수익",
        average_rating: "평균 평점",
        today_plus: "오늘 +{{count}}",
        from_last_month_percent: "지난달 대비 +{{percent}}%",
        based_on_reviews: "{{count}}개 리뷰 기준"
      },
      orders: {
        title: "최근 주문"
      },
      products: {
        title: "내 상품",
        add: "새 상품 추가"
      },
      camps: {
        title: "내 게르 캠프",
        add: "새 캠프 추가"
      }
    },
    user: {
      title: "사용자 대시보드",
      myBookings: "내 예약"
    }
  },
  cart: {
    title: "장바구니",
    empty: "장바구니가 비어 있습니다.",
    emptyDesc: "상품 및 게르 캠프를 선택하여 장바구니에 추가해 주세요.",
    shopNow: "쇼핑하기",
    total: "총 금액",
    checkout: "결제하기",
    remove: "삭제",
    shippingIncomplete: "배송 정보를 모두 입력해 주세요.",
    checkoutError: "주문 생성 중 오류가 발생했습니다. 다시 시도해 주세요.",
    paymentSuccessTitle: "성공",
    paymentSuccessDesc: "주문이 등록되었습니다. 곧 연락드리겠습니다.",
    itemLabel: "상품",
    inStock: "재고 있음",
    stayLabel: "숙박",
    continueShopping: "쇼핑 계속하기",
    orderSummary: "주문 요약",
    totalItems: "총 상품",
    shippingFee: "배송비",
    free: "무료",
    shippingInfo: "배송 정보",
    receiverName: "수령인 이름",
    receiverPhone: "전화번호 (8자리)",
    receiverAddr: "상세 주소",
    securePayment: "안전 결제",
    expressDelivery: "신속 배송",
    termsNotice: "결제 버튼을 클릭하시면 이용 약관에 동의하는 것으로 간주됩니다."
  },
  camp: {
    partner: "특별 파트너",
    partner_label: "특별 파트너",
    book_now: "예약하기",
    amenities_label: "편의시설",
    activities_label: "액티비티 & 체험",
    accommodation_label: "숙박 유형",
    host_label: "호스트 소개",
    rules_label: "이용 규칙",
    loading_info: "캠프 정보를 불러오는 중...",
    error_title: "캠프 정보를 불러오는 데 실패했습니다",
    not_found: "캠프를 찾을 수 없습니다",
    not_found_desc: "찾으시는 캠프가 존재하지 않습니다.",
    save_login_desc: "캠프를 저장하려면 로그인이 필요합니다.",
    unsaved_title: "저장 해제됨",
    saved_title: "성공적으로 저장됨",
    unsaved_desc: "캠프가 저장 목록에서 제거되었습니다.",
    saved_desc: "캠프가 저장 목록에 추가되었습니다.",
    select_dates: "숨박 날짜 선택",
    detail: {
      capacity: "{{count}}명",
      pricePerNight: "₩ / 1박",
      bookNow: "예약하기"
    },
    list: {
      title: "게르 캠프",
      filter: "필터"
    }
  },
  booking: {
    check_in: "체크인",
    check_out: "체크아웃",
    night: "박",
    success: "✅ 예약 성공",
    payment_ready: "결제 준비가 완료되었습니다.",
    error_generic: "예약을 생성하는 중 오류가 발생했습니다.",
    error_dates_taken: "선택하신 날짜는 이미 예약되었습니다. 다른 날짜를 선택해주세요.",
    error_invalid_dates: "체크아웃 날짜는 체크인 날짜 이후여야 합니다.",
    error_not_authorized: "예약 권한이 없습니다.",
    error_not_found: "캠프를 찾을 수 없습니다. 다시 시도해주세요.",
    error_title: "❌ 예약 실패"
  },
  review: {
    count_zero: "리뷰 0개",
    count_plural: "(리뷰 {{count}}개)"
  },
  listings: {
    title: "전체 목록",
    select_province: "지역 선택",
    select_district: "상세 선택",
    camps_tab: "게르 캠프",
    products_tab: "상품",
    camps_found: "개의 캠프 찾음",
    no_camps: "캠프를 찾을 수 없습니다.",
    products_found: "개의 상품 찾음"
  },
  home: {
    featured_camps: "추천 게르 캠프",
    featured_products: "추천 상품"
  },
  events: {
    upcoming_badge: "예정된 이벤트",
    hero: {
      part1: "몽골",
      part2: "문화유산",
      part3: "& 여행",
      desc: "유목 생활, 전통 축제, 아름다운 자연을 체험할 수 있는 특별한 프로그램을 찾아 예약하세요.",
      button: "투어 선택하기"
    },
    list: {
      title: {
        part1: "모든",
        part2: "이벤트"
      },
      desc: "몽골 전역에서 열리는 문화 및 어드벤처 이벤트입니다.",
      count_total: "총",
      count_label: "개 이벤트"
    },
    empty: {
      title: "현재 진행 중인 이벤트가 없습니다",
      desc: "곧 새로운 이벤트가 추가될 예정입니다."
    },
    cta: {
      title: {
        part1: "지금",
        part2: "모험을",
        part3: "시작하세요"
      },
      desc: "가장 잊을 수 없는 진정한 몽골 문화를 경험할 수 있는 이벤트와 투어를 제공합니다."
    }
  },
  products: {
    title: "추천 상품",
    filter_category: "카테고리",
    all_categories: "모든 카테고리",
    filter_price: "가격",
    all_prices: "모든 가격",
    sort_by: "정렬 기준",
    popularity: "인기순",
    price_low: "가격: 낮은 순",
    price_high: "가격: 높은 순",
    rating: "평점",
    more_filters: "추가 필터",
    items_found: "개의 상품 찾음",
    out_of_stock: "품절",
    add_to_cart: "장바구니 담기"
  },
  host: {
    contact_button: "호스트에게 연락하기",
    experience_suffix: "경력",
    languages_label: "언어"
  },
  landing: {
    stats: {
      activeUsers: "활성",
      herders: "유목민",
      verified: "검증됨",
      secure: "안전"
    }
  },
  product: {
    title: "상품 목록",
    addToCart: "장바구니에 담기"
  },
  infoPages: {
    about: { title: "회사 소개" },
    exploreMongolia: { title: "몽골 둘러보기" },
    terms: { title: "이용약관" },
    privacy: { title: "개인정보 처리방침" }
  },
  sidebarQuotes: {
    mainTitle: "초원의 문화",
    subTitle: "유목 문화는 몽골의 보물입니다",
    feature1: "게르 숙박",
    feature2: "아름다운 자연",
    feature3: "유목 생활"
  },
  footer: {
    copyright: "모든 권리 보유."
  },
  cat: {
    Handicrafts: "수공예품",
    Food: "식품",
    Souvenirs: "기념품",
    Clothing: "의류",
    Equipment: "장비"
  }
};
