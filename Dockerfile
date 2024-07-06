FROM node:18

WORKDIR /usr/src/app

COPY package*.json .

COPY . .

RUN yarn

EXPOSE 3001