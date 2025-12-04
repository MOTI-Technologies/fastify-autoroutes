import createError from '@fastify/error';
import type { FastifyInstance, RouteOptions } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import fs from 'node:fs';
import glob from 'glob-promise';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

export const ERROR_LABEL = 'fastify-autoroutes';

export type ValidMethods = 'DELETE' | 'GET' | 'HEAD' | 'PATCH' | 'POST' | 'PUT' | 'OPTIONS';

// const validMethods = [
//   'delete',
//   'get',
//   'head',
//   'patch',
//   'post',
//   'put',
//   'options',
// ]

export type AnyRoute = Omit<RouteOptions, 'method' | 'url'>;

export type DeleteRoute = AnyRoute;
export type GetRoute = Omit<AnyRoute, 'body'>;
export type HeadRoute = AnyRoute;
export type PatchRoute = AnyRoute;
export type PostRoute = AnyRoute;
export type PutRoute = AnyRoute;
export type OptionsRoute = AnyRoute;

interface Security {
  [key: string]: string[];
}

interface StrictAnyRoute extends AnyRoute {
  schema: {
    summary?: string;
    description?: string;
    security?: Security[];
    tags?: string[];
    consumes?: string[];
    produces?: string[];
    body?: any;
    querystring?: any;
    params?: any;
    headers?: any;
    response?: { [key: number]: any };
  };
}

export type StrictDeleteRoute = StrictAnyRoute;
export type StrictGetRoute = Omit<StrictAnyRoute, 'body'>;
export type StrictHeadRoute = StrictAnyRoute;
export type StrictPatchRoute = StrictAnyRoute;
export type StrictPostRoute = StrictAnyRoute;
export type StrictPutRoute = StrictAnyRoute;
export type StrictOptionsRoute = StrictAnyRoute;

export interface Resource {
  delete?: DeleteRoute;
  get?: GetRoute;
  head?: HeadRoute;
  patch?: PatchRoute;
  post?: PostRoute;
  put?: PutRoute;
  options?: OptionsRoute;
}

export interface StrictResource {
  delete?: StrictDeleteRoute;
  get?: StrictGetRoute;
  head?: StrictHeadRoute;
  patch?: StrictPatchRoute;
  post?: StrictPostRoute;
  put?: StrictPutRoute;
  options?: StrictOptionsRoute;
}

interface FastifyAutoroutesOptions {
  dir?: string;
  prefix?: string;
}

export default fastifyPlugin<FastifyAutoroutesOptions>(
  async (fastify: FastifyInstance, options: FastifyAutoroutesOptions) => {
    const { dir, prefix: routePrefix } = {
      ...options,
      dir: options.dir || './routes',
      prefix: options.prefix || '',
    };

    let dirPath: string;

    if (path.isAbsolute(dir)) {
      dirPath = dir;
    } else if (path.isAbsolute(process.argv[1])) {
      dirPath = path.join(process.argv[1], dir);
    } else {
      dirPath = path.join(process.cwd(), process.argv[1], dir);
    }

    if (!fs.existsSync(dirPath)) {
      const CustomError = createError('1', `${ERROR_LABEL} dir ${dirPath} must be a directory`);
      throw new CustomError();
    }

    if (!fs.statSync(dirPath).isDirectory()) {
      const CustomError = createError('2', `${ERROR_LABEL} dir ${dirPath} must be a directory`);
      throw new CustomError();
    }

    // glob returns ../../, but windows returns ..\..\
    dirPath = path.normalize(dirPath).replace(/\\/g, '/');

    const routes = await glob(`${dirPath}/**/[!._]!(*.test).{ts,js}`);
    const routesModules: Record<string, StrictResource> = {};

    // Load all routes in parallel for better performance
    await Promise.all(
      routes.map(async (route) => {
        const routeName = computeRouteName(route, dirPath, routePrefix);
        const moduleLoader = await loadModule(routeName, route);
        routesModules[routeName] = moduleLoader(fastify);
      })
    );

    for (const [url, module] of Object.entries(routesModules)) {
      for (const [method, options] of Object.entries(module)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        fastify.route({
          method: method.toUpperCase(),
          url: url,
          ...options,
        });
      }
    }
  },
  {
    fastify: '>=5.0.0',
    name: 'fastify-autoroutes',
  }
);

function computeRouteName(route: string, dirPath: string, routePrefix: string): string {
  let routeName = route
    .replace(dirPath, '')
    .replace('.js', '')
    .replace('.ts', '')
    .replace('index', '')
    .split('/')
    .map((part) => part.replace(/{(.+)}/g, ':$1'))
    .join('/');

  return !routeName ? '/' : `${routePrefix}${routeName}`;
}

interface RequireFunction {
  (id: string): unknown;
  cache: Record<string, unknown>;
}

async function loadModule(name: string, modulePath: string): Promise<(instance: FastifyInstance) => StrictResource> {
  let module: unknown;

  // Try require first (for test fixtures with special characters in paths)
  // In Vitest forks pool, require bypasses Vite's URL encoding
  try {
    const requireFn = eval('typeof require !== "undefined" ? require : null') as RequireFunction | null;
    if (requireFn) {
      delete requireFn.cache[modulePath];
      module = requireFn(modulePath);
    } else {
      throw new Error('require not available');
    }
  } catch {
    // Fall back to dynamic import (for production ESM)
    try {
      const fileUrl = pathToFileURL(modulePath).href;
      module = await import(fileUrl);
    } catch (error) {
      throw new Error(
        `${ERROR_LABEL}: failed to load module (${name}) ${modulePath}. ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  if (typeof module === 'function') {
    return module as (instance: FastifyInstance) => StrictResource;
  }

  if (typeof module === 'object' && module !== null && 'default' in module && typeof module.default === 'function') {
    return module.default as (instance: FastifyInstance) => StrictResource;
  }

  throw new Error(`${ERROR_LABEL}: invalid route module definition (${name}) ${modulePath}. Must export a function`);
}
