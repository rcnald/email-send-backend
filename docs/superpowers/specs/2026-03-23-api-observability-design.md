# API Observability Learning Spec

Date: 2026-03-23  
Project: `invoice-backend`  
Status: Draft for learning and future implementation

## 1) Why this spec exists

This project currently has limited visibility when requests fail, slow down, or behave unexpectedly.

The purpose of this spec is to define an observability architecture that is:

- beginner-friendly to learn from
- useful in local development first
- portable to production later
- safe by default regarding sensitive data

This spec intentionally focuses on understanding and design. It does not implement the feature.

## 2) Problem statement

When an API request goes through multiple layers (HTTP route, use case, database, storage, external email provider), it becomes hard to answer basic operational questions:

- What happened?
- Where did time go?
- Is this an isolated failure or a trend?
- Why did this exception happen?

Without structured observability, debugging becomes guesswork and production support becomes reactive.

## 3) Learning goals

The learning goals for this project are:

1. Understand the difference between logs, traces, metrics, and error monitoring.
2. Learn how one request produces multiple observability signals.
3. Learn why OpenTelemetry Collector is used as a central telemetry gateway.
4. Build a local-first setup in Docker that mirrors production architecture patterns.
5. Keep design portable so deployment can move from single-host Docker to Render later.

## 4) Beginner glossary

- **Observability:** ability to understand what a system is doing from outside signals.
- **Signal:** one kind of telemetry data (logs, traces, or metrics).
- **Telemetry:** the data emitted by the app so behavior can be observed.
- **Span:** one timed unit of work (example: one database query).
- **Trace:** a group of spans that represent one request journey.
- **Correlation ID / request ID:** unique request label used to connect logs and traces.
- **Trace ID:** unique ID for one full trace.
- **Span ID:** unique ID for one span inside a trace.
- **Histogram metric:** metric type that tracks value distribution (useful for latency).
- **Sampling:** collecting only part of telemetry to reduce overhead/cost.
- **Instrumentation:** adding code/config that emits telemetry.
- **OpenTelemetry Collector:** middle layer that receives telemetry and routes it to backends.
- **Semantic conventions:** standard naming rules for telemetry fields.

## 5) Scope

### In scope

- Structured JSON application logs
- Error and performance monitoring with Sentry
- Distributed traces with OpenTelemetry and Jaeger
- Metrics with OpenTelemetry + Prometheus + Grafana
- Coverage for:
  - HTTP request layer
  - internal operations (use cases)
  - Prisma database operations
  - external integrations (email provider, object storage)
- Privacy-safe defaults (no sensitive payload capture)

### Out of scope

- Full implementation in this phase
- Advanced SLO/alerting policy design
- Multi-service distributed tracing (current project is a single API service)

## 6) Architecture decision

### Chosen approach (recommended)

Use a layered observability model:

- App emits structured logs to stdout.
- App uses OpenTelemetry SDK for traces and metrics.
- App sends telemetry to OpenTelemetry Collector.
- Collector forwards traces to Jaeger and metrics to Prometheus.
- Grafana visualizes metrics from Prometheus.
- App sends exceptions and selected request performance data to Sentry.

Why this approach:

- Realistic architecture used in production systems.
- Teaches clear separation of concerns.
- Reduces vendor lock-in by centralizing telemetry routing in Collector.
- Enables local learning while keeping production migration easier.

### Component purpose map

| Component | Problem it solves | What it is not for | Main output |
| --- | --- | --- | --- |
| Structured JSON logs | Event-by-event narrative for request behavior and debugging context | Not ideal for latency waterfall analysis by itself | JSON log events |
| OpenTelemetry SDK | Vendor-neutral generation of traces and metrics in app | Not a visualization UI | Spans and metrics |
| OpenTelemetry Collector | Decouples app from telemetry backends, central routing/processing | Not primary long-term storage or dashboard | Forwarded telemetry streams |
| Jaeger | Trace visualization and per-request timeline analysis | Not a metrics dashboard | Trace views |
| Prometheus | Metrics storage/query for rates, latency, errors | Not a trace explorer | Time-series metrics |
| Grafana | Dashboard and visualization layer for metrics | Not raw metrics storage | Graphs/dashboards |
| Sentry | Exception monitoring and issue triage with stack traces/context | Not source of truth for system-wide latency metrics | Error events and issue groups |

