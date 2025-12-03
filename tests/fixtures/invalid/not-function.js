export default {
  get: {
    handler: function (request, reply) {
      return reply.send('get')
    },
  },
}
