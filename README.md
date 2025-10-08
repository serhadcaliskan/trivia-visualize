# Trivia Visualize

Explore and visualize Open Trivia DB data with interactive charts. This React + TypeScript app fetches questions from the Open Trivia Database and shows:

- Theme distribution (Treemap)
- Difficulty distribution (Donut/Pie)
- Question type breakdown (Bar chart)
- Category counts and a collapsible category sidebar

All visualizations respond to category selections from the sidebar or the treemap.


## Features

- Interactive Theme Treemap: Click a block to filter by its category
- Difficulty Donut: See counts for Easy / Medium / Hard
- Type Bar Chart: Compare Multiple Choice vs True/False
- Category Count Widget: Quick total for current selection
- Collapsible Category Sidebar: Browse categories and filter
- Robust API handling: Session token management, rate-limiting guard, user-friendly errors, loading states
- Built with Recharts, React 19, and TypeScript


## Tech Stack

- React 19 + TypeScript (Create React App, react-scripts 5)
- Recharts for charts
- Open Trivia DB (public API)
- Testing Library + Jest setup


## Getting Started

Prerequisites:
- Node.js 18+ and npm
- Internet access to https://opentdb.com (no API key required)

Install dependencies and start the dev server:

```cmd
npm install
npm start
```

Build for production:

```cmd
npm run build
```

Run tests:

```cmd
npm test
```


## Project Structure

- `src/components/`
  - `TriviaApp.tsx` – main layout, orchestrates data fetching and renders widgets
  - `ThemeTreemap.tsx` – category/"theme" treemap with click-to-filter
  - `DifficultyPieChart.tsx` – difficulty donut chart
  - `TypeBarChart.tsx` – multiple vs boolean bar chart
  - `CategoryCountWidget.tsx` – shows total in current selection
- `src/hooks/useTriviaApi.ts` – React hook that exposes state and actions for OpenTDB
- `src/services/triviaApi.ts` – API client: token management, question/category endpoints, rate-limit delays, error translation
- `src/types/trivia.ts` – TypeScript models and response codes
- `src/utils/stringUtils.ts` – HTML entity decoding, category name normalization/helpers
- `src/colors.ts` – palette for charts


## How It Works

- On first load, the app requests a session token and fetches 50 questions automatically.
- The Category sidebar lists all OpenTDB categories; selecting one filters the charts.
- You can also select a category by clicking a tile in the Theme Treemap.
- The app handles common OpenTDB response codes gracefully (no results, invalid params, token not found/empty, rate limit).
- A minimal rate-limit delay (5s) is enforced between question requests to avoid API throttling.

Key pieces:
- `useTriviaApi` returns questions, categories, isLoading, error, token state, and actions like `getQuestions`, `getCategories`, `requestToken`, `resetToken`.
- `TriviaApiService` builds URLs for endpoints, decodes responses, retries when token issues occur, and maps OpenTDB `response_code` values to meaningful errors.


## Configuration & Customization

- Default fetch size: `TriviaApp.tsx` initializes `amount: 50`. Adjust as needed.
- Colors: Edit palettes in `src/colors.ts`.
- Styling: Component-level CSS in `src/components/*.css` and global styles in `src/*.css`.

No `.env` is required; the app uses the public OpenTDB API.


## Troubleshooting

- Empty charts / "No questions": The filter may be too strict or there are no items for that category; clear the selection or fetch again.
- "Rate limit" message: The service waits ~5 seconds between requests. Give it a moment and try again.
- "Session expired" / "You’ve seen all available questions": Request or reset the token (handled automatically in most flows).
- Network issues: Ensure your browser can reach https://opentdb.com.


## Scripts

- `npm start` – Start dev server (CRA)
- `npm run build` – Production build to `build/`
- `npm test` – Run tests (Jest + Testing Library)
- `npm run eject` – Eject CRA config (irreversible)


## Acknowledgements

- Open Trivia Database – https://opentdb.com
- Recharts – https://recharts.org

