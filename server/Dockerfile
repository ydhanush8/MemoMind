# ── build stage ─────────────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN corepack enable && (npm ci || npm install)
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ── runtime stage ───────────────────────────────────────────────────────
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN (npm ci --omit=dev || npm install --omit=dev)
COPY --from=build /app/dist ./dist
EXPOSE 4000
# Health check hits the public health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://localhost:'+(process.env.PORT||4000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/server.js"]
