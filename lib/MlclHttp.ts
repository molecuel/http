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

  public registerRoutes(
    routes: string[],
    target: string | ((...params) => any),
    type: string | string[],
    routingFunc?: ((target: ((...params) => any), params: any[], next?) => any),
    returnType?: string,
  ) {
    const core = di.getInstance("MlclCore");
    const coreRouter = di.getInstance("MlclHttpCoreRouter");
    let className;
    let propertyName;
    let method;
    let types: string[];
    if (typeof target === "string") {
      const parts = target.split(".");
      const root = parts[0] = di.getInstance(parts[0]);
      className = parts.slice(-2, 1)[0].constructor.name;
      propertyName = parts.slice(-1)[0];
      method = parts.reduce((parent, prop) => parent[prop]);
    } else if (typeof target === "function") {
      method = target;
    } else {
      throw new Error("No valid target.");
    }
    if (Array.isArray(type)) {
      types = type;
    } else {
      types = [type];
    }
    // const factory = core.getDataFactories().find((item) => (
    //   item.targetName === className
    //   && item.targetProperty === propertyName
    // ));
    // coreRouter.stack.sort((previousItem, currentItem) => {
    //   return previousItem.path ? previousItem.path.length : 0 - currentItem.path ? currentItem.path.length : 0;
    // });
    routes.forEach((route) => {
      types.forEach((subType) => {
        coreRouter[this.typeSwitch(subType).httpType](route, async (ctx, next) => {
          try {
            const path: string = route;
            const mergedProps = Object.assign({}, ctx.query, ctx.params);
            mergedProps.request = ctx.request;
            mergedProps.body = ctx.request.body;
            const parsedProps = core.getDataParams(className, propertyName)
              ? core.renderDataParams(mergedProps, className, propertyName)
              : Object.values(mergedProps);
            if (routingFunc) {
              ctx.body = await routingFunc(method, parsedProps, next) || ctx.body;
            } else {
              ctx.body = await method(...parsedProps) || ctx.body;
            }
            ctx.status = this.typeSwitch(subType).httpCode;
            if (this.typeSwitch(subType).httpType === "get" && returnType) {
              ctx.type = returnType;
            }
          } catch (error) {
            ctx.status = 500;
            ctx.body = error;
          }
          if (!routingFunc) {
            await next();
          }
        });
      });
    });
  }

  private typeSwitch(type: string): { httpType: string, httpCode: number } {
    switch (type) {
      case "get":
      case "read":
        return { httpType: "get", httpCode: 200 };
      case "update":
      case "post":
        return { httpType: "post", httpCode: 200 };
      case "create":
        return { httpType: "post", httpCode: 201 };
      case "replace":
      case "put":
        return { httpType: "put", httpCode: 200 };
      case "delete":
        return { httpType: "delete", httpCode: 204 };
      default:
        throw new Error("No valid type.");
    }
  }

  @init(50)
  private initAppBodyParser() {
    return Observable.create((y) => {
      const app = di.getInstance("MlclHttpMiddleware");
      app.use(async (ctx, next) => {
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
      });
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
            coreRouter.post(route.url, async (ctx, next) => {
              const path: string = route.url;
              const mergedProps = Object.assign({}, ctx.query, ctx.params);
              mergedProps.request = ctx.request;
              mergedProps.body = ctx.request.body;
              const resultProps = core.renderDataParams(mergedProps, factory.targetName, factory.targetProperty);
              // execute function from dataFactory
              try {
                const returnValue = await factoryClassInstance[factory.targetProperty](...resultProps);
                ctx.status = 201;
                ctx.body = returnValue || ctx.body;
                // @todo add location?
              } catch (error) {
                ctx.status = 500;
                ctx.body = error.message;
              }
              if (path && path.indexOf("*") >= 0) {
                await next();
              }
            });
          } else if (factory.operation === "update") {
            coreRouter.post(route.url, async (ctx, next) => {
              const path: string = route.url;
              const mergedProps = Object.assign({}, ctx.query, ctx.params);
              mergedProps.request = ctx.request;
              mergedProps.body = ctx.request.body;
              const resultProps = core.renderDataParams(mergedProps, factory.targetName, factory.targetProperty);
              // execute function from dataFactory
              try {
                const returnValue = await factoryClassInstance[factory.targetProperty](...resultProps);
                ctx.status = 200;
                ctx.body = returnValue || ctx.body;
                // @todo add location?
              } catch (error) {
                ctx.status = 500;
                ctx.body = error.message;
              }
              if (path && path.indexOf("*") >= 0) {
                await next();
              }
            });
          } else if (factory.operation === "replace") {
            coreRouter.put(route.url, async (ctx, next) => {
              const path: string = route.url;
              const mergedProps = Object.assign({}, ctx.query, ctx.params);
              mergedProps.request = ctx.request;
              mergedProps.body = ctx.request.body;
              const resultProps = core.renderDataParams(mergedProps, factory.targetName, factory.targetProperty);
              // execute function from dataFactory
              try {
                const returnValue = await factoryClassInstance[factory.targetProperty](...resultProps);
                ctx.status = 200;
                ctx.body = returnValue || ctx.body;
                // @todo add location?
              } catch (error) {
                ctx.status = 500;
                ctx.body = error.message;
              }
              if (path && path.indexOf("*") >= 0) {
                await next();
              }
            });
          } else if (factory.operation === "read") {
            coreRouter.get(route.url, async (ctx, next) => {
              const path: string = route.url;
              const mergedProps = Object.assign({}, ctx.query, ctx.params);
              mergedProps.request = ctx.request;
              const resultProps = core.renderDataParams(mergedProps, factory.targetName, factory.targetProperty);
              // execute function from dataFactory
              try {
                const returnValue = await factoryClassInstance[factory.targetProperty](...resultProps);
                ctx.status = 200;
                ctx.body = returnValue || ctx.body;
                if (factory.resultType) {
                  ctx.type = factory.resultType;
                }
              } catch (error) {
                ctx.status = 500;
                ctx.body = error.message;
              }
              if (path && path.indexOf("*") >= 0) {
                await next();
              }
            });
          } else if (factory.operation === "delete") {
            coreRouter.delete(route.url, async (ctx, next) => {
              const path: string = route.url;
              const mergedProps = Object.assign({}, ctx.query, ctx.params);
              mergedProps.request = ctx.request;
              mergedProps.body = ctx.request.body;
              const resultProps = core.renderDataParams(mergedProps, factory.targetName, factory.targetProperty);
              // execute function from dataFactory
              try {
                const returnValue = await factoryClassInstance[factory.targetProperty](...resultProps);
                ctx.status = 204;
                ctx.body = returnValue || ctx.body;
              } catch (error) {
                ctx.status = 500;
                ctx.body = error.message;
              }
              if (path && path.indexOf("*") >= 0) {
                await next();
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
