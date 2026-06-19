FROM node:22-slim

# Enable pnpm inside the container
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# FIXED: Permanently disable minimumReleaseAge safety check at the global container registry level
RUN pnpm config set minimum-release-age 0

COPY package.json pnpm-lock.yaml* ./

ENV CI=true

# Standard clean installation
RUN pnpm install

COPY . .

EXPOSE 5173

CMD ["pnpm", "run", "dev", "--host"]