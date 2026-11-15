# StudyFlow — Student Task Management System

A modern, full-stack student workspace for classes, deadlines and study goals. The dashboard is built with React + TypeScript, and the API foundation is Spring Boot + MySQL.

> **Live API integration complete:** the React workspace now reads and writes through the Spring Boot REST API with TanStack Query, including loading skeletons, error/retry states and optimistic task updates. A `dev` profile runs the API on in-memory H2 when MySQL/Docker is unavailable.

---

## Project structure

```
StudentTaskManager/
├── frontend/                     # React 19 + TypeScript + Vite
│   ├── public/favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/        # Stats, today's focus, activity chart, deadlines, course progress
│   │   │   ├── layout/           # App shell, sidebar, topbar
│   │   │   ├── tasks/            # Task modal, checkbox, priority + course chips
│   │   │   └── ui/               # Button, modal, progress bar, sparkline
│   │   ├── context/              # Theme, task and course providers (TanStack Query)
│   │   ├── lib/                  # API client, query setup, date + insight helpers, utils
│   │   ├── pages/                # Dashboard, Tasks, Calendar, Courses
│   │   ├── types/
│   │   ├── App.tsx
│   │   ├── index.css             # Tailwind 4 theme + design tokens
│   │   └── main.tsx
│   ├── .env.example
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                      # Spring Boot 4 · Java 21 · Maven wrapper
│   ├── src/main/java/com/studyflow/
│   │   ├── config/               # CORS, first-run data seeder
│   │   ├── domain/               # Course, Task, ScheduleEvent, enums
│   │   ├── dto/                  # Request/response records
│   │   ├── exception/
│   │   ├── repository/           # Spring Data JPA repositories
│   │   ├── service/              # Task, course, schedule, dashboard logic
│   │   └── web/                  # REST controllers + error handling
│   ├── src/main/resources/application.yml
│   ├── src/main/resources/application-dev.yml
│   ├── pom.xml
│   └── mvnw / mvnw.cmd
│
├── docker-compose.yml            # MySQL 8.4 for local development
└── README.md
```

## Tech stack

| Layer     | Technology                                                                 |
| --------- | -------------------------------------------------------------------------- |
| Frontend  | React 19, TypeScript, Vite 7, Tailwind CSS 4, React Router 7, TanStack Query, Recharts |
| Backend   | Java 21, Spring Boot 4.1, Spring Web MVC, Spring Data JPA, Bean Validation  |
| Database  | MySQL 8.4 (H2 for tests and the `dev` profile)                               |
| Tooling   | Maven wrapper, npm, Docker Compose                                          |

---

## What's implemented

### Frontend

- **Dashboard** — greeting header, four animated stat cards with live sparklines, today's focus list with completion toggle and progress ring, study-activity area chart computed from real completions, upcoming deadlines, and per-course progress.
- **Tasks** — search, status tabs, priority/course filters, create-task modal, complete/uncomplete, delete, due-date and overdue states, loading skeletons, empty and error states.
- **Calendar** — navigable week timetable with colour-coded lectures, labs and study blocks, plus assignments due in the selected week.
- **Courses** — progress cards per course, credits, instructors, next class, course-filtered task links, and a semester-pulse summary.
- **Polish** — dark/light theme with persistence, responsive sidebar and mobile drawer, ⌘K search focus, notifications panel, keyboard-accessible controls, reduced-motion support.
- **State** — TanStack Query owns server state; toggles and deletes are optimistic, derived dashboard/course data is invalidated on mutation, and an API-disconnect banner offers retry. Weekly sparks and the activity chart are reconstructed from task `completedAt` history.

### Backend

- REST API for tasks (list/filter, create, update, toggle, delete), courses, schedule and dashboard summary.
- JPA entities validated with Bean Validation, structured JSON error responses and CORS for the Vite dev server.
- MySQL schema auto-created (`ddl-auto: update`) and seeded on first boot with five courses, 23 tasks and a weekly timetable.
- `dev` profile swaps MySQL for in-memory H2 so the API can run without Docker; tests use the same H2 setup.
- Dashboard summary computes completed-this-week, active, overdue, due-today and study streak counts.

