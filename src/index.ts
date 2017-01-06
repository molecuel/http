'use strict';
import 'reflect-metadata';
import {di, injectable, singleton} from '@molecuel/di';
import * as Koa from 'koa';

@singleton
export class MlclHttpMiddleware extends Koa {
  constructor() {
    super();
  }
}


@injectable
export class MlclHttp {
  private app: MlclHttpMiddleware;
  constructor(app: MlclHttpMiddleware) {
    this.app = app;
  }
}
