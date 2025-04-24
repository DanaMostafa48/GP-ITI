pipeline {
    agent {
        'jenkins_label'
    }
        label 'jenkins_label' // corrected this line
    }
    environment {
        AWS_ACCESS_KEY_ID     = credentials('AWS_ACCESS_KEY_ID')
        AWS_SECRET_ACCESS_KEY = credentials('AWS_SECRET_ACCESS_KEY')
        AWS_DEFAULT_REGION    = 'us-east-1'
        DOCKER_IMAGE_TAG      = 'latest'
    }

    options {
        skipDefaultCheckout(false)
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {
        stage('Checkout') {
            steps {
                checkout  scm
            }
        }

        stage('Get Terraform Output') {
            steps {
                dir('terraform') {
                    script {
                        sh 'terraform init'

                        env.REGISTRY = sh(
                            script: 'terraform output -raw aws_ecr_repository | cut -d "/" -f1',
                            returnStdout: true
                        ).trim()

                        env.REPOSITORY = sh(
                            script: 'terraform output -raw aws_ecr_repository | cut -d "/" -f2',
                            returnStdout: true
                        ).trim()
                    }
                }
            }
        }

        stage('Build and Push Docker Image') {
            steps {
                dir('nodeapp') {
                    script {
                        sh """
                            aws ecr get-login-password --region ${env.AWS_DEFAULT_REGION} | \
                            docker login --username AWS --password-stdin ${env.REGISTRY}
                        """

                        sh """
                            docker build -t ${env.REGISTRY}/${env.REPOSITORY}:${env.DOCKER_IMAGE_TAG} .
                            docker push ${env.REGISTRY}/${env.REPOSITORY}:${env.DOCKER_IMAGE_TAG}
                        """
                    }
                }
            }
        }
    }
}
