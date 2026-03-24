# Basic Structured Logging Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add privacy-safe, structured JSON request logs with correlation IDs as the first observability foundation for this API.

**Architecture:** Add one logger utility and one request-logging middleware, then wire it into Express early in the pipeline. Each request gets a `request.id` and emits `request.started` and `request.finished` events with method/route/status/duration. Error insight for this basic phase comes from `http.status_code` and `request.outcome` in finish logs, while existing controller error responses remain unchanged.

**Tech Stack:** TypeScript, Express 5, Vitest, Supertest

**Scope note:** This plan is **Phase 1A (logs only)** from the observability spec foundation. Sentry error capture is intentionally deferred to a follow-up **Phase 1B** plan so learning stays focused.

---

## File map

- Create: `src/infra/logger.ts` (single JSON logger utility)
- Create: `src/infra/logger.spec.ts` (logger unit tests)
- Create: `src/infra/http/middlewares/request-logger.ts` (request lifecycle logs)
- Create: `src/infra/http/middlewares/request-logger.spec.ts` (middleware unit tests)
- Create: `src/infra/http/middlewares/request-logger.e2e-spec.ts` (middleware e2e integration)
- Modify: `src/infra/lib/@types/express.d.ts` (add `requestId?: string`)
- Modify: `src/infra/app.ts` (register logging middleware)
- Modify: `src/infra/server.ts` (structured startup log)

### Task 1: Build logger utility with static context

**Files:**
- Create/Test: `src/infra/logger.spec.ts`
- Create: `src/infra/logger.ts`

- [ ] **Step 1: Write failing logger test**

Add a unit test that spies on `process.stdout.write`, calls `logger.info("test.event", {"request.id": "req_1"})`, and expects one valid JSON line containing:

```ts
{
  timestamp: expect.any(String),
  level: "info",
  message: "test.event",
  "service.name": "email-send-backend",
  environment: expect.any(String),
  "request.id": "req_1",
}
```

- [ ] **Step 2: Run test to verify failure**

Run: `yarn vitest run src/infra/logger.spec.ts`
Expected: FAIL because logger file does not exist.

- [ ] **Step 3: Implement minimal logger**

Create `src/infra/logger.ts`:

```ts
type LogLevel = "info" | "error";
type LogFields = Record<string, unknown>;

const SERVICE_NAME = "email-send-backend";

function write(level: LogLevel, message: string, fields: LogFields = {}) {
  const log = {
    timestamp: new Date().toISOString(),
    level,
    message,
    "service.name": SERVICE_NAME,
    environment: process.env.ENVIRONMENT || "development",
    ...fields,
  };

  process.stdout.write(`${JSON.stringify(log)}\n`);
}

export const logger = {
  info(message: string, fields?: LogFields) {
    write("info", message, fields);
  },
  error(message: string, fields?: LogFields) {
    write("error", message, fields);
  },
};
```

- [ ] **Step 4: Run logger test to verify pass**

Run: `yarn vitest run src/infra/logger.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit logger utility**

```bash
git add src/infra/logger.ts src/infra/logger.spec.ts
git commit -m "feat: add structured logger utility"
```

### Task 2: Add request logging middleware with correlation ID

**Files:**
- Create/Test: `src/infra/http/middlewares/request-logger.spec.ts`
- Create: `src/infra/http/middlewares/request-logger.ts`
- Modify: `src/infra/lib/@types/express.d.ts`

- [ ] **Step 1: Write failing middleware tests**

Add tests for:

1. assigns `request.requestId` (header `x-request-id` preferred, otherwise UUID)
2. invalid or oversized `x-request-id` falls back to UUID
3. logs `request.started` with allowlisted metadata only
4. logs `request.finished` on `response.finish` with `http.status_code`, `duration_ms`, and `request.outcome`

Expected finish log fields:

```ts
{
  message: "request.finished",
  "request.id": expect.any(String),
  "http.method": "GET",
  "http.route": "/health",
  "http.status_code": 200,
  duration_ms: expect.any(Number),
  "request.outcome": "success",
}
```

- [ ] **Step 2: Run tests to verify failure**

Run: `yarn vitest run src/infra/http/middlewares/request-logger.spec.ts`
Expected: FAIL because middleware is not implemented.

- [ ] **Step 3: Implement middleware minimally**

Create `src/infra/http/middlewares/request-logger.ts`:

```ts
import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { logger } from "@/infra/logger";

function getSafeRoute(request: Request) {
  const routePath = request.route?.path;

  if (typeof routePath === "string") {
    return `${request.baseUrl || ""}${routePath}` || request.path;
  }

  return request.path;
}

function getOutcome(statusCode: number) {
  if (statusCode >= 500) return "server_error";
  if (statusCode >= 400) return "client_error";
  return "success";
}

