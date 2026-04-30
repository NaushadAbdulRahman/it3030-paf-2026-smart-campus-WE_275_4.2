# 🏗️ Architecture & Setup Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    YOUR BROWSER                              │
│                 (localhost:3000)                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  React Frontend Application                           │  │
│  │  ✨ Clean, Professional UI                            │  │
│  │  - Smart Campus System Interface                      │  │
│  │  - Module Cards                                       │  │
│  │  - Status Indicators                                  │  │
│  │  - Tech Stack Display                                 │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕️ (via proxy)
                    API Calls on /api/test
┌─────────────────────────────────────────────────────────────┐
│              SPRING BOOT BACKEND                              │
│                 (localhost:8080)                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Spring Boot 4.0.5 Application                       │  │
│  │  - REST API Endpoints                                │  │
│  │  - TestController (/api/test)                        │  │
│  │  - Security Configuration                             │  │
│  │  - JPA/Hibernate ORM                                 │  │
│  └───────────────────────────────────────────────────────┘  │
│                            ↕️                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  H2 IN-MEMORY DATABASE (Development)                 │  │
│  │  - JDBC: jdbc:h2:mem:testdb                         │  │
│  │  - User: sa                                           │  │
│  │  - Auto-generated schema                              │  │
│  │  - H2 Console: /h2-console                            │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Network Communication Flow

```
USER ACTION
    ↓
┌─────────────────────────┐
│ Frontend (localhost:3000)│
│ Fetch /api/test         │
└────────────┬────────────┘
             ↓
    ┌────────────────────┐
    │ Check for proxy    │
    │ (http://localhost  │
    │  :8080)            │
    └────────┬───────────┘
             ↓
┌──────────────────────────────────┐
│ Backend (localhost:8080)         │
│ Route: GET /api/test             │
│ Handler: TestController.test()   │
└────────────┬─────────────────────┘
             ↓
    ┌────────────────────┐
    │ Return Response    │
    │ (Text)             │
    └────────┬───────────┘
             ↓
┌─────────────────────────────────────┐
│ Frontend receives response          │
│ Display in Status Card              │
│ Update UI with status indicator     │
└─────────────────────────────────────┘
```

---

## File Organization

```
PAF_Assignment/
│
├── 📄 README.md                          (Original project README)
├── 📄 DEPLOYMENT_SUMMARY.md              (What was fixed)
├── 📄 UI_IMPROVEMENTS.md                 (Design details)
├── 📄 QUICKSTART.md                      (Quick reference)
├── 📄 VERIFICATION_CHECKLIST.md          (Verification status)
├── 📄 ARCHITECTURE_GUIDE.md              (This file)
│
├── 🗂️ backend/
│   ├── 📄 pom.xml                        ✅ H2 dependency added
│   ├── 📄 mvnw.cmd                       (Maven wrapper)
│   ├── 📂 src/
│   │   ├── 📂 main/
│   │   │   ├── 📂 java/com/paf/backend/
│   │   │   │   ├── BackendApplication.java
│   │   │   │   ├── 📂 config/
│   │   │   │   │   └── SecurityConfig.java
│   │   │   │   ├── 📂 controller/
│   │   │   │   │   └── TestController.java
│   │   │   │   ├── 📂 dto/
│   │   │   │   ├── 📂 exception/
│   │   │   │   ├── 📂 model/
│   │   │   │   ├── 📂 repository/
│   │   │   │   └── 📂 service/
│   │   │   └── 📂 resources/
│   │   │       └── application.properties ✅ H2 configured
│   │   └── 📂 test/
│   │       └── BackendApplicationTests.java
│   └── 📂 target/                        (Build output)
│
└── 🗂️ frontend/
    ├── 📄 package.json                   ✅ Proxy configured
    ├── 📄 README.md
    ├── 📂 public/
    │   ├── index.html
    │   ├── favicon.ico
    │   └── ...
    ├── 📂 src/
    │   ├── 📄 App.js                     ✅ Using /api/test
    │   ├── 📄 App.css                    ✅ Redesigned
    │   ├── 📄 index.js
    │   ├── 📄 index.css                  ✅ Updated colors
    │   ├── 📂 components/                (Ready for expansion)
    │   ├── 📂 pages/                     (Ready for expansion)
    │   └── 📂 services/                  (Ready for expansion)
    └── 📂 node_modules/                  (npm dependencies)
```

---

## Configuration Files

### Backend: pom.xml (Key Addition)
```xml
<!-- H2 Database (for development) -->
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>runtime</scope>
</dependency>
```

### Backend: application.properties
```properties
spring.application.name=backend

# H2 Database Configuration (Development)
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

# H2 Console (optional - useful for debugging)
spring.h2.console.enabled=true

# JPA Configuration
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true
```

### Frontend: package.json (Proxy Config)
```json
{
  "name": "frontend",
  "version": "0.1.0",
  "private": true,
  "proxy": "http://localhost:8080",  // ✅ CORS Prevention
  "dependencies": {
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "react-scripts": "5.0.1"
  }
}
```

---

## Ports & Endpoints

```
FRONTEND SERVICE
├── Main UI: http://localhost:3000
└── All pages: http://localhost:3000/*

BACKEND SERVICE
├── API Base: http://localhost:8080
├── Health Check: http://localhost:8080/api/test
├── H2 Console: http://localhost:8080/h2-console
└── Actuator: http://localhost:8080/actuator

DATABASE
├── Type: H2 In-Memory
├── JDBC URL: jdbc:h2:mem:testdb
├── Username: sa
└── Password: (empty)
```

