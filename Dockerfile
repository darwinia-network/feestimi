FROM node:18-alpine


COPY . /app
WORKDIR /app

RUN yarn install \
  && yarn build

CMD ["yarn", "start"]
