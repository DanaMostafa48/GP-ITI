# 🚀 Part 1 : Infrastructure Overview and Module Breakdown

## Overview 🛠️

This setup provisions the core cloud infrastructure on AWS using modular Terraform components. It features a secure network architecture, a production-grade EKS cluster, and a remote backend for managing Terraform state. Each element is designed to be reusable, scalable, and version-controlled to support long-term maintainability.

This infrastructure acts as the backbone for integrating CI/CD tools such as Jenkins, ArgoCD, and the External Secrets Operator, enabling secure and automated application deployments.

---

## Modules 🧩

### `network` Module 🌐

This module provisions the networking components of the infrastructure:

- **VPC**: A Virtual Private Cloud to isolate and secure the environment.
- **Subnets**:
    - 3 **public** subnets across 3 AZs for external resources.
    - 3 **private** subnets for internal resources like EKS node groups.
- **NAT Gateway**: Provides internet access to resources in private subnets.
- **Internet Gateway**: Allows public subnets to access the internet.
- **Route Tables**: Configures routes between the subnets and the internet.

### `eks` Module 🛠️

This module provisions the Amazon Elastic Kubernetes Service (EKS) cluster and related resources:

- **EKS Control Plane**: The API server and management layer for Kubernetes.
- **EKS Node Groups**: EC2 instances running in private subnets to manage containerized workloads.
- **IAM Roles and Policies**: Grants necessary permissions to EKS and EC2 nodes for interaction with AWS services.

### `ebs` Module 💾

The **EBS (Elastic Block Store)** module provisions an Amazon EBS volume to provide persistent storage for applications running within the **Amazon EKS** cluster. This ensures that the state of the application or database is stored securely and can survive pod restarts. The module creates an EBS volume with specified storage size and type. The volume can be attached to EKS worker nodes or specific pods within the Kubernetes cluster for persistent data storage.

### `ecr` Module 📦

The **ECR (Elastic Container Registry)** module provisions an Amazon ECR repository for storing Docker images. The repository allows you to securely store and manage Docker images that can be used within the **EKS** cluster. Once an image is pushed to the ECR repository, it can be pulled by Kubernetes pods for deployment, supporting the CI/CD pipeline by storing containerized application images.

### `roles` Module 🔑

This module provisions **IAM roles** and **policies** required for controlling access to AWS resources, particularly for integration with the **External Secrets Operator**.

- **External Secrets Role**: An IAM role with a trust policy that allows the External Secrets Operator service account to assume the role with web identity via the OIDC provider.
- **External Secrets Policy**: An IAM policy granting the necessary permissions for the External Secrets Operator to interact with AWS Secrets Manager and retrieve secrets.
- **Policy Attachment**: This attaches the policy to the IAM role to allow the role to perform the required actions on AWS Secrets Manager.

### `secret_manager` Module 🔒

This module integrates **AWS Secrets Manager** to securely manage and store sensitive information:

- **Secrets**: The module stores database credentials, Redis credentials, or any other secrets required by the Node.js app.
- **IAM Permissions**: Roles and policies are defined to allow the Kubernetes pods to access these secrets securely.

---

## Setup Instructions ⚙️

### Prerequisites 🔑

Before running Terraform, ensure you have the following:

- **AWS Account**: Access to provision AWS resources in your AWS account.
- **Terraform**: Installed locally or in a CI/CD pipeline. You can download Terraform from here.
- **AWS CLI**: Installed and configured with the correct credentials. Run `aws configure` to set up your AWS CLI if you haven’t already.
- **IAM Permissions**: Ensure your IAM user has permissions to create VPCs, subnets, EKS clusters, and related resources.
- **Git**: Installed for cloning the repository.

---

### Step-by-Step Setup 📝

### 1. Clone the Repository 🔄

Clone this repository to your local machine:

```bash

git clone <https://github.com/DanaMostafa48/GP-ITI>
cd GP-ITI/terraform

```

### 2. Initialize Terraform 🔧

Initialize the Terraform working directory to download necessary provider plugins:

