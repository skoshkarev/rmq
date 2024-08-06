FROM node:14

WORKDIR /chess
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 7077
CMD ["node", "app.js"]
