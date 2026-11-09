// All configuration comes from the environment, read once here.
module.exports = {
  port: Number(process.env.PORT) || 3000,
  // Fastify listens on localhost by default, which is unreachable from outside
  // the container — Cloud Run sends traffic to the container's own address.
  host: '0.0.0.0',
};
