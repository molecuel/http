'use strict';
import 'reflect-metadata';
import assert = require('assert');
import should =  require('should');
import {di} from '@molecuel/di';
import {MlclCore} from '@molecuel/core';
import {MlclHttpMiddleware, MlclHttp} from '../dist';
should();

describe('MlclCoreInit', function() {
  it('should bootstrap', function() {
    di.bootstrap(MlclCore, MlclHttpMiddleware, MlclHttp);
  });
  it('should init molecuel core', function() {
    let core: MlclCore = di.getInstance('MlclCore');
    assert(core !== undefined);
    assert(core instanceof MlclCore);
  });
});

describe('MlclHttpMiddleware', function() {
  it('should return a MlclHttpMiddleware instance', function() {
    let middleware = di.getInstance('MlclHttpMiddleware');
    assert(middleware !== undefined);
    assert(middleware instanceof MlclHttpMiddleware);
  });
  it('should be a singleton instance', function() {
    assert(di.getInstance('MlclHttpMiddleware') === di.getInstance('MlclHttpMiddleware'));
  });
});

describe('MlclHttp', function() {
  it('should return a MlclHttp instance', function() {
    let mhttp = di.getInstance('MlclHttp');
    assert(mhttp !== undefined);
    assert(mhttp instanceof MlclHttp);
  });
  it('MlclHttp should automatically attach the middleware', function() {
    let mhttp = di.getInstance('MlclHttp');
    assert(mhttp !== undefined);
    assert(mhttp instanceof MlclHttp);
    assert(mhttp.app instanceof MlclHttpMiddleware);
  });
  it('MlclHttp attached middleware should be singleton', function() {
    let mhttp = di.getInstance('MlclHttp');
    assert(mhttp.app === di.getInstance('MlclHttpMiddleware'));
  });
});
