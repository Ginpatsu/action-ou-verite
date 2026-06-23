FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY server.js db.js ./
COPY db ./db
EXPOSE 8787
CMD ["node", "server.js"]