```bash

terraform init

```

### 3. Apply the Terraform Configuration 🚀

Provision the infrastructure by applying the configuration:

```bash

terraform apply

```

Terraform will prompt for confirmation. Type `yes` to proceed.

### **4. Update kubeconfig to connect to your EKS cluster**

```bash

aws eks --region us-east-1 update-kubeconfig --name my_eks

```

### 5. Check the cluster nodes

```bash

kubectl get nodes

```

This verifies that your local `kubectl` is correctly connected to your EKS cluster and can communicate with the worker nodes. It's a great way to confirm the cluster is active and ready before deploying anything like Jenkins with Helm.

---

## Key Resources Provisioned 🌍

This Terraform configuration provisions the following AWS resources:

- **VPC**: A private network for your infrastructure.
- **Subnets**: 3 public and 3 private subnets across 3 Availability Zones for high availability.
- **EKS Cluster**: A managed Kubernetes cluster with private node groups.
- **NAT Gateway**: Enables internet access for resources in private subnets.
- **Internet Gateway**: Allows public subnets to access the internet.
- **Route Tables**: Manages routing between subnets and the internet.
- **IAM Roles**: Roles for EKS and EC2 node groups to interact with other AWS services.
- **Secrets Manager**: Stores sensitive data like database credentials and Redis configurations.

# 🚀 Part 2: Deploy Jenkins on EKS with Helm (via Terraform)

## Overview 🛠️

This section automates the deployment of Jenkins, a widely used open-source automation server, onto the EKS cluster provisioned earlier. Using Terraform's Helm provider, the official Jenkins Helm chart is configured and installed with custom values to expose Jenkins externally, configure volumes, and pre-install essential plugins.


---

## 🔧 What Each File Does

- **`helm_release.tf`**: Declares the Jenkins Helm release, referencing `values.yaml` for custom settings.
- **`kubernetes.tf`**: Configures the Kubernetes provider using EKS cluster data.
- **`values.yaml`**: Contains Jenkins settings like admin credentials, plugins, service type, and resource limits.
- **`versions.tf`**: Sets required Terraform and provider versions to ensure compatibility.

---

## 🛠️ Prerequisites

- EKS cluster already provisioned (from Part 1).
- AWS CLI configured (`aws configure`).
- `kubectl` installed and configured.
- `terraform` installed.
- `helm` installed.

---

## 🚀 Deployment Steps

### **1.Navigate to the `helm/` directory**

```bash

cd helm

```

### **2.Start Minikube**

```bash

minikube start

```

### 3.Install Jenkins with Helm

```bash

helm install jenkins jenkins/jenkins -f values.yaml --namespace jenkins --create-namespace

```

### **4.Verify Jenkins pods are running**

```bash

kubectl get pods -n jenkins

```

### **5.Port-forward Jenkins to access the UI**

```bash

kubectl --namespace jenkins port-forward svc/jenkins 8080:8080

```

### **6.Retrieve Jenkins admin password**

```bash

kubectl get secret -n jenkins jenkins -o jsonpath="{.data.jenkins-admin-password}" | base64 --decode

```

### **Log into Jenkins UI**

