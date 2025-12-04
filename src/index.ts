/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
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

    // console.log({ routes })

    for (const route of routes) {
      let routeName = route
        .replace(dirPath, '')
        .replace('.js', '')
        .replace('.ts', '')
        .replace('index', '')
        .split('/')
        .map((part) => part.replace(/{(.+)}/g, ':$1'))
        .join('/');

      routeName = !routeName ? '/' : `${routePrefix}${routeName}`;

      // console.log({ routeName })

      routesModules[routeName] = (await loadModule(routeName, route))(fastify);
    }

    for (const [url, module] of Object.entries(routesModules)) {
      if (!module || typeof module !== 'object') {
        throw new Error(`${ERROR_LABEL}: route module for ${url} did not return a valid route object`);
      }

      for (const [method, options] of Object.entries(module)) {
        if (typeof options !== 'object' || !options.handler) {
          console.warn(`${ERROR_LABEL}: skipping invalid route definition for ${method.toUpperCase()} ${url}`, options);
          continue;
        }

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

async function loadModule(name: string, modulePath: string): Promise<(instance: FastifyInstance) => StrictResource> {
  let module: any;

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

  // Check for ES6 default export first
  if (typeof module === 'object' && module !== null && 'default' in module) {
    if (typeof module.default === 'function') {
      return module.default as (instance: any) => StrictResource;
    }
    // If default export is an object, check if it has a nested default (double wrapping from transpilation)
    if (typeof module.default === 'object' && module.default !== null) {
      // Handle nested default export (common with TypeScript/Babel transpilation)
      if ('default' in module.default && typeof module.default.default === 'function') {
        return module.default.default as (instance: any) => StrictResource;
      }
      // If it's a route object directly, return a function that returns it
      return ((_instance: any) => module.default) as (instance: any) => StrictResource;
    }
  }

  // Check for CommonJS/direct function export
  if (typeof module === 'function') {
    return module as (instance: any) => StrictResource;
  }

  // Provide detailed error about what was found
  const moduleType = typeof module;
  const hasDefault = module && 'default' in module;
  const defaultType = hasDefault ? typeof module.default : 'N/A';
  const keys = module && typeof module === 'object' ? Object.keys(module).join(', ') : 'N/A';

  throw new Error(
    `${ERROR_LABEL}: invalid route module definition (${name}) ${modulePath}. ` +
      `Must export a function. Found: moduleType=${moduleType}, hasDefault=${hasDefault}, ` +
      `defaultType=${defaultType}, keys=[${keys}]`
  );
}
