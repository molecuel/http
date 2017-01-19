'use strict';
process.env.configpath = './test/config/';
import 'reflect-metadata';
import assert = require('assert');
import should =  require('should');
import supertest = require('supertest');
import {di, injectable} from '@molecuel/di';
import {MlclCore, dataRead, mapDataParams, MlclDataParam} from '@molecuel/core';
import {MlclHttpMiddleware, MlclHttp, MlclHttpCoreRouter, MlclHttpRouter} from '../dist';

should();


describe('MlclCoreBootStrap', function() {
  before(function() {
    @injectable
    class myCreateTestRoutes {
      @mapDataParams([
          new MlclDataParam('id', 'id', 'integer', 25),
          new MlclDataParam('large', 'size', 'boolean')
      ])
      @dataRead()
      async dataReadeTest1(id, size) {
        return {
          id: id,
          size: size
        };
      }
      @dataRead()
      async dataReadeTest2() {
        return {};
      }
    }
  });
  it('should bootstrap', function() {
    di.bootstrap(MlclCore, MlclHttpMiddleware, MlclHttp);
  });
});

describe('MlclCoreInit', function() {
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
  it('should get a reply from the test read', function(done) {
    let app = di.getInstance('MlclHttpMiddleware');
    supertest(app.listen())
    .get('/testread')
    .end(function(err: any, res: supertest.Response){
      assert(err === null);
      assert(res.status === 200);
      done();
    });
  });
  it('should get a reply from the test read with parameters and query options', function(done) {
    let app = di.getInstance('MlclHttpMiddleware');
    supertest(app.listen())
    .get('/testread/111?large=true')
    .end(function(err: any, res: supertest.Response){
      assert(err === null);
      assert(res.status === 200);
      assert(res.body.id === 111);
      assert(res.body.size === true);
      done();
    });
  });
});
