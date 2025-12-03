export default function () {
  return {
    get: {
      handler: function (request, reply) {
        return reply.send('get')
      },
    },
  }
}
