# frontend-tambola/Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

# Copy environment variables before build step
COPY .env.docker .env.local

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
