FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

EXPOSE 3001

# Aguardar banco de dados e iniciar aplicação
CMD ["sh", "-c", "npm run wait-for-db && npm start"]