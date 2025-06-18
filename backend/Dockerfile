# Base image
FROM node:20

# Set working directory
WORKDIR /app

# Copy only package files first (for caching deps)
COPY package.json yarn.lock ./

# Install dependencies
RUN corepack enable && yarn install

# Copy source files
COPY . .

# Build the project
RUN yarn build

# Expose the port your Fastify app uses
EXPOSE 3000

# Default command (can be overridden)
CMD ["yarn", "start"]