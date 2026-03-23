# SDC Service Desk Project Summary (Beginner Guide)

## 1. What this project is
This project is a Service Desk system used to submit, review, process, and track support tickets across multiple teams and roles.

It has two main applications:
- Frontend: Angular web app used by end users and admins.
- Backend: Django REST API that handles authentication, business logic, permissions, and data storage.

Main user roles in this system:
- DEPARTMENT: Creates tickets and tracks their progress.
- DIT: Reviews and approves/rejects tickets.
- SDC: Executes approved work and updates progress.
- OFFICER: Audits/searches tickets and views reporting-oriented data.
- ADMIN: Manages users, approvals, departments, and ticket configuration.

---

## 2. Absolute beginner quick start
If you are brand new, follow this order exactly.

### Step A: Understand the architecture first
1. Open flow.drawio and inspect both pages:
   - Frontend Flow - Presentation
   - Backend Flow - Presentation
2. Read this summary from top to bottom once.

### Step B: Run backend
Option 1 (VS Code task):
- Run task: Run Backend (Django)

Option 2 (terminal):
1. Activate virtual environment
2. Start Django server with manage.py runserver

Expected default URL:
- http://127.0.0.1:8000/

### Step C: Run frontend
Option 1 (VS Code task):
- Run task: Run Frontend (Angular)

Option 2 (terminal):
- In frontend/frontend, run npm run start

Expected default URL:
- http://localhost:4200/

### Step D: Login and verify role flows
1. Open /login
2. Authenticate with a user account
3. Confirm you are redirected to your role area

---

## 3. Where to start reading code (best order)
Use this order when learning the project:

1. Frontend routes
- frontend/frontend/src/app/app.routes.ts
Reason: shows all role sections and navigation paths.

2. Backend root routing
- backend/backend/backend/backend/urls.py
Reason: shows API module split and docs endpoints.

3. Auth API routes
- backend/backend/backend/login/urls.py
Reason: explains login/register/user and admin management endpoints.

4. Ticket API routes
- backend/backend/backend/tickets/urls.py
Reason: contains ticket lifecycle operations and most business actions.

5. Then inspect views, serializers, and models in each app.

---

## 4. High-level architecture
This is a classic frontend-backend architecture.

- Angular frontend handles pages, route guards, and API calls.
- Django backend handles authentication, authorization, business workflows, and persistence.
- Data is stored in backend database models.

Relationship summary:
1. User interacts with Angular pages.
2. Angular sends HTTP requests to Django API.
3. Django checks permissions and validates data.
4. Django reads/writes database.
5. Django returns JSON response.
6. Angular updates UI.

---

## 5. File structure explained
Important project locations:

- backend/
  - backend/
    - backend/
      - backend/
        - settings.py
        - urls.py
      - login/
        - urls.py
        - views.py
        - models.py
        - serializers.py
      - tickets/
        - urls.py
        - views.py
        - models.py
        - serializers.py

- frontend/
  - frontend/
    - src/
      - app/
        - app.routes.ts
        - auth/
        - core/
        - features/
        - shared/

- flow.drawio
  - Presentation diagrams for frontend and backend flow.

- docker-compose.yml and docker-compose.prod.yml
  - Containerized local/prod orchestration.

---

## 6. Frontend module-by-module

### 6.1 app.routes.ts (navigation map)
This file maps URL paths to components and enforces role access using guard metadata.

Key behavior:
- Default route redirects to /login.
- Protected role sections:
  - /department
  - /dit
  - /sdc
  - /officer
  - /admin
- Wildcard fallback redirects to login.

### 6.2 auth module
Contains login and register views.

Purpose:
- Collect credentials
- Call backend auth API
- Store auth state/token

### 6.3 core module
Typically includes:
- guards: route protection logic
- interceptors: auto-attach auth headers to outgoing API requests
- services: cross-cutting utilities

Purpose:
- Central security and request behavior.

### 6.4 features module
Role-based screens and workflows live here.

Department feature:
- Create ticket
- View own tickets
- View ticket details

DIT feature:
- Pending queue
- Approve/reject actions
- History and closure workspace

SDC feature:
- Pending/active queue
- Work page
- History

Officer feature:
- Dashboard and search-centric audit view

Admin feature:
- Pending approvals
- User and ticket administration
- Department/category setup

### 6.5 shared module
Reusable UI and logic used by multiple roles.

Example:
- Shared Ticket Details component used in multiple role areas.

---

## 7. Backend module-by-module

### 7.1 backend urls.py (root API entry)
Main route split:
- admin/
- api/auth/
- api/tickets/
- api/schema/, api/docs/, api/redoc/

Purpose:
- Global routing and API documentation entry points.

### 7.2 login app (authentication and user management)
Important endpoint categories:
- Authentication:
  - login/
  - register/
- User management:
  - users/
  - users/<id>/
- Approval workflow:
  - pending-users/
  - users/<user_id>/approve/
  - users/<user_id>/reject/
- Department management:
  - departments/manage/
  - departments/manage/<id>/
- Secondary admin management:
  - admins/
  - admins/create/
  - admins/<id>/reset-password/
  - admins/<id>/delete/

Purpose:
- Identity lifecycle and account governance.

### 7.3 tickets app (core business workflow)
Important endpoint categories:
- Ticket creation and requester views:
  - create/
  - my-tickets/
