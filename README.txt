갤러리 쇼핑몰 (Gallery Shop)

개발 환경
- 백엔드: Java 17, Spring Boot 3.2.0, Spring Data JPA, MariaDB, JWT
- 프론트엔드: React, Vite, Axios

구현 기능
- React 프론트엔드: 로그인/회원가입/로그아웃, 메인, 카테고리, 상품 목록/상세, 장바구니, 결제, 마이페이지(주문내역/주문취소), 관리자 상품등록/재고수정
- Spring Boot 백엔드: JWT 쿠키 인증, 상품 조회/등록/재고수정, 장바구니 수량 관리, 주문 생성/조회/취소, 재고 차감/복구

실행 방법

1) MariaDB 설정
- gallery 데이터베이스 생성:
  mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS gallery CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
- DB 접속 정보 확인/수정: gallery/backend/src/main/resources/application.properties
  spring.datasource.url=jdbc:mariadb://localhost:3306/gallery
  spring.datasource.username=root
  spring.datasource.password=<비밀번호>

2) 백엔드 실행
- 위치: gallery/backend
- 필요: JDK 17, MariaDB
- 실행 명령(Windows): gradlew.bat bootRun
- 서버 주소: http://localhost:8080
- 테이블은 JPA가 자동으로 생성합니다 (ddl-auto=update)

3) 프론트엔드 실행
- 위치: gallery/frontend
- 설치: npm install
- 실행: npm run dev
- 서버 주소: http://localhost:5173 (또는 5174)

주요 API
- POST   /api/account/signup              회원가입
- POST   /api/account/login               로그인
- POST   /api/account/logout              로그아웃
- GET    /api/account/check               토큰 유효 확인
- GET    /api/account/me                  내 정보 조회
- GET    /api/items                       상품 목록 조회
- GET    /api/cart/items                  장바구니 조회
- POST   /api/cart/items/{itemId}         장바구니 추가
- PATCH  /api/cart/items/{itemId}         장바구니 수량 변경
- DELETE /api/cart/items/{itemId}         장바구니 항목 삭제
- DELETE /api/cart/items                  장바구니 전체 비우기
- POST   /api/orders/checkout             주문 생성
- GET    /api/orders                      주문 내역 조회
- POST   /api/orders/{orderId}/cancel     주문 취소
- POST   /api/admin/items                 상품 등록 (관리자)
- PATCH  /api/admin/items/{itemId}/stock  재고 수정 (관리자)

관리자 권한
- 회원가입 이메일이 admin@itshirt.com 이면 ADMIN 권한으로 생성됩니다.
- ADMIN만 /api/admin/* 엔드포인트 호출이 가능합니다.