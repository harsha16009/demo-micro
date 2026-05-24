FROM jenkins/jenkins:lts

USER root

# Install curl and required packages
RUN apt-get update && \
    apt-get install -y curl gnupg2 git

# Install Node.js 20
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

# Install Docker CLI
RUN apt-get install -y docker.io docker-compose-plugin docker-compose

USER jenkins
