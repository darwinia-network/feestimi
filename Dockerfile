FROM node:21-alpine


COPY . /app
WORKDIR /app

RUN yarn install


CMD ["yarn", "start"]