### Role boundary rule

- Use **Sentry** primarily for exception-centric triage and issue management.
- Use **traces (Jaeger)** and **metrics (Prometheus/Grafana)** as the source of truth for latency and health trends.
- Sentry performance data can assist debugging, but it does not replace the trace/metrics pipeline.

## 7) Conceptual model (simple mental model)

For one request (example: `POST /emails`):

- **Logs**: event diary (`request started`, `provider call failed`, `request finished`).
- **Traces**: timeline of nested steps and latency breakdown.
- **Metrics**: trends over many requests (rate, latency, error ratio).
- **Sentry**: crash report with stack trace + debugging context.

No single signal solves everything. The system combines signals to answer different questions.

## 8) Request lifecycle design

For each incoming HTTP request:

1. Create a top-level server span.
2. Attach correlation context (`request_id`, trace identifiers).
3. Emit structured start/end log events.
4. Create child spans for major internal operations.
5. Record duration and status in request metrics.
6. On error:
   - mark span status as error
   - emit error log
   - capture exception in Sentry with safe context

Expected outcome: a single request can be investigated from four angles without guesswork.

## 9) Data model for observability events

### Log fields (baseline)

- `timestamp`
- `level`
- `message`
- `service.name`
- `environment`
- `request.id`
- `trace.id`
- `span.id`
- `http.method`
- `http.route`
- `http.status_code`
- `duration_ms`
- `error.type` (when applicable)

### Span naming conventions

- HTTP span: `HTTP <METHOD> <route>`
- Use-case span: `<domain>.<use_case>` (example: `email.send`)
- Database span: semantic naming from instrumentation standards
- External span: `<integration>.<operation>` (example: `resend.send_email`)

### Metrics (initial set)

- Request count
- Request duration histogram
- Error count
- Business counters:
  - emails sent
  - emails failed

## 10) Privacy and security policy (safe by default)

Default rule: collect metadata, not sensitive content.

Do not capture by default:

- Authorization headers and cookies
- Request/response bodies
- Email body content
- Attachment file contents
- Raw tokens, API keys, secrets
- Personally identifying payload fields unless explicitly whitelisted

Allowlist strategy:

- Start with minimal tags/attributes.
- Add fields only when they are operationally necessary.
- Document every new captured field and why it is safe.

## 11) Local learning stack (Docker)

Components to run locally:

- API service
- OpenTelemetry Collector
- Jaeger
- Prometheus
- Grafana

Sentry runs as external SaaS using a project DSN.

### Local learning outcomes

- Inspect traces in Jaeger to understand request path and latency.
- Inspect dashboards in Grafana to understand rate/error/latency trends.
- Inspect exceptions in Sentry to understand error context and grouping.
- Correlate logs with traces via trace and span IDs.

### Log access model

- **Local:** read JSON logs directly from container stdout (`docker logs`) and correlate using `request.id` and `trace.id`.
- **Production (future):** ship stdout logs to platform logging or a centralized log backend.
- **Known current limitation:** this design does not yet include a dedicated log query backend (for example, Loki/ELK); logs are still valuable for correlation and debugging, but advanced search/retention is limited until that is added.

## 12) Production evolution path

Initial deployment target: single Docker host / VPS.  
Future target: Render.

Design choices that support this:

- Configuration driven by environment variables.
- Collector-based telemetry routing (backend changes without major app rewrites).
- Structured logs to stdout (platform-compatible ingestion).
- Sampling and verbosity policies adjustable per environment.

Potential Render adaptation later:

- Run app as web service.
- Host or externalize telemetry backends based on Render constraints/cost.
- Keep app instrumentation unchanged; adjust collector/exporter topology.

## 13) Alternatives considered

### A) App -> Jaeger directly

