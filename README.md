# LinkUP

LinkUP is a student-led civic-tech public-information navigation site for migrant residents and foreign workers in South Korea. It organizes official information by situation and avoids giving legal, medical, labor, or immigration advice.

## What is built

- A React/Vite landing page based on the selected clean editorial interface.
- Situation buttons for common problems.
- A right-side guide panel with immediate actions, official contacts, and an interactive document checklist.
- Convex schema, query functions, and seed data for editable guide content.
- Local demo data fallback so the interface can render before a Convex URL is configured.

## Run locally

Install dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

## Connect Convex

Start Convex and follow the login/project prompts:

```bash
npm run convex:dev
```

Copy the generated deployment URL into `.env.local`:

```bash
VITE_CONVEX_URL=https://your-deployment.convex.cloud
VITE_CONVEX_SITE_URL=https://your-deployment.convex.site
```

The PDF translation endpoint uses the free MyMemory translation API by default, so no OpenAI key is required. For better free-tier attribution, you can optionally set a contact email in Convex:

```bash
npx convex env set MYMEMORY_CONTACT_EMAIL you@example.com
```

Import the starter guide data:

```bash
npm run convex:import
```

After import, editing records in the Convex dashboard will update the site through the `guides` query.

## Main files

- `src/App.tsx` - LinkUP interface and interactions.
- `src/styles.css` - visual system and responsive layout.
- `convex/schema.ts` - editable guide data model.
- `convex/guides.ts` - public Convex queries.
- `convex/seed/guides.jsonl` - starter content for the six situations.
