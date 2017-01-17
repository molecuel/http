'use strict';
import 'reflect-metadata';
import {di, injectable, singleton} from '@molecuel/di';
import * as Koa from 'koa';
import * as koarouter from 'koa-router';
import {init} from '@molecuel/core';
import {Observable} from '@reactivex/rxjs';


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
    this.get('/mlclhttp/health', async ctx => ctx.status = 200);
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

  @init(70)
  initRoutes() {
    return Observable.create(y => {
      let coreRouter = di.getInstance('MlclHttpCoreRouter');
      let core = di.getInstance('MlclCore');
      let dataFactories = core.getDataFactories();
      for(let factory of dataFactories) {
        let factoryClassInstance = di.getInstance(factory.targetName);
        if(factory.operation === 'read') {
          coreRouter.get('/testread', async (ctx) => {
            // execute function from dataFactory
            let returnValue = await factoryClassInstance[factory.targetProperty]();
            ctx.body = returnValue;
          });
        }
      }
      y.next(y);
      y.complete();
    });
  }

  @init(80)
  initRouter() {
    return Observable.create(y => {
      let app = di.getInstance('MlclHttpMiddleware');
      let coreRouter = di.getInstance('MlclHttpCoreRouter');
      app.use(coreRouter.routes());
      app.use(coreRouter.allowedMethods());
      y.next(y);
      y.complete();
    });
  }

  @init(90)
  initListen() {
    return Observable.create(y => {
      let app = di.getInstance('MlclHttpMiddleware');
      app.listen(3000);
      y.next(y);
      y.complete();
    });
  }
}
