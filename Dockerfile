FROM node:22-alpine AS dependencies
WORKDIR /app
COPY package.json package-lock.json* ./
COPY client/package.json ./client/package.json
COPY server/package.json ./server/package.json
RUN npm install

FROM dependencies AS build
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}
COPY client ./client
RUN npm run build -w client

FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json* ./
COPY client/package.json ./client/package.json
COPY server/package.json ./server/package.json
RUN npm install --omit=dev
COPY server ./server
COPY --from=build /app/client/dist ./client/dist
USER node
EXPOSE 5000
CMD ["npm", "run", "start", "-w", "server"]
