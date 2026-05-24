# RAVA backend — Express API + Telegram bot.
FROM node:22-alpine

WORKDIR /app

# Install production deps first (better layer caching). All deps are pure JS
# (bcryptjs, pg, node-telegram-bot-api…), so no build toolchain is needed.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 3001

CMD ["node", "src/index.js"]
