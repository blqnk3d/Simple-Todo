# AGENTS.md — Skills Reference

## How to use this file

1. Read the user's task carefully.
2. Find the skill whose **trigger phrases** most closely match the request.
3. Load that skill's full SKILL.md before starting work.
4. If multiple skills apply, load the **primary** one first, then check the **combine with** note for secondary references.
5. When in doubt between two skills, pick the one that matches the _output_ being produced, not just the topic.
6. **Multi-skill limit:** Never load more than 2 skills fully. If a third skill matches, reference only its rules and validation checklist — do not load the full SKILL.md.

---

## Skill Index

### 1. Accessibility UI Design

**Load when user says things like:**
"make this accessible", "add ARIA", "keyboard navigation", "screen reader support", "WCAG", "focus trap", "audit this UI", "alt text", "label my form inputs", "tab order"

**Primary output:** Accessible HTML/JSX with semantic elements, ARIA, and keyboard support.

**Combine with:**

- React Component Design — when building accessible React components
- DOM Security Hardening — when the accessible UI also handles user input

---

### 2. API Design (REST)

**Load when user says things like:**
"design an API", "add a new endpoint", "REST API", "URL structure", "HTTP methods", "API versioning", "OpenAPI", "webhook", "standardize our API responses", "pagination on this endpoint"

**Primary output:** API route definitions, URL structure, response schemas, OpenAPI spec.

**Combine with:**

- Error Handling Architecture — always pair when designing error responses
- Authentication & Authorization — when endpoints need to be secured
- Testing Strategies — when writing API integration tests

---

### 3. Caching Strategies

**Load when user says things like:**
"this endpoint is slow", "reduce database load", "cache this data", "Redis", "TTL", "cache invalidation", "read-heavy", "cache-aside", "write-through"

**Primary output:** Caching layer design, TTL decisions, invalidation logic.

**Combine with:**

- Database Query Optimization — if the root cause may be a slow query, not missing cache
- Logging & Observability — to monitor cache hit rates

---

### 4. CI/CD Pipeline Architecture

**Load when user says things like:**
"set up GitHub Actions", "GitLab CI", "automate deployments", "build pipeline", "staging to production", "artifact promotion", "deploy on merge", "environment promotion", "rollback strategy"

**Primary output:** Pipeline YAML config, deployment workflow, artifact strategy.

**Combine with:**

- Git Workflow & Branching — for branch-to-pipeline trigger alignment
- Infrastructure as Code — when pipeline provisions infrastructure
- Testing Strategies — for test stage design within the pipeline

---

### 5. Code Review Guidelines

**Load when user says things like:**
"review this PR", "give feedback on this code", "is this code good", "how should I review", "what's wrong with this", "code quality"

**Primary output:** Structured review feedback, blocking vs. non-blocking comments.

**Combine with:**

- The relevant domain skill — e.g. if reviewing a React component, also load React Component Design for specific rules to check against

---

### 6. Database Query Optimization

**Load when user says things like:**
"this query is slow", "N+1 problem", "optimize this SQL", "add an index", "EXPLAIN ANALYZE", "ORM is slow", "too many DB calls", "SELECT \*", "eager loading"

**Primary output:** Optimized queries, index recommendations, ORM refactors.

**Combine with:**

- Caching Strategies — if queries are fast but called too frequently
- Logging & Observability — to measure query performance in production

---

### 7. Debugging Strategies

**Load when user says things like:**
"I can't figure out this bug", "this test keeps failing", "it works locally but not in prod", "flaky test", "intermittent failure", "help me debug", "trace this error", "why is this happening"

**Primary output:** Systematic debugging plan, hypothesis, minimal reproduction.

**Combine with:**

- Logging & Observability — if the issue requires better instrumentation to diagnose
- Testing Strategies — to write a regression test once the bug is found

---

### 8. DOM Security Hardening

**Load when user says things like:**
"XSS vulnerability", "Content Security Policy", "CSP", "innerHTML", "dangerouslySetInnerHTML", "sanitize user input", "DOMPurify", "inline scripts", "eval()", "audit frontend security"

**Primary output:** Secure DOM manipulation code, CSP headers, sanitization wrappers.

**Combine with:**

- React Component Design — when hardening React-specific rendering
- Authentication & Authorization — when the security context includes session/token handling

---

### 9. Error Handling Architecture

**Load when user says things like:**
"standardize error responses", "error middleware", "try/catch everywhere", "RFC 7807", "error classes", "don't swallow errors", "centralize error handling", "crash on programmer error"

