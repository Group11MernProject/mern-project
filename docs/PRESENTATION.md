# PlatePilot presentation runbook (10 minutes)

Practice this flow with a timer. The target speaking time is **8:45–9:00**, leaving about one minute for questions and transition time.

| Time | Slide / action | Speaker focus |
|---|---|---|
| 0:00–0:25 | Title | PlatePilot: “Plan less. Savor more.” Introduce the team and one-sentence value proposition. |
| 0:25–0:50 | Members | Each member says their name and primary contribution. |
| 0:50–1:35 | Problem + solution | Busy people lose time deciding what to cook. PlatePilot turns recipe discovery into a usable weekly plan. |
| 1:35–2:20 | Architecture | React client → Express/Node JSON API → MongoDB; TheMealDB provides recipe data. Mention HTTPS and the production domain. |
| 2:20–2:55 | Trust + delivery | Google OAuth, verified email, protected JWT routes, Jest/Supertest, and GitHub Actions deployment. |
| 2:55–6:35 | Live demo | Use “Explore the presentation demo.” Search “chicken,” filter recipes, open details, assign a meal, replace another night, remove a meal, show responsive mobile layout. |
| 6:35–7:15 | Postman demo | Run the numbered collection: health, recipe search, demo login, then protected meal plan. Point out JSON and the third-party source. |
| 7:15–7:55 | What went well | Cohesive component system, server-side recipe normalization, graceful API fallback, fast responsive UI. |
| 7:55–8:35 | Challenges + learning | OAuth environment setup, resilient external API handling, and synchronizing plan state with MongoDB. Explain the solutions, not just the problems. |
| 8:35–9:00 | Future + close | Grocery list generation, nutrition goals, shared household plans. End on the value proposition. |
| 9:00–10:00 | Questions slide | Invite questions. Keep the live app open in another tab. |

## Required slide order

1. Title — PlatePilot, team name, class, date, production domain, GitHub link
2. Meet the team — names, headshots (optional), roles
3. The dinner dilemma — user problem and audience
4. Meet PlatePilot — value proposition and three benefits
5. How it works — discover → choose → plan
6. MERN architecture — MongoDB, Express, React, Node, JSON data flow, TheMealDB
7. Secure by design — Google OAuth, email verification, JWT, HTTPS
8. Quality and delivery — Jest/Supertest, Lighthouse results, GitHub Actions, DigitalOcean
9. Live product demo — short checklist only
10. What went well / what challenged us
11. Roadmap
12. Questions — repeat domain and GitHub URL

## Before entering the classroom

- Submit the `.pptx` from **every team member’s account before presenting**.
- Put the PowerPoint, a PDF backup, and this runbook on a USB drive.
- Confirm the production domain opens over HTTPS on both laptop and phone.
- Confirm Google sign-in and the presentation demo both work.
- Import the Postman collection and set `baseUrl` to the real production API.
- Run Lighthouse on desktop and mobile; capture screenshots of scores above 95.
- Close personal tabs and notifications. Keep the app and Postman already open.
- Practice handoffs, demo clicks, and recovery if the external recipe API is slow.

