FROM node:20

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build
RUN npm prune --production

EXPOSE 3001

ENV RABBIT_URL=amqp://rabbitmq-service:5672

CMD ["node", "dist/index.js"]