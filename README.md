# fastify-autoroutes

<div align="center">

![Banner](./banner.png)

![JavaScript](https://img.shields.io/badge/ES6-Supported-yellow.svg?style=for-the-badge&logo=JavaScript) &nbsp; ![TypeScript](https://img.shields.io/badge/TypeScript-Supported-blue.svg?style=for-the-badge)

[![NPM version](https://img.shields.io/npm/v/fastify-autoroutes.svg?style=flat)](https://www.npmjs.com/package/fastify-autoroutes)
[![NPM downloads](https://img.shields.io/npm/dm/fastify-autoroutes.svg?style=flat)](https://www.npmjs.com/package/fastify-autoroutes)
[![Known Vulnerabilities](https://snyk.io/test/github/GiovanniCardamone/fastify-autoroutes/badge.svg)](https://snyk.io/test/github/GiovanniCardamone/fastify-autoroutes)
[![GitHub license](https://img.shields.io/github/license/GiovanniCardamone/fastify-autoroutes.svg)](https://github.com/GiovanniCardamone/fastify-autoroutes/blob/master/LICENSE)

![CI](https://github.com/GiovanniCardamone/fastify-autoroutes/workflows/CI/badge.svg?branch=master)
[![Coverage Status](https://coveralls.io/repos/github/GiovanniCardamone/fastify-autoroutes/badge.svg?branch=master)](https://coveralls.io/github/GiovanniCardamone/fastify-autoroutes?branch=master)

</div>

> :star: Thanks to everyone who has starred the project, it means a lot!

Plugin to handle routes in fastify automatically based on directory structure.

## :warning: Version 5.0 - Fastify v5 Support

Version 5.0.0 brings support for **Fastify v5** with several breaking changes and improvements:

- **Node.js 20+** required
- **ESM-only** module (no CommonJS support)
- **Performance improvements** with parallel route loading
- **Updated dependencies** for Fastify v5 ecosystem
- See [MIGRATION.md](./MIGRATION.md) for upgrade guide from v3.x

## :newspaper: **[Full Documentation](https://giovannicardamone.github.io/fastify-autoroutes/)**

[fastify-autoroutes](https://giovannicardamone.github.io/fastify-autoroutes/)

## :rocket: Install

```sh
npm install --save fastify-autoroutes
```

**Requirements:**
- Node.js >= 20.0.0
- Fastify >= 5.0.0
- ESM module system (add `"type": "module"` to package.json)

## :blue_book: Usage

### Register plugin

```js
import Fastify from 'fastify'
import autoroutes from 'fastify-autoroutes'

const server = Fastify()

await server.register(autoroutes, {
  dir: './<autoroutes-directory>', // relative to your cwd
  prefix: '/api', // optional, don't use if you do not need prefixes
})

await server.listen({ port: 3000 })
```

### Create file in autoroutes directory

```js
//file: `<autoroutes-directory>/some/route.js`
//url:  `http://your-host/some/route`

export default (fastifyInstance) => ({
  get: {
    handler: async (request, reply) => 'Hello, Route'
  },
})
```

### Using typescript support for module

```typescript
//file: `<autoroutes-directory>/some/route.ts`
//url:  `http://your-host/some/route`

import { FastifyInstance } from 'fastify'
import { Resource } from 'fastify-autoroutes'

export default (fastify: FastifyInstance) => <Resource> {
  get: {
    handler: async (request: FastifyRequest, reply: FastifyReply) => 'Hello, Route!'
  }
}
```

### Accepts params in autoroutes

> :information_source: file/directory name must follow syntax `:paramName` or `{paramName}`

```js
//file: `<autoroutes-directory>/users/{userId}/photos.js`
//mapped to: `<your host>/users/:userId/photos`

export default (fastifyInstance) => ({
  get: {
    handler: (request, reply) => {
      reply.send(`photos of user ${request.params.userId}`)
    }
  },
})
```

## :arrow_forward: Route module definition

Method specification for attributes is available here: [Method specification](https://www.fastify.io/docs/latest/Routes/#full-declaration)

> :information_source: attributes `url` and `method` are dynamically provided

Allowed attributes mapped to Http methods in module:

- delete
- get
- head
- patch
- post
- put
- options

## :arrow_forward: Skipping files

to skip file in routes directory, prepend the `.` or `_` character to filename

examples:

```text
routes
├── .ignored-directory
├── _ignored-directory
├── .ignored-js-file.js
├── _ignored-js-file.js
├── .ignored-ts-file.ts
├── _ignored-ts-file.ts
├── ignored-js-test.test.js
└── ignored-ts-test.test.ts
```

> :warning: also any `*.test.js` and `*.test.ts` are skipped!

this is useful if you want to have a lib file which contains functions that don't have to be a route, so just create the file with `_` prepending character

## :page_facing_up: License

Licensed under [MIT](./LICENSE)

## :sparkles: Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="http://giovannicardamone.github.io"><img src="https://avatars0.githubusercontent.com/u/5117748?v=4" width="100px;" alt=""/><br /><sub><b>Giovanni Cardamone</b></sub></a><br /><a href="https://github.com/GiovanniCardamone/fastify-autoroutes/commits?author=GiovanniCardamone" title="Code">💻</a> <a href="https://github.com/GiovanniCardamone/fastify-autoroutes/commits?author=GiovanniCardamone" title="Documentation">📖</a> <a href="#example-GiovanniCardamone" title="Examples">💡</a> <a href="#maintenance-GiovanniCardamone" title="Maintenance">🚧</a></td>
    <td align="center"><a href="https://github.com/genbs"><img src="https://avatars0.githubusercontent.com/u/6159598?v=4" width="100px;" alt=""/><br /><sub><b>Gennaro</b></sub></a><br /><a href="#design-genbs" title="Design">🎨</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification.

Contributions of any kind welcome!
