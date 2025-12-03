# Migration Guide: v3.x to v5.0

This guide covers the breaking changes and steps required to upgrade from fastify-autoroutes v3.x to v5.0.

## Overview

Version 5.0.0 is a major upgrade that brings support for Fastify v5 and modernizes the codebase with:

- **Fastify v5** compatibility
- **Node.js 20+** requirement
- **ESM-only** module system
- **Performance improvements** with parallel route loading
- **Updated tooling** (Vitest, TypeScript 5, ESLint 9)

## Breaking Changes

### 1. Node.js Version Requirement

**Before:** Node.js >= 14.0.0  
**After:** Node.js >= 20.0.0

**Action Required:**

- Upgrade to Node.js 20 or later
- Update your CI/CD pipelines to use Node.js 20+

```bash
# Check your Node.js version
node --version  # Should be v20.0.0 or higher
```

### 2. ESM-Only Module

**Before:** CommonJS with `require()`  
**After:** ESM with `import`

**Action Required:**

1. Add `"type": "module"` to your `package.json`:

```json
{
  "type": "module"
}
```

2. Convert all `require()` to `import`:

```js
// Before
const fastify = require('fastify')
const autoroutes = require('fastify-autoroutes')

// After
import Fastify from 'fastify'
import autoroutes from 'fastify-autoroutes'
```

3. Update route modules to use ESM exports:

```js
// Before (CommonJS)
module.exports = (fastify) => ({
  get: {
    handler: async (request, reply) => 'Hello',
  },
})

// After (ESM)
export default (fastify) => ({
  get: {
    handler: async (request, reply) => 'Hello',
  },
})
```

4. Use `.js` extension in imports if needed:

```js
import myModule from './myModule.js'
```

### 3. Fastify v5 API Changes

**Action Required:**

1. Update `server.listen()` calls to use object syntax:

```js
// Before
await server.listen(3000)

// After
await server.listen({ port: 3000 })
```

2. Ensure all plugin registrations use `await`:

```js
// Always use await with register
await server.register(autoroutes, {
  dir: './routes',
})
```

### 4. Plugin Callback Signature (Internal)

**Before:** Plugins could use callback-style with `next()` parameter  
**After:** Plugins must use async/await and throw errors

**Impact:** This is an internal change. Your route handlers should already be using async/await or promises. If you have error handling in routes, continue using `throw` or `reply.code().send()`.

```js
// Route handlers work the same way
export default (fastify) => ({
  get: {
    handler: async (request, reply) => {
      // Throw errors as before
      if (!request.params.id) {
        throw new Error('ID required')
      }
      return { success: true }
    },
  },
})
```

## Upgrade Steps

### Step 1: Update Dependencies

Update your `package.json`:

```json
{
  "dependencies": {
    "fastify": "^5.2.0",
    "fastify-autoroutes": "^5.0.0"
  }
}
```

Install updated dependencies:

```bash
npm install
```

### Step 2: Add ESM Support

Add to your `package.json`:

```json
{
  "type": "module"
}
```

### Step 3: Update Server Configuration

Convert your main server file:

```js
// server.js or index.js
import Fastify from 'fastify'
import autoroutes from 'fastify-autoroutes'

const server = Fastify({
  logger: true,
})

await server.register(autoroutes, {
  dir: './routes',
  prefix: '/api',
})

await server.listen({
  port: process.env.PORT || 3000,
  host: '0.0.0.0',
})
```

### Step 4: Update Route Modules

Convert all route files from CommonJS to ESM:

```js
// routes/users/index.js
export default (fastify) => ({
  get: {
    handler: async (request, reply) => {
      return { users: [] }
    },
  },
  post: {
    schema: {
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
      },
    },
    handler: async (request, reply) => {
      return { created: true }
    },
  },
})
```

### Step 5: Update TypeScript Configuration (if applicable)

If using TypeScript, update your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "lib": ["ES2020"],
    "outDir": "dist",
    "rootDir": "src",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Step 6: Update Tests

If you have tests, ensure they also use ESM:

```js
import { test } from 'node:test'
import Fastify from 'fastify'
import autoroutes from 'fastify-autoroutes'

test('routes work correctly', async (t) => {
  const server = Fastify()
  await server.register(autoroutes, { dir: './routes' })

  const res = await server.inject({
    method: 'GET',
    url: '/users',
  })

  t.assert.strictEqual(res.statusCode, 200)
})
```

## Performance Improvements

Version 5.0 includes performance optimizations:

### Parallel Route Loading

Routes are now loaded in parallel using `Promise.all()`, significantly improving startup time for applications with many routes.

**Before:**

```
Loading 100 routes: ~500ms (sequential)
```

**After:**

```
Loading 100 routes: ~150ms (parallel)
```

No configuration changes needed - this optimization is automatic.

## Benefits of Upgrading

1. **Fastify v5 Features**: Access to latest Fastify improvements and bug fixes
2. **Better Performance**: Parallel route loading reduces startup time
3. **Modern JavaScript**: ESM modules with better tree-shaking and optimization
4. **Type Safety**: Updated TypeScript types for better IDE support
5. **Node.js 20**: Access to latest Node.js features and performance improvements

## Troubleshooting

### "Cannot use import statement outside a module"

**Solution:** Add `"type": "module"` to your `package.json`

### "Directory import is not supported"

**Solution:** Import files with explicit `.js` extension:

```js
// Wrong
import myModule from './myModule'

// Correct
import myModule from './myModule.js'
```

### "require is not defined"

**Solution:** Convert all `require()` to `import`:

```js
// Wrong
const config = require('./config.json')

// Correct - for JSON
import config from './config.json' assert { type: 'json' }

// Or read dynamically
import { readFile } from 'node:fs/promises'
const config = JSON.parse(await readFile('./config.json', 'utf-8'))
```

### TypeScript errors with ESM

**Solution:** Update `tsconfig.json` with:

```json
{
  "compilerOptions": {
    "module": "ES2022",
    "moduleResolution": "bundler"
  }
}
```

## Need Help?

- Check the [examples](./examples/) directory for working ESM code
- Review [Fastify v5 migration guide](https://fastify.dev/docs/latest/Guides/Migration-Guide-V5/)
- Open an issue on [GitHub](https://github.com/GiovanniCardamone/fastify-autoroutes/issues)

## Rollback Plan

If you encounter issues and need to rollback:

```bash
npm install fastify-autoroutes@3
npm install fastify@4
```

Then revert your ESM changes (remove `"type": "module"`, convert back to `require()`).