function isValidRequestId(value: string) {
  return /^[A-Za-z0-9_-]{8,64}$/.test(value);
}

export function requestLogger(request: Request, response: Response, next: NextFunction) {
  const startedAt = Date.now();
  const headerRequestId = request.header("x-request-id");
  const requestId =
    headerRequestId && isValidRequestId(headerRequestId)
      ? headerRequestId
      : randomUUID();

  request.requestId = requestId;

  logger.info("request.started", {
    "request.id": requestId,
    "http.method": request.method,
    "url.path": request.path,
  });

  response.on("finish", () => {
    const statusCode = response.statusCode;

    logger.info("request.finished", {
      "request.id": requestId,
      "http.method": request.method,
      "http.route": getSafeRoute(request),
      "http.status_code": statusCode,
      duration_ms: Date.now() - startedAt,
      "request.outcome": getOutcome(statusCode),
    });
  });

  next();
}
```

Update `src/infra/lib/@types/express.d.ts`:

```ts
interface Request {
  userId?: string;
  requestId?: string;
}
```

- [ ] **Step 4: Run middleware tests to verify pass**

Run: `yarn vitest run src/infra/http/middlewares/request-logger.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit middleware**

```bash
git add src/infra/http/middlewares/request-logger.ts src/infra/http/middlewares/request-logger.spec.ts src/infra/lib/@types/express.d.ts
git commit -m "feat: add request logging middleware with correlation id"
```

### Task 3: Wire middleware into app and startup logging

**Files:**
- Modify: `src/infra/app.ts`
- Modify: `src/infra/server.ts`
- Create/Test: `src/infra/http/middlewares/request-logger.e2e-spec.ts`

- [ ] **Step 1: Write failing e2e test**

Create `request-logger.e2e-spec.ts` to assert that one `/health` request produces parseable JSON log lines containing both `request.started` and `request.finished`.

- [ ] **Step 2: Run e2e test to verify failure**

Run: `yarn vitest run --config vitest.config.e2e.ts src/infra/http/middlewares/request-logger.e2e-spec.ts`
Expected: FAIL before middleware registration.

- [ ] **Step 3: Register middleware and startup log**

In `src/infra/app.ts`:

- import `requestLogger`
- register `app.use(requestLogger)` before `express.json()` so parse errors are also associated with request context

In `src/infra/server.ts`:

- replace `console.log` calls with `logger.info("server.started", {...})`

Suggested startup payload:

```ts
{
  port: env.PORT,
  environment: env.ENVIRONMENT,
  reference_url: `http://localhost:${env.PORT}/reference`,
}
```

- [ ] **Step 4: Run relevant tests**

Run:

```bash
yarn vitest run src/infra/logger.spec.ts src/infra/http/middlewares/request-logger.spec.ts src/infra/http/middlewares/timeout.spec.ts
yarn vitest run --config vitest.config.e2e.ts src/infra/http/middlewares/request-logger.e2e-spec.ts src/infra/http/middlewares/rate-limit.e2e-spec.ts
```

Expected: PASS.

- [ ] **Step 5: Commit wiring changes**

```bash
git add src/infra/app.ts src/infra/server.ts src/infra/http/middlewares/request-logger.e2e-spec.ts
git commit -m "feat: wire structured request logging into express app"
```

### Task 4: Manual verification

**Files:**
- No required file edits

- [ ] **Step 1: Run app locally**

Run: `yarn dev`
Expected: one `server.started` JSON line.

- [ ] **Step 2: Trigger sample requests**

Run:

```bash
curl -i http://localhost:3333/health
curl -i "http://localhost:3333/health?token=abc"
```

Expected: logs do not include query string values.

- [ ] **Step 3: Validate correlation behavior**

Expected: `request.started` and `request.finished` for same request share the same `request.id`.

- [ ] **Step 4: Optional learning note update**

Optionally append a short note in `docs/superpowers/specs/2026-03-23-api-observability-design.md` on what was learned from basic logs before traces/metrics.

- [ ] **Step 5: Commit docs note (optional)**

```bash
git add docs/superpowers/specs/2026-03-23-api-observability-design.md
git commit -m "docs: add basic logging learning notes"
```

## Final validation checklist

- [ ] Request logs are valid JSON lines.
- [ ] Every request has `request.id`.
- [ ] Start/finish events include method/route/status/duration.
- [ ] `request.outcome` reflects status family (`success`, `client_error`, `server_error`).
- [ ] No query string or sensitive payload fields are logged.
- [ ] Existing middleware e2e tests still pass.

## Follow-up plan (next)

- Phase 1B: add Sentry initialization and safe exception capture, then validate one failing request appears in both logs and Sentry with shared `request.id` context.
