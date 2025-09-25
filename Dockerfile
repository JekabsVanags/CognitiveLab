FROM node:20-bullseye

# Install MySQL server
RUN apt-get update && apt-get install -y mysql-server mysql-client

WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .

# Copy DB init script
COPY init-db.sh /init-db.sh
RUN chmod +x /init-db.sh

EXPOSE 3000 3306

CMD ["sh", "/init-db.sh"]
