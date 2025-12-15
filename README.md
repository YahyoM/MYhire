# MyHire Job Portal

MyHire is a full-stack job marketplace built with the Next.js pages router. Job seekers can publish rich profiles, upload resumes, and apply to curated openings, while employers manage postings and review incoming applications in one place.

## Tech Stack
- Next.js 16 (pages router with getServerSideProps) on React 18 and TypeScript 5
- Tailwind CSS 4 for styling and Framer Motion for subtle animations (mocked in tests)
- Zustand store for lightweight global state
- Next.js API routes persisting to src/data/db.json plus local resume uploads under public/uploads
- Jest + React Testing Library with jsdom environment
- Node.js >= 18.17.0 is required to run the project

## Getting Started
```bash
npm install
npm run dev
```

Open http://localhost:3000 to explore the MyHire experience. Development logging is enabled for debugging, including API fetch errors shown in the console.

## Available Scripts
- npm run dev – start the Next.js dev server
- npm run build – create an optimized production build
- npm start – serve the production build locally
- npm run lint – run ESLint in quiet mode (errors-only)
- npm test – execute Jest with coverage reporting

## Core Features
- Guided job search with keyword, mode, experience, type, and skill-tag filters
- Employer dashboard that surfaces postings, inbound applications, and live updates
- Candidate profile builder with resume upload, skills, bio, and contact links
- Application flow storing submissions to src/data/db.json and writing resumes to public/uploads
- Real-time style messaging/video-call UI backed by mock API routes
- Dashboards and landing page data hydrated on the server for fast first paint

## API Routes
- GET | POST /api/profile – read or update the active profile (accepts base64 resume payloads)
- GET | POST /api/jobs – list openings or create new postings
- GET | POST | PATCH /api/applications – browse submissions, create new ones, or change status
- GET /api/market-insights – fetches market analytics with resilient fallbacks
- GET /api/chat and /api/videocall – demo endpoints used by the Chat modal

All JSON payloads are stored in src/data/db.json. Uploaded resumes are written to public/uploads; replace this with persistent storage before deploying to a stateless platform.

## Testing & Quality
- npm test runs the full suite; the current project state reaches 100% statements, branches, functions, and lines on covered modules.
- npm run lint enforces the flat ESLint config (React rules, TypeScript analysis, accessibility checks). Warnings are suppressed in CI via --quiet.
- npx tsc --noEmit ensures the TypeScript types remain sound across pages, components, hooks, and API routes.

## Deployment Tips
1. Run npm run lint, npx tsc --noEmit, and npm run build locally to confirm the bundle is production-ready.
2. Deploy to Vercel (recommended) or another Node-capable host. Remember that file writes (uploads, JSON persistence) are ephemeral on serverless platforms—use an external database and object storage in production environments.
3. After deployment, set environment-specific configuration such as asset domains or API credentials if you integrate external services.

## Project Structure
- src/components – UI building blocks (modals, forms, lists, layout)
- src/hooks – custom hooks for filtering, skills input, and resume upload state
- src/lib – helpers for data fetching and demo storage
- src/pages – Next.js pages and API routes
- src/store – Zustand global store definition
- src/types – shared TypeScript models
- src/tests – RTL/Jest coverage for key components and hooks

## Maintenance Notes
- Keep coverage/ out of commit history; it is a generated artifact from npm test.
- next-env.d.ts must remain checked in so TypeScript picks up Next.js ambient types.
- If you add new API routes, update src/data/db.json schema and extend tests accordingly.

Happy shipping!
