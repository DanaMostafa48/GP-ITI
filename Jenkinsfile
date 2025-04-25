pipeline {
    agent {
        label 'jenkins_slave'
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
                checkout scm
            }
        }

        stage('Verify Tools') {
            steps {
                container('dockerimage'){
                    sh '''
                        echo "=== Versions ==="
                        docker --version
                        aws --version
                    '''
                }
            }
        }

        stage('AWS Configure') {
            steps {
                container('dockerimage'){
                sh '''
                    aws configure set aws_access_key_id "$AWS_ACCESS_KEY_ID"
                    aws configure set aws_secret_access_key "$AWS_SECRET_ACCESS_KEY"
                    aws configure set region $AWS_DEFAULT_REGION
                    aws sts get-caller-identity
                '''
            }
            }
        }

        stage('Get ECR Info') {
            steps {
                container('dockerimage'){
                    script {
                        env.REGISTRY = sh(
                            script: 'aws ecr describe-repositories --query "repositories[0].repositoryUri" --output text | cut -d "/" -f1',
                            returnStdout: true
                        ).trim()

                        env.REPOSITORY = sh(
                            script: 'aws ecr describe-repositories --query "repositories[0].repositoryName" --output text',
                            returnStdout: true
                        ).trim()

                        echo "REGISTRY=${env.REGISTRY}"
                        echo "REPOSITORY=${env.REPOSITORY}"
                    }
            }   }
        }

        stage('Build & Push Docker Image') {
            steps {
                container('dockerimage'){
                    dir('nodeapp') {
                        script {
                            sh """
                                aws ecr get-login-password --region ${AWS_DEFAULT_REGION} | \
                                docker login --username AWS --password-stdin ${env.REGISTRY}
                            """

                            sh """
                                docker build -t ${env.REGISTRY}/${env.REPOSITORY}:${DOCKER_IMAGE_TAG} .
                                docker push ${env.REGISTRY}/${env.REPOSITORY}:${DOCKER_IMAGE_TAG}
                            """
                        }
                    }
                }
            }
        }
    }
}