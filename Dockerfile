FROM node:10.11.0-alpine

WORKDIR /face-service

COPY . /face-service

RUN rm .env

RUN npm install

ENTRYPOINT ["npm", "start"]