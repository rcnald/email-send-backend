# AGENTS.md

## Testing Rules (Unit + End-to-End)

This repository uses two test layers:

- **Unit tests**: `*.spec.ts`
- **End-to-end tests**: `*.e2e-spec.ts`

Follow these rules for all new tests and test refactors.

## Non-Negotiable Rules

1. **Do not use mocks for business/integration behavior.**
2. **Use real infrastructure for e2e tests** (Docker-backed services).
3. **Use short-lived test databases/schemas** (ephemeral per test run).
4. **For HTTP-level tests, always build the app with `createApp()` from `src/infra/app.ts`.**

## Unit Tests (`*.spec.ts`)

- Keep scope small and deterministic.
- Prefer real code paths and real collaborators from the same layer.
- Only use spies for output observation when needed (for example, `process.stdout.write`), not to fake business behavior.
- Do not mock repositories, external services, or use-cases to simulate core behavior.
- If a test requires realistic IO behavior, move it to e2e instead of mocking.

Run unit tests with:

```bash
yarn vitest run
```

Or targeted:

```bash
yarn vitest run src/path/to/file.spec.ts
```

## End-to-End Tests (`*.e2e-spec.ts`)

- Use the e2e Vitest config in `vitest.config.e2e.ts`.
- E2E setup runs from `test/setup.e2e.ts`.
- `test/setup.e2e.ts` already creates a **unique, short-lived schema** per run and cleans it up afterward.
- Keep this pattern: isolated database state, no persistent shared schema.
- Use Docker services required by the app (database, storage, etc.) before running e2e tests.

Run e2e tests with:

```bash
yarn vitest run --config vitest.config.e2e.ts
```

Or targeted:

```bash
yarn vitest run --config vitest.config.e2e.ts src/path/to/file.e2e-spec.ts
```

## App Construction for HTTP Tests

For HTTP-level tests (middleware, route, controller e2e):

- Instantiate the app using:

```ts
import { createApp } from "@/infra/app";

const app = createApp();
```

- Use `supertest` against this app instance.
- Do not create alternate app bootstraps for tests.

## Test Data and Isolation

- Each test should be independent and re-runnable.
- Avoid reliance on execution order.
- Seed only the minimum data required for the scenario.
- Cleanup must happen automatically (schema and storage cleanup as in existing e2e setup).

## Practical Guidance

- If you are tempted to mock infra to make a test pass, write an e2e test instead.
- If the behavior is pure and fast, keep it as unit.
- If the behavior depends on Express middleware, Prisma, auth cookies, storage, or network boundaries, make it e2e.
