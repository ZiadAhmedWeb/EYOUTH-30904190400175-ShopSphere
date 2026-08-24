# ShopSphere — Kubernetes Simulation Layer (Task 2)

Two isolated namespaces simulate multi-cloud deployment on the local Docker
Desktop cluster. Each namespace runs the full app stack (frontend pod +
backend pod + services) against the REAL production databases (Supabase
PostgreSQL + MongoDB Atlas).

## Layout

| Namespace         | Pods                          | Services                          |
|-------------------|-------------------------------|-----------------------------------|
| `aws-simulation`  | frontend-pod, backend-pod     | frontend-service, backend-service |
| `gcp-simulation`  | frontend-pod, backend-pod     | frontend-service, backend-service |

Images are built locally (`imagePullPolicy: IfNotPresent`):
- `zeecrumb-backend:sim`   — shared by both namespaces
- `zeecrumb-frontend:aws`  — API base baked to aws forward-port
- `zeecrumb-frontend:gcp`  — API base baked to gcp forward-port

Secrets are NEVER committed. Create them from the local env file:

    kubectl create secret generic backend-secrets -n aws-simulation --from-env-file=Backend/.env
    kubectl create secret generic backend-secrets -n gcp-simulation --from-env-file=Backend/.env

## Deploy

    kubectl apply -f k8s/aws-simulation/
    kubectl apply -f k8s/gcp-simulation/

## Verify isolation

Namespaces scope resources — each side reports its own region marker via
`SIM_REGION` surfaced in `/health`:

    kubectl get pods -n aws-simulation
    kubectl get pods -n gcp-simulation

Port-forward map (host → service):

| Local port | Namespace      | Service           |
|------------|----------------|-------------------|
| 15000      | aws-simulation | frontend-service:80 |
| 15001      | aws-simulation | backend-service:5000|
| 25000      | gcp-simulation | frontend-service:80 |
| 25001      | gcp-simulation | backend-service:5000|

    kubectl port-forward -n aws-simulation svc/frontend-service 15000:80
    kubectl port-forward -n aws-simulation svc/backend-service 15001:5000
    kubectl port-forward -n gcp-simulation svc/frontend-service 25000:80
    kubectl port-forward -n gcp-simulation svc/backend-service 25001:5000

Then:

    curl http://localhost:15001/health   -> "region":"aws-simulation"
    curl http://localhost:25001/health   -> "region":"gcp-simulation"
    curl http://localhost:15000/         -> ZeeCrumb SPA (wired to :15001 api)
    curl http://localhost:25000/         -> ZeeCrumb SPA (wired to :25001 api)
