# Deployment Plan for Kafka on Minikube (T-507)

This task involves deploying a Kafka cluster onto a Minikube environment. We have two primary options for deploying Kafka on Kubernetes: Strimzi or Redpanda. Both are excellent choices, offering Kubernetes-native ways to manage Kafka. For this plan, we will outline the steps using Strimzi, as it is a widely adopted Kafka operator for Kubernetes.

## 1. Prerequisites

-   **Minikube**: A running Minikube cluster.
-   **kubectl**: Command-line tool for controlling Kubernetes clusters.
-   **Helm**: Package manager for Kubernetes.

## 2. Deploying Kafka using Strimzi

Strimzi simplifies the process of running Apache Kafka in a Kubernetes cluster. It provides Kubernetes Operators for managing Kafka components.

### Step 2.1: Install Strimzi Cluster Operator

First, install the Strimzi Cluster Operator into your Kubernetes cluster. This operator will watch for custom resources (like `Kafka` and `KafkaTopic`) and manage the underlying Kafka components.

```bash
# Create a namespace for Strimzi (optional but recommended)
kubectl create namespace kafka

# Install the latest Strimzi Cluster Operator
# You can find the latest release YAML on the Strimzi GitHub releases page
kubectl apply -f https://strimzi.io/install/latest/strimzi-cluster-operator.yaml -n kafka
```

Verify that the Strimzi operator pods are running:

```bash
kubectl get pods -n kafka
```

### Step 2.2: Deploy a Kafka Cluster

Once the operator is running, you can deploy a Kafka cluster by creating a `Kafka` custom resource. A minimal configuration typically includes a Kafka broker, Apache ZooKeeper (which Kafka depends on), and optional Kafka Exporter for metrics.

```yaml
# kafka-cluster.yaml
apiVersion: kafka.strimzi.io/v1beta2
kind: Kafka
metadata:
  name: my-cluster
  namespace: kafka
spec:
  kafka:
    version: 3.6.0 # Specify your desired Kafka version
    replicas: 1 # For Minikube, 1 replica is usually sufficient for testing
    listeners:
      - name: plain
        port: 9092
        type: internal
        tls: false
      - name: external
        port: 9094
        type: nodeport # Use NodePort for external access in Minikube
        tls: false
        configuration:
          brokers:
            - broker: 0
              advertisedHost: <Minikube_IP> # Replace with your Minikube IP (e.g., minikube ip)
    storage:
      type: ephemeral # Ephemeral storage is fine for testing in Minikube
  zookeeper:
    replicas: 1
    storage:
      type: ephemeral
  entityOperator:
    topicOperator: {}
    userOperator: {}
```

Apply this manifest:

```bash
# Before applying, get your Minikube IP: minikube ip
# Replace <Minikube_IP> in the YAML above with the actual IP
kubectl apply -f kafka-cluster.yaml -n kafka
```

Verify that Kafka and ZooKeeper pods are running and ready:

```bash
kubectl get pods -n kafka
```

### Step 2.3: Create Kafka Topics (Optional, but recommended for Dapr Pub/Sub)

You can create Kafka topics using `KafkaTopic` custom resources. For our Dapr Pub/Sub, we will need a `task-events` topic.

```yaml
# kafka-topic-task-events.yaml
apiVersion: kafka.strimzi.io/v1beta2
kind: KafkaTopic
metadata:
  name: task-events
  namespace: kafka
  labels:
    strimzi.io/cluster: my-cluster # Associate with your Kafka cluster
spec:
  partitions: 1
  replicas: 1
  config:
    retention.ms: 604800000 # 7 days
```

Apply this manifest:

```bash
kubectl apply -f kafka-topic-task-events.yaml -n kafka
```

## 3. Dapr Integration Explanation

Once Kafka is deployed and running, Dapr will connect to it using a `pubsub.kafka` component. This component will be configured with the Kafka broker address.

A `pubsub.kafka` component for Dapr would look something like this:

```yaml
# pubsub-kafka.yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub.kafka
spec:
  type: pubsub.kafka
  version: v1
  metadata:
  - name: brokers
    value: "my-cluster-kafka-external-bootstrap.kafka.svc.cluster.local:9094" # Internal service in K8s, or external if NodePort
  - name: consumerGroup
    value: "task-consumers"
  # - name: authRequired
  #   value: "false" # Set to true if Kafka has authentication
  # - name: saslUsername
  # - name: saslPassword
  # - name: saslMechanism
  # - name: caCert
  # - name: clientCert
  # - name: clientKey
auth:
  secretStore: kubernetes
```

**Note**: The `brokers` value should be updated based on how your Kafka cluster is exposed. If using `NodePort`, it would be `<Minikube_IP>:NODE_PORT`. For internal cluster communication, the example above uses the internal Kubernetes service.

This plan details the steps for deploying Kafka (T-507).
