# Dockerfile for NestJS backend with Python support
FROM node:20-alpine

# Install Python and build tools for native modules
RUN apk add --no-cache python3 py3-pip make gcc g++ python3-dev

WORKDIR /usr/src/app

# Copy package files
COPY package.json yarn.lock* ./

# Install dependencies
RUN yarn 

# Rebuild bcrypt for the container's architecture
# RUN npm rebuild bcrypt --build-from-source

# Copy source code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Build app
RUN yarn build

EXPOSE 3000

CMD ["yarn", "start:prod"]
