# SkillSync AI

This folder contains the SkillSync AI project (frontend + backend).

## Local Setup

1. Backend

```bash
cd SkillSyncAI/backend
cp .env.example .env
# Edit .env to set MONGODB_URI, JWT_SECRET, etc.
npm install
npm start
```

2. Frontend

```bash
cd SkillSyncAI/frontend
cp .env.example .env
# Edit .env to set VITE_API_URL (e.g. http://localhost:5000)
npm install
npm run dev
```

## Deployment

- Frontend: Vercel recommended. Add `VITE_API_URL` as an environment variable in Vercel.
- Backend: Render recommended. Use `render.yaml` manifest or configure a new service pointing to `SkillSyncAI/backend`.
- Database: MongoDB Atlas. Set `MONGODB_URI` in backend environment variables.

## CI/CD

A GitHub Actions workflow exists at `.github/workflows/ci-cd.yml` that builds the frontend and triggers deployments to Vercel and Render when `VERCEL_TOKEN`/`RENDER_API_KEY` secrets are configured.

## Troubleshooting

- If uploads fail, ensure the `uploads` directory is writable by the service and not committed to Git.
- Ensure secrets are set in the deployment provider and never committed to repository.

*** End ***