Pros:

- simpler for first setup

Cons:

- less realistic architecture
- harder to evolve and route telemetry flexibly

### B) Sentry-only first

Pros:

- quickest first visible win

Cons:

- weak learning of full observability model
- misses robust trace and metrics pipeline practice

Chosen design remains the layered approach with Collector.

## 14) Risks and mitigations

- **Risk:** high signal noise in local environment  
  **Mitigation:** start with minimal instrumentation scope and expand gradually.

- **Risk:** confusion between overlapping tool features  
  **Mitigation:** enforce role boundary rule (Sentry for error triage; Jaeger + Prometheus/Grafana for latency/health analysis).

- **Risk:** sensitive data leakage in telemetry  
  **Mitigation:** deny-by-default capture policy and explicit allowlist.

- **Risk:** performance overhead from instrumentation  
  **Mitigation:** measure baseline, add sampling/config controls before production.

## 15) Success criteria

This design is successful when the team can answer all of the following for a test request:

1. Where in the request path time is spent.
2. Whether failures are increasing over time.
3. Which exception occurred and how to reproduce/fix it.
4. Which logs correspond to the same trace/request.
5. Whether core business flow (`send email`) is healthy.

## 16) Suggested implementation phases (for future work)

1. **Foundation: logging and error basics**
   - Entry condition: API runs locally and baseline behavior is known.
   - Deliverable: structured JSON logs with `request.id` + Sentry exception capture.
   - Exit check: one failed request is visible in logs and Sentry with matching request context.

2. **Tracing: end-to-end request journey**
   - Entry condition: foundation phase stable and noise level acceptable.
   - Deliverable: HTTP spans + internal use-case spans + Prisma/external spans in Jaeger.
   - Exit check: one `POST /emails` request is traceable end-to-end in Jaeger.

3. **Metrics: operational trend visibility**
   - Entry condition: traces confirm request boundaries and operation names.
   - Deliverable: request rate/latency/error metrics + email sent/failed counters in Prometheus/Grafana.
   - Exit check: dashboard answers "traffic volume, latency trend, failure trend" for the last 24h window.

4. **Hardening: privacy and performance controls**
   - Entry condition: core telemetry works and data usefulness is validated.
   - Deliverable: deny-by-default filters, allowlist documentation, environment-based sampling/verbosity.
   - Exit check: no sensitive fields appear in telemetry during validation tests.

5. **Productionization: topology and operations review**
   - Entry condition: local stack is stable and team understands signal boundaries.
   - Deliverable: deployment-specific topology for VPS now and Render later, with runbook notes.
   - Exit check: chosen production target has documented telemetry flow and rollback-safe config strategy.

## 17) Study guide (how to learn from this spec)

When implementing later, for each phase document:

- what problem this step solves
- what new signal appears in the tools
- one real debugging scenario enabled by that signal
- what trade-off was introduced (complexity, overhead, cost)

This converts setup work into practical observability learning.

## 18) Example: one request across all tools

Example request: `POST /emails`

- Request arrives with `request.id=req_9f2a`.
- Trace is created with `trace.id=4b8c...`.
- Logs include `request.id=req_9f2a` and `trace.id=4b8c...` at start/end.
- Jaeger shows child spans for validation, Prisma, and email provider call.
- Prometheus metrics increment request count and update latency histogram bucket.
- If provider fails, Sentry captures exception linked to the request context.

Practical result: you can pivot from one ID (`request.id` or `trace.id`) across logs, traces, metrics context, and error event history.

## 19) Naming note (for consistency)

- Canonical log field: `request.id`
- Alias in discussion: `correlation ID`
- Optional internal variable name in code examples/plans later: `requestId`

Use `request.id` in docs and telemetry outputs to keep language consistent.

## 20) First-look triage cheat sheet

- If you need the stack trace and grouped exception history -> **Sentry**
- If one request feels slow and you need step-by-step latency -> **Jaeger**
- If you need traffic/error/latency trends over time -> **Prometheus + Grafana**
- If you need event details and context around a request -> **Structured logs**
