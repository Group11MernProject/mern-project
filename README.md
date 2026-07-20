# PlatePilot

**Plan less. Savor more.** PlatePilot is a polished MERN meal planner that lets people authenticate, discover live recipes through TheMealDB, inspect ingredients and directions, and assign a recipe to each day of the week.

# Website URL
https://lampnicolasgomez.com/

## Course requirement coverage

| Requirement | PlatePilot implementation |
|---|---|
| MongoDB, Express, React, Node | Mongoose models, Express 5 JSON API, React/Vite client, Node 22 server |
| AJAX + JSON | React uses asynchronous `fetch`; every `/api` application route returns JSON |
| OAuth | Google Identity Services credential flow, verified on the server |
| Email verification | Cryptographically random, hashed, expiring token delivered through SMTP |
| Third-party API | Express integrates with TheMealDB and normalizes its recipe data |
| CI/CD | GitHub Actions tests/builds PRs and deploys `main` over SSH |
| Unit/API testing | Jest and Supertest cover health, validation, auth protection, recipes, and OpenAPI |
| Lighthouse >95 target | Lightweight Vite build, semantic HTML, responsive layout, lazy recipe images, reduced-motion support |
| Remote HTTPS + domain | Docker Compose production stack with Caddy automatic TLS and MongoDB |
| API presentation | Import `docs/PlatePilot.postman_collection.json`; OpenAPI is also exposed at `/api/docs` |

## Local setup

Prerequisites: Node.js 20+ and MongoDB running locally.

1. Copy `.env.example` to `.env` and set `JWT_SECRET`.
2. For Google sign-in, copy `client/.env.example` to `client/.env.local`, add the same public client ID to both environment files, and authorize `http://localhost:5173` in Google Cloud.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open `http://localhost:5173`. The API is at `http://localhost:5000/api`.

Without SMTP settings, development verification links are printed by the API. Without internet access, the recipe endpoint returns a curated fallback set so the demonstration remains usable.

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Run React and Express together |
| `npm test` | Run Jest/Supertest API tests |
| `npm run test:coverage` | Run tests with a coverage report |
| `npm run build` | Create the optimized React production bundle |
| `npm start` | Start the production Express server |

## Project structure

```text
client/                 React application and responsive design
server/src/models/      MongoDB/Mongoose data models
server/src/routes/      Authentication, recipes, and meal-plan JSON routes
server/src/services/    TheMealDB and email integrations
server/src/__tests__/   Jest and Supertest suite
docs/                   Deployment, presentation, and Postman materials
.github/workflows/      CI/CD pipeline
```

## Production and presentation

- Follow [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for DigitalOcean, domain, TLS, OAuth, and CI/CD setup.
- Use [`docs/PRESENTATION.md`](docs/PRESENTATION.md) to rehearse the 10-minute team presentation.
- Replace all placeholder team names, domain, and GitHub URLs before submitting slides.

