'use strict';
import 'reflect-metadata';
import {di, injectable, singleton} from '@molecuel/di';
import * as Koa from 'koa';
import * as koarouter from 'koa-router';


/**
 * @description This is the http middleware it's based on Koa v2
 *
 * @export
 * @class MlclHttpMiddleware
 * @extends {Koa}
 */
@singleton
export class MlclHttpMiddleware extends Koa {
  constructor() {
    super();
  }
}

/**
 * @description This is the core router. It can only exists once.
 *
 * @export
 * @class MlclHttpCoreRouter
 * @extends {koarouter}
 */
@singleton
export class MlclHttpCoreRouter extends koarouter {
  constructor() {
    super();
  }
}

/**
 * @description This is used to dynamically create routers and attach them to the core router if needed
 *
 * @export
 * @class MlclHttpRouter
 * @extends {koarouter}
 */
@injectable
export class MlclHttpRouter extends koarouter {
  constructor() {
    super();
  }
}


/**
 * @description The main molecuel HTTP module
 *
 * @export
 * @class MlclHttp
 */
@injectable
export class MlclHttp {
  private app: MlclHttpMiddleware;
  constructor(app: MlclHttpMiddleware) {
    this.app = app;
  }
}
