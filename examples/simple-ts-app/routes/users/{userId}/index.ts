import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { Resource } from '../../../../../dist';

interface Params {
  userId: string;
}

export default (fastify: FastifyInstance) => {
  return <Resource>{
    get: {
      handler: (request: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => {
        reply.send(`hello user ${request.params.userId}`);
      },
    },
  };
};
