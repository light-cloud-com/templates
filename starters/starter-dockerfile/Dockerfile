# Custom Dockerfile Template
# Modify this Dockerfile for your specific application

FROM node:22-alpine

WORKDIR /app

# Copy your application files
COPY . .

# Expose port (Cloud Run expects 8080)
EXPOSE 8080

# Start command
CMD ["node", "server.js"]
