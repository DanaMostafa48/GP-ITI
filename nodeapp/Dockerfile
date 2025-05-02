FROM node:18
RUN apt update && \
    apt install mariadb-client -y
WORKDIR /nodeapp
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "app.js"]