FROM node:22-alpine3.19

COPY . /app

RUN cd /app && \
    yarn install && \
    yarn codegen

WORKDIR /app

CMD ["yarn", "start"]

