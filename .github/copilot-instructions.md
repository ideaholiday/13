## Quick orientation for AI coding agents

This repository contains a complete travel booking platform: `ih-backend` (Laravel 12, PHP 8.2+), `ih-frontend` (Next.js 15/React), and `sanity/` (CMS). Aim for small, focused changes and prefer editing existing files rather than large rewrites.

### Key locations
- **Backend:** `ih-backend/` — Laravel API with TBO integration. Routes in `routes/api.php` (all under `/api/v1/*`), controllers in `app/Http/Controllers/Api/V1/`, services in `app/Services/`. Uses SQLite (`database/database.sqlite`) in dev.
- **Frontend:** `ih-frontend/` — Next.js app with `src/` structure. API clients in `src/lib/*` (`api.ts`, `flight-api.ts`), types in `src/types/`, Zustand stores in `src/lib/stores/`.
- **CMS:** `sanity/` — Sanity CMS for content management (destinations, packages, deals).
- **Deployment:** `ecosystem.config.js` (PM2), `nginx.conf` (proxy config), `sanity-quickstart.sh` (CMS setup).

### Architecture & data flow
- Frontend → Backend REST API (`/api/v1/*`) → TBO (Travel Boutique Online) external APIs
- Key endpoints: flights (search/book), hotels (search/book), auth, CMS content, payments
- TBO integration: Live flight API, mock hotels (structure ready). Services in `app/Services/TBO/` and `app/Services/TboHotelService.php`
- Environment flags: `USE_MOCK=false`, `USE_TBO_FLIGHT=true`, `USE_TBO_HOTEL=false`

### Developer workflows
- **Backend dev:** `cd ih-backend && composer install && composer run dev` (runs Laravel serve, queue listener, pail, and frontend vite concurrently)
- **Frontend dev:** `cd ih-frontend && npm install && npm run dev`
- **Full stack:** Backend on :8000, frontend on :3000, PM2 production on :3010
- **Sanity CMS:** `./sanity-quickstart.sh` for setup, then `cd sanity && npx sanity dev`
- **Testing:** `php artisan test` (backend), `npm run test` (frontend)

### Project-specific conventions
- **API versioning:** All routes under `v1/*` namespace in `routes/api.php`
- **TBO integration:** Controlled by env flags. Check `TBO_INTEGRATION_GUIDE.md` for credentials and endpoints
- **Type safety:** Frontend uses TypeScript strictly. Update `src/types/` when adding new API contracts
- **State management:** Zustand stores in `src/lib/stores/` (flight, hotel, booking states)
- **Styling:** Tailwind CSS with Radix UI components, consistent with travel UI patterns
- **Error handling:** Backend uses Laravel's exception handling, frontend has error boundaries

### Critical integrations
- **TBO API:** Flight search/booking live, hotel integration ready. Credentials in `.env` (TBO_CLIENT_ID, TBO_USERNAME, etc.)
- **Sanity CMS:** Content management with webhook revalidation. Project ID in `sanity.config.ts`, frontend env vars in `.env.local`
- **Payment:** Razorpay integration structure exists (deferred implementation)
- **Storage:** File uploads to `storage/app/public`, served via nginx at `/storage`

### Common edit patterns
- **New API endpoint:** Add route in `routes/api.php` → create controller method in `app/Http/Controllers/Api/V1/` → add service logic in `app/Services/` → update frontend client in `src/lib/*` → add TypeScript types
- **Frontend feature:** Add component in `src/components/` → update page in `src/app/` → add API calls in `src/lib/*` → manage state in `src/lib/stores/`
- **TBO integration:** Modify service in `app/Services/TBO/` → update controller → test with environment flags

### Examples (concrete)
- **Flight search flow:** `routes/api.php` → `FlightController@search` → `FlightService` → `TBO/FlightSearchService` → `src/lib/flight-api.ts` → flight search components
- **Environment setup:** Copy `.env.example` → set TBO credentials → run `composer run dev` → check `TBO_INTEGRATION_GUIDE.md` for API status
- **Content management:** Run `./sanity-quickstart.sh` → add content in Studio → frontend fetches via `src/lib/sanity-api.ts`

### When debugging
- Backend logs: `php artisan pail` or check `storage/logs/`
- Frontend: Browser dev tools, Next.js error overlay
- TBO API: Test scripts in `ih-backend/` (`test_live_api.php`, `test_tbo_no_proxy.php`)
- Check environment flags: `USE_MOCK`, `USE_TBO_FLIGHT`, `USE_TBO_HOTEL` in `.env`

### Deployment & Production
- **Production server:** Droplet IP `157.245.100.148` (whitelisted with TBO)
- **Direct API access:** No proxy needed on production droplet
- **Environment files:** `.env.local` overrides `.env` - ensure both are consistent
- **Config caching:** Always run `php artisan config:clear` before `php artisan config:cache`
- **Health checks:** `/api/v1/health` endpoint for service monitoring
- **Live API testing:** Use `test_tbo_no_proxy.php` for direct TBO authentication tests

### Production deployment workflow
1. Deploy code → `composer install` → set environment variables
2. Clear cache: `php artisan config:clear`  
3. Test TBO auth: `php test_tbo_no_proxy.php`
4. Start services: Laravel server (:8000), Next.js (:3000), queue worker
5. Verify APIs: Test `/api/v1/health` and flight search endpoints

-- End of instructions