**Primary output:** Error class hierarchy, centralized middleware, RFC 7807 response format.

**Combine with:**

- API Design (REST) — always pair when designing API error contracts
- Logging & Observability — for error logging levels and stack trace handling

---

### 10. Event-Driven Design

**Load when user says things like:**
"decouple these services", "message queue", "Kafka", "RabbitMQ", "async workflow", "event sourcing", "dead letter queue", "idempotent consumer", "pub/sub", "event payload design"

**Primary output:** Event schema, producer/consumer design, DLQ strategy.

**Combine with:**

- System Design & Microservices — for broader service boundary decisions
- Logging & Observability — to trace events across services

---

### 11. Frontend Design

**Load when user says things like:**
"design this page", "make this look good", "visual identity", "landing page", "typography", "color palette", "layout", "hero section", "brand feel", "UI aesthetic"

**Primary output:** Design tokens (colors, type, spacing), layout wireframe, visual direction.

**Combine with:**

- React Component Design — when the design needs to be implemented in React
- Frontend Performance Optimization — when the designed page needs to be fast

---

### 12. Git Workflow & Branching

**Load when user says things like:**
"how should I branch", "commit message format", "Conventional Commits", "squash merge", "rebase vs merge", "branch naming", "hotfix process", "PR workflow", "git strategy"

**Primary output:** Branch naming conventions, commit message format, merge strategy.

**Combine with:**

- CI/CD Pipeline Architecture — for aligning branch strategy with pipeline triggers
- Code Review Guidelines — for PR process details

---

### 13. Logging & Observability Standards

**Load when user says things like:**
"add logging", "structured logs", "correlation ID", "trace ID", "log levels", "NDJSON", "observability", "monitoring", "alert on errors", "redact PII from logs", "distributed tracing"

**Primary output:** Logging setup, structured log schema, correlation ID injection, redaction middleware.

**Combine with:**

- Error Handling Architecture — for error-level log decisions
- System Design & Microservices — for cross-service tracing

---

### 14. React Component Design

**Load when user says things like:**
"build a React component", "refactor this component", "it's too big", "extract a hook", "component API", "props interface", "TypeScript component", "shared UI component", "component hierarchy"

**Primary output:** React component with typed props, extracted hooks, clean JSX.

**Combine with:**

- Accessibility UI Design — when the component needs to be keyboard/screen-reader accessible
- State Management Patterns — when the component needs to manage or consume state
- DOM Security Hardening — when the component renders user-supplied content

---

### 15. State Management Patterns

**Load when user says things like:**
"where should this state live", "too many re-renders", "Redux vs Context", "React Query", "SWR", "server state", "global state", "URL state", "filter/search/pagination state", "migrate from Redux"

**Primary output:** State architecture decision, correct layer assignment (URL / server cache / local / global).

**Combine with:**

- React Component Design — for the component that consumes the state
- Frontend Performance Optimization — if re-renders are a performance issue

---

### 16. Theme Factory

**Load when user says things like:**
"apply a theme", "style this document", "make it look professional", "pick a color scheme for this", "theme for slides/report/landing page"

**Primary output:** Applied theme with consistent colors and fonts across the artifact.

**Note:** Requires `themes/` directory and `theme-showcase.pdf` to be present. Always show the showcase first, wait for user selection, then apply. **If these files are not found**, describe the 10 themes in text (name + 2-sentence description each), ask the user to pick one, then apply using the color and font descriptions from this file.

---

### 17. Testing Strategies

**Load when user says things like:**
"write tests for this", "unit test", "integration test", "E2E test", "test pyramid", "TDD", "mock this dependency", "flaky test", "test coverage", "regression test"

**Primary output:** Test suite with unit/integration/E2E split, mocked dependencies, descriptive test names.

**Combine with:**

- Debugging Strategies — when a bug needs a regression test after fixing
- CI/CD Pipeline Architecture — for placing tests correctly in the pipeline

---

### 18. Authentication & Authorization

**Load when user says things like:**
"implement login", "JWT", "OAuth", "OIDC", "SSO", "RBAC", "role-based access", "secure this endpoint", "session management", "refresh token", "HttpOnly cookie", "permission check"

**Primary output:** Auth flow design, token validation logic, RBAC policy, secure cookie config.

**Combine with:**

- API Design (REST) — when securing REST endpoints
- DOM Security Hardening — when auth tokens are handled in the browser

