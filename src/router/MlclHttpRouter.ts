import {injectable} from "@molecuel/di";
import * as koarouter from "koa-router";
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
