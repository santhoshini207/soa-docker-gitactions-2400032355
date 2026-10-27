# MuseumMembership

A full-stack membership register for a museum, based on the provided Spring Boot, PostgreSQL, Docker, and React project structure.

## Membership record

Each record contains an automatically generated `id`, `memberName`, `membershipType`, `startDate`, and `annualFee`.

## Run with Docker

From the project root, run:

```powershell
docker compose up --build
```

Open the frontend at [http://localhost:3000](http://localhost:3000). The API is also available at [http://localhost:2025/api/memberships](http://localhost:2025/api/memberships). PostgreSQL data is stored in the `postgres_data` Docker volume.

## Run locally

Start PostgreSQL with a `museum_membership` database and the credentials configured in `backend/src/main/resources/application.properties` (defaults: `postgres` / `docker`). Run the backend with `mvn spring-boot:run` in `backend`, then run `npm install` and `npm run dev` in `frontend`. The Vite development server proxies `/api` to `http://localhost:8081`.

## API

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/memberships` | List memberships |
| `GET` | `/api/memberships/{id}` | Get one membership |
| `POST` | `/api/memberships` | Add a membership |
| `PUT` | `/api/memberships/{id}` | Update a membership |
| `DELETE` | `/api/memberships/{id}` | Remove a membership |
