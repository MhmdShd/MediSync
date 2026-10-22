<!--
Sync Impact Report
==================
Version change: 0.0.0 → 1.0.0 (initial ratification)
Modified principles: N/A (all new)
Added sections:
  - Core Principles (4 principles)
  - Performance Standards
  - Development Workflow
  - Governance
Removed sections: None
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ aligned (Constitution Check section generic)
  - .specify/templates/spec-template.md ✅ aligned (success criteria support perf gates)
  - .specify/templates/tasks-template.md ✅ aligned (test phases present)
Follow-up TODOs: None
-->

# MediSync Constitution

## Core Principles

### I. Code Quality

All production code MUST meet these standards:

- Functions MUST have a single, clear responsibility
- No function MUST exceed 40 lines; extract when approaching limit
- All public APIs MUST use strict type annotations (no `any` types)
- Dead code MUST be removed immediately — no commented-out blocks
- Naming MUST be descriptive and domain-specific (e.g., `patientRecord`
  not `data`, `appointmentSlot` not `item`)
- Linting and formatting MUST pass before merge — zero warnings policy
- Dependencies MUST be explicitly justified; no unused packages

### II. Testing Standards (NON-NEGOTIABLE)

All features MUST ship with adequate test coverage:

- Unit tests MUST cover every public function and edge case
- Integration tests MUST verify cross-module interactions and data flow
- Contract tests MUST validate API boundaries between services
- Test names MUST describe behavior, not implementation
  (e.g., `rejects expired appointment` not `test_validate_date`)
- Mocking MUST be limited to external services only — use real
  implementations for internal dependencies
- Minimum 80% line coverage for new code; critical paths MUST reach 95%
- Tests MUST run in under 60 seconds for unit suite, under 5 minutes
  for full suite

### III. User Experience Consistency

All user-facing interfaces MUST maintain consistency:

- UI components MUST follow a shared design system with documented tokens
  (colors, spacing, typography)
- Error messages MUST be human-readable, actionable, and consistent in
  tone across all surfaces
- Loading states MUST be explicit — no blank screens or unexplained waits
- Navigation patterns MUST be predictable; same action = same behavior
  everywhere
- Accessibility MUST meet WCAG 2.1 AA as minimum; form inputs MUST have
  labels, images MUST have alt text
- Responsive layouts MUST function on viewports from 320px to 2560px
- User feedback (success, error, progress) MUST appear within 200ms of
  action

### IV. Performance Requirements

All components MUST meet these performance gates:

- API responses MUST complete within 200ms at p95 under normal load
- Page initial load MUST achieve Largest Contentful Paint (LCP) under
  2.5 seconds
- Client-side interactions MUST respond within 100ms (input latency)
- Database queries MUST use indexed lookups; full table scans are
  prohibited in production
- Memory usage MUST remain stable under sustained load — no unbounded
  growth
- Bundle size increases over 10KB MUST be justified and approved
- Background tasks MUST not block the main thread / request path

## Performance Standards

Quantitative gates enforced at CI and review:

| Metric | Target | Measurement |
|--------|--------|-------------|
| API p95 latency | < 200ms | Load test suite |
| API p99 latency | < 500ms | Load test suite |
| LCP (initial load) | < 2.5s | Lighthouse CI |
| First Input Delay | < 100ms | Lighthouse CI |
| Cumulative Layout Shift | < 0.1 | Lighthouse CI |
| Unit test suite | < 60s | CI pipeline |
| Full test suite | < 5min | CI pipeline |
| JS bundle (gzipped) | < 200KB | Build output |

Regressions beyond these thresholds MUST block merge. Exceptions require
written justification in the PR description and approval from two reviewers.

## Development Workflow

### Code Review

- Every change MUST be reviewed by at least one other developer
- Reviews MUST verify compliance with all four core principles
- Reviewers MUST run the test suite locally before approving

### Quality Gates (CI Pipeline)

All of these MUST pass before merge:

1. Linting and formatting (zero warnings)
2. Type checking (strict mode, zero errors)
3. Unit tests (100% pass, coverage threshold met)
4. Integration tests (100% pass)
5. Performance benchmarks (no regressions beyond thresholds)
6. Accessibility audit (WCAG 2.1 AA compliance)

### Branch Strategy

- Feature branches MUST branch from `main`
- Branch names MUST follow pattern: `###-feature-name`
- Commits MUST be atomic and descriptive
- Squash merge to `main` after approval

## Governance

This constitution supersedes all other development practices for the
MediSync project. Compliance is mandatory, not advisory.

### Amendment Process

1. Propose amendment as a PR modifying this file
2. Require approval from at least two core contributors
3. Include migration plan for existing code if principle changes
4. Update version following semantic versioning (below)
5. Propagate changes to dependent templates

### Versioning Policy

- **MAJOR**: Principle removed, redefined, or made incompatible
- **MINOR**: New principle added, existing principle materially expanded
- **PATCH**: Clarification, wording fix, non-semantic refinement

### Compliance Review

- All PRs MUST include a constitution compliance checklist
- Quarterly audit of codebase against current principles
- Non-compliance discovered post-merge MUST be tracked as tech debt
  with a remediation deadline

**Version**: 1.0.0 | **Ratified**: 2026-05-26 | **Last Amended**: 2026-05-26
