import {singleton} from "@molecuel/di";
import * as koarouter from "koa-router";
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
