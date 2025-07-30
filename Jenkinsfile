pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'myapp:latest'
        REGISTRY = 'myregistry.com'
    }

    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'git@github.com:user/repo.git'
            }
        }

        stage('Build') {
            steps {
                sh 'docker build -t $DOCKER_IMAGE .'
            }
        }

        stage('Test') {
            steps {
                sh 'pytest tests/'
            }
        }

        stage('Push Image') {
            steps {
                withDockerRegistry([credentialsId: 'dockerhub-cred', url: "https://$REGISTRY"]) {
                    sh 'docker push $REGISTRY/$DOCKER_IMAGE'
                }
            }
        }

        stage('Deploy') {
            steps {
                sshagent(['deploy-key']) {
                    sh '''
                    ssh user@server "docker pull $REGISTRY/$DOCKER_IMAGE && \
                    docker stop myapp || true && \
                    docker rm myapp || true && \
                    docker run -d --name myapp -p 80:80 $REGISTRY/$DOCKER_IMAGE"
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'Deployment Successful'
        }
        failure {
            echo 'Deployment Failed'
        }
    }
}
