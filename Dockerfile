# Use Docker-in-Docker base image
From docker:dind
# Enable community/testing repositories and install prerequisites
RUN echo "http://dl-cdn.alpinelinux.org/alpine/edge/community" >> /etc/apk/repositories && \
    echo "http://dl-cdn.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories && \
    apk update && \
    apk add --no-cache \
        bash \
        curl \
        unzip \
        python3 \
        py3-pip \
        git \
        sudo && \
    rm -rf /var/cache/apk/*

# Install AWS CLI v2 (official method)
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && \
    unzip awscliv2.zip && \
    ./aws/install --bin-dir /usr/local/bin && \
    rm -rf awscliv2.zip aws
# Install Terraform
ARG TERRAFORM_VERSION=1.7.5
RUN curl -fsSL https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_amd64.zip -o terraform.zip && \
    unzip terraform.zip && \
    mv terraform /usr/local/bin/ && \
    chmod +x /usr/local/bin/terraform && \
    rm terraform.zip