---

### 19. System Design & Microservices

**Load when user says things like:**
"scale this system", "break up the monolith", "microservices", "service boundaries", "domain-driven design", "DDD", "bounded context", "distributed system", "high throughput", "service communication"

**Primary output:** Service boundary map, communication strategy (sync vs. async), data ownership model.

**Combine with:**

- Event-Driven Design — for async cross-service communication
- Logging & Observability — for distributed tracing across services
- Infrastructure as Code — when the architecture needs to be provisioned

---

### 20. Infrastructure as Code (IaC)

**Load when user says things like:**
"Terraform", "Pulumi", "CloudFormation", "provision infrastructure", "multi-environment setup", "IaC", "tag cloud resources", "remote state", "infrastructure pipeline", "state drift"

**Primary output:** IaC modules, resource definitions, remote state config, tagging strategy.

**Combine with:**

- CI/CD Pipeline Architecture — for automated infrastructure provisioning in the pipeline
- Logging & Observability — when provisioning monitoring infrastructure

---

### 21. Frontend Performance Optimization

**Load when user says things like:**
"page is slow", "Core Web Vitals", "LCP", "CLS", "TTI", "bundle size", "lazy load", "code splitting", "image optimization", "WebP", "main thread blocking", "Lighthouse score"

**Primary output:** Performance audit, bundle analysis, lazy loading strategy, image optimization plan.

**Combine with:**

- State Management Patterns — if excessive re-renders are the performance issue
- CI/CD Pipeline Architecture — for adding Lighthouse checks to the pipeline

---

# Agent: Scout

## Tools

- read_file
- search_code
- list_directory

## Instructions

1. Map the project directory structure.
2. Search for files, symbols, and patterns relevant to the task.
3. Read target files to understand context, architecture, and dependencies.
4. Strictly avoid writing, editing, or executing code.

## Output

Return a structured context report containing:

- Relevant file paths and line numbers.
- Brief summaries of file purposes and logic.
- Identified dependencies and entry points.

# Agent: Worker

## Tools

- write_file
- edit_file
- execute_command

## Instructions

1. Analyze the context and requirements provided.
2. Write new code or apply precise diffs to existing files.
3. Execute build, lint, and test commands to verify implementation.
4. Iterate and fix errors if commands fail or tests break.

## Output

Return a structured execution report containing:

- List of created or modified files.
- Command execution logs and exit codes.
- Final status of the task (success/failure).

# Agent: Researcher

## Tools

- web_search
- fetch_url

## Instructions

1. Formulate precise search queries to address the research prompt.
2. Fetch and extract text from high-quality technical sources.
3. Filter out irrelevant information, ads, and non-technical content.
4. Synthesize the extracted data into concise, actionable insights.

## Output

Return a structured research brief containing:

- Direct answers to the research questions.
- Condensed technical summaries.
- List of cited source URLs.

## Quick-reference trigger table

| User mentions...                         | Load skill                   |
| ---------------------------------------- | ---------------------------- |
| slow page / Lighthouse / Core Web Vitals | 21 — Frontend Performance    |
| slow query / N+1 / EXPLAIN               | 6 — DB Query Optimization    |
| slow endpoint + caching                  | 3 — Caching Strategies       |
| login / JWT / OAuth / permissions        | 18 — Auth & Authorization    |
| XSS / innerHTML / CSP                    | 8 — DOM Security             |
| React component / hook / props           | 14 — React Component Design  |
| where state lives / Redux / React Query  | 15 — State Management        |
| new REST endpoint / API design           | 2 — API Design               |
| error responses / try-catch / RFC 7807   | 9 — Error Handling           |
| GitHub Actions / deploy pipeline         | 4 — CI/CD                    |
| Terraform / Pulumi / cloud infra         | 20 — IaC                     |
| microservices / bounded context          | 19 — System Design           |
| Kafka / RabbitMQ / events / pub-sub      | 10 — Event-Driven Design     |
| logs / tracing / correlation ID          | 13 — Logging & Observability |
| git branch / commit message / PR         | 12 — Git Workflow            |
| review this code / PR feedback           | 5 — Code Review              |
| debug / can't find bug / flaky test      | 7 — Debugging                |
| write tests / unit test / TDD            | 17 — Testing                 |
| ARIA / keyboard / screen reader          | 1 — Accessibility            |
| design / layout / color palette          | 11 — Frontend Design         |
| theme / professional style               | 16 — Theme Factory           |
