# Custom Dockerfile Template
# Light Cloud builds this file as it is. Replace it with your own for any
# language or runtime; the only requirement is listening on $PORT.

FROM node:22-alpine

ENV NODE_ENV=production
WORKDIR /app

# The example app has no dependencies. With a package.json, copy it and the
# lockfile first and run `npm ci --omit=dev` before copying the source, so the
# install layer is cached between builds.
COPY src ./src

# Run as the unprivileged user the Node image ships with, not root.
USER node

# Cloud Run sends traffic to $PORT (8080 unless set otherwise).
ENV PORT=8080
EXPOSE 8080

CMD ["node", "src/server.js"]
