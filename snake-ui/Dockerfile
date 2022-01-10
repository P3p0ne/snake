# Stage 1: Intermediate container for building our project
FROM node:17-alpine3.14 AS builder
ARG host

# Workfolder in our container
WORKDIR /app

# Copy project files
COPY . .

# Workaround: Overwrite connection strings to snake backend api
RUN find ./src/app/services/ -type f -name *.service.ts | xargs sed -i "s/localhost/$host/g"

# Install app dependencies (production only) and typescript to build
RUN npm install --production
RUN npm install typescript

# Compile, build angular project
RUN npm run build --prod

# Stage 2: Run project on nginx webserver
FROM nginx:alpine

# Set working directory to nginx asset directory
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy static assets from builder stage
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist/snake-ui .

# Expose port 80
EXPOSE 80

# Containers run nginx with global directives and daemon off
ENTRYPOINT ["nginx", "-g", "daemon off;"]
