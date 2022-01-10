# Stage 1: Intermediate container for building our project
FROM node:17-alpine3.14 AS builder

# Workfolder in our container
WORKDIR /src

# Copy project files
COPY . .

# Install app dependencies (production only) and typescript to build
RUN npm install --production
RUN npm install typescript

# Compile typescript project
RUN ./node_modules/.bin/tsc --watch false --project ./tsconfig.json --outDir ./out

# Stage 2: Create smaller container image, necessary project files only
FROM node:17-alpine3.14

# Workfolder in our container
WORKDIR /src

# Copy necessary project files in our final image
COPY --from=builder /src/out .
COPY --from=builder /src/node_modules ./node_modules
COPY --from=builder /src/config*.yaml ./
COPY --from=builder /src/package*.json ./

# Expose port 8080
EXPOSE 8080

# Start server
CMD [ "npm", "run", "start" ]
