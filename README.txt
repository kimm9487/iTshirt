개발자 티셔츠 쇼핑몰 오픈 소스

구현 상태
- React 프론트엔드: 로그인/회원가입/로그아웃, 메인, 카테고리, 상품 목록/상세, 장바구니, 결제, 마이페이지(주문내역/주문취소), 관리자 상품등록/재고수정
- Spring Boot 백엔드: JWT 쿠키 인증, 상품 조회/등록/재고수정, 장바구니 수량 관리, 주문 생성/조회/취소, 재고 차감/복구

실행 방법
1) 백엔드 실행
- 위치: gallery/backend
- 필요: JDK 17, MariaDB
- DB 설정: gallery/backend/src/main/resources/application.properties
- 실행 명령(Windows): gradlew.bat bootRun

2) 프론트엔드 실행
- 위치: gallery/frontend
- 설치: npm install
- 실행: npm run dev

주요 API
- POST /api/account/signup
- POST /api/account/login
- POST /api/account/logout
- GET /api/account/check
- GET /api/account/me
- GET /api/items
- GET /api/cart/items
- POST /api/cart/items/{itemId}
- PATCH /api/cart/items/{itemId}
- DELETE /api/cart/items/{itemId}
- DELETE /api/cart/items
- POST /api/orders/checkout
- GET /api/orders
- POST /api/orders/{orderId}/cancel
- POST /api/admin/items
- PATCH /api/admin/items/{itemId}/stock

관리자 권한
- 회원가입 이메일이 admin@itshirt.com 이면 ADMIN 권한으로 생성됩니다.
- ADMIN만 /api/admin/items, /api/admin/items/{itemId}/stock 호출이 가능합니다.