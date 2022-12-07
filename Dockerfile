### STAGE 1: Build ###
FROM node:19.2-alpine AS build
ENV NODE_OPTIONS=--openssl-legacy-provider
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run deploy

### STAGE 2: Run ###
FROM nginx:1.23.2-alpine
COPY --from=build /usr/src/app/dist/glyphboard /usr/share/nginx/html