import { describe, test, expect } from 'vitest';
import fastify from 'fastify';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import autoroutes, { ERROR_LABEL } from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesPath = path.join(__dirname, 'fixtures');

describe('Invalid Routes', () => {
  test('invalid type routes directory', async () => {
    const server = fastify();

    await expect(async () => {
      await server.register(autoroutes, {
        dir: path.join(fixturesPath, 'invalid', 'empty.js'), // file instead of directory
      });
      await server.ready();
    }).rejects.toThrow(
      expect.objectContaining({
        message: expect.stringContaining(ERROR_LABEL),
      })
    );
  });

  test('empty routes module', async () => {
    const server = fastify();

    await expect(async () => {
      await server.register(autoroutes, {
        dir: path.join(fixturesPath, 'invalid'),
      });
      await server.ready();
    }).rejects.toThrow(
      expect.objectContaining({
        message: expect.stringContaining(ERROR_LABEL),
      })
    );
  });

  test('modules with error', async () => {
    const server = fastify();

    await expect(async () => {
      await server.register(autoroutes, {
        dir: path.join(fixturesPath, 'invalid'),
      });
      await server.ready();
    }).rejects.toThrow(Error);
  });

  test('modules without valid routes', async () => {
    const server = fastify();

    await expect(async () => {
      await server.register(autoroutes, {
        dir: path.join(fixturesPath, 'invalid'),
      });
      await server.ready();
    }).rejects.toThrow(
      expect.objectContaining({
        message: expect.stringContaining(ERROR_LABEL),
      })
    );
  });
});
