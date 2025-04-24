# Copyright (c) HashiCorp, Inc.
# SPDX-License-Identifier: MPL-2.0

provider "helm" {
  kubernetes {
    host                   = data.aws_eks_cluster.cluster.endpoint
    cluster_ca_certificate = base64decode(data.aws_eks_cluster.cluster.certificate_authority.0.data)
    exec {
      api_version = "client.authentication.k8s.io/v1beta1"
      args        = ["eks", "get-token", "--cluster-name", data.aws_eks_cluster.cluster.name]
      command     = "aws"
    }
  }
}

resource "helm_release" "jenkins" {
  name       = "jenkins"
  repository = "https://charts.jenkins.io"
  chart      = "jenkins"
  namespace  = "jenkins"
  create_namespace = true
  values = [
    file("/nginx-values.yaml")
  ]
#   set {
#     name  = "controller.serviceType"
#     value = "LoadBalancer"
#   }

#   set {
#     name  = "controller.servicePort"
#     value = "8080"
#   }

#   set {
#     name  = "controller.serviceTargetPort"
#     value = "8080"
#   }

#   set {
#     name  = "persistence.storageClass"
#     value = "gp2"
#   }

#   set {
#     name  = "persistence.size"
#     value = "8Gi"
#   }
#   set {
#     name  = "controller.admin.username"
#     value = "admin"
#   }

#   set {
#     name  = "controller.admin.password"
#     value = ""  
#   }

#   set {
#     name  = "controller.install.plugins"
#     value = "{kubernetes:1.30.1,workflow-aggregator:2.6,git:4.8.2,configuration-as-code:1.52}"
#   }

 }