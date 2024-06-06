FROM node:18.16.1-alpine

RUN apk add --no-cache bash
RUN npm i -g @nestjs/cli@9.5.0 

COPY package*.json /tmp/app/
RUN cd /tmp/app && yarn

COPY . /usr/src/app
RUN mkdir -p /usr/src/app/public
RUN cp -a /tmp/app/node_modules /usr/src/app
COPY ./scripts/startup.sh /opt/startup.dev.sh
RUN sed -i 's/\r//g' /opt/startup.dev.sh

WORKDIR /usr/src/app
RUN npm run build

CMD ["/opt/startup.dev.sh"]
