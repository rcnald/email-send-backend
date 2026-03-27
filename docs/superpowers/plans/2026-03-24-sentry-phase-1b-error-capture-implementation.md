# Sentry Phase 1B Error Capture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Sentry initialization and privacy-safe exception capture so server-side failures are reported with `request.id` correlation.

**Architecture:** Keep logs as the source of local observability and add Sentry only for exception reporting. Implement a small Sentry gateway in infra (`sentry.ts`) and call it from central HTTP error handling, not from each controller. Enable Sentry only when DSN is configured so local/dev/test runs remain stable without external dependency.

**Tech Stack:** TypeScript, Express 5, Vitest, Sentry Node SDK

---

## File map

- Create: `src/domain/application/observability/error-capture.ts` (error capture gateway contract)
- Create: `src/infra/observability/sentry.ts` (Sentry init + capture gateway)
- Create: `src/infra/observability/sentry.spec.ts` (gateway unit tests)
- Create: `test/observability/in-memory-sentry-event-storage.ts` (deterministic in-memory event sink for tests)
- Create: `src/infra/http/handlers/http-error-handler.e2e-spec.ts` (HTTP-level handler capture behavior)
- Create: `src/infra/http/handlers/unexpected-error-handler.ts` (capture unexpected request errors)
- Create: `src/infra/http/handlers/unexpected-error-handler.e2e-spec.ts` (HTTP-level unexpected error behavior)
- Create: `src/infra/bootstrap.ts` (test-safe startup entry)
- Create: `src/infra/bootstrap.spec.ts` (startup order test)
- Modify: `src/infra/http/handlers/http-error-handler.ts` (invoke capture gateway on 5xx)
- Modify: `src/infra/app.ts` (register global unexpected error handler + test route seam)
- Modify: `src/infra/server.ts` (initialize Sentry on boot)
- Modify: `src/infra/env.ts` (optional Sentry env vars)
- Modify: `package.json` (add Sentry SDK)

## Phase boundary

- This plan covers **Phase 1B only** (Sentry exception capture).
- It does not add OpenTelemetry tracing/metrics yet.
- It does not change existing domain/controller error contracts.

### Task 1: Add env support and Sentry gateway

Status: Implemented in commit `99e465f` and now treated as baseline for Tasks 2-5.

**Files:**
- Create: `src/domain/application/observability/error-capture.ts`
- Modify: `src/infra/env.ts`
- Create: `src/infra/observability/sentry.ts`
- Create/Test: `src/infra/observability/sentry.spec.ts`
- Create: `test/observability/in-memory-sentry-event-storage.ts`
- Modify: `package.json`

- [x] **Step 1: Write failing gateway tests**

Create `src/infra/observability/sentry.spec.ts` with tests for:

1. init is no-op when DSN is missing
2. capture sends sanitized allowlisted fields when DSN is configured

Use real Sentry SDK integration path and disable network delivery in tests via infra-only callback seam: `setSentryEventCallbackForTests(...)` + `init()`. Persist callback events with `InMemorySentryEventStorage`.

- [x] **Step 2: Run test to verify failure**

Run: `yarn vitest run src/infra/observability/sentry.spec.ts`
Expected: FAIL because gateway module does not exist.

- [x] **Step 3: Add optional Sentry env variables**

Update `src/infra/env.ts` schema with optional fields:

- `SENTRY_DSN` (optional URL)

Keep all existing required env vars unchanged.

- [x] **Step 4: Implement minimal gateway**

Create `src/domain/application/observability/error-capture.ts` with:

- `CaptureHttpErrorInput`
- `ErrorCaptureGateway` abstract class (`init`, `captureHttpError`, `shutDown`) with no Sentry-specific event types

Create `src/infra/observability/sentry.ts` with:

- singleton `sentryErrorCaptureGateway` implementing `ErrorCaptureGateway`
- `init()`
  - returns immediately and disables capture when no DSN
  - calls `Sentry.init({...})` when DSN exists
  - sets deny-by-default privacy config:
    - `sendDefaultPii: false`
    - `beforeSend` allowlist scrubber for event payload
    - reconstruct event from allowlisted fields only (deny-all default)
    - strip request data not in allowlist
  - when infra test callback seam is configured, call callback with sanitized event and return `null` to avoid network
- `captureHttpError()`
  - no-op when disabled
  - captures a sanitized synthetic `Error` with allowlisted context only:
    - `request.id`
    - `http.method`
    - `http.route`
    - `http.status_code`
    - domain `code`
  - event message is constant (for example: `"HTTP_REQUEST_FAILED"`), not raw domain message
  - do not attach stack traces or causes from request-originated errors
  - never forwards `error.data`
  - never includes headers, cookies, bodies, tokens, raw payloads, or raw exception messages
