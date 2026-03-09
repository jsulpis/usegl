# Testing

Tests are Playwright visual regression / DOM assertion tests against the Astro playground.

## Snapshot updates

Screenshot baselines **must be updated inside Docker** to ensure rendering consistency across machines:

```bash
pnpm --filter="./lib" test:update    # update snapshots inside Docker
pnpm --filter="./lib" test:local     # run full test suite in Docker locally
```

Never update snapshots by running Playwright directly on your local machine — the output will differ from CI.

## Test files

Test files live in `lib/tests/`. There is currently one spec: `screenshots.spec.ts`.
