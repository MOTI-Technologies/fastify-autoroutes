export default function (server) {
  return {
    get: {
      handler: function (request, reply) {
        return reply.send('get')
      },
    },
  }
}
