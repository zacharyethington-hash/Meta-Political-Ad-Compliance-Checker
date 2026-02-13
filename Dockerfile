FROM node:20-slim

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

RUN npx vite build

ENV NODE_ENV=production

EXPOSE 3001

CMD ["node", "server/index.js"]
