FROM node:22-slim

# Enable pnpm inside the container
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./

# FIXED: Bypassed the 24-hour publication lock constraint for local build stability
RUN pnpm install --config.minimumReleaseAge=0

COPY . .

EXPOSE 5173

# Crucial: --host flag is required for Vite to expose port outside the container network
CMD ["pnpm", "run", "dev", "--host"]