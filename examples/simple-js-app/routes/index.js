export default (_fastify) => {
  return {
    get: {
      handler: (request, reply) => {
        reply.send('hello index')
      },
    },
  }
}
