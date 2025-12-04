import { describe, test, expect } from 'vitest';
import fastify from 'fastify';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import autoroutes from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesPath = path.join(__dirname, 'fixtures');

describe('Routes', () => {
  test('simple index', async () => {
    const server = fastify();

    await server.register(autoroutes, {
      dir: path.join(fixturesPath, 'routes'),
    });

    const res = await server.inject({
      method: 'GET',
      url: '/',
    });

    expect(res.statusCode).toBe(200);
    expect(res.payload).toBe('get');
  });

  test('nested routes', async () => {
    const server = fastify();

    await server.register(autoroutes, {
      dir: path.join(fixturesPath, 'routes'),
    });

    const res = await server.inject({
      method: 'GET',
      url: '/users/foo',
    });

    expect(res.statusCode).toBe(200);
    expect(res.payload).toBe('get');
  });

  test('nested routes with trailing slashes', async () => {
    const server = fastify();

    await server.register(autoroutes, {
      dir: path.join(fixturesPath, 'routes'),
    });

    const res = await server.inject({
      method: 'GET',
      url: '/users/foo/',
    });

    expect(res.statusCode).toBe(200);
    expect(res.payload).toBe('get');
  });

  test('nested routes with url parameter', async () => {
    const server = fastify();

    const userId = 'test-user-123';

    await server.register(autoroutes, {
      dir: path.join(fixturesPath, 'routes'),
    });

    const res = await server.inject({
      method: 'GET',
      url: `/users/${userId}`,
    });

    expect(res.statusCode).toBe(200);
    expect(res.payload).toBe(userId);
  });

  test('url parameters with : (not on windows)', async () => {
    if (process.platform === 'win32') {
      return;
    }

    const server = fastify();

    await server.register(autoroutes, {
      dir: path.join(fixturesPath, 'routes'),
    });

    const USERID = 'test-user-456';

    const res1 = await server.inject({
      method: 'GET',
      url: `/users/${USERID}`,
    });

    expect(res1.statusCode).toBe(200);
    expect(res1.payload).toBe(USERID);

    const res2 = await server.inject({
      method: 'GET',
      url: `/users/${USERID}/`,
    });

    expect(res2.statusCode).toBe(200);
    expect(res2.payload).toBe(USERID);
  });

  test('nested routes with url parameter with trailing slashes', async () => {
    const server = fastify();

    await server.register(autoroutes, {
      dir: path.join(fixturesPath, 'routes-with-params'),
    });

    const userId = 'foo-bar-baz';

    const res = await server.inject({
      method: 'GET',
      url: `/users/${userId}/`,
    });

    expect(res.statusCode).toBe(200);
    expect(res.payload).toBe(userId);
  });

  test('example es6 exports default module', async () => {
    const server = fastify();

    await server.register(autoroutes, {
      dir: path.join(fixturesPath, 'routes-default-export'),
    });

    const res = await server.inject({
      method: 'GET',
      url: '/',
    });

    expect(res.statusCode).toBe(200);
    expect(res.payload).toBe('get');
  });

  test('skip routes with starting . charater', async () => {
    const server = fastify();

    await server.register(autoroutes, {
      dir: path.join(fixturesPath, 'routes'),
    });

    const res1 = await server.inject({
      method: 'GET',
      url: '/ignored',
    });

    expect(res1.statusCode).toBe(404);

    const res2 = await server.inject({
      method: 'GET',
      url: '/.ignored',
    });

    expect(res2.statusCode).toBe(404);
  });

  test('skip routes with starting _ charater', async () => {
    const server = fastify();

    await server.register(autoroutes, {
      dir: path.join(fixturesPath, 'routes'),
    });

    const res1 = await server.inject({
      method: 'GET',
      url: '/ignored',
    });

    expect(res1.statusCode).toBe(404);

    const res2 = await server.inject({
      method: 'GET',
      url: '/_ignored',
    });

    expect(res2.statusCode).toBe(404);
  });

  test('skip routes ending with .test.js or .test.ts', async () => {
    const server = fastify();

    await server.register(autoroutes, {
      dir: path.join(fixturesPath, 'routes'),
    });

    const res1 = await server.inject({
      method: 'GET',
      url: '/ignored',
    });

    expect(res1.statusCode).toBe(404);

    const res2 = await server.inject({
      method: 'GET',
      url: '/ignored.test',
    });

    expect(res2.statusCode).toBe(404);
  });

  test('expect route /status to work', async () => {
    const server = fastify();

    await server.register(autoroutes, {
      dir: path.join(fixturesPath, 'routes'),
    });

    const res = await server.inject({
      method: 'GET',
      url: '/a/status',
    });

    expect(res.statusCode).toBe(200);
    expect(res.payload).toBe('get');
  });
});
