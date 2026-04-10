# iTshirt Shop

React + Spring Boot + MariaDB 기반 풀스택 쇼핑몰 프로젝트입니다.

## 기술 스택

| 구분 | 기술 |
|------|------|
| Frontend | React, Vite, Context API, Fetch |
| Backend | Java 17, Spring Boot 3.2.0, Spring Data JPA |
| Database | MariaDB |
| Auth | JWT (HttpOnly Cookie) |

## 주요 기능

### 사용자 기능
- 회원가입, 로그인, 로그아웃
- 상품 목록/상세 조회, 카테고리 기반 탐색
- 장바구니 담기, 수량 변경, 항목 삭제, 전체 비우기
- 결제(주문 생성), 주문 내역 조회, 주문 취소
- 새로고침(F5) 이후 로그인 상태 유지

### 관리자 기능
- 상품 등록 (jpg/png 드래그 앤 드롭 업로드)
- 상품 이미지 MariaDB(BLOB) 저장 및 조회
- 재고 수정
- 상품 클릭 후 수정 모달에서 상품명/이미지/가격/할인율 수정
- 상품 삭제

관리자 권한 규칙:
- 회원가입 이메일이 `admin@itshirt.com` 이면 ADMIN 권한으로 생성됩니다.

## 실행 방법

### 1) MariaDB 준비

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS gallery CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

DB 접속 정보는 아래 파일에서 설정합니다.

```properties
# gallery/backend/src/main/resources/application.properties
spring.datasource.url=jdbc:mariadb://localhost:3306/gallery
spring.datasource.username=root
spring.datasource.password=<비밀번호>
spring.jpa.hibernate.ddl-auto=update
```

### 2) 백엔드 실행

```bash
cd gallery/backend
gradlew.bat build -x test
gradlew.bat bootRun
```

- 기본 주소: `http://localhost:8080`

포트 충돌(8080 already in use) 시:

```powershell
Get-NetTCPConnection -LocalPort 8080 -State Listen | Select-Object OwningProcess
Stop-Process -Id <PID> -Force
```

### 3) 프론트엔드 실행

```bash
cd gallery/frontend
npm install
npm run dev
```

- 기본 주소: `http://localhost:5173`

## 프로젝트 구조

```text
iTshirt/
├─ gallery/
│  ├─ backend/   # Spring Boot API
│  └─ frontend/  # React + Vite
├─ mariadb/
└─ README.md
```

## 주요 API

### Account
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/account/signup` | 회원가입 |
| POST | `/api/account/login` | 로그인 |
| POST | `/api/account/logout` | 로그아웃 |
| GET | `/api/account/check` | 로그인 상태 확인 |
| GET | `/api/account/me` | 내 정보 조회 |

### Item
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/items` | 상품 목록 조회 |
| GET | `/api/items/{itemId}/image` | 상품 이미지 조회 |

### Cart
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/cart/items` | 장바구니 조회 |
| POST | `/api/cart/items/{itemId}` | 장바구니 추가 |
| PATCH | `/api/cart/items/{itemId}` | 수량 변경 |
| DELETE | `/api/cart/items/{itemId}` | 항목 삭제 |
| DELETE | `/api/cart/items` | 전체 비우기 |

### Order
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/orders/checkout` | 결제/주문 생성 |
| GET | `/api/orders` | 주문 내역 조회 |
| POST | `/api/orders/{orderId}/cancel` | 주문 취소 |

### Admin
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/admin/items` | 상품 등록 (JSON 또는 multipart) |
| PATCH | `/api/admin/items/{itemId}/stock` | 재고 수정 |
| PUT | `/api/admin/items/{itemId}` | 상품 정보 수정 (multipart) |
| DELETE | `/api/admin/items/{itemId}` | 상품 삭제 |
