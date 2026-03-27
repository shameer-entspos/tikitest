# Tiki Web App

Production Next.js application for organization and user workflows (tasks, chats, feeds, safety hub, sign register, asset manager, billing, and related app modules).

## Tech Stack

- Next.js 14 (App Router + legacy `pages/api` routes)
- TypeScript (strict mode)
- Redux Toolkit
- React Query (v3)
- NextAuth credentials-based authentication
- Tailwind CSS + NextUI + MUI

## Project Structure

- `src/app`: App Router layouts, pages, contexts, feature APIs.
- `src/components`: Feature UI modules (`Tasks`, `Chats`, `Safety_Hub_App`, `Asset_Manager_App`, etc.).
- `src/store`: Redux slices and store setup.
- `src/pages/api`: API route handlers (`next-auth`, payments, PDF generation).
- `src/hooks`: Shared hooks (`AxiosAuth`, pagination, refresh token).
- `src/constants`: Cross-cutting route and role constants.
- `tests`: Node test-runner quality checks.

## Architecture Notes

- Route access is enforced in `src/middleware.ts` using shared constants from `src/constants`.
- Role values are centralized in `src/constants/roles.ts`.
- High-complexity task list filtering/sorting is isolated in `src/components/Tasks/tasks-filter.ts`.
- Authentication session/token shaping is implemented in `src/pages/api/auth/[...nextauth].ts`.

## Local Development

```bash
npm install
npm run dev
```

## Quality Commands

```bash
npm run lint
npm run typecheck
npm run test
npm run check
```

## Environment

Set required variables in `.env.local`:

- `NEXT_PUBLIC_API_URL`
- NextAuth environment variables used by your deployment setup (for example `NEXTAUTH_URL`, `NEXTAUTH_SECRET`).

## Current Priority Conventions

- Keep middleware/auth logic typed and centralized.
- Avoid `any` in auth/session and shared state reducers.
- Split large feature screens into focused data/logic/presentation modules.
- Keep docs and quality scripts aligned with actual repository behavior.
# tikitest
# tikitest
