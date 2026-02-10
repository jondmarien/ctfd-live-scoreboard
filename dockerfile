# DEPRECATED: This Dockerfile is no longer used for deployment.
# The app is now deployed via Vercel (see vercel.json).
# Keeping this file for reference only — use Docker if self-hosting is needed.
#
# Usage (if self-hosting):
#   docker build -t fantasy-ctf-scoreboard .
#   docker run -p 80:80 fantasy-ctf-scoreboard

# Stage 1: Build the React app
FROM oven/bun:1 AS build

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

# Stage 2: Serve with NGINX
FROM nginx:1.27-alpine

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy NGINX configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for web traffic
EXPOSE 80

# Start NGINX server
CMD ["nginx", "-g", "daemon off;"]