- DIT review actions:
  - pending/
  - <ticket_id>/approve/
  - <ticket_id>/reject/
  - <ticket_id>/close/
  - <ticket_id>/reopen/
- SDC execution actions:
  - approved/
  - in-progress/
  - <ticket_id>/start/
  - <ticket_id>/complete/
  - <ticket_id>/revert/
  - <ticket_id>/log-progress/
- Shared details/comments/audit:
  - <ticket_id>/
  - <ticket_id>/comments/add/
  - <ticket_id>/comments/
  - <ticket_id>/audit-log/
- Dashboard/reporting:
  - dashboard/department/
  - dashboard/dit/
  - dashboard/sdc/
  - reports/system/
- Configuration master data:
  - ticket-types/
  - request-types/
  - ticket-priorities/
  - admin ticket/request type CRUD

Purpose:
- Complete ticket lifecycle management.

---

## 8. Relationship between frontend and backend

Frontend to backend mapping idea:
- Frontend page action -> API endpoint -> backend view -> serializer/model -> database.

Examples:
1. Department creates ticket
- Frontend: Department Create Ticket page
- API: POST api/tickets/create/
- Backend: CreateTicketAPIView validates and saves
- Result: ticket record created

2. DIT approves ticket
- Frontend: DIT Pending page action
- API: POST api/tickets/<id>/approve/
- Backend: ApproveTicketAPIView updates status and logs activity
- Result: ticket becomes approved for next stage

3. SDC starts work
- Frontend: SDC work queue action
- API: POST api/tickets/<id>/start/
- Backend: StartWorkAPIView updates in-progress state
- Result: ticket moves into execution stage

---

## 9. Flow diagrams in text form

### 9.1 Frontend flow
App Opens
-> Login/Register
-> Auth Layer (service + interceptor + guard)
-> Role Routing
-> Feature Areas
-> Backend API (/api/auth/* and /api/tickets/*)

### 9.2 Backend flow
Frontend Request
-> Root URL Router
-> API Modules (Auth + Tickets)
-> Role/Permission Check
-> Views + Serializers + Business Rules
-> Database Models
-> Lifecycle transitions
-> JSON Response

---

## 10. Ticket lifecycle explained simply
Primary path:
- Created
- Pending (review)
- Approved
- In Progress
- Completed

Alternative/exception path examples:
- Rejected
- Reverted
- Closed
- Reopened

Why this matters:
- Every role owns a stage.
- Clear ownership improves accountability and tracking.

---

## 11. Tech stack and why each is used

### Angular
What it does:
- Builds the user interface, routing, forms, and role screens.

Why used:
- Strong structure for large role-based frontend apps.
- Good component architecture and ecosystem.

### TypeScript
What it does:
- Adds static typing and safer code for frontend.

Why used:
- Reduces runtime mistakes and improves maintainability.

### Django
What it does:
- Provides backend framework, app modularity, auth integrations, ORM.

Why used:
- Fast development with strong conventions and security features.

### Django REST Framework
What it does:
- Builds API endpoints, serializers, permissions, request/response handling.

Why used:
- Standard way to implement robust REST APIs in Django.

### Python
What it does:
- Backend language for business logic and API processing.

Why used:
- Readable, productive, large ecosystem.

### Database (via Django models)
What it does:
- Stores users, tickets, comments, logs, and configuration records.

Why used:
- Persistent state and query capability for workflows and reporting.

### OpenAPI/Swagger (drf-spectacular)
What it does:
- Auto-generates API schema and interactive docs.

Why used:
- Makes API discovery and testing easier for developers and reviewers.

### Docker and Docker Compose
What it does:
- Containerized environment and service orchestration.

Why used:
- Consistent setup across machines and easier deployment.

### Nginx (deploy folder)
What it does:
- Reverse proxy and static/media serving in deployment setups.

Why used:
- Production-grade web serving and routing.

---

## 12. How to contribute safely (for beginners)
1. Start from one module only (for example, Department tickets).
2. Trace one use case end-to-end:
   - route -> component -> service call -> API endpoint -> backend view -> model change.
3. Make small commits with focused changes.
4. Test with at least one role account before and after your change.

---

## 13. Beginner troubleshooting checklist

If frontend does not load:
- Confirm npm install completed in frontend/frontend
- Confirm npm run start is running
- Check port conflicts on 4200

If backend does not load:
- Confirm virtual environment is activated
- Confirm dependencies are installed
- Confirm manage.py runserver is running

If login fails:
- Verify backend api/auth/login endpoint is reachable
- Check user approval status
- Check auth token handling in frontend interceptor

If role redirects are wrong:
- Inspect role data in frontend route guards
- Verify backend sends expected role data/token claims

---

## 14. Suggested presentation script (short)
1. Problem and goal:
   - Multi-role service desk workflow with visibility and control.
2. Architecture:
   - Angular frontend + Django REST backend.
3. Role model:
   - Department, DIT, SDC, Officer, Admin.
4. Lifecycle:
   - Ticket moves across role-owned stages.
5. Control and governance:
   - Auth, permissions, audit logs, admin management.
6. Deliverables:
   - Working role-based UI, modular API, documented flows.

---

## 15. Final takeaway
This project is a role-driven workflow platform.

The frontend focuses on user experience and role-specific screens.
The backend enforces business rules, permissions, and state transitions.
Together they provide a complete ticket management lifecycle from request creation to completion with traceability and governance.