- `shutDown()`
  - closes Sentry client (`close(0)`) for deterministic teardown in tests
- `setSentryEventCallbackForTests(callback?)`
  - infra-only test seam to observe sanitized events without leaking test contracts into application port

- [x] **Step 5: Add dependency and run gateway tests**

Run:

```bash
yarn add @sentry/node
yarn vitest run src/infra/observability/sentry.spec.ts
```

Expected: PASS.

- [x] **Step 6: Commit gateway slice**

```bash
git add package.json yarn.lock src/domain/application/observability/error-capture.ts src/infra/env.ts src/infra/observability/sentry.ts src/infra/observability/sentry.spec.ts test/observability/in-memory-sentry-event-storage.ts
git commit -m "feat: add sentry error capture gateway with safe test callbacks"
```

### Task 2: Capture 5xx from central HTTP error handler

**Files:**
- Create/Test: `src/infra/http/handlers/http-error-handler.e2e-spec.ts`
- Modify: `src/infra/http/handlers/http-error-handler.ts`
- Modify: `src/infra/app.ts`

- [x] **Step 1: Write failing HTTP-level e2e tests**

Create `http-error-handler.e2e-spec.ts` using `createApp()` + `supertest` and deterministic callback mode from `sentry.ts` (`setSentryEventCallbackForTests(...)` + `init()`) with `InMemorySentryEventStorage`. In each test, initialize gateway before requests and call `setSentryEventCallbackForTests()` + `shutDown()` in teardown. Add assertions:

1. 4xx response path does not produce Sentry event
2. 5xx response path (`EXTERNAL_SERVICE_FAILED` -> 503) produces Sentry event with allowlisted fields
3. event payload omits sensitive fields (`body`, `headers`, `cookies`, tokens, raw messages)
4. event payload does not include raw thrown message/stack/cause

Use deterministic routes added in test setup only:

- `GET /__test/domain-400` -> returns via `HttpErrorHandler.handle(...InvalidArgument...)`
- `GET /__test/domain-503` -> returns via `HttpErrorHandler.handle(...ExternalServiceFailed...)`

Introduce app factory seam in this task (not later):

- `createApp({ registerTestRoutes?: (app) => void })`
- invoke `registerTestRoutes` before global unexpected error middleware registration

- [x] **Step 2: Run test to verify failure**

Run: `yarn vitest run --config vitest.config.e2e.ts src/infra/http/handlers/http-error-handler.e2e-spec.ts`
Expected: FAIL before handler integration.

- [x] **Step 3: Implement minimal handler integration**

Update `HttpErrorHandler.handle(...)`:

- map error via `ErrorMapper` as before
- if `statusCode >= 500`, call `captureHttpError(...)` with safe request context from `response.req`
- keep current response JSON contract unchanged
- update `createApp` signature to accept optional `registerTestRoutes` seam used by this and later e2e tests

- [x] **Step 4: Run handler tests**

Run: `yarn vitest run --config vitest.config.e2e.ts src/infra/http/handlers/http-error-handler.e2e-spec.ts`
Expected: PASS.

- [x] **Step 5: Commit handler slice**

```bash
git add src/infra/http/handlers/http-error-handler.ts src/infra/http/handlers/http-error-handler.e2e-spec.ts src/infra/app.ts
git commit -m "feat: capture 5xx domain errors in sentry"
```

### Task 3: Initialize Sentry at server startup

**Files:**
- Create: `src/infra/bootstrap.ts`
- Create/Test: `src/infra/bootstrap.spec.ts`
- Modify: `src/infra/server.ts`

- [x] **Step 1: Write failing startup integration assertion**

Create `src/infra/bootstrap.spec.ts` and add a focused test with injected deps asserting call order:

1. `sentryErrorCaptureGateway.init()` called exactly once
2. `listen` is invoked only after gateway initialization

- [x] **Step 2: Run test to verify failure**

Run: `yarn vitest run src/infra/bootstrap.spec.ts`
Expected: FAIL before bootstrap entry exists.

- [x] **Step 3: Implement startup init (minimal change)**

Create `src/infra/bootstrap.ts` with `startServer(deps?)` that:

- calls `sentryErrorCaptureGateway.init()`
- builds app and env via injected deps/default imports
- starts listen via injected/default listener function

