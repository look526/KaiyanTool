FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production --frozen-lockfile

COPY . .

RUN npm run build

RUN mkdir -p uploads
RUN chmod 755 uploads

EXPOSE 3001

CMD ["npm", "start"]
