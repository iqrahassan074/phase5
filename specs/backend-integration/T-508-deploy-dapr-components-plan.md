# Deployment Plan for Dapr Components on Minikube (T-508)

This task outlines the deployment of Dapr and its required components onto a Minikube environment.

## 1. Prerequisites

-   **Minikube**: A running Minikube cluster.
-   **kubectl**: Command-line tool for controlling Kubernetes clusters.
-   **Dapr CLI**: Installed and configured locally.

## 2. Install Dapr on Minikube

First, you need to initialize Dapr on your Kubernetes cluster (Minikube). This will install the Dapr control plane (sidecar injector, placement service, operator, etc.) into your cluster.

### Step 2.1: Install Dapr CLI (if not already installed)

Follow the official Dapr documentation for installing the Dapr CLI on your operating system:
[https://docs.dapr.io/getting-started/install-dapr-cli/](https://docs.dapr.io/getting-started/install-dapr-cli/)

### Step 2.2: Initialize Dapr on Minikube

Once the Dapr CLI is installed, initialize Dapr on your Minikube cluster:

```bash
dapr init -k
```

This command deploys the Dapr control plane to the `dapr-system` namespace in your Kubernetes cluster. Verify the Dapr control plane pods are running:

```bash
kubectl get pods -n dapr-system
```

## 3. Deploy Dapr Components

According to the `sp.plan`, we need `pubsub.kafka`, `state.postgresql`, and `secretstores.kubernetes`. These are configured as Dapr components using YAML manifests.

### Step 3.1: Kafka Pub/Sub Component (`pubsub.kafka`)

This component connects Dapr to your Kafka cluster. Ensure your Kafka cluster (from T-507) is running before applying this.

```yaml
# pubsub-kafka.yaml (assuming Kafka is deployed in the 'kafka' namespace, named 'my-cluster')
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub.kafka
  namespace: default # Or the namespace where your Dapr-enabled applications will run
spec:
  type: pubsub.kafka
  version: v1
  metadata:
  - name: brokers
    value: "my-cluster-kafka-external-bootstrap.kafka.svc.cluster.local:9094" # Internal service in K8s
  - name: consumerGroup
    value: "task-consumers"
  - name: authRequired
    value: "false" # Set to true if Kafka has authentication
  # You can add more metadata for SASL, TLS, etc., if needed
```
**Note**: The `brokers` value should match the internal Kubernetes service name for your Kafka cluster. If you used external access, adjust accordingly.

Apply this manifest:

```bash
kubectl apply -f pubsub-kafka.yaml
```

### Step 3.2: PostgreSQL State Store Component (`state.postgresql`)

This component allows Dapr-enabled applications to use PostgreSQL as a state store. You will need a PostgreSQL database deployed in your Minikube cluster (e.g., using a Helm chart) or an external instance.

```yaml
# state-postgresql.yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: state.postgresql
  namespace: default # Or the namespace where your Dapr-enabled applications will run
spec:
  type: state.postgresql
  version: v1
  metadata:
  - name: connectionString
    value: "host=<POSTGRES_HOST>;port=5432;user=<POSTGRES_USER>;password=<POSTGRES_PASSWORD>;database=<POSTGRES_DB>"
  # Replace <POSTGRES_HOST>, <POSTGRES_USER>, <POSTGRES_PASSWORD>, <POSTGRES_DB> with actual values
  # Ideally, sensitive information like password should be retrieved from a secret store.
auth:
  secretStore: kubernetes # This references the Kubernetes secret store configured below
```

**Note**: You will need to deploy a PostgreSQL database first and populate the connection string. For Minikube, you can use a simple PostgreSQL Helm chart.

Apply this manifest:

```bash
kubectl apply -f state-postgresql.yaml
```

### Step 3.3: Kubernetes Secret Store Component (`secretstores.kubernetes`)

This component allows Dapr-enabled applications to retrieve secrets from Kubernetes secrets. This is crucial for securely handling credentials for other components like the PostgreSQL state store.

```yaml
# secretstores-kubernetes.yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: secretstores.kubernetes
  namespace: default # Or the namespace where your Dapr-enabled applications will run
spec:
  type: secretstores.kubernetes
  version: v1
```

Apply this manifest:

```bash
kubectl apply -f secretstores-kubernetes.yaml
```

## 4. Dapr Jobs API Interaction

As discussed in T-503, the Dapr Jobs API is used for scheduling reminders. While the Python SDK's direct methods for this were not fully available or documented at the time of implementation, the conceptual interaction remains: an application requests Dapr to schedule a job, and Dapr's scheduler service handles the actual timing and triggering. The placeholder in `main.py` will be updated once definitive SDK support is present.

This plan details the steps for deploying Dapr components (T-508).