Call-order contract in code: gateway initialization executes before any `listen(...)` invocation.

Use this seam to avoid port binding in tests.

Then keep `src/infra/server.ts` as thin entrypoint that only calls `startServer()`.

- [x] **Step 4: Run startup test**

Run: `yarn vitest run src/infra/bootstrap.spec.ts`
Expected: PASS.

- [x] **Step 5: Commit startup slice**

```bash
git add src/infra/bootstrap.ts src/infra/bootstrap.spec.ts src/infra/server.ts
git commit -m "feat: initialize sentry during server startup"
```

### Task 4: Capture unexpected request-pipeline errors

**Files:**
- Create/Test: `src/infra/http/handlers/unexpected-error-handler.e2e-spec.ts`
- Create: `src/infra/http/handlers/unexpected-error-handler.ts`
- Modify: `src/infra/app.ts`

- [x] **Step 1: Write failing unexpected-error e2e tests**

Add tests (using `createApp()` + `supertest`) with deterministic callback mode from `sentry.ts` (`setSentryEventCallbackForTests(...)` + `init()`) and explicit teardown (`setSentryEventCallbackForTests()` + `shutDown()`) to verify unexpected request-pipeline errors are:

1. captured in Sentry with allowlisted context
2. responded with safe 500 payload

Use deterministic test route:

- `GET /__test/unexpected-throw` -> throws `new Error("boom")`

Reuse app factory seam introduced in Task 2 to register this test route before unexpected error middleware.

- [x] **Step 2: Run test to verify failure**

Run: `yarn vitest run --config vitest.config.e2e.ts src/infra/http/handlers/unexpected-error-handler.e2e-spec.ts`
Expected: FAIL before handler exists.

- [x] **Step 3: Implement minimal unexpected error handler**

Create Express error middleware `(error, request, response, _next)` that:

- calls `captureHttpError()` with synthetic `OPERATION_FAILED`-like context
- returns standardized 500 response without leaking internals

Register this middleware in `src/infra/app.ts` after routes.

- [x] **Step 4: Run unexpected handler tests**

Run: `yarn vitest run --config vitest.config.e2e.ts src/infra/http/handlers/unexpected-error-handler.e2e-spec.ts`
Expected: PASS.

- [x] **Step 5: Commit unexpected error slice**

```bash
git add src/infra/http/handlers/unexpected-error-handler.ts src/infra/http/handlers/unexpected-error-handler.e2e-spec.ts src/infra/app.ts
git commit -m "feat: capture unexpected request errors with sentry"
```

### Task 5: Verification and manual Sentry smoke check

**Files:**
- No required production file edits

- [x] **Step 1: Run relevant unit suite**

Run:

```bash
yarn vitest run src/infra/observability/sentry.spec.ts src/infra/bootstrap.spec.ts src/infra/http/middlewares/request-logger.spec.ts src/infra/http/middlewares/timeout.spec.ts
yarn vitest run --config vitest.config.e2e.ts src/infra/http/handlers/http-error-handler.e2e-spec.ts src/infra/http/handlers/unexpected-error-handler.e2e-spec.ts
```

Expected: PASS.

- [x] **Step 2: Run selected e2e suite (if Docker infra is up)**

Run:

```bash
yarn vitest run --config vitest.config.e2e.ts src/infra/http/controllers/auth/authenticate.e2e-spec.ts
```

Expected: PASS when Docker services are available.

- [ ] **Step 3: Manual Sentry smoke test (development/staging)**

With `SENTRY_DSN` configured, trigger one known server-side failure and verify event appears in Sentry with:

- domain error code
- `request.id`
- route/method/status metadata

- [ ] **Step 4: Confirm privacy posture**

Check event payload in Sentry and verify absence of:

- request/response body
- auth headers/cookies
- secrets/tokens

- [ ] **Step 5: Commit docs note (optional)**

If you document lessons learned in spec/plan docs:

```bash
git add docs/superpowers/specs/2026-03-23-api-observability-design.md docs/superpowers/plans/2026-03-24-sentry-phase-1b-error-capture-implementation.md
git commit -m "docs: add sentry phase 1b verification notes"
```

## Final validation checklist

- [ ] Sentry initializes only when `SENTRY_DSN` is configured.
- [ ] 5xx domain errors are captured to Sentry.
- [ ] 4xx domain errors are not captured by default.
- [ ] Existing HTTP error response format remains unchanged.
- [ ] `request.id` correlation is present in captured Sentry context.
- [ ] No sensitive fields are sent to Sentry.
