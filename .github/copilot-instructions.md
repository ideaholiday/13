## Quick orientation for AI coding agents

This repository contains two main services: `ih-backend` (Laravel, PHP 8.2+) and `ih-frontend` (Next.js / React, Next 15). Aim for small, focused changes and prefer editing existing files rather than large rewrites.

Key locations
- Backend: `ih-backend/` — Laravel app (routes in `ih-backend/routes/*.php`, controllers under `ih-backend/app/Http/Controllers`). Composer config: `ih-backend/composer.json`.
- Frontend: `ih-frontend/` — Next.js app (app directory under `ih-frontend/ih-frontend/` or `ih-frontend/src/` depending on component). Frontend API callers live in `ih-frontend/src/lib/*` (`flightApi.ts`, `api.ts`).
- Deployment helpers: `ecosystem.config.js` files in both root and service folders (used with PM2), `nginx.conf` in repo root.
- Scripts: `do_all.sh`, `ih_mvp_frontend_quickstart.sh` contain environment and external integration defaults (TBO credentials, proxy). Use them as canonical env var names.

Architecture & dataflow (short)
- Frontend talks to Backend over REST under `/api/v1/*` (see `ih-backend/routes/api.php`). Typical endpoints: flights (search, book), hotels (search, rooms, pricing, book), cms, blog, payment webhooks.
- Backend delegates to provider services under `app/Services` and `src/lib/` for external APIs (TBO and similar). Check `do_all.sh` for TBO defaults and proxy hints.

Developer workflows (explicit commands)
- Backend dev: from `ih-backend/` use `composer install` then `npm run dev` (see `composer.json` scripts: `composer run dev` runs `php artisan serve`, queue listener, pail and frontend vite concurrently). Common artisan commands: `php artisan migrate`, `php artisan test`.
- Frontend dev: from `ih-frontend/` run `npm run dev` (Next.js dev server). Build with `npm run build` and start with `npm run start` per `package.json`.
- PM2 locally: `ecosystem.config.js` files show how PM2 is used to run both services; the backend serves on 127.0.0.1:5000 and frontend uses PORT 3010.

Project-specific conventions and gotchas
- API versioning: routes are namespaced under `v1` — prefer adding new endpoints under `v1/*` unless intentionally bumping the API.
- Storage: nginx expects backend storage at `/var/www/iholiday/backend/storage/app/public`. Local development uses `storage/` within the repo and a sqlite `database/database.sqlite` created by composer post-create-project script.
- CORS & headers: `nginx.conf` shows the expected CORS headers and allowed request headers (including `X-API-Key`). Requests may rely on `X-API-Key` middleware (`App\Http\Middleware\ApiKeyMiddleware`).
- Secrets: `do_all.sh` documents default credentials (TBO_*). Treat them as placeholders; real secrets live in environment variables or `.env` files and are not in the repo.

How to make changes (best practices for AI edits)
- Keep PRs small and focused: change one endpoint, one component, or one service at a time.
- When editing API behavior, update `ih-backend/routes/api.php` and the matching controller in `app/Http/Controllers/Api` and update any related `src/lib/*` client files in the frontend.
- When adding env variables, add defaults to `do_all.sh` if they represent sane local dev defaults and document them in this file.
- For frontend changes that touch API contracts, update TypeScript types under `ih-frontend/src/types` and adjust `ih-frontend/src/lib/*` API wrappers.

Examples (concrete pointers)
- To add a new hotels endpoint: modify `ih-backend/routes/api.php` (under `v1/hotels`) -> create `app/Http/Controllers/Api/V1/HotelsController.php` method -> update `ih-frontend/src/lib/hotelApi.ts` to add client call and `ih-frontend/src/types/*` for types.
- To run the full dev environment locally: set env vars (see `do_all.sh`), run `composer install` in backend, `npm install` in frontend, then `cd ih-backend && php artisan serve --host=127.0.0.1 --port=8000` and `cd ih-frontend && npm run dev`.

When you are unsure
- Look for similar implementations in `app/Http/Controllers/Api/V1` or `ih-frontend/src/lib/*` and mirror style and error handling.
- Use `do_all.sh` and `ecosystem.config.js` to infer ports, env var names, and runtimes.

If you update this file: preserve the short examples and the explicit commands. Ask maintainers for missing runtime secrets or CI details.

-- End of instructions
