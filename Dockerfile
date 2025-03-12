FROM amazoncorretto:21-alpine-jdk

RUN apk add --no-cache bash nodejs npm docker-cli docker-cli-compose

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

EXPOSE 3001
EXPOSE 25565

CMD ["npm", "run", "server"]