Visit [http://localhost:8080](http://localhost:8080/) and log in with:

- **Username**: `user` (from `values.yaml`)
- **Password**: value from step 6

# 🚀 Part 3: Kubernetes Deployment Guide: Node.js + MySQL + Redis on AWS EKS

## Overview 🛠️

You're deploying a **full-stack application** with:

- A **Node.js API**
- A **MySQL database**
- A **Redis cache**

All deployed to an **AWS EKS** cluster using **Kubernetes** and managed declaratively with **Kustomize**.

Your **secrets (passwords, credentials)** live in **AWS Secrets Manager**, and are securely pulled into the cluster using the **External Secrets Operator (ESO)**.

---

## ✅ Step 1: Enable Kubernetes to Access AWS Secrets Manager 🔐

**Purpose:** Let the cluster talk to **AWS Secrets Manager**.

### 🔐 **Secrets Management**

The goal is to securely manage sensitive information like passwords and API keys without hardcoding them into your Kubernetes resources.

We’ll set up a system where:

> Kubernetes pulls secrets from AWS Secrets Manager and turns them into Kubernetes Secrets using a tool called External Secrets Operator (ESO).
> 

### Breakdown:

1. **Terraform Configuration**:
    - **`mysql_secrets.tf`** and **`redis_secrets.tf`** are used to create the secrets in **AWS Secrets Manager**. These files define the credentials for MySQL and Redis, which will be securely stored in AWS.
    - **`secret_manager.tf`** (in `terraform/roles/`) creates an **IAM Role** in AWS that allows Kubernetes to access those secrets. The IAM Role grants permissions to read secrets from AWS Secrets Manager.
    - **`variables.tf`** and **`outputs.tf`** are helper files that provide reusable variables and outputs, including the IAM Role ARN, for further use in Kubernetes configurations.
2. **Kubernetes Configuration**:
    - **`service-account.yaml`**: This file creates a Kubernetes **ServiceAccount** and links it to the IAM role, which allows pods to use AWS credentials securely through **IRSA** (IAM Roles for Service Accounts).
    - **`secret-store.yaml`**: It tells ESO to use AWS Secrets Manager as the source for secrets and authenticate using the ServiceAccount created earlier.
    - **`external-secrets-mysql.yaml` & `external-secrets-redis.yaml`**: These files instruct ESO to fetch the MySQL and Redis secrets from AWS Secrets Manager and store them as Kubernetes secrets (e.g., `mysql-credentials` and `redis-credentials`).

---

## ✅ Step 2: Fetch Secrets from AWS into Kubernetes 📥

**Purpose:** Pull credentials for MySQL and Redis from **AWS Secrets Manager** and store them as Kubernetes secrets.

- **`external-secrets-mysql.yaml`**
    
    Defines an **ExternalSecret** that pulls the **MySQL password** from **AWS Secrets Manager** and creates a Kubernetes Secret called `mysql-credentials`.
    
- **`external-secrets-redis.yaml`**
    
    Does the same, but for the **Redis password**, saved as `redis-credentials`.
    

These secrets are automatically kept in sync with AWS, so updates in Secrets Manager get reflected in the cluster.

---

## ✅ Step 3: Set Up Persistent Storage for MySQL 💾

**Purpose:** Ensure MySQL keeps data even if the pod restarts.

- **`mysql-pv.yaml`**
    
    Defines a **PersistentVolume**: a piece of disk on the host/node reserved for MySQL data.
    
- **`mysql-pvc.yaml`**
    
    Defines a **PersistentVolumeClaim**: a request from the MySQL pod asking to use storage.
    

This ensures MySQL doesn’t lose data across restarts.

---

## ✅ Step 4: Deploy the MySQL Database 🛢️

**Purpose:** Run MySQL in the cluster and connect it to the PVC and credentials.

- **`mysql-service.yaml`**
    
    Creates a **ClusterIP service** so that other pods (like the Node.js app) can talk to MySQL using `mysql:3306`.
    
- **`mysql-statefulset.yaml`**
    
    Deploys MySQL using a **StatefulSet** (ideal for databases), mounts the PVC, and loads credentials from the secret `mysql-credentials`.
    

This sets up a persistent, secure MySQL database that other services can access.

---

## ✅ Step 5: Deploy Redis ⚡

**Purpose:** Launch Redis so it’s accessible to the Node.js app.

- **`redis-deployment.yaml`**
    
    Deploys a Redis pod. It uses a password pulled via External Secrets Operator from **AWS Secrets Manager** and stored in the Kubernetes Secret `redis-credentials`. This secret is not referenced directly in the Redis deployment, assuming default unauthenticated setup, but is used securely in the Node.js app instead.
    
- **`redis-service.yaml`**
    
    Creates a **ClusterIP service** named `redis` so other pods can access it via `redis:6379`.
    

Redis will act as a cache layer for your Node.js application.

## ✅ Step 6: Deploy the Node.js Application 🌐

**Purpose:** Launch the app and give it access to MySQL and Redis.

- **Key Concepts:**
    - **Node.js Container**: The Node.js application is deployed in a container, with the Docker image being pulled from a registry (e.g., **Amazon ECR** or **Docker Hub**).
        
        **Snippet**: Pulling the Docker image from **Amazon ECR**:
        
        ```yaml
        image: <aws_account_id>.dkr.ecr.<region>.amazonaws.com/my-node-app:latest
        
        ```
        
    - **Environment Variables**:
        - **DB_HOST**: Points to the **MySQL service** inside the Kubernetes cluster (usually `mysql`).
        - **REDIS_HOST**: Points to the **Redis service** inside the Kubernetes cluster (usually `redis`).
        - These environment variables are essential for the app to connect to MySQL and Redis.
        
        **Snippet**: Setting environment variables for MySQL and Redis connection:
        
        ```yaml
        env:
          - name: DB_HOST
            value: "mysql"  # MySQL service within Kubernetes cluster
          - name: DB_PORT
            value: "3306"
          - name: REDIS_HOST
            value: "redis"  # Redis service within Kubernetes cluster
          - name: REDIS_PORT
            value: "6379"
        
        ```
        
- **Secrets Management**:
    - **Credentials** (like MySQL and Redis passwords) are securely injected into the Node.js application using **Kubernetes secrets**, which are managed by the **External Secrets Operator**. These secrets are synchronized with **AWS Secrets Manager**.
        
        **Snippet**: Fetching secrets from Kubernetes for MySQL and Redis credentials:
        
        ```yaml
        env:
          - name: MYSQL_PASSWORD
            valueFrom:
              secretKeyRef:
                name: mysql-credentials  # The secret created from ExternalSecretsOperator
                key: password
          - name: REDIS_PASSWORD
            valueFrom:
              secretKeyRef:
                name: redis-credentials  # The secret created from ExternalSecretsOperator
                key: password
        
        ```
        
    - The application fetches the credentials via environment variables, ensuring **secure access** to MySQL and Redis.
- **Service Exposure**:
    - The app is exposed to the internet via a **LoadBalancer** service on **port 80**, which forwards traffic to the internal app **port 3000**.
        
        **Snippet**: Exposing the Node.js app through a LoadBalancer:
        
        ```yaml
        apiVersion: v1
        kind: Service
        metadata:
          name: node-app-service
        spec:
          selector:
            app: node-app
          ports:
            - protocol: TCP
              port: 80  # Public-facing port
              targetPort: 3000  # Internal app port
          type: LoadBalancer
        
        ```
        
    - This makes the **Node.js API** publicly accessible for external communication.

🔗 **Public-Facing API**: The Node.js service is now accessible from outside the cluster, handling requests from users or other services.

---

## ✅ Step 7: Use Kustomize to Manage All Resources 🧩

**Purpose:** Deploy all files in one clean, modular way.

### 🛠️ What is Kustomize?

**Kustomize** is a tool built into `kubectl` that **lets you group, customize, and deploy Kubernetes resources without editing the original files**.

Instead of doing:

```bash
kubectl apply -f file1.yaml
kubectl apply -f file2.yaml
kubectl apply -f file3.yaml

```

You just write one file — **`kustomization.yaml`** — and run:

```bash
kubectl apply -k .

```

### 📄 Example `kustomization.yaml` file

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - service-account.yaml
  - secret-store.yaml
  - external-secrets-mysql.yaml
  - external-secrets-redis.yaml
  - mysql-pv.yaml
  - mysql-pvc.yaml
  - mysql-statefulset.yaml
  - mysql-service.yaml
  - redis-deployment.yaml
  - redis-service.yaml
  - dep-node.yaml
  - service-node.yaml

```

### 💡 Why use Kustomize?

- Keeps your deployment modular and organized.
- Lets you reuse and overlay configs across environments (e.g., dev, staging, prod).
- Supports config changes without editing original manifests.

🔗 It’s the tool that brings **structure and manageability** to your Kubernetes setup.

---

---

