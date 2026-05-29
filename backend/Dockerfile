FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY src ./src
COPY data ./data

FROM node:20-alpine

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/data ./data
COPY package*.json ./

ENV NODE_ENV=production
EXPOSE 4000

CMD ["npm", "start"]
