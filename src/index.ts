'use strict';
import 'reflect-metadata';
import {di, singleton} from '@molecuel/di';
import * as Koa from 'koa';

@singleton
export class MlclKoa extends Koa {}
