# tidy

A fully client-side `.xlsx` cleaning tool. No backend, no API routes — all data processing happens in the browser.

## Features

- **Drop columns** — remove unwanted columns, with auto-suggestions for all-null columns
- **Deduplicate rows** — select key columns to identify and remove duplicate rows
- **Fill rules** — fill empty cells per column with a literal value, column median, or empty string
- **Skip header row** — exclude the first row from processing while using it as column labels
- **Session persistence** — file state survives page reloads via `sessionStorage`

## Getting started

```bash
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000), drop in an `.xlsx` file, configure your cleaning rules, and export the result.

## Commands

| Command             | Description               |
| ------------------- | ------------------------- |
| `bun run dev`       | Dev server with Turbopack |
| `bun run build`     | Production build          |
| `bun run test`      | Run all tests             |
| `bun run typecheck` | TypeScript check          |
| `bun run check`     | Biome check + auto-fix    |

## Stack

- [Next.js](https://nextjs.org/) — React framework
- [Zustand](https://zustand-demo.pmnd.rs/) — client state
- [xlsx](https://sheetjs.com/) — spreadsheet parsing and export
- [shadcn/ui](https://ui.shadcn.com/) + [@base-ui/react](https://base-ui.com/) — UI components
- [Tailwind CSS](https://tailwindcss.com/) — styling
- [Biome](https://biomejs.dev/) — linting and formatting
- [Vitest](https://vitest.dev/) — testing
