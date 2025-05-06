FROM node:18-alpine3.20

WORKDIR /app

COPY . .

RUN npm install

#dev...
CMD ["npm", "run", "serve"]