---

## Local development

### Quick start (no MySQL required)

The `dev` profile runs the API against in-memory H2, seeded with the same demo workspace.

```bash
cd backend
.\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev   # Windows
# ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev      # macOS / Linux
```

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**. The Vite dev server proxies `/api` to `http://localhost:8080`.

### MySQL-backed run

Start MySQL (Docker required):

```bash
docker compose up -d
```

Then run the API with the default profile:

```bash
cd backend
.\mvnw.cmd spring-boot:run        # Windows
# ./mvnw spring-boot:run          # macOS / Linux
```

> No Docker? Point `DB_URL`, `DB_USERNAME` and `DB_PASSWORD` at a local MySQL 8 instance instead (the database is created automatically).

API runs at **http://localhost:8080**. Verify with:

```bash
curl http://localhost:8080/api/health
curl http://localhost:8080/api/dashboard/summary
```

### Configuration

Backend values can be overridden with environment variables:

| Variable               | Default                                                                                    |
| ---------------------- | ------------------------------------------------------------------------------------------ |
| `DB_URL`               | `jdbc:mysql://localhost:3306/studyflow?createDatabaseIfNotExist=true&useSSL=false&...`       |
| `DB_USERNAME`          | `studyflow`                                                                                |
| `DB_PASSWORD`          | `studyflow`                                                                                |
| `SERVER_PORT`          | `8080`                                                                                     |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173,http://localhost:4173`                                              |

The frontend API base URL defaults to the dev proxy. To point elsewhere, copy `frontend/.env.example` to `frontend/.env` and set `VITE_API_URL`.

---

## API reference

| Method   | Endpoint                    | Description                                          |
| -------- | --------------------------- | ---------------------------------------------------- |
| `GET`    | `/api/health`               | Service health check                                 |
| `GET`    | `/api/tasks`                | List tasks (`status`, `courseId`, `priority`, `q`)   |
| `GET`    | `/api/tasks/{id}`           | Get a task                                           |
| `POST`   | `/api/tasks`                | Create a task                                        |
| `PATCH`  | `/api/tasks/{id}`           | Update task fields                                   |
| `PATCH`  | `/api/tasks/{id}/toggle`    | Toggle completion                                    |
| `DELETE` | `/api/tasks/{id}`           | Delete a task                                        |
| `GET`    | `/api/courses`              | List courses with task counts                        |
| `GET`    | `/api/courses/{id}`         | Get a course                                         |
| `GET`    | `/api/schedule`             | Weekly timetable                                     |
| `GET`    | `/api/dashboard/summary`    | Aggregated dashboard metrics                         |

Example task creation:

```bash
curl -X POST http://localhost:8080/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Review graph traversal notes",
    "courseId": "cs301",
    "priority": "high",
    "dueDate": "2026-11-10T23:59:00Z",
    "estimateMinutes": 60,
    "notes": "Focus on BFS/DFS complexity."
  }'
```

Priority values: `low | medium | high`. Status values: `todo | in-progress | done`.

---

## Useful commands

| Command                          | Location   | Purpose                                |
| -------------------------------- | ---------- | -------------------------------------- |
| `npm run build`                  | `frontend` | Type-check and production build        |
| `npm run preview`                | `frontend` | Preview the production build           |
| `.\mvnw.cmd test`                | `backend`  | Run tests against in-memory H2         |
| `.\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev` | `backend` | Run the API on H2 without MySQL |
| `.\mvnw.cmd -DskipTests package` | `backend`  | Build the executable jar               |
| `docker compose down`            | root       | Stop MySQL (add `-v` to wipe data)     |

The `dev` profile uses an in-memory database, so its data resets whenever the API restarts. Use the MySQL profile for persistent data.

---

## Next phase

1. Add authentication (Spring Security + JWT) and per-student ownership of tasks/courses.
2. Persist activity analytics and streak history server-side for richer trends.
3. Add course/schedule management screens and automated frontend tests.
4. Add task editing from the task list and drag-and-drop schedule blocks.
