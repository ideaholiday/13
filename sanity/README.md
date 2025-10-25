# Idea Holiday Sanity Studio

## Usage

- Run Studio: `cd sanity && npx sanity dev`
- Add content in Studio at `/studio` (embedded or standalone)
- Set Sanity webhook (POST) to `/api/revalidate` for live updates
- Blog and CMS pages are statically generated and revalidated every 60s
- Use preview mode via `/api/preview?secret=...`
- All content types: post, page, destination, deal, faq, shared SEO
- Edit schema in `/sanity/schemas/`
- Uses TypeScript, Tailwind, accessible, clean code
