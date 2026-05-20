pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'your-docker-registry'
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
                                docker build -t ${DOCKER_REGISTRY}/${PROJECT_NAME}-api-gateway:${VERSION} .
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
                                docker build -t ${DOCKER_REGISTRY}/${PROJECT_NAME}-auth-service:${VERSION} .
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
                                docker build -t ${DOCKER_REGISTRY}/${PROJECT_NAME}-product-service:${VERSION} .
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
                                docker build -t ${DOCKER_REGISTRY}/${PROJECT_NAME}-order-service:${VERSION} .
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
                                docker build -t ${DOCKER_REGISTRY}/${PROJECT_NAME}-payment-service:${VERSION} .
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
                                docker build -t ${DOCKER_REGISTRY}/${PROJECT_NAME}-notification-service:${VERSION} .
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
                        docker build -t ${DOCKER_REGISTRY}/${PROJECT_NAME}-frontend:${VERSION} .
                    '''
                }
            }
        }
        
        stage('Push Docker Images') {
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
                    docker-compose -f docker-compose.yml -f docker-compose.staging.yml up -d
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
                    docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
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
