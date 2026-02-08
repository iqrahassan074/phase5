# Phase V Backend Architecture Plan

## 1. Service Overview

### 1.1 Chat API Service
Purpose:
- Primary backend for frontend
- Handles HTTP requests via Dapr Invocation
- Publishes all task-related events

### 1.2 Notification Service
Purpose:
- Subscribes to reminders topic
- Sends notification (log/email placeholder)

### 1.3 Recurring Task Service
Purpose:
- Subscribes to task-events
- Creates next task instance for recurring tasks

### 1.4 Audit Service
Purpose:
- Subscribes to task-events
- Stores immutable audit logs

---

## 2. Communication Model

Frontend → Dapr → Chat API  
Chat API → Dapr Pub/Sub → Kafka  
Kafka → Dapr → Backend Services  

No direct service-to-service calls.

---

## 3. Dapr Components

- pubsub.kafka → Kafka abstraction
- state.postgresql → Task storage
- secretstores.kubernetes → Credentials
- jobs API → Reminder scheduling

---

## 4. Deployment Strategy

### Local
- Minikube
- Dapr installed on cluster
- Kafka via Strimzi or Redpanda

### Cloud
- AKS / GKE / OKE
- Helm-based deployment
- CI/CD pipeline

---

## 5. Reuse
- Helm charts from Phase IV extended
- Frontend remains unchanged