---

## Development Workflow

### 1️⃣ Start Backend
```powershell
cd backend
.\mvnw.cmd spring-boot:run
# Waits for terminal 1... ⏳
# Backend ready! ✅
```

### 2️⃣ Start Frontend (New Terminal)
```powershell
cd frontend
npm start
# Launches browser automatically... 🌐
# Frontend ready! ✅
```

### 3️⃣ Interact with Application
```
User interacts with React UI
    ↓
React makes API call to /api/test
    ↓
Proxy intercepts and routes to :8080
    ↓
Spring Boot handles request
    ↓
Response sent back to React
    ↓
UI updates with status
```

### 4️⃣ Debug if needed
```
Open H2 Console:
→ http://localhost:8080/h2-console
→ JDBC URL: jdbc:h2:mem:testdb
→ Username: sa
→ Password: (leave blank)
→ View/test database
```

---

## Technology Stack

```
FRONTEND LAYER
├── React 19.2.4
├── Modern CSS3 (Custom)
├── JavaScript ES6+
└── Responsive Design

API COMMUNICATION
├── HTTP/REST
├── Fetch API
└── Proxy for CORS

BACKEND LAYER
├── Spring Boot 4.0.5
├── Spring MVC
├── Spring Security
├── Spring Data JPA
└── Hibernate ORM

DATABASE LAYER
├── H2 (Development)
├── In-Memory Storage
└── JDBC Connection

BUILD TOOLS
├── Maven (Backend)
├── npm (Frontend)
└── Maven Wrapper
```

---

## Deployment Process

### Step 1: Verify Backend
```powershell
cd backend
.\mvnw.cmd clean package -DskipTests
# Should complete with BUILD SUCCESS
```

### Step 2: Verify Frontend
```powershell
cd frontend
npm install
# Should complete without errors
```

### Step 3: Start Backend
```powershell
.\mvnw.cmd spring-boot:run
# Wait for "Started BackendApplication"
```

### Step 4: Start Frontend
```powershell
npm start
# Wait for browser to open
```

### Step 5: Verify Communication
- Navigate to http://localhost:3000
- Check "System Status" section
- Should show ✅ "Backend Connected"

---

## Performance Characteristics

### Frontend Performance
- ✅ **No large gradients** (minimal GPU load)
- ✅ **Minimal shadows** (faster rendering)
- ✅ **Optimized CSS** (smaller file size)
- ✅ **React 19** (latest optimizations)

### Backend Performance
- ✅ **H2 in-memory** (extremely fast)
- ✅ **No network latency** (local database)
- ✅ **Spring Boot 4.0.5** (latest features)
- ✅ **JPA/Hibernate** (ORM optimization)

### Network Performance
- ✅ **Proxy enabled** (no CORS overhead)
- ✅ **Single request** for API calls
- ✅ **No data transformation** needed
- ✅ **Direct communication** via localhost

---

## Scalability Path

### Current State (Development)
```
H2 In-Memory Database
Perfect for: Development, Testing, Prototyping
Limit: Data lost on restart
```

### Future State (Production)
```
MySQL Database
Perfect for: Production, Persistence
Setup:
1. Install MySQL Server
2. Create database & user
3. Update application.properties
4. Add MySQL connector to pom.xml
5. Rebuild backend
```

### Migration Steps
```
1. Export current schema from H2
2. Create equivalent MySQL database
3. Update connection strings
4. Run migrations
5. Test thoroughly
6. Deploy
```

---

## Troubleshooting Decision Tree

```
Application won't start?
├─ Backend issue?
│  ├─ Check port 8080 free? → Kill Java process
│  ├─ Check Java 21 installed? → Install/update Java
│  ├─ Check Maven available? → Add to PATH
│  └─ Check pom.xml? → Run: mvn clean install
└─ Frontend issue?
   ├─ Check port 3000 free? → Change port
   ├─ Check Node.js? → Install Node.js
   ├─ Check npm? → npm install
   └─ Check dependencies? → npm install

Communication issue?
├─ Frontend can't reach backend?
│  ├─ Proxy configured? → Check package.json
│  ├─ Backend running? → Check port 8080
│  └─ CORS enabled? → Check Spring config
└─ Database issue?
   ├─ H2 available? → Check pom.xml
   ├─ Connection string? → Check application.properties
   └─ DDL strategy? → Check spring.jpa.hibernate.ddl-auto

UI issue?
├─ Styles not loading?
│  └─ CSS files present? → Check App.css, index.css
├─ Colors wrong?
│  └─ Update index.css global colors
└─ Responsive broken?
   └─ Check media queries in App.css
```

---

## Success Criteria

✅ **All Met!**

- [x] Backend builds without errors
- [x] Backend runs on port 8080
- [x] Frontend runs on port 3000
- [x] Frontend communicates with backend
- [x] API endpoint responds correctly
- [x] CORS proxy configured
- [x] UI displays professionally
- [x] Database initialized automatically
- [x] No missing dependencies
- [x] Documentation complete

---

**Architecture Status**: ✅ COMPLETE  
**System Status**: ✅ OPERATIONAL  
**Ready for**: ✅ DEPLOYMENT

Happy coding! 🚀

