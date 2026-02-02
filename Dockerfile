FROM node:20-alpine

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.25.0 --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy prisma schema
COPY prisma ./prisma

# Generate Prisma client
RUN pnpm prisma generate

# Copy rest of the application
COPY . .

EXPOSE 3000

CMD ["pnpm", "dev"]
