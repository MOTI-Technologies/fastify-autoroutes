import { describe, test, expect } from 'vitest'
import fastify from 'fastify'
import autoroutes, { ERROR_LABEL } from '../src/index.js'

describe('Options', () => {
  test('no dir parameters', async () => {
    const server = fastify()

    await expect(async () => {
      await server.register(autoroutes)
      await server.ready()
    }).rejects.toThrow(
      expect.objectContaining({
        message: expect.stringContaining(ERROR_LABEL),
      })
    )
  })

  test('invalid dir parameters', async () => {
    const server = fastify()

    await expect(async () => {
      // @ts-expect-error Testing invalid parameter type
      await server.register(autoroutes, {
        dir: 33,
      })
      await server.ready()
    }).rejects.toThrow()
  })

  test('dir does not exists', async () => {
    const server = fastify()

    await expect(async () => {
      await server.register(autoroutes, {
        dir: './this-directory-does-not-exists',
      })
      await server.ready()
    }).rejects.toThrow(
      expect.objectContaining({
        message: expect.stringContaining(ERROR_LABEL),
      })
    )
  })
})
