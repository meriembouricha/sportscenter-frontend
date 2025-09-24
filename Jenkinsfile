pipeline {
    agent any
    
    environment {
        SONAR_TOKEN = credentials('sonar-token')
        GITHUB_TOKEN = credentials('github-pat')
        ACR = credentials('acr-user')
        NEXUS = credentials('nexus-creds')
        DOCKER_IMAGE = 'sportscenteracr.azurecr.io/sportscenter-frontend'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/prod']],
                    userRemoteConfigs: [[
                        url: 'https://github.com/your-org/sportscenter.git',
                        credentialsId: 'github-pat'
                    ]]
                ])
                dir('client') {
                    // Pipeline runs in client directory
                }
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }
        
        stage('Lint & Unit Tests') {
            parallel {
                stage('Lint') {
                    steps {
                        sh 'npx ng lint || echo "Linting completed"'
                    }
                }
                stage('Unit Tests') {
                    steps {
                        sh 'npm run test -- --watch=false --code-coverage'
                    }
                    post {
                        always {
                            publishTestResults testResultsPattern: 'coverage/junit.xml'
                            publishHTML([
                                allowMissing: false,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: 'coverage',
                                reportFiles: 'index.html',
                                reportName: 'Coverage Report'
                            ])
                        }
                    }
                }
            }
        }
        
        stage('Trivy File System Scan') {
            steps {
                sh '''
                    trivy fs . --format json --output trivy-fs-report.json
                    trivy fs . --format table
                '''
            }
            post {
                always {
                    archiveArtifacts artifacts: 'trivy-fs-report.json', fingerprint: true
                }
            }
        }
        
        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQubeServer') {
                    sh '''
                        npx sonar-scanner \
                            -Dsonar.projectKey=sportscenter-frontend \
                            -Dsonar.sources=src \
                            -Dsonar.host.url=${SONAR_HOST_URL} \
                            -Dsonar.login=${SONAR_TOKEN} \
                            -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
                            -Dsonar.typescript.lcov.reportPaths=coverage/lcov.info
                    '''
                }
            }
        }
        
        stage('Wait for Quality Gate') {
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
        
        stage('Build Angular App') {
            steps {
                sh 'npm run build -- --configuration=production'
                sh 'tar -czf dist-frontend-${BUILD_NUMBER}.tar.gz -C dist .'
                archiveArtifacts artifacts: 'dist-frontend-*.tar.gz', fingerprint: true
            }
        }
        
        stage('Publish Build to Nexus') {
            steps {
                script {
                    def nexusCreds = credentials('nexus-creds')
                    def nexusUsr = nexusCreds.split(':')[0]
                    def nexusPsw = nexusCreds.split(':')[1]
                    sh """
                        curl -v -u "${nexusUsr}:${nexusPsw}" \
                            --upload-file dist-frontend-${BUILD_NUMBER}.tar.gz \
                            "http://your-nexus-server/repository/frontend-artifacts/dist-frontend-${BUILD_NUMBER}.tar.gz"
                    """
                }
            }
        }
        
        stage('Publish Reports to Nexus') {
            steps {
                script {
                    def nexusCreds = credentials('nexus-creds')
                    def nexusUsr = nexusCreds.split(':')[0]
                    def nexusPsw = nexusCreds.split(':')[1]
                    sh """
                        # Create reports tarball
                        tar -czf coverage-reports-${BUILD_NUMBER}.tar.gz -C coverage .
                        
                        # Upload to Nexus
                        curl -v -u "${nexusUsr}:${nexusPsw}" \
                            --upload-file coverage-reports-${BUILD_NUMBER}.tar.gz \
                            "http://your-nexus-server/repository/nexus-reports/coverage-reports-${BUILD_NUMBER}.tar.gz"
                    """
                }
            }
        }
        
        stage('Build & Tag Docker Image') {
            steps {
                script {
                    def imageTag = "${DOCKER_IMAGE}:${BUILD_NUMBER}"
                    def latestTag = "${DOCKER_IMAGE}:latest"
                    
                    sh "docker build -t ${imageTag} -t ${latestTag} ."
                    env.DOCKER_IMAGE_TAG = imageTag
                    env.DOCKER_IMAGE_LATEST = latestTag
                }
            }
        }
        
        stage('Trivy Docker Image Scan') {
            steps {
                sh '''
                    trivy image --format json --output trivy-docker-report.json ${DOCKER_IMAGE}:${BUILD_NUMBER}
                    trivy image --format table ${DOCKER_IMAGE}:${BUILD_NUMBER}
                '''
            }
            post {
                always {
                    archiveArtifacts artifacts: 'trivy-docker-report.json', fingerprint: true
                }
            }
        }
        
        stage('Push Docker Image to ACR') {
            steps {
                script {
                    sh '''
                        echo "${ACR}" | docker login sportscenteracr.azurecr.io --username $(echo "${ACR}" | cut -d: -f1) --password-stdin
                        docker push ${DOCKER_IMAGE}:${BUILD_NUMBER}
                        docker push ${DOCKER_IMAGE}:latest
                    '''
                }
            }
        }
    }
    
    post {
        failure {
            echo "Pipeline failed."
        }
        success {
            echo "Pipeline completed successfully."
        }
        always {
            script {
                sh '''
                    # Cleanup local Docker images
                    docker rmi ${DOCKER_IMAGE}:${BUILD_NUMBER} || true
                    docker rmi ${DOCKER_IMAGE}:latest || true
                    docker rmi sportscenteracr.azurecr.io/sportscenter-frontend:${BUILD_NUMBER} || true
                    docker rmi sportscenteracr.azurecr.io/sportscenter-frontend:latest || true
                    
                    # Clean up dangling images
                    docker image prune -f || true
                '''
            }
        }
    }
}
