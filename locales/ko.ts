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
    language: "한국어"
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
    herderDashboard: "유목민 대시보드",
    userDashboard: "마이페이지"
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
  }
};
