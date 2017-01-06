'use strict';
import 'reflect-metadata';
import assert = require('assert');
import should =  require('should');
import supertest = require('supertest');
import {di} from '@molecuel/di';
import {MlclCore} from '@molecuel/core';
import {MlclHttpMiddleware, MlclHttp, MlclHttpCoreRouter, MlclHttpRouter} from '../dist';

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
  it('should exec init function', async function() {
    let core: MlclCore = di.getInstance('MlclCore');
    await core.init();
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

describe('MlclHttpCoreRouter', function() {
  it('should return a MlclHttpCoreRouter instance', function() {
    let coreRouter = di.getInstance('MlclHttpCoreRouter');
    assert(coreRouter !== undefined);
    assert(coreRouter instanceof MlclHttpCoreRouter);
  });
  it('should be a singleton instance', function() {
    assert(di.getInstance('MlclHttpCoreRouter') === di.getInstance('MlclHttpCoreRouter'));
  });
});

describe('MlclHttpRouter', function() {
  it('should return a MlclHttpRouter instance', function() {
    let router = di.getInstance('MlclHttpRouter');
    assert(router !== undefined);
    assert(router instanceof MlclHttpRouter);
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
  it('should get a reply from the application', function(done) {
    let app = di.getInstance('MlclHttpMiddleware');
    supertest(app.listen())
    .get('/mlclhttp/health')
    .end(function(err: any, res: supertest.Response){
      assert(err === null);
      assert(res.status === 200);
      done();
    });
  });
});
