<div id="top">

<!-- HEADER STYLE: CLASSIC -->
<div align="center">

<img src="https://raw.githubusercontent.com/soyun11/magnesium-deficiency/main/readmeai/assets/logos/purple.svg" width="30%" style="position: relative; top: 0; right: 0;" alt="Project Logo"/>

# MAGNESIUM-DEFICIENCY

<em>당신의 표정이 리듬이 되는 순간 - AI 기반 표정 인식 리듬 게임</em>

<!-- BADGES -->
<img src="https://img.shields.io/github/license/soyun11/magnesium-deficiency?style=default&logo=opensourceinitiative&logoColor=white&color=0080ff" alt="license">
<img src="https://img.shields.io/github/last-commit/soyun11/magnesium-deficiency?style=default&logo=git&logoColor=white&color=0080ff" alt="last-commit">
<img src="https://img.shields.io/github/languages/top/soyun11/magnesium-deficiency?style=default&color=0080ff" alt="repo-top-language">
<img src="https://img.shields.io/github/languages/count/soyun11/magnesium-deficiency?style=default&color=0080ff" alt="repo-language-count">

</div>
<br>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
  - [Project Index](#project-index)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Testing](#testing)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## Overview

**마그네슘 부족(Magnesium Deficiency)**은 학습 동아리 프로젝트로 개발된 혁신적인 웹 기반 리듬 게임입니다. 전통적인 키보드/마우스 입력 대신 **실시간 얼굴 표정 인식**을 게임 컨트롤로 활용하여, face-api.js를 통해 😊(기쁨), 😢(슬픔), 😡(분노), 😐(무표정), 😮(놀람) 5가지 감정을 감지하고 리듬에 맞춰 노트를 처리하는 독특한 게임플레이를 제공합니다.

### 프로젝트 배경
- **개발 기간**: 2025년 1월 ~ 2월 (9주차 완료)
- **팀 구성**: 4인 (Frontend 2명, Backend 2명)
- **목적**: 풀스택 개발 역량 강화 및 AI 기술 활용 게임 개발 경험

### 핵심 기술 스택
Spring Boot 백엔드와 React 프론트엔드로 구성된 풀스택 애플리케이션으로, BCrypt 암호화 기반 사용자 인증, 실시간 점수 저장 및 랭킹 시스템, 관리자 대시보드(곡 업로드/삭제), Flyway 데이터베이스 마이그레이션을 포함한 완전한 게임 생태계를 구현했습니다.

---

## Features

|      | Component       | Details                              |
| :--- | :-------------- | :----------------------------------- |
| ⚙️  | **Architecture**  | <ul><li>**MVC** 패턴 기반의 명확한 관심사 분리</li><li>백엔드: **Spring Boot 4.0.1** + JPA</li><li>프론트엔드: **React 19.2.0** + Vite</li><li>**Flyway** DB 마이그레이션 (V1~V9)</li></ul> |
| 🔩 | **Code Quality**  | <ul><li>**ESLint** 코드 포맷 적용</li><li>Lombok 보일러플레이트 감소</li><li>RESTful API 설계 원칙 준수</li><li>Git 협업 워크플로우 (fetch → pull)</li></ul> |
| 📄 | **Documentation** | <ul><li>상세한 주석 및 커밋 메시지</li><li>API 엔드포인트 명세</li><li>데이터베이스 마이그레이션 스크립트 문서화</li><li>Figma UI/UX 프로토타입</li></ul> |
| 🔌 | **Integrations**  | <ul><li>**face-api.js 0.22.2** - 실시간 표정 인식 (TensorFlow.js 기반)</li><li>**Flyway** - 데이터베이스 버전 관리</li><li>**React Webcam** - 카메라 제어</li><li>**MySQL** - 데이터 영속성</li></ul> |
| 🧩 | **Modularity**    | <ul><li>재사용 가능한 React 컴포넌트</li><li>Service/Repository 레이어 분리</li><li>**SOLID** 원칙 적용</li><li>DTO 패턴으로 계층 간 데이터 전달</li></ul> |
| 🧪 | **Testing**       | <ul><li>Spring Boot Test 프레임워크</li><li>JUnit 5 단위 테스트</li><li>H2 인메모리 DB 테스트</li><li>실제 사용자 체험 피드백 수집</li></ul> |
| ⚡️  | **Performance**   | <ul><li>**Vite** 빌드 도구 (빠른 HMR)</li><li>**Tailwind CSS** 최적화</li><li>Lazy loading & 코드 스플리팅</li><li>표정 인식 딜레이 최소화 (16ms 간격)</li></ul> |
| 🛡️ | **Security**      | <ul><li>**BCrypt** 비밀번호 암호화 (work factor 12)</li><li>Spring Security 인증/인가</li><li>CORS 정책 설정</li><li>SQL Injection 방지 (JPA)</li><li>환경 변수로 DB 비밀번호 관리</li></ul> |
| 📦 | **Dependencies**  | <ul><li>**npm** (Frontend) - React Router, face-api.js</li><li>**Gradle** (Backend) - Spring Data JPA, MySQL Driver</li><li>주요: Spring Security, Flyway, Lombok</li></ul> |

### 🎮 게임 시스템 특징

#### 표정 인식 판정 시스템
- **Perfect**: 감정 정확도 80% 이상 (150~200점)
- **Good**: 감정 정확도 45~80% (50~149점)
- **Miss**: 감정 정확도 45% 미만 (0점)
- **감정별 가중치**: neutral(6.0), angry(1.6), happy(1.5), surprised(1.3), sad(0.5)

#### 난이도 시스템
- **Easy**: 노트 생성 간격 1200~1800ms
- **Normal**: 기본 타이밍 (중간 난이도)
- **Hard**: 노트 생성 간격 800~1200ms (빠른 속도)

#### 실시간 랭킹
- Top 10 랭킹 시스템
- 사용자별 최고 점수 기록
- 곡별 순위 관리

---

## Project Structure

```sh
└── magnesium-deficiency/
    ├── README.md
    ├── backend/
    │   ├── build.gradle                    # Gradle 빌드 설정
    │   ├── src/
    │   │   ├── main/
    │   │   │   ├── java/com/
    │   │   │   │   ├── Application.java    # Spring Boot 엔트리 포인트
    │   │   │   │   └── facebeat/
    │   │   │   │       ├── config/         # Security, CORS 설정
    │   │   │   │       ├── controller/     # REST API 컨트롤러
    │   │   │   │       ├── dto/            # 요청/응답 DTO
    │   │   │   │       ├── entity/         # JPA 엔티티 (User, Song, Score)
    │   │   │   │       ├── repository/     # JPA 리포지토리
    │   │   │   │       ├── service/        # 비즈니스 로직
    │   │   │   │       └── util/           # JWT 유틸리티
    │   │   │   └── resources/
    │   │   │       ├── application.properties  # 설정 파일
    │   │   │       ├── db/migration/       # Flyway SQL 스크립트
    │   │   │       └── static/             # 정적 리소스 (음악, 이미지)
    │   │   └── test/                       # 테스트 코드
    │   └── gradle/                         # Gradle Wrapper
    │
    └── frontend/
        ├── index.html                      # HTML 엔트리 포인트
        ├── package.json                    # npm 의존성
        ├── vite.config.js                  # Vite 설정
        ├── tailwind.config.js              # Tailwind CSS 설정
        ├── public/
        │   └── models/                     # face-api.js 모델 파일
        │       ├── tiny_face_detector_model-*
        │       ├── face_landmark_68_model-*
        │       └── face_expression_model-*
        └── src/
            ├── App.jsx                     # 메인 라우팅
            ├── main.jsx                    # React 엔트리 포인트
            ├── index.css                   # 글로벌 스타일
            └── pages/                      # 페이지 컴포넌트
                ├── AuthSelection.jsx       # 인증 선택 화면
                ├── Login.jsx               # 로그인
                ├── Signup.jsx              # 회원가입
                ├── Home.jsx                # 메인 홈
                ├── SongSelection.jsx       # 곡 선택
                ├── Tutorial.jsx            # 튜토리얼
                ├── RhythmGame.jsx          # 게임 플레이
                ├── Ranking.jsx             # 랭킹
                ├── setting.jsx             # 설정
                └── AdminDashboard.jsx      # 관리자 대시보드
```

### Project Index

<details open>
	<summary><b><code>MAGNESIUM-DEFICIENCY/</code></b></summary>
	<details>
		<summary><b>frontend</b></summary>
		<blockquote>
			<table>
			<tr>
				<td><b><a href='https://github.com/soyun11/magnesium-deficiency/blob/master/frontend/package.json'>package.json</a></b></td>
				<td>프론트엔드 의존성 정의: React 19, face-api.js, Tailwind CSS, Vite 등</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/soyun11/magnesium-deficiency/blob/master/frontend/vite.config.js'>vite.config.js</a></b></td>
				<td>Vite 빌드 도구 설정 및 React 플러그인 활성화</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/soyun11/magnesium-deficiency/blob/master/frontend/tailwind.config.js'>tailwind.config.js</a></b></td>
				<td>Tailwind CSS 설정: 컨텐츠 경로 및 테마 확장</td>
			</tr>
			</table>
			<details>
				<summary><b>src/pages</b></summary>
				<blockquote>
					<table>
					<tr>
						<td><b><a href='https://github.com/soyun11/magnesium-deficiency/blob/master/frontend/src/pages/RhythmGame.jsx'>RhythmGame.jsx</a></b></td>
						<td>핵심 게임플레이 로직: face-api.js를 활용한 실시간 표정 인식 및 노트 판정 시스템</td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/soyun11/magnesium-deficiency/blob/master/frontend/src/pages/Tutorial.jsx'>Tutorial.jsx</a></b></td>
						<td>표정 인식 튜토리얼: 5가지 감정 학습 및 Perfect 판정 달성 시스템</td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/soyun11/magnesium-deficiency/blob/master/frontend/src/pages/AdminDashboard.jsx'>AdminDashboard.jsx</a></b></td>
						<td>관리자 대시보드: 곡 추가/삭제, MP3 및 이미지 업로드 관리</td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/soyun11/magnesium-deficiency/blob/master/frontend/src/pages/Ranking.jsx'>Ranking.jsx</a></b></td>
						<td>Top 10 랭킹 시스템: 백엔드 API 연동 및 실시간 순위 표시</td>
					</tr>
					</table>
				</blockquote>
			</details>
		</blockquote>
	</details>
	<details>
		<summary><b>backend</b></summary>
		<blockquote>
			<table>
			<tr>
				<td><b><a href='https://github.com/soyun11/magnesium-deficiency/blob/master/backend/build.gradle'>build.gradle</a></b></td>
				<td>백엔드 의존성: Spring Boot 4.0.1, JPA, Security, Flyway, MySQL, Lombok</td>
			</tr>
			</table>
			<details>
				<summary><b>src/main/java/com/facebeat</b></summary>
				<blockquote>
					<table>
					<tr>
						<td><b><a href='https://github.com/soyun11/magnesium-deficiency/blob/master/backend/src/main/java/com/facebeat/config/SecurityConfig.java'>SecurityConfig.java</a></b></td>
						<td>Spring Security 설정: CORS, CSRF, 인증/인가 정책, BCrypt 암호화</td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/soyun11/magnesium-deficiency/blob/master/backend/src/main/java/com/facebeat/controller/UserController.java'>UserController.java</a></b></td>
						<td>사용자 API: 회원가입, 로그인, 아이디 중복 확인 엔드포인트</td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/soyun11/magnesium-deficiency/blob/master/backend/src/main/java/com/facebeat/controller/ScoreController.java'>ScoreController.java</a></b></td>
						<td>점수 API: 게임 종료 시 점수 저장 및 랭킹 조회</td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/soyun11/magnesium-deficiency/blob/master/backend/src/main/java/com/facebeat/entity/User.java'>User.java</a></b></td>
						<td>사용자 엔티티: userId(로그인ID), username, password, 생성일</td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/soyun11/magnesium-deficiency/blob/master/backend/src/main/java/com/facebeat/entity/Score.java'>Score.java</a></b></td>
						<td>점수 엔티티: 사용자-곡 관계, 점수값, 생성일 (외래키 설정)</td>
					</tr>
					</table>
				</blockquote>
			</details>
			<details>
				<summary><b>src/main/resources/db/migration</b></summary>
				<blockquote>
					<table>
					<tr>
						<td><b><a href='https://github.com/soyun11/magnesium-deficiency/blob/master/backend/src/main/resources/db/migration/V1__init.sql'>V1__init.sql</a></b></td>
						<td>초기 테이블 생성: member(사용자) 테이블</td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/soyun11/magnesium-deficiency/blob/master/backend/src/main/resources/db/migration/V2__create_music_table.sql'>V2__create_music_table.sql</a></b></td>
						<td>음악 테이블 생성: 제목, 아티스트, 파일경로, BPM, 난이도</td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/soyun11/magnesium-deficiency/blob/master/backend/src/main/resources/db/migration/V5__create_score_table.sql'>V5__create_score_table.sql</a></b></td>
						<td>점수 테이블 생성: 사용자-곡 외래키, 점수값, 생성일</td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/soyun11/magnesium-deficiency/blob/master/backend/src/main/resources/db/migration/V7__dummy_users.sql'>V7__dummy_users.sql</a></b></td>
						<td>더미 데이터: 테스트 유저 10명 (비밀번호: 1234, BCrypt 암호화)</td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/soyun11/magnesium-deficiency/blob/master/backend/src/main/resources/db/migration/V8__insert_admin_user.sql'>V8__insert_admin_user.sql</a></b></td>
						<td>관리자 계정 생성: admin123 / admin1234</td>
					</tr>
					</table>
				</blockquote>
			</details>
		</blockquote>
	</details>
</details>

---

## Getting Started

### Prerequisites

이 프로젝트를 실행하기 위한 필수 요구사항:

- **Programming Language:** Java 17+
- **Package Manager:** npm 8+, Gradle 9+
- **Database:** MySQL 8.0+
- **Web Browser:** Chrome/Edge (최신 버전, 웹캠 지원 필수)

### Installation

소스에서 빌드하고 의존성을 설치합니다:

1. **저장소 클론:**

    ```sh
    ❯ git clone https://github.com/soyun11/magnesium-deficiency
    ```

2. **프로젝트 디렉토리로 이동:**

    ```sh
    ❯ cd magnesium-deficiency
    ```

3. **데이터베이스 설정:**

    ```sql
    -- MySQL에 데이터베이스 생성
    CREATE DATABASE magnesium_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    ```

4. **환경 변수 설정 (중요!):**

    보안을 위해 DB 비밀번호를 환경 변수로 관리합니다.
    
    **Windows (PowerShell):**
    ```powershell
    [System.Environment]::SetEnvironmentVariable('DB_PASSWORD', '본인MySQL비밀번호', 'User')
    ```
    
    **macOS/Linux (bash):**
    ```bash
    export DB_PASSWORD='본인MySQL비밀번호'
    # ~/.bashrc 또는 ~/.zshrc에 추가하여 영구 적용
    ```

5. **백엔드 설정 파일 확인:**

    `backend/src/main/resources/application.properties` 파일이 다음과 같이 설정되어 있는지 확인:
    ```properties
    spring.datasource.url=jdbc:mysql://localhost:3306/magnesium_db
    spring.datasource.username=root
    spring.datasource.password=${DB_PASSWORD}
    ```

6. **백엔드 의존성 설치 및 빌드:**

	**Using [gradle](https://gradle.org/):**

	```sh
	❯ cd backend
	❯ ./gradlew build
	```
    
    **Flyway 마이그레이션 자동 실행됨:**
    - V1: member 테이블 생성
    - V2: music 테이블 생성
    - V3~V4: 샘플 곡 데이터 삽입
    - V5: scores 테이블 생성
    - V6~V8: 더미 유저 및 관리자 계정 생성

7. **프론트엔드 의존성 설치:**

	**Using [npm](https://www.npmjs.com/):**

	```sh
	❯ cd ../frontend
	❯ npm install
	```

### Usage

프로젝트를 실행합니다:

1. **백엔드 서버 실행:**

**Using [gradle](https://gradle.org/):**
```sh
❯ cd backend
❯ ./gradlew bootRun
```

백엔드가 `http://localhost:8080`에서 실행됩니다.

2. **프론트엔드 개발 서버 실행:**

**Using [npm](https://www.npmjs.com/):**
```sh
❯ cd frontend
❯ npm run dev
```

프론트엔드가 `http://localhost:5173`에서 실행됩니다.

3. **브라우저에서 접속:**
   - 메인 페이지: `http://localhost:5173`
   - 테스트 계정: `testuser1` ~ `testuser10` (비밀번호: `1234`)
   - 관리자 계정: `admin123` (비밀번호: `admin1234`)

### 🎮 게임 플레이 가이드

#### 1단계: 회원가입 및 로그인
- 새로운 계정 생성 또는 테스트 계정으로 로그인
- 아이디 중복 확인 기능 활용 (6~12자 영문/숫자)
- 비밀번호 BCrypt 암호화 자동 적용

#### 2단계: 튜토리얼 (권장)
- 5가지 감정 표현 연습
- Perfect 판정 달성 시 자동으로 홈으로 이동
- 밝은 조명 환경에서 정면 응시 권장

#### 3단계: 곡 선택
- 4곡 기본 제공 (Birthday Star, Combo, Rock, Sungsimdang)
- 곡별 BPM, 난이도, 커버 이미지 확인
- 난이도: Easy(초록), Normal(파랑), Hard(빨강)

#### 4단계: 게임 플레이
- 웹캠을 통해 얼굴 인식 시작
- 5개 레인에서 감정에 맞는 표정 짓기
- 판정: Perfect (150~200점), Good (50~149점), Miss (0점)
- ESC 키로 일시정지/재개 가능

#### 5단계: 결과 확인
- 최종 점수 확인
- 신기록 달성 시 랭킹 자동 갱신
- 재도전 또는 곡 선택 화면으로 이동

### 🎯 플레이 팁
- **밝은 조명**: 얼굴 인식 정확도 향상 (90% 이상)
- **정면 응시**: 카메라를 직접 바라보기
- **과장된 표정**: 감정을 명확하게 표현할수록 높은 점수
- **무표정 주의**: neutral 감정이 가장 높은 가중치 (6.0)를 가짐

### Testing

테스트 스위트를 실행합니다:

**Backend Testing (JUnit):**
```sh
❯ cd backend
❯ ./gradlew test
```

**Frontend Testing:**
```sh
❯ cd frontend
❯ npm run test
```

---

## API Documentation

### 🔐 사용자 인증 API

#### 회원가입
```http
POST /api/users/signup
Content-Type: application/json

Request:
{
  "userId": "testuser11",
  "username": "testuser11",
  "password": "password123"
}

Response (200 OK):
"회원가입 성공!"
```

#### 로그인
```http
POST /api/users/login
Content-Type: application/json

Request:
{
  "userId": "testuser1",
  "password": "1234"
}

Response (200 OK):
{
  "userId": "testuser1",
  "userName": "testuser1",
  "message": "로그인 성공"
}
```

#### 아이디 중복 확인
```http
GET /api/users/check-id?userId=testuser1

Response (200 OK): "사용 가능한 아이디입니다."
Response (409 Conflict): "이미 존재하는 아이디입니다."
```

### 🎵 곡 관리 API

#### 곡 목록 조회
```http
GET /api/songs

Response (200 OK):
[
  {
    "id": 1,
    "title": "Birthday Star",
    "artist": "soyun",
    "bpm": 90,
    "difficulty": 2,
    "filePath": "/songs/birthday_star.mp3",
    "imagePath": "/images/birthday_star.png"
  },
  ...
]
```

#### 곡 추가 (관리자 전용)
```http
POST /api/songs
Content-Type: multipart/form-data

Request:
- title: "New Song"
- artist: "Artist Name"
- bpm: 120
- difficulty: 2
- songFile: (binary MP3 file)
- imageFile: (binary image file)

Response (201 Created):
{
  "id": 5,
  "title": "New Song",
  ...
}
```

#### 곡 삭제 (관리자 전용)
```http
DELETE /api/songs/{id}

Response (200 OK): (empty body)
Response (404 Not Found): (곡이 존재하지 않을 때)
```

### 🏆 점수 & 랭킹 API

#### 점수 저장
```http
POST /api/scores
Content-Type: application/json

Request:
{
  "userId": 1,
  "songId": 1,
  "score": 2500
}

Response (200 OK):
"점수가 저장되었습니다!"
```

#### Top 10 랭킹 조회
```http
GET /api/scores/ranking

Response (200 OK):
[
  {
    "userId": "testuser1",
    "songTitle": "Birthday Star",
    "score": 3200
  },
  {
    "userId": "testuser5",
    "songTitle": "Rock",
    "score": 2850
  },
  ...
]
```

### 🔧 관리자 API

#### 관리자 로그인
```http
POST /api/admin/login
Content-Type: application/json

Request:
{
  "id": "admin123",
  "password": "admin1234"
}

Response (200 OK):
{
  "success": true,
  "role": "ADMIN",
  "userId": "admin123",
  "message": "관리자 로그인 성공"
}

Response (401 Unauthorized):
"관리자 계정이 없거나 비밀번호가 틀립니다."
```

### 📊 데이터베이스 스키마

#### member (사용자)
```sql
CREATE TABLE member (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL UNIQUE,      -- 로그인 ID
    username VARCHAR(50) NOT NULL UNIQUE,      -- 사용자 이름
    password VARCHAR(100) NOT NULL,            -- BCrypt 암호화 (60자)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### music (노래)
```sql
CREATE TABLE music (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255),
    file_path VARCHAR(500) NOT NULL,           -- MP3 파일 경로
    image_path VARCHAR(500),                   -- 커버 이미지 경로
    bpm INT,                                   -- 분당 비트 수
    duration INT,                              -- 곡 길이 (초)
    difficulty INT,                            -- 난이도 (1: Easy, 2: Normal, 3: Hard)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### scores (점수)
```sql
CREATE TABLE scores (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,                   -- member.id 참조
    song_id BIGINT NOT NULL,                   -- music.id 참조
    score_value INT NOT NULL,                  -- 점수
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES member(id) ON DELETE CASCADE,
    FOREIGN KEY (song_id) REFERENCES music(id) ON DELETE CASCADE
);
```

---

## Roadmap

### ✅ 완료된 단계

- [X] **`1차: Kick-off & 환경 구축`**: <strike>Git 저장소 생성, 팀 역할 분담, Figma UI/UX 프로토타입</strike>
- [X] **`2차: AI 모델 탐색`**: <strike>face-api.js 선정, 웹캠 연동, 표정 인식 테스트</strike>
- [X] **`3차: 데이터베이스 설계`**: <strike>MySQL 스키마 생성, Flyway 마이그레이션 (V1~V5)</strike>
- [X] **`4차: 노래 파일 시스템`**: <strike>MP3 파일 저장 경로 설정, BPM 측정, 노트 생성 로직</strike>
- [X] **`5차: 표정 인식 연동`**: <strike>판정 시스템 (Perfect/Good/Miss), 점수 계산 공식</strike>
- [X] **`6차: 사용자 인증`**: <strike>회원가입/로그인 API, BCrypt 암호화, 아이디 중복 확인</strike>
- [X] **`7차: 점수 & 랭킹 시스템`**: <strike>게임 기록 DB 저장, Top 10 랭킹, 실시간 갱신</strike>
- [X] **`8차: 관리자 기능`**: <strike>Admin 대시보드, 곡 업로드/삭제, 이미지 관리</strike>
- [X] **`9차: 버그 수정 & 테스트`**: <strike>오디오 재생 오류 해결, UI/UX 개선, 사용자 피드백 반영</strike>

### 🚧 진행 중

- [ ] **`10차: 최종 배포 준비`**: 
  - [ ] GitHub Pages 또는 Vercel 배포
  - [ ] 환경 변수 관리 (DB 비밀번호 보안)
  - [ ] 프로덕션 빌드 최적화
  - [ ] 실제 사용자 체험 테스트

### 📋 향후 계획

- [ ] **`Phase 11: 멀티플레이어 모드`**: 
  - [ ] WebSocket 실시간 통신
  - [ ] 동시 접속 플레이어 매칭
  - [ ] 실시간 점수 비교
  
- [ ] **`Phase 12: 사용자 콘텐츠 생성`**: 
  - [ ] 커스텀 곡 업로드 (사용자)
  - [ ] BPM 자동 분석 도구
  - [ ] 노트 에디터 기능
  
- [ ] **`Phase 13: 모바일 최적화`**: 
  - [ ] React Native 포팅
  - [ ] 터치 인터페이스 지원
  - [ ] 모바일 카메라 최적화
  
- [ ] **`Phase 14: 고급 기능`**: 
  - [ ] AI 난이도 자동 조정
  - [ ] 리플레이 시스템
  - [ ] 소셜 기능 (친구 추가, 챌린지)

---

## Contributing

- **💬 [Join the Discussions](https://github.com/soyun11/magnesium-deficiency/discussions)**: 인사이트 공유, 피드백 제공, 질문하기
- **🐛 [Report Issues](https://github.com/soyun11/magnesium-deficiency/issues)**: 버그 리포트 또는 기능 요청
- **💡 [Submit Pull Requests](https://github.com/soyun11/magnesium-deficiency/blob/main/CONTRIBUTING.md)**: PR 검토 및 제출

<details closed>
<summary>기여 가이드라인</summary>

1. **Fork the Repository**: 프로젝트 저장소를 본인의 GitHub 계정으로 포크합니다.
2. **Clone Locally**: 포크한 저장소를 로컬에 클론합니다.
   ```sh
   git clone https://github.com/your-username/magnesium-deficiency
   ```
3. **Create a New Branch**: 항상 새로운 브랜치에서 작업합니다.
   ```sh
   git checkout -b feature/new-emotion-detection
   ```
4. **Make Your Changes**: 변경 사항을 개발하고 로컬에서 테스트합니다.
5. **Commit Your Changes**: 명확한 메시지와 함께 커밋합니다.
   ```sh
   git commit -m 'feat: Add disgust emotion detection'
   ```
6. **Push to GitHub**: 변경 사항을 포크한 저장소로 푸시합니다.
   ```sh
   git push origin feature/new-emotion-detection
   ```
7. **Submit a Pull Request**: 원본 저장소에 대해 PR을 생성합니다.
8. **Review**: PR이 검토되고 승인되면 메인 브랜치에 병합됩니다.

</details>

<details closed>
<summary>Contributor Graph</summary>
<br>
<p align="left">
   <a href="https://github.com/soyun11/magnesium-deficiency/graphs/contributors">
      <img src="https://contrib.rocks/image?repo=soyun11/magnesium-deficiency">
   </a>
</p>
</details>

---

## License

이 프로젝트는 [MIT License](https://choosealicense.com/licenses/mit/) 하에 배포됩니다. 자세한 내용은 [LICENSE](https://choosealicense.com/licenses/mit/) 파일을 참조하세요.

---

## Acknowledgments

### 👥 개발 팀

**Team Magnesium Deficiency** - 학습 동아리 프로젝트 (2025.01 ~ 2025.02)

| 이름 | 역할 | 담당 영역 | GitHub |
|------|------|----------|---------|
| **조은주** | Frontend Developer | React UI/UX, face-api.js 통합, 표정 인식 최적화 | - |
| **정민주** | Full Stack Developer | 회원가입/로그인 페이지, 관리자 대시보드, 백엔드 연동 | - |
| **박소윤** | Backend Developer | Spring Boot API, MySQL 설계, Flyway 마이그레이션, 점수/랭킹 시스템 | [@soyun11](https://github.com/soyun11) |
| **한진주** | Backend Developer | BCrypt 암호화, 사용자 인증, 데이터베이스 설계, Admin 기능 | - |

### 🎨 디자인 및 프로토타입
- **Figma UI/UX Design**: [마그네슘 부족 보드](https://www.figma.com/board/u1kVcAcUgUg8VF0fXPr0Tu)
- **디자인 시스템**: 
  - Primary Color: `#F8C4B4` (Peach)
  - Secondary Color: `#B4E4F8` (Blue)
  - Typography: Black Han Sans, Pretendard

### 🛠 기술 스택 및 라이브러리

#### AI/ML
- **face-api.js 0.22.2** by Vincent Mühler - 얼굴 인식 및 표정 분석
  - Models: Tiny Face Detector, Face Landmark 68, Face Expression Recognition
- **TensorFlow.js** by Google - 머신러닝 프레임워크

#### Backend
- **Spring Boot 4.0.1** by Pivotal/VMware - 백엔드 프레임워크
- **Spring Security** - 인증/인가 및 BCrypt 암호화
- **Spring Data JPA** - ORM 및 데이터 접근
- **Flyway** - 데이터베이스 마이그레이션
- **MySQL 8.0** - 관계형 데이터베이스
- **Lombok** - 보일러플레이트 코드 감소

#### Frontend
- **React 19.2.0** by Meta - 프론트엔드 라이브러리
- **Vite 7.2.4** - 빌드 도구 및 개발 서버
- **React Router 7.11.0** - 클라이언트 라우팅
- **React Webcam 7.2.0** - 웹캠 제어
- **Tailwind CSS 4.1.18** - 유틸리티 우선 CSS 프레임워크

### 📚 참고 자료 및 학습

#### 공식 문서
- [face-api.js GitHub](https://github.com/justadudewhohacks/face-api.js)
- [Spring Boot Reference](https://spring.io/projects/spring-boot)
- [React Documentation](https://react.dev/)
- [Flyway Documentation](https://flywaydb.org/documentation/)

#### 개발 과정 참고 블로그
- [Java SDK 17 설치 가이드](https://coding-is-fun.tistory.com/15)
- [Gradle 설정 및 라이브러리 관리](https://ng-log.tistory.com/22)
- [BCrypt 암호화 생성기](https://bcrypt-generator.com/)
- [BPM 측정 도구](https://vocalremover.org/ko/key-bpm-finder)
- [Git 협업 가이드](https://12716.tistory.com/entry/Git-GitHub-협업하기)

### 🎵 게임 콘텐츠

#### 기본 제공 곡 (4곡)
| 곡명 | 아티스트 | BPM | 난이도 | 길이 |
|------|----------|-----|--------|------|
| Birthday Star | soyun | 90 | Normal | 1:44 |
| Combo | gongju | 88 | Easy | 1:00 |
| Rock | onepearl | 116 | Normal | 1:05 |
| Sungsimdang | jjooya | 130 | Hard | 1:09 |

### 🐛 알려진 이슈 및 해결

#### 해결된 주요 버그
- ✅ **오디오 재생 오류**: CORS 설정 및 Range 요청 지원으로 해결
- ✅ **로그인 한글 입력 방지**: 정규표현식 검증 추가
- ✅ **관리자 로그인 페이지 라우팅**: AdminController 생성으로 해결
- ✅ **점수 저장 오류**: user_id 타입 변경 (int → varchar)
- ✅ **난이도별 노트 생성 간격**: spawnRange 동적 조정

#### 개발 환경 이슈
- ⚠️ **환경 변수 설정 필수**: `DB_PASSWORD`를 시스템 환경 변수로 등록 필요
- ⚠️ **Git 협업 워크플로우**: `fetch` → 확인 → `pull` 순서 권장

### 🙏 특별 감사

프로젝트를 완성하는 데 도움을 주신 모든 분들께 감사드립니다:
- 학습 동아리 멘토 및 조언자
- 베타 테스트에 참여해주신 사용자들
- 오픈소스 커뮤니티 및 라이브러리 제작자들

---

<div align="center">

**즐거운 플레이 되세요! 😊**

Made with ❤️ by Team Magnesium Deficiency

© 2026 Team Magnesium Deficiency. All rights reserved.

</div>

---

<div align="right">

[![][back-to-top]](#top)

</div>

[back-to-top]: https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square