FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./
COPY apps/api/package.json apps/api/package.json
RUN npm install --omit=dev
COPY apps/api apps/api
EXPOSE 8787
CMD ["npm", "run", "start", "-w", "apps/api"]
