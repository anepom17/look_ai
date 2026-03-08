This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deployment (clone from GitHub)

1. **Clone and install**
   ```bash
   git clone <your-repo-url> look_ai && cd look_ai
   npm install
   ```

2. **Environment**
   - Copy `.env.local.example` to `.env.local`
   - Set `GOOGLE_GENERATIVE_AI_API_KEY` (Gemini) and `FLUX_API_KEY` (Black Forest Labs) for full functionality

3. **Run**
   - Development: `npm run dev`
   - Production build: `npm run build` then `npm start`

Prompts are in the `prompts/` folder in the repo; the app loads them from `process.cwd()/prompts`, so running from the repo root works after clone.

## Deploy on Coolify (Docker)

1. In Coolify: **New Resource** → **Application** → connect your GitHub repo (this app root = repo root with `Dockerfile`).
2. Build: Coolify will detect the **Dockerfile** and build the image. No extra build command.
3. **Environment variables** in Coolify: add `GOOGLE_GENERATIVE_AI_API_KEY` and `FLUX_API_KEY` (and optionally `BFL_API_BASE`).
4. Port: expose **3000** (default; the app listens on `0.0.0.0:3000`).

The Dockerfile uses Next.js `standalone` output and includes the `prompts/` folder, so no extra config is needed.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js. Add the same env vars in the project settings.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
