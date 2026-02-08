---
id: 2
title: Project Constitution
stage: constitution
date_iso: 2026-02-08
surface: agent
model: claude
feature: none
branch: main
user: user
command: "sp.constitution   # Phase V Constitution – Backend Attachment Only

## Core Rule
Frontend UI is FINAL and must NOT be modified.
All work in Phase V is limited to backend, infrastructure,
and cloud-native integration.

## Development Discipline
- Spec-Driven Development is mandatory.
- No code without a Task ID.
- No architecture changes without updating speckit.plan.

## Architectural Principles
- Event-driven architecture is required.
- Kafka-compatible messaging via Dapr Pub/Sub ONLY.
- Frontend must remain backend-agnostic.
- Backend communicates with frontend via Dapr Service Invocation.

## Technology Constraints
- Backend: FastAPI
- Runtime abstraction: Dapr
- Messaging: Kafka (Strimzi or Redpanda)
- Orchestration: Kubernetes
- Deployment: Helm charts (reuse Phase IV)
- CI/CD: GitHub Actions

## Scope Boundaries
- No frontend UI generation or modification.
- No direct Kafka clients in application code.
- No direct DB access without Dapr state store.
- No polling-based cron logic.

## Acceptance Philosophy
- Correct architecture > feature completeness.
- Partial implementation is acceptable if specs are complete."
labels: ["constitution", "project-rules"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files_yaml: []
tests_yaml: []
prompt_text: "sp.constitution   # Phase V Constitution – Backend Attachment Only

## Core Rule
Frontend UI is FINAL and must NOT be modified.
All work in Phase V is limited to backend, infrastructure,
and cloud-native integration.

## Development Discipline
- Spec-Driven Development is mandatory.
- No code without a Task ID.
- No architecture changes without updating speckit.plan.

## Architectural Principles
- Event-driven architecture is required.
- Kafka-compatible messaging via Dapr Pub/Sub ONLY.
- Frontend must remain backend-agnostic.
- Backend communicates with frontend via Dapr Service Invocation.

## Technology Constraints
- Backend: FastAPI
- Runtime abstraction: Dapr
- Messaging: Kafka (Strimzi or Redpanda)
- Orchestration: Kubernetes
- Deployment: Helm charts (reuse Phase IV)
- CI/CD: GitHub Actions

## Scope Boundaries
- No frontend UI generation or modification.
- No direct Kafka clients in application code.
- No direct DB access without Dapr state store.
- No polling-based cron logic.

## Acceptance Philosophy
- Correct architecture > feature completeness.
- Partial implementation is acceptable if specs are complete."
response_text: "Constitution acknowledged and saved. I will adhere to these rules for all subsequent work. What is our first task?"
outcome: "Constitution saved to agent's memory."
evaluation: "Agent correctly identified the input as a project constitution and saved it for future reference."
---