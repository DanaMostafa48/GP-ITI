
provider "aws" {
  region = var.region
}

data "terraform_remote_state" "eks" {
  backend = "local"
  config = {
    path = "../terraform/terraform.tfstate"
  }
}


data "aws_eks_cluster" "cluster" {
  name = data.terraform_remote_state.eks.outputs.cluster_name
}

data "aws_eks_cluster_auth" "cluster" {
  name = data.terraform_remote_state.eks.outputs.cluster_name
}

provider "kubernetes" {
  host                   = data.aws_eks_cluster.cluster.endpoint
  cluster_ca_certificate = base64decode(data.aws_eks_cluster.cluster.certificate_authority.0.data)
  exec {
    api_version = "client.authentication.k8s.io/v1beta1"
    args        = ["eks", "get-token", "--cluster-name", data.aws_eks_cluster.cluster.name]
    command     = "aws"
  }
}


data "kubernetes_service" "jenkins" {
  depends_on = [helm_release.jenkins]
  metadata {
    name      = "jenkins"
    namespace = "jenkins"
  }
}

# Output the Jenkins URL
output "jenkins_url" {
  value = "http://${data.kubernetes_service.jenkins.status.0.load_balancer.0.ingress.0.hostname}:8080"
}
