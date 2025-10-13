FROM node:18-alpine
WORKDIR /app
COPY api-package.json ./package.json
RUN npm install
COPY fly-server.js ./
COPY fly.toml ./
EXPOSE 8080
CMD ["npm", "start"]
