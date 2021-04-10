FROM node:lts-alpine

# Including tini instead of doing --init because who remebers that
RUN apk add --no-cache tini ffmpeg perl make
RUN npm install -g sequelize-cli
# Tini is now available at /sbin/tini
ENTRYPOINT ["/sbin/tini", "--"]

# Create app directory
WORKDIR /usr/src/app

WORKDIR /usr/src/app/tmp

COPY . .

WORKDIR /usr/src/app

RUN cd tmp \
    && npm config set proxy ${http_proxy} \
    && npm config set https-proxy ${https_proxy} \
    && npm ci \
    && npm run build \
    && cd - \
    && cp -Rp tmp/server/* tmp/server/.sequelizerc . \
    && rm -rf tmp

EXPOSE 3000
CMD [ "sh", "-c", "while true; do npx sequelize-cli db:migrate && node server.js; sleep 10; done" ]
