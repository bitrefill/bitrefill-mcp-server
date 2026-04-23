# Use Node.js 24 LTS base image
FROM node:24.15.0-alpine AS builder

# Enable pnpm via corepack
RUN corepack enable

# Set working directory
WORKDIR /app

# Copy all source files first
COPY . .

# Install all dependencies including dev dependencies
RUN pnpm install --frozen-lockfile

# Build the TypeScript files
RUN pnpm run build

# Use a smaller base image for the release
FROM node:24.15.0-slim AS release

# Enable pnpm via corepack
RUN corepack enable

# Set working directory
WORKDIR /app

# Copy only the necessary files from builder
COPY --from=builder /app/build /app/build
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/pnpm-lock.yaml /app/pnpm-lock.yaml

# Install only production dependencies without running prepare script
RUN pnpm install --prod --frozen-lockfile --ignore-scripts

# Set environment variable for Node.js
ENV NODE_ENV=production

# Set the entrypoint
ENTRYPOINT ["node", "build/index.js"]
