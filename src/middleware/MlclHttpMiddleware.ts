import {singleton} from "@molecuel/di";
import * as Koa from "koa";
/**
 * @description This is the http middleware it"s based on Koa v2
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
