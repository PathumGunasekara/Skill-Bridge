# Skill Sharing Platform - README

## 🌟 Overview
Welcome to the Skill Sharing Platform, a web application that connects people who want to learn new skills with those who can teach them! This platform is built with React for the frontend and Spring Boot for the backend, using MongoDB as our database.

## ✨ Features
- **User Profiles**: Create and customize your profile
- **Skill Listings**: Browse and search for skills to learn or offer to teach
- **Messaging System**: Communicate with other users
- **Rating System**: Rate your learning/teaching experiences
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## 🛠️ Technologies Used
- **Frontend**: React.js, Redux, Material-UI, Axios
- **Backend**: Spring Boot, Java
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Java JDK (v11 or higher)
- MongoDB (v4.4 or higher)
- npm

### Installation

#### Frontend Setup
1. Navigate to the `frontend` folder
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example` and update with your configuration
4. Start the development server:
   ```bash
   npm start
   ```

#### Backend Setup
1. Navigate to the `backend` folder
2. Update `application.properties` with your MongoDB connection details
3. Build the project:
   ```bash
   ./mvnw clean package
   ```
4. Run the application:
   ```bash
   ./mvnw spring-boot:run
   ```

## 🌐 Accessing the Application
After starting both frontend and backend:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/api

## 🔒 Authentication
The platform uses JWT for authentication. After registering, you'll need to:
1. Login with your credentials
2. Use the returned token in the Authorization header for protected routes:
   ```
   Authorization: Bearer <your-token>
   ```

## 📂 Project Structure
```
skill-sharing-platform/
├── frontend/               # React frontend
│   ├── public/            # Static files
│   ├── src/               # React source code
│   │   ├── components/    # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   ├── store/        # Redux files
│   │   └── styles/       # Global styles
├── backend/               # Spring Boot backend
│   ├── src/main/java/    # Java source code
│   │   ├── config/       # Configuration classes
│   │   ├── controller/   # REST controllers
│   │   ├── model/        # Data models
│   │   ├── repository/   # MongoDB repositories
│   │   ├── service/      # Business logic
│   │   └── Security/     # Authentication files
│   └── resources/        # Configuration files
```

## 🤝 Contributing
We welcome contributions! Please follow these steps:
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License
This project is licensed under the MIT License.

---

Happy skill sharing! 🎉
