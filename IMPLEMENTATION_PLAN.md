# Smart Campus Operations Hub — AI Implementation Plan
### IT3030 Programming Applications and Frameworks (2026 Semester 1)

> **Purpose:** This document is a complete prompt-by-prompt guide for using an AI coding model (Cursor, GitHub Copilot, Claude Code, etc.) to build the Smart Campus Operations Hub. Follow each phase in order. Copy the prompts exactly or adapt them. Do not skip phases — later prompts depend on earlier scaffolding.

---

## Project Overview

| Item | Detail |
|---|---|
| **Assignment weight** | 30% of IT3030 final mark |
| **Deadline** | 27 April 2026 at 11:45 PM (GMT +5:30) via Courseweb |
| **Required stack** | Spring Boot REST API + React client web application |
| **Database** | PostgreSQL (recommended) or MySQL — no in-memory collections |
| **Auth** | OAuth 2.0 — Google Sign-In via Spring Security |
| **Version control** | GitHub repository with active commit history + GitHub Actions CI |
| **Group size** | 4 members (individually assessed) |
| **Report file name** | `IT3030_PAF_Assignment_2026_GroupXX.pdf` |
| **Repo name** | `it3030-paf-2026-smart-campus-groupXX` |

---

## Non-Negotiable Rules (read before prompting anything)

1. **Each member must implement at least 4 REST API endpoints** using different HTTP methods (GET, POST, PUT/PATCH, DELETE).
2. **No in-memory storage** — all data must persist to a real database.
3. **Correct HTTP status codes** — 200, 201, 204, 400, 401, 403, 404, 409, 500.
4. **Role-based access control** — minimum roles: `USER` and `ADMIN`. Recommended: also `TECHNICIAN`.
5. **Clean layered architecture** — Controller → Service → Repository. No business logic in controllers.
6. **AI tool usage must be disclosed** in your final report and viva.
7. **Commit history must show individual work** — no single-day bulk commits.
8. **The README must match** what is implemented.

---

## Module Ownership (copy to your team)

| Member | Module | Minimum Endpoints |
|---|---|---|
| Member 1 | Module A — Facilities & Assets Catalogue | `GET /api/resources`, `POST /api/resources`, `PUT /api/resources/{id}`, `DELETE /api/resources/{id}` |
| Member 2 | Module B — Booking Management | `POST /api/bookings`, `GET /api/bookings`, `PUT /api/bookings/{id}/approve`, `PUT /api/bookings/{id}/cancel` |
| Member 3 | Module C — Maintenance & Incident Ticketing | `POST /api/tickets`, `GET /api/tickets/{id}`, `PATCH /api/tickets/{id}/status`, `POST /api/tickets/{id}/comments` |
| Member 4 | Module D+E — Notifications + Auth | `GET /api/auth/me`, `GET /api/notifications`, `PUT /api/notifications/{id}/read`, `DELETE /api/notifications/{id}` |

---

## Technology Stack Reference

```
Backend
├── Java 17+
├── Spring Boot 3.x
│   ├── spring-boot-starter-web
│   ├── spring-boot-starter-data-jpa
│   ├── spring-boot-starter-security
│   ├── spring-boot-starter-oauth2-client
│   ├── spring-boot-starter-validation
│   └── spring-boot-starter-test
├── PostgreSQL (or MySQL)
├── Flyway (DB migrations — recommended)
├── Lombok
└── MapStruct or manual DTOs

Frontend
├── React 18+ with Vite
├── React Router v6
├── Axios (HTTP client)
├── Context API or Zustand (state management)
├── TailwindCSS or Material UI
└── React Query (optional, for server state)

DevOps
├── GitHub (version control)
└── GitHub Actions (CI — build + test)
```

---

## Phase 0 — Project Scaffolding

### 0.1 — Generate Spring Boot Project

