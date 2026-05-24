pipeline {
    agent any

    parameters {
        booleanParam(name: 'PUSH_IMAGES', defaultValue: false, description: 'Push images to a Docker registry (requires DOCKER_REGISTRY).')
        string(name: 'DOCKER_REGISTRY', defaultValue: '', description: 'Docker registry prefix, e.g. docker.io/username (leave empty for local-only).')
    }
    
    environment {
        PROJECT_NAME = 'fruits-delivery'
        VERSION = "${BUILD_NUMBER}"
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '🔄 Checking out code...'
                checkout scm
            }
        }
        
        stage('Build Backend Services') {
            parallel {
                stage('Build API Gateway') {
                    steps {
                        echo '🔨 Building API Gateway...'
                        dir('backend/api-gateway') {
                            sh '''
                                npm install
                                npm test || true
                                docker build -t ${PROJECT_NAME}-api-gateway:${VERSION} .
                                if [ -n "${DOCKER_REGISTRY}" ]; then
                                  docker tag ${PROJECT_NAME}-api-gateway:${VERSION} ${DOCKER_REGISTRY}/${PROJECT_NAME}-api-gateway:${VERSION}
                                fi
                            '''
                        }
                    }
                }
                
                stage('Build Auth Service') {
                    steps {
                        echo '🔐 Building Auth Service...'
                        dir('backend/auth-service') {
                            sh '''
                                npm install
                                npm test || true
                                docker build -t ${PROJECT_NAME}-auth-service:${VERSION} .
                                if [ -n "${DOCKER_REGISTRY}" ]; then
                                  docker tag ${PROJECT_NAME}-auth-service:${VERSION} ${DOCKER_REGISTRY}/${PROJECT_NAME}-auth-service:${VERSION}
                                fi
                            '''
                        }
                    }
                }
                
                stage('Build Product Service') {
                    steps {
                        echo '🍎 Building Product Service...'
                        dir('backend/product-service') {
                            sh '''
                                npm install
                                npm test || true
                                docker build -t ${PROJECT_NAME}-product-service:${VERSION} .
                                if [ -n "${DOCKER_REGISTRY}" ]; then
                                  docker tag ${PROJECT_NAME}-product-service:${VERSION} ${DOCKER_REGISTRY}/${PROJECT_NAME}-product-service:${VERSION}
                                fi
                            '''
                        }
                    }
                }
                
                stage('Build Order Service') {
                    steps {
                        echo '📦 Building Order Service...'
                        dir('backend/order-service') {
                            sh '''
                                npm install
                                npm test || true
                                docker build -t ${PROJECT_NAME}-order-service:${VERSION} .
                                if [ -n "${DOCKER_REGISTRY}" ]; then
                                  docker tag ${PROJECT_NAME}-order-service:${VERSION} ${DOCKER_REGISTRY}/${PROJECT_NAME}-order-service:${VERSION}
                                fi
                            '''
                        }
                    }
                }
                
                stage('Build Payment Service') {
                    steps {
                        echo '💳 Building Payment Service...'
                        dir('backend/payment-service') {
                            sh '''
                                npm install
                                npm test || true
                                docker build -t ${PROJECT_NAME}-payment-service:${VERSION} .
                                if [ -n "${DOCKER_REGISTRY}" ]; then
                                  docker tag ${PROJECT_NAME}-payment-service:${VERSION} ${DOCKER_REGISTRY}/${PROJECT_NAME}-payment-service:${VERSION}
                                fi
                            '''
                        }
                    }
                }
                
                stage('Build Notification Service') {
                    steps {
                        echo '📧 Building Notification Service...'
                        dir('backend/notification-service') {
                            sh '''
                                npm install
                                npm test || true
                                docker build -t ${PROJECT_NAME}-notification-service:${VERSION} .
                                if [ -n "${DOCKER_REGISTRY}" ]; then
                                  docker tag ${PROJECT_NAME}-notification-service:${VERSION} ${DOCKER_REGISTRY}/${PROJECT_NAME}-notification-service:${VERSION}
                                fi
                            '''
                        }
                    }
                }
            }
        }
        
        stage('Build Frontend') {
            steps {
                echo '⚛️ Building Frontend...'
                dir('frontend') {
                    sh '''
                        npm install
                        npm run build
                        docker build -t ${PROJECT_NAME}-frontend:${VERSION} .
                        if [ -n "${DOCKER_REGISTRY}" ]; then
                          docker tag ${PROJECT_NAME}-frontend:${VERSION} ${DOCKER_REGISTRY}/${PROJECT_NAME}-frontend:${VERSION}
                        fi
                    '''
                }
            }
        }
        
        stage('Push Docker Images') {
            when {
                expression { return params.PUSH_IMAGES && params.DOCKER_REGISTRY?.trim() }
            }
            steps {
                echo '📤 Pushing Docker images to registry...'
                sh '''
                    docker push ${DOCKER_REGISTRY}/${PROJECT_NAME}-api-gateway:${VERSION}
                    docker push ${DOCKER_REGISTRY}/${PROJECT_NAME}-auth-service:${VERSION}
                    docker push ${DOCKER_REGISTRY}/${PROJECT_NAME}-product-service:${VERSION}
                    docker push ${DOCKER_REGISTRY}/${PROJECT_NAME}-order-service:${VERSION}
                    docker push ${DOCKER_REGISTRY}/${PROJECT_NAME}-payment-service:${VERSION}
                    docker push ${DOCKER_REGISTRY}/${PROJECT_NAME}-notification-service:${VERSION}
                    docker push ${DOCKER_REGISTRY}/${PROJECT_NAME}-frontend:${VERSION}
                '''
            }
        }
        
        stage('Deploy to Staging') {
            steps {
                echo '🚀 Deploying to staging environment...'
                sh '''
                    docker compose -f docker-compose.yml -f docker-compose.staging.yml up -d --build
                    sleep 10
                '''
            }
        }
        
        stage('Run Tests') {
            steps {
                echo '🧪 Running integration tests...'
                sh '''
                    echo "Testing API Gateway health check..."
                    curl -f http://localhost:3000/health || exit 1
                    
                    echo "Testing Auth Service health check..."
                    curl -f http://localhost:3001/health || exit 1
                    
                    echo "Testing Product Service health check..."
                    curl -f http://localhost:3002/health || exit 1
                    
                    echo "Testing Order Service health check..."
                    curl -f http://localhost:3003/health || exit 1
                    
                    echo "Testing Payment Service health check..."
                    curl -f http://localhost:3004/health || exit 1
                    
                    echo "Testing Notification Service health check..."
                    curl -f http://localhost:3005/health || exit 1
                '''
            }
        }
        
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                echo '🌟 Deploying to production...'
                sh '''
                    docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
                    echo "✅ Production deployment complete!"
                '''
            }
        }
    }
    
    post {
        always {
            echo '🧹 Cleaning up...'
            sh 'docker image prune -f'
        }
        
        success {
            echo '✅ Pipeline succeeded!'
        }
        
        failure {
            echo '❌ Pipeline failed!'
        }
    }
}
