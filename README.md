Phase V – Backend Integration

Todo Chatbot (Advanced Phase)

Overview

Phase V implements a cloud-native backend and attaches it to an existing frontend.
The frontend is treated as final and unchanged; all work in this phase focuses on backend services, eventing, and deployment.

Goals

Attach backend APIs to the frontend

Implement advanced task logic

Use event-driven microservices

Deploy on Kubernetes (Minikube)

Architecture

Frontend → Backend via Dapr service invocation

Backend services communicate via Kafka events

All services are stateless and Kubernetes-ready

Backend Services

Chat API – Handles task APIs and publishes events

Notification Service – Processes reminder events

Recurring Task Service – Manages recurring tasks

Audit Service – Stores task activity logs

Features

Task CRUD operations

Priorities, due dates, tags

Reminders

Recurring tasks

Event-based audit logging

Tech Stack

FastAPI

Dapr

Kafka

Kubernetes (Minikube)

Helm

Deployment (Local)
minikube start
dapr init -k
helm install kafka ./charts/kafka
helm install backend ./charts/backend

Spec-Driven Workflow

Constitution

Specification

Plan

Tasks

Implementation

All backend work follows these specs.

Result

Phase V delivers a scalable, event-driven backend cleanly attached to the frontend and ready for cloud deployment.
