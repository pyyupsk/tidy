# tidy

A fully client-side `.xlsx` cleaning tool. No backend, no API routes — all data processing happens in the browser.

## Features

- **Drop columns** — remove unwanted columns; columns with no data are flagged with an `all null` badge and can be dropped in bulk
- **Deduplicate rows** — select one or more key columns; rows where all selected columns match a prior row are removed on export
- **Fill rules** — fill nullish cells per column: forward-fill (copy from row above), column median, fixed literal value, or empty string
- **Multi-sheet support** — switch between sheets in a workbook; cleaning config resets per sheet
- **Auto header detection** — row 1 is automatically marked as a header when all non-null values are non-numeric strings
- **Skip row 1** — exclude the first row from deduplication, fill, and export while using it as column labels
- **Live stats bar** — shows row count, column count, null count, duplicate count, and the final `rows × cols` after cleaning
- **Session persistence** — file and cleaning config survive page reloads via `sessionStorage` (up to ~3 MB); a "session restored" badge appears on reload

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
| `bun run start`     | Start production server   |
| `bun run test`      | Run all tests             |
| `bun run typecheck` | TypeScript check          |
| `bun run check`     | Biome check + auto-fix    |
| `bun run lint`      | Biome lint + auto-fix     |
| `bun run format`    | Biome format + auto-fix   |

## Stack

- [Next.js](https://nextjs.org/) — React framework
- [Zustand](https://zustand-demo.pmnd.rs/) — client state
- [xlsx](https://sheetjs.com/) — spreadsheet parsing and export
- [shadcn/ui](https://ui.shadcn.com/) + [@base-ui/react](https://base-ui.com/) — UI components
- [Tailwind CSS](https://tailwindcss.com/) — styling
- [Biome](https://biomejs.dev/) — linting and formatting
- [Vitest](https://vitest.dev/) — testing