Go to [https://start.spring.io](https://start.spring.io) and select:
- **Project:** Maven
- **Language:** Java 17
- **Spring Boot:** 3.x latest
- **Dependencies:** Spring Web, Spring Data JPA, Spring Security, OAuth2 Client, Validation, Lombok, PostgreSQL Driver, Spring Boot Test

Then give the AI this prompt:

---

**AI Prompt 0.1 — Spring Boot Project Structure**

```
Set up a Spring Boot 3 project called "smart-campus" with the following package structure:

com.smartcampus
├── config/          (SecurityConfig, WebConfig, AppConfig)
├── controller/      (REST controllers, one per module)
├── service/         (business logic interfaces + impls)
├── repository/      (Spring Data JPA repositories)
├── entity/          (JPA entities)
├── dto/             (request and response DTOs)
│   ├── request/
│   └── response/
├── exception/       (custom exceptions + GlobalExceptionHandler)
├── security/        (JWT utilities, OAuth2 handlers)
├── util/            (helpers)
└── SmartCampusApplication.java

Create the following in application.yml:
- spring.datasource pointing to a PostgreSQL DB named "smart_campus_db"
- spring.jpa.hibernate.ddl-auto=validate
- spring.jpa.show-sql=true
- A jwt.secret placeholder and jwt.expiration=86400000
- A spring.servlet.multipart.max-file-size=10MB setting

Do not add any business logic yet. Just the folder structure and application.yml.
```

---

### 0.2 — Generate React Project

**AI Prompt 0.2 — React Project Structure**

```
Create a React 18 project using Vite with the following folder structure:

src/
├── api/              (axios instance + per-module API functions)
│   ├── axiosInstance.js   (base URL, interceptors, JWT header injection)
│   ├── authApi.js
│   ├── resourceApi.js
│   ├── bookingApi.js
│   ├── ticketApi.js
│   └── notificationApi.js
├── components/       (shared/reusable UI components)
│   ├── Navbar.jsx
│   ├── Sidebar.jsx
│   ├── ProtectedRoute.jsx
│   ├── LoadingSpinner.jsx
│   └── NotificationBell.jsx
├── context/
│   └── AuthContext.jsx    (user state, login, logout functions)
├── pages/
│   ├── LoginPage.jsx
│   ├── DashboardPage.jsx
│   ├── resources/
│   │   ├── ResourceListPage.jsx
│   │   └── ResourceFormPage.jsx
│   ├── bookings/
│   │   ├── BookingListPage.jsx
│   │   └── BookingFormPage.jsx
│   ├── tickets/
│   │   ├── TicketListPage.jsx
│   │   ├── TicketFormPage.jsx
│   │   └── TicketDetailPage.jsx
│   └── admin/
│       ├── AdminBookingsPage.jsx
│       └── AdminDashboardPage.jsx
├── routes/
│   └── AppRoutes.jsx      (React Router v6 route definitions)
└── main.jsx

Set up React Router v6 with routes for each page above.
Set up an Axios instance in axiosInstance.js that:
- Has baseURL pointing to http://localhost:8080/api
- Attaches the JWT token from localStorage on every request via a request interceptor
- On 401 response, clears localStorage and redirects to /login

Set up AuthContext with: user state, login(token) function that decodes JWT and sets user, logout() function, and isAuthenticated boolean.

Install: axios, react-router-dom, and optionally tailwindcss.
```

---

### 0.3 — GitHub Actions CI

**AI Prompt 0.3 — GitHub Actions Workflow**

```
Create a GitHub Actions workflow file at .github/workflows/ci.yml that:
1. Triggers on push and pull_request to main and develop branches
2. Has two jobs:
   a. "backend" job:
      - Runs on ubuntu-latest
      - Sets up Java 17
      - Runs: mvn clean test (from the backend/ directory)
      - Uses a PostgreSQL service container for integration tests
        (image: postgres:15, env: POSTGRES_DB=smart_campus_test, POSTGRES_USER=test, POSTGRES_PASSWORD=test)
   b. "frontend" job:
      - Runs on ubuntu-latest
      - Sets up Node 20
      - Runs: npm ci && npm run build (from the frontend/ directory)
3. Both jobs must pass for the workflow to succeed

Use clear step names. This is required for the assignment marking rubric.
```

---

## Phase 1 — Authentication & Authorization (Member 4)

### 1.1 — User Entity and Roles

**AI Prompt 1.1 — User Entity**

```
Create a JPA entity class User in com.smartcampus.entity with these fields:
- id: Long (auto-generated primary key)
- email: String (unique, not null)
- name: String (not null)
- profilePictureUrl: String (nullable)
- role: enum Role { USER, ADMIN, TECHNICIAN } (not null, default USER)
- createdAt: LocalDateTime (auto-set on create)
- updatedAt: LocalDateTime (auto-set on update)

Use Lombok @Data, @Builder, @NoArgsConstructor, @AllArgsConstructor.
Use @PrePersist and @PreUpdate for timestamps.
Use @Enumerated(EnumType.STRING) for role.

Create a UserRepository interface extending JpaRepository<User, Long> with:
- Optional<User> findByEmail(String email)

Create a UserResponseDto with: id, email, name, profilePictureUrl, role, createdAt.
```

---

### 1.2 — OAuth2 + JWT Security

**AI Prompt 1.2 — Spring Security + OAuth2 + JWT**

```
Implement Spring Security with OAuth2 Google login and JWT for a Spring Boot 3 app.

Requirements:
1. SecurityConfig class:
   - Disable CSRF (REST API)
   - Stateless session (SessionCreationPolicy.STATELESS)
   - Permit: GET /api/resources (public browse), POST /api/auth/**, /oauth2/**
   - Require authentication for all other /api/** endpoints
   - Add a JwtAuthenticationFilter before UsernamePasswordAuthenticationFilter
   - Configure oauth2Login with a custom OAuth2AuthenticationSuccessHandler

2. JwtUtil class with:
   - generateToken(User user): creates a JWT containing userId, email, role. Expires in 24h.
   - validateToken(String token): returns boolean
   - extractEmail(String token): returns String
   - extractRole(String token): returns String
   - Use the jwt.secret from application.yml. Use io.jsonwebtoken (jjwt) library.

3. JwtAuthenticationFilter extends OncePerRequestFilter:
   - Reads Authorization: Bearer <token> header
   - Validates token, loads user from DB, sets SecurityContextHolder

4. OAuth2AuthenticationSuccessHandler:
   - On successful Google login, find or create the User in DB (by email)
   - Generate a JWT for that user
   - Redirect to: http://localhost:5173/oauth2/callback?token=<jwt>

5. CustomOAuth2UserService:
   - Loads user info from Google OAuth2 response
   - Returns a CustomOAuth2User implementing OAuth2User + UserDetails

Configure application.yml with:
  spring.security.oauth2.client.registration.google:
    client-id: ${GOOGLE_CLIENT_ID}
    client-secret: ${GOOGLE_CLIENT_SECRET}
    scope: email, profile

Add jjwt-api, jjwt-impl, jjwt-jackson to pom.xml.
```

---

### 1.3 — Auth Controller

**AI Prompt 1.3 — Auth Controller and /me Endpoint**

```
Create AuthController in com.smartcampus.controller with:

1. GET /api/auth/me
   - Requires authentication
   - Reads the authenticated user from SecurityContext
   - Fetches full user from DB
   - Returns UserResponseDto
   - HTTP 200

2. GET /api/auth/roles (ADMIN only)
   - Returns list of all Role enum values
   - HTTP 200

Also create a GlobalExceptionHandler class annotated with @RestControllerAdvice that handles:
- ResourceNotFoundException → 404 with { "error": "Not Found", "message": "..." }
- AccessDeniedException → 403 with { "error": "Forbidden", "message": "..." }
- MethodArgumentNotValidException → 400 with { "error": "Validation Failed", "fields": { fieldName: errorMessage } }
- Generic Exception → 500 with { "error": "Internal Server Error" }

All error responses must include a "timestamp" field (ISO-8601).
```

---

### 1.4 — React Auth (Member 4 Frontend)

**AI Prompt 1.4 — React OAuth2 Login Flow**

```
Implement the Google OAuth2 login flow in React:

1. LoginPage.jsx:
   - Shows a "Sign in with Google" button
   - On click, redirects browser to: http://localhost:8080/oauth2/authorization/google
   - Clean, centered layout

2. OAuth2CallbackPage.jsx (route: /oauth2/callback):
   - On mount, reads the "token" query parameter from the URL
   - Calls AuthContext.login(token) which:
     a. Decodes the JWT (use jwt-decode library) to get { userId, email, role }
     b. Stores token in localStorage
     c. Sets user state in context
   - Redirects to /dashboard

3. ProtectedRoute.jsx:
   - Wraps routes that require authentication
   - If not authenticated, redirects to /login
   - Accepts a "roles" prop — if provided, checks user.role is in that array, else redirects to /dashboard with a "Forbidden" message

4. Update AppRoutes.jsx with:
   - /login → LoginPage (public)
   - /oauth2/callback → OAuth2CallbackPage (public)
   - /dashboard → DashboardPage (protected, any role)
   - /resources → ResourceListPage (protected, any role)
   - /resources/new → ResourceFormPage (protected, ADMIN only)
   - /bookings → BookingListPage (protected, any role)
   - /bookings/new → BookingFormPage (protected, USER role)
   - /tickets → TicketListPage (protected, any role)
   - /tickets/new → TicketFormPage (protected, USER)
   - /tickets/:id → TicketDetailPage (protected, any role)
   - /admin/bookings → AdminBookingsPage (protected, ADMIN only)
   - /admin/dashboard → AdminDashboardPage (protected, ADMIN only)
```

---

## Phase 2 — Module A: Facilities & Assets Catalogue (Member 1)

### 2.1 — Resource Entity

**AI Prompt 2.1 — Resource Entity and Repository**

```
Create a JPA entity Resource in com.smartcampus.entity:

Fields:
- id: Long (auto-generated)
- name: String (not null)
- type: enum ResourceType { LECTURE_HALL, LAB, MEETING_ROOM, PROJECTOR, CAMERA, OTHER } (not null)
- capacity: Integer (nullable — for rooms; null for equipment)
- location: String (not null, e.g. "Block A, Floor 2")
- description: String (nullable)
- availabilityStart: LocalTime (e.g. 08:00 — when bookable from)
- availabilityEnd: LocalTime (e.g. 22:00 — when bookable until)
- status: enum ResourceStatus { ACTIVE, OUT_OF_SERVICE, UNDER_MAINTENANCE } (default ACTIVE)
- createdAt: LocalDateTime
- updatedAt: LocalDateTime

Use Lombok, @Enumerated(EnumType.STRING), @PrePersist/@PreUpdate for timestamps.

Create ResourceRepository extending JpaRepository<Resource, Long> with a custom JPQL query:
@Query("SELECT r FROM Resource r WHERE " +
  "(:type IS NULL OR r.type = :type) AND " +
  "(:location IS NULL OR LOWER(r.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
  "(:minCapacity IS NULL OR r.capacity >= :minCapacity) AND " +
  "(:status IS NULL OR r.status = :status)")
Page<Resource> searchResources(
  @Param("type") ResourceType type,
  @Param("location") String location,
  @Param("minCapacity") Integer minCapacity,
  @Param("status") ResourceStatus status,
  Pageable pageable
);

Create DTOs:
- ResourceRequest: name (required), type (required), capacity, location (required), description, availabilityStart, availabilityEnd, status
  Add Bean Validation: @NotBlank, @NotNull, @Min(1) where appropriate
- ResourceResponse: all fields including id, createdAt, updatedAt
```

---

### 2.2 — Resource Service and Controller

**AI Prompt 2.2 — Resource Service and Controller**

```
Create ResourceService interface and ResourceServiceImpl in com.smartcampus.service:

Methods:
- Page<ResourceResponse> searchResources(ResourceType type, String location, Integer minCapacity, ResourceStatus status, int page, int size)
- ResourceResponse getResourceById(Long id) — throws ResourceNotFoundException if not found
- ResourceResponse createResource(ResourceRequest request) — ADMIN only (enforce in controller)
- ResourceResponse updateResource(Long id, ResourceRequest request) — ADMIN only
- void deleteResource(Long id) — soft delete: set status to OUT_OF_SERVICE — ADMIN only

Create ResourceController with base path /api/resources:
- GET /api/resources — public — accepts query params: type, location, minCapacity, status, page (default 0), size (default 10) — returns Page<ResourceResponse>
- GET /api/resources/{id} — public — returns ResourceResponse or 404
- POST /api/resources — ADMIN only — @Valid @RequestBody ResourceRequest — returns 201 Created with ResourceResponse
- PUT /api/resources/{id} — ADMIN only — @Valid @RequestBody ResourceRequest — returns 200 with ResourceResponse
- DELETE /api/resources/{id} — ADMIN only — returns 204 No Content

Use @PreAuthorize("hasRole('ADMIN')") on POST, PUT, DELETE.
Throw ResourceNotFoundException (extends RuntimeException) when resource not found.
Map between entity and DTO manually or with MapStruct — be consistent.
Return proper HTTP status codes using ResponseEntity.
```

---

### 2.3 — Resource UI (Member 1 Frontend)

**AI Prompt 2.3 — Resource List and Form Pages**

```
Build two React pages for the Facilities module:

1. ResourceListPage.jsx:
   - Fetches GET /api/resources with pagination (page, size=10)
   - Filter controls at the top: type (dropdown), location (text input), minCapacity (number), status (dropdown)
   - Each resource shown as a card with: name, type badge, location, capacity, status chip (color-coded: green=ACTIVE, red=OUT_OF_SERVICE, amber=UNDER_MAINTENANCE)
   - Pagination controls (Previous / Next)
   - If user.role === 'ADMIN': show "Add Resource" button linking to /resources/new
   - If user.role === 'ADMIN': each card shows Edit and Delete buttons
   - Delete calls DELETE /api/resources/{id} and refreshes list with a confirmation dialog

2. ResourceFormPage.jsx (used for both create and edit):
   - If route param :id exists, fetches GET /api/resources/{id} and pre-fills form
   - Fields: name, type (select), capacity (number, optional), location, description (textarea), availabilityStart (time), availabilityEnd (time), status (select)
   - On submit: POST /api/resources (create) or PUT /api/resources/{id} (edit)
   - Shows validation errors from API response under each field
   - On success: redirects to /resources with a success toast

Create a resourceApi.js file in src/api/:
- getResources(params) → GET /api/resources
- getResourceById(id) → GET /api/resources/{id}
- createResource(data) → POST /api/resources
- updateResource(id, data) → PUT /api/resources/{id}
- deleteResource(id) → DELETE /api/resources/{id}
```

---

## Phase 3 — Module B: Booking Management (Member 2)

### 3.1 — Booking Entity

**AI Prompt 3.1 — Booking Entity and Repository**

```
Create a JPA entity Booking in com.smartcampus.entity:

Fields:
- id: Long (auto-generated)
- resource: @ManyToOne Resource (not null, fetch LAZY)
- user: @ManyToOne User (not null, fetch LAZY)
- date: LocalDate (not null)
- startTime: LocalTime (not null)
- endTime: LocalTime (not null)
- purpose: String (not null)
- expectedAttendees: Integer (nullable)
- status: enum BookingStatus { PENDING, APPROVED, REJECTED, CANCELLED } (default PENDING)
- rejectionReason: String (nullable — populated when REJECTED)
- createdAt: LocalDateTime
- updatedAt: LocalDateTime

Use Lombok, @Enumerated(EnumType.STRING), timestamps via @PrePersist/@PreUpdate.

Create BookingRepository extending JpaRepository<Booking, Long> with:

1. Conflict detection query:
@Query("SELECT COUNT(b) > 0 FROM Booking b WHERE " +
  "b.resource.id = :resourceId AND " +
  "b.date = :date AND " +
  "b.status = 'APPROVED' AND " +
  "b.startTime < :endTime AND b.endTime > :startTime")
boolean existsConflict(
  @Param("resourceId") Long resourceId,
  @Param("date") LocalDate date,
  @Param("startTime") LocalTime startTime,
  @Param("endTime") LocalTime endTime
);

2. Page<Booking> findByUser(User user, Pageable pageable);
3. Page<Booking> findByUserAndStatus(User user, BookingStatus status, Pageable pageable);
4. Page<Booking> findAllByStatus(BookingStatus status, Pageable pageable); (admin)
5. Page<Booking> findAll(Pageable pageable); (admin — all bookings)

Create DTOs:
- BookingRequest: resourceId (required), date (required, future), startTime (required), endTime (required), purpose (required), expectedAttendees
  Validation: @NotNull, @Future on date, custom validator that endTime is after startTime
- BookingResponse: id, resource (ResourceResponse), user (UserResponseDto), date, startTime, endTime, purpose, expectedAttendees, status, rejectionReason, createdAt
- BookingStatusUpdateRequest: reason (optional String — required only for REJECTED)
```

---

### 3.2 — Booking Service and Controller

**AI Prompt 3.2 — Booking Service and Controller**

```
Create BookingService interface and BookingServiceImpl:

Methods:
- BookingResponse createBooking(BookingRequest request, Long userId)
  Steps:
  1. Fetch resource — throw 404 if not found
  2. Check resource.status == ACTIVE — throw 400 if not
  3. Check resource availability windows — throw 400 if booking time is outside them
  4. Call bookingRepository.existsConflict() — throw 409 ConflictException("Resource already booked for this time") if true
  5. Create booking with status PENDING
  6. Save and return BookingResponse
  7. Trigger notification to ADMIN (call NotificationService)

- Page<BookingResponse> getMyBookings(Long userId, BookingStatus status, int page, int size)
- Page<BookingResponse> getAllBookings(BookingStatus status, int page, int size) — admin
- BookingResponse approveBooking(Long bookingId) — admin; sets status APPROVED; notifies user
- BookingResponse rejectBooking(Long bookingId, String reason) — admin; sets status REJECTED; notifies user
- BookingResponse cancelBooking(Long bookingId, Long userId)
  — User can cancel own PENDING or APPROVED bookings
  — Throw 403 if booking belongs to different user (and requester is not ADMIN)

Create BookingController with base path /api/bookings:
- POST /api/bookings — authenticated USER — @Valid body — 201 Created
- GET /api/bookings — authenticated:
    if ADMIN: returns all bookings (filterable by status)
    if USER: returns only their bookings (filterable by status)
    Use ?status=PENDING&page=0&size=10 query params
- GET /api/bookings/{id} — authenticated; USER only sees own booking; ADMIN sees all — 200 or 404 or 403
- PUT /api/bookings/{id}/approve — ADMIN only — 200
- PUT /api/bookings/{id}/reject — ADMIN only — @RequestBody BookingStatusUpdateRequest — 200
- PUT /api/bookings/{id}/cancel — authenticated; owner or ADMIN — 200

Add ConflictException (HTTP 409) to GlobalExceptionHandler.
Add ForbiddenException (HTTP 403) to GlobalExceptionHandler.
```

---

### 3.3 — Booking UI (Member 2 Frontend)

**AI Prompt 3.3 — Booking Pages**

```
Build React pages for Booking Management:

1. BookingFormPage.jsx:
   - Fetches available resources from GET /api/resources?status=ACTIVE
   - Fields: resource (searchable dropdown), date (date picker, no past dates), startTime, endTime, purpose (textarea), expectedAttendees (number, optional)
   - Client-side validation: endTime must be after startTime
   - On submit: POST /api/bookings
   - Shows 409 conflict error clearly: "This resource is already booked for the selected time"
   - On success: redirect to /bookings with success toast

2. BookingListPage.jsx (for USER):
   - Fetches GET /api/bookings with pagination
   - Filter by status (tabs or dropdown: All, Pending, Approved, Rejected, Cancelled)
   - Each booking card shows: resource name, date, time range, purpose, status chip
   - If status is PENDING or APPROVED: show "Cancel" button
   - Cancel calls PUT /api/bookings/{id}/cancel with confirmation dialog

3. AdminBookingsPage.jsx (ADMIN only):
   - Same list as above but shows all users' bookings
   - Each row shows: user name/email, resource, date, time, status
   - For PENDING bookings: "Approve" and "Reject" buttons
   - Reject opens a modal/dialog asking for a rejection reason (text area)
   - Approve calls PUT /api/bookings/{id}/approve
   - Reject calls PUT /api/bookings/{id}/reject with { reason: "..." }

Create bookingApi.js with all required API calls.
```

---

## Phase 4 — Module C: Maintenance & Incident Ticketing (Member 3)

### 4.1 — Ticket Entity and Attachments

**AI Prompt 4.1 — Ticket Entity, Comment Entity, Repository**

```
Create two JPA entities:

1. IncidentTicket in com.smartcampus.entity:
Fields:
- id: Long (auto-generated)
- resource: @ManyToOne Resource (nullable — ticket may be for a general location)
- location: String (not null — free text)
- reporter: @ManyToOne User (not null)
- assignedTechnician: @ManyToOne User (nullable)
- category: enum TicketCategory { ELECTRICAL, PLUMBING, IT_EQUIPMENT, FURNITURE, CLEANING, OTHER } (not null)
- description: String (not null, max 2000 chars)
- priority: enum TicketPriority { LOW, MEDIUM, HIGH, CRITICAL } (default MEDIUM)
- status: enum TicketStatus { OPEN, IN_PROGRESS, RESOLVED, CLOSED, REJECTED } (default OPEN)
- rejectionReason: String (nullable)
- resolutionNotes: String (nullable)
- preferredContactDetails: String (nullable)
- attachmentPaths: List<String> (stored as @ElementCollection — up to 3 image paths)
- createdAt: LocalDateTime
- updatedAt: LocalDateTime

2. TicketComment in com.smartcampus.entity:
Fields:
- id: Long (auto-generated)
- ticket: @ManyToOne IncidentTicket (not null)
- author: @ManyToOne User (not null)
- content: String (not null, max 1000 chars)
- createdAt: LocalDateTime
- updatedAt: LocalDateTime

Create repositories:
- IncidentTicketRepository: findByReporter(User user, Pageable pageable), findByAssignedTechnician(User user, Pageable pageable), findAll(Pageable pageable)
- TicketCommentRepository: findByTicket(IncidentTicket ticket, Pageable pageable), findByIdAndAuthor(Long id, User author) → Optional

Create DTOs:
- TicketRequest: resourceId (optional), location (required), category (required), description (required), priority, preferredContactDetails
  Note: image files handled separately as MultipartFile[]
- TicketStatusUpdateRequest: status (required), resolutionNotes (optional), rejectionReason (optional)
- AssignTechnicianRequest: technicianId (required Long)
- TicketResponse: all fields, nested ResourceResponse, UserResponseDto for reporter and technician, attachmentUrls as List<String>
- CommentRequest: content (required, not blank)
- CommentResponse: id, content, author (UserResponseDto), createdAt, updatedAt, canEdit (boolean — true if requester is author)
```

---

### 4.2 — Ticket Service and Controller

**AI Prompt 4.2 — Ticket Service, File Upload, Controller**

```
Create TicketService and TicketController:

File Upload Service (FileStorageService):
- Store uploaded files in a local directory: ./uploads/tickets/{ticketId}/
- Method: String storeFile(MultipartFile file, String subDirectory)
  - Validates file type: only image/jpeg, image/png, image/gif allowed
  - Validates file size: max 5MB per file
  - Generates a UUID filename to prevent path traversal
  - Returns the relative path stored
- Method: void deleteFile(String path)
- Configure Spring to serve static files from ./uploads/ at /files/** URL mapping

TicketServiceImpl methods:
- TicketResponse createTicket(TicketRequest request, MultipartFile[] files, Long userId)
  - files array can be null or empty; max 3 files — throw 400 if more than 3
  - Store files and save paths to ticket.attachmentPaths
  - status = OPEN on creation
  - Notify all ADMINs via NotificationService
- Page<TicketResponse> getMyTickets(Long userId, TicketStatus status, int page, int size)
- Page<TicketResponse> getAllTickets(TicketStatus status, int page, int size) — admin/technician
- TicketResponse getTicketById(Long id, Long userId) — reporter, assigned technician, or ADMIN can view
- TicketResponse updateTicketStatus(Long id, TicketStatusUpdateRequest request, Long updaterId)
  - Only ADMIN or assignedTechnician can update status
  - Validate state transitions: OPEN→IN_PROGRESS, IN_PROGRESS→RESOLVED, RESOLVED→CLOSED, any→REJECTED
  - Notify ticket reporter of status change
- TicketResponse assignTechnician(Long ticketId, Long technicianId) — ADMIN only
- CommentResponse addComment(Long ticketId, CommentRequest request, Long userId)
- CommentResponse updateComment(Long ticketId, Long commentId, CommentRequest request, Long userId)
  - throw 403 if user is not the comment author
- void deleteComment(Long ticketId, Long commentId, Long userId)
  - throw 403 if user is not the comment author

TicketController with base path /api/tickets:
- POST /api/tickets — @RequestPart("data") TicketRequest + @RequestPart(value="files", required=false) MultipartFile[] — 201
- GET /api/tickets — USER sees own; ADMIN/TECHNICIAN sees all — supports ?status=&page=&size=
- GET /api/tickets/{id} — 200 or 404 or 403
- PATCH /api/tickets/{id}/status — ADMIN or TECHNICIAN — @RequestBody TicketStatusUpdateRequest — 200
- PUT /api/tickets/{id}/assign — ADMIN only — @RequestBody AssignTechnicianRequest — 200
- POST /api/tickets/{id}/comments — authenticated — 201
- PUT /api/tickets/{id}/comments/{commentId} — comment author only — 200
- DELETE /api/tickets/{id}/comments/{commentId} — comment author only — 204
```

---

### 4.3 — Ticket UI (Member 3 Frontend)

**AI Prompt 4.3 — Ticket Pages**

```
Build React pages for the Incident Ticketing module:

1. TicketFormPage.jsx:
   - Fields: location (text), resource (optional dropdown from /api/resources), category (select), description (textarea), priority (select: LOW/MEDIUM/HIGH/CRITICAL), preferredContactDetails (text)
   - File upload input: accepts image/* only, max 3 files, shows preview thumbnails, shows file size validation error if >5MB
   - Submit as multipart/form-data:
     append "data" as a JSON Blob with content-type application/json
     append each file as "files"
   - On success: redirect to /tickets with success toast

2. TicketListPage.jsx:
   - For USER: shows own tickets
   - For ADMIN/TECHNICIAN: shows all tickets with user name column
   - Status filter tabs: All / Open / In Progress / Resolved / Closed
   - Each row: ticket ID, location, category, priority chip (color-coded), status chip, reporter name, created date
   - Click row → navigate to TicketDetailPage

3. TicketDetailPage.jsx:
   - Shows full ticket info: all fields, status timeline, attached images (clickable to full-size)
   - Status timeline: horizontal or vertical steps showing the workflow OPEN→IN_PROGRESS→RESOLVED→CLOSED with current step highlighted
   - If ADMIN: show "Assign Technician" dropdown (fetch users with role TECHNICIAN) and save button
   - If ADMIN or TECHNICIAN: show "Update Status" section with status dropdown, resolution notes textarea, and save button
   - Comment section at bottom:
     - Lists all comments with author name, timestamp
     - Own comments have Edit and Delete buttons
     - Text area + "Add Comment" button at bottom
     - Edit opens inline text area replacing the comment text

Create ticketApi.js with all required API calls.
For file upload, use axios with FormData — do NOT set Content-Type header manually (let browser set multipart boundary).
```

---

## Phase 5 — Module D: Notifications (Member 4)

### 5.1 — Notification Entity and Service

**AI Prompt 5.1 — Notification Entity and Service**

```
Create a JPA entity Notification in com.smartcampus.entity:

Fields:
- id: Long (auto-generated)
- recipient: @ManyToOne User (not null)
- type: enum NotificationType { BOOKING_APPROVED, BOOKING_REJECTED, BOOKING_CANCELLED, TICKET_STATUS_CHANGED, NEW_COMMENT, TECHNICIAN_ASSIGNED } (not null)
- title: String (not null)
- message: String (not null)
- relatedEntityId: Long (nullable — e.g. booking ID or ticket ID)
- relatedEntityType: String (nullable — "BOOKING" or "TICKET")
- isRead: boolean (default false)
- createdAt: LocalDateTime

Create NotificationRepository extending JpaRepository<Notification, Long>:
- Page<Notification> findByRecipientOrderByCreatedAtDesc(User recipient, Pageable pageable)
- List<Notification> findByRecipientAndIsReadFalse(User recipient)
- Long countByRecipientAndIsReadFalse(User recipient)

Create NotificationService with methods:
- void notifyUser(Long userId, NotificationType type, String title, String message, Long relatedEntityId, String relatedEntityType)
  — Creates and saves a Notification for that user
  — This is called by BookingService and TicketService whenever a relevant event occurs

- void notifyAllAdmins(NotificationType type, String title, String message, Long relatedEntityId, String relatedEntityType)
  — Fetches all users with role ADMIN from UserRepository
  — Calls notifyUser for each

- Page<NotificationResponse> getNotificationsForUser(Long userId, int page, int size)
- Long getUnreadCount(Long userId)
- NotificationResponse markAsRead(Long notificationId, Long userId) — throws 403 if notification belongs to different user
- void markAllAsRead(Long userId)
- void deleteNotification(Long notificationId, Long userId) — throws 403 if not owner

Create NotificationResponse DTO: id, type, title, message, relatedEntityId, relatedEntityType, isRead, createdAt

Create NotificationController at /api/notifications:
- GET /api/notifications — authenticated — ?page=0&size=20 — returns Page<NotificationResponse>
- GET /api/notifications/unread-count — authenticated — returns { "count": 5 }
- PUT /api/notifications/{id}/read — authenticated — 200
- PUT /api/notifications/read-all — authenticated — 204
- DELETE /api/notifications/{id} — authenticated — 204
```

---

### 5.2 — Notification Bell (Member 4 Frontend)

**AI Prompt 5.2 — Notification Bell Component**

```
Build a NotificationBell component and notification panel in React:

1. NotificationBell.jsx:
   - Polls GET /api/notifications/unread-count every 30 seconds
   - Shows a bell icon with a red badge showing the unread count (hide badge if count is 0)
   - On click: toggles a notification dropdown panel

2. NotificationPanel.jsx (dropdown):
   - Fetches GET /api/notifications?page=0&size=10 on open
   - Lists notifications newest first
   - Each item shows: title, message (truncated), time ago (e.g. "2 minutes ago"), unread indicator (blue dot)
   - Clicking a notification:
     a. Calls PUT /api/notifications/{id}/read
     b. Navigates to the related entity:
        - If relatedEntityType === "BOOKING" → /bookings
        - If relatedEntityType === "TICKET" → /tickets/{relatedEntityId}
   - "Mark all as read" button at the top of the panel
   - Shows "No notifications" empty state

3. Place NotificationBell in the Navbar component (top right, near user avatar).

4. Create notificationApi.js with all required API calls.

5. After calling login(), start the polling interval. Clear it on logout.
```

