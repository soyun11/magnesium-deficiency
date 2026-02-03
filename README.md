# Magnesium Deficiency

Magnesium Deficiency is a rhythm game application with a web-based frontend and a Spring Boot backend. The game aims to provide an engaging rhythm experience, potentially incorporating facial interaction or webcam features based on the `face-api.js` and `react-webcam` dependencies.

## Features

*   **Rhythm Game Play:** Core rhythm game mechanics.
*   **User Authentication:** Secure user registration and login via Spring Security.
*   **High Score Tracking:** Persist and display user scores.
*   **Song Management:** Manage game songs and their associated data.
*   **Admin Dashboard:** (Inferred) for managing content or users.
*   **Webcam/Face Interaction:** (Potential) integration of `face-api.js` and `react-webcam` for unique gameplay elements.

## Technologies Used

### Frontend

*   **Framework:** React
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS, PostCSS
*   **Routing:** React Router DOM
*   **Face Detection:** `face-api.js`
*   **Webcam Integration:** `react-webcam`

### Backend

*   **Framework:** Spring Boot
*   **Language:** Java 17
*   **Database:** MySQL
*   **ORM:** Spring Data JPA
*   **Database Migrations:** Flyway
*   **Security:** Spring Security (JWT-based authentication)
*   **Build Tool:** Gradle
*   **Dependency Management:** Lombok

## Project Structure

The project is divided into two main parts:

*   `frontend/`: Contains the React application.
*   `backend/`: Contains the Spring Boot application.

```
.
├── frontend/                 # React frontend application
│   ├── public/               # Static assets, including face-api.js models
│   ├── src/                  # React source code
│   │   ├── assets/
│   │   ├── pages/            # Different pages like Home, RhythmGame, Auth, etc.
│   │   └── ...
│   ├── package.json
│   └── ...
└── backend/                  # Spring Boot backend application
    ├── src/main/java/com/facebeat/ # Core Java source code
    │   ├── config/           # Security and CORS configurations
    │   ├── controller/       # REST API controllers
    │   ├── dto/              # Data Transfer Objects (requests and responses)
    │   ├── entity/           # JPA entities
    │   ├── repository/       # Spring Data JPA repositories
    │   ├── service/          # Business logic services
    │   └── util/             # Utility classes like JwtUtil
    ├── src/main/resources/   # Application properties, static content, Flyway migrations
    │   ├── db/migration/     # SQL migration scripts
    │   └── ...
    ├── build.gradle
    └── ...
```

## Getting Started

### Prerequisites

*   Java Development Kit (JDK) 17 or higher
*   Node.js (LTS version)
*   npm or Yarn
*   MySQL database server
*   Git

### 1. Backend Setup

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Configure your MySQL database connection in `src/main/resources/application.properties` or `src/main/resources/application.yml`.
    **Example for `application.properties`:**
    ```properties
    spring.datasource.url=jdbc:mysql://localhost:3306/magnesium_db?useSSL=false&serverTimezone=UTC
    spring.datasource.username=your_mysql_username
    spring.datasource.password=your_mysql_password
    spring.jpa.hibernate.ddl-auto=none
    spring.flyway.enabled=true
    spring.flyway.baseline-on-migrate=true
    ```
3.  Build the project using Gradle:
    ```bash
    ./gradlew build
    ```
4.  Run the application:
    ```bash
    ./gradlew bootRun
    ```
    The backend will typically run on `http://localhost:8080`.

    **Note:** Flyway will automatically run database migrations on startup, creating the necessary tables and inserting initial data.

### 2. Frontend Setup

1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install the dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    The frontend will typically run on `http://localhost:5173` (or another port specified by Vite).

## Running the Application

1.  Ensure both the backend and frontend development servers are running as described above.
2.  Open your web browser and navigate to the frontend URL (e.g., `http://localhost:5173`).

Enjoy the Magnesium Deficiency rhythm game!