FROM node:20 AS build

WORKDIR /client

COPY client/package*.json ./
RUN npm install

COPY client/ .
RUN npm run build

RUN mv dist public

FROM node:20 AS express

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

COPY --from=build /client/public ./public

EXPOSE 8000
CMD ["node", "app.js"]
