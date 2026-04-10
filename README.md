# 🛍️ Gallery Shop

React + Spring Boot 기반 풀스택 쇼핑몰 프로젝트입니다.

---

## 🧰 기술 스택

| 구분 | 기술 |
|------|------|
| 프론트엔드 | React, Vite, Axios |
| 백엔드 | Java 17, Spring Boot 3.2.0, Spring Data JPA |
| 데이터베이스 | MariaDB |
| 인증 | JWT (쿠키 기반) |

---

## ✅ 구현 기능

### 사용자
- 회원가입 / 로그인 / 로그아웃
- 상품 목록 · 카테고리 · 상세 조회
- 장바구니 담기 · 수량 변경 · 삭제
- 주문 생성 · 주문 내역 조회 · 주문 취소
- 마이페이지

### 관리자
- 상품 등록
- 재고 수정
- 관리자 계정: 이메일이 `admin@itshirt.com` 이면 자동으로 ADMIN 권한 부여

---

## 🚀 실행 방법

### 1. MariaDB 설정

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS gallery CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

DB 접속 정보 수정: `gallery/backend/src/main/resources/application.properties`

```properties
spring.datasource.url=jdbc:mariadb://localhost:3306/gallery
spring.datasource.username=root
spring.datasource.password=<비밀번호>
```

> 테이블은 서버 실행 시 JPA가 자동으로 생성합니다.

---

### 2. 백엔드 실행

```bash
cd gallery/backend
./gradlew.bat bootRun   # Windows
./gradlew bootRun       # Mac / Linux
```

- 실행 주소: `http://localhost:8080`
- 필요 환경: JDK 17 이상

---

### 3. 프론트엔드 실행

```bash
cd gallery/frontend
npm install
npm run dev
```

- 실행 주소: `http://localhost:5173`

---

## 📁 프로젝트 구조

```
iTshirt/
├── gallery/
│   ├── backend/          # Spring Boot
│   │   └── src/main/java/.../
│   │       ├── controller/
│   │       ├── service/
│   │       ├── entity/
│   │       ├── repository/
│   │       └── dto/
│   └── frontend/         # React + Vite
│       └── src/
│           ├── pages/
│           ├── components/
│           ├── context/
│           └── api/
└── mariadb/
```

---

## 📡 주요 API

### 계정
| Method | URL | 설명 |
|--------|-----|------|
| POST | `/api/account/signup` | 회원가입 |
| POST | `/api/account/login` | 로그인 |
| POST | `/api/account/logout` | 로그아웃 |
| GET | `/api/account/check` | 토큰 유효 확인 |
| GET | `/api/account/me` | 내 정보 조회 |

### 상품
| Method | URL | 설명 |
|--------|-----|------|
| GET | `/api/items` | 상품 목록 조회 |

### 장바구니
| Method | URL | 설명 |
|--------|-----|------|
| GET | `/api/cart/items` | 장바구니 조회 |
| POST | `/api/cart/items/{itemId}` | 장바구니 추가 |
| PATCH | `/api/cart/items/{itemId}` | 수량 변경 |
| DELETE | `/api/cart/items/{itemId}` | 항목 삭제 |
| DELETE | `/api/cart/items` | 전체 비우기 |

### 주문
| Method | URL | 설명 |
|--------|-----|------|
| POST | `/api/orders/checkout` | 주문 생성 |
| GET | `/api/orders` | 주문 내역 조회 |
| POST | `/api/orders/{orderId}/cancel` | 주문 취소 |

### 관리자
| Method | URL | 설명 |
|--------|-----|------|
| POST | `/api/admin/items` | 상품 등록 |
| PATCH | `/api/admin/items/{itemId}/stock` | 재고 수정 |
