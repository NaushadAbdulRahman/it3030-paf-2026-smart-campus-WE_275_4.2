# PAF Application - Setup & Running Guide

## Project Structure

```
PAF_Assignment/
├── backend/          # Spring Boot Backend (Java)
│   ├── pom.xml
│   └── src/
│       └── main/java/com/paf/backend/
│           ├── BackendApplication.java
│           └── config/CorsConfig.java
│
├── frontend/         # React Frontend (JavaScript)
│   ├── package.json
│   ├── public/
│   └── src/
│       ├── App.js
│       ├── index.js
│       └── App.css
│
└── SETUP_GUIDE.md
```

## Prerequisites

### For Backend
- **Java 21** (or higher)
- Maven (included via `mvnw` wrapper)

### For Frontend
- **Node.js 22.x** or higher
- **npm 10.x** or higher

You can check if they're installed:
```powershell
node --version
npm --version
java -version
```

## Setup Instructions

### Step 1: Backend Setup

Navigate to the backend directory:
```powershell
cd C:\Users\user\OneDrive\Desktop\PAF_Assignment\backend
```

The Maven dependencies are already downloaded, but if you need to download them again:
```powershell
.\mvnw clean install
```

### Step 2: Frontend Setup

Navigate to the frontend directory:
```powershell
cd C:\Users\user\OneDrive\Desktop\PAF_Assignment\frontend
```

The npm dependencies are already installed. If you need to reinstall:
```powershell
npm install
```

## Running the Application

### Option 1: Run Both Services (Recommended)

**Terminal 1 - Start the Backend:**
```powershell
cd C:\Users\user\OneDrive\Desktop\PAF_Assignment\backend
.\mvnw spring-boot:run
```
Backend will be available at: `http://localhost:8080`

**Terminal 2 - Start the Frontend:**
```powershell
cd C:\Users\user\OneDrive\Desktop\PAF_Assignment\frontend
npm start
```
Frontend will automatically open at: `http://localhost:3000`

The frontend is configured with a proxy to the backend at `http://localhost:8080`, so API calls will work seamlessly.

### Option 2: Run Individual Services

**Backend Only:**
```powershell
cd C:\Users\user\OneDrive\Desktop\PAF_Assignment\backend
.\mvnw spring-boot:run
```

**Frontend Only:**
```powershell
cd C:\Users\user\OneDrive\Desktop\PAF_Assignment\frontend
npm start
```

## Building for Production

### Backend Build:
```powershell
cd C:\Users\user\OneDrive\Desktop\PAF_Assignment\backend
.\mvnw clean package -q
```
Output JAR: `backend/target/backend-0.0.1-SNAPSHOT.jar`

### Frontend Build:
```powershell
cd C:\Users\user\OneDrive\Desktop\PAF_Assignment\frontend
npm run build
```
Output directory: `frontend/build/`

## Technology Stack

### Backend
- **Framework**: Spring Boot 4.0.5
- **Language**: Java 21
- **Database Support**: MySQL (configured in pom.xml)
- **Features**: 
  - Spring Web (REST APIs)
  - Spring Data JPA (Database ORM)
  - Spring Security (Authentication & Authorization)
  - CORS enabled for localhost:3000
  - Validation support

### Frontend
- **Framework**: React 19.2.4
- **Styling**: CSS3
- **HTTP Client**: Axios (for API calls)
- **Routing**: React Router DOM 6
- **Node Scripts**: 5.0.1

## API Configuration

The frontend is configured to proxy requests to the backend using the `proxy` setting in `package.json`:

```json
"proxy": "http://localhost:8080"
```

This means you can make API calls in the frontend like:
```javascript
fetch('/api/endpoint')  // Automatically proxies to http://localhost:8080/api/endpoint
```

## CORS Configuration

The backend has CORS enabled for:
- `http://localhost:3000`
- `http://127.0.0.1:3000`

This allows the frontend to make requests to the backend without CORS errors.

## Troubleshooting

### Port Already in Use
If port 3000 or 8080 is already in use:

**Change backend port** - Edit `backend/src/main/resources/application.properties`:
```properties
server.port=8081
```

**Change frontend port** - Set environment variable before running:
```powershell
$env:PORT=3001
npm start
```

### Dependencies Not Installing
Clear cache and reinstall:

**Backend:**
```powershell
cd backend
rmdir -Recurse -Force target 2>$null
.\mvnw clean install
```

**Frontend:**
```powershell
cd frontend
rmdir -Recurse -Force node_modules 2>$null
rm package-lock.json
npm install
```

### Backend Won't Start
Check if Java is properly installed:
```powershell
java -version
javac -version
```

### Frontend Shows "Cannot connect to backend"
1. Ensure backend is running on port 8080
2. Check if CORS is properly configured
3. Clear browser cache and reload
4. Check browser console for specific errors

## Security Notes

- ✅ All direct dependencies are CVE-free
- Spring Security is enabled (configure authentication in SecurityConfig if needed)
- CORS is restricted to localhost only (change in `CorsConfig.java` for production)
- Update dependencies regularly: `npm audit fix` for frontend

## Next Steps

1. Configure database connection in `application.properties`
2. Create your first REST API endpoints
3. Build React components to consume the API
4. Test the full-stack integration
5. Deploy to your preferred hosting platform

## Support

For issues:
1. Check the troubleshooting section above
2. Review Maven/npm error messages carefully
3. Ensure all prerequisites are installed
4. Try clearing cache and reinstalling dependencies

