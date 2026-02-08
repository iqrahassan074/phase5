# Deployment Plan for Chat API Service to Minikube (T-509)

This plan details the steps to deploy the `chat-api` FastAPI service to Minikube, with Dapr sidecar injection.

## 1. Prerequisites

-   **Minikube**: A running Minikube cluster.
-   **kubectl**: Command-line tool for controlling Kubernetes clusters.
-   **Docker**: Installed and running (Minikube uses its own Docker daemon).
-   **Dapr Control Plane**: Dapr initialized on your Minikube cluster (as per T-508).
-   **Kafka and Dapr Components**: Kafka and Dapr components (`pubsub.kafka`, `state.postgresql`, `secretstores.kubernetes`) deployed to Minikube (as per T-507 and T-508).

## 2. Build and Load Docker Image

Minikube runs its own Docker daemon. To make your locally built image available to Minikube, you need to either build it directly within the Minikube's Docker environment or push it to a registry that Minikube can access. Building directly in Minikube's daemon is simpler for local development.

### Step 2.1: Point Docker to Minikube's Daemon

```bash
eval $(minikube -p minikube docker-env)
```
This command configures your local Docker client to communicate with the Docker daemon inside the Minikube virtual machine.

### Step 2.2: Build the Docker Image

Navigate to the `backend/chat-api` directory (where your `Dockerfile` and `main.py` are located) and build the Docker image:

```bash
cd backend/chat-api
docker build -t chat-api .
cd ../.. # Go back to project root
```
The `-t chat-api` tags the image with the name `chat-api`, which matches the `image` field in `chat-api-deployment.yaml`.

## 3. Apply Kubernetes Manifests

Apply the Kubernetes Deployment and Service manifests you created for the `chat-api` service.

```bash
kubectl apply -f backend/chat-api/k8s/chat-api-deployment.yaml
```

## 4. Verify Deployment and Dapr Sidecar Injection

Check if the `chat-api` pod is running and if the Dapr sidecar has been injected successfully. A Dapr-enabled pod will show two containers (`chat-api` and `daprd`).

```bash
kubectl get pods
kubectl get deployment chat-api
```

You should see output similar to this, showing `2/2` READY containers:
```
NAME                          READY   STATUS    RESTARTS   AGE
chat-api-<pod-hash>           2/2     Running   0          Xm
```

You can also check the logs of the Dapr sidecar:

```bash
kubectl logs <chat-api-pod-name> -c daprd
```

## 5. Invoke the Chat API Service via Dapr

Once deployed, you can interact with the `chat-api` service through Dapr's service invocation. Since the `chat-api` service is now Dapr-enabled, other Dapr-enabled applications can invoke it using its `app-id` (`chat-api` in this case).

### Example: Invoking an endpoint from another Dapr-enabled application (e.g., from your frontend if it were Dapr-enabled)

A Dapr-enabled frontend would call `chat-api` using the Dapr sidecar. For example, using `curl` from within a Dapr-enabled pod or from your local machine (if port-forwarding is set up):

```bash
# Example using curl to simulate an invocation
# This assumes you have port-forwarded Dapr's HTTP port (3500)
# to your local machine, or are running this from another Dapr-enabled app.

# Create a task
curl -X POST http://localhost:3500/v1.0/invoke/chat-api/method/tasks 
  -H "Content-Type: application/json" 
  -d '{ "title": "Test Task", "description": "This is a test task from Dapr invocation", "priority": "HIGH" }'

# Get tasks
curl http://localhost:3500/v1.0/invoke/chat-api/method/tasks
```

This plan details the steps for deploying services to Minikube (T-509).
