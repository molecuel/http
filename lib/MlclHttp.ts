"use strict";
import { init, MlclConfig, MlclCore, MlclDataFactory } from "@molecuel/core";
import { di, injectable, singleton } from "@molecuel/di";
import { Observable } from "@reactivex/rxjs";
import * as Koa from "koa";
import * as koarouter from "koa-router";
import * as _ from "lodash";
import "reflect-metadata";
import { MlclHttpMiddleware } from "./middleware/MlclHttpMiddleware";
import { MlclHttpCoreRouter } from "./router/MlclHttpCoreRouter";
import { MlclHttpRouter } from "./router/MlclHttpRouter";

import * as inflate from "inflation";
import * as raw from "raw-body";

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

  @init(50)
  private initAppBodyParser() {
    return Observable.create((y) => {
      const app = di.getInstance("MlclHttpMiddleware");
      app.use(async(ctx, next) => {
        try {
          const buffer = await raw(inflate(ctx.req));
          if (buffer) {
            const stringified = buffer.toString();
            ctx.request.body = stringified ? JSON.parse(stringified) : {};
          }
        } catch (error) {
          if (onerror) {
            onerror(error, ctx);
          } else {
            throw error;
          }
        }
        await next();
      })
      y.next(y);
      y.complete();
    });
  }

  @init(70)
  private initRoutes() {
    return Observable.create((y) => {
      const coreRouter = di.getInstance("MlclHttpCoreRouter");
      coreRouter.get("/mlclhttp/health", async (ctx) => ctx.status = 200);
      const core: MlclCore = di.getInstance("MlclCore");
      const dataFactories = core.getDataFactories();
      const sortedDataFactories = {};
      for (const factory of dataFactories) {
        if (!sortedDataFactories[factory.targetName]) {
          sortedDataFactories[factory.targetName] = {};
        }
        sortedDataFactories[factory.targetName][factory.targetProperty] = factory;
      }
      const config: MlclConfig = di.getInstance("MlclConfig");
      const configuredRoutes = config.getConfig("http.routes");
      for (const route of configuredRoutes) {
        const fackey = route.class + "." + route.property;
        const factory: any = _.get(sortedDataFactories, route.class + "." + route.property);
        if (factory) {
          const factoryClassInstance = di.getInstance(factory.targetName);

          if (factory.operation === "create") {
            coreRouter.post(route.url, async (ctx) => {
              const mergedProps = Object.assign({}, ctx.query, ctx.params, ctx.request);
              const resultProps = core.renderDataParams(mergedProps, factory.targetName, factory.targetProperty);
              // execute function from dataFactory
              try {
                const returnValue = await factoryClassInstance[factory.targetProperty](...resultProps);
                ctx.status = 201;
                // @todo add location?
              } catch (error) {
                ctx.status = 500;
              }
            });
          } else if (factory.operation === "update") {
            coreRouter.post(route.url, async (ctx) => {
              const mergedProps = Object.assign({}, ctx.query, ctx.params, ctx.request);
              const resultProps = core.renderDataParams(mergedProps, factory.targetName, factory.targetProperty);
              // execute function from dataFactory
              try {
                const returnValue = await factoryClassInstance[factory.targetProperty](...resultProps);
                ctx.status = 200;
                // @todo add location?
              } catch (error) {
                ctx.status = 500;
              }
            });
          } else if (factory.operation === "replace") {
            coreRouter.put(route.url, async (ctx) => {
              const mergedProps = Object.assign({}, ctx.query, ctx.params, ctx.request);
              const resultProps = core.renderDataParams(mergedProps, factory.targetName, factory.targetProperty);
              // execute function from dataFactory
              try {
                const returnValue = await factoryClassInstance[factory.targetProperty](...resultProps);
                ctx.status = 200;
                // @todo add location?
              } catch (error) {
                ctx.status = 500;
              }
            });
          } else if (factory.operation === "read") {
            coreRouter.get(route.url, async (ctx) => {
              const mergedProps = Object.assign({}, ctx.query, ctx.params);
              const resultProps = core.renderDataParams(mergedProps, factory.targetName, factory.targetProperty);
              // execute function from dataFactory
              const returnValue = await factoryClassInstance[factory.targetProperty](...resultProps);
              ctx.body = returnValue;
              if (factory.resultType) {
                ctx.type = factory.resultType;
              }
            });
          } else if (factory.operation === "delete") {
            coreRouter.delete(route.url, async (ctx) => {
              const mergedProps = Object.assign({}, ctx.query, ctx.params);
              const resultProps = core.renderDataParams(mergedProps, factory.targetName, factory.targetProperty);
              // execute function from dataFactory
              try {
                const returnValue = await factoryClassInstance[factory.targetProperty](...resultProps);
                ctx.status = 204;
              } catch (error) {
                ctx.status = 500;
              }
            });
          }
        }
      }
      y.next(y);
      y.complete();
    });
  }

  @init(80)
  private initRouter() {
    return Observable.create((y) => {
      const app = di.getInstance("MlclHttpMiddleware");
      const coreRouter = di.getInstance("MlclHttpCoreRouter");
      app.use(coreRouter.routes());
      app.use(coreRouter.allowedMethods());
      y.next(y);
      y.complete();
    });
  }

  @init(90)
  private initListen() {
    return Observable.create((y) => {
      const app = di.getInstance("MlclHttpMiddleware");
      app.listen(3000);
      y.next(y);
      y.complete();
    });
  }
}
