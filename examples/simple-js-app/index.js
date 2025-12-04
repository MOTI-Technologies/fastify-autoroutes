import fastify from 'fastify';
import autoroutes from '@moti-technologies/fastify-autoroutes';

async function start() {
  const server = fastify();

  server.register(autoroutes, {
    dir: './routes',
  });

  await server.listen({ port: 9999 });
  console.log('Server listening on http://localhost:9999');
}

start();
