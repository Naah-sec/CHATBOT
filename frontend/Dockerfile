# Standalone Dockerfile for frontend (optional)
FROM node:20-alpine3.20
WORKDIR /frontend
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview"]
